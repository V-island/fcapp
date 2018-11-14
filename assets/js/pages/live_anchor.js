import { LivesContent, LivesContentAnchor, LivesWaiting, LivesAnchorCount } from '../components/LivesContents';
import { closeModal, popup } from '../components/Modal';
import { MessageChat } from '../components/MessageChat';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';
import AgoraClient from '../AgoraClient';
import AgoraStream from '../AgoraStream';
import Pay from '../Pay';
import {
	body
} from '../intro';
import {
    getLangConfig
} from '../lang';
import {
	beginLive,
	endLive,
	switchRoom,
	checkLiveRoom,
    getUserInfo,
    anchorBalance
} from '../api';
import {
    extend,
    jumpURL,
    createDom,
    errorAlert
} from '../util';

const LANG = getLangConfig();

export default class LiveAnchor extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	listWrapperClass: '.lives-wrapper',
	    	listVideoClass: '.lives-video',
	    	videoId: 'video'
        };

	    extend(this.options, options);

	    this.init(element);

	}

	init(element) {
		const {userId, liveRoomId, iMChannel} = getUserInfo();
		const getIMChannel = this._createIMChannel(userId);
		console.log(userId, liveRoomId, iMChannel);

		this.userId = userId;
		this.liveRoomId = liveRoomId;
		this.iMChannel = iMChannel;

		Promise.all([getIMChannel]).then((data) => {

			this.LiveAnchorEl = createDom(element);
			this.trigger('pageLoadStart', this.LiveAnchorEl);
			this._init();
		});
	}

	_init() {
		this.listWrapperEl = this.LiveAnchorEl.querySelector(this.options.listWrapperClass);

		this._bindEvent();
		this._livesAnchorEvent();
	}

	_bindEvent() {
		this.client = new AgoraClient();

		this.client.connect().then(() => {
			this.client.join(`${this.liveRoomId}`, this.userId).then((uid) => {
				this.stream = new AgoraStream(uid);

				this.stream.setVideoProfile('480P_2');
				this.stream.connect().then(() => {
					this.stream.play(this.options.videoId);
				});
			});
		});
	}

	// 链接直播服务
	_createIMChannel(userId) {
		const SendBird = new SendBirdAction();

		return new Promise((resolve) => {
			SendBird.connect(userId).then(user => {
				resolve(true);
			}).catch(() => {
				errorAlert('SendBird connection failed.');
				resolve(false);
			});
		});
	}

	_livesAnchorEvent() {
		const livesAnchor = new LivesContentAnchor();
		// 关闭直播
		livesAnchor.onClose = () => {
			const leaveClient = this.client.leave();
			const SendBirdDis = SendBirdAction.getInstance().disconnect();

			Promise.all([leaveClient, SendBirdDis]).then((data) => {

				return location.href = jumpURL('#/home');
			});
		};

		// 一对多直播
		livesAnchor.onPrivate = () => {
			Spinner.start(body);
			beginLive(this.liveRoomId, 2).then((data) => {
				if (!data) return Spinner.remove();
				this.livePrice = data.live_price;

				this.listWrapperEl.parentNode.removeChild(livesAnchor.element);
				this.client.publish(this.stream.stream);

				SendBirdAction.getInstance()
					.enter(this.iMChannel)
					.then(openChannel => {
						this.openChannel = openChannel;

						this.createHeartbeatHandler();
						this.createConnectionHandler();
						this._livesPrivateEvent();
						Spinner.remove();
					})
					.catch(error => {
						errorAlert(error.message);
						Spinner.remove();
					});
			});
		};

		// 一对一直播
		livesAnchor.onParty = () => {
			this.listWrapperEl.parentNode.removeChild(livesAnchor.element);

			popup({
				
			});
			// Spinner.start(body);
			// beginLive(this.liveRoomId, 1).then((data) => {
			// 	if (!data) return Spinner.remove();
			// 	this.livePrice = data.live_price;

			// 	this.listWrapperEl.parentNode.removeChild(livesAnchor.element);

			// 	this.client.publish(this.stream.stream);
			// 	this.client.clientEmitter.on('stream-added', (evt) => {
			// 		let stream = evt.stream;
			// 		console.log('该回调通知应用程序远程音视频流已添加');
		 	//		console.log("New stream added: " + stream.getId());
			// 		this.client.subscribe(stream);
			// 	});

			// 	// 该回调通知应用程序已接收远程音视频流
			// 	this.client.clientEmitter.on('stream-subscribed', (evt) => {
			// 	    let stream = evt.stream;
			// 	    console.log('该回调通知应用程序已接收远程音视频流');
			// 	    stream.play(this.options.videoId);
			// 	});

			// 	SendBirdAction.getInstance()
			// 		.enter(this.iMChannel)
			// 		.then(openChannel => {
			// 			console.log('连接IM');
			// 			this.openChannel = openChannel;
			// 			this.createConnectionHandler();

			// 			this._livesPartyEvent();
			// 			Spinner.remove();
			// 		})
			// 		.catch(error => {
			// 			errorAlert(error.message);
			// 			Spinner.remove();
			// 		});
			// });
		};
		this.listWrapperEl.parentNode.appendChild(livesAnchor.element);
	}

	_livesPrivateEvent() {
		const {userHead, userName} = getUserInfo();

		const livesPrivate = new LivesContent({
			data: {
				AnchorInfo: {
					user_head: userHead,
					user_name: userName
				}
			},
			channel: this.openChannel,
			client: false
		});
		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);

			this.client.unpublish(this.stream.stream);
			this.stream.close();

			endLive(this.liveRoomId).then((data) => {
				if (!data) return Spinner.remove();
				clearInterval(this.heartbeatEvent);

				const leaveClient = this.client.leave();
				const SendBirdDis = SendBirdAction.getInstance().disconnect();

				Promise.all([leaveClient, SendBirdDis]).then((data) => {
					Spinner.remove();
					this._livesCountEvent({userHead, userName});
				});
			});
		};

		// 发送弹幕
		livesPrivate.onNews = (message) => {
			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.openChannel,
			        message: message,
			        data: '',
			        type: 'chats',
			        handler: (message, error) => {
			        	console.log(message);
			        	console.log(error);
			        }
			    });
		};

		// 发送开始收费直播消息
		livesPrivate.onGetChargeShows = (second) => {
			const handler = (message, error) => {
				console.log(message);
				console.log(error);
			};

			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.openChannel,
			        message: '',
			        type: 'chargeTime',
			        data: `${second}`,
			        handler
			    });
		};

		// 开始收费直播
		livesPrivate.onChargeShows = (second) => {
			switchRoom(this.liveRoomId, 3, this.livePrice);
		};

		// 结束收费直播
		livesPrivate.onPartyShows = () => {
			switchRoom(this.liveRoomId, 2, this.livePrice).then(() => {
				SendBirdAction.getInstance()
				    .sendChannelMessage({
				        channel: this.openChannel,
				        message: '',
				        type: 'partyTime'
				    });
			});
		};

		this.listWrapperEl.appendChild(livesPrivate.element);
	}

	_livesPartyEvent() {

	}

	_livesCountEvent({userHead, userName}) {
		let modalEl;
		const handler = () => {
			return anchorBalance();
		};
		const again = () => {
			closeModal(modalEl);
			return location.href = jumpURL('#/live/anchor');
		};
		const rest = () => {
			closeModal(modalEl);
			return location.href = jumpURL('#/home');
		};
		const livesCount = new LivesAnchorCount({
			handler,
			again,
			rest,
			data: {
				user_head: userHead,
				user_name: userName
			}
		});
		modalEl = popup({
			element: livesCount.element,
			title: LANG.LIVE_PREVIEW.End_Live_Anchor.Title,
			notBack: true,
			notPadding: true
		});
	}

	createHeartbeatHandler() {
		// 心跳检测服务器连接
		this.heartbeatEvent = setInterval(() => {
            checkLiveRoom(this.liveRoomId);
        }, 60000);
	}

    // 注册ConnectionHandler以检测用户自身连接状态的变化
	createConnectionHandler() {
		const connectionManager = new SendBirdConnection();

		connectionManager.onReconnectStarted = () => {
			console.log('[SendBird JS SDK] Reconnect : Started');
		};

		connectionManager.onReconnectSucceeded = () => {
			console.log('[SendBird JS SDK] Reconnect : Succeeded');
		};

		connectionManager.onReconnectFailed = () => {
			console.log('[SendBird JS SDK] Reconnect : Failed');
			connectionManager.remove();
			redirectToIndex('SendBird Reconnect Failed...');
		};
	}

	static attachTo(element, options) {
	    return new LiveAnchor(element, options);
	}
}