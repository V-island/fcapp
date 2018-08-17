import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Swiper from 'swiper';

import {
    getLangConfig
} from '../lang';

import {
    personCenter
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserAccountHistory extends EventEmitter {
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
		personCenter().then((data) => {
			this.data.HistoryList = data;

			this.UserAccountHistoryEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserAccountHistoryEl);
			this._init();
		});
	}

	_init() {
		// this.listItemEl = this.UserAccountHistoryEl.getElementsByClassName(this.options.listItemClass);

		this._bindEvent();
	}

	_bindEvent() {

	}

	static attachTo(element, options) {
	    return new UserAccountHistory(element, options);
	}
}