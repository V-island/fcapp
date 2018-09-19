import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import FacebookLogin from '../FacebookLogin';
import TwitterLogin from '../TwitterLogin';
import Modal from '../modal';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
	allLogin,
    getLogin
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData,
    getLocalStorage
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class LoginMobile extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	formClass: '.form-login',
    		btnFecebookClass: 'btn-fecebook',
    		btnTwitterClass: 'btn-twitter',
    		dataIndex: 'href'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.FB = new FacebookLogin();
		this.Twitter = new TwitterLogin();
	    this._init(element);
	}

	_init(element) {
		let getAllLogin = allLogin();

		getAllLogin.then((data) => {
			this.data.ThirdPartyList = data;
			this.LoginMobileEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.LoginMobileEl);
			this._bindEvent();
		});
	}

	_bindEvent() {
		const FormEvent = new Form(this.LoginMobileEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			getLogin(params);
		};

		this.btnFecebookEl = this.LoginMobileEl.getElementsByClassName(this.options.btnFecebookClass);
		this.btnTwitterEl = this.LoginMobileEl.getElementsByClassName(this.options.btnTwitterClass);

        // Facebook 登录
        if (this.btnFecebookEl.length > 0) {
    		addEvent(this.btnFecebookEl[0], 'click', () => {
    			this.FB.Login();
            });
        }

        // Twitter 登录
        if (this.btnTwitterEl.length > 0) {
    		addEvent(this.btnTwitterEl[0], 'click', () => {
    			this.Twitter.Login('twitter');
            });
        }
	}

	static attachTo(element, options) {
	    return new LoginMobile(element, options);
	}
}