import Template from 'art-template/lib/template-web';
import BScroll from 'better-scroll';
import EventEmitter from './eventEmitter';
import SendBirdAction from './SendBirdAction';
import SignalingClient from './signalingClient';
import Client from './client';
import Modal from './modal';
import Pay from './Pay';
import {
    fcConfig
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
    isNumber,
    getData,
    hasClass,
    addClass,
    toggleClass,
    removeClass
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

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
            btnNewsClass: 'btn-news',
            btnThumbsClass: 'btn-thumbs',
            btnShareClass: 'btn-share',
            btnGiftClass: 'btn-gift',
            praiseCountClass: 'praise',
            eyeCountClass: 'eye',
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
        // this.videoEl = this.previewModalEl.getElementsByClassName(this.options.videoClass)[0];
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

        // 关闭
        addEvent(this.btnLiveCloseEl, 'click', () => {
            this.SendBird.disconnect().then(() => {
                modal.closeModal(this.previewModalEl);
            });
        });

        // 加关注
        addEvent(this.btnAddAttentionEl, 'click', () => {
            let index = getData(this.btnAddAttentionEl, 'id'),
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
            let listCommentsEl = newsModalEl.getElementsByClassName('list-comments')[0];
            let textareaEl = newsModalEl.getElementsByClassName('news-input')[0];
            let btnNewsPhizEl = newsModalEl.getElementsByClassName('news-phiz')[0];
            let btnSendEl = newsModalEl.getElementsByClassName('btn-send')[0];

            addEvent(btnSendEl, 'click', () => {
                let _val = textareaEl.value;

                if (this.CommentStart) {
                    return modal.alert(LANG.LIVE_PREVIEW.Comment_Prompt.Only_Once, (_modal) => {
                            modal.closeModal(_modal);
                        });
                }

                if (_val == "") {
                    return modal.alert(LANG.LIVE_PREVIEW.Comment_Prompt.Is_Empty, (_modal) => {
                            modal.closeModal(_modal);
                        });
                }
                this.CommentStart = true;
                this.commentAmountEl.innerHTML = parseInt(this.commentAmountEl.innerHTML) + 1;
                let getJoinGroupChannel = this._joinGroupChannel(this.options.comment_channel, _val);
                let getCommentVideo = commentVideo(this.options.id, _val);

                Promise.all([getJoinGroupChannel, getCommentVideo]).then((data) => {
                    textareaEl.value = "";
                    let itemEl = createDom(this._itemCommentsTemplate(_val));
                    listCommentsEl.append(itemEl);
                });
            });
        });

        // 点赞
        addEvent(this.btnThumbsEl, 'click', () => {
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
            let shareLabelEl = shareModalEl.getElementsByClassName('share-label');

            for (let i = 0; i < shareLabelEl.length; i++) {
                console.log(shareLabelEl[i]);
            }
        });

        // 礼物
        addEvent(this.btnGiftEl, 'click', () => {
            let giftModalEl = modal.actions(this.tpl.live_gift, {
                title: LANG.LIVE_PREVIEW.Actions.Gift,
                closeBtn: true
            });
            let giftWrapperEl = giftModalEl.querySelector('.gift-wrapper');
            let giftContentEl = giftModalEl.getElementsByClassName('gift-content')[0];
            let giftItemEl = giftModalEl.getElementsByClassName('gift-item');
            addClass(giftContentEl, 'video-item');

            let giftLabelEl = giftModalEl.getElementsByClassName('gift-label');
            let userPackageEl = giftModalEl.getElementsByClassName('user-package')[0];
            let btnRechargeEl = giftModalEl.getElementsByClassName('btn-recharge')[0];
            let btnSendEl = giftModalEl.getElementsByClassName('btn-send')[0];
            let giftWidth = giftWrapperEl.offsetWidth;

            giftContentEl.style.width = giftWidth * 2 + 'px';
            for (let i = 0; i < giftItemEl.length; i++) {
                giftItemEl[i].style.width = giftWidth + 'px';
            }

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

            for (let i = 0; i < giftLabelEl.length; i++) {
                addEvent(giftLabelEl[i], 'tap', () => {
                    if (hasClass(giftLabelEl[i], 'active')) {
                        return;
                    }

                    for (let j = 0; j < giftLabelEl.length; j++) {
                        if (hasClass(giftLabelEl[j], 'active')) {
                            removeClass(giftLabelEl[j], 'active');
                        }
                    }
                    addClass(giftLabelEl[i], 'active');
                });
            }

            addEvent(btnSendEl, 'click', () => {
                let tagActiveEl = giftWrapperEl.getElementsByClassName('active')[0];
                let giftId = getData(tagActiveEl, 'id');
                let giftUrl = getData(tagActiveEl, 'giftUrl');
                // let giftPrice = getData(tagActiveEl, 'price');

                const {id, vuser_id} = this.options;

                videoGifts(vuser_id, id, parseInt(giftId), 1).then((data) =>{
                    if (!data) return;
                    modal.toast(LANG.MESSAGE.Gift.Text);
                    setUserInfo('userPackage', data);
                    userPackageEl.innerHTML = data;
                    this._joinGroupChannel(this.options.gift_channel, LANG.MESSAGE.Gift.Text, giftUrl);
                    // this._joinGroupChannel(this.options.gift_channel, LANG.MESSAGE.Gift.Text.replace('%S', giftPrice), giftUrl);
                });
            });

            // 充值
            addEvent(btnRechargeEl, 'click', () => {
                let rechargeModalEl = modal.actions(this.tpl.live_recharge, {
                    title: LANG.LIVE_PREVIEW.Actions.Recharge,
                    closeBtn: true
                });

                let pay = new Pay(rechargeModalEl);

                pay.on('pay.success', () => {
                    modal.closeModal(rechargeModalEl);
                });
            });
        });

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
        html += '<video id="video" class="'+ options.videoClass +'" controls autoplay="autoplay" preload="auto" poster="'+ options.img_url +'"><source src="'+ options.video_url +'" type="video/mp4"></video>';
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