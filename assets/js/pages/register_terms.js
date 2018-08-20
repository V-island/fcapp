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

export default class RegisterTerms extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
        };

	    extend(this.options, options);

	    this.init(element);

	}

	init(element) {
		this.RegisterTermsEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.RegisterTermsEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new RegisterTerms(element, options);
	}
}