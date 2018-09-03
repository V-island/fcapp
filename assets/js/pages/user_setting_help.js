import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom,
    addEvent,
    toggleClass
} from '../util';

const LANG = getLangConfig();

export default class UserSettingHelp extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	listItemClass: 'list-item',
	    	showClass: 'active'
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
		Array.prototype.slice.call(this.listItemsEl).forEach(itemEl => {
			addEvent(itemEl, 'click', () => {
				let infoEl = itemEl.nextSibling;
				toggleClass(infoEl, this.options.showClass);
	        });
		});
	}

	static attachTo(element, options) {
	    return new UserSettingHelp(element, options);
	}
}