import Template from 'art-template/lib/template-web';
import BScroll from 'better-scroll';
import EventEmitter from './eventEmitter';
import FacebookLogin from './FacebookLogin';
import SendBirdAction from './SendBirdAction';
import SignalingClient from './signalingClient';
import Client from './client';
import Modal from './modal';
import Pay from './Pay';
import {
    fcConfig,
    domainURL
} from './intro';
import {
    getUserInfo,
    setUserInfo,
    findAllgifts,
    selCommentById,
    follow,
    praiseVideo,
    commentVideo,
    videoGifts,
    selAllGoods
} from './api';
import {
    getLangConfig
} from './lang';
import {
    extend,
    addEvent,
    createDom,
    importTemplate,
    createDivEl,
    replaceNote,
    isNumber,
    getData,
    hasClass,
    addClass,
    toggleClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();
const FB = new FacebookLogin();

export default class VideoPreview extends EventEmitter {
    constructor(element, options) {
        super();

        this.data = {};
        this.options = {
            btnLiveCloseClass: 'btn-close',
            btnAddAttentionClass: 'btn-add-attention',
            videoClass: 'video',
            iconAttentionClass: 'live-attention',
            iconAddAttentionClass: 'live-add-attention',
            commentAmountClass: 'countComment-amount',
            supportAmountClass: 'support-amount',

            modalGroupClass: 'actions-modal-group',
            listCommentsClass: 'list-comments',
            newsInputClass: 'news-input',
            newsPhizClass: 'news-phiz',

            giftsWrapperClass: '.gift-wrapper',
            giftsContentClass: 'gift-content',
            giftsItemClass: 'gift-item',
            giftsLabelClass: 'gift-label',
            videoItemClass: 'video-item',
            userPackageClass: 'user-package',

            btnNewsClass: 'btn-news',
            btnThumbsClass: 'btn-thumbs',
            btnShareClass: 'btn-share',
            btnGiftClass: 'btn-gift',
            btnFecebookClass: 'btn-fecebook',
            btnTwitterClass: 'btn-twitter',
            btnTumblrClass: 'btn-tumblr',
            btnRechargeClass: 'btn-recharge',
            btnSendClass: 'btn-send',

            praiseCountClass: 'praise',
            eyeCountClass: 'eye',
            dataUserPackage: 'userPackage',
            dataID: 'id',
            dataGiftUrl: 'giftUrl',
            dataPrice: 'price',
            showClass: 'active'
        };

        this.element = element;
        this.localInfo = getUserInfo();

        extend(this.data, LANG);
        extend(this.options, options);

        this.videoPreviewFile = fcConfig.publicFile.client_rtc;

        this.init();
    }

    init() {
        this.CommentStart = false;
        this.tpl = {};
        this._page = 1;
        this._number = 10;
        this.SendBird = new SendBirdAction();
        let getAllgifts = findAllgifts();
        let getSelAllGoods = selAllGoods();
        let getComment = selCommentById(this.options.id, this._page, this._number);
        let SendBirdConnect = this.SendBird.connect(this.localInfo.userId);

        Promise.all([getAllgifts, getComment, getSelAllGoods, SendBirdConnect]).then((data) => {
            this.data.GiftList = data[0] ? data[0] : false;
            this.data.CommentList = data[1] ? data[1] : false;
            this.data.AllGoodsList = data[2] ? data[2] : false;
            this.data.UserInfoList = this.localInfo;

            importTemplate(this.videoPreviewFile, (id, _template) => {
                this.tpl[id] = Template.render(_template, this.data);
            });

            this._init();
            this.trigger('videoPreview.start');
        });
    }

    _init() {
        this.previewModalEl = modal.popup(this._videoPreviewTemplate(this.options));
        this.videoEl = this.previewModalEl.getElementsByClassName(this.options.videoClass);
        this.btnLiveCloseEl = this.previewModalEl.getElementsByClassName(this.options.btnLiveCloseClass)[0];
        this.btnAddAttentionEl = this.previewModalEl.getElementsByClassName(this.options.btnAddAttentionClass)[0];
        this.btnNewsEl = this.previewModalEl.getElementsByClassName(this.options.btnNewsClass)[0];
        this.btnThumbsEl = this.previewModalEl.getElementsByClassName(this.options.btnThumbsClass)[0];
        this.btnShareEl = this.previewModalEl.getElementsByClassName(this.options.btnShareClass)[0];
        this.btnGiftEl = this.previewModalEl.getElementsByClassName(this.options.btnGiftClass)[0];

        this.commentAmountEl = this.previewModalEl.getElementsByClassName(this.options.commentAmountClass)[0];
        this.supportAmountEl = this.previewModalEl.getElementsByClassName(this.options.supportAmountClass)[0];

        // element
        this.praiseCountEl = this.element.getElementsByClassName(this.options.praiseCountClass);
        this.eyeCountEl = this.element.getElementsByClassName(this.options.eyeCountClass);

        this._bindEvent();
    }

    _bindEvent() {
        // 视频列表增加观看数目
        if (this.eyeCountEl.length > 0) {
            this.eyeCountEl[0].innerHTML = parseInt(this.eyeCountEl[0].innerHTML) + 1;
        }

        // 视频自动播放
        if (this.videoEl.length > 0) {
            this.videoEl[0].addEventListener('touchstart', () => {
                this.videoEl[0].play();
            });
            this.videoEl[0].addEventListener('ended', (e)=>  {
                this.videoEl[0].play();
            });
            setTimeout(() => {
                this.videoEl[0].play();
            }, 1000);
        }

        // 关闭
        addEvent(this.btnLiveCloseEl, 'click', () => {
            this.SendBird.disconnect().then(() => {
                modal.closeModal(this.previewModalEl);
            });
        });

        // 加关注
        addEvent(this.btnAddAttentionEl, 'click', () => {
            let index = getData(this.btnAddAttentionEl, this.options.dataID),
                status;

            if (hasClass(this.btnAddAttentionEl, this.options.iconAttentionClass)) {
                removeClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
                addClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
                status = 1;
            }else {
                removeClass(this.btnAddAttentionEl, this.options.iconAddAttentionClass);
                addClass(this.btnAddAttentionEl, this.options.iconAttentionClass);
                status = 2;
            }
            follow(index, status);
        });

        // 留言
        addEvent(this.btnNewsEl, 'click', () => {
            let newsModalEl = modal.actions(this.tpl.live_comments, {
                title: LANG.LIVE_PREVIEW.Actions.Comment,
                closeBtn: true
            });
            let modalGroupEl = newsModalEl.getElementsByClassName(this.options.modalGroupClass);
            let listCommentsEl = newsModalEl.getElementsByClassName(this.options.listCommentsClass)[0];
            let textareaEl = newsModalEl.getElementsByClassName(this.options.newsInputClass)[0];
            let btnNewsPhizEl = newsModalEl.getElementsByClassName(this.options.newsPhizClass)[0];
            let btnSendEl = newsModalEl.getElementsByClassName(this.options.btnSendClass)[0];

            addEvent(btnSendEl, 'click', () => {
                let _val = textareaEl.value;

                if (_val == "") {
                    return modal.alert(LANG.LIVE_PREVIEW.Comment_Prompt.Is_Empty, (_modal) => {
                            modal.closeModal(_modal);
                        });
                }
                let getCommentVideo = commentVideo(this.options.id, _val);
                getCommentVideo.then((data) => {
                    if (!data) return false;

                    this.commentAmountEl.innerHTML = parseInt(this.commentAmountEl.innerHTML) + 1;
                    this._joinGroupChannel(this.options.comment_channel, _val);

                    textareaEl.value = "";
                    let itemEl = createDom(this._itemCommentsTemplate(_val));
                    listCommentsEl.append(itemEl);

                    this.tpl.live_comments = "";
                    Array.prototype.slice.call(modalGroupEl).forEach(groupEl => {
                        return this.tpl.live_comments += replaceNote(groupEl.outerHTML);
                    });
                });
            });

            // 发送表情图标
            addEvent(btnNewsPhizEl, 'click', () => {
                return modal.toast(LANG.LOGIN.Third_party.Text);
            });
        });

        // 点赞
        addEvent(this.btnThumbsEl, 'click', () => {
            this._animateLike();
            if (hasClass(this.btnThumbsEl, this.options.showClass)) return false;

            this.supportAmountEl.innerHTML = parseInt(this.supportAmountEl.innerHTML) + 1;
            toggleClass(this.btnThumbsEl, this.options.showClass);
            let getJoinGroupChannel = this._joinGroupChannel(this.options.praise_channel, LANG.MESSAGE.Like.Text);
            let getPraiseVideo = praiseVideo(this.options.id, 1);

            Promise.all([getJoinGroupChannel, getPraiseVideo]).then((data) => {
                // 视频列表增加点赞数目
                if (this.praiseCountEl.length > 0) {
                    this.praiseCountEl[0].innerHTML = parseInt(this.praiseCountEl[0].innerHTML) + 1;
                }
                return;
            });
        });

        // 分享
        addEvent(this.btnShareEl, 'click', () => {
            let shareModalEl = modal.actions(this.tpl.live_share, {
                title: LANG.LIVE_PREVIEW.Actions.ShareTo,
                closeBtn: true,
                cancelBtn: true
            });
            let btnFecebookEl = shareModalEl.getElementsByClassName(this.options.btnFecebookClass);
            let btnTwitterEl = shareModalEl.getElementsByClassName(this.options.btnTwitterClass);
            let btnTumblrEl = shareModalEl.getElementsByClassName(this.options.btnTumblrClass);
            console.log(btnFecebookEl);
            console.log(btnTwitterEl);
            console.log(btnTumblrEl);
            // Facebook 分享
            if (btnFecebookEl.length > 0) {
                addEvent(btnFecebookEl[0], 'click', () => {
                    FB.Share(domainURL);
                });
            }

            // Twitter 分享
            if (btnTwitterEl.length > 0) {
                addEvent(btnTwitterEl[0], 'click', () => {
                    return modal.toast(LANG.LOGIN.Third_party.Text);
                });
            }

            // Tumblr 分享
            if (btnTumblrEl.length > 0) {
                addEvent(btnTumblrEl[0], 'click', () => {
                    return modal.toast(LANG.LOGIN.Third_party.Text);
                });
            }
        });

        // 礼物
        addEvent(this.btnGiftEl, 'click', () => {
            let giftModalEl = modal.actions(this.tpl.live_gift, {
                title: LANG.LIVE_PREVIEW.Actions.Gift,
                closeBtn: true
            });
            let giftWrapperEl = giftModalEl.querySelector(this.options.giftsWrapperClass);
            let giftContentEl = giftModalEl.getElementsByClassName(this.options.giftsContentClass)[0];
            let giftItemEl = giftModalEl.getElementsByClassName(this.options.giftsItemClass);
            addClass(giftContentEl, this.options.videoItemClass);

            let giftLabelEl = giftModalEl.getElementsByClassName(this.options.giftsLabelClass);
            let userPackageEl = giftModalEl.getElementsByClassName(this.options.userPackageClass)[0];
            let btnRechargeEl = giftModalEl.getElementsByClassName(this.options.btnRechargeClass)[0];
            let btnSendEl = giftModalEl.getElementsByClassName(this.options.btnSendClass)[0];
            let giftWidth = giftWrapperEl.offsetWidth;
            let { userPackage } = getUserInfo(this.options.dataUserPackage);

            userPackageEl.innerHTML = userPackage;

            giftContentEl.style.width = giftWidth * 2 + 'px';

            Array.prototype.slice.call(giftItemEl).forEach(itemEl => {
                return itemEl.style.width = giftWidth + 'px';
            });

            let giftWrapperScroll = new BScroll(giftWrapperEl, {
                startX: 0,
                scrollX: true,
                scrollY: false,
                momentum: false,
                tap: true,
                bounce: {
                    top: false,
                    bottom: false,
                    left: true,
                    right: true
                }
            });

            Array.prototype.slice.call(giftLabelEl).forEach(labelEl => {
                addEvent(labelEl, 'tap', () => {
                    if (hasClass(labelEl, this.options.showClass)) return;

                    let giftActiveEl = giftWrapperEl.getElementsByClassName(this.options.showClass);

                    if (giftActiveEl.length > 0) {
                        toggleClass(giftActiveEl[0], this.options.showClass);
                    }
                    addClass(labelEl, this.options.showClass);
                });
            });

            addEvent(btnSendEl, 'click', () => {
                let tagActiveEl = giftWrapperEl.getElementsByClassName(this.options.showClass)[0];
                let giftId = parseInt(getData(tagActiveEl, this.options.dataID));
                let giftUrl = getData(tagActiveEl, this.options.dataGiftUrl);
                let giftPrice = parseInt(getData(tagActiveEl, this.options.dataPrice));

                const {id, vuser_id} = this.options;

                videoGifts(vuser_id, id, giftId, 1, giftPrice).then((data) =>{
                    if (!data) return;

                    setUserInfo(this.options.dataUserPackage, data);
                    userPackageEl.innerHTML = data;
                    this._joinGroupChannel(this.options.gift_channel, LANG.MESSAGE.Gift.Text, giftUrl);
                    // this._joinGroupChannel(this.options.gift_channel, LANG.MESSAGE.Gift.Text.replace('%S', giftPrice), giftUrl);

                    modal.alert(LANG.LIVE_PREVIEW.Madal.SendSuccess.Text, (_modal) => {
                        modal.closeModal(_modal);
                    });
                });
            });

            // 充值
            addEvent(btnRechargeEl, 'click', () => {
                modal.closeModal(giftModalEl);

                let rechargeModalEl = modal.actions(this.tpl.live_recharge, {
                    title: LANG.LIVE_PREVIEW.Actions.Recharge,
                    closeBtn: true
                });
                let userPackageEl = rechargeModalEl.getElementsByClassName(this.options.userPackageClass)[0];
                let pay = new Pay(rechargeModalEl);
                let { userPackage } = getUserInfo(this.options.dataUserPackage);

                userPackageEl.innerHTML = userPackage;

                pay.on('pay.success', (price) => {
                    setUserInfo(this.options.dataUserPackage, userPackage + data);
                    userPackageEl.innerHTML = _package + data;
                    modal.closeModal(rechargeModalEl);
                });
            });
        });

    }

    // 点赞动画效果
    _animateLike() {
        const floatIcon = createDivEl({element: 'i', className: ['icon', 'live-thumbs-float', 'lives-float']});
        this.btnThumbsEl.appendChild(floatIcon);

        setTimeout(() => {
            this.btnThumbsEl.removeChild(floatIcon);
        }, 3000);
    }

    /**
     * 加入频道并发送消息
     * @param  {[type]} channelURL 频道URL
     * @param  {[type]} message    消息
     * @return {[type]}            [description]
     */
    _joinGroupChannel(channelURL, message, giftUrl) {
        const {img_url, id} = this.options;
        return new Promise((resolve) => {
            this.SendBird.getChannel(channelURL, false).then((groupChannel) => {
                console.log(groupChannel);

                groupChannel.join(() => {

                    this.SendBird.sendChannelMessage({
                        channel: groupChannel,
                        message: message,
                        data: {
                            videoId: this.options.id,
                            videoImg: this.options.img_url,
                            giftUrl: giftUrl
                        },
                        handler: (message, error) => {
                            if (error) return resolve(false);

                            groupChannel.leave(() => {
                                resolve(true);
                            });
                        }
                    });
                });
            });
        });
    }

    _videoPreviewTemplate(options) {
        let html = '';

        html = '<div class="popup remove-on-close lives-wrapper"><div class="lives-video">';
        html += '<video id="video" class="'+ options.videoClass +'" autoplay="autoplay" preload="auto" webkit-playsinline playsinline="true" x-webkit-airplay="allow" x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-orientation="portrait" poster="'+ options.img_url +'"><source src="'+ options.video_url +'" type="video/mp4"></video>';
        html += '</div><div class="lives-header"><div class="lives-attention"><div class="user-info across"><div class="user-img avatar-female">';
        html += options.user_head ? '<img src="'+ options.user_head +'">' : '';
        html += '</div><div class="across-body"><p class="user-name">'+ options.user_name +'</p><p class="user-txt">'+ options.watch_number + ' ' + LANG.PUBLIC.Heat +'</p></div>';
        html += '</div><i class="icon '+ options.btnAddAttentionClass + ' ' + (options.followStatus == 1 ? options.iconAddAttentionClass : options.iconAttentionClass) +'" data-id="'+ options.vuser_id +'"></i></div><div class="icon live-close '+ options.btnLiveCloseClass +'"></div></div>';
        html += '<div class="video-preview-content"><p class="preview-text">'+ options.video_description +'</p></div>';
        html += '<div class="video-preview-footer"><div class="lives-buttons">';
        html += '<div class="video-preview-item '+ options.btnNewsClass +'"><i class="icon live-news"></i><span class="'+ options.commentAmountClass +'">'+ options.countComment +'</span></div>';
        html += '<div class="video-preview-item '+ options.btnThumbsClass +'"><i class="icon live-thumbs-upion"></i><span class="'+ options.supportAmountClass +'">'+ options.support +'</span></div>';
        html += '<div class="video-preview-item '+ options.btnShareClass +'"><i class="icon live-share"></i></div></div>';
        html += '<div class="'+ options.btnGiftClass +'"><i class="icon live-gift"></i></div>';
        html += '</div></div>';

        return html;
    }

    _itemCommentsTemplate(value) {
        let html = '';

        html = '<li class="list-item">';
        html += '<span class="list-item-graphic image" style="'+ (this.localInfo.userHead ? 'background-image: url('+ this.localInfo.userHead +');' : '') +'"></span>';
        html += '<span class="list-item-text">'+ this.localInfo.userName +'<span class="list-item-secondary">'+ value +'</span></span>';
        html += '</li>';

        return html;
    }
}

/**
 * videoPreview.start
 * 当页面加载完成的时候，会派发videoPreview.start事件。
 */