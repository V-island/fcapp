import BScroll from 'better-scroll';
import EventEmitter from './eventEmitter';

import {
    extend,
    createDom,
    addClass,
    removeClass
} from './util';

export default class Picker extends EventEmitter {
    constructor(options) {
        super();

        this.options = {
            data: [],
            title: '',
            selectedIndex: null,
            closeBtn: true,
            wrapperClass: 'wheels-wrapper',
            pickerClass: 'wheels',
            confirmClass: 'btn-confirm',
            closeClass: 'btn-close',
            iconCloseClass: 'modal-close',
            scrollClass: 'wheels-scroll',
            itemClass: 'wheels-item',
            showClass: 'active'
        };

        extend(this.options, options);

        this.data = this.options.data;
        this.modalEl = createDom(this._pickerTemplate(this.options));

        document.body.append(this.modalEl);

        this.pickerEl = this.modalEl.getElementsByClassName(this.options.pickerClass);
        this.confirmEl = this.modalEl.getElementsByClassName(this.options.confirmClass)[0];
        this.cancelEl = this.modalEl.getElementsByClassName(this.options.closeClass)[0];
        this.closeEl = this.modalEl.getElementsByClassName(this.options.iconCloseClass)[0];
        this.scrollEl = this.modalEl.getElementsByClassName(this.options.itemClass);

        this._init();
    }

    _init() {
        this.selectedIndex = [];
        this.selectedVal = [];
        this.selectedText = [];
        if (this.options.selectedIndex) {
            this.selectedIndex = this.options.selectedIndex;
        } else {
            for (let i = 0; i < this.data.length; i++) {
                this.selectedIndex[i] = 0;
            }
        }

        this._bindEvent();
    }

    _bindEvent() {
        let _self = this;

        _self.modalEl.addEventListener('touchmove', function(e) {
            e.preventDefault();
        });

        _self.confirmEl.addEventListener('click', function() {
            _self.hide();

            let changed = false;
            for (let i = 0; i < _self.data.length; i++) {
                let index = _self.wheels[i].getSelectedIndex();
                _self.selectedIndex[i] = index;

                let value = null,
                    text = null;
                if (_self.data[i].length) {
                    value = _self.data[i][index].value;
                    text = _self.data[i][index].text;
                }
                if (_self.selectedVal[i] !== value) {
                    changed = true;
                }
                _self.selectedVal[i] = value;
                _self.selectedText[i] = text;
            }

            _self.trigger('picker.select', _self.selectedVal, _self.selectedIndex);

            if (changed) {
                _self.trigger('picker.valuechange', _self.selectedVal, _self.selectedText, _self.selectedIndex);
            }
        });

        _self.cancelEl.addEventListener('click', function() {
            _self.hide();
            _self.trigger('picker.cancel');
        });

        _self.closeEl.addEventListener('click', function() {
            _self.hide();
            _self.trigger('picker.cancel');
        });
    }

    _createWheel(pickerEl, i) {
        this.wheels[i] = new BScroll(pickerEl[i], {
            wheel: true,
            selectedIndex: this.selectedIndex[i],
            wheel: {
                selectedIndex: this.selectedIndex[i],
                /** 默认值就是下面配置的两个，为了展示二者的作用，这里再配置一下 */
                wheelWrapperClass: this.options.scrollClass,
                wheelItemClass: this.options.itemClass
            },
            probeType: 3
        });
        ((index) => {
            let showCls = this.options.showClass;

            this.wheels[index].on('beforeScrollStart', () => {
                let currentIndex = this.wheels[index].getSelectedIndex();
                removeClass(this.scrollEl[currentIndex], showCls);
            });
            this.wheels[index].on('scrollEnd', () => {
                let currentIndex = this.wheels[index].getSelectedIndex();
                if (this.selectedIndex[i] !== currentIndex) {
                    this.selectedIndex[i] = currentIndex;
                    addClass(this.scrollEl[currentIndex], showCls);
                    this.trigger('picker.change', index, currentIndex);
                }
            });
        })(i);
        return this.wheels[i];
    }

    _pickerTemplate(options) {
        options = options || {};
        let modalHTML = '';
        let buttonsHTML = '';
        let afterTextHTML = '';
        if (options.buttons && options.buttons.length > 0) {
            for (let i = 0; i < options.buttons.length; i++) {
                buttonsHTML += '<span class="modal-button ' + (options.buttons[i].fill ? 'modal-button-fill ' + options.closeClass : options.confirmClass) + '" data-ripple>' + options.buttons[i].text + '</span>';
            }
        }
        let titleHTML = options.title ? '<div class="modal-title">' + options.title + '</div>' : '';
        let closeHTML = options.closeBtn ? '<a href="javascript: void(0)" class="'+ options.iconCloseClass +'"><i class="ion ion-md-close"></i></a>' : '';
        options.data.forEach((_data, index) => {
            afterTextHTML += '<div class="'+ options.pickerClass +'"><ul class="'+ options.scrollClass +'">'+ this._itemTemplate(_data) +'</ul></div>';
        });
        modalHTML = '<div class="modal"><div class="modal-header">' + (titleHTML + closeHTML) + '</div><div class="modal-inner '+ options.wrapperClass +'">' + afterTextHTML + '</div><div class="modal-buttons">' + buttonsHTML + '</div></div>';
        return modalHTML;
    }

    _itemTemplate(data) {
        let html = '';
        data.forEach((_data, index) => {
            html += '<li class="'+ this.options.itemClass + ' ' + (index === 0 ? this.options.showClass : '') +'" data-val="'+ _data.value +'">'+ _data.text +'</li>';
        });
        return html;
    }

    /**
     * Picker.show()
     * 显示筛选器
     * @param  {Function} next 为筛选器显示后执行的回调函数
     * @return {[type]}        [description]
     */
    show(next) {
        window.setTimeout(() => {
            if (!this.wheels) {
                this.wheels = [];
                for (let i = 0; i < this.data.length; i++) {
                    this._createWheel(this.pickerEl, i);
                }
            } else {
                for (let i = 0; i < this.data.length; i++) {
                    this.wheels[i].enable();
                    this.wheels[i].wheelTo(this.selectedIndex[i]);
                }
            }
            next && next();
        }, 0);
    }

    /**
     * Picker.hide()
     * 隐藏筛选器，一般来说，筛选器内部已经实现了隐藏逻辑，不必主动调用。
     * @return {[type]} [description]
     */
    hide() {
        window.setTimeout(() => {
            for (let i = 0; i < this.data.length; i++) {
                this.wheels[i].disable();
            }
        }, 500);
    }

    /**
     * Picker.refillColumn()
     * 重填某一列的数据
     * @param  {[type]} index 为列序号
     * @param  {[type]} data  为数据数组
     * @return {[type]}       [description]
     */
    refillColumn(index, data) {
        let scrollEl = this.scrollEl[index];
        let wheel = this.wheels[index];
        if (scrollEl && wheel) {
            let oldData = this.data[index];
            this.data[index] = data;
            scrollEl.innerHTML = this._itemTemplate(data);

            let selectedIndex = wheel.getSelectedIndex();
            let dist = 0;
            if (oldData.length) {
                let oldValue = oldData[selectedIndex].value;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].value === oldValue) {
                        dist = i;
                        break;
                    }
                }
            }
            this.selectedIndex[index] = dist;
            wheel.refresh();
            wheel.wheelTo(dist);
            return dist;
        }
    }

    /**
     * Picker.refill()
     * 重填全部数据
     * @param  {[type]} datas 为二位数组，如[lists1, lists2, lists3]
     * @return {[type]}       [description]
     */
    refill(datas) {
        let ret = [];
        if (!datas.length) {
            return ret;
        }
        datas.forEach((data, index) => {
            ret[index] = this.refillColumn(index, data);
        });
        return ret;
    }

    /**
     * Picker.scrollColumn()
     * 复位某一列的默认选项
     * @param  {[type]} index 为列序号
     * @param  {[type]} dist  为选项的下标，起始值为0
     * @return {[type]}       [description]
     */
    scrollColumn(index, dist) {
        let wheel = this.wheels[index];
        wheel.wheelTo(dist);
    }
}

/**
 * picker.change
 * 当一列滚动停止的时候，会派发 picker.change 事件，同时会传递列序号 index 及滚动停止的位置 selectedIndex。
 */

/**
 * picker.select
 * 当用户点击确定的时候，会派发 picker.select 事件，同时会传递每列选择的值数组 selectedVal 和每列选择的序号数组 selectedIndex。
 */

/**
 * picker.cancel
 * 当用户点击取消的时候，会派发picker.cancel事件。
 */

/**
 * picker.valuechange
 * 当用户点击确定的时候，如果本次选择的数据和上一次不一致，会派发 picker.valuechange 事件，同时会传递每列选择的值数组 selectedVal 和每列选择的序号数组 selectedIndex。
 */