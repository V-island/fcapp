import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import SignalingClient from '../signalingClient';
import Client from '../client';
import Modal from '../modal';
import VideoPreview from '../videoPreview';

import SendBirdAction from '../SendBirdAction';
import { MessageChat } from '../components/MessageChat';
import { Spinner } from '../components/Spinner';

import {
	body,
    fcConfig,
    agoraConfig
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
    importTemplate,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class OtherDetails extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	slideWrapper: '.slide-wrapper',
            slideContent: 'slide-content',
            slideItem: 'slide-item',
	    	tabsItemClass: 'tab-item',
	    	pagesVideoClass: '.pages-video',
	    	cardVideoClass: '.card-video',
	    	boxCardsClass: 'box-cards',
	    	btnPrivateLetterClass: 'btn-private-letter',
	    	btnVideoChatClass: 'btn-video-chat',
	    	btnAddAttentionClass: 'btn-add-attention',
	    	iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            pulldownClass: '.pulldown-wrapper',
            pullupClass: '.pullup-wrapper',
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

		let _page = 1;
		let _number = 10;
		let getUserDetail = searchUserInfo(userid);
		let getVideo = selVideoByUserId(userid, _page, _number);

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
		this.btnPrivateLetterEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnPrivateLetterClass)[0];
		this.btnVideoChatEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnVideoChatClass)[0];
		this.btnAddAttentionEl = this.OtherDetailsEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];

		// tab
		this.tabsItemEl = this.OtherDetailsEl.getElementsByClassName(this.options.tabsItemClass);

		// slide
		this.slideWrapperEl = this.OtherDetailsEl.querySelector(this.options.slideWrapper);
		this.slideContentEl = this.slideWrapperEl.getElementsByClassName(this.options.slideContent)[0];
		this.slideItemEl = this.slideWrapperEl.getElementsByClassName(this.options.slideItem);

		this.pullDownEl = this.OtherDetailsEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.OtherDetailsEl.querySelector(this.options.pullupClass);

		this.cardsVideoEl = this.OtherDetailsEl.getElementsByClassName(this.options.boxCardsClass)[0];

		this._setSlideWidth();
		this._slideSwiper();
		this._pagesVideo();
		this._bindEvent();
		this._listEvent();
	}

	_bindEvent() {
		const Appid = agoraConfig.agoraAppId || '', Appcert = agoraConfig.agoraCertificateId || '';

		// 切换
  		for (let i = 0; i < this.tabsItemEl.length; i++) {
			addEvent(this.tabsItemEl[i], 'click', () => {
	            if (hasClass(this.tabsItemEl[i], this.options.showClass)) return;

	            this.slideSwiper.goToPage(i, 0);
	        });
  		}

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

		// 发消息
		addEvent(this.btnPrivateLetterEl, 'click', () => {
			const {userId} = getUserInfo();
			const {userid} = getVariableFromUrl();
			const SendBird = new SendBirdAction();

			// SendBird SDK 初始化
			Spinner.start(body);
			SendBird.connect(userId).then(user => {
				SendBirdAction.getInstance()
				.createChannelWithUserIds(userid)
					.then(channel => {
						MessageChat.getInstance().render(channel.url, false);
					})
					.catch(error => {
						errorAlert(error.message);
					});
				Spinner.remove();
			}).catch(() => {
				redirectToIndex('SendBird connection failed.');
			});
		});

		// 视频呼叫
		addEvent(this.btnVideoChatEl, 'click', () => {
		    let localInfo = getUserInfo();

		    if (parseInt(localInfo.userPackage / this.info.live_price) < 1) {
		        return modal.alert(LANG.HOME.Madal.NotCoins.Text, LANG.HOME.Madal.NotCoins.Title, () => {
		            location.href = '#/user';
		        }, LANG.HOME.Madal.NotCoins.ButtonsText);
		    }

		    this.signal = new SignalingClient(Appid, Appcert);

		    this.signal.login(localInfo.userId).then((uid) => {
		        let client = new Client(this.signal, localInfo, this.info.live_price);
		        client.invite({
		            userAccount: this.info.user_id,
		            userName: this.info.user_name,
		            userHead: this.info.user_head,
		            userSex: this.info.user_sex
		        });
		    });
		});
	}

	_listEvent() {
		let self = this;
		this.cardVideoEl = this.OtherDetailsEl.querySelectorAll(this.options.cardVideoClass);

		// video list
		for (let i = 0; i < this.cardVideoEl.length; i++) {
		    addEvent(this.cardVideoEl[i], 'click', function() {
		    	let info = JSON.parse(getData(this, 'userInfo'));

		    	playVideo(info.id).then((data) => {
		    		if (!data) return;

		    		let _videoPreview = new VideoPreview(data);
		    	});
		    });
		}
	}

	// 滑块初始化
	_setSlideWidth() {
		let width = 0;
		let slideWidth = this.slideWrapperEl.clientWidth;

		for (let i = 0; i < this.slideItemEl.length; i++) {
			this.slideItemEl[i].style.width = slideWidth + 'px';
			width += slideWidth;
		}
		this.slideContentEl.style.width = width + 'px';
	}

	// Slide 滑块
	_slideSwiper() {
		this.slideSwiper = new BScroll(this.options.slideWrapper, {
			startX: 2,
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
		});

		this.slideSwiper.on('scrollEnd', (pos) => {
			let slideIndex = this.slideSwiper.getCurrentPage().pageX;

			if (hasClass(this.tabsItemEl[slideIndex], this.options.showClass)) return;

			for (let i = 0; i < this.tabsItemEl.length; i++) {
				toggleClass(this.tabsItemEl[i], this.options.showClass);
			}
		});
	}

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.pagesVideoSwiper = new BScroll(this.options.pagesVideoClass, {
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

			selVideoByUserId(this.info.user_id, 1, 10).then((data) => {
				if (!data) return;

				this.cardsVideoEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, 1);
				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.pagesVideoSwiper.finishPullDown();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
			});
		});

		// 上拉加载
		this.pagesVideoSwiper.on('pullingUp', () => {
			let _page = getData(this.cardsVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			selVideoByUserId(this.info.user_id, _page, 10).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.VideosList = itemData;
					this.cardsVideoEl.append(createDom(Template.render(this.tpl.list_videos_item, this.data)));
				});

				setData(this.cardsVideoEl, this.options.cardsPageIndex, _page);
				this.pagesVideoSwiper.finishPullUp();
				this.pagesVideoSwiper.refresh();
				this._listEvent();
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
	    return new OtherDetails(element, options);
	}
}