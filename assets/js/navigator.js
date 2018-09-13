// 方法很复杂，但是可以不用具体看，知识用来转化vapidPublicKey用
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
/* ========================== */
/* service worker push相关部分 */
/* ========================== */
/**
 * 注意这里修改了前一篇文章中service worker注册部分的代码
 * 将service worker的注册封装为一个方法，方便使用
 * @param {string} file service worker文件路径
 * @return {Promise}
 */
function registerServiceWorker(file) {
    return navigator.serviceWorker.register(file);
}

/**
 * 用户订阅相关的push信息
 * 会生成对应的pushSubscription数据，用于标识用户与安全验证
 * @param {ServiceWorker Registration} registration
 * @param {string} publicKey 公钥
 * @return {Promise}
 */
function subscribeUserToPush(registration, publicKey) {
    var subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    };
    return registration.pushManager.subscribe(subscribeOptions).then(function(pushSubscription) {
        // console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
        return pushSubscription;
    });
}

/**
 * 将浏览器生成的subscription信息提交到服务端
 * 服务端保存该信息用于向特定的客户端用户推送
 * @param {string} body 请求体
 * @param {string} url 提交的api路径，默认为/subscription
 * @return {Promise}
 */
function sendSubscriptionToServer(body, url) {
    url = url || '/subscription';
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 60000;
        xhr.onreadystatechange = function() {
            var response = {};
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (e) {
                    response = xhr.responseText;
                }
                resolve(response);
            } else if (xhr.readyState === 4) {
                resolve();
            }
        };
        xhr.onabort = reject;
        xhr.onerror = reject;
        xhr.ontimeout = reject;
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    var publicKey = 'BOEQSjdhorIf8M0XFNlwohK3sTzO9iJwvbYU-fuXRF0tvRpPPMGO6d_gJC_pUQwBT7wD8rKutpNTFHOHN3VqJ0A';
    // BAyb_WgaR0L0pODaR7wWkxJi__tWbM1MPBymyRDFEGjtDCWeRYS9EF7yGoCHLdHJi6hikYdg4MuYaK0XoD0qnoY
    // 注册service worker
    registerServiceWorker('./sw.js').then(function(registration) {
        // console.log('Service Worker 注册成功');
        // 开启该客户端的消息推送订阅功能
        return subscribeUserToPush(registration, publicKey);
    }).then(function(subscription) {
        // 将生成的客户端订阅信息存储在自己的服务器上
        return sendSubscriptionToServer(JSON.stringify(subscription));
    }).catch(function(err) {
        console.log(err);
    });
}
/* ========================== */