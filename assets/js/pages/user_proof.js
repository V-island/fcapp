import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import RecordVideo from '../record-video';
import RecordPhoto from '../record-photo';

import {
    getLangConfig
} from '../lang';

import {
	hasAudit,
    uploadVideo
} from '../api';

import {
    extend,
    addEvent,
    createDom,
    hasClass,
    getData,
    addClass,
    removeClass,
    refreshURL,
    setLocalStorage,
    getLocalStorage
} from '../util';

const LANG = getLangConfig();
const PROOF_NAME = 'HASAUDIT';

export default class LiveInformation extends EventEmitter {
	constructor(element, options) {
	    super();
	    this.data = {};
	    this.options = {
    		videoItemsClass: 'upload-video',
    		photosItemsClass: 'upload-photos',
    		btnSubmit: 'btn-live-submit',
    		btnReturn: 'btn-live-return',
    		showClass: 'choose',
    		disabledClass: 'disabled'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);

	}

	init(element) {
		let gethasAudit = hasAudit();

		gethasAudit.then((data) => {
			this.data.HasAudit = data ? data : 0; // 0.未上传 1.未审核 2.审核通过 3.审核不通过

			if (getLocalStorage(PROOF_NAME)) {
				this.data.HasAudit = 0;
			}
			this.LiveInformationEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.LiveInformationEl);
			this._init();
		});
	}

	_init() {
		this.file = [];
		this.videoItemsEl = this.LiveInformationEl.getElementsByClassName(this.options.videoItemsClass)[0];
		this.photosItemsEl = this.LiveInformationEl.getElementsByClassName(this.options.photosItemsClass)[0];
		this.btnSubmitEl = this.LiveInformationEl.getElementsByClassName(this.options.btnSubmit)[0];
		this.btnReturnEl = this.LiveInformationEl.getElementsByClassName(this.options.btnReturn)[0];
		this._bindEvent();
	}

	_bindEvent() {
		let self = this;

		// 小视频
		if (typeof this.videoItemsEl !== 'undefined') {
			addEvent(this.videoItemsEl, 'click', () => {
	    		if (hasClass(this.videoItemsEl, this.options.showClass)) {
	    			return;
	    		}

    			let recordVideo = new RecordVideo({
	    			maxTimes: 5,
	    		    newDayVideo: true,
	    		    notUpload: true
	    		});

    			recordVideo.show();
    			recordVideo.on('recordVideo.success', (file, imgURL) => {
    				this.file.push(file);
    				this.videoItemsEl.style.backgroundImage = 'url(' + imgURL + ')';
    				addClass(this.videoItemsEl, this.options.showClass);

    		    	if (hasClass(this.videoItemsEl, this.options.showClass) && hasClass(this.photosItemsEl, this.options.showClass)) {
    					removeClass(this.btnSubmitEl, this.options.disabledClass);
    				}
    			});
	        });
		}

    	// 相片
    	if (typeof this.photosItemsEl !== 'undefined') {
    		addEvent(this.photosItemsEl, 'click', () => {
	        	if (hasClass(this.photosItemsEl, this.options.showClass)) {
	    			return;
	    		}

				let recordPhoto = new RecordPhoto();

				recordPhoto.on('recordPhoto.clipping', (File, URL) => {
            		this.file.push(File);
            		this.photosItemsEl.style.backgroundImage = 'url(' + URL + ')';
            		addClass(this.photosItemsEl, this.options.showClass);

                	if (hasClass(this.videoItemsEl, this.options.showClass) && hasClass(this.photosItemsEl, this.options.showClass)) {
            			removeClass(this.btnSubmitEl, this.options.disabledClass);
            		}
	            });
	        });
    	}

        // 上传
        if (typeof this.btnSubmitEl !== 'undefined') {
        	addEvent(this.btnSubmitEl, 'click', () => {
	        	if (hasClass(this.btnSubmitEl, this.options.disabledClass)) {
	    			return;
	    		}
	    		addClass(this.btnSubmitEl, this.options.disabledClass);

	    		uploadVideo(this.file, 2, function(data) {
	    			setLocalStorage(PROOF_NAME, false);
	    			refreshURL();
	    		}, function(progress) {
	    		    console.log(progress);
	    		});
	        });
        }

        // 返回
        if (typeof this.btnReturnEl !== 'undefined') {
        	addEvent(this.btnReturnEl, 'click', () => {
        		setLocalStorage(PROOF_NAME, true);
	        	refreshURL();
	        });
        }

	}

	static attachTo(element, options) {
	    return new LiveInformation(element, options);
	}
}