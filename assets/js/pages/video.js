import { VideoContent } from '../components/VideoContent';
import { closeModal, alert } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import SendBirdAction from '../SendBirdAction';
import Pay from '../Pay';
import {
	body
} from '../intro';
import {
    getLangConfig
} from '../lang';
import {
	playVideo,
	getUserInfo,
	setUserInfo,
	commentVideo,
	selCommentById,
	praiseVideo,
	findAllgifts,
	selAllGoods,
	payWay,
	videoGifts,
	follow,
	collectionVideo
} from '../api';
import {
	jumpURL,
    extend,
    addEvent,
    createDom,
    errorAlert,
    addClass,
    hasClass,
    removeClass,
    getClientId,
    getVariableFromUrl
} from '../util';

const LANG = getLangConfig();

export default class video extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	contentClass: '.content'
        };

	    extend(this.options, options);

	    this.init(element);
	}

	init(element) {
		const { anchorid, anchorname, anchorhead, videoid, videoimg, support } = getVariableFromUrl();
		let {userId} = getUserInfo();
		this._page = 1;
		this._number = 10;

		const getPlayVideo = playVideo(videoid);
		const getSelCommentById = selCommentById(videoid, this._page, this._number);
		const getfindAllgifts = findAllgifts();
		const getSelAllGoods = selAllGoods();
		const getPayWay = payWay();
		const getIMChannel = this._createIMChannel(userId);

		Promise.all([getPlayVideo, getSelCommentById, getfindAllgifts, getSelAllGoods, getPayWay, getIMChannel]).then((data) => {
			this.data.PlayVideoInfo = data[0] ? data[0] : {};
			this.data.CommentList = data[1] ? data[1] : [];
			this.data.AllGiftList = data[2] ? data[2] : false;
			this.data.AllGoodsList = data[3] ? data[3] : false;
			this.data.AllPayWayList = data[4] ? data[4] : false;
			this.data.AnchorInfo = {
				anchor_id: anchorid,
				video_id: videoid,
				video_img: videoimg,
				user_name: anchorname,
				user_head: anchorhead,
				support: support
			};

			this.VideoEl = createDom(element);
			this.trigger('pageLoadStart', this.VideoEl);
			this._init();
		});
	}

	_init() {
		this.listWrapperEl = this.VideoEl.querySelector(this.options.contentClass);

		const videoContent = new VideoContent({
			data: this.data
		});

		// 关注
		videoContent.onFavorite =(id, status) => {
			follow(id, status);
		};

		// 点赞
		videoContent.onLike =(videoId, status) => {
			if (this.getLoves) return false;

			this.getLoves = true;
			praiseVideo(videoId, status).then((data) => {
				if (!data) return false;
				this._joinGroupChannel(this.data.PlayVideoInfo.praise_channel, LANG.MESSAGE.Like.Text);
			});
		};

		// 收藏
		videoContent.onKeep =(videoId, status) => {
			collectionVideo(videoId, status);
		};

		// 评论
		videoContent.onSend =(videoId, value) => {
			commentVideo(videoId, value).then((data) => {
				if (!data) return false;
				this._joinGroupChannel(this.data.PlayVideoInfo.comment_channel, value);
			});
		};

		// 发送礼物
		videoContent.onGift = (id, videoId, giftId, price, name, imgUrl, amount) => {
			if (price > 0) {
				videoGifts(id, videoId, giftId, amount).then((data) => {
					if (!data) return;

					setUserInfo('userPackage', parseInt(data));
					this._joinGroupChannel(this.data.PlayVideoInfo.gift_channel, LANG.MESSAGE.Gift.Text, imgUrl);
				});
			}else {
				this._joinGroupChannel(this.data.PlayVideoInfo.gift_channel, LANG.MESSAGE.Gift.Text, imgUrl);
			}
		};

		// 充值
		videoContent.onRecharge = (element) => {
			Pay.attachTo(element);
		};

		this.listWrapperEl.appendChild(videoContent.element);
		videoContent.player();
	}

	// 链接IM服务
	_createIMChannel(userId) {
		this.SendBird = new SendBirdAction();

		return new Promise((resolve) => {
			this.SendBird.connect(userId).then(user => {
				resolve(true);
			}).catch(() => {
				errorAlert('SendBird connection failed.');
				resolve(false);
			});
		});
	}

	/**
	 * 加入频道并发送消息
	 * @param  {[type]} channelURL 频道URL
	 * @param  {[type]} message    消息
	 * @return {[type]}            [description]
	 */
	_joinGroupChannel(channelURL, message, giftUrl) {
	    const {video_id, video_img} = this.data.AnchorInfo;
	    return new Promise((resolve) => {
	        this.SendBird.getChannel(channelURL, false).then((groupChannel) => {

	            groupChannel.join(() => {

	                this.SendBird.sendChannelMessage({
	                    channel: groupChannel,
	                    message: message,
	                    data: {
	                        videoId: video_id,
	                        videoImg: video_img,
	                        giftUrl: giftUrl
	                    },
	                    handler: (message, error) => {
	                        if (error) return resolve(false);

	                        groupChannel.leave(() => {
	                            resolve(true);
	                        });
	                    }
	                });
	            });
	        });
	    });
	}

	static attachTo(element, options) {
	    return new video(element, options);
	}
}