// import hello from 'hellojs/dist/hello.all.js';
import EventEmitter from './eventEmitter';
import Modal from './modal';
import {
	twitterConfig
} from './intro';

import {
	getLangConfig
} from './lang';

import {
	getLogin,
	getCountry
} from './api';

import {
	extend,
	addEvent,
	hasClass,
	addClass,
	removeClass,
	toggleClass,
	setData,
	getData,
	getLocalStorage
} from './util';

const LANG = getLangConfig();
const modal = new Modal();
let hello = require('hellojs/dist/hello.all.js');


export default class TwitterLogin extends EventEmitter {
	constructor(options) {
		super();

		this.options = {
			tagsClass: '.tag'
		};

		extend(this.options, options);

		this._init();

	}

	_init() {
		let createSdk = this._createScript();

		Promise.all([createSdk]).then((data) => {
			hello.init({
				'twitter': twitterConfig.twitterAPIKey
			}, {
				redirect_uri: 'https://localhost:8080/redirect', //代理后的重定向路径，可不填
				oauth_proxy: 'https://auth-server.herokuapp.com/proxy' //这里使用默认的代理
			});
			this.trigger('twitterLogin.start');
		});
	}

	_createScript() {
		const heads = document.getElementsByTagName("head");
		const script = document.createElement("script");

		return new Promise((resolve) => {
			if (typeof(FB) == 'undefined') {
				script.setAttribute("type", "text/javascript");
				script.setAttribute("id", "twitter-wjs");
				script.setAttribute("src", "https://platform.twitter.com/widgets.js");

				script.onload = script.onreadystatechange = function(e) {
					if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
						resolve(true);
						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;
					}
				};
				if (heads.length) {
					heads[0].appendChild(script);
				} else {
					document.documentElement.appendChild(script);
				}
			} else {
				resolve(true);
			}
		});
	}

	Login(network) {
		if (typeof(twttr) == 'undefined') {
			return modal.toast(LANG.LOGIN.Madal.Error);
		}

		hello(network).login().then((auth) => {
			hello(auth.network).api('me').then((response) => {
				let {id} = getCountry();
				let userId = response.id;

				getLogin({
					userAccount: userId,
					account_type: 2,
					country_id: id
				});
			});
		}, (e) => {
			modal.alert(LANG.LOGIN.Madal.Cancel, (_modal) => {
				modal.closeModal(_modal);
				this.trigger('twitterLogin.cancel');
			});
		});
	}

	_Login(network) {
		if (typeof(twttr) == 'undefined') {
			return modal.toast(LANG.LOGIN.Madal.Error);
		}

		// Twitter instance
		var log = console.log;
		// Twitter instance
		var twitter = hello(network);
		// Login
		twitter.login().then( function(r){
		    // Get Profile
		    return twitter.api('/me');
		}, log ) .then( function(p){
		     var res = JSON.stringify(p);//因为得不到token，但是这步已经得到用户所有信息，所以将用户信息转成JSON字符串给后台
		     console.log(res);
		     let {id} = getCountry();
		     let userId = res.id;

		     getLogin({
		     	userAccount: userId,
		     	account_type: 1,
		     	country_id: id
		     });
		}, log );
	}

	Share(URL) {
		let shareText = 'What you want can always be found'; //假设你要在标题中分享用户名，需要先定义好userName
		let shareUrl = `${URL}&text=${shareText}&url=${URL}`;
		window.open(`https://twitter.com/intent/tweet?original_referer=${shareUrl}`, '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes');
	}

	static attachTo(options) {
		return new TwitterLogin(options);
	}
}

/**
 * twitterLogin.start
 * 当加载twitter完成后的时候，会派发 twitterLogin.start 事件
 */

/**
 * twitterLogin.cancel
 * 当加载twitter取消后的时候，会派发 twitterLogin.cancel 事件
 */

/**
 * twitterLogin.logout
 * 当退出twitter后的时候，会派发 twitterLogin.logout 事件
 */