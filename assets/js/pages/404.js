import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';

import {
    getLangConfig
} from '../lang';

import {
    extend,
    createDom,
    addEvent,
    toggleClass,
    jumpURL
} from '../util';

const CONFIG = {
    rootUrl: '#/home',
    notloginUrl: '#/login/mobile'
}

const LANG = getLangConfig();
Template.defaults.imports.dataInit = (text) => {
	return text.replace(/%S/, 3);
};

export default class UserSettingHelp extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	errorTextClass: 'error-text',
	    	spanClass: 'span'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		this.errorEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.errorEl);
			this._init();
		}, 0);
	}

	_init() {
		this.errorTextEl = this.errorEl.getElementsByClassName(this.options.errorTextClass)[0];
		this.errorTextEl.innerHTML = LANG.Error.Text.replace(/%S/, '<span class="color-primary">3</span>');
		this._timedCount(3);
	}

	// 计时器
	_timedCount(times) {
	    this.Timer =  setTimeout(() => {
	    	times = times - 1;
	    	if (times == 0) {
	    		return location.href = jumpURL(CONFIG.rootUrl);
	    	}else {
	    		this.errorTextEl.innerHTML = LANG.Error.Text.replace(/%S/, `<span class="color-primary">${times}</span>`);
	    		this._timedCount(times);
	    	}
	    },1000);
	}

	static attachTo(element, options) {
	    return new UserSettingHelp(element, options);
	}
}