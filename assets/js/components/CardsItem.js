import { closeModal, alert, popup } from './Modal';
import {
    getLangConfig
} from '../lang';

import {
    getUserInfo
} from '../api';

import {
    jumpURL,
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

import failedLoadImg from '../../img/failed-load@2x.png';

// 直播
class CardLiveItem {
    constructor({data, blurry, handler}) {
        this.data = data;
        this.options = {
            cardCalss: 'card-live',
            blurryCalss: 'card-live-blurry',
            showdomCalss: 'blurry-showdom',
            contentCalss: 'card-content',
            topCardsCalss: 'cards-top',
            bottomCardsCalss: 'cards-bottom',
            footCardsCalss: 'card-foot',
            labelLiveCalss: 'live-label'
        };
        this.blurry = blurry;
        this.element = this._createElement(handler);
    }

    get id() {
        return this.data.user_id ? `${this.data.user_id}` : `0`;
    }

    get name() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossFemaleImg;
    }

    get fans() {
        return this.data.live_room_type == 1 ? `${this.data.fans_number}` : `${this.data.online}`;
    }

    get fansTxt() {
        return this.data.live_room_type == 1 ? `${LANG.PUBLIC.Heat}` : `${LANG.PUBLIC.Online}`;
    }

    get showdomUrl() {
        return this.data.everyday_img ? protectFromXSS(this.data.everyday_img) : failedLoadImg;
    }

    get type() {
        return this.data.live_room_type == 1 ? true : false;
    }

    get status() {
        return this.data.status ? parseInt(this.data.status) : 0;
    }

    get liveMode() {
        let text;
        switch (this.data.live_room_type) {
            case 1:
                text = `${LANG.PUBLIC.LIVE_MODE.Private}`;
                break;
            case 2:
                text = `${LANG.PUBLIC.LIVE_MODE.Party}`;
                break;
            case 3:
                text = `${LANG.PUBLIC.LIVE_MODE.Gold}`;
                break;
            case 4:
                text = `${LANG.PUBLIC.LIVE_MODE.Sexy}`;
                break;
        }
        return text;
    }

    get price() {
        return this.data.live_price ? parseInt(this.data.live_price) : 0;
    }

    get roomId() {
        return this.data.live_room_id ? this.data.live_room_id : 0;
    }

    get roomType() {
        return this.data.live_room_type ? parseInt(this.data.live_room_type) : 2;
    }

    _createElement(handler) {
        const card = createDivEl({className: ['col-50', 'card', this.options.cardCalss]});

        if (this.blurry) {
            addClass(card, 'col-100');
            addClass(card, this.options.blurryCalss);

            // showdom
            const showdom = createDivEl({className: this.options.showdomCalss, background: this.showdomUrl});
            card.appendChild(showdom);
        }

        // content
        const content = createDivEl({className: this.options.contentCalss, background: this.showdomUrl});

        // content/top
        const cardsTop = createDivEl({className: this.options.topCardsCalss});

        const labelMode = createDivEl({element: 'span', className: this.options.labelLiveCalss, content: `${this.liveMode}`});
        if (this.blurry) {
            addClass(labelMode, 'theme-danger');
        }
        cardsTop.appendChild(labelMode);

        const labelTitle = createDivEl({element: 'span', className: [this.options.labelLiveCalss, 'theme-live'], content: `${LANG.HOME.Live.Title}`});
        cardsTop.appendChild(labelTitle);
        content.appendChild(cardsTop);

        // content/bottom
        const cardsBottom = createDivEl({className: this.options.bottomCardsCalss});

        // content/foot
        const cardsFoot = createDivEl({className: this.options.footCardsCalss});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);
        if (this.blurry) {
            const acrossName = createDivEl({element: 'p', className: 'user-name', content: this.name});
            acrossInfo.appendChild(acrossName);
        }else {
            const footInfo = createDivEl({className: 'foot-info'});
            const footName = createDivEl({element: 'h3', className: 'name', content: this.name});
            const footTxt = createDivEl({element: 'p', className: 'txt', content: `${this.fans  + ' ' + this.fansTxt}`});
            footInfo.appendChild(footName);
            footInfo.appendChild(footTxt);
            acrossInfo.appendChild(footInfo);
        }
        if (this.blurry) {
            cardsBottom.appendChild(acrossInfo);
        }else {
            cardsFoot.appendChild(acrossInfo);
        }

        if (this.type) {
            const labelStatus = createDivEl({element: 'span', className: this.options.labelLiveCalss});
            if (this.status == 1) {
                addClass(labelStatus, 'busy');

                labelStatus.innerTex = `${LANG.PUBLIC.Status.Busy}`;
            }else if (this.status == 3) {
                addClass(labelStatus, 'waiting');
                labelStatus.innerTex = `${LANG.PUBLIC.Status.Waiting}`;
            }
            cardsBottom.appendChild(labelStatus);
        }else {
            const fansNumber = createDivEl({className: 'user-heat', content: `${this.fans  + ' ' + this.fansTxt}`});
            cardsBottom.appendChild(fansNumber);
        }

        content.appendChild(cardsBottom);
        card.appendChild(content);

        if (!this.blurry) {
            card.appendChild(cardsFoot);
        }

        addEvent(card, 'click', () => {
            switch (this.roomType) {
                case 1:
                    this._livesShow(handler);
                    break;
                case 2:
                    return location.href = jumpURL(`#/live?anchorid=${this.id}&type=${this.roomType}&price=${this.price}`);
                    break;
                case 3:
                    this._livesGoldShow();
                    break;
            }
        });

        return card;
    }

    _livesShow(handler) {
        if (this.status != 3) return false;

        const { userPackage } = getUserInfo();

        if (userPackage >= this.price) {
            if (handler){
                return handler({
                    anchorId: this.id,
                    clientName: this.name,
                    clientHead: this.acrossUrl,
                    roomId: this.roomId,
                    roomType: this.roomType,
                    price: this.price
                });
            }
        }else {
            return alert({
                title: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Title}`,
                text: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Text}`,
                button: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Buttons}`,
                callback: () => {
                    return location.href = jumpURL('#/user/account');
                }
            });
        }

    }

    _livesGoldShow() {
        const { userPackage } = getUserInfo();

        if (userPackage >= this.price) {
            return alert({
                title: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Title}`,
                text: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Text}`,
                button: `${LANG.LIVE_PREVIEW.Madal.GoldShowProgress.Buttons}`,
                callback: () => {
                    return location.href = jumpURL(`#/live?anchorid=${this.id}&type=${this.roomType}&price=${this.price}`);
                }
            });
        }else {
            return alert({
                title: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Title}`,
                text: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Text}`,
                button: `${LANG.LIVE_PREVIEW.Madal.NotCoins.Buttons}`,
                callback: () => {
                    return location.href = jumpURL('#/user/account');
                }
            });
        }
    }
}

class CardLiveMore {
    constructor() {
        this.options = {
            moreCalss: 'load-more'
        };
        this.element = this._createElement();
    }

    _createElement() {
        const card = createDivEl({className: 'col-100'});

        const link = createDivEl({element: 'a', className: [this.options.moreCalss, 'color-primary'], content: `${LANG.HOME.Video.Free.More}`});
        link.href = '#/live/liveList';
        card.appendChild(link);
        return card;
    }
}

export { CardLiveItem, CardLiveMore };