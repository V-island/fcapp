import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import {
    getLangConfig
} from '../lang';

import {
	getUserInfo,
    personCenter,
    checkBindingStatus
} from '../api';

import {
    extend,
    jumpURL,
    createDom,
    addEvent,
    getData
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class User extends EventEmitter {
	constructor(element, options) {
	    super();
	    this.data = {};
	    this.options = {
	    	listItemClass: 'list-item',
	    	listItemHref: 'href'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();

		Promise.all([getUserInfo]).then((data) => {
			this.data.UserInfo = data[0] ? data[0] : false;

			this.UserEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserEl);
			this._init();
		});
	}

	_init() {
		this.listItemEl = this.UserEl.getElementsByClassName(this.options.listItemClass);
		this._bindEvent();
	}

	_bindEvent() {
		if (!checkBindingStatus()) {
			let {userId} = getUserInfo();
		    modal.alert(LANG.REGISTER.Madal.Account_Not_Safe.Text.replace('%S', userId), LANG.REGISTER.Madal.Account_Not_Safe.Title, (_modal) => {
		        modal.closeModal(_modal);
		        return location.href = jumpURL('#/register/safeguard');
		    }, LANG.REGISTER.Madal.Account_Not_Safe.Buttons);
		}

		Array.prototype.slice.call(this.listItemEl).forEach(ItemEl => {
			addEvent(ItemEl, 'click', () => {
				let href = getData(ItemEl, this.options.listItemHref);
				return location.href = jumpURL(href);
	        });
		});
	}

	static attachTo(element, options) {
	    return new User(element, options);
	}
}