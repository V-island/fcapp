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

export default class UserScoreExplain extends EventEmitter {
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
		this.UserScoreExplainEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.UserScoreExplainEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new UserScoreExplain(element, options);
	}
}