import SendBird from 'sendbird';
import {
    getUuid
} from './util';

export default class SendBirdEvent {
    constructor() {
        this.sb = SendBird.getInstance();
        this.key = getUuid();
        this._createChannelHandler();

        this.onChannelChanged = null;
        this.onUserJoined = null;
        this.onUserLeft = null;
        this.onChannelHidden = null;
        this.onUserEntered = null;
    }

    _createChannelHandler() {
        const handler = new this.sb.ChannelHandler();

        // 当频道属性发生变化时
        handler.onChannelChanged = channel => {
            if (this.onChannelChanged) {
                this.onChannelChanged(channel);
            }
        };

        // 当新成员加入群组频道时
        handler.onUserJoined = (groupChannel, user) => {
            if (this.onUserJoined) {
                this.onUserJoined(groupChannel, user);
            }
        };

        // 当一名成员离开小组频道时
        handler.onUserLeft = (groupChannel, user) => {
            if (this.onUserLeft) {
                this.onUserLeft(groupChannel, user);
            }
        };

        // 当群组频道被隐藏时
        handler.onChannelHidden = groupChannel => {
            if (this.onChannelHidden) {
                this.onChannelHidden(groupChannel);
            }
        };

        // 当新用户进入开放频道时
        handler.onUserEntered = (openChannel, user) => {
            if (this.onUserEntered) {
                this.onUserEntered(openChannel, user);
            }
        };
        this.sb.addChannelHandler(this.key, handler);
    }

    remove() {
        this.sb.removeChannelHandler(this.key);
    }
}