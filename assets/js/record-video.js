import EventEmitter from './eventEmitter';
import { Spinner } from './components/Spinner';
import Modal from './modal';
import Progress from './progress';
import {
    body
} from './intro';
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
    setData,
    addEvent,
    replaceNote,
    dispatchEvent,
    createDom,
    createDivEl,
    secToTime,
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
// QVGA
const qvgaConstraints = {
    audio: true,
    video: {width: {exact: 320}, height: {exact: 240}}
};
// VGA
const vgaConstraints = {
    audio: true,
    video: {width: {exact: 640}, height: {exact: 480}}
};

// HD
const hdConstraints = {
    audio: true,
    video: {width: {exact: 1280}, height: {exact: 720}}
};

// Full HD
const fullHdConstraints = {
    audio: true,
    video: {width: {exact: 1920}, height: {exact: 1080}}
};

// 4K
const fourKConstraints = {
    audio: true,
    video: {width: {exact: 4096}, height: {exact: 2160}}
};

// 8K
const eightKConstraints = {
    audio: true,
    video: {width: {exact: 7680}, height: {exact: 4320}}
};

export default class RecordVideo extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            minTimes: 60,
            maxTimes: 1800,
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
            timesClass: 'lives-times',
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
            deviceID: 'id',
            showClass: 'active'
        };

        extend(this.options, options);

        this.recordVideoEl = this._tabsTemplate(this.options);
        document.body.appendChild(this.recordVideoEl);

        this.videoEl = this.recordVideoEl.getElementsByClassName(this.options.videoClass)[0];

        this.closeEl = this.recordVideoEl.getElementsByClassName(this.options.closeClass)[0];
        this.cutoverEl = this.recordVideoEl.getElementsByClassName(this.options.cutoverClass)[0];

        this.buttonsEl = this.recordVideoEl.getElementsByClassName(this.options.buttonsClass)[0];
        this.recordEl = this.recordVideoEl.getElementsByClassName(this.options.recordBtnClass)[0];
        this.cancelEl = this.recordVideoEl.getElementsByClassName(this.options.cancelClass)[0];
        this.confirmEl = this.recordVideoEl.getElementsByClassName(this.options.confirmClass)[0];

        this.timesEl = this.recordVideoEl.getElementsByClassName(this.options.timesClass)[0];
        this.localUploadEl = this.recordVideoEl.getElementsByClassName(this.options.localUploadClass)[0];
        this.livesRemarkEl = this.recordVideoEl.getElementsByClassName(this.options.livesRemarkClass)[0];
        this._init();
    }

    _init() {
        this.buffers = [];
        this.photosBuffers = [];
        this.videoSource = false;
        this.consentEnd = false;
        this.localImportVideo = false;

        this.progress = new Progress(this.recordEl,{
            width: this.recordEl.clientHeight,
            height: this.recordEl.clientHeight,
            maxspeed: this.options.maxTimes
        });

        if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.enumerateDevices || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia){
            // 列出摄像头
            navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
                this.gotDevices(deviceInfos);
            }).catch((error) => {
                console.log(error);
            });
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
                return modal.toast(RECORD_LANG.Prompt.Length);
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

                if (!this.options.newDayVideo && typeof this.livesRemarkEl !== 'undefined') {
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

                if (!this.options.newDayVideo && typeof this.livesRemarkEl !== 'undefined') {
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
            const _devicesID = parseInt(getData(this.cutoverEl, this.options.deviceID)) == 0 ? 1 : 0;
            this.buffers = [];
            this.videoSource = this.videoDevices[_devicesID];

            if (window.stream) {
                window.stream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            this._mediaRecorder();
            setData(this.cutoverEl, this.options.deviceID, _devicesID);
        });
    }

    _tabsTemplate(options) {
        const wrapper = createDivEl({className: ['content', 'record-wrapper']});
        const livesVideo = createDivEl({className: 'lives-video'});
        const video = createDivEl({element: 'video', id: 'video', className: options.videoClass});

        video.setAttribute('preload', 'auto');
        // 使用h5播放器，默认打开网页的时候，会自动全屏
        video.setAttribute('webkit-playsinline', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('x5-playsinline', true);
        video.setAttribute('x-webkit-airplay', 'allow');

        // 启用Ｈ5同层播放器
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', true);
        // 控制横竖屏  可选值： landscape 横屏, portraint竖屏
        video.setAttribute('x5-video-orientation', 'landscape|portrait');

        livesVideo.appendChild(video);
        wrapper.appendChild(livesVideo);

        const livesHeader = createDivEl({className: 'lives-header'});
        const closeIcon = createDivEl({element: 'i', className: ['icon', options.closeClass]});
        const cutoverIcon = createDivEl({element: 'i', className: ['icon', options.cutoverClass]});
        livesHeader.appendChild(closeIcon);
        livesHeader.appendChild(cutoverIcon);
        wrapper.appendChild(livesHeader);

        const livesTimes = createDivEl({className: 'lives-times', content: '00:00:00'});
        wrapper.appendChild(livesTimes);

        const livesButtons = createDivEl({className: ['lives-buttons', 'record-buttons']});
        const cancelIcon = createDivEl({element: 'i', className: ['icon', options.cancelClass]});
        const recordBtn = createDivEl({className: options.recordBtnClass});
        const confirmIcon = createDivEl({element: 'i', className: ['icon', options.confirmClass]});
        livesButtons.appendChild(cancelIcon);
        livesButtons.appendChild(recordBtn);
        livesButtons.appendChild(confirmIcon);
        wrapper.appendChild(livesButtons);

        const uploadIcon = createDivEl({element: 'i', className: ['icon', 'lives-localUpload', options.localUploadClass]});
        wrapper.appendChild(uploadIcon);

        if (!options.newDayVideo) {
            const livesRemark = createDivEl({element: 'p', className: options.livesRemarkClass, content: RECORD_LANG.Prompt.Checked});
            wrapper.appendChild(livesRemark);
        }

        return wrapper;
    }

    _uploadTemplate() {
        const wrapper = createDivEl({className: 'upload-wrapper'});
        const img = createDivEl({element: 'img', className: 'upload-img'});
        img.setAttribute('src', this.imgURL);
        wrapper.appendChild(img);

        const title = createDivEl({element: 'p', className: 'upload-title', content: RECORD_LANG.UploadTitle});
        const progress = createDivEl({className: 'upload-progress'});
        wrapper.appendChild(title);
        wrapper.appendChild(progress);

        return wrapper;
    }

    _editVideoInfoTemplate() {
        const wrapper = createDivEl({className: this.options.videoInfoWrapperClass});

        const header = createDivEl({element: 'header', className: ['bar', 'bar-flex']});
        const btnEditClose = createDivEl({className: ['icon-btn', this.options.btnEditCloseClass]});
        const arrowIcon = createDivEl({element: 'i', className: ['icon', 'icon-arrow-back']});
        btnEditClose.appendChild(arrowIcon);
        header.appendChild(btnEditClose);

        const title = createDivEl({element: 'h1', className: 'title', content: RECORD_LANG.EditVideoInfo.Title});
        header.appendChild(title);
        wrapper.appendChild(header);

        const content = createDivEl({className: ['content', 'block', this.options.videoInfoContentClass]});
        const editBox = createDivEl({className: 'edit-box'});
        const editVideo = createDivEl({className: this.options.editVideoClass, background: this.imgURL});
        const videoPlayIcon = createDivEl({element: 'i', className: ['icon', 'user-video-play']});
        editVideo.appendChild(videoPlayIcon);
        editBox.appendChild(editVideo);

        const textarea = createDivEl({element: 'textarea', className: ['form-control', this.options.editTextareaClass]});
        textarea.setAttribute('rows', '3');
        textarea.setAttribute('placeholder', RECORD_LANG.EditVideoInfo.Placeholder);
        editBox.appendChild(textarea);
        content.appendChild(editBox);

        const buttons = createDivEl({className: ['buttons', 'buttons-vertical']});
        const btnEditConfirm = createDivEl({className: ['button', 'button-primary', this.options.btnEditConfirmClass], content: RECORD_LANG.EditVideoInfo.Buttons.Release});
        const btnEditSaveLocal = createDivEl({className: ['button', 'button-link', this.options.btnEditSaveLocalClass], content: RECORD_LANG.EditVideoInfo.Buttons.SaveLocal});
        buttons.appendChild(btnEditConfirm);
        buttons.appendChild(btnEditSaveLocal);
        content.appendChild(buttons);
        wrapper.appendChild(content);

        return wrapper;
    }

    static attachTo(options) {
        return new RecordVideo(options);
    }

    // 获取摄像头
    gotDevices(deviceInfos) {
        this.videoDevices = [];
        deviceInfos.forEach((device) => {
            if (device.kind === 'videoinput') {
                this.videoDevices.push(device.deviceId);
            }
        });
        this.videoSource = this.videoDevices[0];
        this._mediaRecorder();
        setData(this.cutoverEl, this.options.deviceID, 0);
    }

    // 获取录制格式
    _createConstraints() {
        return {
            audio: true,
            video: {
                deviceId: this.videoSource ? {exact: this.videoSource} : undefined,
                width: {exact: 1280},
                height: {exact: 720}
            }
        };
    }

    // 获取媒体设备的媒体流
    _mediaRecorder(){
        let options = {mimeType: 'video/webm;codecs=vp9'};
        let constraints = this._createConstraints();

        this._getUserMedia(constraints, (stream) => {
            window.stream = stream; // make stream available to console
            this.videoEl.srcObject  = stream;
            this.videoEl.autoplay = true;

            this.mediaRecoder = new MediaRecorder(stream);

            this.mediaRecoder.ondataavailable = (event) => {
                if(this.mediaRecoder.state == "inactive"){
                    return;
                }

                if (event.data && event.data.size > 0) {
                    this.buffers.push(event.data);
                }
            };

            this.mediaRecoder.onstart = () => {
                this.trigger('recordVideo.start');

                this._timedCount(0);

                setTimeout(() => {
                    this._createIMG(this.videoEl);
                }, this.options.minTimes / 2);
            };

            // 添加录制结束的事件监听，保存录制数据
            this.mediaRecoder.onstop = () => {
                this.trigger('recordVideo.stop');
                clearTimeout(this.Timer);

                this.blob = new Blob(this.buffers, {
                    type: 'video/webm'
                });
                this.videoEl.src = URL.createObjectURL(this.blob);
                addEvent(this.videoEl, 'loadedmetadata', () => {
                    if (this.videoEl.duration === Infinity) {
                        this.videoEl.currentTime = 1e101;
                        this.videoEl.ontimeupdate = () => {
                            this.videoEl.currentTime = 0;
                            this.videoEl.ontimeupdate = () => {
                                delete this.videoEl.ontimeupdate;
                                this.videoEl.play();
                            };
                        };
                    } else {
                        this.videoEl.play();
                    }
                });
            };
        }, (error) => {
            console.log(error);
        });
    }

    // 访问用户媒体设备的兼容方法
    _getUserMedia(constrains, success, error){

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
            this.mediaRecoder.start(10); // collect 10ms of data
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
        if (window.stream) {
            window.stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    }

    // 计时器
    _timedCount(times) {
        this.Timer =  setTimeout(() => {
            this.timesEl.innerHTML = secToTime(times);

            // 计时器-最小
            if (times == this.options.minTimes) {
                this.consentEnd = false;
            }

            // 计时器-结束
            if (times > this.options.maxTimes) {
                if (this.options.newDayVideo) {
                    this.consentEnd = false;
                    dispatchEvent(this.recordEl, 'click');
                    return;
                }
                dispatchEvent(this.recordEl, 'click');
                return;
            }

            this.progress.show(times);

            this._timedCount(times+1);
        },1000);
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
            Spinner.start(body);
            setTimeout(() => {
                this._createIMG(previewVideoEl);
                this.localImportVideo = true;
                dispatchEvent(this.confirmEl, 'click');
                previewVideoEl.pause();
                Spinner.remove();
            }, 3000);
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
        this.progressEl = this._uploadTemplate();

        document.body.appendChild(this.progressEl);

        this._uploadShow();
        return this.progressEl.getElementsByClassName(this.options.uploadClass)[0];
    }

    // 编辑视频详细
    _editVideoInfoDOM(_videoType) {

        this.editVideoInfoEl = this._editVideoInfoTemplate();

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
            modal.videoModal(URL.createObjectURL(this.videoFile));
        });

        // 关闭编辑视频详细
        addEvent(this.btnEditCloseEl, 'click', () => {
            this._videoInfoHide();
        });

        // 确认上传
        addEvent(this.btnEditConfirmEl, 'click', () => {
            let _title = replaceNote(this.editTextareaEl.value);

            if (_title == "") {
                return modal.alert(RECORD_LANG.Prompt.Not_Description, (_modal) => {
                        modal.closeModal(_modal);
                    });
            }

            this._videoInfoHide();
            this._uploadVideo(this.videoFile, this.photosFile, _title);
        });

        // 本地保存
        addEvent(this.btnEditSaveLocalEl, 'click', () => {
            var downloadButton = document.createElement('a');
            downloadButton.style.display = 'none';
            downloadButton.href = this.url;
            downloadButton.download = this.url;
            document.body.appendChild(downloadButton);
            downloadButton.click();
            setTimeout(() => {
                document.body.removeChild(downloadButton);
            }, 100);
            // this._videoInfoHide();
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