import { GiftItem, StickerItem, ReceiveGiftItem, RechargeItem, PayItem } from './LivesContentItem';
import {
    body
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    random,
    addEvent,
    createDivEl,
    animationEnd,
    protectFromXSS,
    timestampFromNow,
    replaceNote,
    setData,
    getData,
    toggleClass,
    hasClass,
    addClass,
    removeClass
} from '../util';

import iconReportImg from '../../img/lives/icon-report@2x.png';
import iconBlackImg from '../../img/lives/icon-black@2x.png';
import iconAddTagImg from '../../img/lives/icon-add-tag@2x.png';;
import iconFemaleImg from '../../img/lives/icon-female@2x.png';
import iconMaleImg from '../../img/lives/icon-male@2x.png';
import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';
import giftImg from '../../img/gifts/gift-lollipop@2x.png';

const LANG = getLangConfig();

// 信息详情
class LivesAnchorInfo {
    constructor({data, report, black, addTag, favorite, message}) {
        this.data = data;
        this.options = {
            wapperClass: 'anchor-group',
            headerClass: 'anchor-header',
            contentClass: 'anchor-content',
            footerClass: 'anchor-footer',

            reportClass: 'live-report',
            blackClass: 'live-black',
            addTagClass: 'live-add-tag',

            disabledClass: 'disabled'
        };
        this.element = this._createElement(report, black, addTag, favorite, message);
    }

    get id() {
        return this.data.user_id ? `ID:${this.data.user_id}` : `ID:0`;
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : (this.data.user_sex == 1  ? acrossMaleImg : acrossFemaleImg);
    }

    get name() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get level() {
        return this.data.live_level ? `${this.data.live_level}` : `0`;
    }

    get sex() {
        return this.data.user_sex == 1  ? iconMaleImg : iconFemaleImg;
    }

    get follow() {
        return this.data.follow_status == 1 ? true : false;
    }

    get tags() {
        return this.data.list ? this.data.list : [];
    }

    _createElement(report, black, addTag, favorite, message) {
        const wapper = createDivEl({className: this.options.wapperClass});

        // header
        const header = createDivEl({className: this.options.headerClass});
        const IconReport = createDivEl({element: 'i', className: 'icon', background: iconReportImg});
        addEvent(IconReport, 'click', () => {
            if (report) report();
        });
        header.appendChild(IconReport);

        const IconBlack = createDivEl({element: 'i', className: 'icon', background: iconBlackImg});
        addEvent(IconBlack, 'click', () => {
            if (black) black();
        });
        header.appendChild(IconBlack);
        wapper.appendChild(header);

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossTitle = createDivEl({className: 'across-title'});
        const acrossName = createDivEl({element: 'p', className: 'user-name', content: this.name});
        const acrossIcon = createDivEl({element: 'i', className: ['icon', 'user-stars'], content: this.level});
        acrossTitle.appendChild(acrossName);
        acrossTitle.appendChild(acrossIcon);
        acrossInfo.appendChild(acrossTitle);

        const acrossTxt = createDivEl({element: 'p', className: 'user-txt', content: this.userHeat});
        const acrossTxtIcon = createDivEl({element: 'i', className: 'icon', background: this.sex});
        const acrossTxtFont = createDivEl({element: 'font', content: this.id});
        acrossTxt.appendChild(acrossTxtIcon);
        acrossTxt.appendChild(acrossTxtFont);
        acrossInfo.appendChild(acrossTxt);

        wapper.appendChild(acrossInfo);

        // content
        const content = createDivEl({className: this.options.contentClass});
        const contentTags = createDivEl({className: ['tag', 'tags-label']});
        this.tags.forEach((data, index) => {
            let label = createDivEl({element: 'label', className: 'tag-label', content: data.type_name});
            switch(random(5)) {
                case 1:
                    addClass(label, 'bg-success');
                    break;
                case 2:
                    addClass(label, 'bg-primary');
                    break;
                case 3:
                    addClass(label, 'bg-danger');
                    break;
                case 4:
                    addClass(label, 'bg-blue');
                    break;
                case 5:
                    addClass(label, 'bg-purple');
                    break;
            };
            contentTags.appendChild(label);
        });
        const addLabel = createDivEl({element: 'label', className: ['tag-label', 'theme-gray']});
        const addLabelIcon = createDivEl({element: 'i', className: 'icon', background: iconAddTagImg});
        const addLabelTxt = createDivEl({element: 'font', className: 'tag-label', content: `${LANG.LIVE_RECORD.EditVideoInfo.AddTag}`});
        addLabel.appendChild(addLabelIcon);
        addLabel.appendChild(addLabelTxt);
        addEvent(addLabel, 'click', () => {
            if (addTag) addTag();
        });
        contentTags.appendChild(addLabel);
        content.appendChild(contentTags);
        wapper.appendChild(content);

        // footer
        const footer = createDivEl({className: this.options.footerClass});
        const buttons = createDivEl({className: 'buttons'});
        const btnFavorite = createDivEl({className: ['button', 'button-primary'], content: `+ ${LANG.BAR.Favorite}`});
        if (this.follow) addClass(btnFavorite, this.options.disabledClass);
        addEvent(btnFavorite, 'click', () => {
            if (hasClass(btnFavorite, this.options.disabledClass)) return false;

            addClass(btnFavorite, this.options.disabledClass)
            if (favorite) favorite();
        });
        buttons.appendChild(btnFavorite);

        const btnMessage = createDivEl({className: ['button', 'fill-gray'], content: `${LANG.BAR.Message}`});
        addEvent(btnMessage, 'click', () => {
            if (message) message();
        });
        buttons.appendChild(btnMessage);
        footer.appendChild(buttons);
        wapper.appendChild(footer);

        return wapper;
    }
}

// 评论
class LivesNews {
    constructor({send}) {
        this.options = {
            groupClass: 'news-group',
            inputClass: 'news-input',
            phizClass: 'news-phiz'
        };
        this.element = this._createElement(send);
    }

    _createElement(send) {
        const group = createDivEl({className: this.options.groupClass});
        const input = createDivEl({element: 'textarea', className: this.options.inputClass});
        input.rows = 1;
        group.appendChild(input);

        const phiz = createDivEl({className: this.options.phizClass});
        const phizIcon = createDivEl({element: 'i', className: ['icon', 'modals-phiz']});
        addEvent(phiz, 'click', () => {

        });
        phiz.appendChild(phizIcon);
        group.appendChild(phiz);

        const button = createDivEl({className: ['button', 'button-primary', 'btn-send'], content: `${LANG.LIVE_PREVIEW.Actions.Send}`});
        addEvent(button, 'click', () => {
            let value = replaceNote(input.value);

            if (value == '') {
                return;
            }
            input.value = '';
            if (send) send(value);
        });
        group.appendChild(button);
        return group;
    }
}

// 分享
class LivesShare {
    constructor({facebook, twitter, tumblr}) {
        this.options = {
            groupClass: 'share-group',
            tagClass: 'tag-share',
            labelClass: 'share-label'
        };
        this.element = this._createElement(facebook, twitter, tumblr);
    }

    _createElement(facebook, twitter, tumblr) {
        const group = createDivEl({className: this.options.groupClass});

        const tag = createDivEl({className: ['tag', this.options.tagClass]});

        // Facebook
        if (facebook) {
            const btnFacebook = createDivEl({element: 'label', className: this.options.labelClass});
            const btnFacebookICon = createDivEl({element: 'i', className: ['icon', 'modals-fecebook']});
            const btnFacebookSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Share.Facebook}`});
            btnFacebook.appendChild(btnFacebookICon);
            btnFacebook.appendChild(btnFacebookSpan);
            addEvent(btnFacebook, 'click', () => {
                if (facebook) facebook();
            });
            tag.appendChild(btnFacebook);
        }

        // Twitter
        if (twitter) {
            const btnTwitter = createDivEl({element: 'label', className: this.options.labelClass});
            const btnTwitterICon = createDivEl({element: 'i', className: ['icon', 'modals-Twitter']});
            const btnTwitterSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Share.Twitter}`});
            btnTwitter.appendChild(btnTwitterICon);
            btnTwitter.appendChild(btnTwitterSpan);
            addEvent(btnTwitter, 'click', () => {
                if (twitter) twitter();
            });
            tag.appendChild(btnTwitter);
        }

        // Tumblr
        if (tumblr) {
            const btnTumblr = createDivEl({element: 'label', className: this.options.labelClass});
            const btnTumblrICon = createDivEl({element: 'i', className: ['icon', 'modals-tumblr']});
            const btnTumblrSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Share.Tumblr}`});
            btnTumblr.appendChild(btnTumblrICon);
            btnTumblr.appendChild(btnTumblrSpan);
            addEvent(btnTumblr, 'click', () => {
                if (tumblr) tumblr();
            });
            tag.appendChild(btnTumblr);
        }

        group.appendChild(tag);
        return group;
    }
}

// 礼物
class LivesGift {
    constructor({data, send, notCoins, recharge}) {
        this.data = data;
        this.options = {
            modalClass: 'gifts-modal',
            wrapperClass: 'gift-wrapper',
            contentClass: 'gift-content',
            itemClass: 'gift-item',
            groupClass: 'gift-group',
            rechargeClass: 'recharge-box',
            disabledClass: 'disabled',
            showCalss: 'active'
        };
        this.element = this._createElement(send, notCoins, recharge);
    }

    get package() {
        return this.data.package ? parseInt(this.data.package) : 0;
    }

    get packageTitle() {
        return this.data.package ? `${this.data.package + ' ' + LANG.LIVE_PREVIEW.Actions.Coins}` : `0 ${LANG.LIVE_PREVIEW.Actions.Coins}`;
    }

    get giftLists() {
        return this.data.giftList ? this.data.giftList : [];
    }

    _createElement(send, notCoins, recharge) {
        let activeEL = null,
            floatEl = null,
            giftId = null,
            giftName = null,
            giftPrice = null,
            giftImgURL = null,
            amount = 1,
            btnSend = null;
        const modal = createDivEl({className: this.options.modalClass});

        // wrapper
        const wrapper = createDivEl({className: this.options.wrapperClass});
        const content = createDivEl({className: this.options.contentClass});
        const tagItem1 = createDivEl({className: ['tag', this.options.itemClass]})
        const tagItem2 = createDivEl({className: ['tag', this.options.itemClass]});
        this.giftLists.forEach((data, index) => {
            const handler = (element, float, id, price, name, imgURL) => {
                if (activeEL) {
                    removeClass(activeEL, this.options.showCalss);
                }
                activeEL = element;
                floatEl = float;
                giftId = id;
                giftName = name;
                giftPrice = parseInt(price);
                giftImgURL = imgURL;
                removeClass(btnSend, this.options.disabledClass);
            };
            const giftItemEL = new GiftItem({data, handler});

            if (index > 7) {
                tagItem2.appendChild(giftItemEL.element);
            }else {
                tagItem1.appendChild(giftItemEL.element);
            }
        });
        content.appendChild(tagItem1);
        content.appendChild(tagItem2);
        wrapper.appendChild(content);
        modal.appendChild(wrapper);

        // group
        const group = createDivEl({className: this.options.groupClass});
        const box = createDivEl({className: this.options.rechargeClass});
        const btnRecharge = createDivEl({className: ['button', 'fill-recharge'], content: `${LANG.LIVE_PREVIEW.Actions.Recharge}`});
        const Package = createDivEl({element: 'p'});
        const packageTitle = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Actions.Account}`});
        const packageFont = createDivEl({element: 'font', content: `${this.packageTitle}`});
        Package.appendChild(packageTitle);
        Package.appendChild(packageFont);
        box.appendChild(btnRecharge);
        box.appendChild(Package);
        group.appendChild(box);
        addEvent(btnRecharge, 'click', () => {
            if (recharge) recharge();
        });

        btnSend = createDivEl({className: ['button', 'button-primary', this.options.disabledClass], content: `${LANG.LIVE_PREVIEW.Actions.Send}`});
        addEvent(btnSend, 'click', () => {
            if (hasClass(btnSend, this.options.disabledClass)) return false;

            const price = this.package - giftPrice;

            if (price < 0) {
                return notCoins();
            }else {
                addClass(floatEl, this.options.showCalss);
                animationEnd(floatEl, () => {
                    if (send) send(giftId, giftPrice, giftName, giftImgURL, amount);
                });
            }
        });
        group.appendChild(btnSend);
        modal.appendChild(group);
        return modal;
    }
}

// 礼物列表
class LivesGiftLIst {
    constructor(data) {
        this.data = data;
        this.options = {
            wrapperClass: 'receive-gift-group'
        };
        this.element = this._createElement();
    }

    get giftLists() {
        return this.data ? this.data : [];
    }

    _createElement() {
        // wrapper
        const wrapper = createDivEl({className: this.options.wrapperClass});

        this.giftLists.forEach((data, index) => {
            const receiveItemEL = new ReceiveGiftItem({data});

            wrapper.appendChild(receiveItemEL.element);
        });

        return wrapper;
    }
}

// 充值
class LivesRecharge {
    constructor({data}) {
        this.data = data;
        this.options = {
            wrapperClass: 'recharge-wrapper',
            groupClass: 'recharge-group',
            labelClass: 'recharge-label',
            tagClass: 'tag-recharge',
            showCalss: 'active'
        };
        this.element = this._createElement();
    }

    get package() {
        return this.data.userPackage ? `${this.data.userPackage + ' ' + LANG.LIVE_PREVIEW.Actions.Coins}` : `0 ${LANG.LIVE_PREVIEW.Actions.Coins}`;
    }

    get goodslist() {
        return this.data.goodslist ? this.data.goodslist : [];
    }

    get payWaylist() {
        return this.data.payWaylist ? this.data.payWaylist : [];
    }

    _createElement() {
        const wrapper = createDivEl({className: this.options.wrapperClass});

        // group tag
        const groupTag = createDivEl({className: this.options.groupClass});
        const tagLabel = createDivEl({element: 'p', className: this.options.labelClass});
        const tagLabelSpan = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.LIVE_PREVIEW.Recharge.Select_Amount}`});
        const tagLabelMoney = createDivEl({element: 'span', className: 'money', content: `${LANG.LIVE_PREVIEW.Actions.Account}`+`${this.package}`+`${LANG.LIVE_PREVIEW.Actions.Coins}`});
        tagLabel.appendChild(tagLabelSpan);
        tagLabel.appendChild(tagLabelMoney);
        groupTag.appendChild(tagLabel);

        const tagItems = createDivEl({className: ['tag', this.options.tagClass]})
        this.goodslist.forEach((data, index) => {
            const rechargeItemEL = new RechargeItem({data, handler});
            tagItems.appendChild(rechargeItemEL.element);

            if (index == 0) {
                addClass(rechargeItemEL, this.options.showCalss);
            }
        });
        groupTag.appendChild(tagItems);
        wrapper.appendChild(groupTag);

        // group item
        const groupItem = createDivEl({className: this.options.groupClass});
        const tagItem = createDivEl({element: 'p', className: this.options.labelClass});
        const tagItemSpan = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.LIVE_PREVIEW.Recharge.Payment_Method}`});
        tagItem.appendChild(tagItemSpan);

        const tagItemPay = createDivEl({element: 'span'});
        const tagItemPayFont = createDivEl({element: 'font', content: `${LANG.LIVE_PREVIEW.Recharge.Not_Pay.Title}`});
        const tagItemPayBtn = createDivEl({element: 'span', id: 'button-customer', className: 'color-primary', content: `${LANG.LIVE_PREVIEW.Recharge.Not_Pay.Text}`});
        tagItemPay.appendChild(tagItemPayFont);
        tagItemPay.appendChild(tagItemPayBtn);
        tagItem.appendChild(tagItemPay);
        groupItem.appendChild(tagItem);

        const listItems = createDivEl({className: ['ul', 'list']});
        this.payWaylist.forEach((data, index) => {
            const payItemEL = new PayItem({data, handler});
            listItems.appendChild(payItemEL.element);

            if (index == 0) {
                addClass(payItemEL, this.options.showCalss);
            }
        });
        groupItem.appendChild(listItems);

        const btnPaypal = createDivEl({id: 'paypal-button', className: ['button-paypal', 'hide']});
        groupItem.appendChild(btnPaypal);

        const btnPay = createDivEl({id: 'button-pay', className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.USER_ACCOUNT.Buttons}`});
        groupItem.appendChild(btnPay);

        wrapper.appendChild(groupItem);
        return wrapper;
    }
}

// 余额不足
class LivesOverShort {
    constructor({cancel, pass}) {
        this.data = data;
        this.options = {
            groupClass: 'recharge-group',
            labelClass: 'amount-label'
        };
        this.element = this._createElement(cancel, pass);
    }

    _createElement(cancel, pass) {
        const group = createDivEl({className: this.options.groupClass});
        const label = createDivEl({element: 'p', className: this.options.labelClass, content: `${LANG.LIVE_PREVIEW.Madal.InsufficientAmount.Text}`});
        group.appendChild(label);

        const buttons = createDivEl({className: 'buttons'});
        const btnCancel = createDivEl({className: ['button', 'fill-primary'], content: `${LANG.PUBLIC.ModalButtonCancel}`});
        addEvent(btnCancel, 'click', () => {
            if (cancel) cancel();
        });
        buttons.appendChild(btnCancel);

        const btnpass = createDivEl({className: ['button', 'button-primary'], content: `${LANG.PUBLIC.ModalButtonOk}`});
        addEvent(btnpass, 'click', () => {
            if (pass) pass();
        });
        buttons.appendChild(btnpass);
        group.appendChild(buttons);

        return group;
    }
}

// 举报
class LivesAnchorReport {
    constructor({data, submit}) {
        this.data = data;
        this.options = {
            wrapperClass: 'popup-wrapper',
            groupClass: 'popup-group',
            contentClass: 'anchor-content'
        };
        this.element = this._createElement(submit);
    }

    get id() {
        return this.data.id ? `${this.data.id}` : `0`;
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : (this.data.userSex == 1  ? acrossMaleImg : acrossFemaleImg);
    }

    get reasonlist() {
        return this.data.reasonList ? this.data.reasonList : [];
    }

    _createElement(submit) {
        const wrapper = createDivEl({className: this.options.wrapperClass});

        const groupTag = createDivEl({className: this.options.groupClass});
        const tagTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Feedback.Text}`});
        groupTag.appendChild(tagTitle);

        // tags
        const tagContent = createDivEl({className: this.options.contentClass});
        const tags = createDivEl({className: ['tag', 'tags-video']});
        this.reasonlist.forEach((data, index) => {
            let label = createDivEl({element: 'label', className: 'tag-label', content: data.title});

            tags.appendChild(label);
        });
        tagContent.appendChild(tags);
        groupTag.appendChild(tagContent);
        wrapper.appendChild(groupTag);

        // input
        const groupInput = createDivEl({className: this.options.groupClass});
        const inputTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Feedback.Text_Secondary}`});
        groupInput.appendChild(inputTitle);

        const inputContent = createDivEl({className: ['input', this.options.contentClass]});
        const textarea = createDivEl({element: 'textarea'});
        textarea.rows = 5;
        inputContent.appendChild(textarea);

        const acrossImg = createDivEl({element: 'img', className: 'across'});
        acrossImg.src = this.acrossUrl;
        inputContent.appendChild(acrossImg);
        groupInput.appendChild(inputContent);
        wrapper.appendChild(groupInput);

        const btnSubmit = createDivEl({className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.Feedback.Buttons}`});
        addEvent(btnSubmit, 'click', () => {
            if (submit) submit();
        });
        wrapper.appendChild(btnSubmit);

        return wrapper;
    }
}

// 加标签
class LivesAnchorTag {
    constructor({data, save}) {
        this.data = data;
        this.options = {
            wrapperClass: 'popup-wrapper',
            groupClass: 'popup-group',
            contentClass: 'anchor-content',
            showCalss: 'active'
        };
        this.element = this._createElement(save);
    }

    get userlist() {
        return this.data.userList ? this.data.userList : [];
    }

    get taglist() {
        return this.data.tagList ? this.data.tagList : [];
    }

    _createElement(save) {
        let activeEL = null,
            tagID = null;
        const wrapper = createDivEl({className: this.options.wrapperClass});

        const groupUser = createDivEl({className: this.options.groupClass});
        const userTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Impression.Text}`});
        groupUser.appendChild(userTitle);

        // tags
        const userContent = createDivEl({className: this.options.contentClass});
        const users = createDivEl({className: ['tag', 'tags-video']});
        this.userlist.forEach((data, index) => {
            let label = createDivEl({element: 'label', className: 'tag-label', content: data.title});
            users.appendChild(label);
        });
        userContent.appendChild(users);
        groupUser.appendChild(userContent);
        wrapper.appendChild(groupUser);


        const groupTag = createDivEl({className: this.options.groupClass});
        const tagTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Impression.Text_Secondary}`});
        groupTag.appendChild(tagTitle);

        // tags
        const tagContent = createDivEl({className: this.options.contentClass});
        const tags = createDivEl({className: ['tag', 'tags-video']});
        this.taglist.forEach((data, index) => {
            let label = createDivEl({element: 'label', className: 'tag-label', content: data.title});
            addEvent(label, 'click', () => {
                if (activeEL) {
                    removeClass(activeEL, this.options.showCalss);
                }
                activeEL = label;
                tagID = data.id;
                addClass(label, this.options.showCalss);
            });
            tags.appendChild(label);
        });
        tagContent.appendChild(tags);
        groupTag.appendChild(tagContent);
        wrapper.appendChild(groupTag);

        const btnpass = createDivEl({className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.Impression.Buttons}`});
        addEvent(btnpass, 'click', () => {
            if (save) save(tagID);
        });
        wrapper.appendChild(btnpass);

        return wrapper;
    }
}

// 直播插件/美颜
class GluginBeauty {
    constructor({beauty}) {
        this.options = {
            groupClass: 'glugin-beauty-group',
            itemClass: 'beauty-item',
            showCalss: 'active'
        };
        this.beautyList = [{
                id: '0',
                name: '0'
            }, {
                id: '1',
                name: '1'
            }, {
                id: '2',
                name: '2'
            }, {
                id: '3',
                name: '3'
            }, {
                id: '4',
                name: '4'
            }, {
                id: '5',
                name: '5'
            }];
        this.element = this._createElement(beauty);
    }

    get beautyLists() {
        return this.data.giftList ? this.data.giftList : [];
    }

    _createElement(beauty) {
        let activeEL = null;
        const group = createDivEl({className: this.options.groupClass});

        this.beautyList.forEach((data, index) => {
            let itemEL = createDivEl({className: this.options.itemClass, content: data.name});
            addEvent(itemEL, 'click', () => {
                if (activeEL) {
                    removeClass(activeEL, this.options.showCalss);
                }
                activeEL = itemEL;
                if (beauty) beauty(data.id);
                addClass(itemEL, this.options.showCalss);
            });
            group.appendChild(itemEL);
        });

        return group;
    }
}

// 直播插件/贴图
class GluginSticker {
    constructor({data, sticker}) {
        this.stickerList = data;
        this.options = {
            modalClass: 'gifts-modal',
            wrapperClass: 'gift-wrapper',
            contentClass: 'gift-content',
            itemClass: 'gift-item',
            showCalss: 'active'
        };

        this.element = this._createElement(sticker);
    }

    get stickerLists() {
        return this.stickerList ? this.stickerList : [];
    }

    _createElement(sticker) {
        let activeEL = null;
        const modal = createDivEl({className: this.options.modalClass});

        // wrapper
        const wrapper = createDivEl({className: this.options.wrapperClass});
        const content = createDivEl({className: this.options.contentClass});
        const tagItem1 = createDivEl({className: ['tag', this.options.itemClass]})
        const tagItem2 = createDivEl({className: ['tag', this.options.itemClass]});
        this.stickerLists.forEach((data, index) => {
            const handler = (element, id) => {
                if (activeEL) {
                    removeClass(activeEL, this.options.showCalss);
                }
                activeEL = element;
                if (sticker) sticker(id);
            };
            const giftItemEL = new StickerItem({data, handler});

            if (index > 7) {
                tagItem2.appendChild(giftItemEL.element);
            }else {
                tagItem1.appendChild(giftItemEL.element);
            }
        });
        content.appendChild(tagItem1);
        content.appendChild(tagItem2);
        wrapper.appendChild(content);
        modal.appendChild(wrapper);

        return modal;
    }
}

export { LivesAnchorInfo, LivesNews, LivesShare, LivesGift, LivesGiftBox, LivesGiftLIst, LivesRecharge, LivesOverShort, LivesAnchorReport, LivesAnchorTag, GluginBeauty, GluginSticker };