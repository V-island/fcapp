import {
    getLangConfig
} from '../lang';

import {
    random,
    addEvent,
    createDivEl,
    protectFromXSS,
    hourFromNow,
    timestampFromNow,
    setData,
    getData,
    toggleClass,
    addClass,
    removeClass
} from '../util';

const LANG = getLangConfig();

import acrossFemaleImg from '../../img/users/avatar-female@2x.png';
import acrossMaleImg from '../../img/users/avatar-male@2x.png';

// 评论列表
class CommentItem {
    constructor({data}) {
        this.data = data;
        this.options = {
            itemClass: 'list-item',
            acrossClass: 'list-item-graphic',
            contentClass: 'list-item-text',
            secondaryClass: 'list-item-secondary'
        };
        this.element = this._createElement();
    }

    get acrossUrl() {
        return this.data.user_head ? protectFromXSS(this.data.user_head) : acrossMaleImg;
    }

    get userName() {
        return this.data.user_name ? `${this.data.user_name}` : `${LANG.MESSAGE.Anonymous}`;
    }

    get txt() {
        return this.data.comment_content ? `${this.data.comment_content}` : ``;
    }

    _createElement() {
        const item = createDivEl({className: this.options.itemClass});

        const acrossImage = createDivEl({element: 'span', className: ['user-info', this.options.acrossClass, 'image'], background: this.acrossUrl});
        item.appendChild(acrossImage);

        const content = createDivEl({element: 'span', className: this.options.contentClass});
        const Title = createDivEl({element: 'span', content: this.userName});
        const Secondary = createDivEl({element: 'span', className: this.options.secondaryClass, content: this.txt});
        content.appendChild(Title);
        content.appendChild(Secondary);
        item.appendChild(content);

        return item;
    }
}

export { CommentItem };