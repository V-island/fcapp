import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import RecordVideo from '../record-video';
import Modal from '../modal';

import {
	body,
	fcConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    findMyVideo,
    deleteVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    dateFormat,
    showHideDom,
    importTemplate
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class UserVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	cardsPageIndex: 'page',
	    	videoAddClass: 'video-add-card',
	    	videoCloseClass: 'btn-close-video',
	    	mediaClass: 'media',
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
		let getMyVideo = findMyVideo(this._page, this._number);

		getMyVideo.then((data) => {
			this.data.MyVideo = data;

			this.UserVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserVideoEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.detailsItemFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.pagesVideoEl = this.UserVideoEl.querySelector(this.options.userWrapper);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);
		this.VideoEl = this.pagesVideoEl.getElementsByClassName(this.options.cardvideoClass);
		this.videoAddEl = this.pagesVideoEl.getElementsByClassName(this.options.videoAddClass)[0];

		this._VideoPullLoad();
		this._bindEvent();
	}

	_bindEvent() {
		// 上传
		addEvent(this.videoAddEl, 'click', () => {
			let record = new RecordVideo({
    		    editVideoInfo: true
    		});

			record.show();
        });

		Array.prototype.slice.call(this.VideoEl).forEach(ItemEl => {
			this._cardVideoEvent(ItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		let videoMediaEl = ItemEl.getElementsByClassName(this.options.mediaClass);
		let videoCloseEl = ItemEl.getElementsByClassName(this.options.videoCloseClass);

		// 浏览视频
		if (videoMediaEl.length > 0) {
			addEvent(videoMediaEl[0], 'click', () => {
				let videoUrl = getData(videoMediaEl[0], 'url');
				Spinner.start(body);
				modal.videoModal(videoUrl).then((_modal) => {
					Spinner.remove();
				});
	        });
		}

		// 删除视频
		if (videoCloseEl.length > 0) {
			addEvent(videoCloseEl[0], 'click', () => {
				let videoId = getData(ItemEl, 'id');
				let getDeleteVideo = deleteVideo(videoId);

				getDeleteVideo.then((data) => {
					if (!data) return;

					showHideDom(ItemEl, 'none');
				});
	        });
		}
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
				findMyVideo(this._page, this._number).then((data) => {
					if (!data) return resolve(true);

					if (data) {
						this.cardsVideoEl.innerHTML = '';
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_add_item, this.data)));

						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_videos_item, this.data)));
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
				findMyVideo(_page, this._number).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;

							let element = createDom(Template.render(this.tpl.list_my_videos_item, this.data));
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
	    return new UserVideo(element, options);
	}
}