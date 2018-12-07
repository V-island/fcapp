import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import { VideoWatchItem, CardVideoAdd } from '../components/CardsItem';
import { closeModal, confirm, videoPreview } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { PullLoad } from '../components/PullLoad';
import RecordVideo from '../record-video';

import {
	body,
	fcConfig
} from '../intro';

import {
    getLangConfig
} from '../lang';

import {
    findMyVideo,
    deleteVideo
} from '../api';

import {
    extend,
    createDom,
    addEvent,
    getData,
    setData,
    dateFormat,
    showHideDom,
    importTemplate
} from '../util';

const LANG = getLangConfig();
Template.defaults.imports.dateFormat = (date, format) => {
	return dateFormat(date, format);
};

export default class UserVideo extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	userWrapper: '.user-wrapper',
	    	boxCardsClass: '.box-cards',
	    	cardsPageIndex: 'page',
	    	videoAddClass: 'video-add-card',
	    	videoCloseClass: 'btn-close-video',
	    	mediaClass: 'media',
	    	cardvideoClass: 'card-video'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		this._page = 1;
		this._number = 10;
		let getMyVideo = findMyVideo(this._page, this._number);

		getMyVideo.then((data) => {
			this.VideoList = data;

			this.UserVideoEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserVideoEl);
			this._init();
		});
	}

	_init() {
		this.pagesVideoEl = this.UserVideoEl.querySelector(this.options.userWrapper);
		this.boxVideoEl = this.pagesVideoEl.querySelector(this.options.boxCardsClass);

		// add video
		const videoAddItem = new CardVideoAdd({
			handler: () => {
				let record = new RecordVideo({
	    		    editVideoInfo: true
	    		});
				record.show();
			}
		});
		this.boxVideoEl.append(videoAddItem.element);

		if (this.VideoList.length > 0) {
			// content
			this.VideoList.forEach((itemData, index) => {
				if (itemData.status == 4) return false;

				let videoItem;
				const Delete = (id) => {
					const callback = () => {
						let getDeleteVideo = deleteVideo(id);

						getDeleteVideo.then((data) => {
							if (!data) return;

							this.boxVideoEl.removeChild(videoItem.element);
						});
					};
					confirm({
						text: `${LANG.USER_VIDEO.Delete_Prompt}`,
						callback
					});
				};
				const handler = (url) => {
					videoPreview({
						videoUrl: url
					});
				};
				videoItem = new VideoWatchItem({
					Delete,
					handler,
					data: itemData
				});
				this.boxVideoEl.append(videoItem.element);
			});
		}

		this._VideoPullLoad();
	}

	// Video 模块
	_VideoPullLoad() {

		const VideoPullLoad = new PullLoad(this.pagesVideoEl, {
			probeType: 1,
			startY: 0,
			scrollY: true,
			scrollX: false,
			click: true,
			tap: true,
			bounce: true,
			pullDownRefresh: {
				threshold: 50,
				stop: 20
			},
			pullUpLoad: {
				threshold: 0
			}
		});

		// 下拉刷新
		VideoPullLoad.onPullingDown = () => {
			return new Promise((resolve) => {
				findMyVideo(this._page, this._number).then((videoList) => {
					if (!videoList) return resolve(true);

					this.boxVideoEl.innerHTML = '';

					// add video
					const videoAddItem = new CardVideoAdd({
						handler: () => {
							let record = new RecordVideo({
				    		    editVideoInfo: true
				    		});
							record.show();
						}
					});
					this.boxVideoEl.append(videoAddItem.element);

					if (videoList) {
						// content
						videoList.forEach((itemData, index) => {
							if (itemData.status == 4) return false;

							let videoItem;
							const Delete = (id) => {
								const callback = () => {
									let getDeleteVideo = deleteVideo(id);

									getDeleteVideo.then((data) => {
										if (!data) return;

										this.boxVideoEl.removeChild(videoItem.element);
									});
								};
								confirm({
									text: `${LANG.USER_VIDEO.Delete_Prompt}`,
									callback
								});
							};
							const handler = (url) => {
								videoPreview({
									videoUrl: url
								});
							};
							videoItem = new VideoWatchItem({
								Delete,
								handler,
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});
					}

					setData(this.boxVideoEl, this.options.cardsPageIndex, this._page);
					resolve(true);
				});
			});
		};

		// 上拉加载
		VideoPullLoad.onPullingUp = () => {
			let _page = getData(this.boxVideoEl, this.options.cardsPageIndex);
			_page = parseInt(_page) + 1;

			return new Promise((resolve) => {
				findMyVideo(_page, this._number).then((videoList) => {
					if (videoList) {
						// content
						videoList.forEach((itemData, index) => {
							if (itemData.status == 4) return false;

							let videoItem;
							const Delete = (id) => {
								const callback = () => {
									let getDeleteVideo = deleteVideo(id);

									getDeleteVideo.then((data) => {
										if (!data) return;

										this.boxVideoEl.removeChild(videoItem.element);
									});
								};
								confirm({
									text: `${LANG.USER_VIDEO.Delete_Prompt}`,
									callback
								});
							};
							const handler = (url) => {
								videoPreview({
									videoUrl: url
								});
							};
							videoItem = new VideoWatchItem({
								Delete,
								handler,
								data: itemData
							});
							this.boxVideoEl.append(videoItem.element);
						});

						setData(this.boxVideoEl, this.options.cardsPageIndex, _page);
					}
					resolve(true);
				});
			});
		};
	}

	static attachTo(element, options) {
	    return new UserVideo(element, options);
	}
}