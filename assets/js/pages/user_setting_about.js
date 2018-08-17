import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class UserSettingAbout extends EventEmitter {
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
		this.UserSettingAboutEl = createDom(Template.render(element, this.data));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserSettingAboutEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new UserSettingAbout(element, options);
	}
}