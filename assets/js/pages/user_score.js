import Template from 'art-template/lib/template-web';
import { closeModal, alert } from '../components/Modal';
import EventEmitter from '../eventEmitter';
import {
    getLangConfig
} from '../lang';

import {
    extractScore
} from '../api';

import {
    extend,
    jumpURL,
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
			this.userScore = data.user_score ? data.user_score : 0;
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
		    	if (this.userScore <= money) {
		    		return alert({
						text: `${LANG.USER_SCORE.Insufficient_points}`
					});
		    	}
		    	return location.href = jumpURL(`#/user/score/withdraw?money=${money}`);
		    });
		});
	}

	static attachTo(element, options) {
	    return new UserScore(element, options);
	}
}