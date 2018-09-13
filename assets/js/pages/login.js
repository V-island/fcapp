import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import FacebookLogin from '../FacebookLogin';
import TwitterLogin from '../TwitterLogin';
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
const modal = new Modal();

export default class Login extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		btnMobileClass: 'btn-mobile',
    		btnFecebookClass: 'btn-fecebook',
    		btnTwitterClass: 'btn-twitter',
    		dataIndex: 'href'
        };

	    extend(this.options, options);

	    this.FB = new FacebookLogin();
		this.Twitter = new TwitterLogin();
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
		this.btnMobileEl = this.LoginEl.getElementsByClassName(this.options.btnMobileClass)[0];
		this.btnFecebookEl = this.LoginEl.getElementsByClassName(this.options.btnFecebookClass)[0];
		this.btnTwitterEl = this.LoginEl.getElementsByClassName(this.options.btnTwitterClass)[0];

		// mobile 登录
		addEvent(this.btnMobileEl, 'click', () => {
			const Url = getData(this.btnMobileEl, this.options.dataIndex);
			return location.href = Url;
        });

        // Facebook 登录
		addEvent(this.btnFecebookEl, 'click', () => {
			this.FB.Login();
        });

        // Twitter 登录
		addEvent(this.btnTwitterEl, 'click', () => {
			this.Twitter.Login('twitter');
			// return modal.toast(LANG.LOGIN.Third_party.Text);
        });
	}

	static attachTo(element, options) {
	    return new Login(element, options);
	}
}