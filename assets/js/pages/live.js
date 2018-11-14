import { LivesContent } from '../components/LivesContents';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';
import AgoraClient from '../AgoraClient';
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
	    	videoId: 'video'
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
		this._bindEvent();
	}

	_bindEvent() {
		const Client = new AgoraClient();

		Client.connect().then(() => {
			Client.join(`${this.liveRoomId}`, this.Tourist ? null : this.userId).then((uid) => {
				// 该回调通知应用程序远程音视频流已添加
				Client.clientEmitter.on('stream-added', (evt) => {
					let stream = evt.stream;
					Client.subscribe(stream);
				});

				// 该回调通知应用程序已接收远程音视频流
				Client.clientEmitter.on('stream-subscribed', (evt) => {
				    let stream = evt.stream;
				    stream.play(this.options.videoId);
				    removeClass(this.listWrapperEl, this.options.funzzyShowClass);
				});

				// 已删除远程音视频流，即对方调用了 Client.unpublish
				Client.clientEmitter.on('stream-removed', (evt) => {
				    let stream = evt.stream;
				    Client.unsubscribe(stream);
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
					entryRoom(this.liveRoomId, this.liveRoomType, this.livePrice).then(() => {
						const { userPackage } = getUserInfo();
						this.userPackage = userPackage;

						this._livesEvent();
						this.createHeartbeatHandler();
					});
				}

				this.createConnectionHandler();
			})
			.catch(error => {
				errorAlert(error.message);
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

	// 直播
	_livesEvent() {
		const livesPrivate = new LivesContent({
			data: this.data,
			channel: this.openChannel,
			client: true
		});

		// 关闭直播
		livesPrivate.onClose = () => {
			Spinner.start(body);
			leaveRoom(this.liveRoomId, this.liveRoomType).then((data) => {
				if (!data) return Spinner.remove();

				clearInterval(this.heartbeatEvent);

				Spinner.remove();
				return location.href = jumpURL('#/home');

				// const SendBirdExit = SendBirdAction.getInstance().exit(this.iMChannel);
				// const SendBirdDis = SendBirdAction.getInstance().disconnect();

				// Promise.all([SendBirdExit, SendBirdDis]).then((data) => {
				// 	Spinner.remove();
				// 	return location.href = jumpURL('#/home');
				// });
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

	// 直播预览
	_livesPreviewEvent() {
		const livesPrivate = new LivesContent({
			data: this.data,
			channel: this.openChannel,
			client: true
		});

		addEvent(livesPrivate.element, 'click', () => {
		    if (this.onLoves) this.onLoves();
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
						if (!data) return Spinner.remove();

						clearInterval(this.heartbeatEvent);

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