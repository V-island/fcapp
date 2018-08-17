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

export default class UserSettingSuggestion extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	formControlClass: 'form-control',
	    	btnSubmitClass: 'btn-submit'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this.UserSettingSuggestionEl = createDom(Template.render(element, this.data));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserSettingSuggestionEl);
			this._init();
		}, 0);
	}

	_init() {
		this.formControlEl = this.UserSettingSuggestionEl.getElementsByClassName(this.options.formControlClass)[0];
		this.btnSubmitEl = this.UserSettingSuggestionEl.getElementsByClassName(this.options.btnSubmitClass)[0];
		this._bindEvent();
	}

	_bindEvent() {

		addEvent(this.btnSubmitEl, 'click', () => {

        });
	}

	static attachTo(element, options) {
	    return new UserSettingSuggestion(element, options);
	}
}