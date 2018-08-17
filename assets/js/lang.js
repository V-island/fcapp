// lang
import en from './lang/EN';
import zh_cn from './lang/ZH-CN';

const LANG_NAME = 'LANG';
const DEFAULT = {
	lang: en
};
const LANG = {
	'en': en,
	'zh': zh_cn
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
    	return en;
    }
};

/**
 * 切换localStorage语言包
 * @return {[type]} [description]
 */
export function setLangConfig(lang) {
    const _lang = LANG[lang] || en;
    localStorage.setItem(LANG_NAME, JSON.stringify(_lang));
};