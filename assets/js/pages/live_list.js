import Template from 'art-template/lib/template-web';
import { PullLoad } from '../components/PullLoad';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import VideoPreview from '../videoPreview';
import {
	body,
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

export default class LiveList extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	cardLiveClass: 'card-live',
	    	cardsPageIndex: 'page',
	    	cardsChannelId: 'channelId'
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

		let getVideoClips = videoClips(this._page, this._number);

		Promise.all([getVideoClips]).then((data) => {
			this.data.LiveList = data[0] ? data[0] : false;
			this.LiveListEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.LiveListEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.homeFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.pagesLiveEl = this.LiveListEl.querySelector(this.options.userWrapper);
		this.cardsLiveEl = this.pagesLiveEl.querySelector(this.options.boxCardsClass);

		this._LivePullLoad();
		this._listEvent();
	}

	_listEvent() {
		this.cardLiveEl = this.LiveListEl.getElementsByClassName(this.options.cardLiveClass);

		Array.prototype.slice.call(this.cardLiveEl).forEach(cardVideoItemEl => {
			this._cardLiveEvent(cardVideoItemEl);
		});
	}

	_cardLiveEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, this.options.cardsChannelId));
			Spinner.start(body);
			playVideo(info.id).then((data) => {
				if (!data) return;

				extend(info, data);
				let _videoPreview = new VideoPreview(ItemEl, info);
				_videoPreview.on('videoPreview.start', () => {
                    Spinner.remove();
                });
			});
		});
	}

	static attachTo(element, options) {
	    return new LiveList(element, options);
	}

	_LivePullLoad() {
		const LivePullLoad = new PullLoad(this.pagesLiveEl, {
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
		LivePullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				videoClips(this._page, this._number).then((data) => {
					if (!data) return resolve(true);;

					this.cardsLiveEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.LiveList = itemData;
						this.cardsLiveEl.append(createDom(Template.render(this.tpl.list_cards, this.data)));
					});

					setData(this.cardsLiveEl, this.options.cardsPageIndex, this._page);
					this._listEvent();
					resolve(true);
				});
			});
		};

		// 上拉加载
		LivePullLoad.onPullingUp = () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				videoClips(_page, this._number).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.LiveList = itemData;
							let element = createDom(Template.render(this.tpl.list_cards, this.data));
							this._cardLiveEvent(element);
							this.cardsVideoEl.append(element);
						});
						setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
					}
					resolve(true);
				});
			});
		};
	}
}