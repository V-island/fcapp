import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import VideoPreview from '../videoPreview';
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
    setUserInfo
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
    importTemplate
} from '../util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;
const modal = new Modal();

const liveDom = [{
	everyday_img: "https://usa-imges.s3.us-west-1.amazonaws.com/1541403877342.jpg",
	fans_number: 1,
	live_price: 2,
	live_room_id: 64521560,
	live_room_type: 2,
	user_head: "https://usa-imges.s3.us-west-1.amazonaws.com/1536633775311.jpg",
	user_id: 12,
	user_name: "Geraldine"
}];

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

            dataUserPackage: 'userPackage',
            cardsPageIndex: 'page',
            tagsIndex: 'id',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.homeFile = fcConfig.publicFile.home_items;
	    this.init(element);
	}

	init(element) {
		this._page = 1;
		this._number = 10;
		this.tagId = 0;

		let getFreeVideoClips = videoClips(this._page, this._number, this.tagId, 1);
		let getVideoClips = videoClips(this._page, this._number, this.tagId, 2);
		let getvideoType = videoType();
		let getShowLiveList = showLiveList();

		Promise.all([getFreeVideoClips, getVideoClips, getvideoType, getShowLiveList]).then((data) => {
			// this.data.FreeVideoList = data[0] ? (data[0].length > 2 ? data[0].slice(0, 2) : data[0]) : false;
			this.data.FreeVideoList = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;
			this.data.VideoType = data[2] ? data[2] : false;
			this.data.LivesList = data[3] ? data[3] : liveDom;

			this.HomeEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.HomeEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.homeFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		// pages lives
		this.boxLivesEl = this.HomeEl.getElementsByClassName(this.options.boxLivesClass)[0];
		this.cardsLivesEl = this.boxLivesEl.getElementsByClassName(this.options.cardLiveClass);

		// pages video
		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.boxVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxVideosClass)[0];

		this.tagsEl = this.HomeEl.querySelector(this.options.tagsClass);

		this._VideoPullLoad();
		this._bindEvent();
		this._listEvent();

		gtag('event', 'look', {
		    'event_label': 'HOME',
		    'event_category': 'Browse',
		    'non_interaction': true
		});
	}

	_bindEvent() {
		if (this.cardsLivesEl.length > 0) {
	    	Array.prototype.slice.call(this.cardsLivesEl).forEach(ItemEl => {
	    		addEvent(ItemEl, 'click', () => {
	    			let id = getData(ItemEl, 'id');
	    			let type = getData(ItemEl, 'roomType');
	    			let price = getData(ItemEl, 'price');
	    			return location.href = jumpURL(`#/live?anchorid=${id}&type=${type}&price=${type}`);
	            });
	    	});
		}

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
					videoClips(1, 10, this.tagId, 1).then((data) => {
						videoClips(1, 10, this.tagId, 2).then((_data) => {
							if (!data && !_data) return Spinner.remove();

							this.boxVideoEl.innerHTML = '';

							// free
							if (data) {
								this.boxVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));
								// data = data.length > 2 ? data.slice(0, 2) : data;
								data.forEach((itemData, index) => {
									this.data.VideosList = itemData;
									this.data.NotFreeVideos = false;
									this.boxVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
								});
							}

							if (_data) {
								this.boxVideoEl.append(createDom(Template.render(this.tpl.videos_header, this.data)));

								_data.forEach((itemData, index) => {
									this.data.VideosList = itemData;
									this.data.NotFreeVideos = true;
									this.boxVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
								});
							}
							setData(this.boxVideoEl, this.options.cardsPageIndex, 1);
							this._listEvent();
							Spinner.remove();
						});
					});
				});
			});
		}
	}

	static attachTo(element, options) {
	    return new Home(element, options);
	}

	_listEvent() {
		this.cardVideoEl = this.HomeEl.querySelectorAll('.card-video');

		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			this._cardVideoEvent(cardVideoItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, 'userInfo'));
			let { userPackage } = getUserInfo(this.options.dataUserPackage);

			if (parseInt(userPackage / info.price) < 1) {
			    return modal.alert(MADAL.NotCoins.Text, MADAL.NotCoins.Title, () => {
			        return location.href = jumpURL('#/user');
			    }, MADAL.NotCoins.ButtonsText);
			}

			Spinner.start(body);
			playVideo(info.id).then((data) => {
				if (!data) return Spinner.remove();
				extend(info, data);
				setUserInfo(this.options.dataUserPackage, userPackage - info.price);
				let _videoPreview = new VideoPreview(ItemEl, info);
				_videoPreview.on('videoPreview.start', () => {
                    Spinner.remove();
                });
			});
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
				videoClips(this._page, this._number, this.tagId, 1).then((data) => {
					videoClips(1, 10, this.tagId, 2).then((_data) => {
						if (!data && !_data) return resolve(true);

						this.boxVideoEl.innerHTML = '';

						// free
						if (data) {
							this.boxVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));
							// data = data.length > 2 ? data.slice(0, 2) : data;
							data.forEach((itemData, index) => {
								this.data.VideosList = itemData;
								this.data.NotFreeVideos = false;
								this.boxVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
							});
						}

						if (_data) {
							this.boxVideoEl.append(createDom(Template.render(this.tpl.videos_header, this.data)));

							_data.forEach((itemData, index) => {
								this.data.VideosList = itemData;
								this.data.NotFreeVideos = true;
								this.boxVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
							});
						}
						setData(this.boxVideoEl, this.options.cardsPageIndex, 1);
						this._listEvent();
						resolve(true);
					});
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.boxVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				videoClips(_page, this._number, this.tagId, 1).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.NotFreeVideos = false;
							let element = createDom(Template.render(this.tpl.list_videos, this.data));
							this._cardVideoEvent(element);
							this.boxVideoEl.append(element);
						});
						setData(this.boxVideoEl, this.options.cardsPageIndex, _page);
					}
					resolve(true);
				});
				// videoClips(_page, this._number, this.tagId, 2).then((data) => {
				// 	if (data) {
				// 		data.forEach((itemData, index) => {
				// 			this.data.VideosList = itemData;
							// this.data.NotFreeVideos = true;
				// 			let element = createDom(Template.render(this.tpl.list_videos, this.data));
				// 			this._cardVideoEvent(element);
				// 			this.boxVideoEl.append(element);
				// 		});
				// 		setData(this.boxVideoEl, this.options.cardsPageIndex, _page);
				// 	}
				// 	this.pagesVideoSwiper.finishPullUp();
				// 	this.pagesVideoSwiper.refresh();
				// });
			});
		};
	}
}