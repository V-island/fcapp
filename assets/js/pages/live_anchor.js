import { LivesContent, LivesContentAnchor, LivesWaiting, LivesCallingAnchor, LivesAnchorCount } from '../components/LivesContents';
import { closeModal, alert, popup } from '../components/Modal';
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
    getLivePrice,
    anchorBalance
} from '../api';
import {
    extend,
    jumpURL,
    refreshURL,
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
	    	videoId: 'video',
	    	localVideoId: 'user-video'
        };

	    extend(this.options, options);

	    this.init(element);
	}

	init(element) {
		const {userId, liveRoomId, iMChannel} = getUserInfo();
		const getIMChannel = this._createIMChannel(userId);

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
		this.listVideoEl = this.listWrapperEl.querySelector(this.options.listVideoClass);
		this.VideoEl = this.listVideoEl.querySelector(`#${this.options.videoId}`);

		this._bindEvent();
		this._livesAnchorEvent();
	}

	_bindEvent() {
		this.client = new AgoraClient();

		this.client.connect().then(() => {
			this.client.join(`${this.liveRoomId}`, this.userId).then((uid) => {
				this.stream = new AgoraStream(uid);
				this.clientUid = uid;

				this.stream.setVideoProfile('360p_4');
				this.stream.connect().then(() => {
					this.stream.play(this.options.videoId);
				});
			});
		});
	}

	// 链接IM服务
	_createIMChannel(userId) {
		const SendBird = new SendBirdAction();

		return new Promise((resolve) => {
			SendBird.connect(userId).then(user => {
				this.createConnectionHandler();
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
		livesAnchor.onParty = () => {
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

						const livesPrivate = this._livesPrivateEvent();
						this.createHeartbeatHandler(livesPrivate);
						Spinner.remove();
					})
					.catch(error => {
						errorAlert(error.message);
						Spinner.remove();
					});
			});
		};

		// 一对一直播
		livesAnchor.onPrivate = () => {
			const {userHead, userName} = getUserInfo();
			Spinner.start(body);
			beginLive(this.liveRoomId, 1).then((data) => {
				if (!data) return Spinner.remove();
				this.livePrice = data.live_price;

				Spinner.remove();
				this.createHeartbeatHandler();

				let waitingEl,
					livesWaiting;
				const handler = ({channel, clientName, clientHead, clientSex, liveRoomId, livePrice}) => {
					return this._livesCallingEvent({channel, clientName, clientHead, clientSex}).then(() => {
						closeModal(waitingEl);
						this.stream.close();
						SendBirdAction.getInstance()
						    .sendChannelMessage({
						        channel: channel,
						        message: '',
						        type: 'agree',
						        data: {
						        	userSex: clientSex,
						        	live_room_id: liveRoomId,
						        	live_price: livePrice
						        }
						    });
						this.listWrapperEl.parentNode.removeChild(livesAnchor.element);
						this.groupChannel = channel;
						const livesPrivate = this._livesPartyEvent();

						this.VideoEl.removeChild(this.VideoEl.firstChild);

						this.stream = new AgoraStream(this.clientUid);

						this.stream.setVideoProfile('360p_4');
						this.stream.connect().then(() => {
							this.stream.play(this.options.localVideoId);

							this.client.publish(this.stream.stream);

							this.client.clientEmitter.on('stream-added', (evt) => {
								let stream = evt.stream;
								this.client.subscribe(stream);
							});

							// 该回调通知应用程序已接收远程音视频流
							this.client.clientEmitter.on('stream-subscribed', (evt) => {
							    let stream = evt.stream;
							    stream.play(this.options.videoId);
							});

							// 已删除远程音视频流，即对方调用了 Client.unpublish
							this.client.clientEmitter.on('stream-removed', (evt) => {
							    let stream = evt.stream;
							    this.client.unsubscribe(stream);
							    this.client.unpublish(this.stream.stream);
							    this.stream.close();

							    const callback = () => {
							    	Spinner.start(body);

							    	endLive(this.liveRoomId).then((data) => {
							    		clearInterval(this.heartbeatEvent);

							    		this.client.leave();
							    		Spinner.remove();

							    		return this._livesCountEvent({
							    				giftList: livesPrivate.ReceiveGiftList,
							    				userHead,
							    				userName
							    			});
							    	});
							    };
							    alert({
							    	title: `${LANG.LIVE_PREVIEW.Madal.QuitLive.Title}`,
							    	text: `${LANG.LIVE_PREVIEW.Madal.QuitLive.Prompt}`,
							    	button: `${LANG.LIVE_PREVIEW.Madal.QuitLive.Buttons}`,
							    	callback
							    });
							});

							this.client.clientEmitter.on('error', (err) => {
						    	console.log("Got error msg:", err.reason);
						  	});
						});
					}).catch((data) => {
						livesWaiting.ChatEvent();
						if (data) return false;
						SendBirdAction.getInstance()
						    .sendChannelMessage({
						        channel: channel,
						        message: '',
						        type: 'refuse',
						        data: ''
						    });
					});
				};
				const close = () => {
					Spinner.start(body);
					endLive(this.liveRoomId).then((data) => {
						if (!data) return Spinner.remove();
						clearInterval(this.heartbeatEvent);
						Spinner.remove();
						closeModal(waitingEl);
					});
				};
				livesWaiting = new LivesWaiting({
					handler,
					close,
					data: {
						userHead: userHead
					}
				});
				waitingEl = popup({
					element: livesWaiting.element,
					extraclass: 'fade',
					notPadding: true
				});
			});
		};
		this.listWrapperEl.parentNode.appendChild(livesAnchor.element);
	}

	// 一对多窗口
	_livesPrivateEvent() {
		const {userId, userHead, userName} = getUserInfo();

		const livesPrivate = new LivesContent({
			data: {
				userId: userId,
				AnchorInfo: {
					user_head: userHead,
					user_name: userName
				}
			},
			channel: this.openChannel,
			client: false,
			oneToMany: true
		});
		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);

			this.client.unpublish(this.stream.stream);
			this.stream.close();

			endLive(this.liveRoomId).then((data) => {
				clearInterval(this.heartbeatEvent);

				const leaveClient = this.client.leave();
				const SendBirdDis = SendBirdAction.getInstance().disconnect();

				Promise.all([leaveClient, SendBirdDis]).then((data) => {
					Spinner.remove();
					this._livesCountEvent({
						giftList: livesPrivate.ReceiveGiftList,
						userHead,
						userName
					});
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
			        type: 'chats'
			    });
		};

		// 发送开始收费直播消息
		livesPrivate.onGetChargeShows = (second) => {
			getLivePrice().then((priceList) => {
				priceList.forEach((priceItem, index) => {
					if (priceItem.live_type == 3) {
						SendBirdAction.getInstance()
	                        .sendChannelMessage({
	                            channel: this.openChannel,
	                            message: '',
	                            type: 'chargeTime',
	                            data: {
	                            	second: second,
	                            	price: priceItem.live_price
	                            }
	                        });
					}
		        });
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
				        data: '',
				        type: 'partyTime'
				    });
			});
		};

		this.listWrapperEl.appendChild(livesPrivate.element);

		return livesPrivate;
	}

	// 一对一窗口
	_livesPartyEvent() {
		const {userId, userHead, userName} = getUserInfo();

		const livesPrivate = new LivesContent({
			data: {
				userId: userId,
				AnchorInfo: {
					user_head: userHead,
					user_name: userName
				}
			},
			channel: this.groupChannel,
			client: false,
			oneToMany: false
		});
		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);

			this.client.unpublish(this.stream.stream);
			this.stream.close();

			endLive(this.liveRoomId).then((data) => {
				clearInterval(this.heartbeatEvent);

				const leaveClient = this.client.leave();
				const SendBirdDis = SendBirdAction.getInstance().disconnect();

				Promise.all([leaveClient, SendBirdDis]).then((data) => {
					Spinner.remove();
					this._livesCountEvent({
						giftList: livesPrivate.ReceiveGiftList,
						userHead,
						userName
					});
				});
			});
		};

		// 发送弹幕
		livesPrivate.onNews = (message) => {
			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.groupChannel,
			        message: message,
			        data: '',
			        type: 'chats'
			    });
		};

		this.listWrapperEl.appendChild(livesPrivate.element);

		return livesPrivate;
	}

	// 呼叫窗口
	_livesCallingEvent({channel, clientName, clientHead, clientSex}) {
		return new Promise((resolve, reject) => {
			let modalEl;
			const agree = () => {
				closeModal(modalEl);
				resolve();
			};
			const refuse = () => {
				closeModal(modalEl);
				reject(false);
			};
			const cancel = () => {
				closeModal(modalEl);
				reject(true);
			};
			const livesCalling = new LivesCallingAnchor({
				agree,
				refuse,
				cancel,
				channel,
				data: {
					userHead: clientHead,
					userName: clientName,
					userSex: clientSex
				}
			});
			modalEl = popup({
				element: livesCalling.element,
				extraclass: 'slider',
				notPadding: true,
				top: true
			});
		});
	}

	// 结算窗口
	_livesCountEvent({userHead, userName, giftList}) {
		let modalEl;
		const handler = () => {
			return anchorBalance();
		};
		const again = () => {
			closeModal(modalEl);
			return refreshURL();
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
				user_name: userName,
				gift_list: giftList
			}
		});
		modalEl = popup({
			element: livesCount.element,
			title: LANG.LIVE_PREVIEW.End_Live_Anchor.Title,
			notBack: true,
			notPadding: true
		});
	}

	// 心跳检测
	createHeartbeatHandler(livesPrivate = false) {
		// 心跳检测服务器连接
		this.heartbeatEvent = setInterval(() => {
            checkLiveRoom(this.liveRoomId, livesPrivate ? livesPrivate.memberCount : 0);
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