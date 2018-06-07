import AgoraRTC from './components/AgoraRTCSDK-2.3.0';

+function($) {
    'use strict';

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
        successPublishStream: '发布本地流成功'
    }

    const agoraConfig = {
        appId: '1b5fc67b84e64a2c834b2f9f4907946e',
        liveWindow: 'video',
        channelKey: null,
        channel: '1024',
        uId: null
    }

    class Agora {

        constructor() {
            this._init();
        }

        /**
         * 初始化
         *
         * - 把当前文档内容缓存起来
         * - 查找默认展示的块内容，查找顺序如下
         *      1. id 是 url 中的 fragment 的元素
         *      2. 有当前块 class 标识的第一个元素
         *      3. 第一个块
         * - 初始页面 state 处理
         *
         * @private
         */
        _init() {
            //创建 Client 对象
            /*
            RTC.createClient
            @param: callback - success callback
            @return: rtc client
            */
            let client = AgoraRTC.createClient({
                mode: 'live',
                codec: 'h264'
            });

            //初始化 Client 对象
            /*
            client.init
            @param: appid - appid
            @param: callback - success callback
            return: null
            */
            client.init(agoraConfig.appId, function() {
                console.log(MSG.successInit);

                client.join(agoraConfig.channelKey, agoraConfig.channel, agoraConfig.uId, function(uid) {
                    console.log(MSG.successJoin.replace('%s', uid));

                    let localStream = AgoraRTC.createStream({
                        streamID: uid,
                        audio:true,
                        video:true,
                        screen: false
                    });

                    localStream.setVideoProfile('720p_3');

                    localStream.on("accessAllowed", function() {
                        console.log(MSG.accessAllowed);
                    });

                    localStream.on("accessDenied", function() {
                        console.log(MSG.accessDenied);
                    });

                    localStream.init(function() {
                        console.log(MSG.successGetUserMedia);
                        localStream.play(agoraConfig.liveWindow);

                        // 将本地音视频流发布至 SD-RTN
                        client.publish(localStream, function(err) {
                            console.log(MSG.errorPublishStream + err);
                        });

                        // 回调通知应用程序本地音视频流已发布
                        client.on('stream-published', function(evt) {
                            console.log(MSG.successPublishStream);
                        });
                    }, function(err) {
                        console.log(MSG.errorGetUserMedia, err);
                    });

                }, function(err) {
                    console.log(MSG.errorJoin, err);
                });

            }, function(err) {
                console.log(MSG.errorInit, err);
            });
        }

    }

    $(function() {
        // 用户可选关闭Agora DSK功能
        if (!$.fcConfig.agora) {
            return;
        }

        // check support webRTC
        if (!AgoraRTC.checkSystemRequirements()) {
            console.log(MSG.errorWebRTC);
        }

        AgoraRTC.getDevices(function(devices) {
            var devCount = devices.length;
            console.log(devices);
        });

        let agora = $.agora = new Agora();
    });
}(jQuery);