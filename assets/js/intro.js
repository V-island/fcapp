// gages
import ErrorJS from './pages/404';
import Login from './pages/login';
import LoginMobile from './pages/login_mobile';
import Register from './pages/register';
import RegisterTerms from './pages/register_terms';
import FindPassword from './pages/find_password';
import SetPassword from './pages/set_password';

import Home from './pages/home';
import Favorite from './pages/favorite';
import Message from './pages/message';
import User from './pages/user';

import FreeVideo from './pages/free_video';
import OtherDetails from './pages/other_details';

// 用户中心
import UserDetail from './pages/user_detail';
import UserVideo from './pages/user_video';
import UserWatch from './pages/user_watch';

import UserAccount from './pages/user_account';
import UserAccountHistory from './pages/user_account_history';
import UserAccountTerms from './pages/user_account_terms';
import UserScore from './pages/user_score';
import UserScoreHistory from './pages/user_score_history';
import UserScoreWithdraw from './pages/user_score_withdraw';

import UserSetting from './pages/user_setting';
import UserSettingSecurity from './pages/user_setting_security';
import UserSettingHelp from './pages/user_setting_help';
import UserSettingSuggestion from './pages/user_setting_suggestion';
import UserSettingAbout from './pages/user_setting_about';

const adminBase = '/';
// 全局变量
export const fcConfig = {
    autoInit: false, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    router: true, //默认使用router
    swipePanel: "left", //滑动打开侧栏
    swipePanelOnlyClose: true, //只允许滑动关闭，不允许滑动打开侧栏
    importJs: 'webcomponentsLite.js',
    publicFile: {
        home_items: {
            name: 'home_items',
            path: `${adminBase}public/home_items.html`
        },
        favorite_items: {
            name: 'favorite_items',
            path: `${adminBase}public/favorite_items.html`
        },
        other_details_item: {
            name: 'other_details_item',
            path: `${adminBase}public/other_details_item.html`
        },
        bar_tabs: {
            name: 'bar_tabs',
            path: `${adminBase}public/bar_tabs.html`
        },
        live_preview: {
            name: 'live_preview',
            path: `${adminBase}public/live_preview.html`
        },
        client_rtc: {
            name: 'client_rtc',
            path: `${adminBase}public/client_rtc.html`
        },
        client_call: {
            name: 'client_call',
            path: `${adminBase}public/client_call.html`
        }
    },
    pagesFile: [{
        name: '404',
        path: `${adminBase}pages/404.html`,
        component: ErrorJS,
        init: 1
    }, {
        name: 'login',
        path: `${adminBase}pages/login.html`,
        component: Login,
        init: 1,
        children: [{
            name: 'mobile',
            path: `${adminBase}pages/login_mobile.html`,
            component: LoginMobile,
            init: 1
        }, {
            name: 'find',
            path: `${adminBase}pages/find_password.html`,
            component: FindPassword,
            init: 1
        }, {
            name: 'set',
            path: `${adminBase}pages/set_password.html`,
            component: SetPassword,
            init: 1
        }]
    }, {
        name: 'register',
        path: `${adminBase}pages/register.html`,
        component: Register,
        init: 1,
        children: [{
            name: 'terms',
            path: `${adminBase}pages/register_terms.html`,
            component: RegisterTerms,
            init: 1
        }]
    }, {
        name: 'home',
        path: `${adminBase}pages/home.html`,
        component: Home,
        init: 1,
        navTabs: 1,
        children: [{
            name: 'freevideo',
            path: `${adminBase}pages/free_video.html`,
            component: FreeVideo,
            init: 1
        }]
    }, {
        name: 'favorite',
        path: `${adminBase}pages/favorite.html`,
        component: Favorite,
        navTabs: 1
    }, {
        name: 'message',
        path: `${adminBase}pages/message.html`,
        component: Message,
        navTabs: 1
    }, {
        name: 'details',
        path: `${adminBase}pages/other_details.html`,
        component: OtherDetails
    }, {
        name: 'user',
        path: `${adminBase}pages/user.html`,
        component: User,
        navTabs: 1,
        children: [{
            name: 'detail',
            path: `${adminBase}pages/user_detail.html`,
            component: UserDetail
        }, {
            name: 'video',
            path: `${adminBase}pages/user_video.html`,
            component: UserVideo
        }, {
            name: 'watch',
            path: `${adminBase}pages/user_watch.html`,
            component: UserWatch
        }, {
            name: 'account',
            path: `${adminBase}pages/user_account.html`,
            component: UserAccount,
            children: [{
                name: 'history',
                path: `${adminBase}pages/user_account_history.html`,
                component: UserAccountHistory
            }, {
                name: 'terms',
                path: `${adminBase}pages/user_account_terms.html`,
                component: UserAccountTerms,
                init: 1
            }]
        }, {
            name: 'score',
            path: `${adminBase}pages/user_score.html`,
            component: UserScore,
            children: [{
                name: 'history',
                path: `${adminBase}pages/user_score_history.html`,
                component: UserScoreHistory
            }, {
                name: 'withdraw',
                path: `${adminBase}pages/user_score_withdraw.html`,
                component: UserScoreWithdraw
            }]
        }, {
            name: 'setting',
            path: `${adminBase}pages/user_setting.html`,
            component: UserSetting,
            children: [{
                name: 'security',
                path: `${adminBase}pages/user_setting_security.html`,
                component: UserSettingSecurity
            }, {
                name: 'help',
                path: `${adminBase}pages/user_setting_help.html`,
                component: UserSettingHelp
            }, {
                name: 'suggestion',
                path: `${adminBase}pages/user_setting_suggestion.html`,
                component: UserSettingSuggestion
            }, {
                name: 'about',
                path: `${adminBase}pages/user_setting_about.html`,
                component: UserSettingAbout
            }]
        }]
    }]
};

// 项目 地址
export const domainURL = location.origin;

// Server 地址配置
export const baseURL = 'https://192.168.1.211:8443/live-app/open/gate.do';
// export const baseURL = 'http://192.168.1.211:8080/live-app/open/gate.do';

// 直播配置
export const agoraConfig = {
    agora: true, // 默认使用Agora DSK
    agoraAppId: '130106827c954803a398814859761e19',
    agoraCertificateId: '',
    adminChannel: 'douliao',
};

// IM配置
export const sendBirdConfig = {
    sendBird: true, // 默认使用SendBird DSK
    sendBirdAppID: '07F10EB7-6318-4B3C-887B-F69758A7C257',
    sendBirdAppURL: 'https://api.sendbird.com',
    customerUserId: 339,
    customerIds: 'CS_01',
    customerName: 'Customer service',
    customerType: 'customer'
};

// paypal配置
export const paypalConfig = {
    paypal: true, // 默认使用paypal DSK
    paypalSDKAPI: 'https://www.paypalobjects.com/api/checkout.js',
    sandboxClientID: '07F10EB7-6318-4B3C-887B-F69758A7C257', // 沙盒，用于测试，用添加的sandbox账号测试能否交易成功
    productionClientID: '***' // 生产环境，部署上线时使用的环境
};

// 第三方配置
export const thirdPartyType = {
    facebook: 1,
    twitter: 2,
    line: 3,
    kakoo: 4,
    snapchat: 5
};

// Facebook配置
export const facebookConfig = {
    facebook: true, // 默认使用paypal DSK
    facebookSDKAPI: 'https://connect.facebook.net/en_US/sdk.js',
    facebookAppId: '247717165811073',
    facebookVersion: 'v3.1'
};

// Twitter配置
export const twitterConfig = {
    twitter: true, // 默认使用paypal DSK
    twitterSDKAPI: 'https://platform.twitter.com/widgets.js',
    twitterAPIKey: 'tsDbsfweUhFLcOoNFr2RFo5DO',
    twitterAPISecretKey: 'MeVPBkseBSK5qfgKw1iIuNANukvMEJsJAVefvDhnLy9zonvHiQ'
};



export const body = document.querySelector('body');