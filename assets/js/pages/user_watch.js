import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
import VideoPreview from '../videoPreview';
import {
	body,
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
	    	pagesContentClass: '.user-contents',
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
		this.pagesVideoEl = this.UserWatchEl.querySelector(this.options.userWrapper);
		this.contentsVideoEl = this.pagesVideoEl.querySelector(this.options.pagesContentClass);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);
		this.contentsVideoEl.style.minHeight = `${this.pagesVideoEl.offsetHeight + 1}px`;

		this.pullDownEl = this.UserWatchEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.UserWatchEl.querySelector(this.options.pullupClass);

		this._pagesVideo();
		this._bindEvent();
	}

	_bindEvent() {
		this.cardVideoEl = this.UserWatchEl.getElementsByClassName(this.options.cardvideoClass);

		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			this._cardVideoEvent(cardVideoItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, 'userInfo'));
			info.id = info.user_id;
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

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.userWrapper, {
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

			findWatchHistory(1, 10).then((data) => {
				if (data) {
					this.cardsVideoEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.HeaderVideos = false;
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
					});

					setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
					this._bindEvent();
				}

				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesVideoSwiper.finishPullDown();
				this.pagesVideoSwiper.refresh();
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			findWatchHistory(_page, 10).then((data) => {
				if (data) {
					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.HeaderVideos = false;

						let element = createDom(Template.render(this.tpl.list_videos_item, this.data));
						this._cardVideoEvent(element);
						this.cardsVideoEl.append(element);
					});

					setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
					this._bindEvent();
				}

				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
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