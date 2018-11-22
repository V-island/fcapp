import Picker from '../picker';
import DateTimePicker from 'pickerjs';
import {
    body
} from '../intro';
import {
    getLangConfig,
    setLangConfig
} from '../lang';
import {
    extend,
    addEvent,
    getData,
    setData,
    hasClass,
    addClass,
    refreshURL,
    removeClass,
    showHideDom,
    createDivEl,
    animationEnd,
    getLocalStorage,
    setLocalStorage
} from '../util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
const COUNTRY_NAME = 'COUNTRY';

const LANG = getLangConfig();

const Options = {
    removeNOClose: 'remove-on-close',
    modalOverlayClass: 'modal-overlay',
    popupOverlayClass: 'popup-overlay',
    modalVisibleClass: 'modal-overlay-visible',
    pickerModalClass: 'with-picker-modal',
    pickerClosingClass: 'picker-modal-closing',
    modalTopClass: 'topping',
    modalOutClass: 'modal-out',
    modalInClass: 'modal-in'
}

const Defaults = {
    modalStack: true,
    modalCloseByOutside: true,
    actionsCloseByOutside: true,
    popupCloseByOutside: false,
    modalTitle: LANG.PUBLIC.ModalTitle,
    modalAlertButton: LANG.PUBLIC.modalAlertButton,
    modalButtonOk: LANG.PUBLIC.ModalButtonOk,
    modalButtonCancel: LANG.PUBLIC.ModalButtonCancel,
    confirmButtonOk: LANG.PUBLIC.ConfirmButtonOk,
    confirmButtonCancel: LANG.PUBLIC.ConfirmButtonCancel,
    modalPreloaderTitle: LANG.PUBLIC.modalPreloaderTitle
};

const openModal = ({modal, top, callback}) => {
    let isModal = hasClass(modal, 'modal'),
        isToast = hasClass(modal, 'toast'),
        isPopup = hasClass(modal, 'popup-modal'),
        isActions = hasClass(modal, 'actions-modal'),
        isPickerModal = hasClass(modal, 'picker-modal');
    let modalOverlayEl = body.getElementsByClassName(Options.modalOverlayClass);
    let popupOverlayEl = body.getElementsByClassName(Options.popupOverlayClass);
    let overlay,
        _modalOverlayEl,
        _popupOverlayEl;

    if (isModal) {
        showHideDom(modal, 'block');
        modal.style.marginTop = `-${modal.offsetHeight / 2}px`;
    }
    if (isToast) {
        modal.style.marginTop = `-${modal.offsetHeight / 2}px`;
        // modal.style.marginLeft = `-${modal.offsetWidth / 2}px`;
    }

    if (!isPickerModal && !isToast) {
        if (modalOverlayEl.length > 0) {
            _modalOverlayEl = modalOverlayEl[0];
        }
        if (popupOverlayEl.length > 0) {
            _popupOverlayEl = popupOverlayEl[0];
        }
        if (modalOverlayEl.length === 0 && !isPopup  && !top) {
            _modalOverlayEl = createDivEl({className: Options.modalOverlayClass});
            addEvent(_modalOverlayEl, 'click', () => {
                closeModal();
            });
            body.appendChild(_modalOverlayEl);
        }
        if (popupOverlayEl.length === 0 && isPopup && !top) {
            _popupOverlayEl = createDivEl({className: Options.popupOverlayClass});

            body.appendChild(_popupOverlayEl);
        }
        // if (top) {
        //     if (!isPopup) {
        //         addClass(_modalOverlayEl, Options.modalTopClass);
        //     }
        //     if (isPopup) {
        //         addClass(_popupOverlayEl, Options.modalTopClass);
        //     }
        // }
        overlay = isPopup ? _popupOverlayEl : _modalOverlayEl;
        addClass(overlay, Options.modalVisibleClass);
    }

    // Picker modal body class
    if (isPickerModal) {
        addClass(body, Options.pickerModalClass);
    }

    removeClass(modal, Options.modalOutClass);
    addClass(modal, Options.modalInClass);

    if (callback) callback();
    return true;
}

export const closeModal = (modal) => {
    const modalGroup = body.querySelectorAll(`.modal`);
    if (typeof modal == 'undefined') {
        modal = body.querySelector(`.${Options.modalInClass}`);
    }

    let modalOverlayEl = body.getElementsByClassName(Options.modalOverlayClass)[0];
    let popupOverlayEl = body.getElementsByClassName(Options.popupOverlayClass)[0];
    let isModal = hasClass(modal, 'modal'),
        isToast = hasClass(modal, 'toast'),
        isPopup = hasClass(modal, 'popup-modal'),
        isActions = hasClass(modal, 'actions-modal'),
        isPickerModal = hasClass(modal, 'picker-modal'),
        removeOnClose = hasClass(modal, Options.removeNOClose),
        overlay = isPopup ? popupOverlayEl : modalOverlayEl;

    if (isPopup || isToast || isPickerModal || isActions){
        removeClass(overlay, Options.modalVisibleClass);
    }else {
        if (modalGroup.length === 1) {
            removeClass(overlay, Options.modalVisibleClass);
        }
    }

    // Picker modal body class
    if (isPickerModal) {
        removeClass(body, Options.pickerModalClass);
        addClass(body, Options.pickerClosingClass);
    }

    removeClass(modal, Options.modalInClass);
    addClass(modal, Options.modalOutClass);
    animationEnd(modal, () => {
        showHideDom(modal, 'none');
        if (isPickerModal) {
            removeClass(body, Options.pickerClosingClass);
        }
        body.removeChild(modal);
    });
    return true;
}

// 选择表
export const options = ({lists, callback}) => {
    const modal = createDivEl({className: 'modal'});

    // list
    const modalList = createDivEl({element: 'ul', className: ['list', 'modal-list']});
    lists.forEach((data, index) => {
        let item = createDivEl({element: 'li', className: 'list-item', content: data.title});
        addEvent(item, 'click', () => {
            if (callback) callback(data.value, data.title);
        });
        modalList.appendChild(item);
    });
    modal.appendChild(modalList);
    body.appendChild(modal);

    openModal({modal});
    return modal;
}

// 警告框
export const alert = ({title, text, button, callback}) => {
    const modal = createDivEl({className: 'modal'});
    title = title ? title : Defaults.modalAlertButton;
    // header
    if (title) {
        const modalHeader = createDivEl({className: 'modal-header'});
        const modalTitle = createDivEl({className: 'modal-title', content: title});
        modalHeader.appendChild(modalTitle);

        const modalClose = createDivEl({className: 'modal-close'});
        const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
        modalClose.appendChild(modalCloseIcon);
        modalHeader.appendChild(modalClose);
        modal.appendChild(modalHeader);
        addEvent(modalClose, 'click', () => {
            closeModal(modal);
        });
    }

    // content
    const modalContent = createDivEl({className: 'modal-content'});
    const modalText = createDivEl({className: 'modal-text', content: text});
    modalContent.appendChild(modalText);
    modal.appendChild(modalContent);

    // footer
    const modalFooter = createDivEl({className: ['modal-footer', 'buttons']});
    const buttonOk = createDivEl({className: ['button', 'button-primary', 'button-block'], content: button ? button : Defaults.modalAlertButton});
    addEvent(buttonOk, 'click', () => {
        closeModal(modal);
        if (callback) callback();
    });
    modalFooter.appendChild(buttonOk);
    modal.appendChild(modalFooter);
    body.appendChild(modal);

    openModal({modal});
    return modal;
}

// 对话框
export const confirm = ({title, text, top, button, callback, callbackCancel}) => {
    const modal = createDivEl({className: 'modal'});
    title = title ? title : Defaults.modalTitle;

    if (top) {
        addClass(modal, Options.modalTopClass);
    }
    // header
    if (title) {
        const modalHeader = createDivEl({className: 'modal-header'});
        const modalTitle = createDivEl({className: 'modal-title', content: title});
        modalHeader.appendChild(modalTitle);

        const modalClose = createDivEl({className: 'modal-close'});
        const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
        modalClose.appendChild(modalCloseIcon);
        modalHeader.appendChild(modalClose);
        modal.appendChild(modalHeader);
        addEvent(modalClose, 'click', () => {
            closeModal(modal);
        });
    }

    // content
    const modalContent = createDivEl({className: 'modal-content'});
    const modalText = createDivEl({className: 'modal-text', content: text});
    modalContent.appendChild(modalText);
    modal.appendChild(modalContent);

    // footer
    const modalFooter = createDivEl({className: ['modal-footer', 'buttons']});
    const buttonNo = createDivEl({className: ['button', 'fill-primary'], content: button ? Defaults.confirmButtonCancel : Defaults.modalButtonCancel});
    addEvent(buttonNo, 'click', () => {
        closeModal(modal);
        if (callbackCancel) callbackCancel();
    });
    modalFooter.appendChild(buttonNo);

    const buttonYes = createDivEl({className: ['button', 'button-primary'], content: button ? Defaults.confirmButtonOk : Defaults.modalButtonOk});
    addEvent(buttonYes, 'click', () => {
        closeModal(modal);
        if (callback) callback();
    });
    modalFooter.appendChild(buttonYes);
    modal.appendChild(modalFooter);
    body.appendChild(modal);

    openModal({modal, top});
    return modal;
}

// 可进行输入的对话框
export const prompt = ({title, text, button, callback, callbackCancel}) => {
    const modal = createDivEl({className: 'modal'});

    // header
    if (title) {
        const modalHeader = createDivEl({className: 'modal-header'});
        const modalTitle = createDivEl({className: 'modal-title', content: title});
        modalHeader.appendChild(modalTitle);

        const modalClose = createDivEl({className: 'modal-close'});
        const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
        modalClose.appendChild(modalCloseIcon);
        modalHeader.appendChild(modalClose);
        modal.appendChild(modalHeader);
        addEvent(modalClose, 'click', () => {
            closeModal(modal);
        });
    }

    // inner
    const modalInner = createDivEl({className: 'modal-inner'});
    const modalInput = createDivEl({element: 'input', className: 'modal-text-input'});
    modalInput.setAttribute("type", "text");
    modalInput.setAttribute("placeholder", text);
    modalInner.appendChild(modalInput);
    modal.appendChild(modalInner);

    // footer
    const modalFooter = createDivEl({className: ['modal-footer', 'buttons']});
    const buttonNo = createDivEl({className: ['button', 'fill-primary'], content: button ? Defaults.confirmButtonCancel : Defaults.modalButtonCancel});
    addEvent(buttonNo, 'click', () => {
        closeModal(modal);
        if (callbackCancel) callbackCancel();
    });
    modalFooter.appendChild(buttonNo);

    const buttonYes = createDivEl({className: ['button', 'button-primary'], content: button ? Defaults.confirmButtonOk : Defaults.modalButtonOk});
    addEvent(buttonYes, 'click', () => {
        closeModal(modal);
        if (callback) callback(modalInput.value);
    });
    modalFooter.appendChild(buttonYes);
    modal.appendChild(modalFooter);
    body.appendChild(modal);

    openModal({modal});
    return modal;
}

// 显示一个消息，会在2秒钟后自动消失
export const toast = ({text, duration, extraclass}) => {
    const modal = createDivEl({className: ['modal', 'toast'], content: text});
    if (extraclass) {
        addClass(modal, extraclass);
    }
    body.appendChild(modal);

    const callback = () => {
        setTimeout(() => {
            closeModal(modal);
        }, duration || 2000);
    }
    openModal({modal, callback});
    return modal;
}

// 弹出局部层
export const popupPart = ({element, title, themecalss, footer, cancelIcon, callback}) => {
    const modal = createDivEl({className: 'actions-modal'});

    if (themecalss) {
        addClass(modal, themecalss);
    }

    // header
    if (title) {
        const modalHeader = createDivEl({className: 'modal-header'});
        const modalTitle = createDivEl({className: 'modal-title', content: title});
        modalHeader.appendChild(modalTitle);

        const modalClose = createDivEl({className: 'modal-close'});
        const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
        modalClose.appendChild(modalCloseIcon);
        modalHeader.appendChild(modalClose);
        modal.appendChild(modalHeader);
        addEvent(modalClose, 'click', () => {
            closeModal(modal);
        });
    }

    // content
    const modalContent = createDivEl({className: 'modal-content'});
    modalContent.appendChild(element);
    modal.appendChild(modalContent);

    // footer
    if (footer) {
        let ButtonCancel = null;
        const modalFooter = createDivEl({className: 'modal-footer'});
        if (cancelIcon) {
            ButtonCancel = createDivEl({className: 'actions-button-cancel'});
            const ButtonCancelIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
            ButtonCancel.appendChild(ButtonCancelIcon);
            modalFooter.appendChild(ButtonCancel);
        }else {
            ButtonCancel = createDivEl({className: 'actions-button-cancel', content: `${footer ? footer : LANG.PUBLIC.ConfirmButtonCancel}`});
            modalFooter.appendChild(ButtonCancel);
        }
        addEvent(ButtonCancel, 'click', () => {
            closeModal(modal);
        });
        modal.appendChild(modalFooter);
    }

    body.appendChild(modal);

    openModal({modal, callback});
    return modal;
}

// 弹出整层
export const popup = ({element, top, title, extraclass, notBack, notPadding, cancelIcon}) => {
    const modal = createDivEl({className: 'popup-modal'});

    if (extraclass) {
        addClass(modal, extraclass);
    }

    if (top) {
        addClass(modal, Options.modalTopClass);
    }
    // header
    if (title) {
        const header = createDivEl({element: 'header', className: ['bar', 'bar-flex']});

        if (!notBack) {
            const btn = createDivEl({className: 'icon-btn'});
            const btnIcon = createDivEl({element: 'i', className: ['icon', 'icon-arrow-back']});
            btn.appendChild(btnIcon);
            addEvent(btn, 'click', () => {
                closeModal(modal);
                if (cancelIcon) cancelIcon(content);
            });
            header.appendChild(btn);
        }

        const Title = createDivEl({element: 'h1', className: 'title', content: title});
        header.appendChild(Title);
        modal.appendChild(header);
    }

    // content
    const content = createDivEl({className: 'content'});

    if (!notPadding) addClass(content, 'popup-content');

    content.appendChild(element);
    modal.appendChild(content);
    body.appendChild(modal);

    openModal({modal, top});
    return modal;
}

// 弹框滑动选择 为二位数组，如[lists1, lists2, lists3]
export const pickers = ({title, data, callback}) => {
    let picker = new Picker({
        data: [data],
        title: title,
        valueEqualText: true,
        buttons: [{
            text: Defaults.confirmButtonCancel,
            fill: true,
        }, {
            text: Defaults.confirmButtonOk
        }]
    });
    picker.show();
    picker.on('picker.valuechange', (selectedVal, selectedText, selectedIndex) => {
        closeModal(picker.modalEl);
        if (callback) callback(selectedVal[0], selectedText[0], selectedIndex[0]);
    });
    picker.on('picker.cancel', () => {
        closeModal(picker.modalEl);
    });

    openModal({
        modal: picker.modalEl
    });
    return picker.modalEl;
}

// 日期时间选择器
export const timePicker = ({title, params, button, callback, callbackCancel}) => {
    const modal = createDivEl({className: 'modal'});
    title = title ? title : Defaults.modalTitle;

    let options = {
        inline: true,
        format: 'YYYY-MM-DD',
        rows: 3
    };
    extend(options, params);

    // header
    if (title) {
        const modalHeader = createDivEl({className: 'modal-header'});
        const modalTitle = createDivEl({className: 'modal-title', content: title});
        modalHeader.appendChild(modalTitle);

        const modalClose = createDivEl({className: 'modal-close'});
        const modalCloseIcon = createDivEl({element: 'i', className: ['icon', 'modals-close']});
        modalClose.appendChild(modalCloseIcon);
        modalHeader.appendChild(modalClose);
        modal.appendChild(modalHeader);
        addEvent(modalClose, 'click', () => {
            closeModal(modal);
        });
    }

    // content
    const modalContent = createDivEl({className: 'modal-content'});
    const modalPicker = createDivEl({className: 'data-time-picker'});
    const picker = new DateTimePicker(modalPicker, options);

    modalContent.appendChild(modalPicker);
    modal.appendChild(modalContent);

    // footer
    const modalFooter = createDivEl({className: ['modal-footer', 'buttons']});
    const buttonNo = createDivEl({className: ['button', 'fill-primary'], content: button ? Defaults.modalButtonCancel : Defaults.confirmButtonCancel});
    addEvent(buttonNo, 'click', () => {
        closeModal(modal);
        if (callbackCancel) callbackCancel(picker.getDate(options.format));
    });
    modalFooter.appendChild(buttonNo);

    const buttonYes = createDivEl({className: ['button', 'button-primary'], content: button ? Defaults.modalButtonOk : Defaults.confirmButtonOk});
    addEvent(buttonYes, 'click', () => {
        closeModal(modal);
        if (callback) callback(picker.getDate(options.format));
    });
    modalFooter.appendChild(buttonYes);
    modal.appendChild(modalFooter);
    body.appendChild(modal);

    openModal({modal});
    return modal;
}

// 视频预览
export const videoPreview = ({videoUrl}) => {
    const wrapper = createDivEl({className: 'record-wrapper'});

    const livesVideo = createDivEl({className: 'lives-video'});
    const video = createDivEl({element: 'video', id: 'video', className: 'video'});

    video.setAttribute('controls', 'controls');
    video.setAttribute('autoplay', 'autoplay');
    video.setAttribute('preload', 'auto');
    // 使用h5播放器，默认打开网页的时候，会自动全屏
    video.setAttribute('webkit-playsinline', true);
    video.setAttribute('playsinline', true);
    video.setAttribute('x5-playsinline', true);
    video.setAttribute('x-webkit-airplay', 'allow');

    // 启用Ｈ5同层播放器
    video.setAttribute('x5-video-player-type', 'h5');
    video.setAttribute('x5-video-player-fullscreen', true);
    // 控制横竖屏  可选值： landscape 横屏, portraint竖屏
    video.setAttribute('x5-video-orientation', 'landscape|portrait');

    const source = createDivEl({element: 'source', id: 'video', className: 'video'});
    source.setAttribute('type', 'video/mp4');
    source.src = videoUrl;

    video.appendChild(source);
    livesVideo.appendChild(video);
    wrapper.appendChild(livesVideo);

    const content = createDivEl({className: 'record-content'});
    const livesHeader = createDivEl({className: 'lives-header'});
    const closeIcon = createDivEl({element: 'i', className: ['icon', 'live-close']});
    livesHeader.appendChild(closeIcon);
    content.appendChild(livesHeader);
    wrapper.appendChild(content);

    const modal = popup({element: wrapper});

    addEvent(closeIcon, 'click', () => {
        closeModal(modal);
    });
    return modal;
}

// 国家语言选择
export const country = ({countryId, top, title, cancelIcon}) => {
    const params = getLocalStorage(COUNTRY_NAME);
    const wrapper = createDivEl({className: 'country-wrapper'});

    const list = createDivEl({element: 'ul', className: ['list', 'list-info', 'popup-list', 'no-bg']});

    params.forEach((data, index) => {
        const {id, language_id, language_code, country_name} = data;
        let item = createDivEl({element: 'li', className: 'list-item'});
        let text = createDivEl({element: 'span', className: 'list-item-text', content: country_name});
        let meta = createDivEl({element: 'span', className: ['icon', 'user-checkbox', 'list-item-meta']});
        item.appendChild(text);
        item.appendChild(meta);

        if (countryId == data.id) {
            addClass(item, 'active');
        }

        addEvent(item, 'click', () => {
            setLangConfig(language_code).then((result) => {
                setLocalStorage(COUNTRY_ID_NAME, {
                    id: id,
                    langId: language_id,
                    gain: false
                });
                refreshURL();
            });
        });
        list.appendChild(item);
    });
    wrapper.appendChild(list);

    const modal = popup({
        element: wrapper,
        title: LANG.PUBLIC.Country
    });
    return modal;
}

// 多选弹框
export const checkbox = ({data, title, text, nameValue, nameText, filterName, filterIndex, selectData, selected, top, callbackOk}) => {
    const wrapper = createDivEl({className: 'country-wrapper'});
    const header = createDivEl({element: 'p', className: 'popup-text', content: text.replace(/%S/, selected)});
    wrapper.appendChild(header);

    const list = createDivEl({element: 'ul', className: ['list', 'list-info', 'popup-list', 'no-bg']});

    data.forEach((itemData, index) => {
        if (filterName && itemData[filterName] != filterIndex) return;

        let item = createDivEl({element: 'li', className: 'list-item'});
        let text = createDivEl({element: 'span', className: 'list-item-text', content: itemData[nameText]});
        let meta = createDivEl({element: 'span', className: ['icon', 'user-checkbox', 'list-item-meta']});
        item.appendChild(text);
        item.appendChild(meta);
        setData(item, 'val', itemData[nameValue]);
        setData(item, 'text', itemData[nameText]);

        addEvent(item, 'click', () => {
            const activeEl = list.querySelectorAll('.active');
            if (activeEl.length >= selected) return false;
            if (hasClass(item, 'active')) return removeClass(item, 'active');
            addClass(item, 'active');
        });

        selectData = selectData ? selectData : [];
        if (selectData) {
            selectData.forEach(selectItem => {
                if (itemData[nameValue] == selectItem[nameValue]) addClass(item, 'active');
            });
        }

        list.appendChild(item);
    });
    wrapper.appendChild(list);

    const modal = popup({
        element: wrapper,
        title: title,
        cancelIcon: () => {
            const activeEl = list.querySelectorAll('.active');
            let value = [],
                text = [];

            Array.prototype.slice.call(activeEl).forEach(itemEl => {
                value.push(setData(itemEl, 'val'));
                text.push(setData(itemEl, 'text'));
            });
            if (callbackOk) callbackOk(value, text);
        }
    });
    return modal;
}