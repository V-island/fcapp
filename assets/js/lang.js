// lang
import CN from './lang/zh_CN';
import US from './lang/en_US';
import JP from './lang/ja_JP';
import BRL from './lang/pt_BR';
import GBP from './lang/en_UK';
import EUR from './lang/de_DE';
import INR from './lang/id_IN';
import THB from './lang/th_TH';
import KRW from './lang/ko_KR';
import CAD from './lang/cd_CA';

const LANG_NAME = 'LANG';
const DEFAULT = {
	lang: US
};
const LANG = {
    'zh_CN': CN,
	'en_US': US,
	'ja_JP': JP,
    'pt_BR': BRL,
    'en_UK': GBP,
    'de_DE': EUR,
    'id_IN': INR,
    'th_TH': THB,
    'ko_KR': KRW,
    'cd_CA': CAD
};

/**
 * 获取localStorage语言包
 * @return {[type]} [description]
 */
export const getLangConfig = () => {
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
export const setLangConfig = (lang) => {
    return new Promise((resolve) => {
        localStorage.setItem(LANG_NAME, JSON.stringify(LANG[lang] ? LANG[lang] : DEFAULT.lang));
        resolve(true);
    });
};