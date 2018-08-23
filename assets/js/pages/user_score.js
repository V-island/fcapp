import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';
import {
    getLangConfig
} from '../lang';

import {
    extractScore
} from '../api';

import {
    extend,
    createDom,
    createDivEl,
    addEvent,
    setData,
    getData,
    toggleClass,
    addClass,
    removeClass,
    getLocalStorage
} from '../util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
const LANG = getLangConfig();
const modal = new Modal();

export default class UserScore extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	cardScoreClass: 'card-score',
	    	dataMoney: 'money'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		let {id, currency_code} = getLocalStorage(COUNTRY_ID_NAME);
		let getextractScore = extractScore();

		getextractScore.then((data) => {
			this.data.UserScore = data ? data : false;
			this.data.CurrencyCode = currency_code;
			this.UserScoreEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserScoreEl);
			this._init();
		});
	}

	_init() {
		this.cardScoreEl = this.UserScoreEl.getElementsByClassName(this.options.cardScoreClass);

		this._bindEvent();
	}

	_bindEvent() {
		Array.prototype.slice.call(this.cardScoreEl).forEach(scoreEl => {
		    addEvent(scoreEl, 'click', () => {
		    	const money = getData(scoreEl, this.options.dataMoney);
		    	return location.href = `#/user/score/withdraw?money=${money}`;
		    });
		});
	}

	static attachTo(element, options) {
	    return new UserScore(element, options);
	}
}