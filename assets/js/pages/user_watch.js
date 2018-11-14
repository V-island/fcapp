import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
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
	    	boxCardsClass: '.box-cards',
	    	cardsPageIndex: 'page',
	    	cardvideoClass: 'card-video'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.detailsItemFile = fcConfig.publicFile.other_details_item;
	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		let getWatchHistory = findWatchHistory(this._page, this._number);

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
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		this._VideoPullLoad();
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
				findWatchHistory(this._page, this._number).then((data) => {
					if (!data) return resolve(true);

					this.cardsVideoEl.innerHTML = '';

					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.HeaderVideos = false;
							this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
						});
					}
					setData(this.cardsVideoEl, this.options.cardsPageIndex, this._page);
					this._bindEvent();
					resolve(true);
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				findWatchHistory(_page, this._number).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.HeaderVideos = false;

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

	static attachTo(element, options) {
	    return new UserWatch(element, options);
	}
}