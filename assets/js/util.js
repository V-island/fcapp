import moment from 'moment';
import {
    getLangConfig
} from './lang';

const LANG = getLangConfig();

const REGEXP_SPACES = /\s+/;
const REGEXP_TOKENS = /(Y|M|D|H|m|s|S)\1+/g;
const REGEXP_HYPHEN = /([a-z\d])([A-Z])/g;
const toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// 刷新页面
export const refreshURL = () => {
    return window.location.reload();
};

export const errorAlert = (message, reload = true) => {
    console.log(message);
    // if (reload) {
    //     location.reload(true);
    // }
};

// 倒计时60s
export const addCountdown = (element, val) => {
    if (val == 0) {
        removeClass(element, 'disabled');
        element.innerText = LANG.PUBLIC.Froms.Telephone.Verification;
        return false;
    } else {
        element.innerText = `${val}s`;
        val--;
        setTimeout(function() {
            addCountdown(element, val)
        }, 1000)
    }
};

// 保存
export const setLocalStorage = (name, data) =>{
    return localStorage.setItem(name, JSON.stringify(data));
};

// 获取
export const getLocalStorage = name => {
    let data = localStorage.getItem(name);
    return JSON.parse(data);
};

// 删除
export const removeLocalStorage = name => {
    return localStorage.removeItem(name);
};

// 删除全部
export const clearLocalStorage = name => {
    return localStorage.clear();
};

export const getVariableFromUrl = () => {
  let vars = {};
  let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (let i = 0; i < hashes.length; i++) {
    let hash = hashes[i].split('=');
    vars[hash[0]] = hash[1];
  }
  return vars;
};

/**
 * import html 导入
 * @param  {[type]}   param    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
export const importTemplate = (param, callback) => {
    let self = this;

    let link = document.createElement('link');
    let Tpl = {};
    link.rel = 'import';
    link.id = param.name;
    link.href = param.path;

    link.onload = function(e) {
        console.log('Loaded import: ' + e.target.href);
        let _target = e.target.import;

        if (typeof(_target.head) != 'undefined' && _target.head != '') {
            for (let i = 0; i < _target.head.children.length; i++) {
                callback(_target.head.children[i].id, replaceNote(_target.head.children[i].innerHTML));
            }
        }

        //加载完成后清除头部引用
        if (!link.readyState || 'link' === link.readyState || 'complete' === link.readyState) {
            link.onload = link.onreadystatechange = null;
            link.parentNode.removeChild(link);
        }
    };
    link.onerror = function(e) {
        console.error(MSG.errorsupport + e.target.href);
        return false;
    };
    document.head.appendChild(link);
};

/**
 * 解析FORM参数
 * @example  phoneCode=1&userPhone=123456
 * @return Object {phoneCode:1,userPhone:123456}
 * */
export const urlParse = data => {
    let obj = {};
    let arr = data.match(/[^?&]+=[^?&]+/g);
    if (arr) {
        arr.forEach((item) => {
            let tempArr = item.substring(0).split('=');
            let key = decodeURIComponent(tempArr[0]);
            let val = decodeURIComponent(tempArr[1]);
            obj[key] = val;
        });
    }
    return obj;
}

//用于生成uuid
export const getUuid = () => {
  let d = new Date().getTime();
  return 'xxxx-4xxx-yxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

// 防XSS
export const protectFromXSS = text => {
  return typeof text === 'string'
    ? text
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/\'/g, '&apos;')
    : text;
};

/**
 * 去注释以及style script 换行符 标签空格
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
export const replaceNote = str => {
    return str.replace(/(\n)/g, '')
        .replace(/(\t)/g, '')
        .replace(/(\r)/g, '')
        .replace(/<!--[\s\S]*?--\>/g, '')
        .replace(/<style[^>]*>[\s\S]*?<\/[^>]*style>/gi, '')
        //.replace(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,'')
        .replace(/>\s*/g, '>')
        .replace(/\s*</g, '<')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "\'")
        .replace(/&quot;/g, "\"")
        .replace(/(^\s*)|(\s*$)/g, "");
};

/**
 * 通过出生年月计算年龄
 * @param  {[type]} str 日期 2001-01-01
 * @return {[type]}     [description]
 */
export const dataAges = str => {
    let r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
    if (r == null) return false;

    let d = new Date(r[1], r[3] - 1, r[4]);

    if (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]) {
        let Y = new Date().getFullYear();
        return (Y - r[1]);
    }
    return false;
};

/**
 * 时间截取
 * @param  {[type]} str       日期 2001-01-01
 * @param  {[type]} format    格式 YYYY-MM-DD
 * @return {[type]}           [description]
 */
export const dateFormat = (str, format) => {
    const now = new Date(str).getTime();
    return moment.unix(now.toString().length === 13 ? now / 1000 : now).format(format);
};

export const timestampToTime = timestamp => {
    const now = new Date().getTime();
    const nowDate = moment.unix(now.toString().length === 13 ? now / 1000 : now).format('MM/DD');

    let date = moment.unix(timestamp.toString().length === 13 ? timestamp / 1000 : timestamp).format('MM/DD');
    if (date === 'Invalid date') {
        date = '';
    }

    return nowDate === date ?
        moment.unix(timestamp.toString().length === 13 ? timestamp / 1000 : timestamp).format('HH:mm') :
        date;
};

export const timestampToDateString = timestamp => {
    return moment.unix(timestamp.toString().length === 13 ? timestamp / 1000 : timestamp).format('LL');
};

export const timestampFromNow = timestamp => {
    return moment(timestamp).fromNow();
};

export const secToTime = (timestamp) => {
    var t;
    if(timestamp > -1){
        var hour = Math.floor(timestamp/3600);
        var min = Math.floor(timestamp/60) % 60;
        var sec = timestamp % 60;
        if(hour < 10) {
            t = '0'+ hour + ":";
        } else {
            t = hour + ":";
        }

        if(min < 10){t += "0";}
        t += min + ":";
        if(sec < 10){t += "0";}
        t += sec.toFixed(2);
    }
    return t;
}

// 版本
export const compareVersion = (a, b) =>{
    var as = a.split('.');
    var bs = b.split('.');
    if (a === b) return 0;

    for (var i = 0; i < as.length; i++) {
        var x = parseInt(as[i]);
        if (!bs[i]) return 1;
        var y = parseInt(bs[i]);
        if (x < y) return -1;
        if (x > y) return 1;
    }
    return -1;
};

// 获取Page
export const getCurrentPage = () => {
    return document.querySelector('.page-current') || document.querySelector('.page') || document.body;
};

// 比对操作
export const typeOf = obj => {
    return toString.call(obj).slice(8, -1).toLowerCase();
};

export const isObject = obj => {
    return typeof obj === 'object' && obj !== null;
};

export const isFunction = fn => {
    return typeof fn === 'function';
};

export const isNumber = num => {
    return typeof num === 'number' && !isNaN(num);
};

export const isDate = date => {
    return typeOf(date) === 'date';
};

export const isValidDate = date => {
    return isDate(date) && date.toString() !== 'Invalid Date';
};

export const isLeapYear = year => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const isPlainObject = obj => {
    if (!isObject(obj)) {
        return false;
    }

    try {
        const constructor = obj.constructor;
        const prototype = constructor.prototype;

        return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (e) {
        return false;
    }
};

export const isUrl = urlString => {
  const regex = /^(http|https):\/\/[^ "]+$/;
  return regex.test(urlString);
};

export const isImage = fileType => {
  const regex = /^image\/.+$/;
  return regex.test(fileType);
};

export const isEmpty = value => {
  return value === null || value === undefined || value.length === 0;
};

export const isNull = value => {
  try {
    return value === null;
  } catch (e) {
    return false;
  }
};

// DOM 操作
export const createDom = element => {
    let container = document.createElement('div');
    container.innerHTML = element;
    return container.childNodes[0];
};

// 创建DIV Element
export const createDivEl = ({ element, id, className, content, background, data }) => {
    const el = document.createElement( element ? element : 'div');
    if (id) {
        el.id = id;
    }
    if (className) {
        el.className = Array.isArray(className) ? className.join(' ') : className;
    }
    if (content) {
        el.innerHTML = content;
    }
    if (background) {
        el.style.backgroundImage = `url(${background})`;
    }
    if (data) {
        el[data.name] = data.value;
    }
    if (isObject(data) && data.length > 0) {
        data.forEach((_data) => {
            if (isObject(_data)) {
                el[_data.name] = _data.value;
            }
        });
    }
    return el;
};

export const isScrollBottom = target => {
    return target.scrollTop + target.offsetHeight >= target.scrollHeight;
};

export const appendToFirst = (target, newElement) => {
    if (target.childNodes.length > 0) {
        target.insertBefore(newElement, target.childNodes[0]);
    } else {
        target.appendChild(newElement);
    }
};

export const showHideDom = (element, value) => {
    if (!value) {
        return;
    }
    return element.style.display = value;
};

// DOM Class 操作
export const hasClass = (target, className) => {
  return target.classList
    ? target.classList.contains(className)
    : new RegExp('(^| )' + className + '( |$)', 'gi').test(target.className);
};

export const addClass = (target, className) => {
  if (target.classList) {
    if (!(className in target.classList)) {
      target.classList.add(className);
    }
  } else {
    if (target.className.indexOf(className) < 0) {
      target.className += ` ${className}`;
    }
  }
};

export const removeClass = (target, className) => {
  if (target.classList) {
    target.classList.remove(className);
  } else {
    target.className = target.className.replace(
      new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
      ''
    );
  }
};

export const toggleClass = (target, className) => {
  hasClass(target, className) ? removeClass(target, className) : addClass(target, className);
};

// DOM Data 操作
export const setData = (target, key, data) => {
  return target.dataset[`${key}`] = data;
};

export const getData = (target, key) => {
  return target.dataset[`${key}`];
};

export const removeData = (target, key) => {
  delete target.dataset[`${key}`];
};

// DOM 监听器 操作
export const extend = (obj, ...args) => {
    const deep = obj === true;

    if (deep) {
        obj = args.shift();
    }

    if (isObject(obj) && args.length > 0) {
        args.forEach((arg) => {
            if (isObject(arg)) {
                Object.keys(arg).forEach((key) => {
                    if (deep && isObject(obj[key])) {
                        extend(true, obj[key], arg[key]);
                    } else {
                        obj[key] = arg[key];
                    }
                });
            }
        });
    }

    return obj;
};

export const addEvent = (element, type, handler, once) => {
    const types = type.trim().split(REGEXP_SPACES);
    const originalHandler = handler;

    if (types.length > 1) {
        types.forEach(t => addListener(element, t, handler));
        return;
    }

    if (once) {
        handler = (...args) => {
            removeListener(element, type, handler);

            return originalHandler.apply(element, args);
        };
    }

    element.addEventListener(type, handler, false);
};

export const removeEvent = (element, type, handler) => {
    const types = type.trim().split(REGEXP_SPACES);

    if (types.length > 1) {
        types.forEach(t => removeListener(element, t, handler));
        return;
    }

    if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
    } else if (element.detachEvent) {
        element.detachEvent(`on${type}`, handler);
    }
};

export const dispatchEvent = (element, type, data) => {
    let event;

    // Event and CustomEvent on IE9-11 are global objects, not constructors
    if (typeof Event === 'function' && typeof CustomEvent === 'function') {
        if (data === undefined) {
            event = new Event(type, {
                bubbles: true,
                cancelable: true,
            });
        } else {
            event = new CustomEvent(type, {
                detail: data,
                bubbles: true,
                cancelable: true,
            });
        }
    } else if (data === undefined) {
        event = document.createEvent('Event');
        event.initEvent(type, true, true);
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, true, true, data);
    }

    // IE9+
    return element.dispatchEvent(event);
};

export const empty = element => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};


// datetime-picker
export const getDaysInMonth = (year, month) => {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

export const addLeadingZero = (value, length = 1) => {
    const str = String(Math.abs(value));
    let i = str.length;
    let result = '';

    if (value < 0) {
        result += '-';
    }

    while (i++ < length) {
        result += '0';
    }

    return result + str;
};

export const tokenToType = token => {
    return {
        Y: 'year',
        M: 'month',
        D: 'day',
        H: 'hour',
        m: 'minute',
        s: 'second',
        S: 'millisecond',
    }[token.charAt(0)];
};

export const parseFormat = format => {
    const tokens = format.match(REGEXP_TOKENS);

    if (!tokens) {
        throw new Error('Invalid format');
    }

    const result = {
        tokens,
    };

    tokens.forEach((token) => {
        result[tokenToType(token)] = token;
    });

    return result;
};