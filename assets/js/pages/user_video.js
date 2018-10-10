import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
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
	    	pagesContentClass: '.user-contents',
	    	boxCardsClass: '.box-cards',
	    	pulldownClass: '.pulldown-wrapper',
	    	pullupClass: '.pullup-wrapper',
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
		let _page = 1;
		let _number = 10;
		let getMyVideo = findMyVideo(_page, _number);

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
		this.contentsVideoEl = this.pagesVideoEl.querySelector(this.options.pagesContentClass);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);
		this.VideoEl = this.pagesVideoEl.getElementsByClassName(this.options.cardvideoClass);
		this.videoAddEl = this.pagesVideoEl.getElementsByClassName(this.options.videoAddClass)[0];
		this.contentsVideoEl.style.minHeight = `${this.pagesVideoEl.offsetHeight + 1}px`;

		this.pullDownEl = this.UserVideoEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.UserVideoEl.querySelector(this.options.pullupClass);

		this._pagesVideo();
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

			findMyVideo(1, 10).then((data) => {
				if (data) {
					this.cardsVideoEl.innerHTML = '';
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_add_item, this.data)));

					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_videos_item, this.data)));
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

			findMyVideo(_page, 10).then((data) => {
				if (data) {
					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;

						let element = createDom(Template.render(this.tpl.list_my_videos_item, this.data));
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
	    return new UserVideo(element, options);
	}
}