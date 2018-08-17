import AgoraSig from './components/AgoraSig-1.3.3';
import EventEmitter from './components/EventEmitter';

import {
    isNumber
} from './util';

const LoginMode = '2';

export default class SignalingClient {
	constructor(appId) {
		this._appId = appId;
		this.signal = Signal(appId);
		this.sessionEmitter = new EventEmitter();
		this.channelEmitter = new EventEmitter();
		this.callEmitter = new EventEmitter();
	}

	/**
	 * 登录agora信令服务器
	 * @param  {[type]} account 用户登录厂商 app 的账号
	 * @param  {String} token   [description]
	 * @return {[type]}         [description]
	 */
	login(account, token = '_no_need_token') {
		this._account = isNumber(account) ? account + LoginMode : account;
		return new Promise((resolve, reject) => {
			this.session = this.signal.login(this._account, token);

			[
				'onLoginSuccess',			// 登录成功回调
				'onError',					// 出错回调
				'onLoginFailed',			// 登录失败回调
				'onLogout',					// 退出登录回调
				'onMessageInstantReceive',	// 接收方收到消息时接收方收到的回调
				'onInviteReceived'			// 收到呼叫邀请回调
			].map(event => {
			    return this.session[event] = (...args) => {
			        this.sessionEmitter.emit(event, ...args);
			    }
			});

			// Promise.then
			this.sessionEmitter.on('onLoginSuccess', (uid) => {
				this._uid = uid;
				resolve(uid);
			});
			// Promise.catch
			this.sessionEmitter.on('onLoginFailed', (...args) => {
				reject(...args);
			});
		});
	}

	/**
	 * 退出agora信令服务器
	 * @return {[type]} [description]
	 */
	logout() {
		return new Promise((resolve, reject) => {
			this.session.logout();
			this.sessionEmitter.on('onLogout', (...args) => {
				resolve(...args);
			})
		})
	}

	/**
	 * 加入频道
	 * @param  {[type]} channel 频道名
	 * @return {[type]}         [description]
	 */
	join(channel) {
		this._channel = channel;
		return new Promise((resolve, reject) => {
			if (!this.session) {
				throw {
					Message: '"session" must be initialized before joining channel'
				}
			}
			this.channel = this.session.channelJoin(channel);

			[
				'onChannelJoined',			// 加入频道回调
				'onChannelJoinFailed',		// 加入频道失败回调
				'onChannelLeaved',			// 离开频道回调
				'onChannelUserJoined',		// 其他用户加入频道回调
				'onChannelUserLeaved',		// 其他用户离开频道回调
				'onChannelUserList',		// 获取频道内用户列表回调
				'onChannelAttrUpdated',		// 频道属性发生变化回调
				'onMessageChannelReceive'	// 收到频道消息回调
			].map(event => {
			    return this.channel[event] = (...args) => {
			        this.channelEmitter.emit(event, ...args);
			    }
			});
			// Promise.then
			this.channelEmitter.on('onChannelJoined', (...args) => {
				resolve(...args);
			})
			// Promise.catch
			this.channelEmitter.on('onChannelJoinFailed', (...args) => {
				reject(...args);
			})
		})
	}

	/**
	 * 退出频道
	 * @return {[type]} [description]
	 */
	leave() {
	    return new Promise((resolve, reject) => {
	        if (this.channel) {
	            this.channel.channelLeave();
	            this.channelEmitter.on('onChannelLeaved', (...args) => {
	                resolve(...args);
	            })
	        } else {
	            resolve();
	        }
	    })
	}

	/**
	 * 邀请用户加入指定频道
	 * @param  {[type]} channelID 	频道名
	 * @param  {[type]} peer 		对方的账号
	 * @param  {[type]} extra     	呼叫的其他信息
	 * @return {[type]}             [description]
	 */
	invite(channelID, peer, extra) {
		console.log(channelID, peer, extra);
		return new Promise((resolve, reject) => {
			if (!this.session) {
				throw {
					Message: '"session" must be initialized before joining channel'
				}
			}

			this.call = this.session.channelInviteUser2(channelID, peer, extra);

			[
				'onInviteReceivedByPeer',	// 远端已收到呼叫回调
				'onInviteAcceptedByPeer',	// 远端已接受呼叫回调
				'onInviteRefusedByPeer',	// 对方已拒绝呼叫回调
				'onInviteFailed',			// 呼叫失败回调
				'onInviteEndByPeer',		// 对方已结束呼叫回调
				'onInviteEndByMyself',		// 本地已结束呼叫回调
				'onInviteMsg'				// 本地已收到消息回调
			].map(event => {
				return this.call[event] = (...args) => {
					this.callEmitter.trigger(event, ...args);
				}
			});
			// Promise.then
			this.callEmitter.on('onInviteAcceptedByPeer', (...args) => {
				resolve(...args);
			})
			// Promise.catch
			this.callEmitter.on('onInviteFailed', (...args) => {
				reject(...args);
			})
		})
	}

	/**
	 * 接受呼叫邀请
	 * @return {[type]} [description]
	 */
	inviteAccept(extra) {
		this.session && this.session.channelInviteAccept(extra);
	}

	/**
	 * 拒绝呼叫邀请
	 * @return {[type]} [description]
	 */
	inviteRefuse(extra) {
		this.session && this.session.channelInviteRefuse(extra);
	}

	/**
	 * 结束主叫
	 * @return {[type]} [description]
	 */
	inviteEnd() {
		this.session && this.session.channelinviteEnd();
	}

	/**
	 * 发送P2P消息
	 * 如果要发送对象,使用JSON.stringify
	 * @param  {[type]} peerAccount 对方的账号
	 * @param  {[type]} text        消息正文。每条消息最大为 8196 字节可见字符
	 * @return {[type]}             [description]
	 */
	sendMessage(peerAccount, text) {
	    this.session && this.session.messageInstantSend(peerAccount, text);
	}

	/**
	 * 客户端群发P2P消息
	 * 如果要发送对象,使用JSON.stringify
	 * @param  {[type]} peerAccount 对方的账号
	 * @param  {[type]} text        消息正文。每条消息最大为 8196 字节可见字符
	 * @return {[type]}             [description]
	 */
	sendMessageAll(peerAccount, text) {
		for (let i = 1; i < 4; i++) {
			peerAccount = peerAccount.toString();
			console.log(peerAccount);
			this.session && this.session.messageInstantSend(peerAccount + i, text);
		}
	}

	/**
	 * 发送广播消息
	 * 如果要发送对象,使用JSON.stringify
	 * @param  {[type]} text 频道消息正文
	 * @return {[type]}      [description]
	 */
	broadcastMessage(text) {
	    this.channel && this.channel.messageChannelSend(text);
	}
}