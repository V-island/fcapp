import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom
} from '../util';

const LANG = getLangConfig();

export default class Favorite extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);

	    this.init(element);

	}

	init(element) {
		this.FavoriteEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.FavoriteEl);
		}, 0);
	}

	static attachTo(element, options) {
	    return new Favorite(element, options);
	}
}