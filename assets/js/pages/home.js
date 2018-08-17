import Swiper from 'swiper';
import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import LivePreview from '../livePreview';
import VideoPreview from '../videoPreview';
import {
	fcConfig
} from '../intro';
import {
    getLangConfig
} from '../lang';

import {
    newVideo,
    hotVideo,
    videoClips,
    getAdvertisement,
    videoType,
    playVideo
} from '../api';

import {
    extend,
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
            boxCardsClass: 'box-cards',
            tagsClass: '.tag',
            tagsLabelClass: 'tag-label',
            pulldownClass: '.pulldown-wrapper',
            pullupClass: '.pullup-wrapper',
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

		let getNewVideo = newVideo(this._page, this._number);
		let getHotVideo = hotVideo(this._page, this._number);
		let getFreeVideoClips = videoClips(this._page, this._number, this.tagId, 1);
		let getVideoClips = videoClips(this._page, this._number, this.tagId, 2);
		let getNewAdvertisement = getAdvertisement();
		let getHotAdvertisement = getAdvertisement();
		let getvideoType = videoType();

		Promise.all([getNewVideo, getHotVideo, getFreeVideoClips, getVideoClips, getNewAdvertisement, getHotAdvertisement, getvideoType]).then((data) => {
			this.data.NewList = data[0] ? data[0] : false;
			this.data.HotList = data[1] ? data[1] : false;
			this.data.FreeVideoList = data[2] ? (data[2].length > 2 ? data[2].slice(0, 2) : data[2]) : false;
			this.data.VideoList = data[3] ? data[3] : false;
			this.data.NewAdList = data[4] ? data[4] : false;
			this.data.HotAdList = data[5] ? data[5] : false;
			this.data.VideoType = data[6] ? data[6] : false;
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
		// nav
		this.navsWrapperEl = this.HomeEl.querySelector(this.options.navsWrapper);
		this.navsContentEl = this.navsWrapperEl.getElementsByClassName(this.options.navsContent)[0];
		this.navsItemEl = this.navsWrapperEl.getElementsByClassName(this.options.navsItem);
		this.navsItemLineEl = this.navsWrapperEl.getElementsByClassName(this.options.navsItemLine)[0];

		// slide
		this.slideWrapperEl = this.HomeEl.querySelector(this.options.slideWrapper);
		this.slideContentEl = this.slideWrapperEl.getElementsByClassName(this.options.slideContent)[0];
		this.slideItemEl = this.slideWrapperEl.getElementsByClassName(this.options.slideItem);

		// pages
		this.pagesNewEl = this.HomeEl.querySelector(this.options.pagesNewClass);
		this.cardsNewEl = this.pagesNewEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this.pagesHotEl = this.HomeEl.querySelector(this.options.pagesHotClass);
		this.cardsHotEl = this.pagesHotEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this.pagesVideoEl = this.HomeEl.querySelector(this.options.pagesVideoClass);
		this.cardsVideoEl = this.pagesVideoEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this.tagsEl = this.HomeEl.querySelector(this.options.tagsClass);
		this.tagsLabelEl = this.tagsEl.getElementsByClassName(this.options.tagsLabelClass);

		this.pullDownEl = this.HomeEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.HomeEl.querySelector(this.options.pullupClass);

		this._setSlideWidth();
		this._slideSwiper();
		this._navSwiper();
		this._bannerSwiper();
		this._pagesNew();
		this._pagesHot();
		this._pagesVideo();
		this._bindEvent();
		this._listEvent();
	}

	_bindEvent() {
		// tags
		for (let i = 0; i < this.tagsLabelEl.length; i++) {
		    addEvent(this.tagsLabelEl[i], 'click', () => {
		    	if (hasClass(this.tagsLabelEl[i], this.options.showClass)) {
		    		this.tagId = 0;
		    		toggleClass(this.tagsLabelEl[i], this.options.showClass);
		    	}else {
		    		this.tagId = getData(this.tagsLabelEl[i], this.options.tagsIndex);

		    		let tagsLabelActiveEl = this.tagsEl.getElementsByClassName(this.options.showClass)[0];
		    		if (tagsLabelActiveEl) {
		    			toggleClass(tagsLabelActiveEl, this.options.showClass);
		    		}

		    		toggleClass(this.tagsLabelEl[i], this.options.showClass);
		    	}

		    	videoClips(1, 10, this.tagId, 1).then((data) => {
		    		videoClips(1, 10, this.tagId, 2).then((_data) => {
		    			if (!data && !_data) return;

		    			this.cardsVideoEl.innerHTML = '';

		    			// free
		    			if (data) {
		    				this.cardsVideoEl.append(createDom(Template.render(this.tpl.free_videos_header, this.data)));
		    				data = data.length > 2 ? data.slice(0, 2) : data;
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
		    		});
		    	});
		    });
		}
	}

	static attachTo(element, options) {
	    return new Home(element, options);
	}

	_listEvent() {
		let self = this;
		this.cardListEl = this.HomeEl.querySelectorAll('.card-list');
		this.cardVideoEl = this.HomeEl.querySelectorAll('.card-video');

		// live list
		// for (let i = 0; i < this.cardListEl.length; i++) {
		//     addEvent(this.cardListEl[i], 'click', function() {
		//     	let info = JSON.parse(getData(this, 'userInfo'));
		//     	let _livePreview = new LivePreview(info);
		//     });
		// }

		Array.prototype.slice.call(this.cardListEl).forEach(cardListItemEl => {
			addEvent(cardListItemEl, 'click', () => {
				let info = JSON.parse(getData(cardListItemEl, 'userInfo'));
				let _livePreview = new LivePreview(info);
			});
		});

		// video list
		// for (let i = 0; i < this.cardVideoEl.length; i++) {
		//     addEvent(this.cardVideoEl[i], 'click', function() {
		//     	let info = JSON.parse(getData(this, 'userInfo'));

		//     	playVideo(info.id).then((data) => {
		//     		if (!data) return;

		//     		extend(info, data);
		//     		let _videoPreview = new VideoPreview(info);
		//     	});
		//     });
		// }

		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			addEvent(cardVideoItemEl, 'click', () => {
				let info = JSON.parse(getData(cardVideoItemEl, 'userInfo'));

				playVideo(info.id).then((data) => {
					if (!data) return;

					extend(info, data);
					let _videoPreview = new VideoPreview(info);
				});
			});
		});
	}

	// 滑块初始化
	_setSlideWidth() {
		let width = 0;
		let slideWidth = this.slideWrapperEl.clientWidth;
		let navItemWidth = this.navsItemEl[INIT_INDEX].clientWidth;
		let navItemLeft = this.navsItemEl[INIT_INDEX].offsetLeft;

		for (let i = 0; i < this.slideItemEl.length; i++) {
			this.slideItemEl[i].style.width = slideWidth + 'px';
			width += slideWidth;
		}
		this.slideContentEl.style.width = width + 'px';
		this.navsItemLineEl.style.width = navItemWidth + 'px';
		this.navsItemLineEl.style.transform = 'translateX(' + navItemLeft + 'px)';
		this.navsItemLineEl.style.WebkitTransform = 'translateX(' + navItemLeft + 'px)';
		this.navsItemLineEl.style.msTransform = 'translateX(' + navItemLeft + 'px)';
	}

	// nav 滑块
	_navSwiper() {
		let self = this;

		this.navSwiper = new BScroll(this.options.navsWrapper, {
			startX: 2,
			scrollX: true,
			scrollY: false,
			momentum: false,
			probeType: 2,
			tap: true,
			bounce: false
		});

		for (let i = 0; i < self.navsItemEl.length; i++) {
			addEvent(self.navsItemEl[i], 'tap', function() {
				let index = getData(this, self.options.navsDataIndex);

	            for (let j = 0; j < self.navsItemEl.length; j++) {
	            	if (hasClass(self.navsItemEl[j], self.options.showClass)) {
	            		removeClass(self.navsItemEl[j], self.options.showClass);
	            	}
	            }
	            addClass(this, self.options.showClass);
	            self.slideSwiper.goToPage(index, 0);
	        });
		}
	}

	// slide 滑块
	_slideSwiper() {
		this.slideSwiper = new BScroll(this.options.slideWrapper, {
			startX: 2,
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
		});

		this.slideSwiper.on('scrollEnd', (pos) => {
			let slideIndex = this.slideSwiper.getCurrentPage().pageX;
			let navItemWidth = this.navsItemEl[INIT_INDEX].clientWidth;

			for (let i = 0; i < this.navsItemEl.length; i++) {
				if (hasClass(this.navsItemEl[i], this.options.showClass)) {
					removeClass(this.navsItemEl[i], this.options.showClass);
				}
			}
			addClass(this.navsItemEl[slideIndex], this.options.showClass);

			this.navsItemLineEl.style.transform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
			this.navsItemLineEl.style.WebkitTransform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
			this.navsItemLineEl.style.msTransform = 'translateX(' + (slideIndex * navItemWidth) + 'px)';
		});

		this.slideSwiper.goToPage(INIT_INDEX, 0);
	}

	// banner 模块
	_bannerSwiper() {
		let bannerSwiper = new Swiper(this.options.bannerWrapper, {
			wrapperClass: this.options.bannerContent,
			slideClass: this.options.bannerItem,
			slideActiveClass: this.options.showClass,
			loop: true,
			pagination: {
				el: this.options.bannerPagination,
				type: 'bullets',
				bulletClass : this.options.bannerPaginationBullet,
				bulletActiveClass: this.options.showClass,
			}
		})
	}

	// New 模块
	_pagesNew() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesNewSwiper = new BScroll(this.options.pagesNewClass, {
			startY: 0,
			scrollY: true,
			scrollX: false,
			probeType: 3,
			click: true,
			scrollbar: {
				fade: true,
				interactive: false
			},
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: -20
			},
			mouseWheel: true,
			bounce: true
		});

		// 下拉刷新
		this.pagesNewSwiper.on('pullingDown', () => {
			pullDownRefresh = true;
			newVideo(this._page, this._number).then((data) => {
				if (!data) return;

				this.cardsNewEl.innerHTML = '';
				data.forEach((itemData, index) => {
					this.data.CardsList = itemData;
					this.cardsNewEl.append(createDom(Template.render(this.tpl.list_cards, this.data)));
				});
				setData(this.cardsNewEl, this.options.cardsPageIndex, 1);
				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesNewSwiper.finishPullDown();
				this.pagesNewSwiper.refresh();
				this._listEvent();
			});
		});

		// 上拉加载
		this.pagesNewSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsNewEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;
			newVideo(_page, this._number).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.CardsList = itemData;
					this.cardsNewEl.append(createDom(Template.render(this.tpl.list_cards, this.data)));
				});
				setData(this.cardsNewEl, this.options.cardsPageIndex, _page);
				this.pagesNewSwiper.finishPullUp();
				this.pagesNewSwiper.refresh();
				this._listEvent();
			});
		});

		this.pagesNewSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		});
	}

	// Hot 模块
	_pagesHot() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesHotSwiper = new BScroll(this.options.pagesHotClass, {
			startY: 0,
			scrollY: true,
			scrollX: false,
			probeType: 3,
			click: true,
			scrollbar: {
				fade: true,
				interactive: false
			},
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: -20
			},
			mouseWheel: true,
			bounce: true
		});

		// 下拉刷新
		this.pagesHotSwiper.on('pullingDown', () => {
			pullDownRefresh = true;
			hotVideo(this._page, this._number).then((data) => {
				if (!data) return;

				this.cardsHotEl.innerHTML = '';
				data.forEach((itemData, index) => {
					this.data.CardsList = itemData;
					this.cardsHotEl.append(createDom(Template.render(this.tpl.list_cards, this.data)));
				});
				setData(this.cardsHotEl, this.options.cardsPageIndex, 1);
				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesHotSwiper.finishPullDown();
				this.pagesHotSwiper.refresh();
				this._listEvent();
			});
		});

		// 上拉加载
		this.pagesHotSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsHotEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;
			hotVideo(_page, this._number).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.CardsList = itemData;
					this.cardsHotEl.append(createDom(Template.render(this.tpl.list_cards, this.data)));
				});
				setData(this.cardsHotEl, this.options.cardsPageIndex, _page);
				this.pagesHotSwiper.finishPullUp();
				this.pagesHotSwiper.refresh();
				this._listEvent();
			});
		});

		this.pagesHotSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		})
	}

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.pagesVideoClass, {
			startY: 0,
			scrollY: true,
			scrollX: false,
			probeType: 3,
			click: true,
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: -20
			},
			mouseWheel: true,
			bounce: true
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
						data = data.length > 2 ? data.slice(0, 2) : data;
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
			videoClips(_page, this._number, this.tagId, 2).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
				});
				setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
			});
		});

		this.pagesVideoSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		})
	}
}