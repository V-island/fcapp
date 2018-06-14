export function compareVersion(a, b) {
    var as = a.split('.');
    var bs = b.split('.');
    if (a === b) return 0;

    for (var i = 0; i < as.length; i++) {
        var x = parseInt(as[i]);
        if (!bs[i]) return 1;
        var y = parseInt(bs[i]);
        if (x < y) return -1;
        if (x > y) return 1;
    }
    return -1;
};

export function getCurrentPage() {
    return $(".page-current")[0] || $(".page")[0] || document.body;
};

export function createDom(tpl) {
    let container = document.createElement('div');
    container.innerHTML = tpl;
    return container.childNodes[0];
};

export function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
};

export function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
};

export function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return reg.test(el.className);
};

export function addClass(el, className) {
    if (hasClass(el, className)) {
        return;
    }

    let newClass = el.className.split(' ');
    newClass.push(className);
    el.className = newClass.join(' ');
};

export function removeClass(el, className) {
    if (!hasClass(el, className)) {
        return;
    }

    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
    el.className = el.className.replace(reg, ' ');
};

export function extend(target, source) {
    for (var key in source) {
        target[key] = source[key];
    }
};