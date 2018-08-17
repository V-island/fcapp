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
    addEvent,
    getData
} from '../util';

const LANG = getLangConfig();

export default class User extends EventEmitter {
	constructor(element, options) {
	    super();
	    this.data = {};
	    this.options = {
	    	listItemClass: 'list-item',
	    	listItemHref: 'href'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();

		Promise.all([getUserInfo]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;

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
		let self = this;

		for (let i = 0; i < self.listItemEl.length; i++) {
			addEvent(self.listItemEl[i], 'click', function() {
				let href = getData(this, self.options.listItemHref);
				return location.href = href;
	        });
		}
	}

	static attachTo(element, options) {
	    return new User(element, options);
	}
}