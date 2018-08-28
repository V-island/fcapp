import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import { Spinner } from './components/Spinner';
import Modal from './modal';
import {
	baseURL,
	paypalConfig
} from './intro';

import {
    getLangConfig
} from './lang';

import {
    createOrder
} from './api';

import {
    extend,
    addEvent,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    setData,
    getData,
    getLocalStorage
} from './util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
const LANG = getLangConfig();
const modal = new Modal();

export default class Pay extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.PayEl = element;
	    this.options = {
	    	tagsClass: '.tag',
	    	tagLabelClass: 'recharge-label',
	    	listClass: '.list',
	    	listItemClass: 'list-item',
	    	btnPaypalId: '#paypal-button',
	    	btnCreditId: '#credit-card-button',
	    	dataIndex: 'id',
	    	dataPrice: 'price',
	    	dataCurrency: 'currency',
	    	hideClassDOM: 'hide',
	    	showClass: 'active'
        };

	    extend(this.options, options);

	    this._init();

	}


	_init() {
		const { currency_type } = getLocalStorage(COUNTRY_ID_NAME);
		this.goodsPrice = '';
		this.payType = 1;
		this.goodsId = 1;
		this.currency = currency_type;

		let createPaypal = this._createScript();

		this.tagsEl = this.PayEl.querySelector(this.options.tagsClass);
		this.tagLabelEl = this.tagsEl.getElementsByClassName(this.options.tagLabelClass);

		// this.listEl = this.PayEl.querySelector(this.options.listClass);
		// this.listItemEl = this.listEl.getElementsByClassName(this.options.listItemClass);

		this.btnPaypalEl = this.PayEl.querySelector(this.options.btnPaypalId);
		this.btnCreditEl = this.PayEl.querySelector(this.options.btnCreditId);
		Spinner.start(this.PayEl);
		Promise.all([createPaypal]).then((data) => {
			toggleClass(this.btnPaypalEl, this.options.hideClassDOM);
			toggleClass(this.btnCreditEl, this.options.hideClassDOM);

			this._paypalServerEvent();
			this._bindEvent();

			Spinner.remove();
		});
	}

	_createScript() {
		const heads = document.getElementsByTagName("head");
		const script = document.createElement("script");

		return new Promise((resolve) => {
			if(typeof(paypal) == 'undefined'){
				script.setAttribute("type", "text/javascript");
				script.setAttribute("src", paypalConfig.paypalSDKAPI);
				script.onload = script.onreadystatechange = function(e) {
					if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
						resolve(true);
						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;
					}
				};
				if (heads.length) {
					heads[0].appendChild(script);
				} else {
					document.documentElement.appendChild(script);
				}
			}else {
				resolve(true);
			}
		});
	}

	_bindEvent() {
		Array.prototype.slice.call(this.tagLabelEl).forEach(labelEl => {
			addEvent(labelEl, 'click', () => {
				if (hasClass(labelEl, this.options.showClass)) return false;

				const activeLabelEl = this.tagsEl.getElementsByClassName(this.options.showClass)[0];

				if (activeLabelEl) {
					removeClass(activeLabelEl, this.options.showClass);
				}
				this.goodsId = parseInt(getData(labelEl, this.options.dataIndex));
				this.currency = getData(labelEl, this.options.dataCurrency);
				addClass(labelEl, this.options.showClass);
	        });
		});

		// Array.prototype.slice.call(this.listItemEl).forEach(itemEl => {
		// 	addEvent(itemEl, 'click', () => {
		// 		if (hasClass(itemEl, this.options.showClass)) return false;

		// 		const activeitemEl = this.listEl.getElementsByClassName(this.options.showClass)[0];

		// 		if (activeitemEl) {
		// 			removeClass(activeitemEl, this.options.showClass);
		// 		}
		// 		this.payType = parseInt(getData(itemEl, this.options.dataIndex));
		// 		addClass(itemEl, this.options.showClass);

		// 		toggleClass(this.btnPaypalEl, this.options.hideClassDOM);
		// 		toggleClass(this.btnCreditEl, this.options.hideClassDOM);
		// 	});
		// });
	}

	_paypalServerEvent() {
		paypal.Button.render({

			env: 'sandbox', // sandbox | production

			// Show the buyer a 'Pay Now' button in the checkout flow
			commit: true,

			style: {
				tagline: 'false',
				label: 'paypal', // checkout | credit | pay | buynow | generic
				size: 'responsive', // small | medium | large | responsive
				shape: 'rect', // pill | rect
				color: 'gold' // gold | blue | silver | black
			},

			// payment() is called when the button is clicked
			payment: (data, actions) => {
				return createOrder(this.goodsId, this.payType).then((order) => {
					let _data = {
						keyword: 'pay',
						order_id: order.order_id,
						total: order.goods_price,
						currency: this.currency
					};
					this.goodsPrice = order.goods_price;

					// Make a call to your server to set up the payment
					return paypal.request.post(baseURL, _data)
						.then((res) => {
							let token = res.payUrl.split('token=');
							return token[1];
						});

				});
			},

			// onAuthorize() is called when the buyer approves the payment
			onAuthorize: (data, actions) => {
				// Set up a url on your server to execute the payment
				var EXECUTE_URL = data.returnUrl.split("?")[0];

				// Set up the data you need to pass to your server
				let _data = {
					paymentId: data.paymentID,
					payerId: data.payerID
				};

				// Make a call to your server to execute the payment
				return paypal.request.post(EXECUTE_URL, _data)
					.then((res) => {
						modal.alert(LANG.SYSTEM_CODE[res.code], (_modal) => {
							modal.closeModal(_modal);
							this.trigger('pay.success', this.goodsPrice);
						});
					});
			}

		}, this.options.btnPaypalId);
	}

	static attachTo(element, options) {
	    return new Pay(element, options);
	}
}

/**
 * pay.success
 * 当支付结束后的时候，会派发 pay.success 事件, 同时会传递当前充值金额 goodsPrice
 */
