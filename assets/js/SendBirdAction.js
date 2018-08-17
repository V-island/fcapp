import SendBird from 'sendbird';
import {
    sendBirdConfig
} from './intro';
import {
    isNull,
    isNumber
} from './util';

let instance = null;

export default class SendBirdAction {
    constructor() {
        if (instance) {
            return instance;
        }
        this.sb = new SendBird({
            'appId': sendBirdConfig.sendBirdAppID
        });
        this.userQuery = null;
        this.openChannelQuery = null;
        this.groupChannelQuery = null;
        this.previousMessageQuery = null;
        this.participantQuery = null;
        this.blockedQuery = null;
        instance = this;
    }

    // 连接
    connect(userId) {
        return new Promise((resolve, reject) => {
            const sb = SendBird.getInstance();
            sb.connect(userId, (user, error) => {
                error ? reject(error) : resolve(user);
            });
        });
    }

    // 断开连接
    disconnect() {
        return new Promise((resolve, reject) => {
            this.sb.disconnect((response, error) => {
                error ? reject(error) : resolve();
            });
        });
    }

    // 更新用户个人资料和个人资料图片
    updateCurrentUserInfo(nickname, profileUrl) {
        return new Promise((resolve, reject) => {
            this.sb.updateCurrentUserInfo(nickname, profileUrl, (user, error) => {
                error ? reject(error) : resolve(user);
            });
        });
    }

    // 获取用户列表
    getCurrentUser() {
        return this.sb.currentUser;
    }

    // 获得当前用户
    getUserList(isInit = false) {
        if (isInit || isNull(this.userQuery)) {
            this.userQuery = new this.sb.createUserListQuery();
            this.userQuery.limit = 30;
        }
        return new Promise((resolve, reject) => {
            if (this.userQuery.hasNext && !this.userQuery.isLoading) {
                this.userQuery.next((list, error) => {
                    error ? reject(error) : resolve(list);
                });
            } else {
                resolve([]);
            }
        });
    }

    // 是否为当前用户
    isCurrentUser(user) {
        return user.userId === this.sb.currentUser.userId;
    }

    // 获取黑名单
    getBlockedList(isInit = false) {
        if (isInit || isNull(this.blockedQuery)) {
            this.blockedQuery = this.sb.createBlockedUserListQuery();
            this.blockedQuery.limit = 30;
        }
        return new Promise((resolve, reject) => {
            if (this.blockedQuery.hasNext && !this.blockedQuery.isLoading) {
                this.blockedQuery.next((blockedList, error) => {
                    error ? reject(error) : resolve(blockedList);
                });
            } else {
                resolve([]);
            }
        });
    }

    // 拉黑用户
    blockUser(user, isBlock = true) {
        return new Promise((resolve, reject) => {
            if (isBlock) {
                this.sb.blockUser(user, (response, error) => {
                    error ? reject(error) : resolve();
                });
            } else {
                this.sb.unblockUser(user, (response, error) => {
                    error ? reject(error) : resolve();
                });
            }
        });
    }

    // 获取频道
    getChannel(channelUrl, isOpenChannel = true) {
        return new Promise((resolve, reject) => {
            if (isOpenChannel) {
                this.sb.OpenChannel.getChannel(channelUrl, (openChannel, error) => {
                    error ? reject(error) : resolve(openChannel);
                });
            } else {
                this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
                    error ? reject(error) : resolve(groupChannel);
                });
            }
        });
    }

    // 获取开放频道列表
    getOpenChannelList(isInit = false) {
        if (isInit || isNull(this.openChannelQuery)) {
            this.openChannelQuery = new this.sb.OpenChannel.createOpenChannelListQuery();
            this.openChannelQuery.limit = 20;
        }
        return new Promise((resolve, reject) => {
            if (this.openChannelQuery.hasNext && !this.openChannelQuery.isLoading) {
                this.openChannelQuery.next((list, error) => {
                    error ? reject(error) : resolve(list);
                });
            } else {
                resolve([]);
            }
        });
    }

    // 创建开放频道
    createOpenChannel(channelName) {
        return new Promise((resolve, reject) => {
            channelName ? this.sb.OpenChannel.createChannel(channelName, null, null, (openChannel, error) => {
                    error ? reject(error) : resolve(openChannel);
                }) : this.sb.OpenChannel.createChannel((openChannel, error) => {
                    error ? reject(error) : resolve(openChannel);
                });
        });
    }

    // 输入状态
    enter(channelUrl) {
        return new Promise((resolve, reject) => {
            this.sb.OpenChannel.getChannel(channelUrl, (openChannel, error) => {
                if (error) {
                    reject(error);
                } else {
                    openChannel.enter((response, error) => {
                        error ? reject(error) : resolve();
                    });
                }
            });
        });
    }

    // 退出频道
    exit(channelUrl) {
        return new Promise((resolve, reject) => {
            this.sb.OpenChannel.getChannel(channelUrl, (openChannel, error) => {
                if (error) {
                    reject(error);
                } else {
                    openChannel.exit((response, error) => {
                        error ? reject(error) : resolve();
                    });
                }
            });
        });
    }

    // 获得频道中参与者名单
    getParticipantList(channelUrl, isInit = false) {
        return new Promise((resolve, reject) => {
            this.sb.OpenChannel.getChannel(channelUrl, (openChannel, error) => {
                if (error) {
                    reject(error);
                } else {
                    if (isInit || isNull(this.participantQuery)) {
                        this.participantQuery = openChannel.createParticipantListQuery();
                        this.participantQuery.limit = 30;
                    }
                    if (this.participantQuery.hasNext && !this.participantQuery.isLoading) {
                        this.participantQuery.next((participantList, error) => {
                            error ? reject(error) : resolve(participantList);
                        });
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    }

    /**
     * 获取组频道列表
     * @param  {Boolean} isInit [description]
     * @return {[type]}         [description]
     */
    getGroupChannelList(isInit = false) {
        if (isInit || isNull(this.groupChannelQuery)) {
            this.groupChannelQuery = new this.sb.GroupChannel.createMyGroupChannelListQuery();
            this.groupChannelQuery.limit = 50;
            this.groupChannelQuery.includeEmpty = false;
            this.groupChannelQuery.order = 'latest_last_message';
        }
        return new Promise((resolve, reject) => {
            if (this.groupChannelQuery.hasNext && !this.groupChannelQuery.isLoading) {
                this.groupChannelQuery.next((list, error) => {
                    error ? reject(error) : resolve(list);
                });
            } else {
                resolve([]);
            }
        });
    }

    /**
     * 创建一对一聊天
     * @param  {[type]} userIds [description]
     * @return {[type]}         [description]
     */
    createChannelWithUserIds(userIds) {
        userIds = isNumber(userIds) ? userIds + '' : userIds;
        return new Promise((resolve, reject) => {
            this.sb.GroupChannel.createChannelWithUserIds([userIds], true, (createdChannel, error) => {
                error ? reject(error) : resolve(createdChannel);
            });
        });
    }

     /**
      * 创建群组频道
      * @param  {[type]} userIds    用户ID
      * @param  {[type]} type       群组频道类型
      * @return {[type]}            [description]
      */
    createGroupChannel(userIds, type) {
        return new Promise((resolve, reject) => {
            let params = new this.sb.GroupChannelParams();
            params.addUserIds(userIds);
            params.name = type;
            params.customType = type;
            params.channelUrl = `${userIds}_${type}_channel`;
            params.isPublic = true;
            console.log(params);
            this.sb.GroupChannel.createChannel(params, (groupChannel, error) => {
                error ? reject(error) : resolve(groupChannel);
            });
        });
    }

    /**
     * 邀请集团频道
     * @param  {[type]} channelUrl [description]
     * @param  {[type]} userIds    [description]
     * @return {[type]}            [description]
     */
    inviteGroupChannel(channelUrl, userIds) {
        return new Promise((resolve, reject) => {
            this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
                console.log(groupChannel);
                if (error) {
                    reject(error);
                } else {
                    groupChannel.inviteWithUserIds(userIds, (groupChannel, error) => {
                        error ? reject(error) : resolve(groupChannel);
                    });
                }
            });
        });
    }

    // 频道离开状态
    leave(channelUrl) {
        return new Promise((resolve, reject) => {
            this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
                if (error) {
                    reject(error);
                } else {
                    groupChannel.leave((response, error) => {
                        error ? reject(error) : resolve();
                    });
                }
            });
        });
    }

    // 频道隐身状态
    hide(channelUrl) {
        return new Promise((resolve, reject) => {
            this.sb.GroupChannel.getChannel(channelUrl, (groupChannel, error) => {
                if (error) {
                    reject(error);
                } else {
                    groupChannel.hide((response, error) => {
                        error ? reject(error) : resolve();
                    });
                }
            });
        });
    }

    // 频道消息标记为已读
    markAsRead(channel) {
        channel.markAsRead();
    }

    // 获取频道消息列表
    getMessageList(channel, isInit = false) {
        if (isInit || isNull(this.previousMessageQuery)) {
            this.previousMessageQuery = channel.createPreviousMessageListQuery();
        }
        return new Promise((resolve, reject) => {
            if (this.previousMessageQuery.hasMore && !this.previousMessageQuery.isLoading) {
                this.previousMessageQuery.load(50, false, (messageList, error) => {
                    error ? reject(error) : resolve(messageList);
                });
            } else {
                resolve([]);
            }
        });
    }

    // 获得频道消息阅读回调
    getReadReceipt(channel, message) {
        if (this.isCurrentUser(message.sender)) {
            return channel.getReadReceipt(message);
        } else {
            return 0;
        }
    }

    // 发送用户消息
    sendUserMessage({channel, message, handler}) {
        return channel.sendUserMessage(message, (message, error) => {
            if (handler) handler(message, error);
        });
    }

    // 发送频道消息
    sendChannelMessage({channel, message, data, handler}) {
        return channel.sendUserMessage(message, JSON.stringify(data), (message, error) => {
            if (handler) handler(message, error);
        });
    }

    // 发送用户文件消息
    sendFileMessage({channel, file, handler}) {
        return channel.sendFileMessage(file, (message, error) => {
            if (handler) handler(message, error);
        });
    }

    // 删除消息
    deleteMessage({channel, message}) {
        return new Promise((resolve, reject) => {
            if (!this.isCurrentUser(message.sender)) {
                reject({
                    message: 'You have not ownership in this message.'
                });
            }
            channel.deleteMessage(message, (response, error) => {
                error ? reject(error) : resolve(response);
            });
        });
    }

    static getInstance() {
        return new SendBirdAction();
    }
}