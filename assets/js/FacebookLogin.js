import EventEmitter from './eventEmitter';
import Modal from './modal';
import {
	facebookConfig
} from './intro';

import {
    getLangConfig
} from './lang';

import {
    createOrder
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


export default class FacebookLogin extends EventEmitter {
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

			FB.getLoginStatus((response) => {
				this._statusChangeCallback(response);
			});
		});
	}

	_createScript() {
		const heads = document.getElementsByTagName("head");
		const script = document.createElement("script");

		return new Promise((resolve) => {
			if(typeof(FB) == 'undefined'){
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
			}else {
				resolve(true);
			}
		});
	}

	_statusChangeCallback(response) {
		console.log('statusChangeCallback');
		console.log(response);
		// The response object is returned with a status field that lets the
		// app know the current login status of the person.
		// Full docs on the response object can be found in the documentation
		// for FB.getLoginStatus().
		if (response.status === 'connected') {
			// Logged into your app and Facebook.
			console.log('Welcome!  Fetching your information.... ');

			FB.api('/me?fields=id,name,location,hometown', (response) => {
				console.log(response);
				console.log('Successful login for: ' + response.name);
			});
		} else {
			modal.alert(LANG.LOGIN.Madal.Cancel, (_modal) => {
				modal.closeModal(_modal);
				this.trigger('FacebookLogin.cancel');
			});
		}
	}

	Login() {
		FB.login((response) => {
			console.log(response);
			this._statusChangeCallback(response);
		}, {
			scope: 'public_profile,user_location,user_hometown'
		});
	}

	Logout() {
		FB.logout((response) => {
			this.trigger('picker.logout');
		});
	}

	static attachTo(options) {
	    return new FacebookLogin(options);
	}
}

/**
 * pay.success
 * 当支付结束后的时候，会派发 pay.success 事件
 */
