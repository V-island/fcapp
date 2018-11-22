import zh_CN from '../../lang/zh_CN.json';

const LANG_NAME = 'LANG';
localStorage.setItem(LANG_NAME, JSON.stringify(zh_CN));

import { closeModal, alert, popup } from '../components/Modal';
import Form from '../forms';
import {
	getLogin,
	updatePassword,
	findAllCountry,
} from '../api';
import {
    extend,
    setData,
    getData,
    hasClass,
    addClass,
    removeClass,
    createDivEl,
    addEvent,
    isObject,
    toggleClass,
    setLocalStorage
} from '../util';

export default class ChinaLogin {
	constructor() {
	    this.options = {
	    	wrapperClass: 'login-wrapper',
	    	contentClass: 'login-content',
	    	titleClass: 'login-title',
	    	formClass: 'form-login',
	    	groupClass: 'form-group',
	    	labelClass: 'form-label',
	    	controlClass: 'form-control',
	    	sectionClass: 'form-section',
	    	linkClass: 'section-link'
        };

	    this.template = this._createTemplate();
	    this._bindEvent();
	}

	_bindEvent() {
		const FormEvent = new Form(this.template);

		// 表单提交
		FormEvent.onsubmit = (params) => {
			getLogin(params, true).then(() => {
				findAllCountry(1, 1);
				return location.href = `${window.location.origin}/#/home`;
			});
		};
	}

	_createTemplate() {
		const wrapper = createDivEl({className: this.options.wrapperClass});
		const content = createDivEl({className: this.options.contentClass});

		// title
		const loginTitle = createDivEl({element: 'h2', className: this.options.titleClass, content: '中国区主播登录'});
		loginTitle.style.marginBottom = '3rem';
		content.appendChild(loginTitle);

		// form
		const formBox = createDivEl({element: 'form', className: ['form', this.options.formClass]});

		// phoneCode
		const phoneCode = createDivEl({element: 'input'});
		phoneCode.setAttribute('type', 'hidden');
		phoneCode.setAttribute('name', 'phoneCode');
		phoneCode.setAttribute('value', '86');
		formBox.appendChild(phoneCode);

		// country_id
		const countryId = createDivEl({element: 'input'});
		countryId.setAttribute('type', 'hidden');
		countryId.setAttribute('name', 'country_id');
		countryId.setAttribute('value', '1');
		formBox.appendChild(countryId);

		// userPhone
		const phoneGroup = createDivEl({className: this.options.groupClass});
		const phoneGroupLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '手机号:'});
		const phoneGroupInput = createDivEl({element: 'input', className: this.options.controlClass});
		phoneGroupInput.setAttribute('type', 'tel');
		phoneGroupInput.setAttribute('name', 'userPhone');
		phoneGroupInput.setAttribute('placeholder', '请输入11位手机号');
		phoneGroup.appendChild(phoneGroupLabel);
		phoneGroup.appendChild(phoneGroupInput);
		formBox.appendChild(phoneGroup);

		// userPassword
		const passwordGroup = createDivEl({className: this.options.groupClass});
		const passwordLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '密码:'});
		const passwordInput = createDivEl({element: 'input', className: this.options.controlClass});
		const passwordIcon = createDivEl({element: 'i', className: ['icon', 'icon-eye-black', 'btn-bright']});
		passwordInput.setAttribute('type', 'password');
		passwordInput.setAttribute('name', 'userPassword');
		passwordInput.setAttribute('placeholder', '8-12位数字或字符');
		passwordGroup.appendChild(passwordLabel);
		passwordGroup.appendChild(passwordInput);
		passwordGroup.appendChild(passwordIcon);
		formBox.appendChild(passwordGroup);

		// button
		const submitButton = createDivEl({element: 'button', className: ['button', 'button-primary', 'button-block'], content: '登录'});
		submitButton.setAttribute('type', 'submit');
		submitButton.style.marginTop = '3rem';
		submitButton.style.marginBottom = '0.35rem';
		// addEvent(submitButton, 'click', () => {
		// });
		formBox.appendChild(submitButton);

		// section
		const linkDection = createDivEl({className: this.options.sectionClass});
		const ButtonLink = createDivEl({className: this.options.linkClass, content: '修改密码'});
		addEvent(ButtonLink, 'click', () => {
			let modalEl;
			const handler = () => {
				closeModal(modalEl);
			}
			const findEL = this._createFindTemplate(handler);
			modalEl = popup({
				element: findEL,
				title: '修改密码'
			});
		});
		linkDection.appendChild(ButtonLink);
	    formBox.appendChild(linkDection);

	    content.appendChild(formBox);
	    wrapper.appendChild(content);
	    return wrapper;
	}

	_createFindTemplate(handler) {
		const wrapper = createDivEl({className: this.options.wrapperClass});
		const content = createDivEl({className: this.options.contentClass});

		// form
		const formBox = createDivEl({element: 'form', className: ['form', this.options.formClass]});

		// phoneCode
		const phoneCode = createDivEl({element: 'input'});
		phoneCode.setAttribute('type', 'hidden');
		phoneCode.setAttribute('name', 'phoneCode');
		phoneCode.setAttribute('value', '86');
		formBox.appendChild(phoneCode);

		// userPhone
		const phoneGroup = createDivEl({className: this.options.groupClass});
		const phoneGroupLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '手机号:'});
		const phoneGroupInput = createDivEl({element: 'input', className: this.options.controlClass});
		phoneGroupInput.setAttribute('type', 'tel');
		phoneGroupInput.setAttribute('name', 'userPhone');
		phoneGroupInput.setAttribute('placeholder', '请输入11位手机号');
		phoneGroup.appendChild(phoneGroupLabel);
		phoneGroup.appendChild(phoneGroupInput);
		formBox.appendChild(phoneGroup);

		// userPassword
		const oldGroup = createDivEl({className: this.options.groupClass});
		const oldLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '旧密码:'});
		const oldInput = createDivEl({element: 'input', className: this.options.controlClass});
		const oldIcon = createDivEl({element: 'i', className: ['icon', 'icon-eye-black', 'btn-bright']});
		oldInput.setAttribute('type', 'password');
		oldInput.setAttribute('name', 'oldPassword');
		oldInput.setAttribute('placeholder', '8-12位数字或字符');
		oldGroup.appendChild(oldLabel);
		oldGroup.appendChild(oldInput);
		oldGroup.appendChild(oldIcon);
		formBox.appendChild(oldGroup);

		// userPassword
		const passwordGroup = createDivEl({className: this.options.groupClass});
		const passwordLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '新密码:'});
		const passwordInput = createDivEl({element: 'input', className: this.options.controlClass});
		const passwordIcon = createDivEl({element: 'i', className: ['icon', 'icon-eye-black', 'btn-bright']});
		passwordInput.setAttribute('type', 'password');
		passwordInput.setAttribute('name', 'password');
		passwordInput.setAttribute('placeholder', '8-12位数字或字符');
		passwordGroup.appendChild(passwordLabel);
		passwordGroup.appendChild(passwordInput);
		passwordGroup.appendChild(passwordIcon);
		formBox.appendChild(passwordGroup);

		// userPassword
		const confirmGroup = createDivEl({className: this.options.groupClass});
		const confirmLabel = createDivEl({element: 'label', className: this.options.labelClass, content: '确认密码:'});
		const confirmInput = createDivEl({element: 'input', className: this.options.controlClass});
		const confirmIcon = createDivEl({element: 'i', className: ['icon', 'icon-eye-black', 'btn-bright']});
		confirmInput.setAttribute('type', 'password');
		confirmInput.setAttribute('name', 'confirmPassword');
		confirmInput.setAttribute('placeholder', '8-12位数字或字符');
		confirmGroup.appendChild(confirmLabel);
		confirmGroup.appendChild(confirmInput);
		confirmGroup.appendChild(confirmIcon);
		formBox.appendChild(confirmGroup);

		// button
		const submitButton = createDivEl({element: 'button', className: ['button', 'button-primary', 'button-block'], content: '确认'});
		submitButton.setAttribute('type', 'submit');
		submitButton.style.marginTop = '3rem';
		submitButton.style.marginBottom = '0.35rem';
		// addEvent(submitButton, 'click', () => {
		// });
		formBox.appendChild(submitButton);

	    content.appendChild(formBox);
	    wrapper.appendChild(content);

	    const FormEvent = new Form(wrapper);

	    // 表单提交
	    FormEvent.onsubmit = (params) => {
	    	updatePassword(params).then(() => {
	    		if (handler) handler();
	    	});
	    };

	    return wrapper;
	}

	static attachTo() {
	    return new ChinaLogin();
	}
}

const chinaLogin = new ChinaLogin();

document.body.append(chinaLogin.template);