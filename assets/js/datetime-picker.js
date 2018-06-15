import * as $ from './util';

const LANGUAGES = {};
const REGEXP_DELIMITER = /\{\{\s*(\w+)\s*\}\}/g;
const REGEXP_INPUTS = /input|textarea/i;
let AnotherPicker;

// Native events
const PointerEvent = typeof window !== 'undefined' ? window.PointerEvent : null;
const EVENT_POINTER_DOWN = PointerEvent ? 'pointerdown' : 'touchstart mousedown';
const EVENT_POINTER_MOVE = PointerEvent ? 'pointermove' : 'touchmove mousemove';
const EVENT_POINTER_UP = PointerEvent ? ' pointerup pointercancel' : 'touchend touchcancel mouseup';
const EVENT_KEY_DOWN = 'keydown';
const EVENT_WHEEL = 'wheel';
const EVENT_CLICK = 'click';
const EVENT_FOCUS = 'focus';

// Custom events
const EVENT_SHOW = 'show';
const EVENT_SHOWN = 'shown';
const EVENT_HIDE = 'hide';
const EVENT_HIDDEN = 'hidden';
const EVENT_PICK = 'pick';

const DEFAULTS = {
    // Define the container for putting the picker.
    container: null,

    // The initial date. If not present, use the current date.
    date: null,

    // The date string format, also as the sorting order for columns.
    format: 'YYYY-MM-DD HH:mm',

    // Define the increment for each date / time part.
    increment: 1,

    // Enable inline mode.
    inline: false,

    // Define the language. (An ISO language code)
    language: '',

    // Months' name.
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],

    // Shorter months' name.
    monthsShort: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ],

    // Translate date / time text.
    translate(type, text) {
        return text;
    },

    // Define the number of rows for showing.
    rows: 5,

    // Define the text of the picker.
    text: {
        title: 'Pick a date / time',
        cancel: 'Cancel',
        confirm: 'OK',
    },

    // Shortcuts of custom events
    show: null,
    shown: null,
    hide: null,
    hidden: null,
    pick: null,
};

const TEMPLATE = '<div class="picker" data-action="hide">' +
    '<div class="picker-content">' +
    '<div class="picker-header">' +
    '<h4 class="picker-title">{{ title }}</h4>' +
    '<button data-action="hide" class="picker-close" type="button">&times;</button>' +
    '</div>' +
    '<div class="picker-body">' +
    '<div class="picker-grid"></div>' +
    '</div>' +
    '<div class="picker-footer">' +
    '<button class="picker-cancel" data-action="hide" type="button">{{ cancel }}</button>' +
    '<button class="picker-confirm" data-action="pick" type="button">{{ confirm }}</button>' +
    '</div>' +
    '</div>' +
    '</div>';

class Picker {
    constructor(element, options) {
        const self = this;

        options = $.isPlainObject(options) ? options : {};

        if (options.language) {
            // Priority: DEFAULTS < LANGUAGES < options
            options = $.extend(true, {}, LANGUAGES[options.language], options);
        }

        self.element = element;
        self.options = $.extend(true, {}, DEFAULTS, options);
        self.shown = false;
        self.init();
    }

    init() {
        const self = this;
        const element = self.element;

        if ($.getData(element, 'picker')) {
            return;
        }

        $.setData(element, 'picker', self);

        const options = self.options;
        const isInput = REGEXP_INPUTS.test(element.tagName);
        const inline = options.inline && (options.container || !isInput);
        const template = document.createElement('div');

        template.insertAdjacentHTML('afterbegin',
            TEMPLATE.replace(REGEXP_DELIMITER, (...args) => options.text[args[1]]));

        const picker = template.getElementsByClassName('picker')[0];
        const grid = picker.getElementsByClassName('picker-grid')[0];
        let container = options.container;

        if (typeof container === 'string') {
            container = document.querySelector(container);
        }

        if (inline) {
            $.addClass(picker, 'picker-open');
            $.addClass(picker, 'picker-opened');

            if (!container) {
                container = element;
            }
        } else {
            self.scrollbarWidth = window.innerWidth - document.body.clientWidth;

            $.addClass(picker, 'picker-fixed');

            if (!container) {
                container = document.body;
            }
        }

        self.isInput = isInput;
        self.inline = inline;
        self.container = container;
        self.picker = picker;
        self.grid = grid;
        self.cell = null;
        self.format = $.parseFormat(options.format);

        const initialValue = self.getValue();
        const date = self.parseDate(options.date || initialValue);

        self.date = date;
        self.initialDate = new Date(date);
        self.initialValue = initialValue;
        self.data = {};

        let rows = Number(options.rows);

        if (!(rows % 2)) {
            rows += 1;
        }

        options.rows = rows || 5;
        $.addClass(grid, rows > 1 ? 'picker-multiple' : 'picker-single');

        let increment = options.increment;

        if (!$.isPlainObject(increment)) {
            increment = {
                year: increment,
                month: increment,
                day: increment,
                hour: increment,
                minute: increment,
                second: increment,
                millisecond: increment,
            };
        }

        self.format.tokens.forEach((token) => {
            const type = $.tokenToType(token);
            const cell = document.createElement('div');
            const list = document.createElement('ul');
            const data = {
                digit: token.length,
                increment: Math.abs(Number(increment[type])) || 1,
                list,
                max: Infinity,
                min: -Infinity,
                index: Math.floor((options.rows + 2) / 2),
                offset: 0,
            };

            switch (token.charAt(0)) {
                case 'Y':
                    if (data.digit === 2) {
                        data.max = 99;
                        data.min = 0;
                    }
                    break;

                case 'M':
                    data.max = 11;
                    data.min = 0;
                    data.offset = 1;

                    if (data.digit === 3) {
                        data.aliases = options.monthsShort;
                    } else if (data.digit === 4) {
                        data.aliases = options.months;
                    }
                    break;

                case 'D':
                    data.max = () => {
                        return $.getDaysInMonth(date.getFullYear(), date.getMonth());
                    };
                    data.min = 1;
                    break;

                case 'H':
                    data.max = 23;
                    data.min = 0;
                    break;

                case 'm':
                    data.max = 59;
                    data.min = 0;
                    break;

                case 's':
                    data.max = 59;
                    data.min = 0;
                    break;

                case 'S':
                    data.max = 999;
                    data.min = 0;
                    break;

                    // No default
            }

            $.setData(cell, 'type', type);
            $.setData(cell, 'token', token);
            $.addClass(list, 'picker-list');
            $.addClass(cell, 'picker-cell');
            $.addClass(cell, `picker-${type}s`);
            cell.appendChild(list);
            grid.appendChild(cell);
            self.data[type] = data;
            self.render(type);
        });

        if (inline) {
            $.empty(container);
        }

        container.appendChild(picker);
        self.bind();
    }

    static noConflict() {
        window.Picker = AnotherPicker;
        return Picker;
    }

    static setDefaults(options) {
        options = $.isPlainObject(options) ? options : {};

        if (options.language) {
            options = $.extend(true, {}, LANGUAGES[options.language], options);
        }

        $.extend(true, DEFAULTS, options);
    }

    //events
    bind() {
        const self = this;
        const element = self.element;
        const options = self.options;
        const picker = self.picker;
        const grid = self.grid;

        if ($.isFunction(options.show)) {
            $.addListener(element, EVENT_SHOW, options.show);
        }

        if ($.isFunction(options.shown)) {
            $.addListener(element, EVENT_SHOWN, options.shown);
        }

        if ($.isFunction(options.hide)) {
            $.addListener(element, EVENT_HIDE, options.hide);
        }

        if ($.isFunction(options.hidden)) {
            $.addListener(element, EVENT_HIDDEN, options.hidden);
        }

        if ($.isFunction(options.pick)) {
            $.addListener(element, EVENT_PICK, options.pick);
        }

        $.addListener(element, EVENT_FOCUS, (self.onFocus = self.focus.bind(self)));
        $.addListener(element, EVENT_CLICK, self.onFocus);
        $.addListener(picker, EVENT_CLICK, (self.onClick = self.click.bind(self)));
        $.addListener(grid, EVENT_WHEEL, (self.onWheel = self.wheel.bind(self)));
        $.addListener(grid, EVENT_POINTER_DOWN, (self.onPointerDown = self.pointerdown.bind(self)));
        $.addListener(document, EVENT_POINTER_MOVE, (self.onPointerMove = self.pointermove.bind(self)));
        $.addListener(document, EVENT_POINTER_UP, (self.onPointerUp = self.pointerup.bind(self)));
        $.addListener(document, EVENT_KEY_DOWN, (self.onKeyDown = self.keydown.bind(self)));
    }

    unbind() {
        const self = this;
        const element = self.element;
        const options = self.options;
        const picker = self.picker;
        const grid = self.grid;

        if ($.isFunction(options.show)) {
            $.removeListener(element, EVENT_SHOW, options.show);
        }

        if ($.isFunction(options.shown)) {
            $.removeListener(element, EVENT_SHOWN, options.shown);
        }

        if ($.isFunction(options.hide)) {
            $.removeListener(element, EVENT_HIDE, options.hide);
        }

        if ($.isFunction(options.hidden)) {
            $.removeListener(element, EVENT_HIDDEN, options.hidden);
        }

        if ($.isFunction(options.pick)) {
            $.removeListener(element, EVENT_PICK, options.pick);
        }

        $.removeListener(element, EVENT_FOCUS, self.onFocus);
        $.removeListener(element, EVENT_CLICK, self.onFocus);
        $.removeListener(picker, EVENT_CLICK, self.onClick);
        $.removeListener(grid, EVENT_WHEEL, self.onWheel);
        $.removeListener(grid, EVENT_POINTER_DOWN, self.onPointerDown);
        $.removeListener(document, EVENT_POINTER_MOVE, self.onPointerMove);
        $.removeListener(document, EVENT_POINTER_UP, self.onPointerUp);
        $.removeListener(document, EVENT_KEY_DOWN, self.onKeyDown);
    }

    // handlers
    focus(e) {
        e.target.blur();
        this.show();
    }

    click(e) {
        const action = $.getData(e.target, 'action');

        if (action === 'hide') {
            this.hide();
        } else if (action === 'pick') {
            this.pick();
        }
    }

    wheel(e) {
        const self = this;
        let target = e.target;

        if (target === self.grid) {
            return;
        }

        e.preventDefault();

        if (target.tagName.toLowerCase() === 'li') {
            target = target.parentNode;
        }

        if (target.tagName.toLowerCase() === 'ul') {
            target = target.parentNode;
        }

        const type = $.getData(target, 'type');

        if (e.deltaY < 0) {
            self.prev(type);
        } else {
            self.next(type);
        }
    }

    pointerdown(e) {
        const self = this;
        let target = e.target;

        if (target === self.grid) {
            return;
        }

        // This line is required for preventing page zooming in iOS browsers
        e.preventDefault();

        if (target.tagName.toLowerCase() === 'li') {
            target = target.parentNode;
        }

        if (target.tagName.toLowerCase() === 'ul') {
            target = target.parentNode;
        }

        const list = target.firstElementChild;
        const itemHeight = list.firstElementChild.offsetHeight;

        self.cell = {
            elem: target,
            list,
            moveY: 0,
            maxMoveY: itemHeight,
            minMoveY: itemHeight / 2,
            startY: e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
            type: $.getData(target, 'type'),
        };
    }

    pointermove(e) {
        const self = this;
        const cell = self.cell;

        if (!cell) {
            return;
        }

        e.preventDefault();

        const endY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
        const moveY = cell.moveY + (endY - cell.startY);

        cell.startY = endY;
        cell.moveY = moveY;

        if (Math.abs(moveY) < cell.maxMoveY) {
            cell.list.style.top = `${moveY}px`;
            return;
        }

        cell.list.style.top = 0;
        cell.moveY = 0;

        if (moveY >= cell.maxMoveY) {
            self.prev(cell.type);
        } else if (moveY <= -cell.maxMoveY) {
            self.next(cell.type);
        }
    }

    pointerup(e) {
        const self = this;
        const cell = self.cell;

        if (!cell) {
            return;
        }

        e.preventDefault();

        cell.list.style.top = 0;

        if (cell.moveY >= cell.minMoveY) {
            self.prev(cell.type);
        } else if (cell.moveY <= -cell.minMoveY) {
            self.next(cell.type);
        }

        self.cell = null;
    }

    keydown(e) {
        const self = this;

        if (self.shown && (e.key === 'Escape' || e.keyCode === 27)) {
            self.hide();
        }
    }

    //helpers
    render(type) {
        const self = this;

        if (!type) {
            self.format.tokens.forEach(token => self.render($.tokenToType(token)));
            return;
        }

        const options = self.options;
        const data = self.data[type];
        const current = self.current(type);
        const max = $.isFunction(data.max) ? data.max() : data.max;
        const min = $.isFunction(data.min) ? data.min() : data.min;
        let base = 0;

        if (isFinite(max)) {
            base = min > 0 ? max : max + 1;
        }

        $.empty(data.list);
        data.current = current;

        for (let i = 0; i < options.rows + 2; i++) {
            const item = document.createElement('li');
            const position = i - data.index;
            let newValue = current + (position * data.increment);

            if (base) {
                newValue %= base;

                if (newValue < min) {
                    newValue += base;
                }
            }

            item.textContent = options.translate(type, data.aliases ? data.aliases[newValue] :
                $.addLeadingZero(newValue + data.offset, data.digit));

            $.setData(item, 'name', type);
            $.setData(item, 'value', newValue);
            $.addClass(item, 'picker-item');

            if (position === 0) {
                $.addClass(item, 'picker-picked');
                data.item = item;
            }

            data.list.appendChild(item);
        }
    }

    current(type, value) {
        const self = this;
        const date = self.date;
        const format = self.format;
        const token = format[type];

        switch (token.charAt(0)) {
            case 'Y':
                if ($.isNumber(value)) {
                    date.setFullYear(token.length === 2 ? (2000 + value) : value);

                    if (format.month) {
                        self.render($.tokenToType(format.month));
                    }

                    if (format.day) {
                        self.render($.tokenToType(format.day));
                    }
                }

                return date.getFullYear();

            case 'M':
                if ($.isNumber(value)) {
                    date.setMonth(value);

                    if (format.day) {
                        self.render($.tokenToType(format.day));
                    }
                }

                return date.getMonth();

            case 'D':
                if ($.isNumber(value)) {
                    date.setDate(value);
                }

                return date.getDate();

            case 'H':
                if ($.isNumber(value)) {
                    date.setHours(value);
                }

                return date.getHours();

            case 'm':
                if ($.isNumber(value)) {
                    date.setMinutes(value);
                }

                return date.getMinutes();

            case 's':
                if ($.isNumber(value)) {
                    date.setSeconds(value);
                }

                return date.getSeconds();

            case 'S':
                if ($.isNumber(value)) {
                    date.setMilliseconds(value);
                }

                return date.getMilliseconds();

                // No default
        }

        return date;
    }

    getValue() {
        const self = this;
        const element = self.element;

        return self.isInput ? element.value : element.textContent;
    }

    setValue(value) {
        const self = this;
        const element = self.element;

        if (self.isInput) {
            element.value = value;
        } else if (self.options.container) {
            element.textContent = value;
        }
    }

    // Show the picker.
    show() {
        const self = this;
        const element = self.element;
        const picker = self.picker;

        if (self.inline || self.shown) {
            return self;
        }

        if ($.dispatchEvent(element, 'show') === false) {
            return self;
        }

        self.shown = true;

        const style = document.body.style;

        style.overflow = 'hidden';
        style.paddingRight = `${self.scrollbarWidth}px`;
        $.addClass(picker, 'picker-open');

        // Reflow to enable transition
        // eslint-disable-next-line
        picker.offsetWidth;

        $.addClass(picker, 'picker-opened');

        setTimeout(() => {
            $.dispatchEvent(element, 'shown');
        }, 300);

        return self;
    }

    // Hide the picker.
    hide() {
        const self = this;
        const element = self.element;
        const picker = self.picker;

        if (self.inline || !self.shown) {
            return self;
        }

        if ($.dispatchEvent(element, 'hide') === false) {
            return self;
        }

        self.shown = false;
        $.removeClass(picker, 'picker-opened');

        setTimeout(() => {
            const style = document.body.style;

            $.removeClass(picker, 'picker-open');

            style.overflow = 'auto';
            style.paddingRight = 0;

            $.dispatchEvent(element, 'hidden');
        }, 300);

        return self;
    }

    /**
     * Pick to the previous item.
     *
     * @param {String} type
     */
    prev(type) {
        const self = this;
        const options = self.options;
        const token = self.format[type];
        const data = self.data[type];
        const list = data.list;
        const item = list.lastElementChild;
        const max = $.isFunction(data.max) ? data.max() : data.max;
        const min = $.isFunction(data.min) ? data.min() : data.min;
        const prev = data.item.previousElementSibling;
        let value = Number($.getData(list.firstElementChild, 'value')) - data.increment;

        if (value < min) {
            value += (max - min) + 1;
        }

        item.textContent = options.translate(type, data.aliases ? data.aliases[value] :
            $.addLeadingZero(value + data.offset, token.length));

        $.setData(item, 'value', value);

        if (prev) {
            $.removeClass(data.item, 'picker-picked');
            $.addClass(prev, 'picker-picked');
            data.item = prev;
        }

        list.insertBefore(item, list.firstElementChild);

        data.current = Number($.getData(data.item, 'value'));
        self.current(type, data.current);

        if (self.inline && options.container) {
            self.pick();
        }

        return self;
    }

    /**
     * Pick to the next item.
     *
     * @param {String} type
     */
    next(type) {
        const self = this;
        const options = self.options;
        const token = self.format[type];
        const data = self.data[type];
        const list = data.list;
        const item = list.firstElementChild;
        const max = $.isFunction(data.max) ? data.max() : data.max;
        const min = $.isFunction(data.min) ? data.min() : data.min;
        const next = data.item.nextElementSibling;
        let value = Number($.getData(list.lastElementChild, 'value')) + data.increment;

        if (value > max) {
            value -= (max - min) + 1;
        }

        item.textContent = options.translate(type, data.aliases ? data.aliases[value] :
            $.addLeadingZero(value + data.offset, token.length));

        $.setData(item, 'value', value);
        list.appendChild(item);

        if (next) {
            $.removeClass(data.item, 'picker-picked');
            $.addClass(next, 'picker-picked');
            data.item = next;
        }

        data.current = Number($.getData(data.item, 'value'));
        self.current(type, data.current);

        if (self.inline && options.container) {
            self.pick();
        }

        return self;
    }

    // Pick the current date to the target element.
    pick() {
        const self = this;
        const element = self.element;

        if ($.dispatchEvent(element, 'pick') === false) {
            return self;
        }

        const value = self.formatDate(self.date);

        self.setValue(value);

        if (self.isInput && $.dispatchEvent(element, 'change') === false) {
            self.reset();
        }

        self.hide();

        return self;
    }

    /**
     * Get the current date.
     *
     * @param {Boolean} [formatted]
     * @return {Date|String} (date)
     */
    getDate(formatted) {
        const self = this;
        const date = self.date;

        return formatted ? self.formatDate(date) : new Date(date);
    }

    /**
     * Override the current date with a new date.
     *
     * @param {Date|String} [date]
     */
    setDate(date) {
        const self = this;

        if (date) {
            self.date = self.parseDate(date);
            self.render();
        }

        return self;
    }

    // Update the picker with the current element value / text.
    update() {
        const self = this;

        self.date = self.parseDate(self.getValue());
        self.render();

        return self;
    }

    // Reset the picker and element value / text.
    reset() {
        const self = this;

        self.setValue(self.initialValue);
        self.date = new Date(self.initialDate);
        self.render();

        return self;
    }

    /**
     * Parse a date string with the set date format.
     *
     * @param {String} date
     * @return {Date} (parsed date)
     */
    parseDate(date) {
        const self = this;
        const options = self.options;
        const format = self.format;
        let digits = [];

        if ($.isDate(date)) {
            return new Date(date);
        }

        if (typeof date === 'string') {
            const months = options.months.join('|');
            const monthsShort = options.monthsShort.join('|');

            digits = date.match(new RegExp(`(${months}|${monthsShort}|\\d+)`, 'g'));

            if (!digits || digits.length !== format.tokens.length) {
                return new Date();
            }
        }

        const parsedDate = new Date();

        digits.forEach((digit, i) => {
            const token = format.tokens[i];
            const n = Number(digit);

            switch (token) {
                case 'YYYY':
                case 'YYY':
                case 'Y':
                    parsedDate.setFullYear(date.substr(date.indexOf(digit) - 1, 1) === '-' ? -n : n);
                    break;

                case 'YY':
                    parsedDate.setFullYear(2000 + n);
                    break;

                case 'MMMM':
                    parsedDate.setMonth(options.months.indexOf(digit));
                    break;

                case 'MMM':
                    parsedDate.setMonth(options.monthsShort.indexOf(digit));
                    break;

                case 'MM':
                case 'M':
                    parsedDate.setMonth(n - 1);
                    break;

                case 'DD':
                case 'D':
                    parsedDate.setDate(n);
                    break;

                case 'HH':
                case 'H':
                    parsedDate.setHours(n);
                    break;

                case 'mm':
                case 'm':
                    parsedDate.setMinutes(n);
                    break;

                case 'ss':
                case 's':
                    parsedDate.setSeconds(n);
                    break;

                case 'SSS':
                case 'SS':
                case 'S':
                    parsedDate.setMilliseconds(n);
                    break;

                    // No default
            }
        });

        return parsedDate;
    }

    /**
     * Format a date object to a string with the set date format.
     *
     * @param {Date} date
     * @return {String} (formatted date)
     */
    formatDate(date) {
        const self = this;
        const options = self.options;
        const format = self.format;
        let formatted = '';

        if ($.isValidDate(date)) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const milliseconds = date.getMilliseconds();

            formatted = options.format;

            format.tokens.forEach((token) => {
                let replacement = '';

                switch (token) {
                    case 'YYYY':
                    case 'YYY':
                    case 'Y':
                        replacement = $.addLeadingZero(year, token.length);
                        break;

                    case 'YY':
                        replacement = $.addLeadingZero(year % 100, 2);
                        break;

                    case 'MMMM':
                        replacement = options.months[month];
                        break;

                    case 'MMM':
                        replacement = options.monthsShort[month];
                        break;

                    case 'MM':
                    case 'M':
                        replacement = $.addLeadingZero(month + 1, token.length);
                        break;

                    case 'DD':
                    case 'D':
                        replacement = $.addLeadingZero(day, token.length);
                        break;

                    case 'HH':
                    case 'H':
                        replacement = $.addLeadingZero(hours, token.length);
                        break;

                    case 'mm':
                    case 'm':
                        replacement = $.addLeadingZero(minutes, token.length);
                        break;

                    case 'ss':
                    case 's':
                        replacement = $.addLeadingZero(seconds, token.length);
                        break;

                    case 'SSS':
                    case 'SS':
                    case 'S':
                        replacement = $.addLeadingZero(milliseconds, token.length);
                        break;

                        // No default

                }

                formatted = formatted.replace(token, replacement);
            });
        }

        return formatted;
    }

    // Destroy the picker and remove the instance from the target element.
    destroy() {
        const self = this;
        const element = self.element;
        const picker = self.picker;

        self.unbind();
        $.removeData(element, 'picker');
        picker.parentNode.removeChild(picker);

        return self;
    }
}

Picker.languages = LANGUAGES;

if (typeof window !== 'undefined') {
    AnotherPicker = window.Picker;
    window.Picker = Picker;
}

export default Picker;