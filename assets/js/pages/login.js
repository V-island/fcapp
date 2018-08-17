import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom,
    addEvent,
    getData
} from '../util';

const LANG = getLangConfig();

export default class Login extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		shareLabelClass: 'share-label',
    		dataIndex: 'href',
        };

	    extend(this.options, options);

	    this._init(element);
	}

	_init(element) {
		this.LoginEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.LoginEl);
			this._bindEvent();
		}, 0);
	}

	_bindEvent() {
		this.shareLabelEl = this.LoginEl.getElementsByClassName(this.options.shareLabelClass);

		Array.prototype.slice.call(this.shareLabelEl).forEach(labelEl => {
			addEvent(labelEl, 'click', () => {
				const Url = getData(labelEl, this.options.dataIndex);
				return location.href = Url;
	        });
		});
	}

	static attachTo(element, options) {
	    return new Login(element, options);
	}
}