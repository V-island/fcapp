import EventEmitter from './components/EventEmitter';
import AgoraRTC from './components/AgoraRTCSDK-2.5.0';
import {
    agoraConfig
} from './intro';
import {
    isNull,
    isNumber
} from './util';

const MSG = {
    // browser is no support webRTC
    errorWebRTC: '浏览器不支持webRTC',
    // AgoraRTC client initialized
    successInit: '初始化 AgoraRTC 成功',
    // AgoraRTC client init failed
    errorInit: '初始化 AgoraRTC 失败',
    // User %s join channel successfully
    successJoin: '用户%s成功加入频道',
    // Join channel failed
    errorJoin: '加入频道失败',
    // The user has granted access to the camera and mic.
    accessAllowed: '用户已授权访问摄像头和麦克风',
    // The user has denied access to the camera and mic.
    accessDenied: '用户拒绝访问相机和麦克风',
    // getUserMedia successfully
    successGetUserMedia: '成功获取用户媒体',
    // getUserMedia failed
    errorGetUserMedia: '获取用户媒体失败',
    // Publish local stream error
    errorPublishStream: '发布本地流错误:',
    // Publish local stream successfully
    successPublishStream: '发布本地流成功',
    // Renew channel key successfully
    successRenewChannelKey: '成功更新频道密钥',
    // Renew channel key failed:
    errorRenewChannelKey: '更新频道密钥失败:',
    // Subscribe stream failed:
    errorSubscribe: '订阅流失败'
}

export default class AgoraStream {
    constructor(uid) {
        this.stream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false
        });

        this.streamEmitter = new EventEmitter();
        this._createHandler();
    }

    // 连接
    // MEDIA_OPTION_INVALID: 摄像头被占用或者分辨率不支持（早期浏览器）
    // DEVICES_NOT_FOUND: 没有找到设备
    // NOT_SUPPORTED: 浏览器不支持获取获取摄像头和麦克风
    // PERMISSION_DENIED: 浏览器禁用设备或者用户拒绝打开设备
    // CONSTRAINT_NOT_SATISFIED: 配置参数不合法（早期浏览器）
    // UNDEFINED: 未定义错误
    connect() {
        return new Promise((resolve, reject) => {
            this.stream.init(() => {
                // console.log(MSG.successGetUserMedia);
                resolve();
            }, (error) => {
                console.log(MSG.errorGetUserMedia, error);
                reject(error);
            });
        });
    }

    // 播放音视频流
    play(HTMLElementID) {
        return this.stream.play(HTMLElementID, {fit: 'cover'});  // cover/contain
    }

    // 移除音视频轨道
    removeTrack(stream) {
        return this.stream.removeTrack(stream);
    }

    // 替换音视频轨道
    replaceTrack(stream) {
        return new Promise((resolve, reject) => {
            this.stream.replaceTrack(stream, () => {
                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    // 恢复播放伴奏
    resumeAudioMixing() {
        return this.stream.resumeAudioMixing();
    }

    // 调节音量大小
    setAudioVolume(number) {
        return this.stream.setAudioVolume(number); // 音量，范围为 0（静音） 到 100（声音最大）
    }

    // 设置视频属性-该方法设置视频属性，为可选项，且须在 Stream.init 之前调用。默认值为 "480p_1"。
    setVideoProfile(number) {
        return this.stream.setVideoProfile(number || '480P_2');
    }

    // 停止音视频流
    stop() {
        return this.stream.stop();
    }

    // 停止播放伴奏
    stopAudioMixing() {
        return this.stream.stopAudioMixing();
    }

    // 关闭音视频流
    close() {
        return this.stream.close();
    }

    // 禁用音频轨道
    disableAudio() {
        return this.stream.disableAudio();
    }

    // 禁用视频轨道
    disableVideo() {
        return this.stream.disableVideo();
    }

    // 启用音频轨道
    enableAudio() {
        return this.stream.enableAudio();
    }

    // 启用视频轨道
    enableVideo() {
        return this.stream.enableVideo();
    }

    // 该方法枚举可用的媒体输入/输出设备，比如麦克风、摄像头、耳机等。
    getDevices() {
        return new Promise((resolve) => {
            AgoraRTC.getDevices((devices) => {
                resolve(devices);
            });
        });
    }

    // 切换媒体输入设备
    switchDevice(type, deviceId) {
        return new Promise((resolve, reject) => {
            this.stream.switchDevice(type, deviceId, () => {
                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    // 监听音视频流对象
    _createHandler() {
        [
            'accessAllowed',        //  已获取本地摄像头／麦克风使用权限
            'accessDenied',         // 已禁止本地摄像头／麦克风使用权限
            'stopScreenSharing'     // 屏幕共享已停止
        ].map(event => {
            return this.stream.on(event, (...args) => {
                this.streamEmitter.emit(event, ...args);
            });
        });
    }

    static getInstance() {
        return new AgoraStream();
    }
}