// gages
import Login from './pages/login';
import Home from './pages/home';
import Live from './pages/live';

import User from './pages/user';
import UserDetail from './pages/user_detail';

+ function($) {
    "use strict";

    //全局配置
    const defaults = {
        autoInit: false, //自动初始化页面
        showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
        router: true, //默认使用router
        swipePanel: "left", //滑动打开侧栏
        swipePanelOnlyClose: true //只允许滑动关闭，不允许滑动打开侧栏
    };

    const routes = {
        //apihost:'http://192.168.8.15:9000',
        //host:'http://120.76.84.82:8090/',
        //apiip: 'http://192.168.0.126:8000',
        //apitest: 'http://www.easy-mock.com/mock/59c4c72ee0dc663341b4ca37/v1/',
        //pagesRoot: '../pages/',
        importJs: '@webcomponents/webcomponentsjs/webcomponents-lite',
        publicFile: {
            actions_lives: {
                name: 'actions_lives',
                path: '../src/public/actions_lives.html'
            }
        },
        pagesFile: [{
            name: 'login',
            path: '../pages/login.html',
            component: Login,
            dom: 'body',
            init: 1
        }, {
            name: 'sign',
            path: '/sign'
        }, {
            name: 'home',
            path: '../pages/home.html',
            component: Home,
            dom: 'body',
            init: 1
        }, {
            name: 'live',
            path: '../pages/live.html',
            component: Live,
            mode: 'replace',
            dom: 'body',
            init: 1
        }, {
            path: '/favorite',
            name: 'favorite'
        }, {
            path: '/message',
            name: 'message'
        }, {
            name: 'user',
            path: '../pages/user.html',
            component: User,
            mode: 'replace',
            dom: 'body',
            init: 1,
            children: [{
                name: 'detail',
                path: '../pages/user_detail.html',
                component: UserDetail,
                mode: 'replace',
                dom: 'body',
                init: 1
            }]
        }]
    };

    // $.fcConfig = $.extend(defaults, $.config);
    $.fcConfig = defaults;
    $.routesConfig = routes;

}(jQuery);