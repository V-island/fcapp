import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
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

export default class FreeVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
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
		this.pagesVideoEl = this.FreeVideoEl.querySelector(this.options.userWrapper);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		this.tagsEl = this.FreeVideoEl.querySelector(this.options.tagsClass);

		this._VideoPullLoad();
		this._bindEvent();
		this._listEvent();
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
					videoClips(this._page, this._number, this.tagId, this._type).then((data) => {
						if (!data) return Spinner.remove();

						this.cardsVideoEl.innerHTML = '';

						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.NotFreeVideos = false;
							this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
						});

						setData(this.cardsVideoEl, this.options.cardsPageIndex, this._page);
						this._listEvent();
						Spinner.remove();
					});
				});
			});
		}
	}

	_listEvent() {
		this.cardVideoEl = this.FreeVideoEl.getElementsByClassName(this.options.cardvideoClass);

		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			this._cardVideoEvent(cardVideoItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, 'userInfo'));
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
	    return new FreeVideo(element, options);
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
				videoClips(this._page, this._number, this.tagId, this._type).then((data) => {
					if (!data) return resolve(true);;

					this.cardsVideoEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.NotFreeVideos = false;
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos, this.data)));
					});

					setData(this.cardsVideoEl, this.options.cardsPageIndex, this._page);
					this._listEvent();
					resolve(true);
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
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