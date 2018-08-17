import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    personCenter,
    appLoginOut
} from '../api';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserSetting extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	itemNotificationClass: 'item-notification',
	    	itemSoundClass: 'item-sound',
	    	itemShockClass: 'item-shock',
	    	itemQuitClass: 'item-quit'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let getUserInfo = personCenter();

		getUserInfo.then((data) => {
			this.data.UserInfo = data ? data : false;
			this.UserSettingEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserSettingEl);
			this._init();
		});
	}

	_init() {
		this.itemNotificationEl = this.UserSettingEl.getElementsByClassName(this.options.itemNotificationClass)[0];
		this.itemSoundEl = this.UserSettingEl.getElementsByClassName(this.options.itemSoundClass)[0];
		this.itemShockEl = this.UserSettingEl.getElementsByClassName(this.options.itemShockClass)[0];
		this.itemQuitEl = this.UserSettingEl.getElementsByClassName(this.options.itemQuitClass)[0];

		this._bindEvent();
	}

	_bindEvent() {

		addEvent(this.itemNotificationEl, 'click', () => {

        });

        addEvent(this.itemSoundEl, 'click', () => {

        });

        addEvent(this.itemShockEl, 'click', () => {

        });

        addEvent(this.itemQuitEl, 'click', () => {
			appLoginOut();
        });
	}

	static attachTo(element, options) {
	    return new UserSetting(element, options);
	}
}