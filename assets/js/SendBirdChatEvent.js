import SendBird from 'sendbird';
import {
    getUuid
} from './util';

let instance = null;

export default class SendBirdChatEvent {
    constructor() {
        if (instance) {
            return instance;
        }

        this.sb = SendBird.getInstance();
        this.key = getUuid();
        this._createChannelHandler();

        this.onMessageReceived = null;
        this.onMessageUpdated = null;
        this.onMessageDeleted = null;

        this.onReadReceiptUpdated = null;
        this.onTypingStatusUpdated = null;
        instance = this;
    }

    /**
     * Channel Handler
     */
    _createChannelHandler() {
        const handler = new this.sb.ChannelHandler();

        // 收到了聊天消息 / Received a chat message
        handler.onMessageReceived = (channel, message) => {
            if (this.onMessageReceived) {
                this.onMessageReceived(channel, message);
            }
        };

        // 收到更新的聊天消息 / Received an updated chat message.
        handler.onMessageUpdated = (channel, message) => {
            if (this.onMessageUpdated) {
                this.onMessageUpdated(channel, message);
            }
        };

        // 聊天消息被删除时 / When a message has been deleted
        handler.onMessageDeleted = (channel, messageId) => {
            if (this.onMessageDeleted) {
                this.onMessageDeleted(channel, messageId);
            }
        };

        // 阅读收据更新后 / When read receipt has been updated.
        handler.onReadReceiptUpdated = groupChannel => {
            if (this.onReadReceiptUpdated) {
                this.onReadReceiptUpdated(groupChannel);
            }
        };

        // 输入状态时已更新 / When typing status has been updated.
        handler.onTypingStatusUpdated = groupChannel => {
            if (this.onTypingStatusUpdated) {
                this.onTypingStatusUpdated(groupChannel);
            }
        };
        this.sb.addChannelHandler(this.key, handler);
    }

    remove() {
        this.sb.removeChannelHandler(this.key);
    }

    static getInstance() {
        return instance;
    }
}