import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
	fcConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
	follow,
    followList
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    hasClass,
    toggleClass,
    importTemplate
} from '../util';

const LANG = getLangConfig();

export default class Favorite extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	favoriteWrapper: '.favorite-wrapper',
            favoriteContent: 'favorite-content',
            pulldownClass: '.pulldown-wrapper',
            pullupClass: '.pullup-wrapper',
	    	listFavoriteClass: 'list-favorite',
	    	btnFollwClass: 'btn-follow',
	    	listsPageIndex: 'page',
	    	dataItemId: 'id',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.favoriteFile = fcConfig.publicFile.favorite_items;
	    this.init(element);

	}

	init(element) {
		let _page = 1;
		let _number = 10;
		let getFollowList = followList(_page, _number, 1);

		Promise.all([getFollowList]).then((data) => {
			this.data.FollowList = data[0] ? data[0] : false;

			this.FavoriteEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.FavoriteEl);
			this._init();
		});

		this.tpl = {};

		importTemplate(this.favoriteFile, (id, _template) => {
		    this.tpl[id] = _template;
		});
	}

	_init() {
		this.listFavoriteEl = this.FavoriteEl.getElementsByClassName(this.options.listFavoriteClass)[0];

		this.pullDownEl = this.FavoriteEl.querySelector(this.options.pulldownClass);
		this.pullUpEl = this.FavoriteEl.querySelector(this.options.pullupClass);

		this._pagesVideo();
		this._bindEvent();
	}

	_bindEvent() {
		this.btnFollwEl = this.FavoriteEl.getElementsByClassName(this.options.btnFollwClass);

		Array.prototype.slice.call(this.btnFollwEl).forEach(follwEl => {
			addEvent(follwEl, 'click', () => {
	            let _id = getData(follwEl, this.options.dataItemId),
	                status;

	            if (hasClass(follwEl, this.options.showClass)) {
	                status = 1;
	            }else {
	                status = 2;
	            }

	            follow(_id, status).then((data) => {
	            	if (!data) return;

	            	follwEl.innerHTML = status === 1 ? LANG.FAVORITE.Followed : LANG.FAVORITE.Follow;
	            	toggleClass(follwEl, this.options.showClass);
	            });
	        });
		});
	}

	// Video 模块
	_pagesVideo() {
		let pullDownRefresh = false,
			pullDownInitTop = -50;

		this.favoriteSwiper = new BScroll(this.options.favoriteWrapper, {
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
		this.favoriteSwiper.on('pullingDown', () => {
			pullDownRefresh = true;

			followList(1, 10, 1).then((data) => {
				if (!data) return;

				this.listFavoriteEl.innerHTML = '';

				data.forEach((itemData, index) => {
					this.data.FollowList = itemData;
					this.data.HeaderVideos = true;
					this.listFavoriteEl.append(createDom(Template.render(this.tpl.list_favorite_items, this.data)));
				});

				setData(this.listFavoriteEl, this.options.listsPageIndex, 1);

				pullDownRefresh = false;
				this.pullDownEl.style.top = '-1rem';
				this.favoriteSwiper.finishPullDown();
				this.favoriteSwiper.refresh();
				this._bindEvent();
			});
		});

		// 上拉加载
		this.favoriteSwiper.on('pullingUp', () => {
			let _page = getData(this.listFavoriteEl, this.options.listsPageIndex);
			_page = parseInt(_page) + 1;

			followList(_page, 10, 1).then((data) => {
				if (!data) return;

				data.forEach((itemData, index) => {
					this.data.FollowList = itemData;
					this.data.HeaderVideos = true;
					this.listFavoriteEl.append(createDom(Template.render(this.tpl.list_favorite_items, this.data)));
				});

				setData(this.listFavoriteEl, this.options.listsPageIndex, _page);
				this.favoriteSwiper.finishPullUp();
				this.favoriteSwiper.refresh();
				this._bindEvent();
			});
		});

		this.favoriteSwiper.on('scroll', (pos) => {
			if (pullDownRefresh) {
				return;
			}
			this.pullDownEl.style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
		})
	}


	static attachTo(element, options) {
	    return new Favorite(element, options);
	}
}