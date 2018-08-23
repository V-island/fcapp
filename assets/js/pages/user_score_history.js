import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    applyCashHistory
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    dateFormat,
    setData,
    getData,
    isScrollBottom
} from '../util';

const LANG = getLangConfig();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class UserScoreHistory extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	contentClass: '.content',
	    	listHistory: 'list-history',
	    	listPageIndex: 'page'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		let getapplyCashHistory = applyCashHistory(this._page, this._number);

		getapplyCashHistory.then((data) => {
			this.data.HistoryList = data;

			this.UserScoreHistoryEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserScoreHistoryEl);
			this._init();
		});
	}

	_init() {
		this.contentEl = this.UserScoreHistoryEl.querySelector(this.options.contentClass);
		this.listEl = this.UserScoreHistoryEl.getElementsByClassName(this.options.listItemClass)[0];

		this._bindEvent();
	}

	_bindEvent() {
		addEvent(this.contentEl, 'scroll', () => {
			if (isScrollBottom(this.contentEl)) {
				let index = this._page + 1;
				applyCashHistory(index, this._number).then((data) => {
					if (!data) return;

					data.forEach((itemData, index) => {
						this.cardsVideoEl.append(this._createElement(itemData));
					});

					this._page = index;
				});
			}
		});
	}

	_createElement(_Data) {
	    const item = createDivEl({className: 'list-item'});

	    const itemIcon = createDivEl({element: 'span', className: ['icon', 'user-gold', 'list-item-graphic']});
	    item.appendChild(itemIcon);

	    const itemText = createDivEl({element: 'span', className: 'list-item-text', content: `ID:#{_Data.goods_id}`});
	    const itemSecondary = createDivEl({element: 'span', className: 'list-item-secondary', content: dateFormat(_Data.end_time, 'YYYY-MM-DD')});
	    itemText.appendChild(itemSecondary);
	    item.appendChild(itemText);

	    const lastMessageText = createDivEl({element: 'span', className: 'list-item-meta-txt', content: `+#{_Data.title}`});
	    item.appendChild(lastMessageText);

	    return item;
	}

	static attachTo(element, options) {
	    return new UserScoreHistory(element, options);
	}
}