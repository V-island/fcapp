import { LivesContent } from '../components/LivesContents';
import { closeModal, alert } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';
import AgoraClient from '../AgoraClient';
import AgoraStream from '../AgoraStream';
import {
	body
} from '../intro';
import {
    getLangConfig
} from '../lang';
import {
	follow,
	getUserId,
	setUserInfo,
	getUserInfo,
	anchorInfo,
	findAllgifts,
	entryRoom,
	leaveRoom,
	giveGift,
	checkClient
} from '../api';
import {
	jumpURL,
    extend,
    addEvent,
    createDom,
    errorAlert,
    addClass,
    hasClass,
    removeClass,
    getClientId,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

export default class Live extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	listWrapperClass: '.lives-wrapper',
	    	listVideoClass: '.lives-video',
	    	funzzyShowClass: 'fuzzy-show',
	    	videoId: 'video',
	    	localVideoId: 'user-video'
        };

	    extend(this.options, options);

	    this.Tourist = false;
	    this.chargeLive = false;
	    this.getLoves = false;

	    this.init(element);
	}

	init(element) {
		const { anchorid, type, price } = getVariableFromUrl();

		let userId = getUserId();

		if (!userId) {
			this.Tourist = true;
			userId = getClientId();
		}

		this.userId = userId;
		this.anchorId = anchorid;
		this.liveRoomType = type;
		this.livePrice = price;

		const getAnchorInfo = anchorInfo(anchorid, this.Tourist);
		const getfindAllgifts = findAllgifts();
		const getIMChannel = this._createIMChannel(userId);

		Promise.all([getAnchorInfo, getfindAllgifts, getIMChannel]).then((data) => {
			this.data.AnchorInfo = data[0] ? data[0] : false;
			this.data.AllGiftList = data[1] ? data[1] : false;
			this.data.livePrice = this.livePrice;
			this.data.userId = this.userId;
			this.liveRoomId = this.data.AnchorInfo.live_room_id;
			this.iMChannel = this.data.AnchorInfo.im_channel;

			this.LiveEl = createDom(element);
			this.trigger('pageLoadStart', this.LiveEl);
			this._init();
		});
	}

	_init() {
		this.listWrapperEl = this.LiveEl.querySelector(this.options.listWrapperClass);
		this.listVideoEl = this.listWrapperEl.querySelector(this.options.listVideoClass);
		this.VideoEl = this.listVideoEl.querySelector(`#${this.options.videoId}`);

		this.listVideoEl.style.backgroundImage = `url(${this.data.AnchorInfo.everyday_img})`;
		addClass(this.listWrapperEl, this.options.funzzyShowClass);

		switch (this.liveRoomType) {
			case '1':
				if (this.Tourist) return location.href = jumpURL('#/home');
				this._bindPrivateEvent();
				break;
			default:
				this._bindPartyEvent();
				break;
		}
	}

	// 一对多事件
	_bindPartyEvent() {
		this.client = new AgoraClient();

		this.client.connect().then(() => {
			this.client.join(`${this.liveRoomId}`, this.Tourist ? null : this.userId).then((uid) => {
				// 该回调通知应用程序远程音视频流已添加
				this.client.clientEmitter.on('stream-added', (evt) => {
					let stream = evt.stream;
					this.client.subscribe(stream);
				});

				// 该回调通知应用程序已接收远程音视频流
				this.client.clientEmitter.on('stream-subscribed', (evt) => {
				    let stream = evt.stream;
				    stream.play(this.options.videoId);
				    removeClass(this.listWrapperEl, this.options.funzzyShowClass);
				});

				// 已删除远程音视频流，即对方调用了 Client.unpublish
				this.client.clientEmitter.on('stream-removed', (evt) => {
				    let stream = evt.stream;
				    this.client.unsubscribe(stream);
				    addClass(this.listWrapperEl, this.options.funzzyShowClass);

				    this.VideoEl.removeChild(this.VideoEl.firstChild);
				});
			});
		});

		SendBirdAction.getInstance()
			.enter(this.iMChannel)
			.then(openChannel => {
				this.openChannel = openChannel;

				if (this.Tourist) {
					this._livesPreviewEvent();
				}else {
					entryRoom(this.liveRoomId, this.liveRoomType, this.livePrice).then((data) => {
						if (!data) return false;
						const { userPackage } = getUserInfo();
						this.userPackage = userPackage;

						this._livesPartyEvent();
						this.createHeartbeatHandler();
					});
				}

				this.createConnectionHandler();
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 一对一事件
	_bindPrivateEvent() {
		this.client = new AgoraClient();

		this.client.connect().then(() => {
			this.client.join(`${this.liveRoomId}`, this.userId).then((uid) => {
				this.stream = new AgoraStream(uid);
				this.stream.setVideoProfile('360p_4');

				SendBirdAction.getInstance()
					.createChannelWithUserIds(this.anchorId)
					.then(groupChannel => {
						this.groupChannel = groupChannel;

						// 用户进入直播间API
						entryRoom(this.liveRoomId, this.liveRoomType, this.livePrice).then((data) => {
							if (!data) return false;

							const { userPackage } = getUserInfo();
							this.userPackage = userPackage;
							this.chargeLive = true;
							// this.createHeartbeatHandler();

							const livesPrivate =this._livesPrivateEvent();

							this.stream.connect().then(() => {
								this.stream.play(this.options.localVideoId);
								this.client.publish(this.stream.stream);
							});
						});

						this.createConnectionHandler();
					})
					.catch(error => {
						errorAlert(error.message);
					});

				// 该回调通知应用程序远程音视频流已添加
				this.client.clientEmitter.on('stream-added', (evt) => {
					let stream = evt.stream;
					this.client.subscribe(stream);
				});

				// 该回调通知应用程序已接收远程音视频流
				this.client.clientEmitter.on('stream-subscribed', (evt) => {
				    let stream = evt.stream;
				    stream.play(this.options.videoId);
				    removeClass(this.listWrapperEl, this.options.funzzyShowClass);
				});

				// 已删除远程音视频流，即对方调用了 Client.unpublish
				this.client.clientEmitter.on('stream-removed', (evt) => {
				    let stream = evt.stream;
				    this.client.unsubscribe(stream);
				    this.client.unpublish(this.stream.stream);
				    this.stream.close();

				    addClass(this.listWrapperEl, this.options.funzzyShowClass);
				    this.VideoEl.removeChild(this.VideoEl.firstChild);

				    const callback = () => {
				    	Spinner.start(body);
				    	leaveRoom(this.liveRoomId, this.liveRoomType).then((data) => {
				    		clearInterval(this.heartbeatEvent);

				    		this.client.leave();
				    		Spinner.remove();
				    		return location.href = jumpURL('#/home');
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

	// 一对多窗口
	_livesPartyEvent() {
		const livesPrivate = new LivesContent({
			data: this.data,
			channel: this.openChannel,
			client: true,
			oneToMany: true
		});

		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);
			leaveRoom(this.liveRoomId, this.liveRoomType).then((data) => {
				clearInterval(this.heartbeatEvent);

				this.client.leave();
				SendBirdAction.getInstance().exit(this.iMChannel);
				SendBirdAction.getInstance().disconnect();

				Spinner.remove();
				return location.href = jumpURL('#/home');
			});
		};

		// 举报
		livesPrivate.onReport = (id, value) => {

		};

		// 拉黑
		livesPrivate.onBlack = () => {

		};

		// 加标签
		livesPrivate.onAddTag = (id, value) => {

		};

		// 加好友
		livesPrivate.onFavorite = (status) => {
			follow(this.anchorId, status);
		};

		// 私信
		livesPrivate.onMessage = () => {
			SendBirdAction.getInstance()
				.createChannelWithUserIds(this.anchorId)
				.then(channel => {
					MessageChat.getInstance().render(channel.url, false);
				})
				.catch(error => {
					errorAlert(error.message);
				});
		};

		// 发送弹幕
		livesPrivate.onNews = (message) => {
			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.openChannel,
			        message: message,
			        type: 'chats',
			        data: ''
			    });
		};

		// 点赞
		livesPrivate.onLoves = () => {
			if (this.getLoves) return false;

			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.openChannel,
			        message: '',
			        data: '',
			        type: 'loves'
			    });
			this.getLoves = true;
		};

		// 发送礼物
		livesPrivate.onGift = (id, price, name, imgUrl, amount) => {
			const getGiftEvent = ({name, imgUrl, amount}) => {
				SendBirdAction.getInstance()
				    .sendChannelMessage({
				        channel: this.openChannel,
				        message: '',
				        type: 'gifts',
				        data: {
				        	giftName: name,
				        	giftImgURL: imgUrl,
				        	giftAmount: amount
				        }
				    });
			};
			if (price > 0) {
				giveGift(this.liveRoomId, id, amount, 1).then((data) => {
					if (!data) return;

					this.userPackage = parseInt(data);
					setUserInfo('userPackage', parseInt(data));

					getGiftEvent({name, imgUrl, amount});
				});
			}else {
				getGiftEvent({name, imgUrl, amount});
			}
		};

		// 充值
		livesPrivate.onRecharge = (element) => {
			Pay.attachTo(element);
		};

		// 开始收费直播
		livesPrivate.onChargeShows = () => {
			this.chargeLive = true;
		};

		// 结束收费直播
		livesPrivate.onPartyShows = () => {
			this.chargeLive = false;
		};

		this.listWrapperEl.appendChild(livesPrivate.element);
	}

	// 一对一窗口
	_livesPrivateEvent() {
		const livesPrivate = new LivesContent({
			data: this.data,
			channel: this.groupChannel,
			client: true,
			oneToMany: false
		});

		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);

			this.client.unpublish(this.stream.stream);
			this.stream.close();

			leaveRoom(this.liveRoomId, this.liveRoomType).then((data) => {
				clearInterval(this.heartbeatEvent);

				this.client.leave();
				Spinner.remove();
				return location.href = jumpURL('#/home');
			});
		};

		// 举报
		livesPrivate.onReport = (id, value) => {

		};

		// 拉黑
		livesPrivate.onBlack = () => {

		};

		// 加标签
		livesPrivate.onAddTag = (id, value) => {

		};

		// 加好友
		livesPrivate.onFavorite = (status) => {
			follow(this.anchorId, status);
		};

		// 私信
		livesPrivate.onMessage = () => {
			SendBirdAction.getInstance()
				.createChannelWithUserIds(this.anchorId)
				.then(channel => {
					MessageChat.getInstance().render(channel.url, false);
				})
				.catch(error => {
					errorAlert(error.message);
				});
		};

		// 发送弹幕
		livesPrivate.onNews = (message) => {
			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.groupChannel,
			        message: message,
			        type: 'chats',
			        data: ''
			    });
		};

		// 点赞
		livesPrivate.onLoves = () => {
			if (this.getLoves) return false;

			SendBirdAction.getInstance()
			    .sendChannelMessage({
			        channel: this.groupChannel,
			        message: '',
			        data: '',
			        type: 'loves'
			    });
			this.getLoves = true;
		};

		// 发送礼物
		livesPrivate.onGift = (id, price, name, imgUrl, amount) => {
			const getGiftEvent = ({name, imgUrl, amount}) => {
				SendBirdAction.getInstance()
				    .sendChannelMessage({
				        channel: this.groupChannel,
				        message: '',
				        type: 'gifts',
				        data: {
				        	giftName: name,
				        	giftImgURL: imgUrl,
				        	giftAmount: amount
				        }
				    });
			};
			if (price > 0) {
				giveGift(this.liveRoomId, id, amount, 1).then((data) => {
					if (!data) return;

					this.userPackage = parseInt(data);
					setUserInfo('userPackage', parseInt(data));

					getGiftEvent({name, imgUrl, amount});
				});
			}else {
				getGiftEvent({name, imgUrl, amount});
			}
		};

		// 充值
		livesPrivate.onRecharge = (element) => {
			Pay.attachTo(element);
		};

		this.listWrapperEl.appendChild(livesPrivate.element);

		return livesPrivate;
	}

	// 直播预览
	_livesPreviewEvent() {
		const livesPrivate = new LivesContent({
			data: this.data,
			channel: this.openChannel,
			client: true,
			oneToMany: true
		});

		addEvent(livesPrivate.element, 'click', () => {
		    return location.href = jumpURL('#/login/mobile');
		});

		this.listWrapperEl.appendChild(livesPrivate.element);
	}

	createHeartbeatHandler() {

		// 心跳检测服务器连接
		this.heartbeatEvent = setInterval(() => {
			if (this.chargeLive) {
				if (this.userPackage <= 0) {
					Spinner.start(body);
					leaveRoom(this.liveRoomId, this.liveRoomType).then((data) => {
						clearInterval(this.heartbeatEvent);

						this.client.leave();

						Spinner.remove();
						return location.href = jumpURL('#/home');
					});
				}

				this.userPackage = this.userPackage - parseInt(this.livePrice);
				setUserInfo('userPackage', this.userPackage);
			}

            checkClient(this.liveRoomId);
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
	    return new Live(element, options);
	}
}