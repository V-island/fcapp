import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import {
    fcConfig
} from './intro';
import {
    getUserInfo
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    appendToFirst,
    createDom,
    hasClass,
    addClass,
    removeClass
} from './util';

const LANG = getLangConfig();

export default class Tabs extends EventEmitter {
    constructor(element, options) {
        super();

        this.options = {
            itemClass: 'bar-item',
            startLiveClass: 'btn-live',
            liveBtnClass: 'modals-live',
            videoBtnClass: 'modals-video',
            showClass: 'active'
        };
        this.tabFile = fcConfig.publicFile.bar_tabs;
        this.element = element;

        extend(this.options, options);

        this.tabsEl = createDom(this._tabsTemplate(LANG.BAR));
        appendToFirst(this.element, this.tabsEl);

        this.init();
    }

    init() {
        this.itemEl = this.tabsEl.getElementsByClassName(this.options.itemClass);
        this.modallLiveEl = this.tabsEl.getElementsByClassName(this.options.startLiveClass)[0];

        this._bindEvent();
    }

    _bindEvent() {
        // 页面切换
        for (let i = 0; i < this.itemEl.length; i++) {
            addEvent(this.itemEl[i], 'click', () => {
                let itemActive = this.tabsEl.getElementsByClassName(this.options.showClass)[0];

                if (hasClass(this.itemEl[i], this.options.showClass)) {
                    return false;
                }

                removeClass(itemActive, this.options.showClass);
                addClass(this.itemEl[i], this.options.showClass);
            });
        }

        // 直播开始按钮
        addEvent(this.modallLiveEl, 'click', () => {
            location.href = '#/user/video';
        });
    }

    _tabsTemplate(options) {
        let html = '';
        let hash = location.hash;
        html = '<nav class="bar bar-tab">';
        html += '<a class="bar-item tab-item '+ (hash == '#/home' ? 'active' : '') +'" href="#/home" data-ripple><span class="icon icon-home"></span><span class="tab-label">'+ options.Home +'</span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/favorite' ? 'active' : '') +'" href="#/favorite" data-ripple><span class="icon icon-favorite"></span><span class="tab-label">'+ options.Favorite +'</span></a>';
        html += '<a class="tab-item icons" href="javascript:void(0);"><span class="icon icon-live btn-live" data-ripple></span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/message' ? 'active' : '') +'" href="#/message" data-ripple><span class="icon icon-message"></span><span class="tab-label">'+ options.Message +'</span></a>';
        html += '<a class="bar-item tab-item '+ (hash == '#/user' ? 'active' : '') +'" href="#/user" data-ripple><span class="icon icon-me"></span><span class="tab-label">'+ options.Me +'</span></a>';
        html += '</nav>';

        return html;
    }

    static attachTo(element, options) {
        return new Tabs(element, options);
    }

    static remove(tabsEl) {
        return this.element.removeChild(tabsEl);
    }
}