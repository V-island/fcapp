import Template from 'art-template/lib/template-web';
import hello from 'hellojs/dist/hello.all.js';

import RedirectDom from '../../pages/admins/redirect.html';

import {
	body,
	twitterConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    addEvent,
    createDom,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

class Redirect {
	constructor(options) {

	    this.data = {};
	    this.options = {
	    	btnRedirectClass: 'btn-redirect'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init();
	}

	init() {
		const {TxnId, OrderId} = getVariableFromUrl();

		this.data.TxnId = TxnId ? TxnId : false;
		this.RedirectEl = createDom(Template.render(RedirectDom, this.data));
		this.btnRedirectEl = this.RedirectEl.getElementsByClassName(this.options.btnRedirectClass);

		body.appendChild(this.RedirectEl);
		this._bindEvent();
	}

	_bindEvent() {

		if (this.btnRedirectEl.length > 0) {
			Array.prototype.slice.call(this.btnRedirectEl).forEach(btnEl => {
				addEvent(btnEl, 'click', () => {
					callAndroid();
					return location.href = `${window.location.origin}/#/user/account`;
		        });
			});
		}
	}

	static attachTo(options) {
	    return new Redirect(options);
	}
}

window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
		t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);

	t._e = [];
	t.ready = function(f) {
		t._e.push(f);
	};
	return t;
}(document, "script", "twitter-wjs"));

var log = console.log;
hello.init({
	'twitter': twitterConfig.twitterAPIKey
}, {
	oauth_proxy: 'https://auth-server.herokuapp.com/proxy' //这里使用默认的代理
});

function login_twitter(network) { //登录方法，并将twitter 作为参数传入
	// Twitter instance
	var twitter = hello(network);
	// Login
	twitter.login().then(function(r) {
		console.log(r);
		// Get Profile
		return twitter.api('/me');
	}, log).then(function(p) {
		console.log("Connected to " + network + " as " + p.name);
		var res = JSON.stringify(p); //因为得不到token，但是这步已经得到用户所有信息，所以将用户信息转成JSON字符串给后台
		alert(JSON.stringify(res));
		console.log(res);
		// self.location= '/home/login.twLogin.do?result='+res;
	}, log);
}

// js调用了android中的payRedirect类中hello方法
function callAndroid(){
	if (window.payRedirect) {
		window.payRedirect.hello();
	}
}

Redirect.attachTo();