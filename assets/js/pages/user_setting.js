import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import {
    getLangConfig
} from '../lang';

import {
    getUserInfo,
    appLoginOut
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getLocalStorage,
	setLocalStorage
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();
const NOTIFICATION_NAME = 'Message_Notification';
const SOUND_NAME = 'Message_Sound';
const SHOCK_NAME = 'Message_Shock';

export default class UserSetting extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	itemNotificationClass: 'item-notification',
	    	itemMetaTxtClass: 'list-item-meta-txt',
	    	itemSoundClass: 'item-sound',
	    	itemShockClass: 'item-shock',
	    	itemQuitClass: 'item-quit'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		const {userPhone} = getUserInfo();
		this.data.userPhone = userPhone;
		this.UserSettingEl = createDom(Template.render(element, this.data));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserSettingEl);
			this._init();
		}, 0);
	}

	_init() {
		this.itemNotificationEl = this.UserSettingEl.getElementsByClassName(this.options.itemNotificationClass)[0];
		this.itemMetaTxtEl = this.itemNotificationEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];

		this.itemSoundEl = this.UserSettingEl.getElementsByClassName(this.options.itemSoundClass)[0];
		this.itemShockEl = this.UserSettingEl.getElementsByClassName(this.options.itemShockClass)[0];
		this.itemQuitEl = this.UserSettingEl.getElementsByClassName(this.options.itemQuitClass)[0];

		this._bindEvent();
	}

	_bindEvent() {

		addEvent(this.itemNotificationEl, 'click', () => {
			modal.options({
				buttons: [{
					text: LANG.USER_SETTING.Message_Notification.Buttons.Open,
					value: 1,
					onClick: (text, value) => {
						this.itemMetaTxtEl.innerText = text;
						setLocalStorage(NOTIFICATION_NAME, value);
					}
				}, {
					text: LANG.USER_SETTING.Message_Notification.Buttons.Not_Open,
					value: 2,
					onClick: (text, value) => {
						this.itemMetaTxtEl.innerText = text;
						setLocalStorage(NOTIFICATION_NAME, value);
					}
				}]
			});
        });

        addEvent(this.itemSoundEl, 'click', () => {
        	if ( this.itemSoundEl.checked == true){
        		setLocalStorage(SOUND_NAME, true);
        	}else{
        		setLocalStorage(SOUND_NAME, false);
        	}
        });

        addEvent(this.itemShockEl, 'click', () => {
        	if ( this.itemShockEl.checked == true){
        		setLocalStorage(SHOCK_NAME, true);
        	}else{
        		setLocalStorage(SHOCK_NAME, false);
        	}
        });

        addEvent(this.itemQuitEl, 'click', () => {
			appLoginOut();
        });
	}

	static attachTo(element, options) {
	    return new UserSetting(element, options);
	}
}