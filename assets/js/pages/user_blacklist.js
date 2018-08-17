import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

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

export default class UserBlacklist extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();

		getUserInfo.then((data) => {
			this.data.UserInfo = data ? data : false;
			this.UserEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserEl);
			this._init();
		});
	}

	_init() {
		this.listItemEl = this.UserEl.getElementsByClassName(this.options.listItemClass);
		this._bindEvent();
	}

	_bindEvent() {

	}

	static attachTo(element, options) {
	    return new UserBlacklist(element, options);
	}
}