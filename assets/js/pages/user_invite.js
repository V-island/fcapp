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

export default class UserInvite extends EventEmitter {
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
			this.UserInviteEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserInviteEl);
			this._init();
		});
	}

	_init() {
		// this.listItemEl = this.UserInviteEl.getElementsByClassName(this.options.listItemClass);
		this._bindEvent();
	}

	_bindEvent() {

	}

	static attachTo(element, options) {
	    return new UserInvite(element, options);
	}
}