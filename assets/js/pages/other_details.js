import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { LivesCallingClient } from '../components/LivesContents';
import { closeModal, alert, popup } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import VideoPreview from '../videoPreview';
import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';

import {
	body,
    fcConfig
} from '../intro';
import {
    getLangConfig
} from '../lang';
import {
	follow,
	playVideo,
	getUserInfo,
	searchUserInfo,
    selVideoByUserId,
} from '../api';
import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    errorAlert,
    dateFormat,
    importTemplate,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class OtherDetails extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	slideWrapper: '.slide-wrapper',
	    	tabsItemClass: 'tab-item',

	    	pagesVideoClass: '.pages-video',
	    	cardVideoClass: '.card-video',
	    	boxCardsClass: '.box-cards',

	    	btnPrivateLetterClass: '.btn-private-letter',
	    	btnVideoChatClass: '.btn-video-chat',
	    	btnAddAttentionClass: 'btn-add-attention',
	    	iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            cardsPageIndex: 'page',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.otherDetailsFile = fcConfig.publicFile.other_details_item;
	    this.init(element);

	}

	init(element) {
		const { anchorId } = getVariableFromUrl();
		const {userId} = getUserInfo();

		this._page = 1;
		this._number = 10;
		this.anchorId = anchorId;
		const getUserDetail = searchUserInfo(anchorId);
		const getVideo = selVideoByUserId(anchorId, this._page, this._number);
		const getIMChannel = this._createIMChannel(userId);

		Promise.all([getUserDetail, getVideo, getIMChannel]).then((data) => {
			this.data.UserDetail = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;

			this.anchorInfo = data[0] ? data[0].anchor : {};

			this.OtherDetailsEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.OtherDetailsEl);
			this._init();

			this.info = data[0] ? data[0] : false;
		});

		this.tpl = {};

		importTemplate(this.otherDetailsFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.btnAddAttentionEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
		this.pagesVideoEl = this.OtherDetailsEl.querySelector(this.options.pagesVideoClass);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		this.btnPrivateEl = this.pagesVideoEl.querySelector(this.options.btnPrivateLetterClass);
		this.btnVideoChatEl = this.pagesVideoEl.querySelector(this.options.btnVideoChatClass);

		this._SlidePullLoad();
		this._VideoPullLoad();
		this._bindEvent();
		this._listEvent();
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

	_bindEvent() {
		// 加关注
		addEvent(this.btnAddAttentionEl, 'click', () => {
		    let index = getData(this.btnAddAttentionEl, 'id'),
		        status;

		    if (hasClass(this.btnAddAttentionEl, this.options.iconAttentionClass)) {
		        removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        status = 1;
		    }else {
		        removeClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        status = 2;
		    }
		    follow(index, status);
		});

		// 聊天
		addEvent(this.btnPrivateEl, 'click', () => {
		    SendBirdAction.getInstance()
		    	.createChannelWithUserIds(this.anchorId)
		    	.then(channel => {
		    		MessageChat.getInstance().render(channel.url, false);
		    	})
		    	.catch(error => {
		    		errorAlert(error.message);
		    	});
		});

		// 加入直播间
		addEvent(this.btnVideoChatEl, 'click', () => {
		    let anchorId = getData(ItemEl, 'id');
		    let price = getData(ItemEl, 'price');
		    let roomId = getData(ItemEl, 'roomId');
		    let roomType = getData(ItemEl, 'roomType');
		    let status = getData(ItemEl, 'status');
		    let clientName = getData(ItemEl, 'name');
		    let clientHead = getData(ItemEl, 'head');

		    let { userPackage } = (roomType == '1' || roomType == '3') ? getUserInfo() : {userPackage: 0};

		    switch (roomType) {
		    	case '1':
		    		if (status != '3') return false;
		    		if (userPackage >= parseInt(price)) {
		    			return this._livesCalling({clientName, clientHead, anchorId, roomId, roomType, price});
		    		}
		    		return alert({
		    			title: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Title}`,
		    			text: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Text}`,
		    			button: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Buttons}`,
		    			callback: () => {
		    				return location.href = jumpURL('#/user/account');
		    			}
		    		});
		    		break;
		    	case '2':
		    		location.href = jumpURL(`#/live?anchorid=${anchorId}&type=${roomType}&price=${price}`);
		    		break;
		    	case '3':
		    		if (userPackage >= parseInt(price)) {
		    			return alert({
		    				title: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Title}`,
		    				text: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Text}`,
		    				button: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Buttons}`,
		    				callback: () => {
		    					return location.href = jumpURL(`#/live?anchorid=${anchorId}&type=${roomType}&price=${price}`);
		    				}
		    			});
		    		}
		    		return alert({
		    			title: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Title}`,
		    			text: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Text}`,
		    			button: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Buttons}`,
		    			callback: () => {
		    				return location.href = jumpURL('#/user/account');
		    			}
		    		});
		    		break;
		    }
		});
	}

	_livesCalling({clientName, clientHead, anchorId, roomId, roomType, price}) {
		const { userSex } = getUserInfo();
		SendBirdAction.getInstance()
			.createChannelWithUserIds(anchorId)
			.then(groupChannel => {
				let modalEl;
				const pass = () => {
					closeModal(modalEl);
					return location.href = jumpURL(`#/live?anchorid=${anchorId}&type=${roomType}&price=${price}`);
				};
				const redial = ({anchor_id, room_id, room_type, room_price}) => {
					closeModal(modalEl);

					switch (room_type) {
						case '1':
							this._livesCalling({
								anchorId: anchor_id ? anchor_id : anchorId,
								roomId: room_id ? room_id : roomId,
								roomType: room_type ? room_type : roomType,
								price: room_price ? room_price : price
							});
							break;
						default:
							location.href = jumpURL(`#/live?anchorid=${anchor_id}&type=${room_type}&price=${room_price}`);
							break;
					}
				};
				const close = () => {
					closeModal(modalEl);
				};
				const cancel = () => {
					closeModal(modalEl);
					SendBirdAction.getInstance()
					    .sendChannelMessage({
					        channel: groupChannel,
					        message: '',
					        data: '',
					        type: 'cancel'
					    });
				};
				const callback = () => {
					return showLiveList();
				};
				const livesCalling = new LivesCallingClient({
					pass,
					redial,
					close,
					cancel,
					callback,
					channel: groupChannel,
					data: {
						userHead: clientHead,
						userName: clientName
					}
				});
				modalEl = popup({
					element: livesCalling.element,
					notPadding: true
				});

				SendBirdAction.getInstance()
				    .sendChannelMessage({
				        channel: groupChannel,
				        message: '',
				        type: 'invite',
				        data: {
				        	userSex: userSex,
				        	live_room_id: roomId,
				        	live_price: price
				        }
				    });

			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	_listEvent() {
		this.cardVideoEl = this.OtherDetailsEl.querySelectorAll(this.options.cardVideoClass);
		// video list
		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			this._cardVideoEvent(cardVideoItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, 'userInfo'));
			Spinner.start(body);
			playVideo(info.id).then((data) => {
				if (!data) return Spinner.remove();
				extend(info, data);
				let _videoPreview = new VideoPreview(ItemEl, info);
				_videoPreview.on('videoPreview.start', () => {
                    Spinner.remove();
                });
			});
		});
	}

	// Slide 滑块
	_SlidePullLoad() {
		const slideWrapperEl = this.OtherDetailsEl.querySelector(this.options.slideWrapper);
		const tabsItemEl = this.OtherDetailsEl.getElementsByClassName(this.options.tabsItemClass);

		const SlidePullLoad = new PullLoad(slideWrapperEl, {
			startX: 1,
			scrollX: true,
			scrollY: false,
			momentum: false,
			probeType: 2,
			snap: {
				loop: false,
				threshold: 0.3,
				easing:{
					style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					fn: function(t) {
						return t * (2 - t)
					}
				}
			},
			bounce: false
		}, {
			pullingModule: false,
			slideModule: true
		});
		SlidePullLoad.onScrollEnd = () => {
			let slideIndex = SlidePullLoad.getCurrentPage().pageX;
			if (hasClass(tabsItemEl[slideIndex], this.options.showClass)) return;

			Array.prototype.slice.call(tabsItemEl).forEach(itemEl => {
				toggleClass(itemEl, this.options.showClass);
			});
		};
		Array.prototype.slice.call(tabsItemEl).forEach((itemEl, index) => {
			addEvent(itemEl, 'click', () => {
	            if (hasClass(itemEl, this.options.showClass)) return;

	            SlidePullLoad.goToPage(index, 0);
	        });
		});
		SlidePullLoad.goToPage(1, 0);
	}

	// Video 模块
	_VideoPullLoad() {
		const VideoPullLoad = new PullLoad(this.pagesVideoEl, {
			probeType: 1,
			startY: 0,
			scrollY: true,
			scrollX: false,
			click: true,
			tap: true,
			bounce: true,
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: 0
			}
		});

		// 下拉刷新
		VideoPullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				selVideoByUserId(this.info.user_id, this._page, this._number).then((data) => {
					if (!data) return;

					this.cardsVideoEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.HeaderVideos = true;
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
					});

					setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
					this._listEvent();
					resolve(true);
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				selVideoByUserId(this.info.user_id, _page, this._number).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.HeaderVideos = true;

							let element = createDom(Template.render(this.tpl.list_videos_item, this.data));
							this._cardVideoEvent(element);
							this.cardsVideoEl.append(element);
						});
						setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
					}
					resolve(true);
				});
			});
		};
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
	    return new OtherDetails(element, options);
	}
}