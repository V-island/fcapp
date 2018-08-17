// import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import { MessageItemSystem, MessageItemModal } from '../components/MessageItemModal';

import SendBirdAction from '../SendBirdAction';
import SendBirdChatEvent from '../SendBirdChatEvent';
// import SendBirdConnection from '../SendBirdConnection';
// import SendBirdEvent from '../SendBirdEvent';

import {
    getLangConfig
} from '../lang';

import {
    getUserInfo
} from '../api';

import {
    body
} from '../intro';

import {
    addEvent,
    createDivEl,
    toggleClass,
    addClass,
    removeClass,
    errorAlert
} from '../util';

const LANG = getLangConfig();

let instance = null;

class MessageChat {
    constructor() {
        if (instance) {
            return instance;
        }

        this.options = {
            showClass: 'active'
        };

        this.channel = null;
        this.element = null;
        this.main = null;
        // this.emptyElement = this._createEmptyElement();
        instance = this;
    }

    _createEmptyElement() {
        const item = createDivEl({
            className: styles['chat-empty']
        });

        const content = createDivEl({
            className: styles['empty-content']
        });
        item.appendChild(content);

        const title = createDivEl({
            className: styles['content-title'],
            content: 'WELCOME TO SAMPLE CHAT'
        });
        content.appendChild(title);
        const image = createDivEl({
            className: styles['content-image']
        });
        content.appendChild(image);
        const desc = createDivEl({
            className: styles['content-desc'],
            content: 'Create or select a channel to chat in.\n' +
                "If you don't have a channel to participate,\n" +
                'go ahead and create your first channel now.'
        });
        content.appendChild(desc);
        return item;
    }

    // 空数据渲染
    renderEmptyElement() {
        this._removeChatElement();
        targetEl.appendChild(this.emptyElement);
    }

    // 创建一对一聊天Element
    _createChatElement(channel) {
        const chatWrapper = createDivEl({className: 'message-chat-wrapper'});

        const barHeader = createDivEl({element: 'header', className: ['bar', 'bar-flex']});
        const iconBtn = createDivEl({className: 'icon-btn'});
        const iconsBack = createDivEl({element: 'i', className: ['icon', 'icon-arrow-back']});
        iconBtn.appendChild(iconsBack);
        barHeader.appendChild(iconBtn);

        const title = createDivEl({element: 'h1', className: 'title', content: channel.name});
        barHeader.appendChild(title);
        chatWrapper.appendChild(barHeader);

        const chatFooter = createDivEl({className: 'message-chat-footer'});
        const channelPrompt = createDivEl({element: 'p', className: 'channel-prompt', content: LANG.MESSAGE.Prompt.Free});
        chatFooter.appendChild(channelPrompt);

        const chatForm = createDivEl({className: 'message-chat-form'});
        const chatGroup = createDivEl({className: ['news-group', 'chat-group']});
        const chatInput = createDivEl({element: 'textarea', className: 'news-input', data: [{name: 'rows', value: 1}]});
        chatGroup.appendChild(chatInput);

        const chatPhiz = createDivEl({className: 'news-phiz'});
        const chatPhizIcon = createDivEl({element: 'i', className: ['icon', 'modals-phiz']});
        chatPhiz.appendChild(chatPhizIcon);
        chatGroup.appendChild(chatPhiz);

        const chatButtonSend = createDivEl({className: ['button', 'fill-gray', 'btn-send'], content: LANG.LIVE_PREVIEW.Actions.Send});
        chatGroup.appendChild(chatButtonSend);
        chatForm.appendChild(chatGroup);

        const chatMediaList = createDivEl({className: 'chat-media-list'});
        const chatMediaVoice = createDivEl({element: 'i', className: ['icon', 'message-voice', 'btn-voice']});
        const chatMediaAlbum = createDivEl({element: 'i', className: ['icon', 'message-album', 'btn-album']});
        const chatMediaVideo = createDivEl({element: 'i', className: ['icon', 'message-video', 'btn-video']});
        const chatMediaGiving = createDivEl({element: 'i', className: ['icon', 'message-giving', 'btn-giving']});
        chatMediaList.appendChild(chatMediaVoice);
        chatMediaList.appendChild(chatMediaAlbum);
        chatMediaList.appendChild(chatMediaVideo);
        chatMediaList.appendChild(chatMediaGiving);
        chatForm.appendChild(chatMediaList);
        chatFooter.appendChild(chatForm);
        chatWrapper.appendChild(chatFooter);

        const chatContent = createDivEl({className: ['content', 'block', 'message-chat-content']});
        chatWrapper.appendChild(chatContent);

        const {userId} = getUserInfo();
        this.main = new MessageItemModal(chatContent, channel, userId);
        this.element = chatWrapper;

        // 关闭聊天
        addEvent(iconsBack, 'click', () => {
            this.hide();
        });

        // 发送消息
        addEvent(chatButtonSend, 'click', () => {
            if (chatInput.value == "") return false;

            SendBirdAction.getInstance()
                .sendUserMessage({
                    channel: this.channel,
                    message: chatInput.value,
                    handler: (message, error) => {
                        this.main.renderMessages([message], false);
                        chatInput.value = "";
                    }
                });
        });

        // 开启表情包
        addEvent(chatPhiz, 'click', () => {
            
        });

        // 发送语音
        addEvent(chatMediaVoice, 'click', () => {
            
        });

        // 发送图片
        addEvent(chatMediaAlbum, 'click', () => {
            
        });

        // 发送视频
        addEvent(chatMediaVideo, 'click', () => {
            
        });

        // 发送礼物
        addEvent(chatMediaVideo, 'click', () => {
            
        });
    }

    // 创建点赞、评论、礼物、开发频道Element
    _createOpenChatElement(channel) {
        const chatWrapper = createDivEl({className: 'message-chat-wrapper'});

        const barHeader = createDivEl({element: 'header', className: ['bar', 'bar-flex']});
        const iconBtn = createDivEl({className: 'icon-btn'});
        const iconsBack = createDivEl({element: 'i', className: ['icon', 'icon-arrow-back']});
        iconBtn.appendChild(iconsBack);
        barHeader.appendChild(iconBtn);

        const title = createDivEl({element: 'h1', className: 'title', content: channel.name});
        barHeader.appendChild(title);
        chatWrapper.appendChild(barHeader);

        const chatContent = createDivEl({className: ['content', 'block', 'message-chat-content']});
        chatWrapper.appendChild(chatContent);

        this.main = new MessageItemSystem(chatContent, channel);
        this.element = chatWrapper;

        // 关闭聊天
        addEvent(iconsBack, 'click', () => {
            this.hide();
        });
    }

    // 添加监听事件
    _addEventHandler() {
        const channelEvent = new SendBirdChatEvent();

        channelEvent.onMessageReceived = (channel, message) => {
            if (this.channel.url === channel.url) {
                this.main.renderMessages([message], false);
            }
        };

        channelEvent.onMessageUpdated = (channel, message) => {
            if (this.channel.url === channel.url) {
                this.main.renderMessages([message], false);
            }
        };

        channelEvent.onMessageDeleted = (channel, messageId) => {
            if (this.channel.url === channel.url) {
                this.main.removeMessage(messageId, false);
            }
        };

        // if (this.channel.isGroupChannel()) {
        //     channelEvent.onReadReceiptUpdated = groupChannel => {
        //         if (this.channel.url === groupChannel.url) {
        //             this.main.updateReadReceipt();
        //         }
        //     };
        //     channelEvent.onTypingStatusUpdated = groupChannel => {
        //         if (this.channel.url === groupChannel.url) {
        //             this.main.updateTyping(groupChannel.getTypingMembers());
        //         }
        //     };
        // }
    }

    _renderChatElement(channelUrl, isOpenChannel = true) {
        Spinner.start(body);
        const sendbirdAction = SendBirdAction.getInstance();

        sendbirdAction
            .getChannel(channelUrl, isOpenChannel)
            .then(channel => {
                this.channel = channel;
                this._addEventHandler();

                if (isOpenChannel || this.channel.isPublic) {
                    this._createOpenChatElement(this.channel);
                }else {
                    this._createChatElement(this.channel);
                }

                body.appendChild(this.element);
                this.show();
                sendbirdAction
                    .getMessageList(this.channel, true)
                    .then(messageList => {
                        console.log(messageList);
                        this.main.renderMessages(messageList);

                        if (this.channel.isGroupChannel()) {
                            sendbirdAction.markAsRead(this.channel);
                        }

                        Spinner.remove();
                    })
                    .catch(error => {
                        errorAlert(error.message);
                    });
            })
            .catch(error => {
                errorAlert(error.message);
            });
    }

    render(channelUrl, isOpenChannel = true) {
        channelUrl ? this._renderChatElement(channelUrl, isOpenChannel) : this.renderEmptyElement();
    }

    static getInstance() {
        return new MessageChat();
    }

    /**
     * MessageChat.show()
     * 显示聊天界面，一般来说，聊天界面内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]}        [description]
     */
    show() {
        window.setTimeout(() => {
            addClass(this.element, this.options.showClass);
        }, 0);
    }

    /**
     * MessageChat.hide()
     * 显示聊天界面，一般来说，聊天界面内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    hide() {
        toggleClass(this.element, this.options.showClass);
        window.setTimeout(() => {
            body.removeChild(this.element);
        }, 500);
    }
}

export { MessageChat };