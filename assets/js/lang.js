// lang
import US from '../lang/en_US.json';

const adminBase = '../assets/';
const LANG_NAME = 'LANG';
const LangDefault = {
    'zh_CN': `${adminBase}lang/zh_CN.json`,
	'en_US': `${adminBase}lang/en_US.json`,
	'ja_JP': `${adminBase}lang/ja_JP.json`,
    'pt_BR': `${adminBase}lang/pt_BR.json`,
    'en_UK': `${adminBase}lang/en_GB.json`,
    'de_DE': `${adminBase}lang/de_DE.json`,
    'id_IN': `${adminBase}lang/id_IN.json`,
    'th_TH': `${adminBase}lang/th_TH.json`,
    'ko_KR': `${adminBase}lang/ko_KR.json`,
    'cd_CA': `${adminBase}lang/cd_CA.json`,
    'ms_MY': `${adminBase}lang/ms_MY.json`,
    'id_ID': `${adminBase}lang/id_ID.json`,
    'en_PH': `${adminBase}lang/en_PH.json`,
    'zh_SG': `${adminBase}lang/zh_SG.json`,
    'ms_BN': `${adminBase}lang/ms_BN.json`
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
        localStorage.setItem(LANG_NAME, JSON.stringify(US));
        return US;
    }
};

/**
 * 切换localStorage语言包
 * @return {[type]} [description]
 */
export const setLangConfig = (lang) => {
    return new Promise((resolve) => {
        let _lang = LangDefault[lang] ? LangDefault[lang] : false;
        getXMLHttpRequest(_lang).then((data) => {
            localStorage.setItem(LANG_NAME, JSON.stringify(data));
            resolve(true);
        });
    });
};

export const getXMLHttpRequest = (url, param, type) => {
    param = typeof param !== 'undefined' ? param : null;
    type = typeof type !== 'undefined' ? type : 'GET';

    return new Promise((resolve, reject) => {
        if (!url) {
            return reject(US);
        }

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === 4 && xhr.status == 200) {
                resolve(JSON.parse(xhr.responseText));
            }
        });

        xhr.open(type, url);
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send();
    });
}