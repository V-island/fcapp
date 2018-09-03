import {
    getLangConfig
} from './lang';

import {
    extend,
    createDivEl,
    hasClass,
    addClass,
    removeClass,
    appendToFirst
} from './util';

const LANG = getLangConfig();

export default class ProgressLine {
    constructor(imgUrl) {
        this.imgURL = imgUrl;
        this.options = {
            pageClass: '.page',
            barProgressClass: 'bar-progress',
            progressLineClass: 'progress-line'
        };
        this.element = this._uploadTemplate();
    }

    // 隐藏上传进度
    hide() {
        window.setTimeout(() => {
            document.body.removeChild(this.element);
        }, 500);
    }

    show(speed) {
        this.barEl = document.getElementsByClassName(this.options.barProgressClass);
        if (this.barEl.length == 0) {
            this.pagesEl = document.querySelector(this.options.pageClass);
            appendToFirst(this.pagesEl, this.element);
        }

        this.lineEl = this.element.getElementsByClassName(this.options.progressLineClass)[0];
        this.lineEl.style.width = `${speed}%`;
    }

    _uploadTemplate() {
        const wrapper = createDivEl({className: ['bar', 'bar-progress']});
        const img = createDivEl({element: 'img', className: 'progress-img'});
        img.setAttribute('src', this.imgURL);
        wrapper.appendChild(img);

        const title = createDivEl({element: 'p', className: 'progress-title', content: LANG.LIVE_RECORD.UploadTitle});
        const progress = createDivEl({className: this.options.progressLineClass});
        wrapper.appendChild(title);
        wrapper.appendChild(progress);

        return wrapper;
    }
}