/**
 * service worker
 */
const cacheName = 'Shine_Live_Cache_v1.0.0';
const apiCacheName = 'Shine_Live_Api_v1.0.0';
const cacheFiles = [
    '/',
    '/index.html',
    '/assets/css/fc.css',
    '/assets/js/fc.js',
    '/assets/js/fc-extend.js',
    '/assets/js/webcomponentsLite.js',
    '/pages/404.html',
    '/pages/favorite.html',
    '/pages/find_password.html',
    '/pages/free_video.html',
    '/pages/home.html',
    '/pages/live.html',
    '/pages/login.html',
    '/pages/login_mobile.html',
    '/pages/message.html',
    '/pages/other_details.html',
    '/pages/register.html',
    '/pages/register_terms.html',
    '/pages/set_password.html',
    '/pages/user.html',
    '/pages/user_account.html',
    '/pages/user_account_history.html',
    '/pages/user_account_terms.html',
    '/pages/user_detail.html',
    '/pages/user_score.html',
    '/pages/user_score_history.html',
    '/pages/user_score_withdraw.html',
    '/pages/user_setting.html',
    '/pages/user_setting_about.html',
    '/pages/user_setting_help.html',
    '/pages/user_setting_security.html',
    '/pages/user_setting_suggestion.html',
    '/pages/user_video.html',
    '/pages/user_watch.html',
    '/public/bar_tabs.html',
    '/public/client_call.html',
    '/public/client_rtc.html',
    '/public/favorite_items.html',
    '/public/home_items.html',
    '/public/live_preview.html',
    '/public/other_details_item.html'
];

// 监听install事件，安装完成后，进行文件缓存
self.addEventListener('install', (event) => {
    // console.log('Service Worker 状态： install');
    var cacheOpenPromise = caches.open(cacheName).then((cache) => {
        return cache.addAll(cacheFiles);
    });
    event.waitUntil(cacheOpenPromise);
});

// 监听activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
self.addEventListener('activate', (event) => {
    // console.log('Service Worker 状态： activate');
    var cachePromise = caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => {
            if (key !== cacheName && key !== apiCacheName) {
                return caches.delete(key);
            }
        }));
    })
    event.waitUntil(cachePromise);
    // 注意不能忽略这行代码，否则第一次加载会导致fetch事件不触发
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const videoCache = event.request.destination.match(/video/g);

    if (videoCache) {
        return false;
    }
    // 需要缓存的xhr请求
    var cacheRequestUrls = [
        '/live-app/open/gate.do'
    ];
    // console.log('现在正在请求：' + event.request.url);

    // 判断当前请求是否需要缓存
    var needCache = cacheRequestUrls.some((url) => {
        return event.request.url.indexOf(url) > -1;
    });

    if (needCache) {
        // 需要缓存
        // 使用fetch请求数据，并将请求结果clone一份缓存到cache
        // 此部分缓存后在browser中使用全局变量caches获取
        caches.open(apiCacheName).then((cache) => {
            return fetch(event.request).then((response) => {
                cache.put(event.request.url, response.clone());
                return response;
            });
        });
    }
    else {
        // 非api请求，直接查询cache
        // 如果有cache则直接返回，否则通过fetch请求
        event.respondWith(
            caches.match(event.request).then((cache) => {
                return cache || fetch(event.request);
            }).catch((err) => {
                // console.log(err);
                return fetch(event.request);
            })
        );
    }
});

/* ============== */
/* push处理相关部分 */
/* ============== */
// 添加service worker对push的监听
self.addEventListener('push', (event) => {
    var data = event.data;
    if (event.data) {
        data = data.json();
        console.log('push的数据为：', data);
        self.registration.showNotification(data.text);
    }
    else {
        console.log('push没有任何数据');
    }
});
/* ============== */