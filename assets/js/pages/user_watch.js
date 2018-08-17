import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
	fcConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    findWatchHistory,
    playVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    importTemplate
} from '../util';

const LANG = getLangConfig();

export default class UserWatch extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	pulldownClass: '.pulldown-wrapper',
	    	pullupClass: '.pullup-wrapper',
	    	cardsPageIndex: 'page',
	    	cardvideoClass: 'card-video'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.detailsItemFile = fcConfig.publicFile.other_details_item;
	    this.init(element);

	}

	init(element) {
		let _page = 1;
		let _number = 10;
		let getWatchHistory = findWatchHistory(_page, _number);

		getWatchHistory.then((data) => {
			this.data.WatchHistory = data;

			this.UserWatchEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserWatchEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.detailsItemFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.cardsVideoEl = this.UserWatchEl.querySelector(this.options.boxCardsClass);

		this.pullDownEl = this.UserWatchEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.UserWatchEl.querySelector(this.options.pullupClass);

		this._pagesVideo();
		this._bindEvent();
	}

	_bindEvent() {
		this.videoEl = this.UserWatchEl.getElementsByClassName(this.options.cardvideoClass);

		// video list
		for (let i = 0; i < this.videoEl.length; i++) {
		    addEvent(this.videoEl[i], 'click', function() {
		    	let info = JSON.parse(getData(this, 'userInfo'));

		    	playVideo(info.video_id).then((data) => {
		    		if (!data) return;

		    		extend(info, data);
		    		info.id = info.video_id;
		    		let _videoPreview = new VideoPreview(info);
		    	});
		    });
		}
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

			findWatchHistory(1, 10).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.HeaderVideos = false;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);

				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesVideoSwiper.finishPullDown();
				this.pagesVideoSwiper.refresh();
				this._bindEvent();
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			findWatchHistory(_page, 10).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.data.HeaderVideos = false;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
				this._bindEvent();
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
	    return new UserWatch(element, options);
	}
}