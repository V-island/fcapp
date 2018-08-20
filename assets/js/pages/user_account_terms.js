import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserAccountTerms extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
        };

	    extend(this.options, options);

	    this.init(element);

	}

	init(element) {
		this.UserAccountTermsEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserAccountTermsEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new UserAccountTerms(element, options);
	}
}