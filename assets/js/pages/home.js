import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
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
            bannerWrapper: '.banner',
            bannerContent: 'banner-box',
            bannerItem: 'banner-item',
            bannerPagination: '.banner-pagination',
            bannerPaginationBullet: 'item',
            pagesNewClass: '.pages-new',
            pagesHotClass: '.pages-hot',
            pagesVideoClass: '.pages-video',
            pagesContentClass: '.pages-contents',
            boxCardsClass: 'box-cards',
            tagsClass: '.tag',
            tagsLabelClass: 'tag-label',
            pulldownClass: '.pulldown-wrapper',
            pullupClass: '.pullup-wrapper',
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

		Promise.all([getFreeVideoClips, getVideoClips, getvideoType]).then((data) => {
			// this.data.FreeVideoList = data[0] ? (data[0].length > 2 ? data[0].slice(0, 2) : data[0]) : false;
			this.data.FreeVideoList = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;
			this.data.VideoType = data[2] ? data[2] : false;
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
		// pages
		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.contentsVideoEl = this.pagesVideoEl.querySelector(this.options.pagesContentClass);
		this.cardsVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxCardsClass)[0];
		this.contentsVideoEl.style.minHeight = `${this.pagesVideoEl.offsetHeight + 1}px`;

		this.tagsEl = this.HomeEl.querySelector(this.options.tagsClass);

		this.pullDownEl = this.HomeEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.HomeEl.querySelector(this.options.pullupClass);

		this._pagesVideo();
		this._bindEvent();
		this._listEvent();

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
					videoClips(1, 10, this.tagId, 1).then((data) => {
						videoClips(1, 10, this.tagId, 2).then((_data) => {
							if (!data && !_data) return Spinner.remove();

							this.cardsVideoEl.innerHTML = '';

							// free
							if (data) {
								this.cardsVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));
								// data = data.length > 2 ? data.slice(0, 2) : data;
								data.forEach((itemData, index) => {
									this.data.VideosList = itemData;
									this.data.NotFreeVideos = false;
									this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
								});
							}

							if (_data) {
								this.cardsVideoEl.append(createDom(Template.render(this.tpl.videos_header, this.data)));

								_data.forEach((itemData, index) => {
									this.data.VideosList = itemData;
									this.data.NotFreeVideos = true;
									this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
								});
							}
							setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
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
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.pagesVideoClass, {
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
		this.pagesVideoSwiper.on('pullingDown', () => {
			pullDownRefresh = true;
			videoClips(this._page, this._number, this.tagId, 1).then((data) => {
				videoClips(1, 10, this.tagId, 2).then((_data) => {
					if (!data && !_data) return;

					this.cardsVideoEl.innerHTML = '';

					// free
					if (data) {
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));
						// data = data.length > 2 ? data.slice(0, 2) : data;
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.NotFreeVideos = false;
							this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
						});
					}

					if (_data) {
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.videos_header, this.data)));

						_data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.NotFreeVideos = true;
							this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
						});
					}
					setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
					pullDownRefresh = false;
					this.pullDownEl.style.top = '-1rem';
					this.pagesVideoSwiper.finishPullDown();
					this.pagesVideoSwiper.refresh();
					this._listEvent();
				});
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;
			videoClips(_page, this._number, this.tagId, 1).then((data) => {
				if (data) {
					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.NotFreeVideos = false;
						let element = createDom(Template.render(this.tpl.list_videos, this.data));
						this._cardVideoEvent(element);
						this.cardsVideoEl.append(element);
					});
					setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
				}
				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
			});
			// videoClips(_page, this._number, this.tagId, 2).then((data) => {
			// 	if (data) {
			// 		data.forEach((itemData, index) => {
			// 			this.data.VideosList = itemData;
						// this.data.NotFreeVideos = true;
			// 			let element = createDom(Template.render(this.tpl.list_videos, this.data));
			// 			this._cardVideoEvent(element);
			// 			this.cardsVideoEl.append(element);
			// 		});
			// 		setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
			// 	}
			// 	this.pagesVideoSwiper.finishPullUp();
			// 	this.pagesVideoSwiper.refresh();
			// });
		});

		this.pagesVideoSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		});
	}
}