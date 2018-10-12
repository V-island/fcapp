import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    getUserInfo
} from '../api';

import {
    extend,
    createDom,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

export default class UserSettingSecurity extends EventEmitter {
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
		const {bindtype} = getVariableFromUrl();
		const {userPhone} = getUserInfo();

		this.data.UserPhone = userPhone ? userPhone : false;
		this.data.BindType = bindtype ? bindtype : false;

		this.UserSettingSecurityEl = createDom(Template.render(element, this.data));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserSettingSecurityEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new UserSettingSecurity(element, options);
	}
}