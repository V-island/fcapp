import Template from 'art-template/lib/template-web';
import { LivesCallingClient } from '../components/LivesContents';
import { CardLiveItem } from '../components/CardsItem';
import { closeModal, alert, popup } from '../components/Modal';
import { PullLoad } from '../components/PullLoad';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import {
	body,
	fcConfig
} from '../intro';
import {
    getLangConfig
} from '../lang';

import {
	getUserInfo,
    showLiveList
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    importTemplate,
    getData,
    setData,
    hasClass,
    toggleClass
} from '../util';

const LANG = getLangConfig();

export default class LiveList extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	cardsPageIndex: 'page'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		this._page = 1;
		this._number = 10;

		let getShowLiveList = showLiveList();
		let createIMChannel = this._createIMChannel();

		Promise.all([getShowLiveList, createIMChannel]).then((data) => {
			this.data.LiveList = data[0] ? data[0] : false;
			this.LivesList = data[0] ? data[0] : [];
			this.LiveListEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.LiveListEl);
			this._init();
		});
	}

	_init() {
		this.pagesLiveEl = this.LiveListEl.querySelector(this.options.userWrapper);
		this.cardsLiveEl = this.pagesLiveEl.querySelector(this.options.boxCardsClass);

		this._LivePullLoad();
		this._bindEvent();
	}

	_bindEvent() {
		this.LivesList.forEach((itemData, index) => {
			const blurry = this.LivesList.length > 1 ? false : true;
			const handler = ({clientName, clientHead, anchorId, roomId, roomType, price}) => {
				this._livesCalling({clientName, clientHead, anchorId, roomId, roomType, price})
			};
			const liveItem = new CardLiveItem({
				handler,
				blurry,
				data: itemData
			});
			this.cardsLiveEl.append(liveItem.element);
		});
	}

	// 链接IM服务
	_createIMChannel() {
		const {userId} = getUserInfo();
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
								anchorId: anchor_id,
								roomId: room_id,
								roomType: room_type,
								price: room_price
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
						userName: clientName,
						anchorId: anchorId,
						roomId: roomId,
						roomType: roomType,
						price: price
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

	static attachTo(element, options) {
	    return new LiveList(element, options);
	}

	_LivePullLoad() {
		const LivePullLoad = new PullLoad(this.pagesLiveEl, {
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
		LivePullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				showLiveList(this._page, this._number).then((liveLIst) => {
					if (!liveLIst) return resolve(true);;

					this.cardsLiveEl.innerHTML = '';

					liveLIst.forEach((itemData, index) => {
						const blurry = liveLIst.length > 1 ? false : true;
						const handler = ({clientName, clientHead, anchorId, roomId, roomType, price}) => {
							this._livesCalling({clientName, clientHead, anchorId, roomId, roomType, price})
						};
						const liveItem = new CardLiveItem({
							handler,
							blurry,
							data: itemData
						});
						this.cardsLiveEl.append(liveItem.element);
					});

					setData(this.cardsLiveEl, this.options.cardsPageIndex, 1);
					resolve(true);
				});
			});
		};

		// 上拉加载
		LivePullLoad.onPullingUp = () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				showLiveList(_page, this._number).then((liveLIst) => {
					if (!liveLIst) return resolve(true);;

					liveLIst.forEach((itemData, index) => {
						const handler = ({clientName, clientHead, anchorId, roomId, roomType, price}) => {
							this._livesCalling({clientName, clientHead, anchorId, roomId, roomType, price})
						};
						const liveItem = new CardLiveItem({
							handler,
							data: itemData,
							blurry: liveLIst.length > 1 ? false : true
						});
						this.cardsLiveEl.append(liveItem.element);
					});

					setData(this.cardsLiveEl, this.options.cardsPageIndex, _page);
					resolve(true);
				});
			});
		};
	}
}