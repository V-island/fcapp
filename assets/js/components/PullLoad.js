import BScroll from 'better-scroll';
import {
    extend,
    createDivEl
} from '../util';

class PullLoad {
    constructor(element, options, config) {
        this.options = {
            startX: 0,
            startY: 0,
            scrollX: false,
            scrollY: true,
            freeScroll: false,
            directionLockThreshold: 5,
            eventPassthrough: '',
            click: false,
            dblclick: false,
            tap: false,
            bounce: true,
            momentum: true,
            probeType: 0,
            preventDefault: true,
            bindToWrapper: false,
            momentum: true,
        };

        this.config = {
            pullingModule: true,
            slideModule: false,
            pulldownClass: 'pulldown-wrapper',
            pullupClass: 'pullup-wrapper'
        };

        extend(this.options, options);
        extend(this.config, config);

        this.element = this._createElement(element);;

        this.onBeforeScrollStart = null;
        this.onScrollStart = null;
        this.onScroll = null;
        this.onScrollCancel = null;
        this.onScrollEnd = null;

        this.onTouchEnd = null;
        this.onFlick = null;
        this.onRefresh = null;
        this.onDestroy = null;

        this.onPullingDown = null;
        this.onPullingUp = null;
        this.onZoomStart = null;
        this.onZoomEnd = null;

        this.init();
    }

    init() {
        this.pullDownEl = this.element.getElementsByClassName(this.config.pulldownClass);
        this.pullUpEl = this.element.getElementsByClassName(this.config.pullupClass);

        this.element.firstChild.style.minHeight = `${this.element.offsetHeight + 1}px`;
        this.element.firstChild.firstChild.style.minHeight = `${this.element.offsetHeight + 1}px`;

        this.BS = new BScroll(this.element, this.options);
        this._createPullLoadEvent();
    }

    _createElement(pullLoadEl) {
        const pullDownWrapper = createDivEl({className: 'pulldown-wrapper'});
        const pullUpWrapper = createDivEl({className: 'pullup-wrapper'});

        const LoadingDownDom = createDivEl({className: 'loading-down'});
        const LoadingDownSpan1 = createDivEl({element: 'span'});
        const LoadingDownSpan2 = createDivEl({element: 'span'});
        const LoadingDownSpan3 = createDivEl({element: 'span'});
        const LoadingDownSpan4 = createDivEl({element: 'span'});
        const LoadingDownSpan5 = createDivEl({element: 'span'});
        LoadingDownDom.appendChild(LoadingDownSpan1);
        LoadingDownDom.appendChild(LoadingDownSpan2);
        LoadingDownDom.appendChild(LoadingDownSpan3);
        LoadingDownDom.appendChild(LoadingDownSpan4);
        LoadingDownDom.appendChild(LoadingDownSpan5);

        const LoadingUpDom = createDivEl({className: 'loading-down'});
        const LoadingUpSpan1 = createDivEl({element: 'span'});
        const LoadingUpSpan2 = createDivEl({element: 'span'});
        const LoadingUpSpan3 = createDivEl({element: 'span'});
        const LoadingUpSpan4 = createDivEl({element: 'span'});
        const LoadingUpSpan5 = createDivEl({element: 'span'});
        LoadingUpDom.appendChild(LoadingUpSpan1);
        LoadingUpDom.appendChild(LoadingUpSpan2);
        LoadingUpDom.appendChild(LoadingUpSpan3);
        LoadingUpDom.appendChild(LoadingUpSpan4);
        LoadingUpDom.appendChild(LoadingUpSpan5);

        pullDownWrapper.appendChild(LoadingDownDom);
        pullUpWrapper.appendChild(LoadingUpDom);

        if (this.config.pullingModule) {
            pullLoadEl.appendChild(pullDownWrapper);
            pullLoadEl.firstChild.appendChild(pullUpWrapper);
        }

        if (this.config.slideModule) {
            let width = 0;
            let slideWidth = pullLoadEl.clientWidth;

            Array.prototype.slice.call(pullLoadEl.firstChild.children).forEach(itemEl => {
                itemEl.style.width = slideWidth + 'px';
                width += slideWidth;
            });
            pullLoadEl.firstChild.style.width = width + 'px';
        }

        return pullLoadEl;
    }

    // 事件
    _createPullLoadEvent() {
        let pullDownRefresh = false,
            pullDownInitTop = -50;

        // 滚动开始之前
        this.BS.on('beforeScrollStart', () => {
            if (this.onBeforeScrollStart) {
                this.onBeforeScrollStart();
            }
        });

        // 滚动开始时
        this.BS.on('scrollStart', () => {
            if (this.onScrollStart) {
                this.onScrollStart();
            }
        });

        // 滚动过程中 / 参数：{Object} {x, y} 滚动的实时坐标
        this.BS.on('scroll', (pos) => {
            if (this.onScroll) {
                this.onScroll(pos);
            }

            if (this.config.pullingModule) {
                if (pullDownRefresh) {
                    return;
                }
                this.pullDownEl[0].style.top = Math.min(pos.y + pullDownInitTop, 10)+ 'px';
            }
        });

        // 滚动结束
        this.BS.on('scrollCancel', () => {
            if (this.onScrollCancel) {
                this.onScrollCancel();
            }
        });

        // 滚动被取消 / 参数：{Object} {x, y} 滚动结束的位置坐标
        this.BS.on('scrollEnd', () => {
            if (this.onScrollEnd) {
                this.onScrollEnd();
            }
        });

        // 鼠标/手指离开 / 参数：{Object} {x, y} 位置坐标
        this.BS.on('touchEnd', () => {
            if (this.onTouchEnd) {
                this.onTouchEnd();
            }
        });

        // 轻拂时
        this.BS.on('flick', () => {
            if (this.onFlick) {
                this.onFlick();
            }
        });

        // refresh 方法调用完成后
        this.BS.on('refresh', () => {
            if (this.onRefresh) {
                this.onRefresh();
            }
        });

        // destroy 方法调用完成后
        this.BS.on('destroy', () => {
            if (this.onDestroy) {
                this.onDestroy();
            }
        });

        // 在一次下拉刷新的动作后，这个时机一般用来去后端请求数据
        this.BS.on('pullingDown', () => {
            if (this.onPullingDown) {
                pullDownRefresh = true;
                this.onPullingDown().then(() => {
                    pullDownRefresh = false;
                    this.pullDownEl[0].style.top = '-1rem';
                    this.BS.finishPullDown();
                    this.BS.refresh();
                });
            }
        });

        // 在一次上拉加载的动作后，这个时机一般用来去后端请求数据
        this.BS.on('pullingUp', () => {
            if (this.onPullingUp) {
                this.onPullingUp().then(() => {
                    this.BS.finishPullUp();
                    this.BS.refresh();
                });
            }
        });

        // 缩放开始时
        this.BS.on('zoomStart', () => {
            if (this.onZoomStart) {
                this.onZoomStart();
            }
        });

        // 缩放结束后
        this.BS.on('zoomEnd', () => {
            if (this.onZoomEnd) {
                this.onZoomEnd();
            }
        });
    }

    /**
     * [goToPage 当我们做 slide 组件的时候，slide 通常会分成多个页面。调用此方法可以滚动到指定的页面。]
     * @param  {Number} x      横轴的页数
     * @param  {Number} y      纵轴的页数
     * @param  {Number} time   动画执行的时间
     * @return {[type]}        无
     */
    goToPage(x, y) {
        this.BS.goToPage(x, y);
    }

    /**
     * [next 滚动到下一个页面]
     * @param  {Number} time   动画执行的时间
     * @return {Function}      无
     */
    next() {
        this.BS.next();
    }

    /**
     * [next 滚动到上一个页面]
     * @param  {Number} time   动画执行的时间
     * @return {Function}      无
     */
    prev() {
        this.BS.prev();
    }

    /**
     * [getCurrentPage 获取当前页面的信息]
     * @return {Object} { x: posX, y: posY,pageX: x, pageY: y} 其中，x 和 y 表示偏移的坐标值，pageX 和 pageY 表示横轴方向和纵轴方向的页面数
     */
    getCurrentPage() {
        return this.BS.getCurrentPage();
    }

    /**
     * [wheelTo 当我们做 picker 组件的时候，调用该方法可以滚动到索引对应的位置]
     * @return {Number}        无
     */
    wheelTo(index) {
        return this.BS.wheelTo(index);
    }

    static getInstance() {
        return new PullLoad();
    }
}

export {
    PullLoad
};