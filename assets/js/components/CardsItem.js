import {
    getLangConfig
} from '../lang';

import {
    addEvent,
    createDivEl,
    protectFromXSS,
    timestampFromNow,
    setData,
    getData,
    toggleClass,
    addClass,
    removeClass
} from '../util';

const LANG = getLangConfig();

import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';

// 直播单个列表
class CardLiveBlurry {
    constructor(data) {
        this.data = data;
        this.options = {
            anchorCalss: 'anchor'
        };
        this.element = this._createElement();
    }

    get name() {
        return this.data.userName ? `${this.data.userName}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get text() {
        return this.data.message ? protectFromXSS(this.data.message) : ``;
    }

    get client() {
        return this.data.client ? false : true;
    }

    _createElement() {
        const card = createDivEl({className: ['col-100', 'card', 'card-live', 'card-live-blurry']});

        const showdom = createDivEl({className: 'blurry-showdom', background: `${this.name}`});

        const name = createDivEl({element: 'span', content: `${this.name}`});
        const text = createDivEl({element: 'font', content: `：${this.text}`});
        label.appendChild(name);
        label.appendChild(text);

        if (this.client) {
            label.className = 'anchor';
        }

        return label;
    }
}

// 直播列表
class CardLiveItem {
    constructor(data) {
        this.data = data;
        this.options = {
            anchorCalss: 'anchor'
        };
        this.element = this._createElement();
    }

    get name() {
        return this.data.userName ? `${this.data.userName}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get text() {
        return this.data.message ? protectFromXSS(this.data.message) : ``;
    }

    get client() {
        return this.data.client ? false : true;
    }

    _createElement() {
        const label = createDivEl({element: 'label'});
        const name = createDivEl({element: 'span', content: `${this.name}`});
        const text = createDivEl({element: 'font', content: `：${this.text}`});
        label.appendChild(name);
        label.appendChild(text);

        if (this.client) {
            label.className = 'anchor';
        }

        return label;
    }
}


export { CardLiveBlurry, CardLiveItem };