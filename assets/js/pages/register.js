import Template from 'art-template/lib/template-web';
import EventEmitter from '../eventEmitter';
import Modal from '../modal';

import {
    getLangConfig
} from '../lang';

import {
    sendVerificationCode,
    getRegister
} from '../api';

import {
    extend,
    createDom,
    getLocalStorage,
    isPoneAvailable,
    addCountdown
} from '../util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
const LANG = getLangConfig();
const modal = new Modal();

export default class Register extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.options = {
    		data: []
        };

	    extend(this.options, options);;

	    this._init(element);

	}

	_init(element) {
		this.Country = getLocalStorage(COUNTRY_ID_NAME);

		this.RegisterEl = createDom(Template.render(element, LANG));
		setTimeout(() => {
			this.trigger('pageLoadStart', this.RegisterEl);
		}, 0);
		this._bindEvent();
	}

	_bindEvent() {
		let FormRegister = $('form.form-register', this.RegisterEl);
		let Group = $('.form-group', this.RegisterEl);
		let InputCountryId = $('input[name="country_id"]', FormRegister);

		if (InputCountryId.length > 0) {
			InputCountryId.val(this.Country.id);
		}
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
		FormRegister.submit(function(e) {
			let $self = $(this);
			// let $input = $(this).find('input.form-control');
			let _params = $self.serialize();
			getRegister(_params);
			e.preventDefault();
		});
	}

	static attachTo(element, options) {
	    return new Register(element, options);
	}
}