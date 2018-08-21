// lang
import CN from './lang/zh_CN';
import US from './lang/en_US';
import JP from './lang/ja_JP';

const LANG_NAME = 'LANG';
const DEFAULT = {
	lang: US
};
const LANG = {
    'zh': CN,
	'en': US,
	'jp': JP,
};

/**
 * 获取localStorage语言包
 * @return {[type]} [description]
 */
export function getLangConfig() {
    let lang = localStorage.getItem(LANG_NAME);

    if (lang) {
		return JSON.parse(lang);
    }else {
    	localStorage.setItem(LANG_NAME, JSON.stringify(DEFAULT.lang));
    	return DEFAULT.lang;
    }
};

/**
 * 切换localStorage语言包
 * @return {[type]} [description]
 */
export function setLangConfig(lang) {
    return new Promise((resolve, reject) => {
        if (LANG[lang]) {
            localStorage.setItem(LANG_NAME, JSON.stringify(LANG[lang]));
            resolve(true);
        }else {
            reject(false);
        }
    });
};