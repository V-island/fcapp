import { closeModal, alert, country } from './components/Modal';
import { Spinner } from './components/Spinner';
import {
    body
} from './intro';

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

var phones = {
    'ar-DZ': /^(\+?213|0)(5|6|7)\d{8}$/,
    'ar-SY': /^(!?(\+?963)|0)?9\d{8}$/,
    'ar-SA': /^(!?(\+?966)|0)?5\d{8}$/,
    'en-US': /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
    'cs-CZ': /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
    'de-DE': /^(\+?49[ \.\-])?([\(]{1}[0-9]{1,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
    'da-DK': /^(\+?45)?(\d{8})$/,
    'el-GR': /^(\+?30)?(69\d{8})$/,
    'en-AU': /^(\+?61|0)4\d{8}$/,
    'en-GB': /^(\+?44|0)7\d{9}$/,
    'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
    'en-IN': /^(\+?91|0)?[789]\d{9}$/,
    'en-NZ': /^(\+?64|0)2\d{7,9}$/,
    'en-ZA': /^(\+?27|0)\d{9}$/,
    'en-ZM': /^(\+?26)?09[567]\d{7}$/,
    'es-ES': /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
    'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5)?|50)\s?(\d\s?){4,8}\d$/,
    'fr-FR': /^(\+?33|0)[67]\d{8}$/,
    'he-IL': /^(\+972|0)([23489]|5[0248]|77)[1-9]\d{6}/,
    'hu-HU': /^(\+?36)(20|30|70)\d{7}$/,
    'it-IT': /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
    'ja-JP': /^(\+?81|0)\d{1,4}[ \-]?\d{1,4}[ \-]?\d{4}$/,
    'ms-MY': /^(\+?6?01){1}(([145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
    'nb-NO': /^(\+?47)?[49]\d{7}$/,
    'nl-BE': /^(\+?32|0)4?\d{8}$/,
    'nn-NO': /^(\+?47)?[49]\d{7}$/,
    'pl-PL': /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
    'pt-BR': /^(\+?55|0)\-?[1-9]{2}\-?[2-9]{1}\d{3,4}\-?\d{4}$/,
    'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
    'ru-RU': /^(\+?7|8)?9\d{9}$/,
    'sr-RS': /^(\+3816|06)[- \d]{5,9}$/,
    'tr-TR': /^(\+?90|0)?5\d{9}$/,
    'vi-VN': /^(\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/,
    'zh-CN': /^(\+?0?86\-?)?1[345789]\d{9}$/,
    'zh-TW': /^(\+?886\-?|0)?9\d{8}$/
};

/*
国家/地区           语言代码
简体中文(中国)       zh-cn
英语(美国)          en-us
日语(日本)          ja-jp
 */
const phonesRule = {
    'zh_CN': /^1[345789]\d{9}$/,
    'en_US': /^[2-9]\d{2}[2-9](?!11)\d{6}$/,
    'ja_JP': /^0[7-9]0\d{8}$/,
    'pt_BR': /^\d{8}$/,
    'en_GB': /^7\d{9}$/,
    'de_DE': /^017[12369]\d{7}$/,
    'id_IN': /^[789]\d{9}$/,
    'th_TH': /^\d{9,10}$/,
    'ko_KR': /^01\d{9}$/,
    'cd_CA': /^\d{7}$/,
    'ms_MY': /^([145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7})$/,
    'id_ID': /^[8-9]\d{7,10}$/,
    'en_PH': /^91\d{8}$/,
    'zh_SG': /^[89]\d{7}$/,
    'ms_BN': /^\d{7}$/
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
            dataTimeClass: 'dataTime',
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
        // 选择时间
        this.dataTimeEl = this.formEl.getElementsByClassName(this.options.dataTimeClass);
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
                country({
                    countryId: this.Country.id
                });
                gtag('event', 'click', {
                    'event_label': 'Country selection button',
                    'event_category': 'Login',
                    'non_interaction': true
                });
            });
        }

        // 选择时间
        if (this.dataTimeEl.length > 0) {
            Array.prototype.slice.call(this.dataTimeEl).forEach(inputEl => {
                addEvent(inputEl, 'keyup', (e) => {
                    if (e.keyCode == 8) return;

                    let valueLength = inputEl.value.length;
                    if (valueLength == 2) {
                        inputEl.value = `${inputEl.value}/`;
                    }
                });
            });
        }

        // 显示号码归属地
        if (this.phoneCodeLabelEl.length > 0) {
            this.phoneCodeLabelEl[0].innerHTML = `+${this.Country.phone_code}`;
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

                let btnVerificationEl = groupEl.getElementsByClassName(this.options.btnVerificationClass);
                if (btnVerificationEl.length > 0) {
                    removeClass(btnVerificationEl[0], this.options.disabledClass);
                }
            });
        });

        // 发送验证码
        if (this.btnVerificationEl.length > 0) {
            addEvent(this.btnVerificationEl[0], 'click', () => {
                if (hasClass(this.btnVerificationEl[0], this.options.disabledClass)) {
                    return false;
                }
                Spinner.start(body);
                let groupEl = this.btnVerificationEl[0].parentNode;
                let inputEl = groupEl.getElementsByTagName(this.options.inputTagName)[0];
                let _value = inputEl.value;

                gtag('event', 'click', {
                    'event_label': 'Verification code button',
                    'event_category': 'Register',
                    'non_interaction': true
                });

                if (phonesRule[this.Country.language_code].test(_value)) {
                    return sendVerificationCode(this.Country.phone_code + _value).then((data) => {
                        if (!data) return Spinner.remove();

                        inputEl.setAttribute(this.options.disabledClass, this.options.disabledClass);
                        addClass(this.btnVerificationEl[0], this.options.disabledClass);
                        addCountdown(this.btnVerificationEl[0], inputEl, this.options.disabledClass, 60);
                        Spinner.remove();
                    });
                } else {
                    return alert({
                        text: `${LANG.PUBLIC.Froms.Telephone.Text}`,
                        callback: () => {
                            Spinner.remove();
                        }
                    });
                }
            });
        }

        // 明密文
        if (this.btnBrightEl.length > 0) {
            Array.prototype.slice.call(this.btnBrightEl).forEach(itemEl => {
                addEvent(itemEl, 'click', () => {
                    let groupEl = itemEl.parentNode;
                    let inputEl = groupEl.getElementsByTagName(this.options.inputTagName)[0];

                    if (hasClass(itemEl, this.options.eyeBlackIcon)) {
                        // 密码可见
                        removeClass(itemEl, this.options.eyeBlackIcon);
                        addClass(itemEl, this.options.eyeIcon);
                        inputEl.type = "text";
                    }else {
                        // 密码不可见
                        removeClass(itemEl, this.options.eyeIcon);
                        addClass(itemEl, this.options.eyeBlackIcon);
                        inputEl.type = "password";
                    }
                });
            });
        }

        // Submit
        addEvent(this.formEl, 'submit', (evt) => {
            Array.prototype.slice.call(this.inputTagEl).forEach(inputEl => {
                if(inputEl.type == "hidden") return false;
                inputEl.removeAttribute(this.options.disabledClass);
            });
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