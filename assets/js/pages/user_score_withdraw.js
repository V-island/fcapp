import BScroll from 'better-scroll';
import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    bindBlank,
    applyCash,
    hasBindBlank
} from '../api';

import {
    extend,
    getData,
    createDom,
    createDivEl,
    addEvent,
    isObject,
    urlParse,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    importTemplate,
    getLocalStorage,
    getVariableFromUrl
} from '../util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
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
	    	btnModifyClass: 'btn-modify',
	    	btnConfirmClass: 'btn-confirm',
	    	btnCancelClass: 'btn-cancel',
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		const { currency_code } = getLocalStorage(COUNTRY_ID_NAME);
		const { money } = getVariableFromUrl();

		let getpaypal = hasBindBlank(1);
		let getvisa = hasBindBlank(2);

		Promise.all([getpaypal, getvisa]).then((data) => {
			this.data.paypalAccount = data[0] ? data[0].blank_account : false;
			this.data.visaAccount = data[1] ? data[1].blank_account : false;
			this.data.Money = money;
			this.data.CurrencyCode = currency_code;
			this.UserScoreWithdrawEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserScoreWithdrawEl);
			this._init();

			this.paypalAccount = this.data.paypalAccount;
			this.visaAccount = this.data.visaAccount;
		});
	}

	_init() {
		// tab
		this.navTabsEl = this.UserScoreWithdrawEl.querySelector(this.options.navTabsClass);
		this.tabsItemEl = this.navTabsEl.getElementsByClassName(this.options.tabsItemClass);

		// withdraw
		this.withdrawWrapperEl = this.UserScoreWithdrawEl.querySelector(this.options.withdrawWrapper);
		this.withdrawContentEl = this.withdrawWrapperEl.getElementsByClassName(this.options.withdrawContent);

		// page
		this.paypalPageEl = this.UserScoreWithdrawEl.querySelector(this.options.paypalPageClass);
		this.paypalItemEl = this.paypalPageEl.getElementsByClassName(this.options.withdrawItem);
		this.btnPaypalModifyEl = this.paypalPageEl.getElementsByClassName(this.options.btnModifyClass)[0];

		this.visaPageEl = this.UserScoreWithdrawEl.querySelector(this.options.visaPageClass);
		this.visaItemEl = this.visaPageEl.getElementsByClassName(this.options.withdrawItem);
		this.btnVisaModifyEl = this.visaPageEl.getElementsByClassName(this.options.btnModifyClass)[0];

		// button
		this.btnConfirmEl = this.UserScoreWithdrawEl.getElementsByClassName(this.options.btnConfirmClass);

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
            		return toggleClass(ContentEl, this.options.showClass);
            	});
			});
		});

		// Paypal Modify
		addEvent(this.btnPaypalModifyEl, 'click', () => {
			Array.prototype.slice.call(this.paypalItemEl).forEach(ItemEl => {
				return toggleClass(ItemEl, this.options.showClass);
			});
		});

		// Visa Modify
		addEvent(this.btnVisaModifyEl, 'click', () => {
			Array.prototype.slice.call(this.visaItemEl).forEach(ItemEl => {
				return toggleClass(ItemEl, this.options.showClass);
			});
		});

		// button Confirm
		Array.prototype.slice.call(this.btnConfirmEl).forEach(btnEl => {
			addEvent(btnEl, 'click', () => {
				const type = getData(btnEl);
				const { money } = getVariableFromUrl();
				const account = type == '1' ? this.paypalAccount : this.visaAccount;

				applyCash(money, account, type).then((data) => {
					this._createStatusElement();
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
				this.paypalAccount = account;
				Array.prototype.slice.call(this.paypalItemEl).forEach(ItemEl => {
					return toggleClass(ItemEl, this.options.showClass);
				});
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
				this.visaAccount = account;
				Array.prototype.slice.call(this.visaItemEl).forEach(ItemEl => {
					toggleClass(ItemEl, this.options.showClass);
				});
			});
		};
	}

	_createStatusElement() {
		const content = createDivEl({className: ['upload-content', 'upload-status']});
		const icon = createDivEl({element: 'i', className: ['icon', 'user-under-review']});
		const title = createDivEl({element: 'p', className: 'title', content: LANG.USER_SCORE.Under_Review.Title});
		const text = createDivEl({element: 'p', className: 'text', content: LANG.USER_SCORE.Under_Review.Text});
		content.appendChild(icon);
		content.appendChild(title);
		content.appendChild(text);

		this.withdrawWrapperEl.innerHTML = '';
		this.navTabsEl.innerHTML = LANG.USER_SCORE.Withdraw.Title;
		this.withdrawWrapperEl.appendChild(content);
	}

	static attachTo(element, options) {
	    return new UserScoreWithdraw(element, options);
	}
}