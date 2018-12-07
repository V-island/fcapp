import Template from 'art-template/lib/template-web';
import { FavoriteItem } from '../components/CardsItem';
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

	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		this._type = 1;
		let getFollowList = followList(this._page, this._number, this._type);

		Promise.all([getFollowList]).then((data) => {
			this.FollowList = data[0] ? data[0] : [];

			this.FavoriteEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.FavoriteEl);
			this._init();
		});
	}

	_init() {
		this.pagesFavoriteEl = this.FavoriteEl.querySelector(this.options.favoriteWrapper);
		this.listFavoriteEl = this.pagesFavoriteEl.getElementsByClassName(this.options.listFavoriteClass)[0];

		if (this.FollowList.length > 0) {
			// content
			this.FollowList.forEach((itemData, index) => {
				const follow = (id, status) => {
					follow(id, status);
				};
				const favoriteItem = new FavoriteItem({
					follow,
					data: itemData
				});
				this.listFavoriteEl.append(favoriteItem.element);
			});
		}else {
			const empty = createDivEl({element: 'li', className: 'favorite-empty'});
			const emptyTxt = createDivEl({element: 'p', content: `You haven't Followed at anyone yet~`});
			empty.append(emptyTxt);
			this.listFavoriteEl.append(empty);
		}

		this._FollwPullLoad();
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
				followList(this._page, this._number, this._type).then((followList) => {
					if (!followList) return;

					this.listFavoriteEl.innerHTML = '';

					if (followList) {
						// content
						followList.forEach((itemData, index) => {
							const follow = (id, status) => {
								follow(id, status);
							};
							const favoriteItem = new FavoriteItem({
								follow,
								data: itemData
							});
							this.listFavoriteEl.append(favoriteItem.element);
						});
					}else {
						const empty = createDivEl({element: 'li', className: 'favorite-empty'});
						const emptyTxt = createDivEl({element: 'p', content: `You haven't Followed at anyone yet~`});
						empty.append(emptyTxt);
						this.listFavoriteEl.append(empty);
					}

					setData(this.listFavoriteEl, this.options.listsPageIndex, this._page);
					resolve(true);
				});
			});
		};

		// 上拉加载
		FollwPullLoad.onPullingUp = () => {
			let _page = getData(this.listFavoriteEl, this.options.listsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				followList(_page, this._number, this._type).then((followList) => {
					if (followList) {
						// content
						followList.forEach((itemData, index) => {
							const follow = (id, status) => {
								follow(id, status);
							};
							const favoriteItem = new FavoriteItem({
								follow,
								data: itemData
							});
							this.listFavoriteEl.append(favoriteItem.element);
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