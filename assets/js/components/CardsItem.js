import { closeModal, alert, popup } from './Modal';
import {
    getLangConfig
} from '../lang';

import {
    getUserInfo,
    setUserInfo
} from '../api';

import {
    jumpURL,
    addEvent,
    createDivEl,
    protectFromXSS,
    timestampFromNow,
    setData,
    getData,
    hasClass,
    toggleClass,
    addClass,
    removeClass
} from '../util';

const LANG = getLangConfig();

import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';

import failedLoadImg from '../../img/failed-load@2x.png';
import placeChartImg from '../../img/place-chart@2x.png';

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
            moreClass: 'load-more'
        };
        this.element = this._createElement();
    }

    _createElement() {
        const card = createDivEl({className: 'col-100'});

        const link = createDivEl({element: 'a', className: [this.options.moreClass, 'color-primary'], content: `${LANG.HOME.Video.Free.More}`});
        link.href = '#/live/liveList';
        card.appendChild(link);
        return card;
    }
}

// 视频
class CardVideoItem {
    constructor({data, handler}) {
        this.data = data;
        this.options = {
            cardCalss: 'card-video',
            contentCalss: 'card-content',
            topCardsCalss: 'cards-top',
            bottomCardsCalss: 'cards-bottom',
            labelCalss: 'tag-label',
            statusCalss: 'status-label',
            summaryCalss: 'summary-txt',
            infoCalss: 'video-info',
            dataUserPackage: 'userPackage'
        };
        this.element = this._createElement(handler);
    }

    get id() {
        return this.data.id ? `${this.data.id}` : `0`;
    }

    get anchorId() {
        return this.data.vuser_id ? `${this.data.vuser_id}` : `0`;
    }

    get name() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossFemaleImg;
    }

    get imgUrl() {
        return this.data.img_url ? protectFromXSS(this.data.img_url) : placeChartImg;
    }

    get description() {
        return this.data.video_description ? this.data.video_description : ``;
    }

    get supportNum() {
        return this.data.support ? parseInt(this.data.support) : 0;
    }

    get support() {
        return this.data.support ? `${parseInt(this.data.support) > 999 ? '999+' : this.data.support}` : `0`;
    }

    get watch() {
        return this.data.watch_number ? `${parseInt(this.data.watch_number) > 999 ? '999+' : this.data.watch_number}` : `0`;
    }

    get type() {
        return this.data.type == 1 ? true : false;
    }

    get price() {
        return this.data.price ? parseInt(this.data.price) : 0;
    }

    get level() {
        return this.data.video_level ? this.data.video_level : 0;
    }

    get time() {
        return this.data.video_time ? timestampFromNow(this.data.video_time) : ``;
    }

    _createElement(handler) {
        const card = createDivEl({className: ['col-50', 'card', this.options.cardCalss]});

        // content
        const content = createDivEl({className: this.options.contentCalss, background: this.imgUrl});

        // content/top
        const cardsTop = createDivEl({className: this.options.topCardsCalss});

        const labelTime = createDivEl({element: 'span', content: `${this.time}`});
        cardsTop.appendChild(labelTime);

        if (this.type) {
            const labelFree = createDivEl({element: 'span', className: [this.options.statusCalss, 'free'], content: `${LANG.PUBLIC.Free}`});
            cardsTop.appendChild(labelFree);
        }else {
            const labelPrice = createDivEl({element: 'span', className: this.options.labelCalss, content: `${this.price + LANG.PUBLIC.Billing}`});
            cardsTop.appendChild(labelPrice);
        }

        content.appendChild(cardsTop);

        // content/bottom
        const cardsBottom = createDivEl({className: this.options.bottomCardsCalss});

        // description
        const summaryTxt = createDivEl({element: 'p', className: this.options.summaryCalss, content: `${this.description}`});
        cardsBottom.appendChild(summaryTxt);

        // video Info
        const videoInfo = createDivEl({className: this.options.infoCalss});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);
        const acrossName = createDivEl({element: 'p', className: 'user-name', content: `${this.name}`});
        acrossInfo.appendChild(acrossName);
        videoInfo.appendChild(acrossInfo);

        // follow
        const userFollow = createDivEl({className: 'user-follow'});
        const labelSupport = createDivEl({element: 'span', className: [this.options.labelCalss, 'praise'], content: `${this.support}`});
        const labelWatch = createDivEl({element: 'span', className: [this.options.labelCalss, 'eye'], content: `${this.watch}`});
        userFollow.appendChild(labelSupport);
        userFollow.appendChild(labelWatch);
        videoInfo.appendChild(userFollow);
        cardsBottom.appendChild(videoInfo);

        content.appendChild(cardsBottom);
        card.appendChild(content);

        addEvent(card, 'click', () => {
            if (this.type) {
                return location.href = jumpURL(`#/video?anchorid=${this.anchorId}&anchorname=${this.name}&anchorhead=${this.acrossUrl}&videoid=${this.id}&videoimg=${this.imgUrl}&support=${this.supportNum}`);
            }

            const { userPackage } = getUserInfo();

            if (userPackage >= this.price) {
                setUserInfo(this.options.dataUserPackage, userPackage - this.price);
                return location.href = jumpURL(`#/video?anchorid=${this.anchorId}&anchorname=${this.name}&anchorhead=${this.acrossUrl}&videoid=${this.id}&videoimg=${this.imgUrl}&support=${this.supportNum}`);
            }else {
                return alert({
                    title: `${LANG.HOME.Madal.NotCoins.Title}`,
                    text: `${LANG.HOME.Madal.NotCoins.Text}`,
                    button: `${LANG.HOME.Madal.NotCoins.ButtonsText}`,
                    callback: () => {
                        return location.href = jumpURL('#/user/account');
                    }
                });
            }
        });

        return card;
    }
}

class VideoWatchItem {
    constructor({data, Delete, handler}) {
        this.data = data;
        this.options = {
            cardCalss: 'card-video',
            contentCalss: 'card-content',
            topCardsCalss: 'cards-top',
            bottomCardsCalss: 'cards-bottom',
            labelCalss: 'tag-label',
            statusCalss: 'status-label',
            summaryCalss: 'summary-txt',
            infoCalss: 'video-info',
            dataUserPackage: 'userPackage'
        };
        thi ;
        this.element = this._createElement(handler, Delete);
    }

    get id() {
        return this.data.id ? `${this.data.id}` : `0`;
    }

    get anchorId() {
        return this.data.user_id ? `${this.data.user_id}` : `0`;
    }

    get imgUrl() {
        return this.data.img_url ? protectFromXSS(this.data.img_url) : placeChartImg;
    }

    get videoUrl() {
        return this.data.video_url ? protectFromXSS(this.data.video_url) : '';
    }

    get description() {
        return this.data.video_description ? this.data.video_description : ``;
    }

    get support() {
        return this.data.support ? `${parseInt(this.data.support) > 999 ? '999+' : this.data.support}` : `0`;
    }

    get watch() {
        return this.data.watch_number ? `${parseInt(this.data.watch_number) > 999 ? '999+' : this.data.watch_number}` : `0`;
    }

    get time() {
        return this.data.create_time ? timestampFromNow(this.data.create_time) : `0`;
    }

    get type() {
        return this.data.type == 1 ? true : false;
    }

    get status() {
        return parseInt(this.data.status);
    }

    _createElement(handler, Delete) {
        const card = createDivEl({className: ['col-50', 'card', this.options.cardCalss]});

        // content
        const content = createDivEl({className: this.options.contentCalss, background: this.imgUrl});

        // content/top
        const cardsTop = createDivEl({className: this.options.topCardsCalss});

        const closeIcon = createDivEl({element: 'i', className: ['icon', 'user-close-video', 'btn-close-video']});
        addEvent(closeIcon, 'click', () => {
            if (Delete) Delete(this.id);
        });
        cardsTop.appendChild(closeIcon);

        switch (this.status) {
            case 1:
                const labelReview = createDivEl({element: 'span', className: [this.options.statusCalss, 'review'], content: `${LANG.PUBLIC.Review}`});
                cardsTop.appendChild(labelReview);
                break;
            case 2:
                if (this.type) {
                    const labelFree = createDivEl({element: 'span', className: [this.options.statusCalss, 'free'], content: `${LANG.PUBLIC.Free}`});
                    cardsTop.appendChild(labelFree);
                }else {
                    const labelPrice = createDivEl({element: 'span', className: this.options.labelCalss, content: `${this.price + LANG.PUBLIC.Billing}`});
                    cardsTop.appendChild(labelPrice);
                }
                break;
            case 3:
                const labelRefuse = createDivEl({element: 'span', className: [this.options.statusCalss, 'refuse'], content: `${LANG.PUBLIC.Refuse}`});
                cardsTop.appendChild(labelRefuse);
                break;
        }

        content.appendChild(cardsTop);

        // content/bottom
        const cardsBottom = createDivEl({className: this.options.bottomCardsCalss});

        // description
        const summaryTxt = createDivEl({element: 'p', className: this.options.summaryCalss, content: `${this.description}`});
        cardsBottom.appendChild(summaryTxt);

        // video Info
        const videoInfo = createDivEl({className: this.options.infoCalss});

        const videoTime = createDivEl({element: 'p', className: 'video-time', content: `${this.time}`});
        videoInfo.appendChild(videoTime);

        // follow
        const userFollow = createDivEl({className: 'user-follow'});
        const labelSupport = createDivEl({element: 'span', className: [this.options.labelCalss, 'praise'], content: `${this.support}`});
        const labelWatch = createDivEl({element: 'span', className: [this.options.labelCalss, 'eye'], content: `${this.watch}`});
        userFollow.appendChild(labelSupport);
        userFollow.appendChild(labelWatch);
        videoInfo.appendChild(userFollow);
        cardsBottom.appendChild(videoInfo);

        content.appendChild(cardsBottom);
        card.appendChild(content);

        addEvent(card, 'click', () => {
            if (handler) handler(this.videoUrl);
        });

        return card;
    }
}

class CardVideoMore {
    constructor({free}) {
        this.options = {
            cardsClass: 'cards-header',
            headerClass: 'video-header',
            refreshClass: 'refresh',
            childClass: 'nth-child'
        };
        this.free = free;
        this.element = this._createElement();
    }

    _createElement() {
        const card = createDivEl({className: ['col-100', this.options.cardsClass, this.options.headerClass]});

        if (this.free) {
            const title = createDivEl({element: 'p', content: `${LANG.HOME.Video.Free.Title}`});
            const link = createDivEl({element: 'a', className: this.options.refreshClass, content: `${LANG.HOME.Video.Free.More}`});
            link.href = '#/video/free';
            card.appendChild(title);
            card.appendChild(link);
        }else {
            const title = createDivEl({element: 'p', content: `${LANG.HOME.Video.Exciting.Title}`});
            card.appendChild(title);
            addClass(card, this.options.childClass);
        }

        return card;
    }
}

class CardVideoAdd {
    constructor({handler}) {
        this.options = {
            cardsClass: 'video-add-card',
            contentCalss: 'card-content'
        };
        this.element = this._createElement(handler);
    }

    _createElement(handler) {
        const card = createDivEl({className: ['col-50', 'card', 'card-video', this.options.cardsClass]});

        // content
        const content = createDivEl({className: this.options.contentCalss});

        const iconBox = createDivEl({className: 'icon-box'});
        const addIcon = createDivEl({element: 'i', className: ['icon', 'user-add-video']});
        iconBox.appendChild(addIcon);
        content.appendChild(iconBox);

        const title = createDivEl({element: 'p', className: 'add-title', content: `${LANG.USER_VIDEO.Add_Title}`});
        content.appendChild(title);

        const text = createDivEl({element: 'p', className: 'text', content: `${LANG.USER_VIDEO.Add_Text}`});
        content.appendChild(text);

        card.appendChild(content);

        addEvent(card, 'click', () => {
            if (handler) handler();
        });
        return card;
    }
}

// 关注
class FavoriteItem {
    constructor({data, follow}) {
        this.data = data;
        this.options = {
            itemClass: 'list-item',
            graphicClass: 'list-item-graphic',
            textClass: 'list-item-text',
            btnClass: 'btn-follow',
            showClass: 'active'
        };
        this.element = this._createElement(follow);
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

    _createElement(follow) {
        const item = createDivEl({element: 'li'});

        const link = createDivEl({element: 'a', className: this.options.itemClass});
        link.href = `#/details?userid=${this.id}`;
        const graphic = createDivEl({element: 'span', className: [this.options.graphicClass, 'image'], background: `${this.acrossUrl}`});
        const text = createDivEl({element: 'span', className: this.options.textClass, content: `${this.name}`});
        link.appendChild(graphic);
        link.appendChild(text);
        item.appendChild(link);

        const followBtn = createDivEl({element: 'span', className: this.options.btnClass, content: `${LANG.FAVORITE.Follow}`});
        addEvent(followBtn, 'click', () => {
            let status;
            if (hasClass(followBtn, this.options.showClass)) {
                status = 1;
            }else {
                status = 2;
            }

            followBtn.innerText = status === 1 ? `${LANG.FAVORITE.Followed}` : `${LANG.FAVORITE.Follow}`;
            toggleClass(followBtn, this.options.showClass);

            if (follow) follow(this.id, status);
        });
        item.appendChild(followBtn);

        return item;
    }
}
// 黑名单
class BlackListItem {
    constructor({data, handler}) {
        this.data = data;
        this.options = {
            itemCalss: 'list-item',
            graphicCalss: 'list-item-graphic',
            imageCalss: 'image',

            textCalss: 'list-item-text',
            secondaryCalss: 'list-item-secondary',
            btnCalss: 'btn-blacklist'
        };
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

    _createElement(handler) {
        const card = createDivEl({element: 'li'});

        const item = createDivEl({className: this.options.itemCalss});

        const across = createDivEl({element: 'span', className: [this.options.graphicCalss, this.options.imageCalss], background: this.acrossUrl});
        item.appendChild(across);

        const text = createDivEl({element: 'span', className: this.options.textCalss});
        const textName = createDivEl({element: 'span', content: this.name});
        const textSecondary = createDivEl({element: 'span', className: this.options.secondaryCalss, content: `ID:${this.id}`});
        text.appendChild(textName);
        text.appendChild(textSecondary);
        item.appendChild(text);
        card.appendChild(item);

        const button = createDivEl({element: 'span', className: ['button', 'fill-primary', this.options.btnCalss], content: `${LANG.USER_BLACKLIST.Buttons}`});
        addEvent(button, 'click', () => {
            if (handler) handler(this.id);
        });
        card.appendChild(button);

        return card;
    }
}

export { CardLiveItem, CardLiveMore, CardVideoItem, VideoWatchItem, CardVideoMore, CardVideoAdd, FavoriteItem, BlackListItem };