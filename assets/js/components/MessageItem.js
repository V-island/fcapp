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
            return this.channel.isOpenChannel() ? LANG.MESSAGE.System_Default : '';
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

        const itemText = createDivEl({element: 'span', className: 'list-item-text', content: this.title !== null ? this.title : LANG.MESSAGE.Anonymous });
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

        // 手指触碰屏幕
        addEvent(itemBox, 'touchstart', (e) => {
            startX = e.changedTouches[0].pageX;
        });

        // 手指在屏幕上滑动
        addEvent(itemBox, 'touchmove', (e) => {
            console.log(e);
            // 如果有多个地方滑动，我们就不发生这个事件
            if(e.targetTouches.length > 1) return;
            const btnWidth = btnDelete.clientWidth;
            let moveX = (e.targetTouches[0].pageX - startX);

            if (moveX < 0 && -moveX <= btnWidth) {
                btnDelete.style.transform = `translateX(${btnWidth + moveX}px)`;
                item.style.transform = `translateX(${moveX}px)`;
            }

            if (moveX > 0 && moveX <= btnWidth) {
                btnDelete.style.transform = `translateX(${btnWidth - moveX}px)`;
                item.style.transform = `translateX(${-moveX}px)`;
            }
        });

        // 手指离开屏幕
        addEvent(itemBox, 'touchend', (e) => {
            const btnWidth = btnDelete.clientWidth;
            let endX = e.changedTouches[0].pageX;

            if (startX === endX) return false;

            if (startX > endX) {
                btnDelete.style.transform = `translateX(0px)`;
                item.style.transform = `translateX(${-btnWidth}px)`;
            }else {
                btnDelete.style.transform = `translateX(${btnWidth}px)`;
                item.style.transform = `translateX(0px)`;
            }
        });

        return itemBox;
    }
}

export { MessageItem };