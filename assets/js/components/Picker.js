import BScroll from 'better-scroll';
import {
    extend,
    addEvent,
    createDivEl,
    getData,
    setData,
    addClass,
    removeClass
} from '../util';

export default class Picker {
    constructor(options) {

        this.options = {
            data: [],
            title: '',
            unit: '',
            selectedIndex: null,
            closeBtn: true,
            valueEqualText: false,
            wrapperClass: 'wheels-wrapper',
            lineClass: 'wheels-line',
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

        this.element = this.createElement(this.options);

        this.onClose = null;
        this.onSelect = null;
        this.onConfirm = null;
        this.onChange = null;

        this.init();
    }

    get price() {
        return this.data.livePrice ? this.data.livePrice : 0;
    }

    init() {
        this.pickerEl = this.element.getElementsByClassName(this.options.pickerClass);

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
        this.show();
    }

    createElement(options) {
        const modal = createDivEl({className: 'modal'});

        // header
        if (options.title) {
            const modalHeader = createDivEl({className: 'modal-header'});
            const modalTitle = createDivEl({className: 'modal-title', content: options.title});
            modalHeader.appendChild(modalTitle);

            const modalClose = createDivEl({className: 'modal-close'});
            const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
            modalClose.appendChild(modalCloseIcon);
            modalHeader.appendChild(modalClose);
            modal.appendChild(modalHeader);
            addEvent(modalClose, 'click', () => {
                this.hide();
                if (this.onClose) this.onClose();
            });
        }

        // content
        const modalContent = createDivEl({className: ['modal-content', options.wrapperClass]});
        this.data.forEach((List, index) => {
            let pickerContent = createDivEl({className: options.pickerClass});
            let listEl = createDivEl({element: 'ul', className: options.scrollClass});

            List.forEach((item, indexItem) => {
                const itemEl = createDivEl({element: 'li', className: options.itemClass, content: item.text});
                setData(itemEl, 'val', (options.valueEqualText ? item.text : item.value));
                if (indexItem === 0) {
                    addClass(itemEl, options.showClass);
                }
                listEl.appendChild(itemEl);
            });

            pickerContent.appendChild(listEl);
            modalContent.appendChild(pickerContent);
        });
        let lineContent = createDivEl({className: options.lineClass});
        let lineContentSpen = createDivEl({element: 'span', content: options.unit});
        lineContent.appendChild(lineContentSpen);
        modalContent.appendChild(lineContent);
        modal.appendChild(modalContent);

        // footer
        const modalFooter = createDivEl({className: ['modal-footer', 'buttons']});
        const buttonNo = createDivEl({className: ['button', 'fill-primary'], content: options.buttonCancel});
        addEvent(buttonNo, 'click', () => {
            this.hide();
            if (this.onClose) this.onClose();
        });
        modalFooter.appendChild(buttonNo);

        const buttonYes = createDivEl({className: ['button', 'button-primary'], content: options.buttonOk});
        addEvent(buttonYes, 'click', () => {
            this.hide();
            let changed = false;
            for (let i = 0; i < this.data.length; i++) {
                let index = this.wheels[i].getSelectedIndex();
                this.selectedIndex[i] = index;

                let value = null,
                    text = null;
                if (this.data[i].length) {
                    value = this.options.valueEqualText ? this.data[i][index].text : this.data[i][index].value;
                    text = this.data[i][index].text;
                }
                if (this.selectedVal[i] !== value) {
                    changed = true;
                }
                this.selectedVal[i] = value;
                this.selectedText[i] = text;
            }

            if (this.onSelect) this.onSelect(this.selectedVal, this.selectedIndex);

            if (changed) {
                if (this.onConfirm) this.onConfirm(this.selectedVal, this.selectedText, this.selectedIndex);
            }
        });
        modalFooter.appendChild(buttonYes);
        modal.appendChild(modalFooter);

        addEvent(modal, 'touchmove', (e) => {
            e.preventDefault();
        });
        return modal;
    }

    createWheel(pickerEl, i) {
        const scrollEl = pickerEl[i].getElementsByClassName(this.options.itemClass);

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
                removeClass(scrollEl[currentIndex], showCls);
            });
            this.wheels[index].on('scrollEnd', () => {
                let currentIndex = this.wheels[index].getSelectedIndex();
                if (this.selectedIndex[i] !== currentIndex) {
                    this.selectedIndex[i] = currentIndex;
                    addClass(scrollEl[currentIndex], showCls);
                    if (this.onChange) this.onChange(index, currentIndex);
                }
            });
        })(i);
        return this.wheels[i];
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
                    this.createWheel(this.pickerEl, i);
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