import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import SignalingClient from './signalingClient';
import Client from './client';
import Modal from './modal';
import RecordVideo from './record-video';
import {
    fcConfig,
    agoraConfig
} from './intro';
import {
    checkAuth,
    newDayRecord,
    liveStatus,
    getUserInfo
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    dispatchEvent,
    importTemplate,
    createDom,
    hasClass,
    addClass,
    removeClass,
    setLocalStorage,
    getLocalStorage
} from './util';

const LANG = getLangConfig();
const MADAL = LANG.HOME.Madal;
const modal = new Modal();
const LIVE_STATUS = 'LIVE_STATUS';

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
        this.element.insertBefore(this.tabsEl, this.element.firstChild);

        this.itemEl = this.tabsEl.getElementsByClassName(this.options.itemClass);
        this.modallLiveEl = this.tabsEl.getElementsByClassName(this.options.startLiveClass)[0];
        this.init();
    }

    init() {
        this.tpl = {};

        importTemplate(this.tabFile, (id, _template) => {
            this.tpl[id] = Template.render(_template, LANG);
        });

        if (getLocalStorage(LIVE_STATUS)) {
            this.startLiveWaiting();
        }

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
            let _modal = modal.actions(this.tpl.start_lives, {
                theme: 'theme-black',
                cancelBtn: true,
                cancelIcon: true
            });
            this._LivesEvent(_modal);
        });
    }

    _LivesEvent(modalEl) {
        let liveEl = modalEl.getElementsByClassName(this.options.liveBtnClass)[0];
        let videoEl = modalEl.getElementsByClassName(this.options.videoBtnClass)[0];

        // 直播
        addEvent(liveEl, 'click', () => {
            modal.closeModal(modalEl);

            if (!checkAuth()) {
                let _dataIncomplete = MADAL.DataIncomplete;

                modal.alert(_dataIncomplete.Text, _dataIncomplete.Title, () => {
                    location.href = '#/user';
                }, _dataIncomplete.ButtonsText);
            }

            newDayRecord().then((checkRecord)=>{
                if (checkRecord) return this.startLiveWaiting();

                let _newDay = MADAL.NewDay;
                modal.confirm(_newDay.Text, () => {
                    let _record = new RecordVideo({
                        maxTimes: 5,
                        newDayVideo: true
                    });
                    _record.show();
                    _record.on('recordVideo.upload.success', () => {
                        this.startLiveWaiting();
                    });
                }, () => {
                    this.startLiveWaiting();
                }, true);
            });

        });

        // 小视频
        addEvent(videoEl, 'click', () => {
            modal.closeModal(modalEl);
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

    _liveWaitingTemplate(options) {
        let img = options.userHead ? 'background-image: url('+ options.userHead +');' : '';
        let html = '<div class="tab-live-box"><div class="user-img '+ (options.userSex == 1 ? 'avatar-male' : 'avatar-female') +'" style="'+ img +'"></div></div>';

        return html;
    }

    static attachTo(element, options) {
        return new Tabs(element, options);
    }

    static remove(tabsEl) {
        return this.element.removeChild(tabsEl);
    }

    // 开始直播等待
    startLiveWaiting() {
        let setLiveStatus = liveStatus(1);

        setLiveStatus.then((_status) => {
            if (!_status) return;

            let info = getUserInfo();
            this.signal = new SignalingClient(agoraConfig.agoraAppId);

            this.signal.login(info.userId).then((uid) => {
                let client = new Client(this.signal, info.userId);

                setLocalStorage(LIVE_STATUS, true);
                this.liveBoxEl = createDom(this._liveWaitingTemplate(info));
                this.tabsEl.insertBefore(this.liveBoxEl, this.tabsEl.firstChild);

                addEvent(this.liveBoxEl, 'click', () => {
                    let _setLiveStatus = liveStatus(2);

                    _setLiveStatus.then((_status) => {
                        this.signal.logout().then(() => {
                            setLocalStorage(LIVE_STATUS, false);
                            this.tabsEl.removeChild(this.liveBoxEl);
                        });
                    });
                });

                client.on('client.close', () => {
                    dispatchEvent(this.liveBoxEl, 'click');
                });
            });
        });
    }

}