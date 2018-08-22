import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    getFindPassword
} from '../api';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class FindPassWord extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		formClass: '.form-find-password'
        };

	    extend(this.options, options);

	    this.FindPassWordEl = createDom(this._Template(element));

	    this._init(element);
	}

	_init(element) {
		this.FindPassWordEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.FindPassWordEl);
		}, 0);

		this._bindEvent();
	}

	_bindEvent() {
		const FormEvent = new Form(this.FindPassWordEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			getFindPassword(params).then(() => {
				location.href = '#/login/set';
			});
		};
	}

	static attachTo(element, options) {
	    return new FindPassWord(element, options);
	}
}