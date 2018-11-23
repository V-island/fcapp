import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import { closeModal, alert, toast } from './components/Modal';
import { Spinner } from './components/Spinner';
import { MessageChat } from './components/MessageChat';
import SendBirdAction from './SendBirdAction';
import {
	baseURL,
	payType,
	sendBirdConfig,
	paypalConfig,
	codapayConfig
} from './intro';

import {
    getLangConfig
} from './lang';

import {
	myCodaPay,
    createOrder,
    getUserInfo
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
    errorAlert,
    getLocalStorage
} from './util';

const LANG = getLangConfig();
const CODAPAY_CODAS = {
	'7': 356, 		// India
	'8': 764, 		// Thailand
	'11': 458,  	// Malaysia
	'12': 360,		// Indonesia
	'13': 608, 		// Philippines
	'14': 702,		// Singapore
	'Vietnam': 704, 	//
	'Myanmar': 104, 	//
	'Cambodia': 116 	//
};
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
	    	btnPayId: '#button-pay',
	    	btnCustomerId: '#button-customer',
	    	dataIndex: 'id',
	    	dataTitle: 'title',
	    	dataPrice: 'price',
	    	dataTotal: 'total',
	    	dataCurrency: 'currency',
	    	hideClassDOM: 'hide',
	    	disabledClassDOM: 'disabled',
	    	showClass: 'active'
        };

	    extend(this.options, options);

	    this._init();
	}

	_init() {
		this.payType = null;

		// 商品价格
		this.goodsId = null;
		this.goodsTitle = null;
		this.goodsPrice = null;
		this.totalPrice = null;
		this.currencyId = null;

		let createPaypal = this._createPaypalScript();
		let createCodapay = this._createCodapayScript();
		let createCustomer = this._createCustomerChannel();

		this.tagsEl = this.PayEl.querySelector(this.options.tagsClass);
		this.tagLabelEl = this.tagsEl.getElementsByClassName(this.options.tagLabelClass);
		this.tagActiveEl = this.tagsEl.getElementsByClassName(this.options.showClass);

		this.listEl = this.PayEl.querySelector(this.options.listClass);
		this.listItemEl = this.listEl.getElementsByClassName(this.options.listItemClass);
		this.listActiveEl = this.listEl.getElementsByClassName(this.options.showClass);

		this.btnPaypalEl = this.PayEl.querySelector(this.options.btnPaypalId);
		this.btnPayEl = this.PayEl.querySelector(this.options.btnPayId);
		this.btnCustomerEl = this.PayEl.querySelector(this.options.btnCustomerId);

		Spinner.start(this.PayEl);
		Promise.all([createPaypal, createCodapay, createCustomer]).then((data) => {
			// 初始化标签内容
			if (this.tagActiveEl.length > 0) {
			    this.goodsId = parseInt(getData(this.tagActiveEl[0], this.options.dataIndex));
			    this.goodsTitle = getData(this.tagActiveEl[0], this.options.dataTitle);
			    this.goodsPrice = getData(this.tagActiveEl[0], this.options.dataPrice);
			    this.totalPrice = getData(this.tagActiveEl[0], this.options.dataTotal);
			    this.currencyId = getData(this.tagActiveEl[0], this.options.dataCurrency);
			}

			// 初始化支付方式
			if (this.listActiveEl.length > 0) {
				this.payType = parseInt(getData(this.listActiveEl[0], this.options.dataIndex));
			}

			// 初始化payPal button
			if (this.payType === payType.paypalPay) {
				addClass(this.btnPayEl, this.options.hideClassDOM);
				removeClass(this.btnPaypalEl, this.options.hideClassDOM);
			}

			this._paypalServerEvent();
			this._bindEvent();
			Spinner.remove();
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

	// 链接客服频道号
	_createCustomerChannel() {
		const SendBird = new SendBirdAction();
		const {userId} = getUserInfo();

		return new Promise((resolve) => {
			if (userId == sendBirdConfig.customerUserId) {
				resolve(false);
			}

			SendBird.connect(userId).then(user => {
				SendBirdAction.getInstance()
					.createChannelWithUserIds(sendBirdConfig.customerIds, sendBirdConfig.customerName, sendBirdConfig.customerType)
					.then(channel => {
						addEvent(this.btnCustomerEl, 'click', () => {
							MessageChat.getInstance().render(channel.url, false);
						});
						resolve(false);
					})
					.catch(error => {
						errorAlert(error.message);
						resolve(false);
					});
			}).catch(() => {
				errorAlert('SendBird connection failed.');
				resolve(false);
			});
		});
	}

	_bindEvent() {
		// 价格商品选择
		Array.prototype.slice.call(this.tagLabelEl).forEach(labelEl => {
			addEvent(labelEl, 'click', () => {
				if (hasClass(labelEl, this.options.showClass)) return false;

				const activeLabelEl = this.tagsEl.getElementsByClassName(this.options.showClass)[0];

				if (activeLabelEl) {
					removeClass(activeLabelEl, this.options.showClass);
				}

				this.goodsId = parseInt(getData(labelEl, this.options.dataIndex));
				this.goodsTitle = getData(labelEl, this.options.dataTitle);
				this.goodsPrice = getData(labelEl, this.options.dataPrice);
				this.totalPrice = getData(labelEl, this.options.dataTotal);
				this.currencyId = getData(labelEl, this.options.dataCurrency);

				addClass(labelEl, this.options.showClass);
	        });
		});

		// 支付方式选择
		Array.prototype.slice.call(this.listItemEl).forEach(itemEl => {
			addEvent(itemEl, 'click', () => {
				if (hasClass(itemEl, this.options.showClass)) return false;

				const activeitemEl = this.listEl.getElementsByClassName(this.options.showClass)[0];

				if (activeitemEl) {
					removeClass(activeitemEl, this.options.showClass);
				}

				this.payType = parseInt(getData(itemEl, this.options.dataIndex));

				addClass(itemEl, this.options.showClass);

				// 初始化payPal button
				if (this.payType === payType.paypalPay) {
					addClass(this.btnPayEl, this.options.hideClassDOM);
					removeClass(this.btnPaypalEl, this.options.hideClassDOM);
				}else {
					removeClass(this.btnPayEl, this.options.hideClassDOM);
					addClass(this.btnPaypalEl, this.options.hideClassDOM);
				}
			});
		});

		// 支付 Butoon
		addEvent(this.btnPayEl, 'click', () => {
			switch(this.payType) {
				case payType.googlePay:
					toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
					break;
				case payType.linePay:
					toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
					break;
				case payType.kakooPay:
					toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
					break;
				case payType.paytmPay:
					toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
					break;
				case payType.visaPay:
					toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
					break;
				case payType.codaPay:
					this._codaPayEvent(this.currencyId);
					break;
			}
		});
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
						currency: this.currencyId
					};
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
						alert({
							text: `${LANG.SYSTEM_CODE[res.code]}`,
							callback: () => {
								this.trigger('pay.success', this.goodsPrice);

								gtag('event', 'success', {
								    'event_label': `${this.totalPrice} commodity`,
								    'event_category': 'Pay',
								    'non_interaction': true
								});
							}
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
	}

	_codaPayEvent(countryID) {
		let _country = CODAPAY_CODAS[countryID] ? CODAPAY_CODAS[countryID] : false;
		let _currency = CODAPAY_CODAS[countryID] ? CODAPAY_CODAS[countryID] : false;

		if (!_country || !_currency) {
			return toast({
						text: `${LANG.LOGIN.Madal.Error}`
					});
		}

		gtag('event', 'click', {
		    'event_label': `${this.totalPrice} commodity`,
		    'event_category': 'CodaPay',
		    'non_interaction': true
		});

		return myCodaPay(_country, _currency, this.goodsId, this.goodsTitle, this.goodsPrice, this.totalPrice).then((data) => {
				if (!data) return false;
				airtime_checkout(data.txnId);

				gtag('event', 'success', {
				    'event_label': `${this.totalPrice} commodity`,
				    'event_category': 'CodaPay',
				    'non_interaction': true
				});
			}).catch((reason) => {
		        gtag('event', 'error', {
		    	    'event_label': `${this.totalPrice} commodity`,
		    	    'event_category': 'CodaPay',
		    	    'non_interaction': true
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
