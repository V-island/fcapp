import Template from 'art-template/lib/template-web';
import { PullLoad } from '../components/PullLoad';
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
		this._page = 1;
		this._number = 10;
		this._type = 1;
		let getFollowList = followList(this._page, this._number, this._type);

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
		this.pagesFavoriteEl = this.FavoriteEl.querySelector(this.options.favoriteWrapper);
		this.listFavoriteEl = this.pagesFavoriteEl.getElementsByClassName(this.options.listFavoriteClass)[0];

		this._FollwPullLoad();
		this._bindEvent();
	}

	_bindEvent() {
		this.btnFollwEl = this.FavoriteEl.getElementsByClassName(this.options.btnFollwClass);

		Array.prototype.slice.call(this.btnFollwEl).forEach(follwEl => {
			this._cardFollwEvent(follwEl);
		});
	}

	_cardFollwEvent(follwEl) {
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
	}

	// Video 模块
	_FollwPullLoad() {
		const FollwPullLoad = new PullLoad(this.pagesFavoriteEl, {
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
		FollwPullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				followList(this._page, this._number, this._type).then((data) => {
					if (!data) return;

					this.listFavoriteEl.innerHTML = '';

					data.forEach((itemData, index) => {
						this.data.FollowList = itemData;
						this.data.HeaderVideos = true;
						this.listFavoriteEl.append(createDom(Template.render(this.tpl.list_favorite_items, this.data)));
					});

					setData(this.listFavoriteEl, this.options.listsPageIndex, 1);
					this._bindEvent();
					resolve(true);
				});
			});
		};

		// 上拉加载
		FollwPullLoad.onPullingUp = () => {
			let _page = getData(this.listFavoriteEl, this.options.listsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				followList(_page, this._number, this._type).then((data) => {
					if (data) {
						data.forEach((itemData, index) => {
							this.data.FollowList = itemData;
							this.data.HeaderVideos = true;

							let element = createDom(Template.render(this.tpl.list_favorite_items, this.data));
							this._cardFollwEvent(element);
							this.listFavoriteEl.append(element);
						});

						setData(this.listFavoriteEl, this.options.listsPageIndex, _page);
					}
					resolve(true);
				});
			});
		};
	}

	static attachTo(element, options) {
	    return new Favorite(element, options);
	}
}