import EventEmitter from './eventEmitter';
import Modal from './modal';
import Progress from './progress';
import {
    uploadVideo,
    videoType
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    getData,
    addEvent,
    replaceNote,
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
/**
config: {
    audio: true,
    video: {
        width: { min: 776, ideal: 720, max: 1080 },
        height: { min: 1024, ideal: 1280, max: 1920 },
        facingMode: "user",
        frameRate: { min: 15, ideal: 30, max: 60 },
      }
},
**/

export default class RecordVideo extends EventEmitter {
    constructor(options) {
        super();

        this.front = true;
        this.constraints = {
            audio: true,
            video: {
                width: { min: 776, ideal: 720, max: 1080},
                height: { min: 1024, ideal: 1280, max: 1920},
                frameRate: { min: 15, ideal: 30, max: 60 },
                facingMode: "user"
            }
        };
        this.options = {
            minTimes: 60,
            maxTimes: 600,
            newDayVideo: false,
            notUpload: false,
            editVideoInfo: false,
            inRecordClass: 'record-in',
            outRecordClass: 'record-out',
            recordBtnClass: 'btn-record',
            buttonsClass: 'record-buttons',
            videoClass: 'video',
            closeClass: 'live-close',
            cutoverClass: 'live-cutover',
            cancelClass: 'live-cancel',
            confirmClass: 'live-confirm',
            localUploadClass: 'live-local-upload',
            livesRemarkClass:'lives-remark',
            startClass: 'record-start',
            inUploadClass: 'upload-in',
            outUploadClass: 'upload-out',
            uploadClass: 'upload-progress',

            videoInfoWrapperClass: 'clipping-wrapper',
            inVideoInfoClass: 'clipping-in',
            outVideoInfoClass: 'clipping-out',
            videoInfoContentClass: 'videoInfo-content',
            editVideoClass: 'edit-video',
            editTextareaClass: 'edit-textarea',
            tagsBoxClass: 'tags-box',
            tagsBoxItemClass: 'tags-item',
            btnEditCloseClass: 'btn-close',
            btnEditConfirmClass: 'btn-confirm',
            btnEditSaveLocalClass: 'btn-save-local',
            showClass: 'active'
        };

        extend(this.options, options);

        this.recordVideoEl = createDom(this._tabsTemplate(this.options));

        document.body.appendChild(this.recordVideoEl);

        this.videoEl = this.recordVideoEl.getElementsByClassName(this.options.videoClass)[0];
        this.recordEl = this.recordVideoEl.getElementsByClassName(this.options.recordBtnClass)[0];
        this.buttonsEl = this.recordVideoEl.getElementsByClassName(this.options.buttonsClass)[0];
        this.closeEl = this.recordVideoEl.getElementsByClassName(this.options.closeClass)[0];
        this.cutoverEl = this.recordVideoEl.getElementsByClassName(this.options.cutoverClass)[0];
        this.cancelEl = this.recordVideoEl.getElementsByClassName(this.options.cancelClass)[0];
        this.confirmEl = this.recordVideoEl.getElementsByClassName(this.options.confirmClass)[0];
        this.localUploadEl = this.recordVideoEl.getElementsByClassName(this.options.localUploadClass)[0];
        this.livesRemarkEl = this.recordVideoEl.getElementsByClassName(this.options.livesRemarkClass)[0];
        this._init();
    }

    _init() {
        this.buffers = [];
        this.photosBuffers = [];
        this.consentEnd = false;
        this.localImportVideo = false;

        this.progress = new Progress(this.recordEl,{
            width: this.recordEl.clientHeight,
            height: this.recordEl.clientHeight,
            maxspeed: this.options.maxTimes
        });

        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
            this._mediaRecorder();
        } else {
            console.log("你的浏览器不支持访问用户媒体设备");
        }

        showHideDom(this.cancelEl, 'none');
        showHideDom(this.confirmEl, 'none');
        if (this.options.newDayVideo) {
            showHideDom(this.localUploadEl, 'none');
        }

        this._bindEvent();
    }

    _bindEvent() {
        // 开始录制/结束录制
        addEvent(this.recordEl, 'click', () => {
            if (this.consentEnd) {
                return;
            }
            this.consentEnd = true;

            if(hasClass(this.buttonsEl, this.options.startClass)){
                removeClass(this.buttonsEl, this.options.startClass);
                addClass(this.buttonsEl, this.options.showClass);
                this._stopRecord();
                showHideDom(this.cancelEl, 'block');
                showHideDom(this.confirmEl, 'block');
                this.progress.show();
            }else {
                addClass(this.buttonsEl, this.options.startClass);
                showHideDom(this.cancelEl, 'none');
                showHideDom(this.confirmEl, 'none');
                showHideDom(this.cutoverEl, 'none');
                showHideDom(this.localUploadEl, 'none');

                if (this.options.newDayVideo && typeof this.livesRemarkEl !== 'undefined') {
                    showHideDom(this.livesRemarkEl, 'none');
                }

                this._startRecord();
            }
        });

        // 关闭录制器
        addEvent(this.closeEl, 'click', () => {
            modal.confirm(RECORD_LANG.Madal.ExitRecord.Text, () => {
                this._stopStreamedVideo();
                this.hide();
            }, () => {}, true);
        });

        // 删除录制视频
        addEvent(this.cancelEl, 'click', () => {
            modal.confirm(RECORD_LANG.Madal.DeleteVideo.Text, () => {
                this.buffers = [];
                this.consentEnd = false;
                showHideDom(this.cancelEl, 'none');
                showHideDom(this.confirmEl, 'none');
                showHideDom(this.cutoverEl, 'block');
                showHideDom(this.localUploadEl, 'block');

                if (this.options.newDayVideo && typeof this.livesRemarkEl !== 'undefined') {
                    showHideDom(this.livesRemarkEl, 'block');
                }

                removeClass(this.buttonsEl, this.options.showClass);
                this._mediaRecorder();
            }, () => {}, true);
        });

        // 上传视频
        addEvent(this.confirmEl, 'click', () => {
            this.hide();

            if (!this.localImportVideo) {
                this.videoFile = new File([this.blob], Date.now() + '.mp4', {
                    type: "video/mp4",
                });
            }

            this.photosFile = new File([this.photosBuffers], Date.now() + '.jpg', {
                type: "image/jpeg",
            });

            if (this.options.notUpload) {
                return this.trigger('recordVideo.success', this.videoFile, this.imgURL);
            }

            if (this.options.editVideoInfo) {
                return this._editVideoInfoDOM();

                // return videoType().then((data) => {
                //     this._editVideoInfoDOM(data);
                // });
            }

            this._uploadVideo(this.videoFile, this.photosFile);
        });

        // 本地导入视频
        addEvent(this.localUploadEl, 'click', () => {
            // this._stopStreamedVideo();
            this._localImportVideo();
        });

        // 切换摄像头
        addEvent(this.cutoverEl, 'click', () => {
            this.buffers = [];
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

    _tabsTemplate(options) {
        let html = '';

        html = '<div class="content record-wrapper">';
        html += '<div class="lives-video"><video id="video" class="'+ options.videoClass +'"></video></div>';
        html += '<div class="lives-header"><div class="icon '+ options.closeClass +'"></div><div class="icon '+ options.cutoverClass +'"></div></div>';
        html += '<div class="lives-buttons record-buttons"><div class="icon '+ options.cancelClass +'"></div><div class="'+ options.recordBtnClass +'"></div><div class="icon '+ options.confirmClass +'"></div><div class="icon '+ options.localUploadClass +'"></div></div>';
        html += options.newDayVideo ? '' :'<p class="'+ options.livesRemarkClass +'">'+ RECORD_LANG.Prompt +'</p>';
        html += '</div>';

        return html;
    }

    _uploadTemplate() {
        let html = '';

        html = '<div class="upload-wrapper">';
        html += '<img class="upload-img" src="'+ this.imgURL +'">';
        html += '<p class="upload-title">'+ RECORD_LANG.UploadTitle +'</p>';
        html += '<div class="upload-progress"></div>';
        html += '</div>';

        return html;
    }

    _editVideoInfoTemplate() {
        let html = '';

        html = '<div class="'+ this.options.videoInfoWrapperClass+'">';
        html += '<header class="bar bar-flex"><div class="icon-btn '+ this.options.btnEditCloseClass +'" data-ripple><i class="icon icon-arrow-back"></i></div><h1 class="title">'+ RECORD_LANG.EditVideoInfo.Title +'</h1></header>';
        html += '<div class="content block '+ this.options.videoInfoContentClass +'">';
        html += '<div class="edit-box"><div class="'+ this.options.editVideoClass +'"  style="background-image: url('+ this.imgURL +');"><i class="icon user-video-play"></i></div><textarea class="form-control '+ this.options.editTextareaClass +'" rows="3"></textarea></div>';
        html += '<div class="buttons  buttons-vertical"><div class="button button-primary '+ this.options.btnEditConfirmClass +'" data-ripple>'+ RECORD_LANG.EditVideoInfo.Buttons.Release +'</div><div class="button button-link '+ this.options.btnEditSaveLocalClass +'" data-ripple>'+ RECORD_LANG.EditVideoInfo.Buttons.SaveLocal +'</div></div>';
        html += '</div></div>';

        return html;
    }

    static attachTo(options) {
        return new RecordVideo(options);
    }

    // 获取媒体设备的媒体流
    _mediaRecorder(){
        this._getUserMedia(this.constraints, (stream) => {
            this.mediaRecoder = new MediaRecorder(stream);
            this.videoEl.srcObject  = stream;
            this.videoEl.autoplay = true;

            this.mediaRecoder.ondataavailable = (event) => {

                if(this.mediaRecoder.state == "inactive"){
                    return;
                }

                // 计时器-最小
                if (this.buffers.length == this.options.minTimes) {
                    this.consentEnd = false;
                }

                // 计时器-结束
                if (this.buffers.length > this.options.maxTimes) {
                    if (this.options.newDayVideo) {
                        this.consentEnd = false;
                        dispatchEvent(this.recordEl, 'click');
                        return;
                    }
                    dispatchEvent(this.recordEl, 'click');
                    return;
                }

                this.buffers.push(event.data);
                this.progress.show(this.buffers.length);
                setTimeout(() => {
                    this._createIMG(this.videoEl);
                }, this.options.minTimes / 2);
            };

            this.mediaRecoder.onstart = () => {
                this.trigger('recordVideo.start');
            };

            // 添加录制结束的事件监听，保存录制数据
            this.mediaRecoder.onstop = () => {
                this.trigger('recordVideo.stop');
                this.blob = new Blob(this.buffers,{type:"video/mp4"});
                this.videoEl.src = URL.createObjectURL(this.blob);
                this.videoEl.play();
            };
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

    // 开始录制
    _startRecord() {
        if (this.mediaRecoder.state == "recording"){
            return;
        }else if(this.mediaRecoder.state == "paused"){
            this.mediaRecoder.resume();
        }else if(this.mediaRecoder.state == "inactive"){
            this.mediaRecoder.start(1000);
        }
    }

    // 暂停录制
    _pauseRecord() {
        if(this.mediaRecoder.state == "recording"){
            console.log('暂停');
            this.mediaRecoder.pause();
        }
    }

    // 结束录制
    _stopRecord() {
        if(this.mediaRecoder.state == "recording"){

            this._stopStreamedVideo();
            this.mediaRecoder.stop();
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

    // 图片创建
    _createIMG(videoTemplate) {
        let canvas = document.createElement("canvas");
        let canvasFill = canvas.getContext('2d');
        canvas.width = videoTemplate.videoWidth;
        canvas.height = videoTemplate.videoHeight;
        canvasFill.drawImage(videoTemplate, 0, 0, canvas.width, canvas.height);

        this.imgURL = canvas.toDataURL("image/jpeg");

        let imgData = this.imgURL.split(",")[1];
        let blobBin = window.atob(imgData);
        let array = [];
        for(let i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        this.photosBuffers = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    }

    // 显示上传进度
    _uploadShow() {
        window.setTimeout(() => {
            addClass(this.progressEl, this.options.inUploadClass);
        }, 0);
    }

    // 隐藏上传进度
    _uploadHide() {
        addClass(this.progressEl, this.options.outUploadClass);
        window.setTimeout(() => {
            document.body.removeChild(this.progressEl);
        }, 500);
    }

    // 本地上传视频
    _localImportVideo() {
        let inputEl = document.createElement('input');
        let userAgent = navigator.userAgent.toLowerCase();
        //判断是否是苹果手机，是则是true
        if ((userAgent.indexOf('iphone') != -1) || (userAgent.indexOf('ipad') != -1)) {
            inputEl.setAttribute("capture", "camcorder");
        };

        inputEl.setAttribute("type", "file");
        inputEl.setAttribute("accept", "video/*");
        inputEl.click();

        addEvent(inputEl, 'change', () => {
            let previewVideoEl = document.createElement('video');
            this.videoFile = inputEl.files[0];

            previewVideoEl.src = URL.createObjectURL(this.videoFile);
            previewVideoEl.play();

            setTimeout(() => {
                this._createIMG(previewVideoEl);
                this.localImportVideo = true;
                dispatchEvent(this.confirmEl, 'click');
                previewVideoEl.pause();
            }, 4000);
        });
    }

    // 上传视频
    _uploadVideo(_videoFile, _photosFile, _title) {
        let _uploadEl = this._uploadVideoDOM();
        let _progress = new Progress(_uploadEl,{
            width: _uploadEl.clientHeight,
            height: _uploadEl.clientHeight,
            background: '#fff',
            itemBackground: '#1FC969',
            lineWidth: 2,
            showFont: true
        });
        let _type = this.newDayVideo ? 2 : 1;
        uploadVideo([_videoFile, _photosFile], _type, _title, (data) => {
            this._uploadHide();
            this.trigger('recordVideo.upload.success');
        }, (progress) => {
            _progress.show(progress);
        });
    }

    // 上传视频
    _uploadVideoDOM() {
        this.progressEl = createDom(this._uploadTemplate());

        document.body.appendChild(this.progressEl);

        this._uploadShow();
        return this.progressEl.getElementsByClassName(this.options.uploadClass)[0];
    }

    // 下载视频
    _downLoadVideo() {
        var downloadButton = document.createElement("a");
        downloadButton.textContent = "保存到本地";
        downloadButton.href = this.url;
        downloadButton.download = this.url;
        document.body.appendChild(downloadButton);
        document.body.removeChild(this.video);
    }

    // 编辑视频详细
    _editVideoInfoDOM(_videoType) {

        this.editVideoInfoEl = createDom(this._editVideoInfoTemplate(_videoType));

        document.body.appendChild(this.editVideoInfoEl);

        this.editVideoEl = this.editVideoInfoEl.getElementsByClassName(this.options.editVideoClass)[0];
        this.editTextareaEl = this.editVideoInfoEl.getElementsByClassName(this.options.editTextareaClass)[0];
        this.btnEditCloseEl = this.editVideoInfoEl.getElementsByClassName(this.options.btnEditCloseClass)[0];
        this.btnEditConfirmEl = this.editVideoInfoEl.getElementsByClassName(this.options.btnEditConfirmClass)[0];
        this.btnEditSaveLocalEl = this.editVideoInfoEl.getElementsByClassName(this.options.btnEditSaveLocalClass)[0];

        this._videoInfoShow();
        this._bindVideoInfoEvent();
    }

    // 编辑视频详细事件
    _bindVideoInfoEvent() {

        // 播放视频
        addEvent(this.editVideoEl, 'click', () => {
            // this._videoInfoHide();
        });

        // 关闭编辑视频详细
        addEvent(this.btnEditCloseEl, 'click', () => {
            this._videoInfoHide();
        });

        // 确认上传
        addEvent(this.btnEditConfirmEl, 'click', () => {
            let _title = replaceNote(this.editTextareaEl.value);

            if (_title == '') return false;

            this._videoInfoHide();
            this._uploadVideo(this.videoFile, this.photosFile, _title);
        });

        // 本地保存
        addEvent(this.btnEditSaveLocalEl, 'click', () => {

        });
    }

    /**
     * RecordVideo.videoInfo.show()
     * 显示编辑视频器，一般来说，编辑视频器内部已经实现了显示逻辑，不必主动调用。
     * @return {[type]}        [description]
     */
    _videoInfoShow() {
        window.setTimeout(() => {
            this.trigger('RecordVideo.videoInfo.open');
            addClass(this.editVideoInfoEl, this.options.inVideoInfoClass);
        }, 0);
    }

    /**
     * RecordVideo.videoInfo.hide()
     * 隐藏编辑视频器，一般来说，编辑视频器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    _videoInfoHide() {
        removeClass(this.editVideoInfoEl, this.options.inVideoInfoClass);
        addClass(this.editVideoInfoEl, this.options.outVideoInfoClass);
        window.setTimeout(() => {
            this.trigger('RecordVideo.videoInfo.close');
            document.body.removeChild(this.editVideoInfoEl);
        }, 500);
    }

    /**
     * Record.show()
     * 显示录制器
     * @param  {Function} next 为录制器显示后执行的回调函数
     * @return {[type]}        [description]
     */
    show(next) {
        window.setTimeout(() => {
            this.trigger('recordVideo.open');
            addClass(this.recordVideoEl, this.options.inRecordClass);
            next && next();
        }, 0);
    }

    /**
     * Record.hide()
     * 隐藏录制器，一般来说，录制器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    hide() {
        removeClass(this.recordVideoEl, this.options.inRecordClass);
        addClass(this.recordVideoEl, this.options.outRecordClass);
        window.setTimeout(() => {
            this.trigger('recordVideo.close');
            document.body.removeChild(this.recordVideoEl);
        }, 500);
    }
}


/**
 * recordVideo.open
 * 当显示录制器的时候，会派发 recordVideo.open 事件。
 */

/**
 * recordVideo.close
 * 当隐藏录制器的时候，会派发 recordVideo.close 事件。
 */

/**
 * recordVideo.start
 * 当录制视频开始的时候，会派发 recordVideo.start 事件。
 */

/**
 * recordVideo.stop
 * 当录制视频结束的时候，会派发 recordVideo.stop 事件。
 */

/**
 * recordVideo.upload.success
 * 当视频上传成功的时候，会派发 recordVideo.stop 事件。
 */