import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { PullLoad } from '../components/PullLoad';
import { BlackListItem } from '../components/CardsItem';
import {
    getLangConfig
} from '../lang';

import {
	pullBlack,
    blackList
} from '../api';

import {
    extend,
    getData,
    setData,
    createDom,
    addEvent,
    createDivEl
} from '../util';

const LANG = getLangConfig();

export default class UserBlacklist extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.favorite-wrapper',
	    	listCardClass: '.list-favorite',
	    	emptyClass: 'favorite-empty',
	    	pageIndex: 'page'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		let getBlackList = blackList(this._page, this._number);

		getBlackList.then((data) => {
			this.BlackList = data ? data : [];

			this.UserBlacklistEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserBlacklistEl);
			this._init();
		});
	}

	_init() {
		this.userWrapperEl = this.UserBlacklistEl.querySelector(this.options.userWrapper);
		this.cardsListEl = this.userWrapperEl.querySelector(this.options.listCardClass);

		if (this.BlackList.length > 0) {
			this.BlackList.forEach((Item, index) => {
				let blackList;
				const handler = (id) => {
					pullBlack(id, 4);
					this.cardsListEl.removeChild(blackList.element);
				};
	            blackList = new BlackListItem({
	            	handler,
	            	data: Item
	            });

	            this.cardsListEl.appendChild(blackList.element);
	        });
		}else {
			const empty = createDivEl({className: this.options.emptyClass});
			const emptyText = createDivEl({element: 'p', content: `${LANG.USER_BLACKLIST.Text}`});
			empty.appendChild(emptyText);
			this.cardsListEl.appendChild(empty);
		}
		this._BlackPullLoad();
	}

	// Black 模块
	_BlackPullLoad() {
		const blackPullLoad = new PullLoad(this.userWrapperEl, {
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
		blackPullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				blackList(this._page, this._number).then((itemList) => {
					this.cardsListEl.innerHTML = '';

					if (itemList.length > 0) {
						itemList.forEach((Item, index) => {
							let blackList;
							const handler = (id) => {
								pullBlack(id, 4);
								this.cardsListEl.removeChild(blackList.element);
							};
				            blackList = new BlackListItem({
				            	handler,
				            	data: Item
				            });

				            this.cardsListEl.appendChild(blackList.element);
				        });
					}else {
						const empty = createDivEl({className: this.options.emptyClass});
						const emptyText = createDivEl({element: 'p', content: `${LANG.USER_BLACKLIST.Text}`});
						empty.appendChild(emptyText);
						this.cardsListEl.appendChild(empty);
					}
					setData(this.cardsListEl, this.options.pageIndex, this._page);
					resolve(true);
				});
			});
		};

		// 上拉加载
		blackPullLoad.onPullingUp = () => {
			let _page = getData(this.cardsListEl, this.options.pageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				blackList(_page, this._number).then((itemList) => {
					if (itemList.length > 0) {
						itemList.forEach((Item, index) => {
							let blackList;
							const handler = (id) => {
								pullBlack(id, 4);
								this.cardsListEl.removeChild(blackList.element);
							};
				            blackList = new BlackListItem({
				            	handler,
				            	data: Item
				            });

				            this.cardsListEl.appendChild(blackList.element);
				        });
				        setData(this.cardsListEl, this.options.pageIndex, _page);
					}
					resolve(true);
				});
			});
		};
	}

	static attachTo(element, options) {
	    return new UserBlacklist(element, options);
	}
}