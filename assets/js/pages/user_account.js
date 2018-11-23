import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Pay from '../Pay';
import {
	body,
	baseURL,
	paypalConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
	payWay,
    personCenter,
    selAllGoods
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    hasClass,
    addClass,
    removeClass,
    toggleClass,
    setData,
    getData
} from '../util';

const LANG = getLangConfig();

export default class UserAccount extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	showClass: 'active'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}


	init(element) {
		let getUserInfo = personCenter();
		let getSelAllGoods = selAllGoods();
		let getPayWay = payWay();

		Promise.all([getUserInfo, getSelAllGoods, getPayWay]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;
			this.data.AllGoodsList = data[1] ? data[1] : false;
			this.data.PayWayList = data[2] ? data[2] : false;

			this.UserAccountEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserAccountEl);
			this._init();
		});
	}

	_init() {
		Pay.attachTo(this.UserAccountEl);
	}

	static attachTo(element, options) {
	    return new UserAccount(element, options);
	}
}