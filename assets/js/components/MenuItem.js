import { closeModal, alert, popupPart } from './Modal';
import {
    checkAuth,
    checkLogin
} from '../api';
import {
    getLangConfig
} from '../lang';
import {
	jumpURL,
	addEvent,
    createDivEl,
    addClass,
    hasClass,
    removeClass
} from '../util';

const LANG = getLangConfig();

class TabMain {
    constructor() {
        this.options = {
            itemClass: 'tab-item',
            labelClass: 'tab-label',
            showClass: 'active'
        };
        this.element = this._createElement();
    }

    get acrossUrl() {
        return this.data.userHead ? protectFromXSS(this.data.userHead) : (this.data.userSex == 1  ? acrossMaleImg : acrossFemaleImg);
    }

    _createElement() {
        let activeEL = null;
    	const hash = location.hash;
        const nav = createDivEl({element: 'nav', className: ['bar', 'bar-tab']});

        // home
        const homeItem = createDivEl({className: this.options.itemClass});
        const homeItemIcon = createDivEl({element: 'span', className: ['icon', 'icon-home']});
        const homeItemLabel = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.BAR.Home}`});
        homeItem.appendChild(homeItemIcon);
        homeItem.appendChild(homeItemLabel);
        addEvent(homeItem, 'click', () => {
        	if (activeEL) {
        	    removeClass(activeEL, this.options.showCalss);
        	}
        	activeEL = homeItem;
        	addClass(homeItem, this.options.showClass);
            return location.href = jumpURL('#/home');
        });
        nav.appendChild(homeItem);

        // favorite
        const favoriteItem = createDivEl({className: this.options.itemClass});
        const favoriteItemIcon = createDivEl({element: 'span', className: ['icon', 'icon-favorite']});
        const favoriteItemLabel = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.BAR.Favorite}`});
        favoriteItem.appendChild(favoriteItemIcon);
        favoriteItem.appendChild(favoriteItemLabel);
        addEvent(favoriteItem, 'click', () => {
        	if (activeEL) {
        	    removeClass(activeEL, this.options.showCalss);
        	}
        	activeEL = favoriteItem;
        	addClass(favoriteItem, this.options.showClass);
            return location.href = jumpURL('#/favorite');
        });
        nav.appendChild(favoriteItem);

        // modal
        const Item = createDivEl({className: [this.options.itemClass, 'icons']});
        const ItemIcon = createDivEl({element: 'span', className: ['icon', 'icon-live']});
        Item.appendChild(ItemIcon);
        addEvent(Item, 'click', () => {
            popupPart({
            	element: this._createModalElement(),
            	themecalss: 'theme-black',
            	footer: true,
            	cancelIcon: true
            });
        });
        nav.appendChild(Item);

        // message
        const messageItem = createDivEl({className: this.options.itemClass});
        const messageItemIcon = createDivEl({element: 'span', className: ['icon', 'icon-message']});
        const messageItemLabel = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.BAR.Message}`});
        messageItem.appendChild(messageItemIcon);
        messageItem.appendChild(messageItemLabel);
        addEvent(messageItem, 'click', () => {
        	if (activeEL) {
        	    removeClass(activeEL, this.options.showCalss);
        	}
        	activeEL = messageItem;
        	addClass(messageItem, this.options.showClass);
            return location.href = jumpURL('#/message');
        });
        nav.appendChild(messageItem);

        // user
        const userItem = createDivEl({className: this.options.itemClass});
        const userItemIcon = createDivEl({element: 'span', className: ['icon', 'icon-me']});
        const userItemLabel = createDivEl({element: 'span', className: this.options.labelClass, content: `${LANG.BAR.Me}`});
        userItem.appendChild(userItemIcon);
        userItem.appendChild(userItemLabel);
        addEvent(userItem, 'click', () => {
        	if (activeEL) {
        	    removeClass(activeEL, this.options.showCalss);
        	}
        	activeEL = userItem;
        	addClass(userItem, this.options.showClass);
            return location.href = jumpURL('#/user');
        });
        nav.appendChild(userItem);

        switch(hash) {
        	case '#/home':
        		addClass(homeItem, this.options.showClass);
        		break;
        	case '#/favorite':
        		addClass(favoriteItem, this.options.showClass);
        		break;
        	case '#/message':
        		addClass(messageItem, this.options.showClass);
        		break;
        	case '#/user':
        		addClass(userItem, this.options.showClass);
        		break;
        }

        return nav;
    }

    _createModalElement() {
    	const group = createDivEl({className: 'share-group'});

    	const tag = createDivEl({className: ['tag', 'tag-share']});

    	const liveItem = createDivEl({element: 'label', className: 'share-label'});
    	const liveItemIcon = createDivEl({element: 'i', className: ['icon', 'modals-live']});
        const liveItemSpen = createDivEl({element: 'span', content: `${LANG.BAR.Lives_Btn.Live}`});
        liveItem.appendChild(liveItemIcon);
        liveItem.appendChild(liveItemSpen);
        addEvent(liveItem, 'click', () => {
            if (checkLogin()) {
                return location.href = jumpURL('#/login/mobile');
            }
        	if (!checkAuth()) {
        	    return alert({
        	    	title: `${LANG.HOME.Madal.DataIncomplete.Title}`,
        	    	text: `${LANG.HOME.Madal.DataIncomplete.Text}`,
        	    	button: `${LANG.HOME.Madal.DataIncomplete.ButtonsText}`,
        	    	callback: () => {
        	    		return location.href = jumpURL('#/user/proof');
        	    	}
        	    });
        	}
        	return location.href = jumpURL('#/live/anchor');
        });
        tag.appendChild(liveItem);

        const videoItem = createDivEl({element: 'label', className: 'share-label'});
    	const videoItemIcon = createDivEl({element: 'i', className: ['icon', 'modals-video']});
        const videoItemSpen = createDivEl({element: 'span', content: `${LANG.BAR.Lives_Btn.Video}`});
        videoItem.appendChild(videoItemIcon);
        videoItem.appendChild(videoItemSpen);
        addEvent(videoItem, 'click', () => {
        	return location.href = jumpURL('#/user/video');
        });
        tag.appendChild(videoItem);

    	group.appendChild(tag);
    	return group;
    }

    remove() {
        return this.element.removeChild(tabsEl);
    }
}

export { TabMain };