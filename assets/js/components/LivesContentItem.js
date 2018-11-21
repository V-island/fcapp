import {
    getLangConfig
} from '../lang';

import {
    random,
    addEvent,
    createDivEl,
    protectFromXSS,
    hourFromNow,
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
import giftImg from '../../img/gifts/gift-lollipop@2x.png';

import loveRedIcon from '../../img/lives/love-red@2x.png';
import loveYellowIcon from '../../img/lives/love-yellow@2x.png';
import loveBlueIcon from '../../img/lives/love-blue@2x.png';
import loveDeepBlueIcon from '../../img/lives/love-deep-blue@2x.png';
import lovePurpleIcon from '../../img/lives/love-purple@2x.png';

import enterAvatar from '../../img/lives/enter-avatar@2x.png';
import enterBg from '../../img/lives/enter-bg@2x.png';
import enterDrop from '../../img/lives/enter-drop@2x.png';

// 弹幕
class NewsItem {
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

// 礼物弹框
class GiftBox {
    constructor(data) {
        this.data = data;
        this.options = {
            wrapperClass: 'gifts-items',
            acrossClass: 'across',
            bodyClass: 'across-body',
            nameClass: 'user-name',
            txtClass: 'user-txt',
            amountClass: 'gift-amount'
        };
        this.element = this._createElement();
    }

    get name() {
        return this.data.name ? `${this.data.name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get imgUrl() {
        return this.data.imgUrl ? protectFromXSS(this.data.imgUrl) : protectFromXSS(giftImg);
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : acrossMaleImg;
    }

    get userName() {
        return this.data.userName ? `${this.data.userName}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get amount() {
        return this.data.amount ? `X${this.data.amount}` : `X1`;
    }

    _createElement() {
        const wrapper = createDivEl({className: this.options.wrapperClass});

        const acrossInfo = createDivEl({className: ['user-info', this.options.acrossClass]});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossBody = createDivEl({className: this.options.bodyClass});
        const BodyName = createDivEl({element: 'p', className: this.options.nameClass, content: this.userName});
        const BodyTxt = createDivEl({element: 'p', className: this.options.txtClass, content: this.name});
        acrossBody.appendChild(BodyName);
        acrossBody.appendChild(BodyTxt);
        acrossInfo.appendChild(acrossBody);

        const icon = createDivEl({element: 'i', className: 'icon', background: this.imgUrl});
        acrossInfo.appendChild(icon);

        const amount = createDivEl({element: 'p', className: this.options.amountClass, content: this.amount});
        acrossInfo.appendChild(amount);

        wrapper.appendChild(acrossInfo);
        return wrapper;
    }
}

// 礼物
class GiftItem {
    constructor({data, handler}) {
        this.data = data;
        this.options = {
            labelClass: 'gift-label',
            dataId: 'id',
            dataPrice: 'price',
            dataUrl: 'url',
            showCalss: 'active'
        };
        this.element = this._createElement(handler);
    }

    get id() {
        return `${this.data.id}`;
    }

    get price() {
        return this.data.gifts_price ? `${this.data.gifts_price}` : `0`;
    }

    get name() {
        return this.data.gifts_name ? `${this.data.gifts_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get imgUrl() {
        return this.data.gifts_url ? protectFromXSS(this.data.gifts_url) : protectFromXSS(giftImg);
    }

    _createElement(handler) {
        const label = createDivEl({element: 'label', className: this.options.labelClass});

        const floatIcon = createDivEl({element: 'i', className: ['icon', 'float-icon'], background: this.imgUrl});
        const icon = createDivEl({element: 'i', className: 'icon', background: this.imgUrl});
        const name = createDivEl({element: 'p', className: 'name', content: this.name});
        const title = createDivEl({element: 'p', content: this.price+ ' ' +LANG.LIVE_PREVIEW.Actions.Coins});

        label.appendChild(floatIcon);
        label.appendChild(icon);
        label.appendChild(name);
        label.appendChild(title);

        addEvent(label, 'click', () => {
            addClass(label, this.options.showCalss);
            if (handler) handler(label, floatIcon, this.id, this.price, this.name, this.imgUrl);
        });
        return label;
    }
}

// 用户进场
class ArrivalsItem {
    constructor({data}) {
        this.data = data;
        this.options = {
            itemClass: 'arrivals-item',
            avatarClass: 'enter-avatar',
            dropClass: 'enter-drop'
        };
        this.element = this._createElement();
    }

    get acrossUrl() {
        return this.data.profileUrl ? protectFromXSS(this.data.profileUrl) : acrossMaleImg;
    }

    get name() {
        return this.data.nickname ? `${this.data.nickname}` : `${LANG.MESSAGE.Anonymous}`;
    }

    _createElement() {
        const item = createDivEl({className: this.options.itemClass});

        const itemDrop = createDivEl({className: this.options.dropClass, background: enterDrop});
        item.appendChild(itemDrop);

        // across
        const acrossInfo = createDivEl({className: ['user-info', 'across']});
        const acrossAvatar = createDivEl({className: this.options.avatarClass, background: enterAvatar});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossAvatar);
        acrossInfo.appendChild(acrossImg);
        item.appendChild(acrossInfo);

        const Title = createDivEl({element: 'p', className: 'title'});
        const TitleSpan = createDivEl({element: 'span', content: this.name});
        const TitleFont = createDivEl({element: 'font', content: `${LANG.LIVE_PREVIEW.Live_Arrivals.Text}`});
        Title.appendChild(TitleSpan);
        Title.appendChild(TitleFont);
        item.appendChild(Title);

        return item;
    }
}

// 贴图
class StickerItem {
    constructor({data, handler}) {
        this.data = data;
        this.options = {
            labelClass: 'gift-label',
            dataId: 'id',
            dataUrl: 'url',
            showCalss: 'active'
        };
        this.element = this._createElement(handler);
    }

    get id() {
        return `${this.data.id}`;
    }

    get imgUrl() {
        return this.data.gifts_url ? protectFromXSS(this.data.gifts_url) : protectFromXSS(giftImg);
    }

    _createElement(handler) {
        const label = createDivEl({element: 'label', className: ['icon', this.options.labelClass], background: this.imgUrl});

        addEvent(label, 'click', () => {
            addClass(label, this.options.showCalss);
            if (handler) handler(label, this.id);
        });
        return label;
    }
}

// 点赞飘浮
class LovesItem {
    constructor() {
        this.options = {
            labelClass: 'gift-label'
        };
        this.element = this._createElement();
    }

    _createElement() {
        const icons = createDivEl({element: 'i', className: ['icon', 'love-floating']});

        switch(random(5)) {
            case 1:
                icons.style.backgroundImage = `url(${loveRedIcon})`;
                break;
            case 2:
                icons.style.backgroundImage = `url(${loveYellowIcon})`;
                break;
            case 3:
                icons.style.backgroundImage = `url(${loveBlueIcon})`;
                break;
            case 4:
                icons.style.backgroundImage = `url(${loveDeepBlueIcon})`;
                break;
            case 5:
                icons.style.backgroundImage = `url(${lovePurpleIcon})`;
                break;
        };

        return icons;
    }
}

// 倒计时
class NotCoinsItem {
    constructor({data, handler}) {
        this.data = data;
        this.options = {
            groupClass: 'notCoins-group'
        };
        this.element = this._createElement(handler);
    }

    get text() {
        return `${this.data.text}`;
    }

    get button() {
        return `${this.data.button}`;
    }

    get time() {
        return this.data.time ? `${hourFromNow(this.data.time)}` : `0`;
    }

    _createElement(handler) {
        const group = createDivEl({className: this.options.groupClass});

        const groupText = createDivEl({element: 'p'});
        const groupTime = createDivEl({element: 'font', className: 'color-danger', content: this.time});
        const groupSpan = createDivEl({element: 'span', content: this.text.replace('%S', groupTime)});

        groupText.appendChild(groupSpan);
        group.appendChild(groupText);

        const button = createDivEl({className: ['button', 'button-primary'], content: this.button});
        addEvent(button, 'click', () => {
            if (handler) handler();
        });
        group.appendChild(button);

        return group;
    }
}

// 收到礼物
class ReceiveGiftItem {
    constructor({data}) {
        this.data = data;
        this.giftInfo = JSON.parse(data.data);
        this.options = {
            itemClass: 'receive-item',
            avatarClass: 'item-avatar',
            contentClass: 'item-content',
            nameClass: 'receive-name',
            textClass: 'receive-text',
            thumbClass: 'item-thumb'
        };
        this.element = this._createElement();
    }

    get acrossUrl() {
        return this.data._sender.profileUrl ? protectFromXSS(this.data._sender.profileUrl) : acrossFemaleImg;
    }

    get userName() {
        return this.data._sender.nickname ? `${this.data._sender.nickname}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get time() {
        return this.data.createdAt ? timestampFromNow(this.data.createdAt) : `0`;
    }

    get text() {
        return `${LANG.LIVE_PREVIEW.Madal.ReceiveGift.Text}` + '' + `${this.giftInfo.giftName}`;
    }

    get imgUrl() {
        return this.giftInfo.giftImgURL ? protectFromXSS(this.giftInfo.giftImgURL) : protectFromXSS(giftImg);
    }

    get amount() {
        return this.giftInfo.giftAmount ? `X${this.giftInfo.giftAmount}` : `X1`;
    }

    _createElement() {
        const item = createDivEl({className: this.options.itemClass});
        const avatar = createDivEl({className: this.options.avatarClass, background: this.acrossUrl});
        item.appendChild(avatar);

        const content = createDivEl({className: this.options.contentClass});
        const name = createDivEl({element: 'h5', content: this.userName});
        const time = createDivEl({element: 'span', content: this.time});
        name.appendChild(time);
        content.appendChild(name);

        const text = createDivEl({element: 'p', content: this.text});
        content.appendChild(text);
        item.appendChild(content);

        const thumb = createDivEl({className: this.options.thumbClass, background: this.imgUrl});
        item.appendChild(thumb);

        return item;
    }
}

// 结算礼物列表 / 主播
class GiftCountItem {
    constructor({data}) {
        this.data = data;
        this.options = {
            itemClass: 'item',
            avatarClass: 'item-img',
            amountClass: 'item-amount'
        };
        this.element = this._createElement();
    }

    get imgUrl() {
        return this.data.gifts_url ? protectFromXSS(this.data.gifts_url) : protectFromXSS(giftImg);
    }

    get amount() {
        return this.data.amount ? `X${this.data.amount}` : `X1`;
    }

    _createElement() {
        const item = createDivEl({className: this.options.itemClass});
        const img = createDivEl({element: 'span', className: this.options.avatarClass, background: this.imgUrl});
        const amount = createDivEl({element: 'span', className: this.options.amountClass, content: this.amount});

        item.appendChild(img);
        item.appendChild(amount);

        return item;
    }
}

// 充值列表
class RechargeItem {
    constructor({data}) {
        this.data = data;
        this.options = {
            labelClass: 'recharge-label',
            showCalss: 'active'
        };
        this.element = this._createElement();
    }

    get id() {
        return `${this.data.id}`;
    }

    get title() {
        return this.data.title ? `${this.data.title}`+`${LANG.LIVE_PREVIEW.Actions.Coins}` : `${LANG.LIVE_PREVIEW.Actions.Coins}`;
    }

    get price() {
        return this.data.goods_price ? `${this.data.goods_price}` : `0`;
    }

    get total() {
        return this.data.total_price ? `${this.data.total_price}` : `0`;
    }

    get country() {
        return this.data.country_id ? `${this.data.country_id}` : `0`;
    }

    _createElement() {
        const label = createDivEl({element: 'label', className: this.options.labelClass, data: [{
            name: 'id',
            value: this.id
        }, {
            name: 'title',
            value: this.title
        }, {
            name: 'price',
            value: this.price
        }, {
            name: 'total',
            value: this.total
        }, {
            name: 'currency',
            value: this.country
        }]});

        const title = createDivEl({element: 'p', className: 'cost', content: this.title});
        const total = createDivEl({element: 'p', content: this.total});

        label.appendChild(title);
        label.appendChild(total);
        return label;
    }
}

// 支付列表
class PayItem {
    constructor({data}) {
        this.data = data;
        this.options = {
            itemClass: 'list-item',
            graphicClass: 'list-item-graphic',
            textClass: 'list-item-text',
            metaClass: 'list-item-meta',
            showCalss: 'active'
        };
        this.element = this._createElement();
    }

    get id() {
        return `${this.data.id}`;
    }

    get name() {
        return this.data.pay_way ? `${this.data.pay_way}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get imgUrl() {
        return this.data.pay_img ? protectFromXSS(this.data.pay_img) : protectFromXSS(giftImg);
    }

    _createElement() {
        const label = createDivEl({element: 'li', className: this.options.itemClass, data: {
            name: 'id',
            value: this.id
        }});

        const img = createDivEl({element: 'span', className: ['icon', this.options.graphicClass], background: this.imgUrl});
        const text = createDivEl({element: 'span', className: this.options.textClass, content: this.name});
        const meta = createDivEl({element: 'span', className: ['icon', 'modals-confirm', this.options.metaClass]});

        label.appendChild(img);
        label.appendChild(text);
        label.appendChild(meta);
        return label;
    }
}


export { NewsItem, GiftBox, GiftItem, ArrivalsItem, StickerItem, LovesItem, NotCoinsItem, ReceiveGiftItem, GiftCountItem, RechargeItem, PayItem };