import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom,
    addEvent
} from '../util';

const LANG = getLangConfig();

export default class UserSettingHelp extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	listItemClass: 'list-info-item'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this.UserSettingHelpEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserSettingHelpEl);
			this._init();
		}, 0);
	}

	_init() {
		this.listItemsEl = this.UserSettingHelpEl.getElementsByClassName(this.options.listItemClass);

		this._bindEvent();
	}

	_bindEvent() {

		for (let i = 0; i < this.listItemsEl.length; i++) {
			addEvent(this.listItemsEl[i], 'click', () => {
				console.log(i);
	        });
		}
	}

	static attachTo(element, options) {
	    return new UserSettingHelp(element, options);
	}
}