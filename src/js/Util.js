let Util = {
    /**
     * 获取 url 的 fragment（即 hash 中去掉 # 的剩余部分）
     *
     * 如果没有则返回空字符串
     * 如: http://example.com/path/?query=d#123 => 123
     *
     * @param {String} url url
     * @returns {String}
     */
    getUrlFragment: function(url) {
        let hashIndex = url.indexOf('#');
        return hashIndex === -1 ? '' : url.slice(hashIndex + 1);
    },
    /**
     * 获取一个链接相对于当前页面的绝对地址形式
     *
     * 假设当前页面是 http://a.com/b/c
     * 那么有以下情况:
     * d => http://a.com/b/d
     * /e => http://a.com/e
     * #1 => http://a.com/b/c#1
     * http://b.com/f => http://b.com/f
     *
     * @param {String} url url
     * @returns {String}
     */
    getAbsoluteUrl: function(url) {
        let link = document.createElement('a');
        link.setAttribute('href', url);
        let absoluteUrl = link.href;
        link = null;
        return absoluteUrl;
    },
    /**
     * 获取一个 url 的基本部分，即不包括 hash
     *
     * @param {String} url url
     * @returns {String}
     */
    getBaseUrl: function(url) {
        let hashIndex = url.indexOf('#');
        return hashIndex === -1 ? url.slice(0) : url.slice(0, hashIndex);
    },
    /**
     * 把一个字符串的 url 转为一个可获取其 base 和 fragment 等的对象
     *
     * @param {String} url url
     * @returns {UrlObject}
     */
    toUrlObject: function(url) {
        let fullUrl = this.getAbsoluteUrl(url),
            baseUrl = this.getBaseUrl(fullUrl),
            fragment = this.getUrlFragment(url);

        return {
            base: baseUrl,
            full: fullUrl,
            original: url,
            fragment: fragment
        };
    },
    /**
     * 判断浏览器是否支持 sessionStorage，支持返回 true，否则返回 false
     * @returns {Boolean}
     */
    supportStorage: function() {
        let mod = 'sm.router.storage.ability';
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export default Util;