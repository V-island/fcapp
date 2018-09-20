import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    getRegister
} from '../api';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class Register extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		formClass: '.form-register'
        };

	    extend(this.options, options);;

	    this._init(element);

	}

	_init(element) {
		this.RegisterEl = createDom(Template.render(element, LANG));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.RegisterEl);
			this._bindEvent();
		}, 0);
	}

	_bindEvent() {
		const FormEvent = new Form(this.RegisterEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			gtag('event', 'click', {
			    'event_label': 'Mobile',
			    'event_category': 'Register',
			    'non_interaction': true
			});
			getRegister(params).then((result) => {
			    gtag('event', 'success', {
			        'event_label': 'Mobile',
			        'event_category': 'Register',
			        'non_interaction': true
			    });
			}).catch((reason) => {
			    gtag('event', 'error', {
			        'event_label': 'Mobile',
			        'event_category': 'Register',
			        'non_interaction': true
			    });
			});
		};
	}

	static attachTo(element, options) {
	    return new Register(element, options);
	}
}