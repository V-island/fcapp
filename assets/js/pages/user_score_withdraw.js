import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    bindBlank,
    applyCash
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    isObject,
    urlParse,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    importTemplate,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

export default class UserScoreWithdraw extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	formClass: '.form-cards',
	    	withdrawWrapper: '.withdraw-wrapper',
            withdrawContent: 'withdraw-content',
            withdrawItem: 'withdraw-item',
            navTabsClass: '.nav-tabs',
	    	tabsItemClass: 'tab-pane',
	    	paypalPageClass: '.paypal-page',
	    	visaPageClass: '.visa-page',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		const { money } = getVariableFromUrl();

		this.UserScoreWithdrawEl = createDom(Template.render(element, this.data));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserScoreWithdrawEl);
			this._init();
		}, 0);
	}

	_init() {
		// tab
		this.navTabsEl = this.UserScoreWithdrawEl.querySelector(this.options.navTabsClass);
		this.tabsItemEl = this.navTabsEl.getElementsByClassName(this.options.tabsItemClass);

		// withdraw
		this.withdrawWrapperEl = this.UserScoreWithdrawEl.querySelector(this.options.withdrawWrapper);
		this.withdrawContentEl = this.withdrawWrapperEl.getElementsByClassName(this.options.withdrawContent);
		this.withdrawItemEl = this.withdrawWrapperEl.getElementsByClassName(this.options.withdrawItem);

		// page
		this.paypalPageEl = this.UserScoreWithdrawEl.querySelector(this.options.paypalPageClass);
		this.visaPageEl = this.UserScoreWithdrawEl.querySelector(this.options.visaPageClass);

		this._formPayPal();
		this._formVisa();
		this._bindEvent();
	}

	_bindEvent() {
		// 切换
		Array.prototype.slice.call(this.tabsItemEl).forEach(ItemEl => {
			addEvent(ItemEl, 'click', () => {
				if (hasClass(ItemEl, this.options.showClass)) return;

				const activeEl = this.navTabsEl.getElementsByClassName(this.options.showClass);
				if (activeEl.length > 0) {
					removeClass(activeEl[0], this.options.showClass);
				}

				addClass(ItemEl, this.options.showClass);
            	Array.prototype.slice.call(this.withdrawContentEl).forEach(ContentEl => {
            		toggleClass(ContentEl, this.options.showClass);
            	});
			});
		});
	}

	_formPayPal() {
		// paypal 表单
		const FormEvent = new Form(this.paypalPageEl, this.options);
		// 表单提交
		FormEvent.onsubmit = (params) => {
			const { account } = isObject(params) ? params : urlParse(params);
			bindBlank(account, 1).then(() => {
			});
		};
	}

	_formVisa() {
		// Visa 表单
		const FormEvent = new Form(this.visaPageEl, this.options);
		// 表单提交
		FormEvent.onsubmit = (params) => {
			const { account, time, csc } = isObject(params) ? params : urlParse(params);
			bindBlank(account, 2, time, csc).then(() => {
			});
		};
	}

	static attachTo(element, options) {
	    return new UserScoreWithdraw(element, options);
	}
}