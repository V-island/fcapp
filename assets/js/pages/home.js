import Template from 'art-template/lib/template-web';
import { LivesCallingClient } from '../components/LivesContents';
import { CardLiveItem, CardLiveMore, CardVideoItem, CardVideoMore } from '../components/CardsItem';
import { closeModal, alert, popup } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
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
	showLiveList,
    videoClips,
    videoType,
    playVideo,
    getUserInfo,
    setUserInfo,
    checkLogin
} from '../api';

import {
    extend,
    jumpURL,
    addEvent,
    createDom,
    getData,
    setData,
    hasClass,
    addClass,
    toggleClass,
    removeClass,
    errorAlert
} from '../util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;

const INIT_INDEX = 2;

export default class Home extends EventEmitter {
	constructor(element, options) {
	    super();
	    this.data = {};
	    this.options = {
    		navsWrapper: '.navs-wrapper',
    		navsContent: 'navs-content',
    		navsItem: 'navs-item',
    		navsItemLine: 'navs-line',
    		navsDataIndex: 'index',
            slideWrapper: '.slide-wrapper',
            slideContent: 'slide-content',
            slideItem: 'slide-item',

            // banner
            bannerWrapper: '.banner',
            bannerContent: 'banner-box',
            bannerItem: 'banner-item',
            bannerPagination: '.banner-pagination',
            bannerPaginationBullet: 'item',

            // pages
            pagesNewClass: '.pages-new',
            pagesHotClass: '.pages-hot',
            pagesVideoClass: '.pages-video',

            sectionLiveClass: '.section-live',
            sectionVideoClass: '.section-video',

            boxLivesClass: 'box-lives',
            boxVideosClass: 'box-videos',

            cardLiveClass: 'card-live',

            // Tag
            tagsClass: '.tag',
            tagsLabelClass: 'tag-label',

            cardsPageIndex: 'page',
            tagsIndex: 'id',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		this._page = 1;
		this._number = 10;
		this.tagId = 0;

		let getvideoType = videoType();
		let getFreeVideoClips = videoClips(this._page, this._number, this.tagId, 1);
		let getVideoClips = videoClips(this._page, this._number, this.tagId, 2);
		let getShowLiveList = showLiveList();

		Promise.all([getvideoType, getVideoClips, getFreeVideoClips, getShowLiveList]).then((data) => {
			this.data.VideoType = data[0] ? data[0] : false;
			this.VideoList = data[1] ? data[1] : [];
			this.FreeVideoList = data[2] ? (data[2].length > 2 ? data[2].slice(0, 2) : data[2]) : [];
			this.LivesList = data[3] ? (data[3].length > 2 ? data[3].slice(0, 2) : data[3]) : [];

			this.HomeEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.HomeEl);
			this._init();
		});

		if (!checkLogin()) {
			this._createIMChannel();
		}
	}

	_init() {
		// pages lives
		this.boxLivesEl = this.HomeEl.getElementsByClassName(this.options.boxLivesClass)[0];

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
			this.boxLivesEl.append(liveItem.element);
		});
		if (this.LivesList.length > 1) {
			const liveMore = new CardLiveMore();
			this.boxLivesEl.append(liveMore.element);
		}

		// pages video
		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.boxVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxVideosClass)[0];

		this.tagsEl = this.HomeEl.querySelector(this.options.tagsClass);

		if (this.FreeVideoList.length > 0) {
			// header
			const videoMoreItem = new CardVideoMore({
				free: true
			});
			this.boxVideoEl.append(videoMoreItem.element);

			// content
			this.FreeVideoList.forEach((itemData, index) => {
				const videoItem = new CardVideoItem({
					data: itemData
				});
				this.boxVideoEl.append(videoItem.element);
			});
		}

		if (this.VideoList.length > 0) {
			// header
			const videoMoreItem = new CardVideoMore({
				free: false
			});
			this.boxVideoEl.append(videoMoreItem.element);

			// content
			this.VideoList.forEach((itemData, index) => {
				const videoItem = new CardVideoItem({
					data: itemData
				});
				this.boxVideoEl.append(videoItem.element);
			});
		}

		this._VideoPullLoad();
		this._bindEvent();

		gtag('event', 'look', {
		    'event_label': 'HOME',
		    'event_category': 'Browse',
		    'non_interaction': true
		});
	}

	_bindEvent() {
		// tags
		if (this.tagsEl) {
			this.tagsLabelEl = this.tagsEl.getElementsByClassName(this.options.tagsLabelClass);

			Array.prototype.slice.call(this.tagsLabelEl).forEach(tagsLabelEl => {
				addEvent(tagsLabelEl, 'click', () => {
					if (hasClass(tagsLabelEl, this.options.showClass)) {
						this.tagId = 0;
						toggleClass(tagsLabelEl, this.options.showClass);
					}else {
						this.tagId = getData(tagsLabelEl, this.options.tagsIndex);

						let tagsLabelActiveEl = this.tagsEl.getElementsByClassName(this.options.showClass)[0];
						if (tagsLabelActiveEl) {
							toggleClass(tagsLabelActiveEl, this.options.showClass);
						}

						toggleClass(tagsLabelEl, this.options.showClass);
					}
					Spinner.start(body);
					videoClips(1, 10, this.tagId, 1).then((freeVideoList) => {
						videoClips(1, 10, this.tagId, 2).then((videoList) => {
							if (!freeVideoList && !videoList) return Spinner.remove();

							this.boxVideoEl.innerHTML = '';

							if (freeVideoList) {
								// header
								const videoMoreItem = new CardVideoMore({
									free: true
								});
								this.boxVideoEl.append(videoMoreItem.element);

								// content
								freeVideoList.forEach((itemData, index) => {
									const videoItem = new CardVideoItem({
										data: itemData
									});
									this.boxVideoEl.append(videoItem.element);

									if (index > 2) return false;
								});
							}

							if (videoList) {
								// header
								const videoMoreItem = new CardVideoMore({
									free: false
								});
								this.boxVideoEl.append(videoMoreItem.element);

								// content
								videoList.forEach((itemData, index) => {
									const videoItem = new CardVideoItem({
										data: itemData
									});
									this.boxVideoEl.append(videoItem.element);
								});
							}
							setData(this.boxVideoEl, this.options.cardsPageIndex, 1);
							Spinner.remove();
						});
					});
				});
			});
		}
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

	static attachTo(element, options) {
	    return new Home(element, options);
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
				let getFreeVideo = videoClips(this._page, this._number, this.tagId, 1);
				let getVideoClips = videoClips(1, 10, this.tagId, 2);
				let getShowLiveList = showLiveList();

				Promise.all([getFreeVideo, getVideoClips, getShowLiveList]).then((data) => {
					const freeVideo = data[0] ? (data[0].length > 2 ? data[0].slice(0, 2) : data[0]) : [];
					const videoLIst = data[1] ? data[1] : [];
					const liveLIst = data[2] ? (data[2].length > 2 ? data[2].slice(0, 2) : data[2]) : [];

					this.boxLivesEl.innerText = '';
					this.boxVideoEl.innerText = '';

					if (freeVideo.length > 0) {
						// header
						const videoMoreItem = new CardVideoMore({
							free: true
						});
						this.boxVideoEl.append(videoMoreItem.element);

						// content
						freeVideo.forEach((itemData, index) => {
							const videoItem = new CardVideoItem({
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});
					}

					if (videoLIst.length > 0) {
						// header
						const videoMoreItem = new CardVideoMore({
							free: false
						});
						this.boxVideoEl.append(videoMoreItem.element);

						// content
						videoLIst.forEach((itemData, index) => {
							const videoItem = new CardVideoItem({
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});
					}

					if (liveLIst.length > 0) {
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
							this.boxLivesEl.append(liveItem.element);
						});

						if (liveLIst.length > 1) {
							const liveMore = new CardLiveMore();
							this.boxLivesEl.append(liveMore.element);
						}
					}

					setData(this.boxVideoEl, this.options.cardsPageIndex, 1);
					resolve(true);

				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.boxVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				videoClips(_page, this._number, this.tagId, 2).then((videoList) => {
					if (videoList) {
						// header
						if (_page == 1) {
							const videoMoreItem = new CardVideoMore({
								free: false
							});
							this.boxVideoEl.append(videoMoreItem.element);
						}

						// content
						videoList.forEach((itemData, index) => {
							const videoItem = new CardVideoItem({
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});

						setData(this.boxVideoEl, this.options.cardsPageIndex, _page);
					}
					resolve(true);
				});
			});
		};
	}
}