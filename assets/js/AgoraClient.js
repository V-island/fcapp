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

let instance = null;

export default class AgoraClient {
    constructor() {
        if (instance) {
            return instance;
        }
        this.detection();
        this.client = AgoraRTC.createClient({
            mode: 'live',
            codec: 'vp8'
        });

        this.clientEmitter = new EventEmitter();
        this._createHandler();

        this.channelKey = null;

        instance = this;
    }

    // 连接
    connect() {
        return new Promise((resolve, reject) => {
            this.client.init(agoraConfig.agoraAppId || '', () => {
                // console.log(MSG.successInit);
                resolve();
            }, (error) => {
                console.log(MSG.errorInit, error);
                reject(error);
            });
        });
    }

    // 加入频道
    join(channel, uId) {
        this.channel = channel;
        return new Promise((resolve, reject) => {
            if (!this.client) {
                throw {
                    Message: '"client" must be initialized before joining channel'
                }
            }
            this.client.join(this.channelKey, channel, uId || null, (uid) => {
                // console.log(MSG.successJoin.replace('%s', uid));
                resolve(uid);
            }, (error) => {
                console.log(MSG.errorJoin, error);
                reject(error);
            });
        });
    }

    // 发布本地音视频流-在直播场景里，调用该方法的用户即为主播
    publish(stream) {
        return new Promise((reject) => {
            this.client.publish(stream, (error) => {
                console.log(MSG.errorPublishStream + error);
                reject(error);
            });
        });
    }

    // 订阅远程音视频流-从服务器端接收远程音视频流
    subscribe(stream) {
        return new Promise((reject) => {
            this.client.subscribe(stream, (error) => {
                console.log(MSG.errorSubscribe, error);
                reject(error);
            });
        });
    }

    // 取消发布本地音视频流-取消发布本地音视频流
    unpublish(stream) {
        return new Promise((reject) => {
            this.client.unpublish(stream, (error) => {
                reject(error);
            });
        });
    }

    // 取消发布本地音视频流-取消发布本地音视频流
    unsubscribe(stream) {
        return new Promise((reject) => {
            this.client.unsubscribe(stream, (error) => {
                reject(error);
            });
        });
    }

    // 离开频道
    leave() {
        return new Promise((resolve, reject) => {
            this.client.leave(() => {
                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    // 更新 Channel Key
    renewChannelKey(key) {
        return new Promise((resolve, reject) => {
            this.client.renewChannelKey(key, () => {
                resolve();
            }, (error) => {
                reject(error);
            });
        });
    }

    // 监听客户端对象
    _createHandler() {
        [
            'stream-published',         // 本地音视频流已发布
            'stream-added',             // 远程音视频流已添加
            'stream-removed',           // 已删除远程音视频流，即对方调用了 Client.unpublish
            'stream-subscribed',        // 已接收远程音视频流

            'peer-leave',               // 对方用户已离开频道，即对方调用了 Client.leave
            'mute-audio',               // 对方用户在语音通话中将自己的声音关掉
            'unmute-audio',             // 对方用户在语音通话中将自己的声音打开
            'mute-video',               // 对方用户在视频通话中将自己的视频关掉
            'unmute-video',             // 对方用户在视频通话中将自己的视频打开

            'client-banned',            // 用户已经在聊天过程中被踢，或没有进入频道就被封禁。当前只有被踢的用户会收到这个回调
            'active-speaker',           // 频道内谁在说话（音量最大的用户）
            'volume-indicator',         // 提示频道内谁在说话以及说话者的音量

            'liveStreamingStarted',     // 直播推流成功
            'liveStreamingFailed',      // 直播推流失败
            'lliveStreamingStopped',    // 直播推流已停止
            'liveTranscodingUpdated',   // 主播转码已更新

            'onTokenPrivilegeWillExpire',   // 在 Token 过期前 30 秒，会收到该事件通知。 一般情况下，在收到该消息之后，应向服务端重新申请 Token，并调用 Client.renewToken 方法。
            'onTokenPrivilegeDidExpire',    // 在 Token 过期后，会收到该事件通知。 一般情况下，在收到该消息之后，应向服务端重新申请 Token，并调用 Client.renewToken 方法。

            'error',                    // 有出错信息，需要进行处理
            'networkTypeChanged',       // 网络类型发生改变
            'recordingDeviceChanged',   // 有音频输入设备被添加或移除
            'playoutDeviceChanged',     // 有音频输出设备被添加或移除
            'cameraChanged',            // 有摄像头被添加或移除
            'streamTypeChange'          // 视频流类型发生改变。 视频流类型改变指视频大流（高码率、高分辨率）变为视频小流（低码率、低分辨率），或视频小流变为视频大流
        ].map(event => {
            return this.client.on(event, (...args) => {
                this.clientEmitter.emit(event, ...args);
            });
        });
    }

    detection() {
        // 用户可选关闭Agora DSK功能
        if (!agoraConfig.agora) {
            return;
        }

        // check support webRTC
        if (!AgoraRTC.checkSystemRequirements()) {
            console.log(MSG.errorWebRTC);
        }

        AgoraRTC.getDevices((devices) => {
            console.log(devices);
        });
    }

    static getInstance() {
        return new AgoraClient();
    }
}