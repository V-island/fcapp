// gages
import Login from './pages/login';
import LoginMobile from './pages/login_mobile';
import Register from './pages/register';
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

import UserPrice from './pages/user_price';
import UserAccount from './pages/user_account';
import UserAccountHistory from './pages/user_account_history';
import UserScore from './pages/user_score';
import UserScoreHistory from './pages/user_score_history';

import UserProof from './pages/user_proof';
import UserInvite from './pages/user_invite';

import UserBlacklist from './pages/user_blacklist';
import UserSetting from './pages/user_setting';
import UserSettingSecurity from './pages/user_setting_security';
import UserSettingHelp from './pages/user_setting_help';
import UserSettingSuggestion from './pages/user_setting_suggestion';
import UserSettingAbout from './pages/user_setting_about';

// 全局变量
export const fcConfig = {
    autoInit: false, //自动初始化页面
    showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
    router: true, //默认使用router
    agora: true, //默认使用Agora DSK
    agoraAppId: '130106827c954803a398814859761e19',
    adminChannel: 'douliao',
    swipePanel: "left", //滑动打开侧栏
    swipePanelOnlyClose: true, //只允许滑动关闭，不允许滑动打开侧栏
    importJs: '@webcomponents/webcomponentsjs/webcomponents-lite',
    publicFile: {
        home_items: {
            name: 'home_items',
            path: '../public/home_items.html'
        },
        favorite_items: {
            name: 'favorite_items',
            path: '../public/favorite_items.html'
        },
        other_details_item: {
            name: 'other_details_item',
            path: '../public/other_details_item.html'
        },
        bar_tabs: {
            name: 'bar_tabs',
            path: '../public/bar_tabs.html'
        },
        live_preview: {
            name: 'live_preview',
            path: '../public/live_preview.html'
        },
        client_rtc: {
            name: 'client_rtc',
            path: '../public/client_rtc.html'
        },
        client_call: {
            name: 'client_call',
            path: '../public/client_call.html'
        }
    },
    pagesFile: [{
        name: 'login',
        path: '../pages/login.html',
        component: Login,
        init: 1,
        children: [{
            name: 'mobile',
            path: '../pages/login_mobile.html',
            component: LoginMobile,
            init: 1
        }, {
            name: 'find',
            path: '../pages/find_password.html',
            component: FindPassword,
            init: 1
        }, {
            name: 'set',
            path: '../pages/set_password.html',
            component: SetPassword,
            init: 1
        }]
    }, {
        name: 'register',
        path: '../pages/register.html',
        component: Register,
        init: 1,
        children: [{
            name: 'terms',
            path: '../pages/terms_service.html',
            component: Register,
            init: 1
        }]
    }, {
        name: 'home',
        path: '../pages/home.html',
        component: Home,
        init: 1,
        navTabs: 1,
        children: [{
            name: 'freevideo',
            path: '../pages/free_video.html',
            component: FreeVideo,
            init: 1
        }]
    }, {
        name: 'favorite',
        path: '../pages/favorite.html',
        component: Favorite,
        navTabs: 1
    }, {
        name: 'message',
        path: '../pages/message.html',
        component: Message,
        navTabs: 1
    }, {
        name: 'details',
        path: '../pages/other_details.html',
        component: OtherDetails
    }, {
        name: 'user',
        path: '../pages/user.html',
        component: User,
        navTabs: 1,
        children: [{
            name: 'detail',
            path: '../pages/user_detail.html',
            component: UserDetail
        }, {
            name: 'video',
            path: '../pages/user_video.html',
            component: UserVideo
        }, {
            name: 'watch',
            path: '../pages/user_watch.html',
            component: UserWatch
        }, {
            name: 'price',
            path: '../pages/user_price.html',
            component: UserPrice
        }, {
            name: 'account',
            path: '../pages/user_account.html',
            component: UserAccount,
            children: [{
                name: 'history',
                path: '../pages/user_account_history.html',
                component: UserAccountHistory
            }]
        }, {
            name: 'score',
            path: '../pages/user_score.html',
            component: UserScore,
            children: [{
                name: 'history',
                path: '../pages/user_score_history.html',
                component: UserScoreHistory
            }]
        }, {
            name: 'proof',
            path: '../pages/user_proof.html',
            component: UserProof
        }, {
            name: 'invite',
            path: '../pages/user_invite.html',
            component: UserInvite
        }, {
            name: 'blacklist',
            path: '../pages/user_blacklist.html',
            component: UserBlacklist
        }, {
            name: 'setting',
            path: '../pages/user_setting.html',
            component: UserSetting,
            children: [{
                name: 'security',
                path: '../pages/user_setting_security.html',
                component: UserSettingSecurity
            }, {
                name: 'help',
                path: '../pages/user_setting_help.html',
                component: UserSettingHelp
            }, {
                name: 'suggestion',
                path: '../pages/user_setting_suggestion.html',
                component: UserSettingSuggestion
            }, {
                name: 'about',
                path: '../pages/user_setting_about.html',
                component: UserSettingAbout
            }]
        }]
    }]
};

// Server 地址配置
export const baseURL = 'https://10.30.11.112:8443/live-app/open/gate';

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
    sendBirdAppURL: 'https://api.sendbird.com'
};

// 配置
export const paypalConfig = {
    paypal: true, // 默认使用paypal DSK
    paypalSDKAPI: 'https://www.paypalobjects.com/api/checkout.js',
    sandboxClientID: '07F10EB7-6318-4B3C-887B-F69758A7C257', // 沙盒，用于测试，用添加的sandbox账号测试能否交易成功
    productionClientID: '***' // 生产环境，部署上线时使用的环境
};

export const body = document.querySelector('body');