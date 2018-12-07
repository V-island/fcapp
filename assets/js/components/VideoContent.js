import videojs from 'video.js';
require('!style-loader!css-loader!video.js/dist/video-js.css');
require('videojs-resolution-switcher');

import {LivesNews, LivesShare, LivesGift, LivesRecharge} from './LivesContentModal';
import {CommentItem} from './VideoContentItem';
import {closeModal, alert, popupPart} from './Modal';
import {FacebookPlugin, TwitterPlugin} from './ThirdPartyPlugin';
import { PullLoad } from './PullLoad';
import {Spinner} from './Spinner';
import {
    body,
    domainURL} from '../intro';
import {
    getUserInfo
} from '../api';
import {
    getLangConfig
} from '../lang';
import {
    jumpURL,
    addEvent,
    createDivEl,
    protectFromXSS,
    addClass,
    hasClass,
    removeClass,
    replaceNote,
    appendToFirst,
    isScrollBottom,
    showHideDom,
    animationEnd
} from '../util';

import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';
import iconFemaleImg from '../../img/icon-female@2x.png';
import iconMaleImg from '../../img/icon-male@2x.png';

import backIcon from '../../img/messages/icon-back@2x.png';

import giftIcon from '../../img/videos/icon-gift@2x.png';
import shareIcon from '../../img/videos/icon-share@2x.png';
import keepIcon from '../../img/videos/icon-keep@2x.png';
import likeIcon from '../../img/videos/icon-like@2x.png';
import keepActiveIcon from '../../img/videos/icon-keep-active@2x.png';
import likeActiveIcon from '../../img/videos/icon-like-active@2x.png';

import giftFullIcon from '../../img/videos/fullscreen-gift@2x.png';
import shareFullIcon from '../../img/videos/fullscreen-share@2x.png';
import keepFullIcon from '../../img/videos/fullscreen-keep@2x.png';
import likeFullIcon from '../../img/videos/fullscreen-like@2x.png';

import failedLoadImg from '../../img/failed-load@2x.png';

const LANG = getLangConfig();

const defaultInfo = {
    userName: `${LANG.MESSAGE.Anonymous}`,
    userHead: acrossMaleImg,
    userPackage: 0
};

// 视频功能
class VideoContent {
    constructor({data}) {
        this.data = data;
        this.options = {
            videosWrapperClass: 'videos-wrapper',
            videosHeaderClass: 'videos-header',
            videosContentClass: 'videos-content',
            videosFooterClass: 'videos-footer',

            videosWindowClass: 'videos-window',

            videosModuleClass: 'videos-module',
            headerModuleClass: 'module-header',
            contenrModuleClass: 'module-contenr',

            labelClass: 'video-label',

            listBoxClass: 'list-comments',
            noCommentClass: 'no-comment',

            videoPlayerId: 'preview-player',

            contentClass: 'vjs-header-bar',
            groupsClass: 'vjs-header-groups',
            overlayClass: 'vjs-modal-overlay',
            modalClass: 'vjs-modal',

            modalVisibleClass: 'modal-overlay-visible',
            modalOutClass: 'modal-out',
            modalInClass: 'modal-in',

            disabledClass: 'disabled',
            showCalss: 'active'
        };
        this.element = this.createElement();

        this.facebook = new FacebookPlugin();
        this.twitter = new TwitterPlugin();

        this.onFavorite = null;
        this.onLike = null;
        this.onKeep = null;

        this.onSend = null;
        this.onGift = null;
        this.onRecharge = null;

        this.init();
    }

    get id() {
        return `${this.data.AnchorInfo.anchor_id}`;
    }

    get videoId() {
        return `${this.data.AnchorInfo.video_id}`;
    }

    get acrossUrl() {
        return this.data.AnchorInfo.user_head ? protectFromXSS(this.data.AnchorInfo.user_head) : acrossFemaleImg;
    }

    get userName() {
        return this.data.AnchorInfo.user_name ? `${this.data.AnchorInfo.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get userFollow() {
        return this.data.PlayVideoInfo.followStatus == 1 ? true : false;
    }

    get collectionStatus() {
        return this.data.PlayVideoInfo.collection_status == 1 ? true : false;
    }

    get comment() {
        return this.data.PlayVideoInfo.countComment ? `(${parseInt(this.data.PlayVideoInfo.countComment) > 9999 ? '9999+' : this.data.PlayVideoInfo.countComment})` : `(0)`;
    }

    set comment(value) {
        let num = this.data.PlayVideoInfo.countComment ? this.data.PlayVideoInfo.countComment : 0;
        this.data.PlayVideoInfo.countComment = parseInt(num) + value;
    }

    get support() {
        return this.data.AnchorInfo.support ? `${parseInt(this.data.AnchorInfo.support) > 999 ? '999+' : this.data.AnchorInfo.support}` : `0`;
    }

    set support(value) {
        let num = this.data.AnchorInfo.support ? this.data.AnchorInfo.support : 0;
        this.data.AnchorInfo.support = parseInt(num) + value;
    }

    get keep() {
        return this.data.PlayVideoInfo.keep ? `${parseInt(this.data.PlayVideoInfo.keep) > 999 ? '999+' : this.data.PlayVideoInfo.keep}` : `0`;
    }

    set keep(value) {
        let num = this.data.PlayVideoInfo.keep ? this.data.PlayVideoInfo.keep : 0;
        this.data.PlayVideoInfo.keep = parseInt(num) + value;
    }

    get videoUrl() {
        return this.data.PlayVideoInfo.video_url ? protectFromXSS(this.data.PlayVideoInfo.video_url) : false;
    }

    get videoMiddleUrl() {
        return this.data.PlayVideoInfo.video_url_middle ? protectFromXSS(this.data.PlayVideoInfo.video_url_middle) : false;
    }

    get videoLowUrl() {
        return this.data.PlayVideoInfo.video_url_low ? protectFromXSS(this.data.PlayVideoInfo.video_url_low) : false;
    }

    get previewUrl() {
        return this.data.AnchorInfo.video_img ? protectFromXSS(this.data.AnchorInfo.video_img) : failedLoadImg;
    }

    get description() {
        return this.data.PlayVideoInfo.video_description ? `${this.data.PlayVideoInfo.video_description}` : ``;
    }

    get commentList() {
        return this.data.CommentList ? this.data.CommentList : [];
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

    scrollToBottom(element) {
        element.scrollTop = element.scrollHeight - element.offsetHeight;
    }

    init() {
        const self = this;
        videojs.plugin('videoHeader', function(options) {
            this.ready(() => {
                const content = self.createVideoElement(this, options);
                this.el().appendChild(content);
            });
        });
    }

    createElement() {
        const userInfo = getUserInfo(true);
        const { userName, userHead, userPackage } = userInfo === null ? defaultInfo : userInfo;
        this.userPackage = userPackage;

        const videosWrapper = createDivEl({className: this.options.videosWrapperClass});

        // header
        const videosHeader = createDivEl({className: this.options.videosHeaderClass});

        // header/Video Window
        const videosWindow = createDivEl({className: this.options.videosWindowClass});
        const video = createDivEl({element: 'video', id: this.options.videoPlayerId, className: ['video-js', 'vjs-default-skin', 'vjs-big-play-centered']});
        this.window = videosWindow;

        video.setAttribute('controls', 'controls');
        video.setAttribute('autoplay', 'autoplay');
        video.setAttribute('preload', 'auto');
        video.setAttribute('poster', this.previewUrl);
        // 使用h5播放器，默认打开网页的时候，会自动全屏
        video.setAttribute('webkit-playsinline', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('x5-playsinline', true);
        video.setAttribute('x-webkit-airplay', 'allow');

        // 启用Ｈ5同层播放器
        video.setAttribute('x5-video-player-type', 'h5');
        video.setAttribute('x5-video-player-fullscreen', true);
        // 控制横竖屏  可选值： landscape 横屏, portraint竖屏
        video.setAttribute('x5-video-orientation', 'landscape');

        if (this.videoUrl) {
            const source = createDivEl({element: 'source'});
            source.setAttribute('src', `${this.videoUrl}`);
            source.setAttribute('type', 'video/mp4');
            source.setAttribute('label', 'HD');
            video.appendChild(source);
        }

        videosWindow.appendChild(video);
        videosHeader.appendChild(videosWindow);
        videosWrapper.appendChild(videosHeader);

        // content
        const videosContent = createDivEl({className: this.options.videosContentClass});

        // content/info
        const moduleInfo = createDivEl({className: this.options.videosModuleClass});

        // content/info/heder
        const InfoHeader = createDivEl({className: this.options.headerModuleClass});

        // content/info/across
        const acrossInfo = createDivEl({className: 'user-info'});
        const acrossImg = createDivEl({element: 'img', className: 'user-img'});
        const acrossName = createDivEl({element: 'p', className: 'user-name', content: this.userName});
        acrossImg.src = this.acrossUrl;
        acrossInfo.appendChild(acrossImg);
        acrossInfo.appendChild(acrossName);
        InfoHeader.appendChild(acrossInfo);

        // content/info/across
        const btnFavorite = createDivEl({className: ['button', 'button-primary'], content: `${LANG.FAVORITE.Follow}`});
        if (this.userFollow) {
            addClass(btnFavorite, this.options.disabledClass);
            btnFavorite.innerText = `${LANG.FAVORITE.Followed}`;
        }
        addEvent(btnFavorite, 'click', () => {
            let status;
            if (hasClass(btnFavorite, this.options.disabledClass)) {
                removeClass(btnFavorite, this.options.disabledClass);
                btnFavorite.innerText = `${LANG.FAVORITE.Follow}`;
                status = 1;
            }else {
                addClass(btnFavorite, this.options.disabledClass);
                btnFavorite.innerText = `${LANG.FAVORITE.Followed}`;
                status = 2;
            }

            if (this.onFavorite) this.onFavorite(this.id, status);
        });
        InfoHeader.appendChild(btnFavorite);
        moduleInfo.appendChild(InfoHeader);

        // 视频描述
        const description = createDivEl({element: 'p', className: 'description', content: this.description});
        moduleInfo.appendChild(description);

        const tag = createDivEl({className: 'tag'});

        // like
        const btnLike = createDivEl({element: 'label', className: this.options.labelClass});
        const btnLikeICon = createDivEl({element: 'i', className: 'icon', background: likeIcon});
        const btnLikeSpan = createDivEl({element: 'span', content: this.support});
        btnLike.appendChild(btnLikeICon);
        btnLike.appendChild(btnLikeSpan);
        addEvent(btnLike, 'click', () => {
            if (hasClass(btnLike, this.options.showCalss)) return false;

            addClass(btnLike, this.options.showCalss);
            this.support = 1;
            btnLikeSpan.innerText = this.support;
            btnLikeICon.style.backgroundImage = `url(${likeActiveIcon})`;
            if (this.onLike) this.onLike(this.videoId, 1);
        });
        tag.appendChild(btnLike);

        // keep
        const btnKeep = createDivEl({element: 'label', className: this.options.labelClass});
        const btnKeepICon = createDivEl({element: 'i', className: 'icon', background: keepIcon});
        const btnKeepSpan = createDivEl({element: 'span', content: this.keep});
        btnKeep.appendChild(btnKeepICon);
        btnKeep.appendChild(btnKeepSpan);
        if (this.collectionStatus) {
            addClass(btnKeep, this.options.showCalss);
            btnKeepICon.style.backgroundImage = `url(${keepActiveIcon})`;
        }
        addEvent(btnKeep, 'click', () => {
            if (hasClass(btnKeep, this.options.showCalss)) {
                removeClass(btnKeep, this.options.showCalss);
                this.keep = -1;
                btnKeepSpan.innerText = this.keep;
                btnKeepICon.style.backgroundImage = `url(${keepIcon})`;
                if (this.onKeep) this.onKeep(this.videoId, 2);
            }else {
                addClass(btnKeep, this.options.showCalss);
                this.keep = 1;
                btnKeepSpan.innerText = this.keep;
                btnKeepICon.style.backgroundImage = `url(${keepActiveIcon})`;
                if (this.onKeep) this.onKeep(this.videoId, 1);
            }
        });
        tag.appendChild(btnKeep);

        // share
        const btnShare = createDivEl({element: 'label', className: this.options.labelClass});
        const btnShareICon = createDivEl({element: 'i', className: 'icon', background: shareIcon});
        const btnShareSpan = createDivEl({element: 'span', content: `${LANG.VIDEO.Share}`});
        btnShare.appendChild(btnShareICon);
        btnShare.appendChild(btnShareSpan);
        addEvent(btnShare, 'click', () => {
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
            const shareEL = new LivesShare({
                facebook,
                twitter
            });
            modalsEl = popupPart({
                element: shareEL.element,
                title: `${LANG.LIVE_PREVIEW.Share.Title}`,
                themecalss: 'theme-video',
                footer: true,
                cancelIcon: true
            });
        });
        tag.appendChild(btnShare);

        // gift
        const btnGift = createDivEl({element: 'label', className: this.options.labelClass});
        const btnGiftICon = createDivEl({element: 'i', className: 'icon', background: giftIcon});
        const btnGiftSpan = createDivEl({element: 'span', content: `${LANG.VIDEO.Gift}`});
        btnGift.appendChild(btnGiftICon);
        btnGift.appendChild(btnGiftSpan);
        addEvent(btnGift, 'click', () => {
            let modalsEl;
            const send = (giftId, price, name, imgUrl, amount) => {
                if (this.onGift) this.onGift(this.id, this.videoId, giftId, price, name, imgUrl, amount);
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
                    title: `${LANG.LIVE_PREVIEW.Actions.Recharge}`,
                    themecalss: 'theme-video'
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
                title: `${LANG.LIVE_PREVIEW.Actions.Gift}`,
                themecalss: 'theme-video'
            });
            this._GiftPullLoad(modalsEl);
        });
        tag.appendChild(btnGift);

        moduleInfo.appendChild(tag);
        videosContent.appendChild(moduleInfo);

        // content/Comment
        const moduleComment = createDivEl({className: [this.options.videosModuleClass, 'comment-group']});

        // Comment/heder
        const CommentHeader = createDivEl({className: this.options.headerModuleClass});
        const CommentHeaderTitle = createDivEl({element: 'p', className: 'title', content: `${LANG.VIDEO.Comment}`});
        const CommentHeaderSpan = createDivEl({element: 'small', content: this.comment});
        CommentHeaderTitle.appendChild(CommentHeaderSpan);
        CommentHeader.appendChild(CommentHeaderTitle);
        moduleComment.appendChild(CommentHeader);

        // Comment/contenr
        const CommentContent = createDivEl({ className: this.options.contenrModuleClass});
        const listBox = createDivEl({className: ['list', this.options.listBoxClass, 'theme-video']});
        if (this.commentList.length > 0) {
            this.commentList.forEach((data, index) => {
                const commentItem = new CommentItem({data});
                listBox.appendChild(commentItem.element);
            });
        } else {
            addClass(listBox, this.options.noCommentClass);
            const noComment = createDivEl({element: 'p', content: `${LANG.VIDEO.NoComment}`});
            listBox.appendChild(noComment);
        }
        CommentContent.appendChild(listBox);
        moduleComment.appendChild(CommentContent);

        videosContent.appendChild(moduleComment);
        videosWrapper.appendChild(videosContent);

        // footer
        const videosFooter = createDivEl({
            className: this.options.videosFooterClass
        });
        const send = (value) => {
            if (hasClass(listBox, this.options.noCommentClass)) {
                listBox.innerText = '';
                removeClass(listBox, this.options.noCommentClass);
            }

            const itemEl = new CommentItem({
                data: {
                    user_head: userHead,
                    user_name: userName,
                    comment_content: value
                }
            });

            const isBottom = isScrollBottom(CommentContent);
            // listBox.appendChild(itemEl.element);
            appendToFirst(listBox, itemEl.element);
            if (isBottom) {
                this.scrollToBottom(CommentContent);
            }
            this.comment = 1;
            CommentHeaderSpan.innerText = this.comment;
            if (this.onSend) this.onSend(this.videoId, value);
        };
        const livesNews = new LivesNews({
            send,
            data: {
                placeholder: `${LANG.VIDEO.News.Placeholder}`
            }
        });
        videosFooter.appendChild(livesNews.element);
        videosWrapper.appendChild(videosFooter);

        return videosWrapper;
    }

    createVideoElement(player, options) {
        // header
        const content = createDivEl({className: this.options.contentClass});

        const closeIcon = createDivEl({element: 'i', className: 'icon', background: backIcon});
        addEvent(closeIcon, 'click', () => {
            if (player.isFullscreen()) {
                return player.exitFullWindow();
            }else {
                return location.href = jumpURL('#/home');
            }
        });
        content.appendChild(closeIcon);

        const groups = createDivEl({className: this.options.groupsClass});

        // like
        const likeIconEl = createDivEl({element: 'i', className: 'icon', background: likeFullIcon});
        if (this.userFollow) {
            addClass(likeIconEl, this.options.showCalss);
            likeIconEl.style.backgroundImage = `url(${likeActiveIcon})`;
        }
        addEvent(likeIconEl, 'click', () => {
            if (hasClass(likeIconEl, this.options.showCalss)) return false;

            addClass(likeIconEl, this.options.showCalss);
            this.support = 1;
            likeIconEl.style.backgroundImage = `url(${likeActiveIcon})`;
            if (this.onLike) this.onLike(this.videoId, 1);
        });
        groups.appendChild(likeIconEl);

        // keep
        const keepIconEl = createDivEl({element: 'i', className: 'icon', background: keepFullIcon});
        if (this.collectionStatus) {
            addClass(keepIconEl, this.options.showCalss);
            keepIconEl.style.backgroundImage = `url(${keepActiveIcon})`;
        }
        addEvent(keepIconEl, 'click', () => {
            if (hasClass(keepIconEl, this.options.showCalss)) {
                removeClass(keepIconEl, this.options.showCalss);
                this.keep = -1;
                keepIconEl.style.backgroundImage = `url(${keepFullIcon})`;
                if (this.onKeep) this.onKeep(this.videoId, 2);
            }else {
                addClass(keepIconEl, this.options.showCalss);
                this.keep = 1;
                keepIconEl.style.backgroundImage = `url(${keepActiveIcon})`;
                if (this.onKeep) this.onKeep(this.videoId, 1);
            }
        });
        groups.appendChild(keepIconEl);

        // overlay/modal
        const overlayModal = createDivEl({className: this.options.overlayClass});
        addEvent(overlayModal, 'click', () => {
            const isModal = player.el().querySelector(`.${this.options.modalInClass}`);
            console.log(isModal);

            removeClass(overlayModal, this.options.modalVisibleClass);
            removeClass(isModal, this.options.modalInClass);
            addClass(isModal, this.options.modalOutClass);
            animationEnd(isModal, () => {
                showHideDom(isModal, 'none');
            });
        });
        player.el().appendChild(overlayModal);

        // share/modal
        const shareModal = createDivEl({className: this.options.modalClass});
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
        const shareEL = new LivesShare({
            facebook,
            twitter
        });
        shareModal.appendChild(shareEL.element);

        player.el().appendChild(shareModal);

        // share
        const shareIcon = createDivEl({element: 'i', className: 'icon', background: shareFullIcon});
        addEvent(shareIcon, 'click', () => {
            showHideDom(shareModal, 'block');
            addClass(overlayModal, this.options.modalVisibleClass);
            removeClass(shareModal, this.options.modalOutClass);
            addClass(shareModal, this.options.modalInClass);
        });
        groups.appendChild(shareIcon);

        // gift/modal
        const giftModal = createDivEl({className: this.options.modalClass});
        const send = (giftId, price, name, imgUrl, amount) => {
            if (this.onGift) this.onGift(this.id, this.videoId, giftId, price, name, imgUrl, amount);
        };
        const recharge = () => {
            const livesRechargeEL = new LivesRecharge({
                data: {
                    package: userPackage,
                    goodslist: this.GoodList,
                    payWaylist: this.PayWayList
                }
            });
            const RechargeEl = popupPart({
                element: livesRechargeEL.element,
                title: `${LANG.LIVE_PREVIEW.Actions.Recharge}`,
                themecalss: 'theme-black'
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
                package: this.userPackage
            }
        });
        giftModal.appendChild(giftEL.element);
        player.el().appendChild(giftModal);

        this._GiftPullLoad(giftEL.element);

        // gift
        const giftIcon = createDivEl({element: 'i', className: 'icon', background: giftFullIcon});
        addEvent(giftIcon, 'click', () => {
            showHideDom(giftModal, 'block');
            addClass(overlayModal, this.options.modalVisibleClass);
            removeClass(giftModal, this.options.modalOutClass);
            addClass(giftModal, this.options.modalInClass);
        });
        groups.appendChild(giftIcon);

        content.appendChild(groups);

        return content;
    }

    player() {
        const srcList = () => {
            let data = [];
            if (this.videoUrl) {
                data.push({
                    src: `${this.videoUrl}`,
                    type: 'video/mp4',
                    label: 'HD',
                    res: 720
                });
            }
            if (this.videoMiddleUrl) {
                data.push({
                    src: `${this.videoMiddleUrl}`,
                    type: 'video/mp4',
                    label: '480p',
                    res: 480
                });
            }
            if (this.videoLowUrl) {
                data.push({
                    src: `${this.videoLowUrl}`,
                    type: 'video/mp4',
                    label: '360p',
                    res: 360
                });
            }
            console.log(data);
            return data;
        }
        const Player = videojs(this.options.videoPlayerId, {
            autoplay: 'muted',
            height: `${this.window.offsetHeight}`,
            width: `${this.window.offsetWidth}`,
            preload: 'auto',
            plugins: {
                videoHeader: {

                },
                videoJsResolutionSwitcher: {
                    default: 'high',
                    dynamicLabel: true,
                    ui: false
                }
            }
        }, function() {
            Player.updateSrc(srcList());

            // 开始或恢复播放
            this.on('play', () => {
                // console.log('正在播放');
            });

            //暂停--播放完毕后也会暂停
            this.on('pause', () => {
                // console.log("暂停中");
            });

            // 检测全屏状态
            this.on('fullscreenchange', (event) => {
                if (hasClass(event.target, 'vjs-fullscreen')) {
                    console.log(this.controlBar.resolutionSwitcher);
                    removeClass(this.controlBar.resolutionSwitcher, 'vjs-hidden');
                }else {
                    addClass(this.controlBar.resolutionSwitcher, 'vjs-hidden');
                }
            });

            // 结束
            this.on('ended', () => {
                // console.log('结束');
            });

            addClass(this.controlBar.resolutionSwitcher, 'vjs-hidden');
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

export {VideoContent};