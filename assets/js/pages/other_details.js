import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import Modal from '../modal';
import VideoPreview from '../videoPreview';

import {
	body,
    fcConfig
} from '../intro';
import {
    getLangConfig
} from '../lang';
import {
	follow,
	playVideo,
	getUserInfo,
	searchUserInfo,
    selVideoByUserId,
} from '../api';
import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    errorAlert,
    dateFormat,
    importTemplate,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class OtherDetails extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	slideWrapper: '.slide-wrapper',
	    	tabsItemClass: 'tab-item',

	    	pagesVideoClass: '.pages-video',
	    	cardVideoClass: '.card-video',
	    	boxCardsClass: '.box-cards',

	    	btnPrivateLetterClass: 'btn-private-letter',
	    	btnVideoChatClass: 'btn-video-chat',
	    	btnAddAttentionClass: 'btn-add-attention',
	    	iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            cardsPageIndex: 'page',
            showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.otherDetailsFile = fcConfig.publicFile.other_details_item;
	    this.init(element);

	}

	init(element) {
		const { userid } = getVariableFromUrl();

		this._page = 1;
		this._number = 10;
		let getUserDetail = searchUserInfo(userid);
		let getVideo = selVideoByUserId(userid, this._page, this._number);

		Promise.all([getUserDetail, getVideo]).then((data) => {
			this.data.UserDetail = data[0] ? data[0] : false;
			this.data.VideoList = data[1] ? data[1] : false;

			this.OtherDetailsEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.OtherDetailsEl);
			this._init();

			this.info = data[0] ? data[0] : false;
		});

		this.tpl = {};

		importTemplate(this.otherDetailsFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.btnAddAttentionEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
		this.pagesVideoEl = this.OtherDetailsEl.querySelector(this.options.pagesVideoClass);
		this.cardsVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		this._SlidePullLoad();
		this._VideoPullLoad();
		this._bindEvent();
		this._listEvent();
	}

	_bindEvent() {
		// 加关注
		addEvent(this.btnAddAttentionEl, 'click', () => {
		    let index = getData(this.btnAddAttentionEl, 'id'),
		        status;

		    if (hasClass(this.btnAddAttentionEl, this.options.iconAttentionClass)) {
		        removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        status = 1;
		    }else {
		        removeClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
		        addClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
		        status = 2;
		    }
		    follow(index, status);
		});
	}

	_listEvent() {
		this.cardVideoEl = this.OtherDetailsEl.querySelectorAll(this.options.cardVideoClass);
		// video list
		Array.prototype.slice.call(this.cardVideoEl).forEach(cardVideoItemEl => {
			this._cardVideoEvent(cardVideoItemEl);
		});
	}

	_cardVideoEvent(ItemEl) {
		addEvent(ItemEl, 'tap', () => {
			let info = JSON.parse(getData(ItemEl, 'userInfo'));
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

	// Slide 滑块
	_SlidePullLoad() {
		const slideWrapperEl = this.OtherDetailsEl.querySelector(this.options.slideWrapper);
		const tabsItemEl = this.OtherDetailsEl.getElementsByClassName(this.options.tabsItemClass);

		const SlidePullLoad = new PullLoad(slideWrapperEl, {
			startX: 1,
			scrollX: true,
			scrollY: false,
			momentum: false,
			probeType: 2,
			snap: {
				loop: false,
				threshold: 0.3,
				easing:{
					style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					fn: function(t) {
						return t * (2 - t)
					}
				}
			},
			bounce: false
		}, {
			pullingModule: false,
			slideModule: true
		});
		SlidePullLoad.onScrollEnd = () => {
			let slideIndex = SlidePullLoad.getCurrentPage().pageX;
			if (hasClass(tabsItemEl[slideIndex], this.options.showClass)) return;

			Array.prototype.slice.call(tabsItemEl).forEach(itemEl => {
				toggleClass(itemEl, this.options.showClass);
			});
		};
		Array.prototype.slice.call(tabsItemEl).forEach((itemEl, index) => {
			addEvent(itemEl, 'click', () => {
	            if (hasClass(itemEl, this.options.showClass)) return;

	            SlidePullLoad.goToPage(index, 0);
	        });
		});
		SlidePullLoad.goToPage(1, 0);
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
				selVideoByUserId(this.info.user_id, this._page, this._number).then((data) => {
					if (!data) return;

					this.cardsVideoEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.VideosList = itemData;
						this.data.HeaderVideos = true;
						this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
					});

					setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
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
				selVideoByUserId(this.info.user_id, _page, this._number).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.VideosList = itemData;
							this.data.HeaderVideos = true;

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
	};

	static attachTo(element, options) {
	    return new OtherDetails(element, options);
	}
}