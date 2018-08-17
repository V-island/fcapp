import Template from 'art-template/lib/template-web';
import EventEmitter from './eventEmitter';
import RtcClient from './rtcClient'
import Modal from './modal';
import {
    fcConfig,
    agoraConfig
} from './intro';
import {
    liveStatus,
    getUserInfo,
    setUserInfo,
    createChannel,
    loginChannel,
    closeChannel,
    userEvaluate,
    reward,
    roomProfit,
    liveAgain,
    findAllgifts
} from './api';

import {
    getLangConfig
} from './lang';

import {
    extend,
    addEvent,
    createDom,
    getData,
    setData,
    hasClass,
    addClass,
    removeClass,
    importTemplate
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

export default class Client extends EventEmitter {
    constructor(sclient, localInfo, livePrice) {
        super();

        this.data = {};
        this.signal = sclient;
        this.localInfo = localInfo; // 本地用户信息
        this.localAccount = localInfo.userId;
        this.livePrice = livePrice;

        extend(this.data, LANG);

        this.clientCallFile = fcConfig.publicFile.client_call;
        this._init();
    }

    _init() {
        this.tpl = {};

        importTemplate(this.clientCallFile, (id, _template) => {
            this.tpl[id] = _template;
        });

        this._subscribeEvents();
    }

    _subscribeEvents() {
        let Signal = this.signal;

        // 接收到点对点消息
        Signal.sessionEmitter.on('onMessageInstantReceive', (account, uid, msg) => {
        	let _info = JSON.parse(msg);

        	if (_info.status == 'invite') {
        		this._onReceiveCall(account, _info);
        	}
            if (_info.status == 'refuse') {
        		this._onRefuseCall(account);
        	}
            if (_info.status == 'cahts') {
                this._onCahtsCall(_info.message, false);
            }
            if (_info.status == 'gifts') {
                console.log('收到礼物系统消息ID'+ _info.gift_id);
                this._onGiftsCall(_info.gift_id);
            }
            if (_info.status == 'settlement') {
                console.log('用户退出')
            }
        });

        // 收到呼叫邀请回调
        Signal.sessionEmitter.on('onInviteReceived', (call) => {
        	let account = call.peer;
        	let channelID = call.channelName;
        	let _info = JSON.parse(call.extra);

            this._onJoinChannel(account, {
                channelKey: _info.channelKey,
                channel: channelID,
                userId: this.localAccount,
                info: this.info
            });

            modal.closeModal(this.callerModalEl);
        });
    }

    /**
     * 接收到呼叫
     * @param  {[type]} account 呼叫账号
     * @param  {[type]} msg     呼叫消息
     * @return {[type]}         [description]
     */
    _onReceiveCall(account, msg) {
    	this.calledModalEl = modal.popup(this._calledCallerTemplate(msg, false));
    	let btnRefuseEl = this.calledModalEl.getElementsByClassName('btn-refuse')[0];
    	let btnAcceptEl = this.calledModalEl.getElementsByClassName('btn-accept')[0];

    	// 接受邀请
    	addEvent(btnAcceptEl, 'click', () => {

    	    let getChannelInfo = createChannel();
    	    getChannelInfo.then((data) => {

    	    	// 邀请加入直播频道
    	    	this.signal.invite(data.channel, account, JSON.stringify({
	    	    	channelKey: data.channelKey
	    	    }));

    	    	this._createChannel(account, {
    	    		channelKey: data.channelKey,
		    		channel: data.channel,
		    		userId: data.userId,
		    		type: false,
		    		info: msg
    	    	});

    	    	modal.closeModal(this.calledModalEl);
    	    });
    	});

    	// 拒绝邀请
    	addEvent(btnRefuseEl, 'click', () => {
    	    modal.closeModal(this.calledModalEl);
    	    this.signal.sendMessage(account, JSON.stringify({
    	    	status: 'refuse'
    	    }));
    	});
    }

    /**
     * 主播拒绝呼叫
     * @param  {[type]} account 呼叫账号
     * @return {[type]}         [description]
     */
    _onRefuseCall(account) {
    	this.data.LiveInfo = this.info;

    	let refuseEl = createDom(Template.render(this.tpl.refuse_call, this.data));
    	let contentBlockEl = this.callerModalEl.querySelector('.content-block');
    	contentBlockEl.innerHTML = '';
        contentBlockEl.append(refuseEl);

    	let btnCallAgainEl = this.callerModalEl.getElementsByClassName('btn-call-again')[0];
    	let btnMaybeEl = this.callerModalEl.getElementsByClassName('btn-maybe')[0];

    	addEvent(btnCallAgainEl, 'click', () => {
    		let callerEl = createDom(Template.render(this.tpl.client_caller, this.data));
    		contentBlockEl.innerHTML = callerEl;

	        this.invite();
	    });

	    addEvent(btnMaybeEl, 'click', () => {
	        modal.closeModal(this.callerModalEl);
	    });
    }

    /**
     * 呼叫主播
     * @param  {[type]} info      主播用户信息
     * @return {[type]}           [description]
     */
    invite(info) {
    	if (typeof info !== 'undefined') {
    		this.info = info;
    		this.callerModalEl = modal.popup(this._calledCallerTemplate(info, true));
    	}

	    let btnCancelEl = this.callerModalEl.getElementsByClassName('btn-cancel')[0];

	    this.signal.sendMessageAll(info.userAccount, JSON.stringify({
	    	userAccount: this.localInfo.userId,
	    	userName: this.localInfo.userName,
	    	userHead: this.localInfo.userHead,
	    	userSex: this.localInfo.userSex,
	    	status: 'invite'
	    }));

	    addEvent(btnCancelEl, 'click', () => {
	        modal.closeModal(this.callerModalEl);
	    });
    }

    _calledCallerTemplate(info, type) {
    	let html = '';
    	let caller = '<div class="buttons buttons-block"><div class="button button-danger btn-cancel" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Cancel +'</div></div>';
    	let called = '<div class="buttons"><div class="button button-danger btn-refuse" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Refuse +'</div><div class="button button-success btn-accept" data-ripple>'+ LANG.LIVE_PREVIEW.Called_Caller.Buttons_Accept +'</div></div>';

    	html = '<div class="popup remove-on-close popup-call"><div class="content-block"><div class="popup-box"><div class="popup-header"><div class="user-info">';
    	html += info.userSex == 1 ? '<div class="user-img avatar-male">' : '<div class="user-img avatar-female">';
    	html += info.userHead ? '<img src="'+ info.userHead +'">' : '';
    	html += '</div><p class="user-name">'+ info.userName + (info.userSex == 1 ? '<i class="icon icon-male"></i>' : '<i class="icon icon-female"></i>') + '</p></div></div>';
    	html += '<div class="popup-content calling-box"><i class="calling-sprite"></i>'+ LANG.LIVE_PREVIEW.Called_Caller.Title +'</div>';
    	html += type ? caller : called;
    	html += '</div></div></div>';

    	return html;
    }

    /**
     * 主播创建直播间
     * @return {[type]} [description]
     */
    _createChannel(account, _info) {
    	this.retClient = new RtcClient(_info, this.livePrice);
        this.clientModalEl = this.retClient.clientModalEl;
        this.livesCommentsEl = this.retClient.livesCommentsContentEl;
        this.livesGiftsEl = this.retClient.livesGiftsEl;
        this.localType = this.retClient.options.type;
        this.anchorClientInfo = this.retClient.localInfo;
        this.userClientInfo = this.retClient.info;
        this.livesCommentsScroll = this.retClient.livesCommentsScroll;

    	// 退出直播间
    	this.retClient.on('rtcClient.leave', (channel, info, type) => {
            if (type) {
                return;
            }

            let getRoomProfit = roomProfit(channel);

            getRoomProfit.then((data) => {
                if (!data) return;

                this._anchorTemplate(data);
            });
        });

        // 发送评论消息
        this.retClient.on('rtcClient.onChatMsg', (Msg) => {
            this._onCahtsCall(Msg, true);
            this.signal.sendMessage(account, JSON.stringify({
                status: 'cahts',
                message: Msg
            }));
        });
    }

    /**
     * 用户加入直播间
     * @param  {[type]} account 主播账号
     * @param  {[type]} _info     主播用户信息
     * @return {[type]}         [description]
     */
    _onJoinChannel(account, _info) {
		this.localRetClient = new RtcClient(_info, this.livePrice);
        this.clientModalEl = this.localRetClient.clientModalEl;
        this.livesCommentsEl = this.localRetClient.livesCommentsContentEl;
        this.livesGiftsEl = this.localRetClient.livesGiftsEl;
        this.localType = this.localRetClient.options.type;
        this.anchorClientInfo = this.localRetClient.info;
        this.userClientInfo = this.localRetClient.localInfo;
        this.livesCommentsScroll = this.localRetClient.livesCommentsScroll;

    	// 加入直播间
    	this.localRetClient.on('rtcClient.join', (channel) => {
            loginChannel(_info.channel).then((data) => {
                if (!data) return;

                this.signal.join(agoraConfig.adminChannel);
            });
        });

        // 退出直播间
    	this.localRetClient.on('rtcClient.leave', (channel, info, type) => {

            this.signal.leave().then(() => {
                closeChannel(channel).then((data) => {
                    if (!data) return;

                    if (!type) {
                        this.signal.sendMessage(account, JSON.stringify({
                            status: 'settlement'
                        }));
                    }

                    this._assessTemplate(channel, info, data);
                });
            });
        });

        // 发送评论消息
        this.localRetClient.on('rtcClient.onChatMsg', (Msg) => {
            this._onCahtsCall(Msg, true);
            this.signal.sendMessage(account, JSON.stringify({
                status: 'cahts',
                message: Msg
            }));
        });

        // 发送礼物消息
        this.localRetClient.on('rtcClient.onGift', (liveID, channelID, giftId) => {
            let getReward = reward(liveID, channelID, giftId);

            getReward.then((data) => {
                if (!data) return;

                setUserInfo('userPackage', data);
                this.localRetClient._onClearCountdown();
                this.localRetClient._onCreateCountdown(parseInt(data / this.livePrice));
                this._onGiftsCall(giftId);
                this.signal.sendMessage(account, JSON.stringify({
                    status: 'gifts',
                    gift_id: giftId
                }));
            });
        });
    }

    /**
     * 接收评论消息
     * @param  {[type]} message 评论消息
     * @return {[type]}         [description]
     */
    _onCahtsCall(message, type) {
        let _type = false;

        if (this.localType) {
            // 用户
            _type = type ? true : false;
        }else {
            // 主播
            _type = type ? false : true;
        }

        let commentEl = createDom('<label class="'+ (_type ? '' : 'anchor') +'"><span>'+ (_type ? this.userClientInfo.userName : this.anchorClientInfo.userName) +'</span>:'+ message +'</label>');

        this.livesCommentsEl.append(commentEl);
        this.livesCommentsScroll.refresh();
        this.livesCommentsScroll.scrollToElement(commentEl);
    }

    /**
     * 接收礼物消息
     * @param  {[type]} giftId  礼物ID
     * @return {[type]}         [description]
     */
    _onGiftsCall(giftId) {
        // 礼物累加
        let giftsItemsEl = this.livesGiftsEl.querySelector('.gifts-items' + giftId);

        if (giftsItemsEl) {
            let giftsAmountEl = giftsItemsEl.getElementsByClassName('gift-amount')[0];
            let amountIndex = getData(giftsItemsEl, 'amount');
            amountIndex += 1;

            setData(giftsItemsEl, 'amount', amountIndex);
            return giftsItemsEl.innerHTML = 'X' + amountIndex;
        }

        // 礼物发布
        let _data = {};
        let getAllgifts = findAllgifts();

        getAllgifts.then((data) => {
            _data.GiftsId = giftId;
            _data.GiftList = data;
            _data.LiveInfo = this.userClientInfo;

            let giftsEl = createDom(Template.render(this.tpl.gifts_bullet_box, _data));

            this.livesGiftsEl.append(giftsEl);

            setTimeout(() => {
                this.livesGiftsEl.removeChild(giftsEl);
            }, 5000);
        });
    }

    /**
     * 评价
     * @param  {[type]} channel [description]
     * @return {[type]}         [description]
     */
    _assessTemplate(channel, info, time) {
    	this.data.LiveInfo = info;
        this.data.LiveEndTime = time;

    	let endLiveUserEl = modal.popup(Template.render(this.tpl.end_live_user, this.data));
	    let btnSubmitEl = endLiveUserEl.getElementsByClassName('btn-submit')[0];
	    let btnMaybeEl = endLiveUserEl.getElementsByClassName('btn-maybe')[0];
        let starsBoxEl = endLiveUserEl.getElementsByClassName('stars')[0];
        let starsItemEl = endLiveUserEl.getElementsByClassName('icon-star');
        let starsLabelEl = endLiveUserEl.getElementsByClassName('stars-label')[0];

        // 评分
        for (let i = 0; i < starsItemEl.length; i++) {
            addEvent(starsItemEl[i], 'click', () => {
                if (hasClass(starsItemEl[i], 'active')) {
                    return;
                }
                let starsActiveEl = starsBoxEl.getElementsByClassName('active')[0];
                let index = getData(starsItemEl[i], 'index');

                if (starsActiveEl) {
                    removeClass(starsActiveEl, 'active');
                }

                addClass(starsItemEl[i], 'active');
                setData(starsLabelEl, 'index', index);
                starsLabelEl.innerHTML = index + '.0';
            });
        }

        // 提交评分
	    addEvent(btnSubmitEl, 'click', () => {
            let stars = getData(starsLabelEl, 'index');
            let getUserEvaluate = userEvaluate(channel, info.userAccount, stars);

            getUserEvaluate.then(() => {
                modal.closeModal(endLiveUserEl);
            });
	    });

        // 不评价
	    addEvent(btnMaybeEl, 'click', () => {
	        modal.closeModal(endLiveUserEl);
	    });
    }

    /**
     * 直播统计
     * @param  {[type]} channel [description]
     * @return {[type]}         [description]
     */
    _anchorTemplate(data) {
        this.data.TodayLive = data;

    	this.endLiveAnchorEl = modal.popup(Template.render(this.tpl.end_live_anchor, this.data));
	    let btnYesEl = this.endLiveAnchorEl.getElementsByClassName('btn-yes')[0];
	    let btnLiveAgainEl = this.endLiveAnchorEl.getElementsByClassName('btn-live-again')[0];

	    addEvent(btnYesEl, 'click', () => {
            // 直播结束切换主播状态
            let getLiveAgain = liveAgain();

            getLiveAgain.then((data) => {
                if (!data) return;

                modal.closeModal(this.endLiveAnchorEl);
            });
	    });

	    addEvent(btnLiveAgainEl, 'click', () => {
	        modal.closeModal(this.endLiveAnchorEl);
            this.trigger('client.close');
	    });
    }
}

/**
 * client.close
 * 当加入到频道的时候，会派发 client.close 事件。
 */