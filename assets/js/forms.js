import Modal from './modal';

import {
    getLangConfig
} from './lang';

import {
    sendVerificationCode
} from './api';

import {
    extend,
    addEvent,
    createDom,
    addClass,
    hasClass,
    removeClass,
    getLocalStorage,
    addCountdown
} from './util';

const COUNTRY_ID_NAME = 'COUNTRY_ID';
const LANG = getLangConfig();
const modal = new Modal();

/*
国家/地区           语言代码
简体中文(中国)       zh-cn
英语(美国)          en-us
日语(日本)          ja-jp
 */
const phonesRule = {
    'en_US': /^[2-9]\d{2}[2-9](?!11)\d{6}$/,
    'ja_JP': /^0[7-9]0\d{8}$/,
    'zh_CN': /^1[345789]\d{9}$/,
    'en_UK': /^7\d{9}$/
};

export default class Forms {
    constructor(element, options) {
        this.element = element;
        this.options = {
            formClass: '.form',
            inputTagName: 'input',
            phoneCodeClass: 'phoneCode',
            countryIdClass: 'countryId',
            countryNameClass: 'countryName',
            countryClass: 'country',
            phoneCodeLabelClass: 'phoneCodeLabel',
            btnBrightClass: 'btn-bright',
            btnVerificationClass: 'btn-verification',
            eyeIcon: 'icon-eye',
            eyeBlackIcon: 'icon-eye-black',
            disabledClass: 'disabled',
            showClass: 'active'
        };

        this.onsubmit = null;
        extend(this.options, options);

        this.init();
    }

    init() {
        this.Country = getLocalStorage(COUNTRY_ID_NAME);
        // 获取标签Tag
        this.formEl = this.element.querySelector(this.options.formClass);
        this.inputTagEl = this.formEl.getElementsByTagName(this.options.inputTagName);
        // 获取国际信息
        this.phoneCodeEl = this.formEl.getElementsByClassName(this.options.phoneCodeClass);
        this.countryIdEl = this.formEl.getElementsByClassName(this.options.countryIdClass);
        this.countryNameEl = this.formEl.getElementsByClassName(this.options.countryNameClass);
        this.phoneCodeLabelEl = this.formEl.getElementsByClassName(this.options.phoneCodeLabelClass);
        // 选择国家
        this.countryEl = this.formEl.getElementsByClassName(this.options.countryClass);
        // 按钮
        this.btnVerificationEl = this.formEl.getElementsByClassName(this.options.btnVerificationClass);
        this.btnBrightEl = this.formEl.getElementsByClassName(this.options.btnBrightClass);

        this._bindEvent();
    }

    _bindEvent() {
        // 获取号码归属地
        if (this.phoneCodeEl.length > 0) {
            this.phoneCodeEl[0].value = this.Country.phone_code;
        }

        // 获取国家编号
        if (this.countryIdEl.length > 0) {
            this.countryIdEl[0].value = this.Country.id;
        }

        // 获取国家名字
        if (this.countryNameEl.length > 0) {
            this.countryNameEl[0].innerHTML = this.Country.country_name;
        }

        // 显示号码归属地
        if (this.phoneCodeLabelEl.length > 0) {
            this.phoneCodeLabelEl[0].innerHTML = `+${this.Country.phone_code}`;
        }

        // 选择国家
        if (this.countryEl.length > 0) {
            addEvent(this.countryEl[0], 'click', () => {
                modal.countryModal(this.Country.id);
            });
        }

        // Input
        Array.prototype.slice.call(this.inputTagEl).forEach(inputEl => {
            if(inputEl.type == "hidden") return false;

            let groupEl = inputEl.parentNode;
            // 元素失去焦点
            addEvent(inputEl, 'blur', () => {
                return removeClass(groupEl, this.options.showClass);
            });

            // 元素获得焦点
            addEvent(inputEl, 'focus', () => {
                addClass(groupEl, this.options.showClass);

                if (this.btnVerificationEl.length > 0) {
                    removeClass(this.btnVerificationEl[0], this.options.disabledClass);
                }
            });
        });

        // 发送验证码
        if (this.btnVerificationEl.length > 0) {
            addEvent(this.btnVerificationEl[0], 'click', () => {
                if (hasClass(this.btnVerificationEl[0], this.options.disabledClass)) {
                    return false;
                }

                let groupEl = this.btnVerificationEl[0].parentNode;
                let _value = groupEl.getElementsByTagName(this.options.inputTagName)[0].value;

                if (phonesRule[this.Country.language_code].test(_value)) {
                    return sendVerificationCode(this.Country.phone_code + _value).then(() => {

                        addClass(this.btnVerificationEl[0], this.options.disabledClass);
                        addCountdown(this.btnVerificationEl[0], 60);
                    });
                } else {
                    return modal.alert(LANG.PUBLIC.Froms.Telephone.Text, (_modal) => {
                        modal.closeModal(_modal);
                    });
                }
            });
        }

        // 明密文
        if (this.btnBrightEl.length > 0) {
            addEvent(this.btnBrightEl[0], 'click', () => {
                let groupEl = this.btnBrightEl[0].parentNode;
                let inputEl = groupEl.getElementsByTagName(this.options.inputTagName)[0];

                if (hasClass(this.btnBrightEl[0], this.options.eyeBlackIcon)) {
                    // 密码可见
                    removeClass(this.btnBrightEl[0], this.options.eyeBlackIcon);
                    addClass(this.btnBrightEl[0], this.options.eyeIcon);
                    inputEl.type = "text";
                }else {
                    // 密码不可见
                    removeClass(this.btnBrightEl[0], this.options.eyeIcon);
                    addClass(this.btnBrightEl[0], this.options.eyeBlackIcon);
                    inputEl.type = "password";
                }
            });
        }

        // Submit
        addEvent(this.formEl, 'submit', (evt) => {
            evt.preventDefault();
            let _params = this.serialize(this.formEl);
            if (this.onsubmit) {
                this.onsubmit(_params);
            }
        });
    }

    static getInstance(element, options) {
        return new Forms(element, options);
    }

    serialize(formEl) {
        var res = [], //存放结果的数组
            current = null, //当前循环内的表单控件
            i, //表单NodeList的索引
            len, //表单NodeList的长度
            k, //select遍历索引
            optionLen, //select遍历索引
            option, //select循环体内option
            optionValue, //select的value
            form = formEl; //用form变量拿到当前的表单，易于辨识

        for (i = 0, len = form.elements.length; i < len; i++) {

            current = form.elements[i];

            //disabled表示字段禁用，需要区分与readonly的区别
            if (current.disabled) continue;

            switch (current.type) {

                //可忽略控件处理
                case "file": //文件输入类型
                case "submit": //提交按钮
                case "button": //一般按钮
                case "image": //图像形式的提交按钮
                case "reset": //重置按钮
                case undefined: //未定义
                    break;

                    //select控件
                case "select-one":
                case "select-multiple":
                    if (current.name && current.name.length) {
                        console.log(current)
                        for (k = 0, optionLen = current.options.length; k < optionLen; k++) {

                            option = current.options[k];
                            optionValue = "";
                            if (option.selected) {
                                if (option.hasAttribute) {
                                    optionValue = option.hasAttribute('value') ? option.value : option.text
                                } else {
                                    //低版本IE需要使用特性 的specified属性，检测是否已规定某个属性
                                    optionValue = option.attributes('value').specified ? option.value : option.text;
                                }
                            }

                            res.push(encodeURIComponent(current.name) + "=" + encodeURIComponent(optionValue));
                        }
                    }
                    break;

                    //单选，复选框
                case "radio":
                case "checkbox":
                    //这里有个取巧 的写法，这里的判断是跟下面的default相互对应。
                    //如果放在其他地方，则需要额外的判断取值
                    if (!current.checked) break;

                default:
                    //一般表单控件处理
                    if (current.name && current.name.length) {
                        res.push(encodeURIComponent(current.name) + "=" + encodeURIComponent(current.value));
                    }
            }
        }
        return res.join("&");
    }
}