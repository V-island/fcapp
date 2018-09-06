import BScroll from 'better-scroll';
import { Spinner } from './Spinner';
import Modal from '../modal';

import {
    sendBirdConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    playVideo
} from '../api';

import {
    addEvent,
    createDivEl,
    protectFromXSS,
    timestampFromNow,
    toggleClass,
    addClass,
    removeClass,
    getData,
    setData,
    appendToFirst,
    isScrollBottom
} from '../util';
import customerImg from '../../img/messages/icon-service@2x.png';

const LANG = getLangConfig();
const modal = new Modal();
const MESSAGE_REQ_ID = 'reqId';

class MessageItemSystem {
    constructor(element, channel) {
        this.element = element;
        this.channel = channel;

        this.messageContent = createDivEl({className: 'message-chat-box'});
        this.element.appendChild(this.messageContent);
    }

    scrollToBottom() {
        this.element.scrollTop = this.element.scrollHeight - this.element.offsetHeight;
    }

    _defaultItemElement() {
        const isOpenChannel = this.channel.channelType == 'open' ? true : false;
        const messageItem = createDivEl({className: ['message-chat-item', 'item-system']});
        const itemAvatar = createDivEl({className: 'item-avatar', background: this.channel.coverUrl});
        messageItem.appendChild(itemAvatar);

        const itemMessageContent = createDivEl({className: 'item-message-content'});
        const itemTitle = createDivEl({className: 'user-title', content: this.channel.name});
        const itemText = createDivEl({className: 'message-text', content: isOpenChannel ? LANG.MESSAGE.System_Default : LANG.MESSAGE.Customer_Default});


        const itemTime = createDivEl({className: 'message-time', content: timestampFromNow(this.channel.createdAt)});
        itemMessageContent.appendChild(itemTitle);
        itemMessageContent.appendChild(itemText);
        itemMessageContent.appendChild(itemTime);
        messageItem.appendChild(itemMessageContent);

        return this.messageContent.appendChild(messageItem);
    }

    _messageItemElement(message) {
        const isOpenChannel = message.channelType != 'group' ? false : true;
        const {videoId, videoImg, giftUrl} = isOpenChannel ? JSON.parse(message.data) : {};
        const messageItem = createDivEl({id: message.messageId, className: ['message-chat-item', 'item-system']});
        const itemAvatar = createDivEl({className: 'item-avatar', background: message._sender.profileUrl});
        messageItem.appendChild(itemAvatar);

        const itemMessageContent = createDivEl({className: 'item-message-content'});
        const itemTitle = createDivEl({className: 'user-title', content: message._sender.nickname});
        const itemText = createDivEl({className: 'message-text', content: message.message});

        if (isOpenChannel && giftUrl) {
            const itemTextIcon = createDivEl({element: 'i', className: 'icon', background: giftUrl});
            itemText.appendChild(itemTextIcon);
        }

        const itemTime = createDivEl({className: 'message-time', content: timestampFromNow(message.createdAt)});
        itemMessageContent.appendChild(itemTitle);
        itemMessageContent.appendChild(itemText);
        itemMessageContent.appendChild(itemTime);
        messageItem.appendChild(itemMessageContent);

        if (isOpenChannel) {
            const itemMessageThumb = createDivEl({className: 'item-message-thumb', background: videoImg});
            const iconPlay = createDivEl({element: 'i', className: ['icon', 'message-Play']});
            setData(itemMessageThumb, 'id', videoId);
            itemMessageThumb.appendChild(iconPlay);
            messageItem.appendChild(itemMessageThumb);
        }else {
            const btnDetails = createDivEl({className: ['button', 'fill-success', 'btn-details'], content: LANG.MESSAGE.Details});
            messageItem.appendChild(btnDetails);
        }

        if (isOpenChannel) {
            addEvent(itemMessageThumb, 'click', () => {
                Spinner.start(body);
                playVideo(videoId).then((data) => {
                    if (!data) return Spinner.remove();

                    let {video_url} = data;
                    modal.videoModal(video_url);
                    Spinner.remove();
                });
            });
        }

        return messageItem;
    }

    renderMessages(messageList, goToBottom = true, isPastMessage = false) {
        if (messageList.length == 0) return this._defaultItemElement();

        messageList.forEach(message => {
            const messageItem = this._messageItemElement(message);
            this.messageContent.appendChild(messageItem);
        });
        if (goToBottom) this.scrollToBottom();
    }

    removeMessage(messageId, isRequestId = false) {
        const removeElement = this._getItem(messageId, isRequestId);
        if (removeElement) {
            this.messageContent.removeChild(removeElement);
        }
    }
}

class MessageItemModal {
    constructor(element, channel, localUserID) {
        this.element = element;
        this.channel = channel;
        this.localUserID = localUserID;

        this.messageContent = createDivEl({className: 'message-chat-box'});
        this.element.appendChild(this.messageContent);
    }

    scrollToBottom() {
        this.element.scrollTop = this.element.scrollHeight - this.element.offsetHeight;
    }

    _defaultItemElement() {
        const messageItem = createDivEl({className: 'message-chat-item'});
        const itemAvatar = createDivEl({className: 'item-avatar', background: customerImg});
        const itemMessage = createDivEl({className: 'item-message-box', content: LANG.MESSAGE.Customer_Default});

        messageItem.appendChild(itemAvatar);
        messageItem.appendChild(itemMessage);

        return this.messageContent.appendChild(messageItem);
    }

    _messageItemElement(message) {
        const messageItem = createDivEl({id: message.messageId, className: 'message-chat-item'});
        const itemAvatar = createDivEl({className: 'item-avatar', background: message._sender.profileUrl});
        const itemMessage = createDivEl({className: 'item-message-box', content: message.message});

        messageItem.appendChild(itemAvatar);
        messageItem.appendChild(itemMessage);
        setData(messageItem, MESSAGE_REQ_ID, message.reqId);

        if(message.reqId != "" || this.localUserID == parseInt(message._sender.userId)) {
            addClass(messageItem, 'local-message');
        }

        return messageItem;
    }

    _getItem(messageId, isRequestId = false) {
        const items = this.messageContent.childNodes;
        for (let i = 0; i < items.length; i++) {
            const elementId = isRequestId ? getData(items[i], MESSAGE_REQ_ID) : items[i].id;
            if (elementId === messageId.toString()) {
                return items[i];
            }
        }
        return null;
    }

    renderMessages(messageList, goToBottom = true, isPastMessage = false) {
        if (messageList.length == 0 && this.channel.customType == sendBirdConfig.customerType) return this._defaultItemElement();

        messageList.forEach(message => {
            const messageItem = this._messageItemElement(message);
            const requestId = getData(messageItem, MESSAGE_REQ_ID)
              ? getData(messageItem, MESSAGE_REQ_ID)
              : '-1';
            const requestItem = this._getItem(requestId, true);
            const existItem = this._getItem(messageItem.id, false);

            if (requestItem || existItem) {
                this.messageContent.replaceChild(messageItem, requestItem ? requestItem : existItem);
            } else {
                if (isPastMessage) {
                    appendToFirst(this.messageContent, messageItem);
                    this.element.scrollTop = this.element.scrollHeight - this.scrollHeight;
                } else {
                    const isBottom = isScrollBottom(this.element);
                    this.messageContent.appendChild(messageItem);
                    if (isBottom) {
                        this.scrollToBottom();
                    }
                }
            }
        });
        if (goToBottom) this.scrollToBottom();
    }

    removeMessage(messageId, isRequestId = false) {
        const removeElement = this._getItem(messageId, isRequestId);
        if (removeElement) {
            this.messageContent.removeChild(removeElement);
        }
    }

    updateReadReceipt() {
        this.readReceiptManageList.forEach(message => {
            if (message.messageId.toString() !== '0') {
                const className = Message.getReadReceiptElementClassName();
                const messageItem = this._getItem(message.messageId, false);
                if (messageItem) {
                    let readItem = null;
                    try {
                        readItem = messageItem.getElementsByClassName(className)[0];
                    } catch (e) {
                        readItem = null;
                    }
                    const latestCount = SendBirdAction.getInstance().getReadReceipt(this.channel, message);
                    if (readItem && latestCount.toString() !== readItem.textContent.toString()) {
                        readItem.innerHTML = latestCount;
                        if (latestCount.toString() === '0') {
                            removeClass(readItem, className);
                        }
                    }
                }
            }
        });
    }

    updateTyping(memberList) {
        // this.input.updateTyping(memberList);
    }

    repositionScroll(imageOffsetHeight) {
      this.element.scrollTop += imageOffsetHeight;
    }

    updateBlockedList(user, isBlock) {
        if (this.list) {
            if (isBlock) {
                const blockedItem = new ChatUserItem({
                    user,
                    hasEvent: true
                });
                appendToFirst(this.list, blockedItem.element);
            } else {
                const items = this.list.childNodes;
                for (let i = 0; i < items.length; i++) {
                    if (items[0].id === user.userId) {
                        this.list.removeChild(items[0]);
                        break;
                    }
                }
            }
        }
    }
}

export { MessageItemSystem, MessageItemModal };