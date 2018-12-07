import hello from 'hellojs/dist/hello.all.js';
import EventEmitter from '../eventEmitter';
import { alert, toast } from './Modal';
import {
	domainURL,
	facebookConfig,
	twitterConfig,
	thirdPartyType
} from '../intro';

import {
	getLangConfig
} from '../lang';

import {
	getLogin,
	shareInfo,
	getCountry
} from '../api';

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
} from '../util';

const LANG = getLangConfig();
// let hello = require('hellojs/dist/hello.all.js');s


class FacebookPlugin extends EventEmitter {
	constructor(options) {
		super();

		this.options = {
			tagsClass: '.tag'
		};

		extend(this.options, options);

		this.onLogin = null;
		this.onClickEvent = null;
		this.onCancelEvent = null;
		this._init();

	}

	_init() {

		let createSdk = this._createScript();

		Promise.all([createSdk]).then((data) => {
			FB.init({
				appId: facebookConfig.facebookAppId,
				cookie: true, // enable cookies to allow the server to access
				// the session
				xfbml: true, // parse social plugins on this page
				version: facebookConfig.facebookVersion // use graph api version 2.8
			});

			// Now that we've initialized the JavaScript SDK, we call
			// FB.getLoginStatus().  This function gets the state of the
			// person visiting this page and can return one of three states to
			// the callback you provide.  They can be:
			//
			// 1. Logged into your app ('connected')
			// 2. Logged into Facebook, but not your app ('not_authorized')
			// 3. Not logged into Facebook and can't tell if they are logged into
			//    your app or not.
			//
			// These three cases are handled in the callback function.

			// FB.getLoginStatus((response) => {
			// 	this._statusChangeCallback(response);
			// });

			this.trigger('FacebookLogin.start');
		});
	}

	_createScript() {
		const heads = document.getElementsByTagName("head");
		const script = document.createElement("script");

		return new Promise((resolve) => {
			if (typeof(FB) == 'undefined') {
				script.setAttribute("type", "text/javascript");
				script.setAttribute("id", "facebook-jssdk");
				script.setAttribute("src", "https://connect.facebook.net/en_US/sdk.js");

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

	_statusChangeCallback(response) {
		// console.log('statusChangeCallback');
		// The response object is returned with a status field that lets the
		// app know the current login status of the person.
		// Full docs on the response object can be found in the documentation
		// for FB.getLoginStatus().
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			FB.api('/me?fields=id,name,picture{url}', (response) => {
				let {id} = getCountry();
				let accountId = response.id;
				let userName = response.name ? response.name : '';
				let userHead = response.picture.data.url ? response.picture.data.url : '';

				if (this.onLogin) {
				    this.onLogin(accountId, thirdPartyType.facebook, id, userHead, userName);
				}
			});
		} else {
			alert({
				text: `${LANG.LOGIN.Madal.Cancel}`,
				callback: () =>{
					this.trigger('FacebookLogin.cancel');
				}
			});

			if (this.onCancelEvent) {
			    this.onCancelEvent();
			}
		}
	}

	Login() {
		if (typeof(FB) == 'undefined') {

			return toast({
				text: `${LANG.LOGIN.Madal.Error}`
			});
		}

		FB.login((response) => {
			this._statusChangeCallback(response);
		}, {
			scope: 'public_profile'
		});

		if (this.onClickEvent) {
		    this.onClickEvent();
		}
	}

	Share(URL) {
		if (typeof(FB) == 'undefined') {

			return toast({
				text: `${LANG.LOGIN.Madal.Error}`
			});
		}

		return new Promise((resolve) => {
			FB.ui({
					method: 'share',
					href: URL,
				},
				// callback
				(response) => {
					if (response && !response.error_message) {
						shareInfo(thirdPartyType.facebook).then((data) => {
							let title = data ? LANG.LIVE_PREVIEW.Share.Prompt.Completed_Once : LANG.LIVE_PREVIEW.Share.Prompt.Completed;

							alert({
								text: `${title}`,
								callback: () =>{
									resolve();
								}
							});
						});
					} else {
						alert({
							text: `${LANG.LIVE_PREVIEW.Share.Prompt.Error}`,
							callback: () =>{
								resolve();
							}
						});
					}
				}
			);
		});
	}

	Logout() {
		if (typeof(FB) == 'undefined') {
			return toast({
				text: `${LANG.LOGIN.Madal.Error}`
			});
		}
		FB.logout((response) => {
			this.trigger('FacebookLogin.logout');
		});
	}

	static attachTo(options) {
		return new FacebookLogin(options);
	}
}
/**
 * facebookLogin.start
 * 当加载fackbook完成后的时候，会派发 facebookLogin.start 事件
 */

/**
 * facebookLogin.cancel
 * 当加载fackbook取消后的时候，会派发 facebookLogin.cancel 事件
 */

/**
 * twitterLogin.share
 * 当加载twitter分享后的时候，会派发 twitterLogin.share 事件
 */

/**
 * facebookLogin.logout
 * 当退出fackbook后的时候，会派发 facebookLogin.logout 事件
 */

class TwitterPlugin extends EventEmitter {
	constructor(options) {
		super();

		this.options = {
			tagsClass: '.tag'
		};

		extend(this.options, options);

		this.onLogin = null;
		this.onClickEvent = null;
		this.onCancelEvent = null;
		this._init();

	}

	_init() {
		let createSdk = this._createScript();

		Promise.all([createSdk]).then((data) => {
			hello.init({
				'twitter': twitterConfig.twitterAPIKey
			}, {
				redirect_uri: `${domainURL}/redirect.html`, //代理后的重定向路径，可不填
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
				let accountId = response.id;
				let userName = response.name ? response.name : '';
				let userHead = response.thumbnail ? response.thumbnail : '';

				if (this.onLogin) {
				    this.onLogin(accountId, thirdPartyType.twitter, id, userHead, userName);
				}
			});
		}, (e) => {

			alert({
				text: `${LANG.LOGIN.Madal.Cancel}`,
				callback: () =>{
					this.trigger('twitterLogin.cancel');
				}
			});

			if (this.onCancelEvent) {
			    this.onCancelEvent();
			}
		});

		if (this.onClickEvent) {
		    this.onClickEvent();
		}
	}

	Share(URL) {
		let shareText = 'What you want can always be found'; //假设你要在标题中分享用户名，需要先定义好userName
		let shareUrl = `${URL}&text=${shareText}&url=${URL}`;
		let winObj = window.open(`https://twitter.com/intent/tweet?original_referer=${shareUrl}`, '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes');

		return new Promise((resolve) => {
			shareInfo(thirdPartyType.twitter).then((data) => {
				let title = data ? LANG.LIVE_PREVIEW.Share.Prompt.Completed_Once : LANG.LIVE_PREVIEW.Share.Prompt.Completed;

				var loop = setInterval(() => {
					if(winObj.closed) {
						clearInterval(loop);
						alert({
							text: `${title}`,
							callback: () =>{
								resolve();
							}
						});
					}
				}, 1000);
			});
		});
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
  * twitterLogin.share
  * 当加载twitter分享后的时候，会派发 twitterLogin.share 事件
  */


/**
 * twitterLogin.logout
 * 当退出twitter后的时候，会派发 twitterLogin.logout 事件
 */

export { FacebookPlugin, TwitterPlugin };