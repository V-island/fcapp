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
        publicFile: {
            actions_lives: {
                name: 'actions_lives',
                path: '../src/public/actions_lives.html'
            }
        },
        pagesFile: [{
            name: 'login',
            path: '../pages/login.html',
            // component: Login,
            dom: 'body',
            init: 1
        }, {
            name: 'sign',
            path: '/sign'
        }, {
            name: 'home',
            path: '../pages/home.html',
            // component: Home,
            dom: 'body',
            init: 1
        }, {
            name: 'live',
            path: '../pages/live.html',
            // component: Live,
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
            // component: User,
            mode: 'replace',
            dom: 'body',
            init: 1,
            children: [{
                name: 'user_detail',
                path: '../pages/user_detail.html',
                // component: UserDetail,
                mode: 'replace',
                dom: 'body',
                init: 1
            }]
        }]
    };

    $.fcConfig = $.extend(defaults, $.config);
    $.routesConfig = routes;

}(Zepto);