import Template from 'art-template/lib/template-web';
import { FacebookPlugin, TwitterPlugin } from '../components/ThirdPartyPlugin';
import EventEmitter from '../eventEmitter';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
	allLogin,
    bindAccount
} from '../api';

import {
    extend,
    jumpURL,
    addEvent,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class RegisterSafeguard extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
        this.options = {
	    	formClass: '.form-register-safeguard',
    		btnFecebookClass: 'btn-fecebook',
    		btnTwitterClass: 'btn-twitter'
        };

        extend(this.options, options);
        extend(this.data, LANG);

        this._init(element);
	}

	_init(element) {
		let getAllLogin = allLogin();

		getAllLogin.then((data) => {
			this.data.ThirdPartyList = data;
			this.RegisterSafeguardEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.RegisterSafeguardEl);
			this._bindEvent();
		});
	}

	_bindEvent() {
		const FormEvent = new Form(this.RegisterSafeguardEl, this.options);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			gtag('event', 'click', {
			    'event_label': 'Mobile',
			    'event_category': 'BindAccount',
			    'non_interaction': true
			});

			bindAccount(params).then((result) => {
			    gtag('event', 'success', {
			        'event_label': 'Mobile',
			        'event_category': 'BindAccount',
			        'non_interaction': true
			    });
			    return location.href = jumpURL('#/user/setting/security?bindtype=mobile');
			}).catch((reason) => {
			    gtag('event', 'error', {
			        'event_label': `Mobile-${reason}`,
			        'event_category': 'BindAccount',
			        'non_interaction': true
			    });
			});
		};

		this.btnFecebookEl = this.RegisterSafeguardEl.getElementsByClassName(this.options.btnFecebookClass);
		this.btnTwitterEl = this.RegisterSafeguardEl.getElementsByClassName(this.options.btnTwitterClass);

        // Facebook 登录
        if (this.btnFecebookEl.length > 0) {
        	this.FB = new FacebookPlugin();
        	this.FB.onLogin = (accountId, accountType, countryId, userHead, userName) => {
        		bindAccount({
        			account: accountId,
        			account_type: accountType
        		}).then((result) => {
        		    gtag('event', 'success', {
        		        'event_label': 'Facebook',
        		        'event_category': 'BindAccount',
        		        'non_interaction': true
        		    });
        		    return location.href = jumpURL('#/user/setting/security?bindtype=fecebook');
        		}).catch((reason) => {
        		    gtag('event', 'error', {
        		        'event_label': `Facebook-${reason}`,
        		        'event_category': 'BindAccount',
        		        'non_interaction': true
        		    });
        		});
        	};

        	this.FB.onClickEvent = () => {
        		gtag('event', 'click', {
        		    'event_label': 'Facebook',
        		    'event_category': 'BindAccount',
        		    'non_interaction': true
        		});
        	};

        	this.FB.onCancelEvent = () => {
        		gtag('event', 'cancel', {
        		    'event_label': 'Facebook',
        		    'event_category': 'BindAccount',
        		    'non_interaction': true
        		});
        	};

    		addEvent(this.btnFecebookEl[0], 'click', () => {
    			this.FB.Login();
            });
        }

        // Twitter 登录
        if (this.btnTwitterEl.length > 0) {
        	this.Twitter = new TwitterPlugin();
        	this.Twitter.onLogin = (accountId, accountType, countryId, userHead, userName) => {
        		bindAccount({
					account: accountId,
        			account_type: accountType
				}).then((result) => {
				    gtag('event', 'success', {
				        'event_label': 'Twitter',
				        'event_category': 'BindAccount',
				        'non_interaction': true
				    });
				    return location.href = jumpURL('#/user/setting/security?bindtype=twitter');
				}).catch((reason) => {
				    gtag('event', 'error', {
				        'event_label': `Twitter-${reason}`,
				        'event_category': 'BindAccount',
				        'non_interaction': true
				    });
				});
        	};

        	this.Twitter.onClickEvent = () => {
        		gtag('event', 'click', {
        		    'event_label': 'Twitter',
        		    'event_category': 'BindAccount',
        		    'non_interaction': true
        		});
        	};

        	this.Twitter.onCancelEvent = () => {
        		gtag('event', 'cancel', {
        		    'event_label': 'Twitter',
        		    'event_category': 'BindAccount',
        		    'non_interaction': true
        		});
        	};

    		addEvent(this.btnTwitterEl[0], 'click', () => {
    			this.Twitter.Login('twitter');
            });
        }
	}

	static attachTo(element, options) {
	    return new RegisterSafeguard(element, options);
	}
}