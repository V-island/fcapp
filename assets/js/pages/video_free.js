import Template from 'art-template/lib/template-web';
import { CardVideoItem } from '../components/CardsItem';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import EventEmitter from '../eventEmitter';
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
    getData,
    setData,
    hasClass,
    toggleClass
} from '../util';

const LANG = getLangConfig();

export default class VideoFree extends EventEmitter {
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
			this.FreeVideoList = data[1] ? data[1] : [];
			this.FreeVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.FreeVideoEl);
			this._init();
		});
	}

	_init() {
		this.pagesVideoEl = this.FreeVideoEl.querySelector(this.options.userWrapper);
		this.boxVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		this.tagsEl = this.FreeVideoEl.querySelector(this.options.tagsClass);

		if (this.FreeVideoList.length > 0) {
			// content
			this.FreeVideoList.forEach((itemData, index) => {
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
		this._bindEvent();
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
					videoClips(this._page, this._number, this.tagId, this._type).then((videoList) => {
						if (!videoList) return Spinner.remove();

						this.boxVideoEl.innerHTML = '';

						if (videoList) {
							// content
							videoList.forEach((itemData, index) => {
								const videoItem = new CardVideoItem({
									data: itemData
								});
								this.boxVideoEl.append(videoItem.element);
							});
						}else {
							const moreTxt = createDivEl({element: 'p', className: 'no-more', content: `${LANG.USER_WATCH.No_More}`});
							this.boxVideoEl.append(moreTxt);
						}

						setData(this.boxVideoEl, this.options.cardsPageIndex, this._page);
						Spinner.remove();
					});
				});
			});
		}
	}

	static attachTo(element, options) {
	    return new VideoFree(element, options);
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
				videoClips(this._page, this._number, this.tagId, this._type).then((videoList) => {
					if (!videoList) return resolve(true);;

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
			let _page = getData(this.boxVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				videoClips(_page, this._number).then((videoList) => {
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
}