import AgoraRTC from '../components/AgoraRTCSDK-2.3.0';

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

const agoraConfig = {
	appId: '1b5fc67b84e64a2c834b2f9f4907946e',
	liveWindow: 'video',
	userLiveWindow: 'video-us',
	channelKey: null,
	channel: '1024',
	uId: null
}

let live = {
	templateDOM: {},
	event: function() {
		let _self = this;
		let btn = $('.live-buttons');

		$('.icon-news', btn).on('click', function() {
			console.log('评论');
			$.actions(_self.templateDOM.live_news, {
				title: false,
				closeBtn: false
			});
		});

		$('.icon-share', btn).on('click', function() {
			console.log('分享');
			$.actions(_self.templateDOM.live_share, {
				title: 'Share to',
				closeBtn: true
			});
		});

		$('.icon-gift', btn).on('click', function() {
			console.log('礼物');
			$.actions(_self.templateDOM.live_gift, {
				title: 'Gift',
				closeBtn: true
			});
		});
	},
	agora: function() {
		// 用户可选关闭Agora DSK功能
		if (!$.fcConfig.agora) {
			return;
		}

		// check support webRTC
		if (!AgoraRTC.checkSystemRequirements()) {
			console.log(MSG.errorWebRTC);
		}

		let _self = this;

		AgoraRTC.getDevices(function(devices) {
			console.log(devices);
		});

		// 创建 Client 对象
		/**
		 * RTC.createClient
		 * @param: callback - success callback
		 * @return: rtc client
		 */
		let client = AgoraRTC.createClient({
			mode: 'live',
			codec: 'vp8'
		});

		// 初始化 Client 对象
		/**
		 * client.init
		 * @param: appid - appid
		 * @param: callback - success callback
		 * return: null
		 */
		client.init(agoraConfig.appId, function() {
			console.log(MSG.successInit);

			// 加入频道，如果启用了channel key, 请将channel key作为第一个参数
			// 若有自己的用户ID系统, 可在第三个参数传参, 不然可传undefined, 则Agora会自动分配一个uid
			/**
			 * client.join
			 * @param: key - channel key
			 * @param: channel - channel name
			 * @param: uid - uid, undefined if random one
			 * @param: callback - success callback
			 * return: null
			 */
			client.join(agoraConfig.channelKey, agoraConfig.channel, agoraConfig.uId, function(uid) {
				console.log(MSG.successJoin.replace('%s', uid));

				// 创建本地流, 修改对应的参数可以指定启用/禁用特定功能
				/**
				 * RTC.createStream
				 * @param: options
				 * @param: options.streamId id of stream
				 * @param: options.audio if audio is captured locally
				 * @param: options.video if video is captured locally
				 * @param: options.screen if this stream is for screen share
				 * @param: options. extensionId the extension id of your chrome extension if share screen is enabled
				 * return: created local stream
				 */
				let localStream = AgoraRTC.createStream({
					streamID: uid,
					audio: true,
					video: true,
					screen: false
				});

				// 设置本地流视频属性
				/**
				 * stream.setVideoProfile
				 * @param: profile profile string
				 */
				localStream.setVideoProfile('480P_2');

				// 回调通知应用程序用户已授权访问本地摄像头／麦克风使用权限
				/**
				 * @event: accessAllowed User has authorized access to local camera/microphone
				 */
				localStream.on("accessAllowed", function() {
					console.log(MSG.accessAllowed);
				});

				// 回调通知应用程序用户拒绝访问本地摄像头／麦克风使用权限
				/**
				 * @event: accessDenied User denied access to local camera/microphone
				 */
				localStream.on("accessDenied", function() {
					console.log(MSG.accessDenied);
				});

				// 初始化本地流, 并同时申请本地媒体采集权限
				/**
				 * stream.init
				 * @param: callback success callback
				 */
				localStream.init(function() {
					console.log(MSG.successGetUserMedia);

					// 将本地流在id为agora-remote的dom中播放
					/**
					 * stream.play
					 * @param: tag the dom tag where you want to play the video
					 * @return: null
					 */
					localStream.play(agoraConfig.userLiveWindow);

					// 将本地音视频流发布至 SD-RTN
					// 发布本地流以使其可以被远端接收到
					/**
					 * client.publish
					 * @param: stream the stream to publish
					 * @param: callback failing callback
					 * @return: null
					 */
					client.publish(localStream, function(err) {
						console.log(MSG.errorPublishStream + err);
					});

					// 回调通知应用程序本地音视频流已发布
					client.on('stream-published', function(evt) {
						console.log(MSG.successPublishStream);
						var stream = evt.stream;
						// 获取连接状态
						stream.getStats(function(stats) {
							console.log('获取publish 流连接状态');
							console.log(stats);
						});
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

		// 该回调通知应用程序远程音视频流已添加
		/**
		 * client.on
		 * @param: listen to stream event
		 * @param: callback listener callback
		 * @return: null
		 * @event: stream-added when new stream added to channel
		 */
		client.on('stream-added', function(evt) {
			var stream = evt.stream;
			console.log("New stream added: " + stream.getId());
			console.log("Timestamp: " + Date.now());
			console.log("Subscribe ", stream);

			// 在有新的流加入后订阅远端流
			/**
			 * client.subscribe
			 * @param: stream stream to subscribe
			 * @param: callback failing callback
			 * @return: null
			 */
			client.subscribe(stream, function(err) {
				console.log(MSG.errorSubscribe, err);
			});
		});

		// 该回调通知应用程序已接收远程音视频流。
		/**
		 * @event: stream-subscribed when a stream is successfully subscribed
		 */
		client.on('stream-subscribed', function(evt) {
			var stream = evt.stream;
			console.log("Got stream-subscribed event");
			console.log("Timestamp: " + Date.now());
			console.log("Subscribe remote stream successfully: " + stream.getId());
			console.log(evt);
			console.log('获取的远程流');
			stream.play(agoraConfig.liveWindow);
			// 获取连接状态
			stream.getStats(function(stats) {
				console.log('获取subscribe 流连接状态');
				console.log(stats);
			});
		});

		// 该回调通知应用程序已删除远程音视频流，即对方调用了 unpublish stream。
		/**
		 * @event: stream-removed when a stream is removed
		 */
		client.on("stream-removed", function(evt) {
			var stream = evt.stream;
			console.log("Stream removed: " + evt.stream.getId());
			console.log("Timestamp: " + Date.now());
			console.log(evt);
			// stream.stop();
		});

		// 该回调通知应用程序对方用户已离开频道，即对方调用了 client.leave()。
		/**
		 * @event: peer-leave when existing stream left the channel
		 */
		client.on('peer-leave', function(evt) {
			console.log("Peer has left: " + evt.uid);
			console.log("Timestamp: " + Date.now());
			console.log(evt);
		});

		// 该回调通知应用程序有出错信息，需要进行处理。
		/**
		 * @event: error Application has error information
		 */
		client.on('error', function(err) {
			console.log("Got error msg:", err.reason);
			if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {

				/**
				 * client.renewChannelKey
				 * @param: key - channel key
				 * @param: callback - success callback
				 * @param: callback - error callback
				 * return: null
				 */
				client.renewChannelKey(agoraConfig.channelKey, function() {
					console.log(MSG.successRenewChannelKey);
				}, function(err) {
					console.log(MSG.errorRenewChannelKey, err);
				});
			}
		});

		$('.live-close .icon-close').on('click', function() {
			console.log('关闭直播');
			client.leave(function() {
				console.log("Leavel channel successfully");
			}, function(err) {
				console.log("Leave channel failed");
			});
		});

	},
	init: function() {
		console.log('这里是livejs');
		// let publicTpl = HTMLImport.attachTo(PUBLICFILE.actions_lives);
		// this.templateDOM = publicTpl.tpl;
		this.event();
		this.agora();
	}
}
export default live;