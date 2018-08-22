import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    getUpdatePassword
} from '../api';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class SetPassWord extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		formClass: '.form-set-password'
        };

	    extend(this.options, options);

	    this._init(element);

	}

	_init(element) {
		this.SetPassWordEl = createDom(Template.render(element, LANG));
	    setTimeout(() => {
	    	this.trigger('pageLoadStart', this.SetPassWordEl);
	    }, 0);
		this._bindEvent();
	}

	_bindEvent() {
		const FormEvent = new Form(this.SetPassWordEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			getUpdatePassword(params).then(() => {
				location.href = '#/login';
			});
		};
	}

	static attachTo(element, options) {
	    return new SetPassWord(element, options);
	}
}