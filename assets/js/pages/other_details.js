import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
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
const modal = new Modal();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class OtherDetails extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	slideWrapper: '.slide-wrapper',
            slideContent: 'slide-content',
            slideItem: 'slide-item',
	    	tabsItemClass: 'tab-item',
	    	pagesVideoClass: '.pages-video',
	    	cardVideoClass: '.card-video',
	    	boxCardsClass: 'box-cards',
	    	btnPrivateLetterClass: 'btn-private-letter',
	    	btnVideoChatClass: 'btn-video-chat',
	    	btnAddAttentionClass: 'btn-add-attention',
	    	iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            pulldownClass: '.pulldown-wrapper',
            pullupClass: '.pullup-wrapper',
            cardsPageIndex: 'page',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.otherDetailsFile = fcConfig.publicFile.other_details_item;
	    this.init(element);

	}

	init(element) {
		const { userid } = getVariableFromUrl();

		let _page = 1;
		let _number = 10;
		let getUserDetail = searchUserInfo(userid);
		let getVideo = selVideoByUserId(userid, _page, _number);

		Promise.all([getUserDetail, getVideo]).then((data) => {
			this.data.UserDetail = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;

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

		// tab
		this.tabsItemEl = this.OtherDetailsEl.getElementsByClassName(this.options.tabsItemClass);

		// slide
		this.slideWrapperEl = this.OtherDetailsEl.querySelector(this.options.slideWrapper);
		this.slideContentEl = this.slideWrapperEl.getElementsByClassName(this.options.slideContent)[0];
		this.slideItemEl = this.slideWrapperEl.getElementsByClassName(this.options.slideItem);

		this.pullDownEl = this.OtherDetailsEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.OtherDetailsEl.querySelector(this.options.pullupClass);

		this.cardsVideoEl = this.OtherDetailsEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this._setSlideWidth();
		this._slideSwiper();
		this._pagesVideo();
		this._bindEvent();
		this._listEvent();
	}

	_bindEvent() {

		// 切换
		Array.prototype.slice.call(this.tabsItemEl).forEach((itemEl, index) => {
			addEvent(itemEl, 'click', () => {
	            if (hasClass(itemEl, this.options.showClass)) return;

	            this.slideSwiper.goToPage(index, 0);
	        });
		});

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
	}

	_listEvent() {
		let self = this;
		this.cardVideoEl = this.OtherDetailsEl.querySelectorAll(this.options.cardVideoClass);

		// video list
		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			addEvent(cardVideoItemEl, 'click', () => {
				let info = JSON.parse(getData(cardVideoItemEl, 'userInfo'));
				Spinner.start(body);
				playVideo(info.id).then((data) => {
					if (!data) return Spinner.remove();
					extend(info, data);
					let _videoPreview = new VideoPreview(cardVideoItemEl, info);
					_videoPreview.on('videoPreview.start', () => {
	                    Spinner.remove();
	                });
				});
			});
		});
	}

	// 滑块初始化
	_setSlideWidth() {
		let width = 0;
		let slideWidth = this.slideWrapperEl.clientWidth;

		Array.prototype.slice.call(this.slideItemEl).forEach(itemEl => {
			itemEl.style.width = slideWidth + 'px';
			width += slideWidth;
		});
		this.slideContentEl.style.width = width + 'px';
	}

	// Slide 滑块
	_slideSwiper() {
		this.slideSwiper = new BScroll(this.options.slideWrapper, {
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
		});

		this.slideSwiper.on('scrollEnd', (pos) => {
			let slideIndex = this.slideSwiper.getCurrentPage().pageX;

			if (hasClass(this.tabsItemEl[slideIndex], this.options.showClass)) return;

			Array.prototype.slice.call(this.tabsItemEl).forEach(itemEl => {
				toggleClass(itemEl, this.options.showClass);
			});
		});
		this.slideSwiper.goToPage(1, 0);
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

			selVideoByUserId(this.info.user_id, 1, 10).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.HeaderVideos = true;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesVideoSwiper.finishPullDown();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			selVideoByUserId(this.info.user_id, _page, 10).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.HeaderVideos = true;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
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

	static attachTo(element, options) {
	    return new OtherDetails(element, options);
	}
}