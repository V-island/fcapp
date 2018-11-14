import Template from 'art-template/lib/template-web';
import { FacebookPlugin, TwitterPlugin } from '../components/ThirdPartyPlugin';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import Form from '../forms';
import {
    getLangConfig
} from '../lang';

import {
	allLogin,
    getLogin,
    QuickLogin
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
	    	btnQuickLoginClass: 'btn-quick-login',
    		btnFecebookClass: 'btn-fecebook',
    		btnTwitterClass: 'btn-twitter',
    		dataIndex: 'href'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

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
			gtag('event', 'click', {
			    'event_label': 'Mobile',
			    'event_category': 'Login',
			    'non_interaction': true
			});
			getLogin(params).then((result) => {
			    gtag('event', 'success', {
			        'event_label': 'Mobile',
			        'event_category': 'Login',
			        'non_interaction': true
			    });
			}).catch((reason) => {
			    gtag('event', 'error', {
			        'event_label': `Mobile-${reason}`,
			        'event_category': 'Login',
			        'non_interaction': true
			    });
			});
		};

		this.btnQuickLoginEl = this.LoginMobileEl.getElementsByClassName(this.options.btnQuickLoginClass);
		this.btnFecebookEl = this.LoginMobileEl.getElementsByClassName(this.options.btnFecebookClass);
		this.btnTwitterEl = this.LoginMobileEl.getElementsByClassName(this.options.btnTwitterClass);

		// 快捷 登录
        if (this.btnQuickLoginEl.length > 0) {
    		addEvent(this.btnQuickLoginEl[0], 'click', () => {
    			gtag('event', 'click', {
    			    'event_label': 'QuickLogin',
    			    'event_category': 'Login',
    			    'non_interaction': true
    			});
    			QuickLogin().then((result) => {
    			    gtag('event', 'success', {
    			        'event_label': 'QuickLogin',
    			        'event_category': 'Login',
    			        'non_interaction': true
    			    });
    			}).catch((reason) => {
    			    gtag('event', 'error', {
    			        'event_label': `QuickLogin-${reason}`,
    			        'event_category': 'Login',
    			        'non_interaction': true
    			    });
    			});
            });
        }

        // Facebook 登录
        if (this.btnFecebookEl.length > 0) {
        	this.FB = new FacebookPlugin();
        	this.FB.onLogin = (accountId, accountType, countryId, userHead, userName) => {
        		getLogin({
        			userAccount: accountId,
        			account_type: accountType,
        			country_id: countryId,
        			// user_name: userName,
        			user_head: userHead,
        			registerWay: 2
        		}).then((result) => {
        		    gtag('event', 'success', {
        		        'event_label': 'Facebook',
        		        'event_category': 'Login',
        		        'non_interaction': true
        		    });
        		}).catch((reason) => {
        		    gtag('event', 'error', {
        		        'event_label': `Facebook-${reason}`,
        		        'event_category': 'Login',
        		        'non_interaction': true
        		    });
        		});
        	};

        	this.FB.onClickEvent = () => {
        		gtag('event', 'click', {
        		    'event_label': 'Facebook',
        		    'event_category': 'Login',
        		    'non_interaction': true
        		});
        	};

        	this.FB.onCancelEvent = () => {
        		gtag('event', 'cancel', {
        		    'event_label': 'Facebook',
        		    'event_category': 'Login',
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
        		getLogin({
					userAccount: accountId,
					account_type: accountType,
					country_id: countryId,
					// user_name: userName,
					user_head: userHead,
					registerWay: 2
				}).then((result) => {
				    gtag('event', 'success', {
				        'event_label': 'Twitter',
				        'event_category': 'Login',
				        'non_interaction': true
				    });
				}).catch((reason) => {
				    gtag('event', 'error', {
				        'event_label': `Twitter-${reason}`,
				        'event_category': 'Login',
				        'non_interaction': true
				    });
				});
        	};

        	this.Twitter.onClickEvent = () => {
        		gtag('event', 'click', {
        		    'event_label': 'Twitter',
        		    'event_category': 'Login',
        		    'non_interaction': true
        		});
        	};

        	this.Twitter.onCancelEvent = () => {
        		gtag('event', 'cancel', {
        		    'event_label': 'Twitter',
        		    'event_category': 'Login',
        		    'non_interaction': true
        		});
        	};

    		addEvent(this.btnTwitterEl[0], 'click', () => {
    			this.Twitter.Login('twitter');
            });
        }
	}

	static attachTo(element, options) {
	    return new LoginMobile(element, options);
	}
}