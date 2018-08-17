import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import RecordVideo from '../record-video';
import Modal from '../modal';
// import VideoPreview from '../videoPreview';
import {
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
    showHideDom,
    importTemplate
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class UserVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	pulldownClass: '.pulldown-wrapper',
	    	pullupClass: '.pullup-wrapper',
	    	cardsPageIndex: 'page',
	    	videoAddClass: 'video-add-card',
	    	videoCloseClass: 'btn-close-video',
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
		this.cardsVideoEl = this.UserVideoEl.querySelector(this.options.boxCardsClass);

		this.pullDownEl = this.UserVideoEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.UserVideoEl.querySelector(this.options.pullupClass);

		this.videoAddEl = this.UserVideoEl.getElementsByClassName(this.options.videoAddClass)[0];

		this._pagesVideo();
		this._bindEvent();
	}

	_bindEvent() {
		this.videoCloseEl = this.UserVideoEl.getElementsByClassName(this.options.videoCloseClass);
		this.videoEl = this.UserVideoEl.getElementsByClassName(this.options.cardvideoClass);

		// 上传
		addEvent(this.videoAddEl, 'click', () => {
			let record = new RecordVideo({
    		    editVideoInfo: true
    		});

			record.show();
        });

		// 删除视频
		for (let i = 0; i < this.videoCloseEl.length; i++) {
			addEvent(this.videoCloseEl[i], 'click', () => {
				let videoId = getData(this.videoEl[i+1], 'id');
				let getDeleteVideo = deleteVideo(videoId);

				getDeleteVideo.then((data) => {
					if (!data) return;

					showHideDom(this.videoEl[i+1], 'none');
				});
	        });
		}

		// 浏览视频
		for (let i = 0; i < this.videoEl.length; i++) {
			console.log(123);
			if (i > 0) {
				addEvent(this.videoEl[i], 'click', () => {
					let videoUrl = getData(this.videoEl[i], 'url');
					modal.videoModal(videoUrl);
		        });
			}
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

			findMyVideo(1, 10).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';
				this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_add_item, this.data)));

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_videos_item, this.data)));
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

			findMyVideo(_page, 10).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_my_videos_item, this.data)));
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
	    return new UserVideo(element, options);
	}
}