import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    personCenter,
    getLivePrice
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserPrice extends EventEmitter {
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
		let getPrice = getLivePrice();

		Promise.all([getUserInfo, getPrice]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;
			this.data.LivePrice = data[1] ? data[1] : false;

			this.UserPriceEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserPriceEl);
		});
	}

	static attachTo(element, options) {
	    return new UserPrice(element, options);
	}
}