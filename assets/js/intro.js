// gages
import ErrorJS from './pages/404';
import Login from './pages/login';
import LoginMobile from './pages/login_mobile';
import Register from './pages/register';
import RegisterTerms from './pages/register_terms';
import RegisterSafeguard from './pages/register_safeguard';
import FindPassword from './pages/find_password';
import SetPassword from './pages/set_password';

import Home from './pages/home';
import Favorite from './pages/favorite';
import Message from './pages/message';
import User from './pages/user';

// 直播模块
import Live from './pages/live';
import LiveList from './pages/live_list';
import LiveAnchor from './pages/live_anchor';

import Video from './pages/video';
import VideoFree from './pages/video_free';

import OtherDetails from './pages/other_details';

// 用户中心
import UserDetail from './pages/user_detail';
import UserVideo from './pages/user_video';
import UserWatch from './pages/user_watch';
import UserPrice from './pages/user_price';
import UserProof from './pages/user_proof';
import UserInvite from './pages/user_invite';
import UserBlacklist from './pages/user_blacklist';
import UserInformation from './pages/user_information';

import UserAccount from './pages/user_account';
import UserAccountHistory from './pages/user_account_history';
import UserAccountTerms from './pages/user_account_terms';

import UserScore from './pages/user_score';
import UserScoreHistory from './pages/user_score_history';
import UserScoreExplain from './pages/user_score_explain';
import UserScoreWithdraw from './pages/user_score_withdraw';

import UserSetting from './pages/user_setting';
import UserSettingSecurity from './pages/user_setting_security';
import UserSettingHelp from './pages/user_setting_help';
import UserSettingSuggestion from './pages/user_setting_suggestion';
import UserSettingAbout from './pages/user_setting_about';

const adminBase = '../';

// 全局变量
export const fcConfig = {
    autoInit: false, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    router: true, //默认使用router
    swipePanel: "left", //滑动打开侧栏
    swipePanelOnlyClose: true, //只允许滑动关闭，不允许滑动打开侧栏
    importJs: '@webcomponents/webcomponentsjs/webcomponents-lite',
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
            name: 'safeguard',
            path: `${adminBase}pages/register_safeguard.html`,
            component: RegisterSafeguard,
            init: 1
        }, {
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
        navTabs: 1
    }, {
        name: 'live',
        path: `${adminBase}pages/live.html`,
        component: Live,
        init: 1,
        children: [{
            name: 'anchor',
            path: `${adminBase}pages/live_anchor.html`,
            component: LiveAnchor,
            init: 1
        }, {
            name: 'liveList',
            path: `${adminBase}pages/live_list.html`,
            component: LiveList,
            init: 1
        }]
    }, {
        name: 'video',
        path: `${adminBase}pages/video.html`,
        component: Video,
        init: 1,
        children: [{
            name: 'free',
            path: `${adminBase}pages/video_free.html`,
            component: VideoFree,
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
            name: 'price',
            path: adminBase + '../pages/user_price.html',
            component: UserPrice
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
                name: 'explain',
                path: `${adminBase}pages/user_score_explain.html`,
                component: UserScoreExplain
            }, {
                name: 'withdraw',
                path: `${adminBase}pages/user_score_withdraw.html`,
                component: UserScoreWithdraw
            }]
        }, {
            name: 'proof',
            path: adminBase + '../pages/user_proof.html',
            component: UserProof
        }, {
            name: 'invite',
            path: adminBase + '../pages/user_invite.html',
            component: UserInvite
        }, {
            name: 'blacklist',
            path: adminBase + '../pages/user_blacklist.html',
            component: UserBlacklist
        }, {
            name: 'information',
            path: adminBase + '../pages/user_information.html',
            component: UserInformation
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
export const domainURL = location.pathname == '/' ? location.origin : location.origin + location.pathname;

// Server 地址配置
// export const baseURL = 'https://shineliveapp.com/live-app/open/gate.do';
// export const chinaAppLogin = 'https://shineliveapp.com/live-app/login/appLogin.do';
// export const chinaRegister = 'https://shineliveapp.com/live-app/register/updatePassword.do';
// export const baseURL = 'https://shinelive.me/live-app/open/gate.do';
// export const chinaAppLogin = 'https://shinelive.me/live-app/login/appLogin.do';
// export const chinaRegister = 'https://shinelive.me/live-app/register/updatePassword.do';
// 本地地址
export const baseURL = 'https://192.168.1.211:8443/live-app/open/gate.do';
export const chinaAppLogin = 'https://192.168.1.211:8443/live-app/login/appLogin';
export const chinaRegister = 'https://192.168.1.211:8443/live-app/register/updatePassword';

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
    // sendBirdAppID: '07F10EB7-6318-4B3C-887B-F69758A7C257',
    sendBirdAppID: '739F5F33-F0B6-4AA5-B970-B20DD29599AA',
    sendBirdSandboxAppID: '739F5F33-F0B6-4AA5-B970-B20DD29599AA',
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
    paypalSuccessUrl: 'http://52.53.136.48:8080/live-app/pay/success',
    sandboxClientID: '***', // 沙盒，用于测试，用添加的sandbox账号测试能否交易成功
    productionClientID: '***' // 生产环境，部署上线时使用的环境
};

// Codapay配置
export const codapayConfig = {
    codapay: true, // 默认使用codapay DSK
    codapaySDKAPI: 'https://airtime.codapayments.com/airtime/js/airtime_v1.0.js',
    codapaySandboxSDKAPI: 'https://sandbox.codapayments.com/airtime/js/airtime_v1.0.js',
    codapaySandboxUrl: 'https://sandbox.codapayments.com/airtime/begin',
    codapayProductionUrl: 'https://airtime.codapayments.com/airtime/begin',
    codapaySuccessUrl: 'http://52.53.136.48:8080/live-app/pay/success'
};

// 第三方配置
export const thirdPartyType = {
    facebook: 1,
    twitter: 2,
    line: 3,
    kakoo: 4,
    snapchat: 5
};

// 支付配置
export const payType = {
    googlePay: 1,
    paypalPay: 2,
    linePay: 3,
    kakooPay: 4,
    paytmPay: 5,
    visaPay: 6,
    codaPay: 7,
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