import { LivesAnchorInfo, LivesNews, LivesShare, LivesGift, LivesGiftLIst, LivesRecharge, LivesOverShort, LivesAnchorReport, LivesAnchorTag, GluginBeauty, GluginSticker } from './LivesContentModal';
import { NewsItem, GiftBox, LovesItem, ArrivalsItem, NotCoinsItem, GiftCountItem } from './LivesContentItem';
import { closeModal, alert, confirm, popupPart, popup, timePicker } from './Modal';
import { FacebookPlugin, TwitterPlugin } from './ThirdPartyPlugin';
import { PullLoad } from './PullLoad';
import { Spinner } from './Spinner';
import SendBirdChatEvent from '../SendBirdChatEvent';
import SendBirdEvent from '../SendBirdEvent';
import {
    body,
    domainURL,
    sendBirdConfig
} from '../intro';
import {
    getUserInfo
} from '../api';
import {
    getLangConfig
} from '../lang';
import {
    addEvent,
    createDivEl,
    protectFromXSS,
    setTimes,
    setTimesFormat,
    countFromNow,
    timestampFromNow,
    setData,
    getData,
    toggleClass,
    addClass,
    hasClass,
    removeClass,
    isScrollBottom,
    animationEnd
} from '../util';

import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';
import iconFemaleImg from '../../img/icon-female@2x.png';
import iconMaleImg from '../../img/icon-male@2x.png';

import loveRedIcon from '../../img/lives/love-red@2x.png';
import cutoverIcon from '../../img/lives/icon-cutover@2x.png';
import giftListIcon from '../../img/lives/icon-gift-list@2x.png';

import waitingSwitch from '../../img/lives/waiting-switch@2x.png';
import waitingLocate from '../../img/lives/scan-locate@2x.png';
import waitingLoading from '../../img/lives/scan-loading@2x.png';

const LANG = getLangConfig();

let instanceAnchor = null;

// 直播功能/
class LivesContent {
    constructor({data, channel, client, oneToMany}) {
        this.data = data;
        this.options = {
            liveWindowId: 'rtc-video',
            userLiveWindowId: 'rtc-video-us',

            livesContentClass: 'lives-content',
            livesHeaderClass: 'lives-header',
            livesAttentionClass: 'lives-attention',
            livesArrivalsClass: 'lives-arrivals',
            livesGiftsClass: 'lives-gifts',
            livesCommentsClass: 'lives-comments',
            livesAnchorOfflineClass: 'lives-anchor-offline',
            // icon
            closeClass: 'live-close',
            attentionClass: 'live-attention',
            addAttentionClass: 'live-add-attention',
            newsClass: 'live-news',
            shareClass: 'live-share',
            giftClass: 'live-gift',
            // plugins
            pluginsClass: 'lives-plugins',
            shieldClass: 'live-shield',
            beautyClass: 'live-beauty',
            stickerClass: 'live-sticker',
            showCalss: 'active'
        };
        this.client = client;
        this.oneToMany = oneToMany;
        this.channel = channel;
        this.element = this._createElement();
        this.ReceiveGiftList = [];
        this.secondTime = null;
        this.chargeTime = false;
        this.memberCount = 0;

        this.notCoins = null;

        this.facebook = new FacebookPlugin();
        this.twitter = new TwitterPlugin();

        this.onClose = null;

        this.onReport = null;
        this.onBlack = null;
        this.onAddTag = null;
        this.onFavorite = null;
        this.onMessage = null;

        this.onNews = null;
        this.onLoves = null;
        this.onGift = null;
        this.onRecharge = null;

        // Shows
        this.onGetChargeShows = null;
        this.onChargeShows = null;
        this.onPartyShows = null;

        // Plugins
        this.onPluginsShield = null;
        this.onPluginsBeauty = null;
        this.onPluginsSticker = null;
    }

    get id() {
        return `${this.data.userId}`;
    }

    get anchorId() {
        return `${this.data.AnchorInfo.user_id}`;
    }

    get acrossUrl() {
        return this.data.AnchorInfo.user_head ? protectFromXSS(this.data.AnchorInfo.user_head) : acrossFemaleImg;
    }

    get userName() {
        return this.data.AnchorInfo.user_name ? `${this.data.AnchorInfo.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get userHeat() {
        return this.data.AnchorInfo.fans_number ? `${this.data.AnchorInfo.fans_number+ ' ' + LANG.PUBLIC.Heat}` : `0 ${LANG.PUBLIC.Heat}`;
    }

    get userFollow() {
        return this.data.AnchorInfo.follow_status == 1 ? true : false;
    }

    get price() {
        return this.data.livePrice ? this.data.livePrice : 0;
    }

    get AnchorInfo() {
        return this.data.AnchorInfo ? this.data.AnchorInfo : {};
    }

    get GiftList() {
        return this.data.AllGiftList ? this.data.AllGiftList : [];
    }

    get GoodList() {
        return this.data.AllGoodsList ? this.data.AllGoodsList : [];
    }

    get PayWayList() {
        return this.data.AllPayWayList ? this.data.AllPayWayList : [];
    }

    get countdownTimes() {
        return timestampFromNow(this.data.times);
    }

    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight - element.offsetHeight;
    }

    _createElement() {
        const { userName, userHead, userPackage } = getUserInfo();
        this.userPackage = userPackage;
        const livesContent = createDivEl({className: this.options.livesContentClass});

        // header
        const livesHeader = createDivEl({className: this.options.livesHeaderClass});
        const headerAttention = createDivEl({className: this.options.livesAttentionClass});

        // 直播详情
        const headerAcrossInfo = createDivEl({className: ['user-info', 'across']});
        const headerAcrossImg = createDivEl({element: 'img', className: 'user-img'});
        headerAcrossImg.src = this.acrossUrl;
        const headerAcrossBody = createDivEl({className: 'across-body'});
        const headerAcrossBodyName = createDivEl({element: 'p', className: 'user-name', content: this.userName});
        const headerAcrossBodyTxt = createDivEl({element: 'p', className: 'user-txt', content: this.userHeat});
        headerAcrossBody.appendChild(headerAcrossBodyName);
        headerAcrossBody.appendChild(headerAcrossBodyTxt);
        headerAcrossInfo.appendChild(headerAcrossImg);
        headerAcrossInfo.appendChild(headerAcrossBody);
        if (this.client) {
            addEvent(headerAcrossInfo, 'click', () => {
                const report = () => {
                    let modalsEl;
                    const submit = (id, value) => {
                        if (this.onReport) this.onReport(id, value);
                    };
                    const anchorReport = new LivesAnchorReport({
                        submit,
                        data: {
                            id: 1,
                            userHead: '',
                            userSex: 1,
                            reasonList: [{
                                id: 0,
                                title: "Minor's account"
                            }, {
                                id: 1,
                                title: 'Advertising'
                            }, {
                                id: 2,
                                title: 'Cheat'
                            }, {
                                id: 3,
                                title: 'Political topic'
                            }, {
                                id: 4,
                                title: 'Others'
                            }]
                        }
                    });
                    modalsEl = popup({
                        element: anchorReport.element,
                        title: `${LANG.LIVE_PREVIEW.Feedback.Title}`,
                        top: true
                    });
                }
                const black = () => {
                    confirm({
                        title: `${LANG.LIVE_PREVIEW.Madal.Blacklist.Title}`,
                        text: `${LANG.LIVE_PREVIEW.Madal.Blacklist.Text}`,
                        top: true,
                        callback: () => {
                            if (this.onBlack) this.onBlack();
                        }
                    });
                }
                const addTag = () => {
                    let modalsEl;
                    const save = (id, value) => {
                        if (this.onAddTag) this.onAddTag(id, value);
                    };
                    const anchorTag = new LivesAnchorTag({
                        save,
                        data: {
                            userList: [{
                                id: 0,
                                title: 'Sexy'
                            }, {
                                id: 1,
                                title: 'Humor'
                            }, {
                                id: 2,
                                title: 'Cute'
                            }],
                            tagList: [{
                                id: 0,
                                title: 'Dance'
                            }, {
                                id: 1,
                                title: 'Singing'
                            }, {
                                id: 2,
                                title: 'Emotion'
                            }, {
                                id: 3,
                                title: 'Art'
                            }]
                        }
                    });
                    modalsEl = popup({
                        element: anchorTag.element,
                        title: `${LANG.LIVE_PREVIEW.Impression.Title}`,
                        top: true
                    });
                }
                const favorite = () => {
                    if (this.onFavorite) this.onFavorite();
                }
                const message = () => {
                    if (this.onMessage) this.onMessage();
                }
                const anchorInfo = new LivesAnchorInfo({
                    black,
                    report,
                    addTag,
                    message,
                    favorite,
                    data: this.AnchorInfo
                });
                const modalsEl = popupPart({
                    element: anchorInfo.element
                });
            });
        }

        headerAttention.appendChild(headerAcrossInfo);

        // 加关注
        if (this.client) {
            let Follow = this.userFollow ? 1 : 2;
            const headerIconAttention = createDivEl({element: 'i', className: ['icon', (this.userFollow ? this.options.addAttentionClass : this.options.attentionClass)]});

            addEvent(headerIconAttention, 'click', () => {
                const check = hasClass(headerIconAttention, this.options.attentionClass);

                removeClass(headerIconAttention, (check ? this.options.attentionClass : this.options.addAttentionClass));
                addClass(headerIconAttention, (check ? this.options.addAttentionClass : this.options.attentionClass));
                Follow = check ? 1 : 2;
                if (this.onFavorite) this.onFavorite(Follow);
            });
            headerAttention.appendChild(headerIconAttention);
        }
        livesHeader.appendChild(headerAttention);

        // 关闭直播
        const headerIconClose = createDivEl({element: 'i', className: ['icon', this.options.closeClass]});
        addEvent(headerIconClose, 'click', () => {
            if (!this.client && this.oneToMany && this.chargeTime) {
                return alert({
                    title: `${LANG.LIVE_PREVIEW.Charge_Midway_Exit.Title}`,
                    text: `${LANG.LIVE_PREVIEW.Charge_Midway_Exit.Text}`,
                    button: `${LANG.LIVE_PREVIEW.Charge_Midway_Exit.Buttons}`
                });
            }
            const callback = () => {
                if (this.onClose) this.onClose();
            };
            confirm({
                text: `${LANG.LIVE_PREVIEW.Madal.EndLive.Text}`,
                callback
            });
        });
        livesHeader.appendChild(headerIconClose);
        livesContent.appendChild(livesHeader);

        // arrivalsC  进场弹框
        const livesArrivals = createDivEl({className: this.options.livesArrivalsClass});
        livesContent.appendChild(livesArrivals);

        // gifts  礼物弹框
        const livesGifts = createDivEl({className: this.options.livesGiftsClass});
        livesContent.appendChild(livesGifts);

        // comments  评论弹幕
        const livesComments = createDivEl({className: this.options.livesCommentsClass});
        livesContent.appendChild(livesComments);

        // Anchor Offline 主播离线提示
        const livesAnchorOffline = createDivEl({className: this.options.livesAnchorOfflineClass});
        const livesAnchorOfflineSpan = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.Madal.AnchorOffline.Text}`});
        livesAnchorOffline.appendChild(livesAnchorOfflineSpan);
        livesContent.appendChild(livesAnchorOffline);
        this.AnchorOfflineEl = livesAnchorOfflineSpan;

        if (!this.client && false) {
            // plugins
            const livesPlugins = createDivEl({className: ['lives-button-groups', 'top-right', this.options.pluginsClass]});

            // plugins 屏蔽摄像头
            const PluginsIconShield = createDivEl({element: 'i', className: ['icon', this.options.shieldClass]});
            addEvent(PluginsIconShield, 'click', () => {
                confirm({
                    text: `${LANG.LIVE_PREVIEW.Madal.PluginsShield.Text}`,
                    callback: () => {
                        if (this.onPluginsShield) this.onPluginsShield();
                    }
                });
            });
            livesPlugins.appendChild(PluginsIconShield);

            // plugins 美颜
            const PluginsIconBeauty = createDivEl({element: 'i', className: ['icon', this.options.beautyClass]});
            addEvent(PluginsIconBeauty, 'click', () => {
                const beauty = (id) => {
                    if (this.onPluginsBeauty) this.onPluginsBeauty();
                }
                const pluginsBeauty = new GluginBeauty({beauty});
                const modalsEl = popupPart({
                    element: pluginsBeauty.element,
                    title: `${LANG.LIVE_PREVIEW.Glugin.Beauty.Title}`
                });
            });
            livesPlugins.appendChild(PluginsIconBeauty);

            // plugins 贴图
            const PluginsIconSticker = createDivEl({element: 'i', className: ['icon', this.options.stickerClass]});
            addEvent(PluginsIconSticker, 'click', () => {
                const sticker = (id) => {
                    if (this.onPluginsSticker) this.onPluginsSticker();
                }
                const pluginsSticker = new GluginSticker({
                    sticker,
                    data: this.GiftList
                });
                const modalsEl = popupPart({
                    element: pluginsSticker.element,
                    title: `${LANG.LIVE_PREVIEW.Glugin.Beauty.Title}`
                });
                this._GiftPullLoad(modalsEl);
            });
            livesPlugins.appendChild(PluginsIconSticker);
            livesContent.appendChild(livesPlugins);
        }

        // button left
        const livesGroupsLeft = createDivEl({className: ['lives-button-groups', 'bottom-left']});

        // 评论
        const GroupsIconNews = createDivEl({element: 'i', className: ['icon', this.options.newsClass]});
        addEvent(GroupsIconNews, 'click', () => {
            let modalsEl;
            const send = (value) => {
                closeModal(modalsEl);
                this._createNewsElement(livesComments, this.client ? `${userName}` : `${this.userName}`, value, this.client);
                if (this.onNews) this.onNews(value);
            };
            const newsEL = new LivesNews({send});
            modalsEl = popupPart({
                element: newsEL.element,
                callback: () => {
                    newsEL.input.focus();
                }
            });
        });
        livesGroupsLeft.appendChild(GroupsIconNews);

        // 分享
        const GroupsIconShare = createDivEl({element: 'i', className: ['icon', this.options.shareClass]});
        addEvent(GroupsIconShare, 'click', () => {
            let modalsEl;
            const facebook = () => {
                this.facebook.Share(domainURL).then(() => {
                    closeModal(modalsEl);
                });
            };
            const twitter = () => {
                this.twitter.Share(domainURL).then(() => {
                    closeModal(modalsEl);
                });
            };
            const shareEL = new LivesShare({facebook, twitter});
            modalsEl = popupPart({
                element: shareEL.element,
                title: `${LANG.LIVE_PREVIEW.Share.Title}`,
                cancel: true,
                cancelIcon: true
            });
        });
        livesGroupsLeft.appendChild(GroupsIconShare);

        // 一对多/礼物列表
        if (!this.client && this.oneToMany) {
            const GroupsIconGiftList = createDivEl({element: 'i', className: 'icon', background: giftListIcon});
            addEvent(GroupsIconGiftList, 'click', () => {
                const giftListEL = new LivesGiftLIst(this.ReceiveGiftList);
                const modalsEl = popupPart({
                    element: giftListEL.element,
                    title: `${LANG.LIVE_PREVIEW.Madal.ReceiveGift.Title}`
                });
            });
            livesGroupsLeft.appendChild(GroupsIconGiftList);
        }

        // 一对一/礼物
        if (this.client && !this.oneToMany) {
            const GroupsIconGift = createDivEl({element: 'i', className: ['icon', this.options.giftClass]});
            addEvent(GroupsIconGift, 'click', () => {
                let modalsEl;
                const send = (id, price, name, imgUrl, amount) => {
                    closeModal(modalsEl);

                    this._createGiftElement(livesGifts, userName, userHead, name, imgUrl, amount);
                    if (this.onGift) this.onGift(id, price, name, imgUrl, amount);

                };
                const recharge = () => {
                    closeModal(modalsEl);
                    const livesRechargeEL = new LivesRecharge({
                        data: {
                            package: userPackage,
                            goodslist: this.GoodList,
                            payWaylist: this.PayWayList
                        }
                    });
                    const RechargeEl = popupPart({
                        element: livesRechargeEL.element,
                        title: `${LANG.LIVE_PREVIEW.Actions.Recharge}`
                    });
                    if (this.onRecharge) this.onRecharge(livesRechargeEL.element);
                };
                const notCoins = () => {
                    return alert({
                        title: `${LANG.HOME.Madal.NotCoins.Title}`,
                        text: `${LANG.HOME.Madal.NotCoins.Text_Coins}`,
                        button: `${LANG.HOME.Madal.NotCoins.ButtonsText}`,
                        callback: recharge
                    });
                };
                const giftEL = new LivesGift({
                    send,
                    recharge,
                    notCoins,
                    data: {
                        giftList: this.GiftList,
                        package: userPackage
                    }
                });
                modalsEl = popupPart({
                    element: giftEL.element,
                    title: `${LANG.LIVE_PREVIEW.Actions.Gift}`
                });
                this._GiftPullLoad(modalsEl);
            });
            livesGroupsLeft.appendChild(GroupsIconGift);
        }

        livesContent.appendChild(livesGroupsLeft);

        // button right
        const livesGroupsRight = createDivEl({className: ['lives-button-groups', 'bottom-right']});
        let GroupsFloatLoves;

        // 一对多/客户端
        if (this.client && this.oneToMany) {
            // 礼物
            const GroupsIconGift = createDivEl({element: 'i', className: ['icon', this.options.giftClass]});
            addEvent(GroupsIconGift, 'click', () => {
                let modalsEl;
                const send = (id, price, name, imgUrl, amount) => {
                    closeModal(modalsEl);

                    this._createGiftElement(livesGifts, userName, userHead, name, imgUrl, amount);
                    if (this.onGift) this.onGift(id, price, name, imgUrl, amount);

                };
                const recharge = () => {
                    closeModal(modalsEl);
                    const livesRechargeEL = new LivesRecharge({
                        data: {
                            package: userPackage,
                            goodslist: this.GoodList,
                            payWaylist: this.PayWayList
                        }
                    });
                    const RechargeEl = popupPart({
                        element: livesRechargeEL.element,
                        title: `${LANG.LIVE_PREVIEW.Actions.Recharge}`
                    });
                    if (this.onRecharge) this.onRecharge(livesRechargeEL.element);
                };
                const notCoins = () => {
                    return alert({
                        title: `${LANG.HOME.Madal.NotCoins.Title}`,
                        text: `${LANG.HOME.Madal.NotCoins.Text_Coins}`,
                        button: `${LANG.HOME.Madal.NotCoins.ButtonsText}`,
                        callback: recharge
                    });
                };
                const giftEL = new LivesGift({
                    send,
                    recharge,
                    notCoins,
                    data: {
                        giftList: this.GiftList,
                        package: userPackage
                    }
                });
                modalsEl = popupPart({
                    element: giftEL.element,
                    title: `${LANG.LIVE_PREVIEW.Actions.Gift}`
                });
                this._GiftPullLoad(modalsEl);
            });
            livesGroupsRight.appendChild(GroupsIconGift);

            // 点赞/飘爱心
            GroupsFloatLoves = createDivEl({element: 'i', className: 'lives-float-loves'});
            const GroupsIconLoves = createDivEl({element: 'i', className: 'icon', background: loveRedIcon});
            GroupsFloatLoves.appendChild(GroupsIconLoves);
            addEvent(GroupsFloatLoves, 'click', () => {
                this._createLovesElement(GroupsFloatLoves);
                if (this.onLoves) this.onLoves();
            });
            livesGroupsRight.appendChild(GroupsFloatLoves);
        }

        // 一对多/主播端
        if (!this.client && this.oneToMany) {
            let countDown;
            const GroupsButtonCharge = createDivEl({className: ['button', 'button-primary', 'charge-shows'], content: `${LANG.LIVE_PREVIEW.Buttons.Gold_Show}`});
            const GroupsButtonParty = createDivEl({className: ['button', 'button-primary', 'party-shows'], content: `${LANG.LIVE_PREVIEW.Buttons.Party_Show}`});
            const itemExplain = createDivEl({element: 'p', className: 'lives-showTime', content: `${LANG.LIVE_PREVIEW.Live_Countdown.End_Explain}`});

            addEvent(GroupsButtonCharge, 'click', () => {
                const callback = (data) => {
                    const time = setTimes(data);
                    const party = () => {
                        this.chargeTime = true;
                        livesGroupsRight.appendChild(GroupsButtonParty);
                        if (this.onChargeShows) this.onChargeShows(time);
                    }
                    countDown = this._createCountdownElement(livesContent, time, party);
                    livesGroupsRight.removeChild(GroupsButtonCharge);
                    livesContent.appendChild(countDown);

                    if (this.onGetChargeShows) this.onGetChargeShows(time);
                };
                timePicker({
                    title: `${LANG.LIVE_PREVIEW.Madal.GoldShow.Text}`,
                    params: {
                        date: '03:00',
                        format: 'mm:ss',
                        increment: {
                            year: 1,
                            month: 1,
                            day: 1,
                            hour: 1,
                            minute: 1,
                            second: 10,
                            millisecond: 100,
                        },
                        translate(type, text) {
                            const suffixes = {
                                day: 'day',
                                hour: 'hour',
                                minute: 'min',
                                second: 's',
                            };

                            return Number(text) + suffixes[type];
                        },
                    },
                    callback
                });
            });
            addEvent(GroupsButtonParty, 'click', () => {
                confirm({
                    text: `${LANG.LIVE_PREVIEW.Madal.PartyShow.Text}`,
                    callback: () => {
                        if (this.onPartyShows) this.onPartyShows();
                        this.chargeTime = false;
                        livesGroupsRight.removeChild(GroupsButtonParty);
                        livesGroupsRight.appendChild(GroupsButtonCharge);
                        livesContent.appendChild(itemExplain);

                        addClass(itemExplain, 'show');

                        setTimeout(() => {
                            addClass(itemExplain, 'hide');
                            animationEnd(itemExplain, () => {
                                livesContent.removeChild(itemExplain);
                                livesContent.removeChild(countDown);
                            });
                        }, 2000);
                    }
                });
            });
            livesGroupsRight.appendChild(GroupsButtonCharge);
        }

        // 一对一/video
        if (!this.oneToMany) {
            const livesVideo = createDivEl({id: 'user-video', className: 'local-video', background: userHead});
            livesGroupsRight.appendChild(livesVideo);
        }

        livesContent.appendChild(livesGroupsRight);


        // 监听事件
        const chatEvent = new SendBirdChatEvent();
        const channelEvent = new SendBirdEvent();
        let countDownEl;
        // 收到消息
        chatEvent.onMessageReceived = (channel, messages) => {
            if (this.channel.url === channel.url) {
                const {message} = messages;
                const {customType} = messages;
                const {userId, nickname, profileUrl} = messages._sender;

                switch(customType) {
                    case 'chats':
                        this._createNewsElement(livesComments, nickname, message, (this.anchorId == userId) ? false : true);
                        break;
                    case 'gifts':
                        const {giftName, giftImgURL, giftAmount} = JSON.parse(messages.data);
                        this._createGiftElement(livesGifts, nickname, profileUrl, giftName, giftImgURL, giftAmount);

                        if (!this.client) {
                            this.ReceiveGiftList.push(messages);
                        }
                        break;
                    case 'loves':
                        if (this.client) {
                            this._createLovesElement(GroupsFloatLoves);
                        }
                        break;
                    case 'chargeTime':
                        if (!this.client && this.secondTime && this.chargeTime) return false;

                        if (this.price >= this.userPackage) this.notCoins = true;
                        this.chargeTime = true;

                        const second = messages.data;
                        const callback = () => {
                            if (this.onChargeShows) this.onChargeShows();
                        };
                        countDownEl = this._createCountdownElement(livesContent, parseInt(second), callback);
                        livesContent.appendChild(countDownEl);
                        break;
                    case 'partyTime':
                        this.chargeTime = false;
                        if (this.onPartyShows) this.onPartyShows();

                        const itemExplain = createDivEl({element: 'p', className: 'lives-showTime', content: `${LANG.LIVE_PREVIEW.Live_Countdown.End_Explain}`});

                        livesContent.removeChild(countDownEl);
                        livesContent.appendChild(itemExplain);
                        addClass(itemExplain, 'show');

                        setTimeout(() => {
                            addClass(itemExplain, 'hide');
                            animationEnd(itemExplain, () => {
                                livesContent.removeChild(itemExplain);
                            });
                        }, 2000);
                        break;
                }
            }
        };

        // 当新用户进入开放频道时
        channelEvent.onUserEntered = (openChannel, user) => {
            if (this.channel.url === openChannel.url) {

                if (!this.client && this.secondTime) {
                    if (this.onGetChargeShows) this.onGetChargeShows(this.secondTime);
                }

                if (!this.client && this.chargeTime) {
                    if (this.onGetChargeShows) this.onGetChargeShows(0);
                }

                if (this.oneToMany && user.userId != this.id) {
                    this.memberCount = openChannel.participantCount;
                    headerAcrossBodyTxt.innerText = `${openChannel.participantCount + ' ' + LANG.PUBLIC.Online}`;

                    const arrivalsItem = new ArrivalsItem({
                        data: user
                    });
                    livesArrivals.appendChild(arrivalsItem.element);
                    addClass(arrivalsItem.element, this.options.showCalss);

                    animationEnd(arrivalsItem.element, () => {
                        livesArrivals.removeChild(arrivalsItem.element);
                    });
                }

            }
        };

        return livesContent;
    }

    _createNewsElement(element, userName, message, client) {
        const newsItemEL = new NewsItem({userName, message, client});

        const isBottom = isScrollBottom(element);
        element.appendChild(newsItemEL.element);
        if (isBottom) {
            this.scrollToBottom(element);
        }
    }

    _createGiftElement(element, userName, userHead, name, imgUrl, amount) {
        const giftBoxEL = new GiftBox({userName, userHead, name, imgUrl, amount});
        const isBottom = isScrollBottom(element);

        element.appendChild(giftBoxEL.element);
        setTimeout(() => {
            element.removeChild(giftBoxEL.element);
        }, 5000);

        if (isBottom) {
            this.scrollToBottom(element);
        }
    }

    _createLovesElement(element) {
        const lovesItem = new LovesItem();

        element.appendChild(lovesItem.element);
        addClass(lovesItem.element, 'show');
        setTimeout(() => {
            element.removeChild(lovesItem.element);
        }, 1500);
    }

    _createCountdownElement(element, times, callback) {
        const itemBox = createDivEl({className: 'lives-countdown'});
        const itemTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Live_Countdown.Title}`});
        const itemText = createDivEl({element: 'p', className: 'text', content: `${LANG.LIVE_PREVIEW.Live_Countdown.Text}`});
        const itemTimes = createDivEl({element: 'p', className: 'times', content: setTimesFormat(times)});
        itemBox.appendChild(itemTitle);
        itemBox.appendChild(itemTimes);

        if (times == 0) {
            itemBox.innerText = '';
            itemBox.appendChild(itemText);
            return itemBox;
        }

        const countDown = ({times, Balance, endCartoon}) => {
            if (times == 0) {
                if (this.notCoins && this.onClose) this.onClose();

                itemBox.innerText = '';
                itemBox.appendChild(itemText);
                this.secondTime = 0;
                endCartoon();
                if (callback) callback();
                return false;
            } else {
                itemTimes.innerText = `${setTimesFormat(times)}`;
                times--;
                this.secondTime = times;
                return setTimeout(() => {
                    Balance(times);
                    countDown({times, Balance, endCartoon});
                }, 1000);
            }
        }

        const Balance = (time) => {
            if (this.client && this.notCoins && (time == 180 || time == 60)) {
                this._createNotCoinsElement(time);
            }
        }

        const endCartoon = () => {
            const itemExplain = createDivEl({element: 'p', className: 'lives-showTime', content: `${LANG.LIVE_PREVIEW.Live_Countdown.Explain}`});

            element.appendChild(itemExplain);
            addClass(itemExplain, 'show');

            setTimeout(() => {
                addClass(itemExplain, 'hide');
                animationEnd(itemExplain, () => {
                    element.removeChild(itemExplain);
                });
            }, 2000);
        }

        countDown({times, Balance, endCartoon});

        return itemBox;
    }

    _createNotCoinsElement(time) {
        let modalsEl;
        const handler = () =>{
            closeModal(modalsEl);
            const livesRechargeEL = new LivesRecharge({
                data: {
                    package: this.userPackage,
                    goodslist: this.GoodList,
                    payWaylist: this.PayWayList
                }
            });
            const RechargeEl = popupPart({
                element: livesRechargeEL.element,
                title: LANG.LIVE_PREVIEW.Actions.Recharge
            });
            if (this.onRecharge) this.onRecharge(livesRechargeEL.element);
        }
        const notCoinsItem = new NotCoinsItem({
            handler,
            data: {
                time: `${setTimesFormat(time)}`,
                text: `${LANG.HOME.Madal.NotCoins.Text}`,
                button: `${LANG.HOME.Madal.NotCoins.ButtonsText}`
            }
        });
        modalsEl = popupPart({
            element: notCoinsItem.element,
            title: `${LANG.HOME.Madal.NotCoins.Title}`
        });
    }

    _GiftPullLoad(Element) {
        const wrapperEl = Element.querySelector('.gift-wrapper');
        const SlidePullLoad = new PullLoad(wrapperEl, {
            startX: 1,
            scrollX: true,
            scrollY: false,
            momentum: false,
            probeType: 2,
            snap: {
                loop: false,
                threshold: 0.3,
                easing:{
                    style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    fn: function(t) {
                        return t * (2 - t)
                    }
                }
            },
            click: true,
            tap: true,
            bounce: false
        }, {
            pullingModule: false,
            slideModule: true
        });
    }
}

// 主播端起始页
class LivesContentAnchor {
    constructor() {
        if (instanceAnchor) {
            return instanceAnchor;
        }

        this.options = {
            livesWrapperClass: 'lives-wrapper',
            livesHeaderClass: 'lives-header',
            livesAnchorClass: 'lives-anchor',
            livesFooterClass: 'lives-footer',
            livesContenClass: 'lives-content',
            // plugins
            pluginsClass: 'lives-plugins',
            beautyClass: 'live-beauty'
        };
        this.element = this._createElement();

        this.onClose = null;
        this.onPrivate = null;
        this.onParty = null;
        instanceAnchor = this;
    }

    _createElement() {
        const livesWrapper = createDivEl({className: ['content', 'bg-trans', this.options.livesWrapperClass]});

        // header
        const livesHeader = createDivEl({className: [this.options.livesHeaderClass, this.options.livesAnchorClass]});
        // 关闭直播
        const headerIconClose = createDivEl({element: 'i', className: ['icon', 'live-close']});
        addEvent(headerIconClose, 'click', () => {
            if (this.onClose) this.onClose();
        });
        livesHeader.appendChild(headerIconClose);
        livesWrapper.appendChild(livesHeader);

        const livesContent = createDivEl({className: this.options.livesContenClass});
        // plugins
        const livesPlugins = createDivEl({className: ['lives-button-groups', 'top-right', this.options.pluginsClass]});

        // plugins 美颜
        const PluginsIconBeauty = createDivEl({element: 'i', className: ['icon', this.options.beautyClass]});
        addEvent(PluginsIconBeauty, 'click', () => {
            const beauty = (id) => {
            }
            const pluginsBeauty = new GluginBeauty({beauty});
            const modalsEl = popupPart({
                element: pluginsBeauty.element
            });
        });
        livesPlugins.appendChild(PluginsIconBeauty);
        livesContent.appendChild(livesPlugins);
        livesWrapper.appendChild(livesContent);

        // footer
        const livesFooter = createDivEl({className: this.options.livesFooterClass});
        const anchorTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Live_Anchor.Title}`});
        livesFooter.appendChild(anchorTitle);

        const livesButtons = createDivEl({className: 'buttons'});

        // 一对一直播
        const ButtonPrivate = createDivEl({className: ['button', 'button-primary'], content: `${LANG.PUBLIC.LIVE_MODE.Private}`});
        addEvent(ButtonPrivate, 'click', () => {
            if (this.onPrivate) this.onPrivate();
        });
        livesButtons.appendChild(ButtonPrivate);

        // 一对多直播
        const ButtonParty = createDivEl({className: ['button', 'button-primary'], content: `${LANG.PUBLIC.LIVE_MODE.Party}`});
        addEvent(ButtonParty, 'click', () => {
            if (this.onParty) this.onParty();
        });
        livesButtons.appendChild(ButtonParty);
        livesFooter.appendChild(livesButtons);

        livesWrapper.appendChild(livesFooter);
        return livesWrapper;
    }
}

// 一对一直播/等待页
class LivesWaiting {
    constructor({data, handler, close, minimize}) {
        this.data = data;
        this.options = {
            wapperClass: 'waiting-wrapper',
            headerClass: 'waiting-header',
            btnIconClass: 'icon-btn',
            contentClass: 'waiting-content',
            waitingClass: 'scan-box',
            loadingClass: 'scan-loading',
            acrossClass: 'anchor-across',
            buttonsClass: 'buttons-vertical'
        };
        this.onHandler = handler;
        this.onClose = close;
        this.element = this._createElement(minimize);
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : acrossFemaleImg;
    }

    _createElement(minimize) {
        const wapper = createDivEl({className: this.options.wapperClass});

        // header
        const header = createDivEl({className: this.options.headerClass});
        // 标题
        const headerTitle = createDivEl({element: 'h1', className: 'title', content: `${LANG.LIVE_PREVIEW.Lives_Waiting.Title}`});
        header.appendChild(headerTitle);

        // 关闭直播
        const headerSwitch = createDivEl({className: this.options.btnIconClass});
        const headerSwitchIcon = createDivEl({element: 'i', className: 'icon', background: waitingSwitch});
        headerSwitch.appendChild(headerSwitchIcon);
        addEvent(headerSwitch, 'click', () => {
            if (this.onClose) this.onClose();
        });
        header.appendChild(headerSwitch);
        wapper.appendChild(header);

        // content
        const content = createDivEl({className: this.options.contentClass});

        // 等待状态
        const waiting = createDivEl({className: this.options.waitingClass, background: waitingLocate});
        const scanLoading = createDivEl({className: this.options.loadingClass, background: waitingLoading});
        waiting.appendChild(scanLoading);
        // 头像
        const across = createDivEl({className: this.options.acrossClass, background: this.acrossUrl});
        waiting.appendChild(across);
        content.appendChild(waiting);

        // 副标题
        const contentText = createDivEl({element: 'p', className: 'title', content: `${LANG.LIVE_PREVIEW.Lives_Waiting.Text}`});
        content.appendChild(contentText);
        wapper.appendChild(content);

        // buttons
        // const buttons = createDivEl({className: ['buttons', this.options.buttonsClass]});
        // const button = createDivEl({className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.Lives_Waiting.Buttons}`});
        // addEvent(button, 'click', () => {
        //     if (minimize) minimize();
        // });
        // buttons.appendChild(button);
        // wapper.appendChild(buttons);

        // 监听事件
        this.ChatEvent();

        return wapper;
    }

    ChatEvent() {
        const chatEvent = new SendBirdChatEvent();

        let notInvite = true;
        const countDown = (times) => {
            if (times == 0) return notInvite = true;

            return setTimeout(() => {
                times--;
                countDown(times);
            }, 1000);
        }

        // 收到消息
        chatEvent.onMessageReceived = (channel, messages) => {
            if (notInvite) {
                const {customType} = messages;
                switch(customType) {
                    case 'invite':
                        const {userSex, live_room_id, live_price} = JSON.parse(messages.data);
                        const {userId, nickname, profileUrl} = messages._sender;
                        notInvite = false;
                        if (this.onHandler) this.onHandler({
                            channel: channel,
                            clientName: nickname,
                            clientHead: profileUrl,
                            clientSex: userSex,
                            liveRoomId: live_room_id,
                            livePrice: live_price
                        });
                        countDown(10);
                        break;
                    case 'cancel':
                        notInvite = true;
                        if (this.onClose) this.onClose();
                        break;
                }
            }
        };
    }
}

// 一对一直播/呼叫页/客户端
class LivesCallingClient {
    constructor({data, channel, pass, redial, close, cancel, callback}) {
        this.data = data;
        this.options = {
            wapperClass: 'calling-wrapper',
            contentClass: 'calling-content',
            refuseClass: 'refuse-content',
            surgeClass: 'calling-surge',
            btnBlockClass: 'buttons-block',
            btnVerticalClass: 'buttons-vertical'
        };
        this.channel = channel;
        this.element = this._createElement(pass, redial, close, cancel, callback);
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : acrossMaleImg;
    }

    get name() {
        return this.data.userName ? `${this.data.userName}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get sex() {
        return this.data.userSex == 1  ? iconMaleImg : iconFemaleImg;
    }

    get anchorId() {
        return `${this.data.anchorId}`;
    }

    get roomId() {
        return `${this.data.roomId}`;
    }

    get roomType() {
        return `${this.data.roomType}`;
    }

    get price() {
        return `${this.data.price}`;
    }

    _createElement(pass, redial, close, cancel, callback) {
        const wapper = createDivEl({className: this.options.wapperClass});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossName = createDivEl({element: 'p', className: 'user-name'});
        const acrossSpan = createDivEl({element: 'span', content: this.name});
        const acrossIcon = createDivEl({element: 'i', className: 'icon', background: this.sex});
        acrossName.appendChild(acrossSpan);
        acrossName.appendChild(acrossIcon);
        acrossInfo.appendChild(acrossName);

        const acrossTime = createDivEl({element: 'p', className: 'calling-time', content: `00:10`});
        acrossInfo.appendChild(acrossTime);

        wapper.appendChild(acrossInfo);

        // content
        const content = createDivEl({className: this.options.contentClass});

        // 波动
        const surge = createDivEl({className: this.options.surgeClass});
        const surgeIcon = createDivEl({element: 'i', className: 'calling-sprite'});
        const surgeSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Called_Caller.Title}`});
        surge.appendChild(surgeIcon);
        surge.appendChild(surgeSpan);
        content.appendChild(surge);
        wapper.appendChild(content);

        // buttons
        const buttons = createDivEl({className: ['buttons', this.options.btnVerticalClass]});

        let timeStart = false;

        // 取消
        const buttonCancel = createDivEl({className: ['button', 'button-danger'], content: `${LANG.LIVE_PREVIEW.Called_Caller.Buttons_Cancel}`});
        addEvent(buttonCancel, 'click', () => {
            timeStart = true;
            if (cancel) cancel();
        });
        buttons.appendChild(buttonCancel);

        wapper.appendChild(buttons);

        // 倒计时
        const countDown = (times) => {
            if (timeStart) return false;
            if (times == 0 && !timeStart) return this._createRefuseElement({content, buttons, redial, close, callback});
            acrossTime.innerText = `${setTimesFormat(times)}`;
            return setTimeout(() => {
                times--;
                countDown(times);
            }, 1000);
        }
        countDown(10);

        // 监听事件
        const chatEvent = new SendBirdChatEvent();

        // 收到消息
        chatEvent.onMessageReceived = (channel, messages) => {
            if (this.channel.url === channel.url) {
                const {customType} = messages;
                switch(customType) {
                    case 'refuse':
                        // acrossTime.innerText = ``;
                        acrossInfo.removeChild(acrossTime);
                        this._createRefuseElement({content, buttons, redial, close, callback});
                        break;
                    case 'agree':
                        timeStart = true;
                        const {userSex, live_room_id, live_price} = JSON.parse(messages.data);
                        const {userId, nickname, profileUrl} = messages._sender;
                        if (pass) pass();
                        break;
                }
            }
        };

        return wapper;
    }

    _createRefuseElement({content, buttons, redial, close, callback}) {
        addClass(content, this.options.refuseClass);
        content.innerText = '';
        buttons.innerText = '';

        const Title = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.Refuse_Call.Title}`});
        content.appendChild(Title);

        callback().then((LiveInfo) => {
            const tag = createDivEl({className: ['tag', 'tag-anchor']});
            LiveInfo.forEach(item => {
                const label = createDivEl({element: 'label', className: 'anchor-label'});
                const img = createDivEl({element: 'img'});
                img.src = item.user_head;
                // img.src = item.everyday_img;
                label.appendChild(img);
                addEvent(label, 'click', () => {
                    if (redial) redial({
                        anchor_id: item.user_id,
                        room_id: item.live_room_id,
                        room_type: item.live_room_type,
                        room_price: item.live_price
                    });
                });
                tag.appendChild(label);
            });
            content.appendChild(tag);
        });

        // 重拨
        const buttonRedial = createDivEl({className: ['button', 'button-success'], content: `${LANG.LIVE_PREVIEW.Refuse_Call.Buttons_Call_Again}`});
        addEvent(buttonRedial, 'click', () => {
            if (redial) redial({
                anchor_id: this.anchorId,
                room_id: this.roomId,
                room_type: this.roomType,
                room_price: this.price
            });
        });
        buttons.appendChild(buttonRedial);

        // 取消
        const buttonClose = createDivEl({className: ['button', 'button-link'], content: `${LANG.LIVE_PREVIEW.Refuse_Call.Buttons_Maybe}`});
        addEvent(buttonClose, 'click', () => {
            if (close) close();
        });
        buttons.appendChild(buttonClose);
    }
}

// 一对一直播/呼叫页/主播端
class LivesCallingAnchor {
    constructor({data, channel, agree, refuse, cancel}) {
        this.data = data;
        this.options = {
            wapperClass: 'calling-wrapper',
            contentClass: 'calling-content',
            surgeClass: 'calling-surge',
            btnBlockClass: 'buttons-block',
            btnVerticalClass: 'buttons-vertical'
        };
        this.channel = channel;
        this.element = this._createElement(agree, refuse, cancel);
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : acrossFemaleImg;
    }

    get name() {
        return this.data.userName ? `${this.data.userName}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get sex() {
        return this.data.userSex == 1  ? iconMaleImg : iconFemaleImg;
    }

    _createElement(agree, refuse, cancel) {
        const wapper = createDivEl({className: this.options.wapperClass});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossName = createDivEl({element: 'p', className: 'user-name'});
        const acrossSpan = createDivEl({element: 'span', content: this.name});
        const acrossIcon = createDivEl({element: 'i', className: 'icon', background: this.sex});
        acrossName.appendChild(acrossSpan);
        acrossName.appendChild(acrossIcon);
        acrossInfo.appendChild(acrossName);

        const acrossTime = createDivEl({element: 'p', className: 'calling-time', content: `00:10`});
        acrossInfo.appendChild(acrossTime);

        wapper.appendChild(acrossInfo);

        // content
        const content = createDivEl({className: this.options.contentClass});

        // 波动
        const surge = createDivEl({className: this.options.surgeClass});
        const surgeIcon = createDivEl({element: 'i', className: 'calling-sprite'});
        const surgeSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.Called_Caller.Title}`});
        surge.appendChild(surgeIcon);
        surge.appendChild(surgeSpan);
        content.appendChild(surge);
        wapper.appendChild(content);

        let timeStart = false;

        // buttons
        const buttons = createDivEl({className: ['buttons', this.options.btnBlockClass]});

        // 拒绝
        const buttonRefuse = createDivEl({className: ['button', 'button-danger'], content: `${LANG.LIVE_PREVIEW.Called_Caller.Buttons_Refuse}`});
        addEvent(buttonRefuse, 'click', () => {
            timeStart = true;
            if (refuse) refuse();
        });
        buttons.appendChild(buttonRefuse);

        // 同意
        const buttonAgree = createDivEl({className: ['button', 'button-success'], content: `${LANG.LIVE_PREVIEW.Called_Caller.Buttons_Accept}`});
        addEvent(buttonAgree, 'click', () => {
            timeStart = true;
            if (agree) agree();
        });
        buttons.appendChild(buttonAgree);

        wapper.appendChild(buttons);


        const countDown = (times) => {
            if (timeStart) return false;
            if (times == 0) return refuse();
            acrossTime.innerText = `${setTimesFormat(times)}`;
            return setTimeout(() => {
                times--;
                countDown(times);
            }, 1000);
        }
        countDown(10);

        // 监听事件
        const chatEvent = new SendBirdChatEvent();

        // 收到消息
        chatEvent.onMessageReceived = (channel, messages) => {
            if (this.channel.url === channel.url) {
                const {customType} = messages;
                switch(customType) {
                    case 'cancel':
                        if (cancel) cancel();
                        break;
                }
            }
        };
        return wapper;
    }
}

// 直播结算页面/主播端
class LivesAnchorCount {
    constructor({data, handler, again, rest}) {
        this.data = data;
        this.options = {
            wrapperClass: 'user-cover-wrapper',
            headerClass: 'cover-header',
            contentClass: 'cover-content',
            buttonsClass: 'buttons-vertical'
        };
        this.element = this._createElement(handler, again, rest);
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossFemaleImg;
    }

    get name() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get sex() {
        return this.data.user_sex == 1  ? iconMaleImg : iconFemaleImg;
    }

    get today() {
        return this.data.start_time && this.data.end_time ? `${countFromNow(this.data.start_time, this.data.end_time)}` : `0 ${LANG.LIVE_PREVIEW.End_Live_Anchor.Min}`;
    }

    get time() {
        return this.data.time ? `${this.data.time}` : `0`;
    }

    get score() {
        return this.data.score ? `${this.data.score}` : `0`;
    }

    get giftList() {
        return this.data.gift_list ? this.data.gift_list : [];
    }

    _createElement(handler, again, rest) {
        const wrapper = createDivEl({className: ['lives-count-wrapper', this.options.wrapperClass]});

        // header
        const header = createDivEl({className: this.options.headerClass});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossName = createDivEl({element: 'p', className: 'user-name'});
        const acrossSpan = createDivEl({element: 'span', content: this.name});
        const acrossIcon = createDivEl({element: 'i', className: 'icon', background: this.sex});
        acrossName.appendChild(acrossSpan);
        acrossName.appendChild(acrossIcon);
        acrossInfo.appendChild(acrossName);
        header.appendChild(acrossInfo);

        const todayTitle = createDivEl({element: 'p', className: 'today-title'});
        const todayTextSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Live_Time_Today}`});
        const todayText = createDivEl({element: 'font', content: this.today});
        todayTitle.appendChild(todayTextSpan);
        todayTitle.appendChild(todayText);
        header.appendChild(todayTitle);

        // Score
        const anchorScore = createDivEl({className: 'anchor-score'});

        // Score/time
        const timeItem = createDivEl({className: 'score-item'});
        const timeTitle = createDivEl({element: 'h3'});
        const timeTitleFont = createDivEl({element: 'font', content: this.time});
        const timeSmall = createDivEl({element: 'small', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Min}`});
        const timeText = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Chat_Length}`});
        timeTitle.appendChild(timeTitleFont);
        timeTitle.appendChild(timeSmall);
        timeItem.appendChild(timeTitle);
        timeItem.appendChild(timeText);
        anchorScore.appendChild(timeItem);

        // Score/score
        const scoreItem = createDivEl({className: 'score-item'});
        const scoreTitle = createDivEl({element: 'h3', content: this.score});
        const scoreText = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Increase_Score}`});
        scoreItem.appendChild(scoreTitle);
        scoreItem.appendChild(scoreText);
        anchorScore.appendChild(scoreItem);

        header.appendChild(anchorScore);
        wrapper.appendChild(header);

        // content
        const content = createDivEl({className: ['text-center', this.options.contentClass]});

        const contentText = createDivEl({element: 'p', className: 'caption-title', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Text}`});
        content.appendChild(contentText);

        const Waiting = createDivEl({className: 'waiting-box'});
        const WaitingIcon = createDivEl({element: 'i', className: 'icon', background: cutoverIcon});
        const WaitingTitle = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Waiting.Title}`});
        const WaitingText = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Waiting.Text}`});
        Waiting.appendChild(WaitingIcon);
        Waiting.appendChild(WaitingTitle);
        Waiting.appendChild(WaitingTitle);
        content.appendChild(Waiting);
        wrapper.appendChild(content);

        if (handler) {
            handler().then((giftList) => {
                todayText.innerText = `${countFromNow(giftList.start_time, giftList.end_time)}`;
                timeTitleFont.innerText = `${giftList.time}`;
                scoreTitle.innerText = `${giftList.score}`;

                content.removeChild(Waiting);

                if (giftList.list || this.giftList) {
                    // gift list
                    const Preloading = createDivEl({className: ['tag', 'score-gift']});

                    this.giftList.forEach(messages => {
                        const data = JSON.parse(messages.data);
                        const item = new GiftCountItem({data});
                        Preloading.appendChild(item.element);
                    });

                    content.appendChild(Preloading);
                }else {
                    const notGiftTitle = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Not_Gift}`});
                    content.appendChild(notGiftTitle);
                }
            });
        }

        // buttons
        const buttons = createDivEl({className: ['buttons', this.options.buttonsClass]});
        const buttonsAgain = createDivEl({className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Buttons_Live_Again}`});
        addEvent(buttonsAgain, 'click', () => {
            if (again) again();
        });
        buttons.appendChild(buttonsAgain);

        const buttonYes = createDivEl({className: ['button', 'button-link'], content: `${LANG.LIVE_PREVIEW.End_Live_Anchor.Buttons_Yes}`});
        addEvent(buttonYes, 'click', () => {
            if (rest) rest();
        });
        buttons.appendChild(buttonYes);

        wrapper.appendChild(buttons);

        return wrapper;
    }
}

// 直播结算页面/客户端
class LivesClientCount {
    constructor({data, handler, again, rest}) {
        this.data = data;
        this.options = {
            wrapperClass: 'user-cover-wrapper',
            headerClass: 'cover-header',
            contentClass: 'cover-content',
            buttonsClass: 'buttons-vertical'
        };
        this.element = this._createElement(handler, again, rest);
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossFemaleImg;
    }

    get name() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get sex() {
        return this.data.user_sex == 1  ? iconMaleImg : iconFemaleImg;
    }

    get today() {
        return this.data.start_time && this.data.end_time ? `${countFromNow(this.data.start_time, this.data.end_time)}` : `0 ${LANG.LIVE_PREVIEW.End_Live_Anchor.Min}`;
    }

    _createElement(handler, again, rest) {
        const wrapper = createDivEl({className: ['lives-count-wrapper', this.options.wrapperClass]});

        // header
        const header = createDivEl({className: this.options.headerClass});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossName = createDivEl({element: 'p', className: 'user-name'});
        const acrossSpan = createDivEl({element: 'span', content: this.name});
        const acrossIcon = createDivEl({element: 'i', className: 'icon', background: this.sex});
        acrossName.appendChild(acrossSpan);
        acrossName.appendChild(acrossIcon);
        acrossInfo.appendChild(acrossName);
        header.appendChild(acrossInfo);

        const todayTitle = createDivEl({element: 'p', className: 'today-title'});
        const todayTextSpan = createDivEl({element: 'span', content: `${LANG.LIVE_PREVIEW.End_Live_User.Chat_Length}`});
        const todayText = createDivEl({element: 'font', content: this.today});
        todayTitle.appendChild(todayTextSpan);
        todayTitle.appendChild(todayText);
        header.appendChild(todayTitle);
        wrapper.appendChild(header);

        // content
        const content = createDivEl({className: ['text-center', this.options.contentClass]});

        const contentText = createDivEl({element: 'p', className: 'caption-title', content: `${LANG.LIVE_PREVIEW.End_Live_User.Text}`});
        content.appendChild(contentText);

        const stars = createDivEl({className: 'stars'});
        const starsIcon1 = createDivEl({element: 'i', className: ['icon', 'icon-star']});
        const starsIcon2 = createDivEl({element: 'i', className: ['icon', 'icon-star']});
        const starsIcon3 = createDivEl({element: 'i', className: ['icon', 'icon-star']});
        const starsIcon4 = createDivEl({element: 'i', className: ['icon', 'icon-star']});
        const starsIcon5 = createDivEl({element: 'i', className: ['icon', 'icon-star']});
        const starsSpan = createDivEl({element: 'span', className: 'stars-label', content: `0`});
        stars.appendChild(starsIcon1);
        stars.appendChild(starsIcon2);
        stars.appendChild(starsIcon3);
        stars.appendChild(starsIcon4);
        stars.appendChild(starsIcon5);
        stars.appendChild(starsSpan);
        content.appendChild(stars);
        wrapper.appendChild(content);

        if (handler) {
            handler().then((giftList) => {
                todayText.innerText = `${countFromNow(giftList.start_time, giftList.end_time)}`;
            });
        }

        // buttons
        const buttons = createDivEl({className: ['buttons', this.options.buttonsClass]});
        const buttonsAgain = createDivEl({className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.End_Live_User.Buttons_Submit}`});
        addEvent(buttonsAgain, 'click', () => {
            if (again) again();
        });
        buttons.appendChild(buttonsAgain);

        const buttonYes = createDivEl({className: ['button', 'button-link'], content: `${LANG.LIVE_PREVIEW.End_Live_User.Buttons_Maybe}`});
        addEvent(buttonYes, 'click', () => {
            if (rest) rest();
        });
        buttons.appendChild(buttonYes);

        wrapper.appendChild(buttons);

        return wrapper;
    }
}

// 主播离线状态页
class LivesAnchorOffline {
    constructor({data}) {
        this.data = data;
        this.options = {
            wrapperClass: 'lives-wrapper',
            headerClass: 'lives-header',
            contentClass: 'lives-content'
        };
        this.element = this._createElement();
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossFemaleImg;
    }

    _createElement() {
        const wrapper = createDivEl({className: this.options.wrapperClass});

        // header
        const header = createDivEl({className: this.options.headerClass});

        // across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);

        const acrossName = createDivEl({element: 'p', className: 'user-name', content: this.name});
        acrossInfo.appendChild(acrossName);
        header.appendChild(acrossInfo);

        const headerText = createDivEl({element: 'p', className: 'today-title', content: LANG.LIVE_PREVIEW.End_Live_Anchor.Live_Time_Today});
        header.appendChild(headerText);

        // content
        const content = createDivEl({className: ['text-center', this.options.contentClass]});

        const contentTitle = createDivEl({element: 'p', className: 'caption-title', content: LANG.LIVE_PREVIEW.End_Live_Anchor.Text});
        content.appendChild(contentTitle);

        wrapper.appendChild(content);
        return wrapper;
    }
}

// 客户端未付款页
class LivesFuzzyLayer {
    constructor() {
        this.options = {
            livesWapperClass: 'lives-fuzzy-layer',
            livesHeaderClass: 'lives-layer-top',
            livesContensClass: 'lives-anchor',
            livesLabelClass: 'lives-label'
        };
        this.element = this._createElement();

        this.onClose = null;
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : (this.data.userSex == 1  ? acrossMaleImg : acrossFemaleImg);
    }

    _createElement() {
        const livesWapper = createDivEl({className: this.options.livesWapperClass});

        // header
        const livesHeader = createDivEl({className: [this.options.livesHeaderClass]});
        // 关闭直播
        const headerIconClose = createDivEl({element: 'i', className: ['icon', 'live-close']});
        addEvent(headerIconClose, 'click', () => {
            if (this.onClose) this.onClose();
        });
        livesHeader.appendChild(headerIconClose);
        livesWapper.appendChild(livesHeader);

        // content
        const livesContens = createDivEl({className: this.options.livesContensClass});

        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        acrossImg.src = this.acrossUrl;
        const acrossLabel = createDivEl({element: 'span', className: this.options.livesLabelClass, content: `${LANG.LIVE_PREVIEW.Live_Fuzzy_Layer.Label}`});
        acrossInfo.appendChild(acrossImg);
        acrossInfo.appendChild(acrossLabel);
        livesContens.appendChild(acrossInfo);

        const contensTitle = createDivEl({element: 'h5', content: `${LANG.LIVE_PREVIEW.Live_Fuzzy_Layer.Title}`});
        const contensText = createDivEl({element: 'p', content: `${LANG.LIVE_PREVIEW.Live_Fuzzy_Layer.Text}`});
        const button = createDivEl({element: 'a', className: ['button', 'button-primary'], content: `${LANG.LIVE_PREVIEW.Buttons.Buy_Now}`});
        button.href = jumpURL('#/user/account');
        livesContens.appendChild(contensTitle);
        livesContens.appendChild(contensText);
        livesContens.appendChild(button);
        livesWapper.appendChild(livesContens);
        return livesWapper;
    }
}
export { LivesContent, LivesContentAnchor, LivesWaiting, LivesCallingAnchor, LivesCallingClient, LivesAnchorCount};