// lang
import CN from './lang/zh_CN';
import US from './lang/en_US';
import JP from './lang/ja_JP';
import BR from './lang/pt_BR';
import GB from './lang/en_GB';
import DE from './lang/de_DE';
import IN from './lang/id_IN';
import TH from './lang/th_TH';
import KR from './lang/ko_KR';
import CA from './lang/cd_CA';

import MY from './lang/ms_MY';
import ID from './lang/id_ID';
import PH from './lang/en_PH';
import SG from './lang/zh_SG';
import BN from './lang/ms_BN';

const LANG_NAME = 'LANG';
const DEFAULT = {
	lang: US
};
const LANG = {
    'zh_CN': CN,
	'en_US': US,
	'ja_JP': JP,
    'pt_BR': BR,
    'en_UK': GB,
    'de_DE': DE,
    'id_IN': IN,
    'th_TH': TH,
    'ko_KR': KR,
    'cd_CA': CA,
    'ms_MY': MY,
    'id_ID': ID,
    'en_PH': PH,
    'zh_SG': SG,
    'ms_BN': BN
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