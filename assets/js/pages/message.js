import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { MessageItem } from '../components/MessageItem';
import { MessageChat } from '../components/MessageChat';
import EventEmitter from '../eventEmitter';

import SendBirdAction from '../SendBirdAction';
import SendBirdConnection from '../SendBirdConnection';
import SendBirdEvent from '../SendBirdEvent';
import {
	getLangConfig
} from '../lang';
import {
    getUserInfo
} from '../api';
import {
    body,
    sendBirdConfig
} from '../intro';
import {
	extend,
	addEvent,
	createDom,
	setData,
    getData,
	appendToFirst,
	isScrollBottom,
	timestampFromNow,
	createDivEl,
	errorAlert
} from '../util';

const LANG = getLangConfig();
const UPDATE_INTERVAL_TIME = 5 * 1000;
const KEY_MESSAGE_LAST_TIME = 'origin';

export default class Message extends EventEmitter {
	constructor(element) {
		super();

		this.options = {
			contentClass: '.content',
			listMessageClass: 'list-message',
			listItemClass: 'list-item'
		};

		this.init(element);
	}

	init(element) {
		const SendBird = new SendBirdAction();
		const {userId} = getUserInfo();

		this.MessageEl = createDom(Template.render(element, LANG));
		this.contentEl = this.MessageEl.querySelector(this.options.contentClass);

		setTimeout(() => {
			this.trigger('pageLoadStart', this.MessageEl);
		}, 0);

		// SendBird SDK 初始化
		Spinner.start(this.contentEl);
		SendBird.connect(userId).then(user => {
			this.createConnectionHandler();
			this.createChannelEvent();
			this.updateGroupChannelTime();
			this.getOpenChannelList(true);
			this.getGroupChannelList(true);
			this._init();
			Spinner.remove();
		}).catch(() => {
			errorAlert('SendBird connection failed.');
		});
	}

	_init() {
		this.listMessageEl = this.MessageEl.getElementsByClassName(this.options.listMessageClass)[0];

		this._bindEvent();
		this.createCustomerChannel();
	}

	_bindEvent() {
		addEvent(this.contentEl, 'scroll', () => {
			if (isScrollBottom(this.contentEl)) {
				this.getGroupChannelList();
			}
		});
	}

	// 链接客服频道号
	createCustomerChannel() {
		const customerIds = 'CS_01';
		SendBirdAction.getInstance()
			.createChannelWithUserIds(customerIds, sendBirdConfig.customerName, sendBirdConfig.customerType)
			.then(channel => {
				const _item = this.getItem(channel.url);
				if (_item) return false;

				const handler = () => {
					MessageChat.getInstance().render(channel.url, false);
				};
				const Delete = (itemBox) => {
					this.listMessageEl.removeChild(itemBox);
				};
				const item = new MessageItem({
					channel,
					handler,
					Delete
				});
				this.listMessageEl.appendChild(item.element);
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 获取开放频道列表
	getOpenChannelList(isInit = false) {
		SendBirdAction.getInstance()
			.getOpenChannelList(isInit)
			.then(openChannelList => {
				openChannelList.forEach(channel => {
					const handler = () => {
						MessageChat.getInstance().render(channel.url);
					};
					const item = new MessageItem({
						channel,
						handler
					});
					this.listMessageEl.appendChild(item.element);
					// appendToFirst(this.listMessageEl, item.element);
				});
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 获取我的频道列表
	getGroupChannelList(isInit = false) {
		SendBirdAction.getInstance()
			.getGroupChannelList(isInit)
			.then(groupChannelList => {
				groupChannelList.forEach(channel => {
					const _item = this.getItem(channel.url);
					if (_item) return false;

					const handler = () => {
						MessageChat.getInstance().render(channel.url, false);
					};
					const Delete = (itemBox) => {
						this.listMessageEl.removeChild(itemBox);
					};
					const item = new MessageItem({
						channel,
						handler,
						Delete
					});

					if (channel.unreadMessageCount > 0) {
						appendToFirst(this.listMessageEl, item.element);
					}else {
						this.listMessageEl.appendChild(item.element);
					}
				});
			})
			.catch(error => {
				errorAlert(error.message);
			});
	}

	// 更新聊天列表时间
	updateLastMessageTime() {
		const items = this.listMessageEl.getElementsByClassName('list-item-meta-txt');
		if (items && items.length > 0) {
			Array.prototype.slice.call(items).forEach(targetItemEl => {
				const originTs = parseInt(getData(targetItemEl, KEY_MESSAGE_LAST_TIME));
				if (originTs) {
					targetItemEl.innerHTML = timestampFromNow(originTs);
				}
			});
		}
	}

	// 清除当前聊天栏
	removeGroupChannelItem(elementId) {
		const removeEl = this.getItem(elementId);
		if (removeEl) {
			this.listMessageEl.removeChild(removeEl);
		}
	}

	// 清空
	clear() {
		const removeItems = this.listMessageEl.getElementsByClassName('list-item-box');
		for (let i = 0; i < removeItems.length; i++) {
		  removeItems[i].parentNode.removeChild(removeItems[i]);
		}
	}

	getItem(elementId) {
		const groupChannelItems = this.listMessageEl.getElementsByClassName('list-item-box');
		for (let i = 0; i < groupChannelItems.length; i++) {
			if (groupChannelItems[i].id === elementId) {
				return groupChannelItems[i];
			}
		}

		return null;
	}

	// 更新列表
	updateItem(channel, isFirst = false) {
		const item = this.getItem(channel.url);
		const handler = () => {
			MessageChat.getInstance().render(channel.url, false);
		};
		const Delete = (itemBox) => {
			this.listMessageEl.removeChild(itemBox);
		};
		const newItem = new MessageItem({
			channel,
			handler,
			Delete
		});

		const parentNode = this.listMessageEl;
		if (isFirst) {
			if (item) {
				parentNode.removeChild(item);
			}
			appendToFirst(parentNode, newItem.element);
		} else {
			parentNode.replaceChild(newItem.element, item);
		}
	}

	// 注册ConnectionHandler以检测用户自身连接状态的变化
	createConnectionHandler() {
		const connectionManager = new SendBirdConnection();

		connectionManager.onReconnectStarted = () => {
			console.log('[SendBird JS SDK] Reconnect : Started');
		};

		connectionManager.onReconnectSucceeded = () => {
			console.log('[SendBird JS SDK] Reconnect : Succeeded');
			this.clear();
			this.getOpenChannelList(true);
			this.getGroupChannelList(true);
		};

		connectionManager.onReconnectFailed = () => {
			console.log('[SendBird JS SDK] Reconnect : Failed');
			connectionManager.remove();
			redirectToIndex('SendBird Reconnect Failed...');
		};
	}

	// 注册ChannelHandler以在通道内发生事件时接收信息。
	createChannelEvent() {
		const channelEvent = new SendBirdEvent();
		channelEvent.onChannelChanged = channel => {
			this.updateItem(channel, true);
		};

		channelEvent.onUserEntered = (openChannel, user) => {
			if (SendBirdAction.getInstance().isCurrentUser(user)) {
				const handler = () => {
					MessageChat.getInstance().render(openChannel.url, false);
				};
				const item = new MessageItem({
					channel: openChannel,
					handler
				});

				this.listMessageEl.appendChild(item.element);
			}
		};

		channelEvent.onUserJoined = (groupChannel, user) => {
			const _item = this.getItem(groupChannel.url);
			if (_item) return false;

			const handler = () => {
				MessageChat.getInstance().render(groupChannel.url, false);
			};
			const Delete = (itemBox) => {
				this.listMessageEl.removeChild(itemBox);
			};
			const item = new MessageItem({
				channel: groupChannel,
				handler,
				Delete
			});

			if (groupChannel.unreadMessageCount > 0) {
				appendToFirst(this.listMessageEl, item.element);
			}else {
				this.listMessageEl.appendChild(item.element);
			}
		};

		channelEvent.onUserLeft = (groupChannel, user) => {
			if (SendBirdAction.getInstance().isCurrentUser(user)) {
				this.removeGroupChannelItem(groupChannel.url);
			} else {
				this.updateItem(groupChannel);
			}
		};

		channelEvent.onChannelHidden = groupChannel => {
			this.removeGroupChannelItem(groupChannel.url);
		};
	};

	// 更新组频道时间
	updateGroupChannelTime() {
		setInterval(() => {
			this.updateLastMessageTime();
		}, UPDATE_INTERVAL_TIME);
	}

	static attachTo(element) {
		return new Message(element);
	}
}