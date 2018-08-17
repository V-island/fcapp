import SendBird from 'sendbird';
import {
    getUuid
} from './util';

let instance = null;

export default class SendBirdConnection {
    constructor() {
        if (instance) {
            return instance;
        }

        this.sb = SendBird.getInstance();
        this.key = getUuid();
        this.channel = null;
        this._createConnectionHandler(this.key);

        this.onReconnectStarted = null;
        this.onReconnectSucceeded = null;
        this.onReconnectFailed = null;

        instance = this;
    }

    _createConnectionHandler(key) {
        const handler = new this.sb.ConnectionHandler();

        // 网络已断开连接。 自动重新连接开始。
        handler.onReconnectStarted = () => {
            if (this.onReconnectStarted) {
                this.onReconnectStarted();
            }
        };

        // 自动重新连接成功。
        handler.onReconnectSucceeded = () => {
            if (this.onReconnectSucceeded) {
                this.onReconnectSucceeded();
            }
        };

        // 自动重新连接失败。 您可以调用`reconnect（）`来重置计时器并重新启动重新连接到SendBird。
        handler.onReconnectFailed = () => {
            if (this.onReconnectFailed) {
                this.onReconnectFailed();
            }
        };
        this.sb.addConnectionHandler(key, handler);
    }

    remove() {
        this.sb.removeConnectionHandler(this.key);
    }

    static getInstance() {
        return new SendBirdConnection();
    }
}