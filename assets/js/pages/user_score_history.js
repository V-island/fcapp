import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
	body
} from '../intro';

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
    createDivEl,
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
	    	listItemClass: 'list-item',
	    	listIndex: 'status'
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
		this.listItemEl = this.UserScoreHistoryEl.getElementsByClassName(this.options.listItemClass);

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

		Array.prototype.slice.call(this.listItemEl).forEach(ItemEl => {
			addEvent(ItemEl, 'click', () => {
				const status = parseInt(getData(ItemEl, this.options.listIndex));

				if (status == 2 || status == 4) return false;

				return this._createStatusElement(status);
			});
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

	_createStatusElement(status) {
		const Icon = status == 1 ? 'user-under-review' : 'user-audit-failure';
		const Title = status == 1 ? LANG.USER_SCORE.Under_Review.Title : LANG.USER_SCORE.Very_Sorry.Title;
		const Text = status == 1 ? LANG.USER_SCORE.Under_Review.Text : LANG.USER_SCORE.Very_Sorry.Text;

		const groupEl = createDivEl({className: 'status-group'});
		const headerEl = createDivEl({element: 'header', className: ['bar', 'bar-flex']});
		const headerBtnIconEl = createDivEl({className: ['icon-btn', 'btn-close']});
		const headerIconEl = createDivEl({element: 'i', className: ['icon', 'icon-arrow-back']});
		headerBtnIconEl.appendChild(headerIconEl);

		const headerTitleEl = createDivEl({element: 'h1', className: 'title', content: LANG.BAR.History});
		headerEl.appendChild(headerBtnIconEl);
		headerEl.appendChild(headerTitleEl);

		const wrapperEl = createDivEl({className: ['content', 'block', 'withdraw-wrapper']});
		const contentEl = createDivEl({className: ['upload-content', 'upload-status']});
		const iconEl = createDivEl({element: 'i', className: ['icon', Icon]});
		const titleEl = createDivEl({element: 'p', className: 'title', content: Title});
		const textEl = createDivEl({element: 'p', className: 'text', content: Text});
		contentEl.appendChild(iconEl);
		contentEl.appendChild(titleEl);
		contentEl.appendChild(textEl);
		wrapperEl.appendChild(contentEl);
		groupEl.appendChild(headerEl);
		groupEl.appendChild(wrapperEl);

		body.appendChild(groupEl);

		let btnCloseEl = groupEl.getElementsByClassName('btn-close')[0];

		addEvent(btnCloseEl, 'click', () => {
			body.removeChild(groupEl);
		});
	}

	static attachTo(element, options) {
	    return new UserScoreHistory(element, options);
	}
}