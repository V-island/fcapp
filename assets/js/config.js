+ function($) {
    "use strict";

    const routes = [{
        path: '/login',
        name: 'login',
        template: {
            name: 'login',
            path: '../pages/login.html',
            // component: Login,
            dom: 'body',
            init: 1
        }
    }, {
        path: '/sign',
        name: 'sign'
    }, {
        path: '/home',
        name: 'home',
        template: {
            name: 'home',
            path: '../pages/home.html',
            // component: Home,
            dom: 'body',
            init: 1
        }
    }, {
        path: '/live',
        name: 'live',
        template: {
            name: 'live',
            path: '../pages/live.html',
            // component: Live,
            mode: 'replace',
            dom: 'body',
            init: 1
        }
    }, {
        path: '/favorite',
        name: 'favorite'
    }, {
        path: '/message',
        name: 'message'
    }, {
        path: '/user',
        name: 'user',
        template: {
            name: 'user',
            path: '../pages/user.html',
            // component: User,
            mode: 'replace',
            dom: 'body',
            init: 1
        },
        children: [{
            path: '/detail',
            name: 'detail',
            template:  {
                name: 'user_detail',
                path: '../pages/user_detail.html',
                // component: UserDetail,
                mode: 'replace',
                dom: 'body',
                init: 1
            }
        }]
    }]

    $.routesConfig = routes;

}(Zepto);