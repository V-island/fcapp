import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { CardVideoItem } from '../components/CardsItem';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import {
	body,
	fcConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    collectionList
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
	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		let getWatchHistory = collectionList(this._page, this._number);

		getWatchHistory.then((data) => {
			this.VideoList = data ? data : [];

			this.UserWatchEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserWatchEl);
			this._init();
		});
	}

	_init() {
		this.pagesVideoEl = this.UserWatchEl.querySelector(this.options.userWrapper);
		this.boxVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		if (this.VideoList.length > 0) {
			// content
			this.VideoList.forEach((itemData, index) => {
				const videoItem = new CardVideoItem({
					data: itemData
				});
				this.boxVideoEl.append(videoItem.element);
			});
		}else {
			const moreTxt = createDivEl({element: 'p', className: 'no-more', content: `${LANG.USER_WATCH.No_More}`});
			this.boxVideoEl.append(moreTxt);
		}

		this._VideoPullLoad();
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
				collectionList(this._page, this._number).then((videoList) => {
					if (!videoList) return resolve(true);

					this.boxVideoEl.innerHTML = '';

					if (videoList) {
						// content
						videoList.forEach((itemData, index) => {
							const videoItem = new CardVideoItem({
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});
					}
					setData(this.boxVideoEl, this.options.cardsPageIndex, this._page);
					resolve(true);
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				collectionList(_page, this._number).then((videoList) => {
					if (videoList) {
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

	static attachTo(element, options) {
	    return new UserWatch(element, options);
	}
}