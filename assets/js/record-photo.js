import Cropper from 'cropperjs';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    dispatchEvent,
    createDom,
    hasClass,
    addClass,
    removeClass,
    showHideDom
} from './util';

const LANG = getLangConfig();
const modal = new Modal();
const RECORD_LANG = LANG.LIVE_RECORD;

export default class RecordPhoto extends EventEmitter {
    constructor(options) {
        super();

        this.fileURL = '',
        this.front = true;
        this.constraints = {
            audio: false,
            video: {
                width: { min: 776, ideal: 720, max: 1080},
                height: { min: 1024, ideal: 1280, max: 1920},
                facingMode: "user"
            }
        };
        this.options = {
            clippingRound: false,
            clippingWrapperClass: 'clipping-wrapper',
            clippingRoundClass: 'cropper-crop-round',
            inClippingClass: 'clipping-in',
            outClippingClass: 'clipping-out',
            clippingHeaderClass: 'clipping-header',
            clippingContentClass: 'clipping-content',
            clippingFooterClass: 'clipping-footer',
            clippingImageClass: 'clipping-image',
            btnClippingConfirmClass: 'btn-confirm',
            btnClippingCloseClass: 'btn-close',

            inRecordClass: 'record-in',
            outRecordClass: 'record-out',
            livesPhotoClass: 'lives-photo',
            recordBtnClass: 'btn-photo',
            buttonsClass: 'photo-buttons',
            videoClass: 'video',
            closeClass: 'live-close',
            cutoverClass: 'live-cutover',
            cancelClass: 'live-cancel',
            confirmClass: 'live-confirm',
            localUploadClass: 'live-local-upload',
            startClass: 'record-start',
            showClass: 'active'
        };

        extend(this.options, options);

        this._init();
    }

    _init() {
        modal.options({
            buttons: [{
                text: RECORD_LANG.Photo.Madal.Take,
                value: 1,
                onClick: (text, value) => {
                    this._initRecord();
                }
            }, {
                text: RECORD_LANG.Photo.Madal.Select,
                value: 2,
                onClick: (text, value) => {
                    this._initInput();
                }
            }]
        });
    }

    _initRecord() {
        this.recordPhotoEl = createDom(this._recordTemplate(this.options));

        document.body.appendChild(this.recordPhotoEl);

        this.videoEl = this.recordPhotoEl.getElementsByClassName(this.options.videoClass)[0];
        this.recordEl = this.recordPhotoEl.getElementsByClassName(this.options.recordBtnClass)[0];
        this.buttonsEl = this.recordPhotoEl.getElementsByClassName(this.options.buttonsClass)[0];
        this.closeEl = this.recordPhotoEl.getElementsByClassName(this.options.closeClass)[0];
        this.cutoverEl = this.recordPhotoEl.getElementsByClassName(this.options.cutoverClass)[0];
        this.cancelEl = this.recordPhotoEl.getElementsByClassName(this.options.cancelClass)[0];
        this.confirmEl = this.recordPhotoEl.getElementsByClassName(this.options.confirmClass)[0];

        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
            this._mediaRecorder();
        } else {
            console.log("你的浏览器不支持访问用户媒体设备");
        }

        showHideDom(this.cancelEl, 'none');
        showHideDom(this.confirmEl, 'none');

        this._recordShow();
        this._bindRecordEvent();
    }

    _initInput() {
        let inputEl = document.createElement('input');
        let userAgent = navigator.userAgent.toLowerCase();
        //判断是否是苹果手机，是则是true
        if ((userAgent.indexOf('iphone') != -1) || (userAgent.indexOf('ipad') != -1)) {
            inputEl.setAttribute("capture", "camera");
        };

        inputEl.setAttribute("type", "file");
        inputEl.setAttribute("accept", "image/*");
        inputEl.click();

        addEvent(inputEl, 'change', () => {
            let file = inputEl.files[0];
            let reader = new FileReader();

            reader.onload = () => {
                this.fileURL = reader.result;
                this._initClipping();
            };

            reader.readAsDataURL(file);
        });
    }

    _initClipping() {
        this.clippingEl = createDom(this._clippingTemplate(this.options));

        document.body.appendChild(this.clippingEl);

        this.imageCropperEl = this.clippingEl.getElementsByClassName(this.options.clippingImageClass)[0];
        this.btnClippingConfirmEl = this.clippingEl.getElementsByClassName(this.options.btnClippingConfirmClass)[0];
        this.btnClippingCloseEl = this.clippingEl.getElementsByClassName(this.options.btnClippingCloseClass)[0];

        this._clippingShow();
        this._bindClippingEvent();
    }

    _bindClippingEvent() {
        let cropper = new Cropper(this.imageCropperEl, {
            dragMode: 'move',
            initialAspectRatio: 1 / 1,
            aspectRatio: 1 / 1,
            guides: false,
            center: false,
            highlight: false,
            background: false,
            autoCropArea: 0.6,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
        });

        addEvent(this.btnClippingCloseEl, 'click', () => {
            this._clippingHide();
        });

        // 关闭录制器
        addEvent(this.btnClippingConfirmEl, 'click', () => {
            let canvasIMG = cropper.getCroppedCanvas({
                width: 160,
                height: 90,
                minWidth: 256,
                minHeight: 256,
                maxWidth: 4096,
                maxHeight: 4096,
                imageSmoothingEnabled: false,
                imageSmoothingQuality: 'high',
            });
            let imgURL = canvasIMG.toDataURL("image/jpeg");
            let imgData = imgURL.split(",")[1];
            let blobBin = window.atob(imgData);
            let array = [];
            for(let i = 0; i < blobBin.length; i++) {
                array.push(blobBin.charCodeAt(i));
            }
            let photosBuffers = new Blob([new Uint8Array(array)], {
                type: 'image/jpeg'
            });
            let photosFile = new File([photosBuffers], Date.now() + '.jpg', {
                type: "image/jpeg",
            });

            this._clippingHide();
            this.trigger('recordPhoto.clipping', photosFile, imgURL);
        });
    }

    _bindRecordEvent() {

        // 拍照
        addEvent(this.recordEl, 'click', () => {
            showHideDom(this.recordEl, 'none');
            showHideDom(this.cancelEl, 'block');
            showHideDom(this.confirmEl, 'block');
            addClass(this.buttonsEl, this.options.showClass);

            let canvas = document.createElement("canvas");
            let canvasFill = canvas.getContext('2d');
            canvas.width = this.videoEl.videoWidth;
            canvas.height = this.videoEl.videoHeight;
            canvasFill.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

            this.fileURL = canvas.toDataURL("image/jpeg");

            this.livesPhotoEl = createDom('<div class="'+ this.options.livesPhotoClass +'"  style="background-image: url('+ this.fileURL +');"></div>');
            this.recordPhotoEl.appendChild(this.livesPhotoEl);
        });

        // 关闭录制器
        addEvent(this.closeEl, 'click', () => {
            modal.confirm(RECORD_LANG.Madal.ExitRecord.Text, () => {
                this._recordHide();
                this._stopStreamedVideo();
            }, () => {}, true);
        });

        // 删除保存的相片
        addEvent(this.cancelEl, 'click', () => {
            modal.confirm(RECORD_LANG.Madal.DeleteVideo.Text, () => {
                this.fileURL = [];
                showHideDom(this.cancelEl, 'none');
                showHideDom(this.confirmEl, 'none');
                showHideDom(this.recordEl, 'block');
                removeClass(this.buttonsEl, this.options.showClass);
            }, () => {}, true);
        });

        // 确认保存的相片
        addEvent(this.confirmEl, 'click', () => {
            this._recordHide();
            this._stopStreamedVideo();
            this._initClipping();
        });

        // 切换摄像头
        addEvent(this.cutoverEl, 'click', () => {
            this.front = !this.front;
            extend(this.constraints, {
                video: {
                    facingMode: this.front ? 'user' : 'environment'
                }
            });
            this._stopStreamedVideo();
            this._mediaRecorder();
        });
    }

    _recordTemplate(options) {
        let html = '';

        html = '<div class="content record-wrapper">';
        html += '<div class="lives-video"><video id="video" class="'+ options.videoClass +'"></video></div>';
        html += '<div class="lives-header"><div class="icon '+ options.closeClass +'"></div><div class="icon '+ options.cutoverClass +'"></div></div>';
        html += '<div class="lives-buttons photo-buttons"><div class="icon '+ options.cancelClass +'"></div><div class="'+ options.recordBtnClass +'"></div><div class="icon '+ options.confirmClass +'"></div></div>';
        html += '</div>';

        return html;
    }

    _clippingTemplate(options) {
        let html = '';

        html = '<div class="'+ options.clippingWrapperClass +'">';
        html += '<header class="bar bar-flex '+ options.clippingHeaderClass +'"><div class="icon-btn '+ options.btnClippingCloseClass +'" data-ripple><i class="icon icon-arrow-back"></i></div><h1 class="title">'+ RECORD_LANG.Photo.Title +'</h1></header>';
        html += '<div class="content block '+ options.clippingContentClass + ' ' + (options.clippingRound ? options.clippingRoundClass : '') +'"><img class="'+ options.clippingImageClass +'" src="'+ this.fileURL +'"></div>';
        html += '<div class="'+ options.clippingFooterClass +'"><div class="button button-primary '+ options.btnClippingConfirmClass +'" data-ripple>'+ RECORD_LANG.Photo.Buttons +'</div></div>';
        html += '</div>';

        return html;
    }

    static attachTo(options) {
        return new RecordPhoto(options);
    }

    // 获取媒体设备的媒体流
    _mediaRecorder(){
        this._getUserMedia(this.constraints, (stream) => {
            this.videoEl.srcObject  = stream;
            this.videoEl.autoplay = true;

        }, (error) => {
            console.log(error);
        });
    }

    // 访问用户媒体设备的兼容方法
    _getUserMedia(constrains,success,error){
        if(navigator.mediaDevices.getUserMedia){
            //最新标准API
            navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
        } else if (navigator.webkitGetUserMedia){
            //webkit内核浏览器
            navigator.webkitGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.mozGetUserMedia){
            //Firefox浏览器
            navagator.mozGetUserMedia(constrains).then(success).catch(error);
        } else if (navigator.getUserMedia){
            //旧版API
            navigator.getUserMedia(constrains).then(success).catch(error);
        }
    }

    // 关闭向Video DOM 推流
    _stopStreamedVideo() {
        let stream = this.videoEl.srcObject;

        if (typeof stream !== 'undefined') {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
            this.videoEl.srcObject = null;
        }
    }

    /**
     * recordPhoto.record.show()
     * 显示录制器，一般来说，录制器内部已经实现了显示逻辑，不必主动调用。
     * @return {[type]}        [description]
     */
    _recordShow() {
        window.setTimeout(() => {
            this.trigger('recordPhoto.record.open');
            addClass(this.recordPhotoEl, this.options.inRecordClass);
        }, 0);
    }

    /**
     * recordPhoto.record.hide()
     * 隐藏录制器，一般来说，录制器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    _recordHide() {
        removeClass(this.recordPhotoEl, this.options.inRecordClass);
        addClass(this.recordPhotoEl, this.options.outRecordClass);
        window.setTimeout(() => {
            this.trigger('recordPhoto.record.close');
            document.body.removeChild(this.recordPhotoEl);
        }, 500);
    }

    /**
     * recordPhoto.clipping.show()
     * 显示剪裁器，一般来说，剪裁器内部已经实现了显示逻辑，不必主动调用。
     * @return {[type]}        [description]
     */
    _clippingShow() {
        window.setTimeout(() => {
            this.trigger('recordPhoto.clipping.open');
            addClass(this.clippingEl, this.options.inClippingClass);
        }, 0);
    }

    /**
     * recordPhoto.clipping.hide()
     * 隐藏剪裁器，一般来说，剪裁器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    _clippingHide() {
        removeClass(this.clippingEl, this.options.inClippingClass);
        addClass(this.clippingEl, this.options.outClippingClass);
        window.setTimeout(() => {
            this.trigger('recordPhoto.clipping.close');
            document.body.removeChild(this.clippingEl);
        }, 500);
    }
}

/**
 * recordPhoto.clipping
 * 当图片裁剪成功的时候，会派发 recordPhoto.clipping 事件，同时会图片文件 File 和图片地址 URL
 */