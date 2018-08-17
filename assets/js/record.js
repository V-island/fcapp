import EventEmitter from './eventEmitter';
import Modal from './modal';
import Progress from './progress';
import {
    uploadVideo
} from './api';
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
/**
config: {
    audio: true,
    video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 776, ideal: 720, max: 1080 },
        facingMode: "user",
        frameRate: { min: 15, ideal: 30, max: 60 },
      }
},
**/
export default class Record extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            config: {
                audio: true,
                video: true
            },
            minTimes: 60,
            maxTimes: 600,
            newDayVideo: false,
            notUpload: false,
            takePhotos: false,
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
            startClass: 'record-start',
            inUploadClass: 'upload-in',
            outUploadClass: 'upload-out',
            uploadClass: 'upload-progress',
            showClass: 'active'
        };

        extend(this.options, options);

        this.boxEl = createDom(this._tabsTemplate(this.options));

        document.body.appendChild(this.boxEl);

        this.videoEl = this.boxEl.getElementsByClassName(this.options.videoClass)[0];
        this.recordEl = this.boxEl.getElementsByClassName(this.options.recordBtnClass)[0];
        this.buttonsEl = this.boxEl.getElementsByClassName(this.options.buttonsClass)[0];
        this.closeEl = this.boxEl.getElementsByClassName(this.options.closeClass)[0];
        this.cutoverEl = this.boxEl.getElementsByClassName(this.options.cutoverClass)[0];
        this.cancelEl = this.boxEl.getElementsByClassName(this.options.cancelClass)[0];
        this.confirmEl = this.boxEl.getElementsByClassName(this.options.confirmClass)[0];
        this.localUploadEl = this.boxEl.getElementsByClassName(this.options.localUploadClass)[0];
        this._init();
    }

    _init() {
        const self = this;
        self.buffers = [];
        self.photosBuffers = [];
        self.consentEnd = false;

        if (!self.options.takePhotos) {
            self.progress = new Progress(self.recordEl,{
                width: self.recordEl.clientHeight,
                height: self.recordEl.clientHeight,
                maxspeed: self.options.maxTimes
            });
        }

        if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
            self._mediaRecorder();
        } else {
            console.log("你的浏览器不支持访问用户媒体设备");
        }

        showHideDom(self.cancelEl, 'none');
        showHideDom(self.confirmEl, 'none');
        if (self.options.newDayVideo) {
            showHideDom(self.localUploadEl, 'none');
        }

        self._bindEvent();
    }

    _bindEvent() {
        let self = this;

        // 开始录制/结束录制
        addEvent(self.recordEl, 'click', function() {
            if (self.consentEnd) {
                return;
            }
            if (!self.options.takePhotos) {
                self.consentEnd = true;
            }
            if(hasClass(self.buttonsEl, self.options.startClass)){
                removeClass(self.buttonsEl, self.options.startClass);
                addClass(self.buttonsEl, self.options.showClass);
                self._stopRecord();
                showHideDom(self.cancelEl, 'block');
                showHideDom(self.confirmEl, 'block');
                showHideDom(self.cutoverEl, 'block');

                if (!self.options.takePhotos) {
                    self.progress.show();
                }

                if (self.options.takePhotos) {
                    self.consentEnd = true;
                }
            }else {
                addClass(self.buttonsEl, self.options.startClass);
                showHideDom(self.cancelEl, 'none');
                showHideDom(self.confirmEl, 'none');
                showHideDom(self.cutoverEl, 'none');
                self._startRecord();
            }
        });

        // 关闭录制器
        addEvent(self.closeEl, 'click', function() {
            modal.confirm(RECORD_LANG.Madal.ExitRecord.Text, function() {
                dispatchEvent(self.recordEl, 'click');
                self.hide();
            }, function() {}, true);
        });

        // 删除录制视频
        addEvent(self.cancelEl, 'click', function() {
            modal.confirm(RECORD_LANG.Madal.DeleteVideo.Text, function() {
                self.buffers = [];
                self.consentEnd = false;
                showHideDom(self.cancelEl, 'none');
                showHideDom(self.confirmEl, 'none');
                removeClass(self.buttonsEl, self.options.showClass);
                self._mediaRecorder();
            }, function() {}, true);
        });

        // 上传视频
        addEvent(self.confirmEl, 'click', function() {
            self.hide();

            let videoFile = new File([self.blob], Date.now() + '.mp4', {
                type: "video/mp4",
            });
            let photosFile = new File([self.photosBuffers], Date.now() + '.jpg', {
                type: "image/jpeg",
            });

            if (self.options.notUpload) {
                return self.trigger('record.success', self.options.takePhotos ? photosFile : videoFile, self.imgURL);
            }

            let _uploadEl = self._uploadVideo();
            let _progress = new Progress(_uploadEl,{
                width: _uploadEl.clientHeight,
                height: _uploadEl.clientHeight,
                background: '#fff',
                itemBackground: '#1FC969',
                lineWidth: 2,
                showFont: true
            });
            let _type = self.newDayVideo ? 2 : 1;
            uploadVideo([videoFile, photosFile], _type, function(data) {
                self._uploadHide();
                self.trigger('record.upload.success');
            }, function(progress) {
                _progress.show(progress);
            });
        });

        // 切换摄像头
        addEvent(self.cutoverEl, 'click', function() {
            self.buffers = [];
            // self.options.config.video.facingMode = { exact: "environment" };
            self._mediaRecorder();
        });
    }

    _tabsTemplate(options) {
        let html = '';

        html = '<div class="content record-wrapper">';
        html += '<div class="lives-video"><video id="video" class="'+ this.options.videoClass +'"></video></div>';
        html += '<div class="lives-header"><div class="icon '+ this.options.closeClass +'"></div><div class="icon '+ this.options.cutoverClass +'"></div></div>';
        html += '<div class="lives-buttons record-buttons"><div class="icon '+ this.options.cancelClass +'"></div><div class="'+ this.options.recordBtnClass +'"></div><div class="icon '+ this.options.confirmClass +'"></div><div class="icon '+ this.options.localUploadClass +'"></div></div>';
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

    static attachTo(options) {
        return new Record(options);
    }

    // 获取媒体设备的媒体流
    _mediaRecorder(){
        let self = this;

        self._getUserMedia(self.options.config, function(stream) {
            console.log(stream);
            self.mediaRecoder = new MediaRecorder(stream);
            // self.videoEl.src = window.URL && window.URL.createObjectURL(stream) || stream;
            self.videoEl.srcObject  = stream;
            self.videoEl.autoplay = true;

            self.mediaRecoder.ondataavailable = function (event) {

                if(self.mediaRecoder.state == "inactive"){
                    return;
                }

                if (self.options.takePhotos) {
                    return;
                }

                // 计时器-最小
                if (self.buffers.length == self.options.minTimes) {
                    self.consentEnd = false;
                }

                // 计时器-结束
                if (self.buffers.length > self.options.maxTimes) {
                    if (self.options.newDayVideo) {
                        self.consentEnd = false;
                        dispatchEvent(self.recordEl, 'click');
                        return;
                    }
                    dispatchEvent(self.recordEl, 'click');
                    return;
                }

                self.buffers.push(event.data);
                self.progress.show(self.buffers.length);
                setTimeout(function() {
                    self._createIMG();
                }, self.options.minTimes / 2);
            };

            self.mediaRecoder.onstart = function () {
                self.trigger('record.start');
            };

            // 添加录制结束的事件监听，保存录制数据
            self.mediaRecoder.onstop = function () {
                self.trigger('record.stop');
                if (self.options.takePhotos) {
                    return;
                }
                self.blob = new Blob(self.buffers,{type:"video/mp4"});
                self.videoEl.src = URL.createObjectURL(self.blob);
                self.videoEl.play();
            };
        }, function(error) {
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
            if (this.options.takePhotos) {
                this._createIMG();
            }

            let tracks = this.mediaRecoder.stream.getTracks();
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            this.mediaRecoder.stop();
        }
    }

    // 上传视频
    _uploadVideo() {
        this.progressEl = createDom(this._uploadTemplate());

        document.body.appendChild(this.progressEl);

        this._uploadShow();
        return this.progressEl.getElementsByClassName(this.options.uploadClass)[0];
    }

    // 图片创建
    _createIMG() {
        let canvas = document.createElement("canvas");
        let canvasFill = canvas.getContext('2d');
        canvas.width = this.videoEl.videoWidth;
        canvas.height = this.videoEl.videoHeight;
        canvasFill.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);

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

    // 下载视频
    _downLoadVideo() {
        var downloadButton = document.createElement("a");
        downloadButton.textContent = "保存到本地";
        downloadButton.href = self.url;
        downloadButton.download = self.url;
        document.body.appendChild(downloadButton);
        document.body.removeChild(self.video);
    }

    /**
     * Record.show()
     * 显示录制器
     * @param  {Function} next 为录制器显示后执行的回调函数
     * @return {[type]}        [description]
     */
    show(next) {
        window.setTimeout(() => {
            this.trigger('record.open');
            addClass(this.boxEl, this.options.inRecordClass);
            next && next();
        }, 0);
    }

    /**
     * Record.hide()
     * 隐藏录制器，一般来说，录制器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    hide() {
        removeClass(this.boxEl, this.options.inRecordClass);
        addClass(this.boxEl, this.options.outRecordClass);
        window.setTimeout(() => {
            this.trigger('record.close');
            document.body.removeChild(this.boxEl);
        }, 500);
    }
}


/**
 * record.open
 * 当显示录制器的时候，会派发 record.open 事件。
 */

/**
 * record.close
 * 当隐藏录制器的时候，会派发 record.close 事件。
 */

/**
 * record.start
 * 当录制视频开始的时候，会派发 record.start 事件。
 */

/**
 * record.stop
 * 当录制视频结束的时候，会派发 record.stop 事件。
 */

/**
 * record.upload.success
 * 当视频上传成功的时候，会派发 record.stop 事件。
 */