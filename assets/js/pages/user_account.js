import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import Pay from '../Pay';
import {
	baseURL,
	paypalConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
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
const modal = new Modal();

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
		let getselAllGoods = selAllGoods();

		Promise.all([getUserInfo, getselAllGoods]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;
			this.data.AllGoodsList = data[1] ? data[1] : false;

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