import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';

import {
    getLangConfig
} from '../lang';

import {
    sendVerificationCode,
    getFindPassword
} from '../api';

import {
    extend,
    createDom,
    isPoneAvailable,
    addCountdown
} from '../util';

const LANG = getLangConfig();
const modal = new Modal();

export default class FindPassWord extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);

	    this.FindPassWordEl = createDom(this._Template(element));

	    this._init(element);
	}

	_init(element) {
		this.FindPassWordEl = createDom(Template.render(element, LANG));

		setTimeout(() => {
			this.trigger('pageLoadStart', this.FindPassWordEl);
		}, 0);

		this._bindEvent();
	}

	_bindEvent() {
		let FormFindPassword = $('form.form-find-password', this.FindPassWordEl);
		let Group = $('.form-group', this.FindPassWordEl);

		// 选择国家
		Group.on('click', '.form-control.country', function() {
			let $self = $(this);
			let lang = $self.data('lang');
			modal.countryModal(lang);
		});

		// 输入状态
		Group.on('blur', '.form-control', function() {
			let $self = $(this);
			let $group = $self.parent();
			$group.removeClass('active');
		}).on('focus', '.form-control', function() {
			let $self = $(this);
			let $group = $self.parent();
			let $btnVer = $group.find('.btn-verification');

			$group.addClass('active');
			if ($btnVer.length > 0) {
				$btnVer.removeClass('disabled');
			}
		});

		// 发送验证码
		Group.on('click', '.btn-verification', function(e) {
			let $self = $(this);

			if ($self.hasClass('disabled')) {
				return e.preventDefault();
			}

			let $input = $self.siblings('input.form-control');
			let _value = $input.val();
			// isPoneAvailable(_value)；
			if (true) {
				sendVerificationCode(_value).then(() => {
					$self.addClass('disabled');
					addCountdown($self, 60);
				});
			}
		});

		// 明密文
		Group.on('click', 'i.btn-bright', function() {
			let $self = $(this);
			let $input = $self.siblings('input.form-control');

			if ($self.hasClass('icon-eye-black')) {
				$self.removeClass('icon-eye-black').addClass('icon-eye'); //密码可见
				$input.prop('type', 'text');
			} else {
				$self.removeClass('icon-eye').addClass('icon-eye-black'); //密码不可见
				$input.prop('type', 'password');
			};
		});

		// 表单提交
		FormFindPassword.submit(function(e) {
			let $self = $(this);
			// let $input = $(this).find('input.form-control');
			let _params = $self.serialize();

			getFindPassword(_params).then(() => {
				location.href = '#/login/set';
			});
			e.preventDefault();
		});
	}

	static attachTo(element, options) {
	    return new FindPassWord(element, options);
	}
}