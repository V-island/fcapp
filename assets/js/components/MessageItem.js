import {
    body
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    addEvent,
    createDivEl,
    protectFromXSS,
    timestampFromNow,
    setData,
    getData,
    toggleClass,
    addClass,
    removeClass
} from '../util';

const LANG = getLangConfig();
const KEY_MESSAGE_LAST_TIME = 'origin';

class MessageItem {
    constructor({channel, handler, Delete}) {
        this.channel = channel;
        this.element = this._createElement(handler, Delete);
    }

    get channelUrl() {
        return this.channel.url;
    }

    get customType() {
        return this.channel.isPublic ? `message-${this.channel.customType.toLowerCase()}` : false;
    }

    get profileUrl() {
        return this.channel.isOpenChannel() || this.channel.isPublic ? `${this.channel.coverUrl}` : protectFromXSS(this.channel.members[0].profileUrl);
    }

    get title() {
        return this.channel.isOpenChannel() || this.channel.isPublic ? `${this.channel.name}` : protectFromXSS(this.channel.members[0].nickname);
    }

    get lastMessagetime() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return 0;
        } else {
            return this.channel.lastMessage.createdAt;
        }
    }

    get lastMessageTimeText() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return 0;
        } else {
            return timestampFromNow(this.channel.lastMessage.createdAt);
        }
    }

    get lastMessageText() {
        if (this.channel.isOpenChannel() || !this.channel.lastMessage) {
            return '';
        } else {
            return this.channel.lastMessage.isFileMessage() ?
                protectFromXSS(this.channel.lastMessage.name) :
                protectFromXSS(this.channel.lastMessage.message);
        }
    }

    get unreadMessageCount() {
      const count = this.channel.unreadMessageCount > 99 ? '+99' : this.channel.unreadMessageCount;
      return this.channel.isOpenChannel() ? 0 : count;
    }

    _createElement(handler, Delete) {
        const itemBox = createDivEl({className: 'list-item-box', id: this.channelUrl});
        const item = createDivEl({className: 'list-item'});
        let startX;

        if (this.customType) {
            const itemGraphic = createDivEl({element: 'span', className: ['icon', 'list-item-graphic', this.customType]});
            item.appendChild(itemGraphic);
        }else {
            const itemGraphic = createDivEl({element: 'span', className: ['icon', 'list-item-graphic', 'image'], background: this.profileUrl});
            item.appendChild(itemGraphic);
        }

        const itemText = createDivEl({element: 'span', className: 'list-item-text', content: this.title});
        const itemSecondary = createDivEl({element: 'span', className: 'list-item-secondary', content: this.lastMessageText});
        itemText.appendChild(itemSecondary);
        item.appendChild(itemText);

        const lastMessageText = createDivEl({element: 'span', className: 'list-item-meta-txt', content: this.lastMessageTimeText});
        setData(lastMessageText, KEY_MESSAGE_LAST_TIME, this.lastMessagetime);
        item.appendChild(lastMessageText);

        const unreadMessage = createDivEl({element: 'span', className: 'list-item-meta', content: this.unreadMessageCount > 0 ? this.unreadMessageCount : ''});
        item.appendChild(unreadMessage);
        itemBox.appendChild(item);

        const btnDelete = createDivEl({className: 'btn-delete', content: LANG.MESSAGE.Delete});
        itemBox.appendChild(btnDelete);

        addEvent(item, 'click', () => {
            if (handler) handler();
        });

        addEvent(btnDelete, 'click', () => {
            if (Delete) Delete(itemBox);
        });

        addEvent(itemBox, 'touchstart', (e) => {
            startX = e.changedTouches[0].pageX;
        });

        addEvent(itemBox, 'touchend', (e) => {
            let moveX = e.changedTouches[0].pageX;

            if (startX === moveX) return false;

            if (startX > moveX) {
                addClass(itemBox, 'active');
            }else {
                removeClass(itemBox, 'active');
            }
        });

        return itemBox;
    }
}

export { MessageItem };