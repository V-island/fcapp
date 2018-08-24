import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import FacebookLogin from '../FacebookLogin';
import Modal from '../modal';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
    getLogin
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();
const FB = new FacebookLogin();

export default class LoginMobile extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
	    	formClass: '.form-login',
    		btnFecebookClass: 'btn-fecebook',
    		btnTwitterClass: 'btn-twitter',
    		dataIndex: 'href'
        };

	    extend(this.options, options);

	    this._init(element);
	}

	_init(element) {
		this.LoginMobileEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.LoginMobileEl);
			this._bindEvent();
		}, 0);
	}

	_bindEvent() {
		const FormEvent = new Form(this.LoginMobileEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			getLogin(params);
		};

		this.btnFecebookEl = this.LoginMobileEl.getElementsByClassName(this.options.btnFecebookClass)[0];
		this.btnTwitterEl = this.LoginMobileEl.getElementsByClassName(this.options.btnTwitterClass)[0];

        // Facebook 登录
		addEvent(this.btnFecebookEl, 'click', () => {
			FB.Login();
        });

        // Twitter 登录
		addEvent(this.btnTwitterEl, 'click', () => {
			return modal.toast(LANG.LOGIN.Third_party.Text);
        });
	}

	static attachTo(element, options) {
	    return new LoginMobile(element, options);
	}
}