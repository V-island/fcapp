import Template from 'art-template/lib/template-web';
import BScroll from 'better-scroll';
import EventEmitter from '../eventEmitter';
import VideoPreview from '../videoPreview';
import {
	fcConfig
} from '../intro';
import {
    getLangConfig
} from '../lang';

import {
    videoType,
    videoClips,
    playVideo
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

export default class FreeVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	pulldownClass: '.pulldown-wrapper',
	    	pullupClass: '.pullup-wrapper',
	    	boxCardsClass: '.box-cards',
	    	cardvideoClass: 'card-video',
	    	tagsClass: '.tag',
	    	tagsLabelClass: 'tag-label',
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
		this._type = 1;
		this.tagId = 0;

		let getvideoType = videoType();
		let getVideoClips = videoClips(this._page, this._number, this.tagId, this._type);

		Promise.all([getvideoType, getVideoClips]).then((data) => {
			this.data.VideoType = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;
			this.FreeVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.FreeVideoEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.homeFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.cardsVideoEl = this.FreeVideoEl.querySelector(this.options.boxCardsClass);

		this.tagsEl = this.FreeVideoEl.querySelector(this.options.tagsClass);
		this.tagsLabelEl = this.tagsEl.getElementsByClassName(this.options.tagsLabelClass);

		this.pullDownEl = this.FreeVideoEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.FreeVideoEl.querySelector(this.options.pullupClass);

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

		    	videoClips(this._page, this._number, this.tagId, this._type).then((data) => {
		    		if (!data) return;

		    		this.cardsVideoEl.innerHTML = '';

		    		data.forEach((itemData, index) => {
		    			this.data.VideosList = itemData;
		    			this.data.NotFreeVideos = false;
		    			this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
		    		});

		    		setData(this.cardsVideoEl, this.options.cardsPageIndex, this._page);
		    		this._listEvent();
		    	});
		    });
		}
	}

	_listEvent() {
		this.cardVideoEl = this.FreeVideoEl.getElementsByClassName(this.options.cardvideoClass);

		for (let i = 0; i < this.cardVideoEl.length; i++) {
		    addEvent(this.cardVideoEl[i], 'click', function() {
		    	let info = JSON.parse(getData(this, 'userInfo'));

		    	playVideo(info.id).then((data) => {
		    		if (!data) return;

		    		extend(info, data);
		    		let _videoPreview = new VideoPreview(info);
		    	});
		    });
		}
	}

	static attachTo(element, options) {
	    return new FreeVideo(element, options);
	}

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.userWrapper, {
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

			videoClips(this._page, this._number, this._type).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.NotFreeVideos = false;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, this._page);

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

			videoClips(_page, this._number, this._type).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.NotFreeVideos = false;
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