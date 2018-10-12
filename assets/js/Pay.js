import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import { Spinner } from './components/Spinner';
import Modal from './modal';
import {
	baseURL,
	paypalConfig,
	codapayConfig
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
		this.payType = 1;
		this.totalPrice = '';
		this.goodsPrice = '';
		this.goodsId = '';
		this.currency = currency_type;

		let createPaypal = this._createPaypalScript();
		let createCodapay = this._createCodapayScript();

		this.tagsEl = this.PayEl.querySelector(this.options.tagsClass);
		this.tagLabelEl = this.tagsEl.getElementsByClassName(this.options.tagLabelClass);

		// this.listEl = this.PayEl.querySelector(this.options.listClass);
		// this.listItemEl = this.listEl.getElementsByClassName(this.options.listItemClass);

		this.btnPaypalEl = this.PayEl.querySelector(this.options.btnPaypalId);
		this.btnCreditEl = this.PayEl.querySelector(this.options.btnCreditId);
		Spinner.start(this.PayEl);
		Promise.all([createPaypal, createCodapay]).then((data) => {
			this._paypalServerEvent();
			this._bindEvent();
		});
	}

	_createPaypalScript() {
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

	_createCodapayScript() {
		const heads = document.getElementsByTagName("head");
		const script = document.createElement("script");

		return new Promise((resolve) => {
			if(typeof(paypal) == 'undefined'){
				script.setAttribute("type", "text/javascript");
				script.setAttribute("src", codapayConfig.codapaySDKAPI);
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
				this.totalPrice = getData(labelEl, this.options.dataPrice);
				addClass(labelEl, this.options.showClass);
				removeClass(this.btnPaypalEl, this.options.hideClassDOM);
				addClass(this.btnCreditEl, this.options.hideClassDOM);
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

			env: 'production', // sandbox | production

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
				gtag('event', 'click', {
				    'event_label': `${this.totalPrice} commodity`,
				    'event_category': 'Pay',
				    'non_interaction': true
				});

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
				// Set up a url on your server to execute the payment bn
				// var EXECUTE_URL = data.returnUrl.split("?")[0];

				// Set up the data you need to pass to your server
				let _data = {
					keyword: 'success',
					paymentId: data.paymentID,
					payerId: data.payerID
				};

				// Make a call to your server to execute the payment
				return paypal.request.post(baseURL, _data)
					.then((res) => {
						modal.alert(LANG.SYSTEM_CODE[res.code], (_modal) => {
							modal.closeModal(_modal);
							this.trigger('pay.success', this.goodsPrice);

							gtag('event', 'success', {
							    'event_label': `${this.totalPrice} commodity`,
							    'event_category': 'Pay',
							    'non_interaction': true
							});
						});
					});
			},

			// Buyer cancelled the payment
			onCancel: (data, actions) => {
			    gtag('event', 'cancel', {
				    'event_label': `${this.totalPrice} commodity`,
				    'event_category': 'Pay',
				    'non_interaction': true
				});
			},

			// An error occurred during the transaction
			onError: (err) => {
			    gtag('event', 'error', {
				    'event_label': `${this.totalPrice} commodity`,
				    'event_category': 'Pay',
				    'non_interaction': true
				});
			}

		}, this.options.btnPaypalId);
		Spinner.remove();
	}

	_codapayServerEvent() {
		let winObj = window.open(`${codapayConfig.codapaySandboxUrl}`, '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes');

		return new Promise((resolve) => {
			shareInfo(thirdPartyType.twitter).then((data) => {
				let title = data ? LANG.LIVE_PREVIEW.Share.Prompt.Completed_Once : LANG.LIVE_PREVIEW.Share.Prompt.Completed;

				var loop = setInterval(() => {
					if(winObj.closed) {
						clearInterval(loop);
						modal.alert(title, (_modal) => {
						 	modal.closeModal(_modal);
						 	resolve();
						});
					}
				}, 1000);
			});
		});
	}

	static attachTo(element, options) {
	    return new Pay(element, options);
	}
}

/**
 * pay.success
 * 当支付结束后的时候，会派发 pay.success 事件, 同时会传递当前充值金额 goodsPrice
 */
