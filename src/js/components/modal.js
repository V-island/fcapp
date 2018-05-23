require('../adapter');

let Modal = {
	defaults: {
		modalStack: true,
		modalButtonOk: 'BUY NOW',
		modalButtonCancel: '取消',
		modalPreloaderTitle: '加载中',
		modalContainer: document.body ? document.body : 'body'
	},
	modalStack: [],

	/**
	 * 模态堆栈清除队列
	 * @return {[type]} [description]
	 */
	modalStackClearQueue: function() {
	    if (this.modalStack.length) {
	        (this.modalStack.shift())();
	    }
	},

	/**
	 * 创建modal
	 * @param  {[object]} params [description]
	 * @return {[type]}        [description]
	 */
	modal: function(params) {
		params = params || {};
		let modalHTML = '';
		let buttonsHTML = '';
		if (params.buttons && params.buttons.length > 0) {
			for (let i = 0; i < params.buttons.length; i++) {
				buttonsHTML += '<span class="modal-button' + (params.buttons[i].bold ? ' modal-button-bold' : '') + '" data-ripple>' + params.buttons[i].text + '</span>';
			}
		}
		let extraClass = params.extraClass || '';

		let titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
		let closeHTML = params.closeBtn ? '<a href="javascript: void(0)" class="modal-close"><i class="ion ion-md-close"></i></a>' : '';
		let textHTML = params.text ? '<div class="modal-text">' + params.text + '</div>' : '';
		let afterTextHTML = params.afterText ? params.afterText : '';

		let noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
		let verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
		modalHTML = '<div class="modal ' + extraClass + ' ' + noButtons + '"><div class="modal-header">' + (titleHTML + closeHTML) + '</div><div class="modal-inner">' + (textHTML + afterTextHTML) + '</div><div class="modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';

		let _modalTemplateTempDiv = document.createElement('div');
		_modalTemplateTempDiv.innerHTML = modalHTML;

		let modal = $(_modalTemplateTempDiv).children();

		$(this.defaults.modalContainer).append(modal[0]);

		// Add events on buttons
		modal.find('.modal-button').each(function(index, el) {
			$(el).on('click', function(e) {
				if (params.buttons[index].close !== false) Modal.closeModal(modal);
				if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
				if (params.onClick) params.onClick(modal, index);
			});
		});
		modal.find('.modal-close').on('click', function(e) {
			Modal.closeModal(modal);
		});
		this.openModal(modal);
		return modal[0];
	},

	/**
	 * 警告框
	 * @param  {[string]} text       内容文字
	 * @param  {[string]} title      标题文字
	 * @param  {[function]} callbackOk 通过事件
	 * @return {[object]}            params
	 */
	alert: function(text, title, callbackOk) {
		if (typeof title === 'function') {
			callbackOk = arguments[1];
			title = undefined;
		}
		return this.modal({
			text: text || '',
			title: typeof title === 'undefined' ? this.defaults.modalTitle : title,
			closeBtn: true,
			buttons: [{
				text: this.defaults.modalButtonOk,
				bold: true,
				onClick: callbackOk
			}]
		});
	},

	/**
	 * 对话框
	 * @param  {[string]} text           内容文字
	 * @param  {[string]} title          标题文字
	 * @param  {[function]} callbackOk     通过事件
	 * @param  {[function]} callbackCancel 取消事件
	 * @return {[object]}                params
	 */
	confirm: function (text, title, callbackOk, callbackCancel) {
	    if (typeof title === 'function') {
	        callbackCancel = arguments[2];
	        callbackOk = arguments[1];
	        title = undefined;
	    }
	    return this.modal({
	        text: text || '',
	        title: typeof title === 'undefined' ? defaults.modalTitle : title,
	        buttons: [
	            {text: defaults.modalButtonCancel, onClick: callbackCancel},
	            {text: defaults.modalButtonOk, bold: true, onClick: callbackOk}
	        ]
	    });
	},

	/**
	 * 可进行输入的对话框
	 * @param  {[string]} text           内容文字
	 * @param  {[string]} title          标题文字
	 * @param  {[function]} callbackOk     通过事件
	 * @param  {[function]} callbackCancel 取消事件
	 * @return {[object]}                params
	 */
	prompt: function (text, title, callbackOk, callbackCancel) {
	    if (typeof title === 'function') {
	        callbackCancel = arguments[2];
	        callbackOk = arguments[1];
	        title = undefined;
	    }
	    return this.modal({
	        text: text || '',
	        title: typeof title === 'undefined' ? defaults.modalTitle : title,
	        afterText: '<input type="text" class="modal-text-input">',
	        buttons: [
	            {
	                text: defaults.modalButtonCancel
	            },
	            {
	                text: defaults.modalButtonOk,
	                bold: true
	            }
	        ],
	        onClick: function (modal, index) {
	            if (index === 0 && callbackCancel) callbackCancel($(modal).find('.modal-text-input').val());
	            if (index === 1 && callbackOk) callbackOk($(modal).find('.modal-text-input').val());
	        }
	    });
	},

	/**
	 * //显示一个消息，会在2秒钟后自动消失
	 * @param  {[string]} msg        [description]
	 * @param  {[type]} duration   [description]
	 * @param  {[type]} extraclass [description]
	 * @return {[type]}            [description]
	 */
	toast: function(msg, duration, extraclass) {
	    let $toast = $('<div class="modal toast ' + (extraclass || '') + '">' + msg + '</div>').appendTo(document.body);
	    let _this = this;
	    _this.openModal($toast, function(){
	        setTimeout(function() {
	            _this.closeModal($toast);
	        }, duration || 2000);
	    });
	},

	/**
	 * 弹出
	 * @param  {[string]} modal         [description]
	 * @param  {[type]} removeOnClose [description]
	 * @return {[type]}               [description]
	 */
	popup: function (modal, removeOnClose) {
		let _this = this;

        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            let _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                if (removeOnClose) modal.classList.add('remove-on-close');
                $(defaults.modalContainer).append(modal);
            }
            else return false; //nothing found
        }
        modal = $(modal);
        if (modal.length === 0) return false;
        modal.show();
        modal.find(".content").scroller("refresh");
        if (modal.find('.' + _this.defaults.viewClass).length > 0) {
            $.sizeNavbars(modal.find('.' + _this.defaults.viewClass)[0]);
        }
        _this.openModal(modal);

        return modal[0];
    },

    /**
     * 操作表
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    actions: function (params) {
        var modal, groupSelector, buttonSelector;
        params = params || [];

        if (params.length > 0 && !$.isArray(params[0])) {
            params = [params];
        }
        var modalHTML;
        var buttonsHTML = '';
        for (var i = 0; i < params.length; i++) {
            for (var j = 0; j < params[i].length; j++) {
                if (j === 0) buttonsHTML += '<div class="actions-modal-group">';
                var button = params[i][j];
                var buttonClass = button.label ? 'actions-modal-label' : 'actions-modal-button';
                if (button.bold) buttonClass += ' actions-modal-button-bold';
                if (button.color) buttonClass += ' color-' + button.color;
                if (button.bg) buttonClass += ' bg-' + button.bg;
                if (button.disabled) buttonClass += ' disabled';
                buttonsHTML += '<span class="' + buttonClass + '">' + button.text + '</span>';
                if (j === params[i].length - 1) buttonsHTML += '</div>';
            }
        }
        modalHTML = '<div class="actions-modal">' + buttonsHTML + '</div>';
        _modalTemplateTempDiv.innerHTML = modalHTML;
        modal = $(_modalTemplateTempDiv).children();
        $(defaults.modalContainer).append(modal[0]);
        groupSelector = '.actions-modal-group';
        buttonSelector = '.actions-modal-button';

        var groups = modal.find(groupSelector);
        groups.each(function (index, el) {
            var groupIndex = index;
            $(el).children().each(function (index, el) {
                var buttonIndex = index;
                var buttonParams = params[groupIndex][buttonIndex];
                var clickTarget;
                if ($(el).is(buttonSelector)) clickTarget = $(el);
                // if (toPopover && $(el).find(buttonSelector).length > 0) clickTarget = $(el).find(buttonSelector);

                if (clickTarget) {
                    clickTarget.on('click', function (e) {
                        if (buttonParams.close !== false) $.closeModal(modal);
                        if (buttonParams.onClick) buttonParams.onClick(modal, e);
                    });
                }
            });
        });
        $.openModal(modal);
        return modal[0];
    },

	/**
	 * 打开弹框
	 * @param  {[type]}   modal [description]
	 * @param  {Function} cb    [description]
	 * @return {[type]}         [description]
	 */
	openModal: function (modal, cb) {
	    modal = $(modal);
	    let _this = this;
	    let isModal = modal.hasClass('modal'),
	        isNotToast = !modal.hasClass('toast');
	    if ($('.modal.modal-in:not(.modal-out)').length && _this.defaults.modalStack && isModal && isNotToast) {
	        _this.modalStack.push(function () {
	            _this.openModal(modal, cb);
	        });
	        return;
	    }
	    let isPopup = modal.hasClass('popup');
	    let isLoginScreen = modal.hasClass('login-screen');
	    let isPickerModal = modal.hasClass('picker-modal');
	    let isToast = modal.hasClass('toast');
	    if (isModal) {
	        modal.show();
	        modal.css({
	            marginTop: - Math.round(modal.outerHeight() / 2) + 'px'
	        });
	    }
	    if (isToast) {
	        modal.css({
	            marginLeft: - Math.round(modal.outerWidth() / 2 / 1.185) + 'px' //1.185 是初始化时候的放大效果
	        });
	    }

	    let overlay;
	    if (!isLoginScreen && !isPickerModal && !isToast) {
	        if ($('.modal-overlay').length === 0 && !isPopup) {
	            $(_this.defaults.modalContainer).append('<div class="modal-overlay"></div>');
	        }
	        if ($('.popup-overlay').length === 0 && isPopup) {
	            $(_this.defaults.modalContainer).append('<div class="popup-overlay"></div>');
	        }
	        overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
	    }

	    //Make sure that styles are applied, trigger relayout;
	    let clientLeft = modal[0].clientLeft;

	    // Trugger open event
	    modal.trigger('open');

	    // Picker modal body class
	    if (isPickerModal) {
	        $(_this.defaults.modalContainer).addClass('with-picker-modal');
	    }

	    // Classes for transition in
	    if (!isLoginScreen && !isPickerModal && !isToast) overlay.addClass('modal-overlay-visible');
	    modal.removeClass('modal-out').addClass('modal-in').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');
        });
	    // excute callback
	    if (typeof cb === 'function') {
	      cb.call(this);
	    }

	    $(document).on('click', ' .modal-overlay, .popup-overlay, .close-popup, .open-popup, .close-picker', _this.handleClicks);
	    return true;
	},

	/**
	 * 关闭
	 * @param  {[type]} modal [description]
	 * @return {[type]}       [description]
	 */
	closeModal: function (modal) {
	    modal = $(modal || '.modal-in');
	    let _this = this;
	    if (typeof modal !== 'undefined' && modal.length === 0) {
	        return;
	    }
	    let isModal = modal.hasClass('modal'),
	        isPopup = modal.hasClass('popup'),
	        isToast = modal.hasClass('toast'),
	        isLoginScreen = modal.hasClass('login-screen'),
	        isPickerModal = modal.hasClass('picker-modal'),
	        removeOnClose = modal.hasClass('remove-on-close'),
	        overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
	    if (isPopup){
	        if (modal.length === $('.popup.modal-in').length) {
	            overlay.removeClass('modal-overlay-visible');
	        }
	    }
	    else if (!(isPickerModal || isToast)) {
	        overlay.removeClass('modal-overlay-visible');
	    }

	    modal.trigger('close');

	    // Picker modal body class
	    if (isPickerModal) {
	        $(_this.defaults.modalContainer).removeClass('with-picker-modal');
	        $(_this.defaults.modalContainer).addClass('picker-modal-closing');
	    }

	    modal.removeClass('modal-in').addClass('modal-out').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');

            if (isPickerModal) {
                $(defaults.modalContainer).removeClass('picker-modal-closing');
            }
            if (isPopup || isLoginScreen || isPickerModal) {
                modal.removeClass('modal-out').hide();
                if (removeOnClose && modal.length > 0) {
                    modal.remove();
                }
            }
            else {
                modal.remove();
            }
        });
	    if (isModal &&  _this.defaults.modalStack ) {
	        _this.modalStackClearQueue();
	    }

	    return true;
	},

	handleClicks: function(e) {
	    /*jshint validthis:true */
	    let clicked = $(this);
	    let url = clicked.attr('href');
	   	let _this = this;

	    //Collect Clicked data- attributes
	    let clickedData = clicked.dataset();

	    // Popup
	    let popup;
	    if (clicked.hasClass('open-popup')) {
	        if (clickedData.popup) {
	            popup = clickedData.popup;
	        }
	        else popup = '.popup';
	        _this.popup(popup);
	    }
	    if (clicked.hasClass('close-popup')) {
	        if (clickedData.popup) {
	            popup = clickedData.popup;
	        }
	        else popup = '.popup.modal-in';
	        _this.closeModal(popup);
	    }

	    // Close Modal
	    if (clicked.hasClass('modal-overlay')) {
	        if ($('.modal.modal-in').length > 0 && _this.defaults.modalCloseByOutside)
	            _this.closeModal('.modal.modal-in');
	        if ($('.actions-modal.modal-in').length > 0 && _this.defaults.actionsCloseByOutside)
	            _this.closeModal('.actions-modal.modal-in');

	    }
	    if (clicked.hasClass('popup-overlay')) {
	        if ($('.popup.modal-in').length > 0 && _this.defaults.popupCloseByOutside)
	            _this.closeModal('.popup.modal-in');
	    }
	}
}
export default Modal;