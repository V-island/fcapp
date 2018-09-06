import Template from 'art-template/lib/template-web';
// import webcomponentsLite from '@webcomponents/webcomponentsjs/webcomponents-lite';
import Tabs from './tabs';
import {
    fcConfig
} from './intro';
import {
    getLangConfig
} from './lang';

import {
    checkLogin,
    checkCountry
} from './api';

import {
    jumpURL,
    replaceNote,
    getUrlFragment
} from './util';

+function($) {
    'use strict';

    const CONFIG = {
        rootUrl: 'home',
        loginUrl: 'login'
    }

    const EVENTS = {
        pageLoadStart: 'pageLoadStart', // ajax 开始加载新页面前
        pageLoadCancel: 'pageLoadCancel', // 取消前一个 ajax 加载动作后
        pageLoadError: 'pageLoadError', // ajax 加载页面失败后
        pageLoadComplete: 'pageLoadComplete', // ajax 加载页面完成后（不论成功与否）
        pageAnimationStart: 'pageAnimationStart', // 动画切换 page 前
        pageAnimationEnd: 'pageAnimationEnd', // 动画切换 page 结束后
        beforePageRemove: 'beforePageRemove', // 移除旧 document 前（适用于非内联 page 切换）
        pageRemoved: 'pageRemoved', // 移除旧 document 后（适用于非内联 page 切换）
        beforePageSwitch: 'beforePageSwitch', // page 切换前，在 pageAnimationStart 前，beforePageSwitch 之后会做一些额外的处理才触发 pageAnimationStart
        pageInit: 'pageInitInternal' // 目前是定义为一个 page 加载完毕后（实际和 pageAnimationEnd 等同）
    }

    const MSG = {
        support: '支持导入!',
        nosupport: '不支持导入|-_-)',
        errorsupport: '导入错误：',
        savedone: '本地保存完成',
        alreadysave: '本地已存在',
        cantfindobj: 'obj对象没找到！',
        importready: '所有导入已经加载完成！',
        allready: '导入加载已经完成，元素已经注册！',
        masthasname: '必须指定名称',
        maststring: '必须是字符串',
        updatesuccess: '更新成功！',
        errorLastState: 'Missing last state when backward or forward'
    }

    const RULE = {
        name: 'test',
        path: '../test/test.html',
        component: false,
        init: 0
    }

    const LANG = getLangConfig();

    /**
     * 验证浏览器是否支持CustomEvent
     * @return {boolean}
     */
    if (!window.CustomEvent) {
        window.CustomEvent = function(type, config) {
            config = config || { bubbles: false, cancelable: false, detail: undefined};
            let e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);
            return e;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    /**
     * 验证浏览器是否支持html import导入
     * @return {boolean}
     */
    if (!('import' in document.createElement('link'))) {
        console.log(MSG.nosupport);
    }

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
         * 获取页面hash
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        getHashpage: function(str) {
            let hash = str === undefined ? location.hash : str;

            if (hash.indexOf('?') > -1) {
                hash = hash.split('?')[0];
            }

            let _hash = hash.split('#')[1];
            let hashIndex = _hash.indexOf('/');
            return hashIndex === -1 ? '' : _hash.slice(hashIndex + 1);
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
                hashUrl = this.getHashpage(url),
                fragment = this.getUrlFragment(url);
            return {
                base: baseUrl,
                full: fullUrl,
                hash: hashUrl,
                original: url,
                fragment: fragment
            };
        },
        /**
         * 判断浏览器是否支持 sessionStorage，支持返回 true，否则返回 false
         * @returns {Boolean}
         */
        supportStorage: function() {
            let mod = 'fc.router.storage.ability';
            try {
                sessionStorage.setItem(mod, mod);
                sessionStorage.removeItem(mod);
                return true;
            } catch(e) {
                return false;
            }
        },
        /**
         * 去注释以及style script 换行符 标签空格
         * @param  {[type]} str [description]
         * @return {[type]}     [description]
         */
        replaceNote: function(str) {
            return str.replace(/(\n)/g, '')
                .replace(/(\t)/g, '')
                .replace(/(\r)/g, '')
                .replace(/<!--[\s\S]*?--\>/g, '')
                .replace(/<style[^>]*>[\s\S]*?<\/[^>]*style>/gi, '')
                //.replace(/<script[^>]*>[\s\S]*?<\/[^>]*script>/gi,'')
                .replace(/>\s*/g, '>')
                .replace(/\s*</g, '<');
        },
        /**
         * 监听URL
         * @return {[type]} [description]
         */
        oldchange: function() {
            if ("onhashchange" in window.document.body) {
                return;
            }

            let location = window.location,
                oldURL = location.href,
                oldHash = location.hash;

            // 每隔100ms检测一下location.hash是否发生变化
            setInterval(function() {
                let newURL = location.href,
                    newHash = location.hash;

                // 如果hash发生了变化,且绑定了处理函数...
                if (newHash != oldHash && typeof window.onhashchange === "function") {
                    // execute the handler
                    window.onhashchange({
                        type: "hashchange",
                        oldURL: oldURL,
                        newURL: newURL
                    });

                    oldURL = newURL;
                    oldHash = newHash;
                }
            }, 100);
        }

    }

    let routerConfig = {
        sectionGroupClass: 'page-group',
        // 表示是当前 page 的 class
        curPageClass: 'page-current',
        // 用来辅助切换时表示 page 是 visible 的,
        // 之所以不用 curPageClass，是因为 page-current 已被赋予了「当前 page」这一含义而不仅仅是 display: block
        // 并且，别的地方已经使用了，所以不方便做变更，故新增一个
        visiblePageClass: 'page-visible',
        // 表示是 page 的 class，注意，仅是标志 class，而不是所有的 class
        pageClass: 'page',
        // 表示是当前 nav 的 class
        barTabClass: '.bar-tab',
        // 根目录
        rootUrl: '#/home',
        notloginUrl: '#/login/mobile'
    }

    let DIRECTION = {
        leftToRight: 'from-left-to-right',
        rightToLeft: 'from-right-to-left'
    }

    let theHistory = window.history;

    class Router {

        constructor(options) {
            this.sessionNames = {
                currentState: 'fc.router.currentState',
                maxStateId: 'fc.router.maxStateId'
            };
            this.matcher = this._createRouteMap(options || []);
            this._init();
            this.xhr = null;
            Util.oldchange();
            window.addEventListener("hashchange", this._onHashchange.bind(this), false);
        }

        /**
         * 初始化
         *
         * - 把当前文档内容缓存起来
         * - 查找默认展示的块内容，查找顺序如下
         *      1. id 是 url 中的 fragment 的元素
         *      2. 有当前块 class 标识的第一个元素
         *      3. 第一个块
         * - 初始页面 state 处理
         *
         * @private
         */
        _init() {

            this.$view = $('body');

            // 用来保存 document 的 map
            this.cache = {};
            let $pages = $('.' + routerConfig.pageClass);
            let currentUrl = jumpURL();

            if (!$pages.length) {
                this._switchToDocument(currentUrl);
            }
        }

        /**
         * 调用 history.back()
         */
        back() {
            theHistory.go(-2);
            // theHistory.back();
        }

        /**
         * 初始化router图
         * @param  {[type]} routes [description]
         * @return {[type]}        [description]
         */
        _createRouteMap(routes, oldPathList) {
            let pathList = oldPathList || [];
            let _self = this;

            routes.forEach(function(route) {
                _self._addRouteRecord(route, pathList, _self);
            });
            return pathList;
        }

        /**
         * 添加router
         * @param {[type]} route       [description]
         * @param {[type]} oldPathList [description]
         * @param {[type]} _this       [description]
         * @param {[type]} matchAs     [description]
         */
        _addRouteRecord(route, oldPathList, _this, matchAs) {
            let pathList = oldPathList || [];
            let routes = {
                name: matchAs === undefined ? route.name : matchAs,
                path: route.path,
                component: route.component,
                template: route.template || true,
                init: route.init || 0,
                navTabs: route.navTabs || 0
            };

            if (route.children) {
                route.children.forEach(function(child) {
                    let childMatchAs = child.name ? (routes.name +'/'+ child.name) : undefined;
                    _this._addRouteRecord(child, pathList, _this, childMatchAs);
                });
            }
            pathList.push(routes);
        }

        /**
         * 载入显示一个新的文档
         *
         * - 如果有缓存，那么直接利用缓存来切换
         * - 否则，先把页面加载过来缓存，然后再切换
         *      - 如果解析失败，那么用 location.href 的方式来跳转
         *
         * 注意：不能在这里以及其之后用 location.href 来 **读取** 切换前的页面的 url，
         *     因为如果是 popState 时的调用，那么此时 location 已经是 pop 出来的 state 的了
         *
         * @param {String} url 新的文档的 url
         * @param {Boolean=} ignoreCache 是否不使用缓存强制加载页面
         * @param {String=} direction 新文档切入的方向
         * @private
         */
        _switchToDocument(url, ignoreCache, direction) {
            if (ignoreCache === undefined) {
                ignoreCache = false;
            }

            if (location.hash == '' || location.hash == '#/' || location.hash === undefined) {
                // if (checkLogin()) {
                //     return location.href = jumpURL(routerConfig.notloginUrl);
                // }
                return location.href = jumpURL(routerConfig.rootUrl);
            }

            if (ignoreCache) {
                delete this.cache[url];
            }

            let cacheDocument = this.cache[url];
            let context = this;
            if (cacheDocument) {
                this._doSwitchDocument(url, direction);
            } else {
                this._loadDocument(url, {
                    success: function(doc, param) {
                        try {
                            context._parseDocument(url, doc, param);
                            context._doSwitchDocument(url, direction);
                        } catch (e) {
                            // location.hash = url;
                        }
                    },
                    error: function() {
                        // location.hash = url;
                    }
                });
            }
        }

        /**
         * 利用缓存来做具体的切换文档操作
         *
         * - 确定待切入的文档的默认展示 section
         * - 把新文档 append 到 view 中
         * - 动画切换文档
         * - 如果需要 pushState，那么把最新的状态 push 进去并把当前状态更新为该状态
         *
         * @param {String} url 待切换的文档的 url
         * @param {String} direction 动画切换方向，默认是 DIRECTION.rightToLeft
         * @private
         */
        _doSwitchDocument(url, direction) {
            // 判断是否登录
            if (checkLogin() && this.cache[url].init !== 1) {
                return location.href = jumpURL(routerConfig.notloginUrl);
            }
            // if (this.cache[url].init !== 1) {
            //     return location.href = '#/login';
            // }

            //读取成功后
            // window.addEventListener('HTMLImportsLoaded', function(e) {
            //     console.info(MSG.importready);
            //     obj[fn]();
            // });

            // window.addEventListener('WebComponentsReady', function(e) {
            //     console.info(MSG.allready);
            //     obj[fn]();
            // });

            // 判读国家列表
            let _country = checkCountry();
            _country.then(() => {
                let classDoc = this.cache[url].component.attachTo(this.cache[url].content);
                classDoc.on('pageLoadStart', (newDoc)  => {
                    let $currentDoc = this.$view.find('.' + routerConfig.sectionGroupClass);
                    let $newDoc = $(newDoc);
                    let $allSection = $newDoc.find('.' + routerConfig.pageClass);
                    let $visibleSection = $newDoc.find('.' + routerConfig.curPageClass);

                    if (!$visibleSection.length) {
                        $visibleSection = $allSection.eq(0);
                    }

                    if (!$visibleSection.attr('id')) {
                        $visibleSection.attr('id', this._generateRandomId());
                    }

                    let $currentSection = this._getCurrentSection();

                    if (!$currentSection.length) {
                        $currentSection.trigger(EVENTS.beforePageSwitch, [$currentSection.attr('id'), $currentSection]);
                    }

                    if (!$allSection.length) {
                        $allSection.removeClass(routerConfig.curPageClass);
                    }

                    // 判断Nav Tabs
                    if (this.cache[url].navTabs === 1) {
                        let tabs = new Tabs($visibleSection[0]);
                        direction = true;
                    }

                    $visibleSection.addClass(routerConfig.curPageClass);
                    // prepend 而不 append 的目的是避免 append 进去新的 document 在后面，
                    // 其里面的默认展示的(.page-current) 的页面直接就覆盖了原显示的页面（因为都是 absolute）
                    this.$view.prepend($newDoc);
                    $('[data-ripple]').ripple();
                    if ($currentSection.length) this._animateDocument($currentDoc, $newDoc, $visibleSection, direction);
                });
            });
        }

        /**
         * link import 加载 url 指定的页面内容
         *
         * 加载过程中会发出以下事件
         *  pageLoadCancel: 如果前一个还没加载完,那么取消并发送该事件
         *  pageLoadStart: 开始加载
         *  pageLodComplete: ajax complete 完成
         *  pageLoadError: ajax 发生 error
         *
         *
         * @param {String} url url
         * @param {Object=} callback 回调函数配置，可选，可以配置 success\error 和 complete
         *      所有回调函数的 this 都是 null，各自实参如下：
         *      success: $doc
         *      error: e
         *
         * @private
         */
        _loadDocument(url, callback) {
            let _self = this;
            let param = _self._createTemplate(url);
            let link = document.createElement('link');
            link.rel = 'import';
            link.id = param.name;
            link.href = param.path;
            callback = callback || {};

            link.onload = function(e) {
                // console.log('Loaded import: ' + e.target.href);
                let _target = e.target.import;
                let bodyHTML = typeof(_target.body) == 'undefined' ? _target.innerHTML : _target.body.innerHTML;

                if (typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML == '') {
                    bodyHTML = _target.head.innerHTML;
                }else if(typeof(_target.head) != 'undefined' && _target.head != '' && bodyHTML != ''){
                    bodyHTML = _target.head.innerHTML + bodyHTML;
                }
                //MAC safari bug
                if (bodyHTML == '') {
                    for (var i = 0; i < _target.children.length; i++) {
                        bodyHTML = bodyHTML + _target.children[i].outerHTML;
                    }
                }

                let doc = replaceNote(bodyHTML);
                callback.success && callback.success.call(null, doc, param);

                //加载完成后清除头部引用
                if (!link.readyState || 'link' === link.readyState || 'complete' === link.readyState) {
                    link.onload = link.onreadystatechange = null;
                    link.parentNode.removeChild(link);
                }
            };
            link.onerror = function(e) {
                console.error(MSG.errorsupport + e.target.href);
                // callback.error && callback.error.call(null, e);
                self.dispatch(EVENTS.pageLoadError);
                return;
            };
            _self.dispatch(EVENTS.pageLoadStart);
            document.head.appendChild(link);
        }

        /**
         * 把一个页面的相关信息保存到 this.cache 中
         *
         * 以页面的 baseUrl 为 key,而 value 则是一个 DocumentCache
         *
         * @param {*} doc doc
         * @param {String} url url
         * @param {*} component component
         * @private
         */
        _parseDocument(url, doc, param) {
            // let $doc = $(doc);

            // if (!$doc.hasClass(routerConfig.sectionGroupClass)) {
            //     throw new Error('missing router view mark: ' + routerConfig.sectionGroupClass);
            // }

            this.cache[url] = {
                content: doc,
                component: param.component,
                navTabs: param.navTabs,
                init: param.init
            };
        }

        /**
         * 从一个文档切换为显示另一个文档
         *
         * @param $from 目前显示的文档
         * @param $to 待切换显示的新文档
         * @param $visibleSection 新文档中展示的 section 元素
         * @param direction 新文档切入方向
         * @private
         */
        _animateDocument($from, $to, $visibleSection, direction) {
            var sectionId = $visibleSection.attr('id');

            var $visibleSectionInFrom = $from.find('.' + routerConfig.curPageClass);
            $visibleSectionInFrom.addClass(routerConfig.visiblePageClass).removeClass(routerConfig.curPageClass);

            $visibleSection.trigger(EVENTS.pageAnimationStart, [sectionId, $visibleSection]);

            if (direction) {
                $visibleSectionInFrom.removeClass(routerConfig.visiblePageClass);
                return $from.remove();
            }

            this._animateElement($from, $to, direction);
            $from.animationEnd(function() {
                $visibleSectionInFrom.removeClass(routerConfig.visiblePageClass);
                // 移除 document 前后，发送 beforePageRemove 和 pageRemoved 事件
                $(window).trigger(EVENTS.beforePageRemove, [$from]);
                $from.remove();
                $(window).trigger(EVENTS.pageRemoved);
            });

            $to.animationEnd(function() {
                $visibleSection.trigger(EVENTS.pageAnimationEnd, [sectionId, $visibleSection]);
                // 外层（init.js）中会绑定 pageInitInternal 事件，然后对页面进行初始化
                $visibleSection.trigger(EVENTS.pageInit, [sectionId, $visibleSection]);
            });
        }

        /**
         * 匹配路由
         * @param  {[type]} Href [description]
         * @return {[type]}      [description]
         */
        _createTemplate(Href) {
            let rules = this.matcher;
            let template = false;
            Href = Util.getHashpage(Href);
            rules.forEach(function(child) {
                let name = child.name !== undefined ? child.name : routerConfig.rootUrl;
                if (Href == name) template = child;
            });
            return template ? template : this._createTemplate('#/404');
        }

        /**
         * hashchange事件
         *
         */
        _onHashchange(e) {
            // console.log('hashchange');
            let _self = this;
            let oldURL = e.oldURL;
            // let newURL = e.newURL;
            let newHash = getUrlFragment(e.newURL);
            let newURL = jumpURL(`#${newHash}`);

            // if (oldURL.indexOf('#') == -1) {
            //     return;
            // }
            if (!Util.getHashpage(newURL)) {
                return;
            }

            this._switchToDocument(newURL);
        }

        /**
         * 切换显示两个元素
         *
         * 切换是通过更新 class 来实现的，而具体的切换动画则是 class 关联的 css 来实现
         *
         * @param $from 当前显示的元素
         * @param $to 待显示的元素
         * @param direction 切换的方向
         * @private
         */
        _animateElement($from, $to, direction) {
            // todo: 可考虑如果入参不指定，那么尝试读取 $to 的属性，再没有再使用默认的
            // 考虑读取点击的链接上指定的方向
            if (typeof direction === 'undefined') {
                direction = DIRECTION.rightToLeft;
            }

            var animPageClasses = [
                'page-from-center-to-left',
                'page-from-center-to-right',
                'page-from-right-to-center',
                'page-from-left-to-center'].join(' ');

            var classForFrom, classForTo;
            switch(direction) {
                case DIRECTION.rightToLeft:
                    classForFrom = 'page-from-center-to-left';
                    classForTo = 'page-from-right-to-center';
                    break;
                case DIRECTION.leftToRight:
                    classForFrom = 'page-from-center-to-right';
                    classForTo = 'page-from-left-to-center';
                    break;
                default:
                    classForFrom = 'page-from-center-to-left';
                    classForTo = 'page-from-right-to-center';
                    break;
            }

            $from.removeClass(animPageClasses).addClass(classForFrom);
            $to.removeClass(animPageClasses).addClass(classForTo);

            $from.animationEnd(function() {
                $from.removeClass(animPageClasses);
            });
            $to.animationEnd(function() {
                $to.removeClass(animPageClasses);
            });
        }

        /**
         * 获取当前显示的第一个 section
         *
         * @returns {*}
         * @private
         */
        _getCurrentSection() {
            return this.$view.find('.' + routerConfig.curPageClass).eq(0);
        }

        /**
         * 生成一个随机的 id
         *
         * @returns {string}
         * @private
         */
        _generateRandomId() {
            return "page-" + (+new Date());
        }

        /**
         * 创建并触发自定义函数
         * @param  {[type]} event EVENTS事件
         */
        dispatch(event) {
            let e = new CustomEvent(event, {
                bubbles: true,
                cancelable: true
            });

            window.dispatchEvent(e);
        }

    }

    /**
     * 判断一个链接是否使用 router 来处理
     *
     * @param $link
     * @returns {boolean}
     */
    function isInRouterBlackList($link) {
        var classBlackList = [
            'external',
            'tab-link',
            'open-popup',
            'close-popup',
            'open-panel',
            'close-panel'
        ];

        for (var i = classBlackList.length -1 ; i >= 0; i--) {
            if ($link.hasClass(classBlackList[i])) {
                return true;
            }
        }

        var linkEle = $link.get(0);
        var linkHref = linkEle.getAttribute('href');

        var protoWhiteList = [
            'http',
            'https'
        ];

        //如果非noscheme形式的链接，且协议不是http(s)，那么路由不会处理这类链接
        if (/^(\w+):/.test(linkHref) && protoWhiteList.indexOf(RegExp.$1) < 0) {
            return true;
        }

        //noinspection RedundantIfStatementJS
        if (linkEle.hasAttribute('external')) {
            return true;
        }

        return false;
    }

    /**
     * 自定义是否执行路由功能的过滤器
     *
     * 可以在外部定义 fcConfig.routerFilter 函数，实参是点击链接的 Zepto 对象。
     *
     * @param $link 当前点击的链接的 Zepto 对象
     * @returns {boolean} 返回 true 表示执行路由功能，否则不做路由处理
     */
    function customClickFilter($link) {
        var customRouterFilter = fcConfig.routerFilter;
        if ($.isFunction(customRouterFilter)) {
            var filterResult = customRouterFilter($link);
            if (typeof filterResult === 'boolean') {
                return filterResult;
            }
        }

        return true;
    }

    $(function() {
        // 用户可选关闭router功能
        if (!fcConfig.router) {
            return;
        }

        if (!Util.supportStorage()) {
            return;
        }

        let router = $.router = new Router(fcConfig.pagesFile);

        $(document).on('click', 'a', function(e) {
            let $target = $(e.currentTarget);
            let filterResult = customClickFilter($target);
            if (!filterResult) {
                return;
            }

            if (isInRouterBlackList($target)) {
                return;
            }

            e.preventDefault();

            if ($target.hasClass('back')) {
                router.back();
            } else {
                let url = $target.attr('href');
                if (!url || url === '#') {
                    return;
                }
                location.hash = url;
            }
        });
    });
}(jQuery);

/**
 * @typedef {Object} State
 * @property {Number} id
 * @property {String} url
 * @property {String} pageId
 */

/**
 * @typedef {Object} UrlObject 字符串 url 转为的对象
 * @property {String} base url 的基本路径
 * @property {String} full url 的完整绝对路径
 * @property {String} origin 转换前的 url
 * @property {String} fragment url 的 fragment
 */

/**
 * @typedef {Object} DocumentCache
 * @property {*|HTMLElement} $doc 看做是 $(document)
 * @property {*|HTMLElement} $content $doc 里的 routerConfig.innerViewClass 元素
 */
