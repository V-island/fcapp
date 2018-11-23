import Template from 'art-template/lib/template-web';
import { closeModal, prompt, options, timePicker, pickers, checkbox } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import RecordPhoto from '../record-photo';
import SendBirdAction from '../SendBirdAction';

import {
    getLangConfig
} from '../lang';

import {
    body
} from '../intro';

import {
	personInfo,
    uploadHead,
    getUserInfo,
    updateUserInfo,
    findAllUserHobby,
    findHobbyByUserId,
    findAllCharacterType,
    findCharacterTypeByUserId,
    saveInterest,
    saveMyType
} from '../api';

import {
    extend,
    getData,
    setData,
    dataAges,
    addEvent,
    createDom,
    createDivEl
} from '../util';

const LANG = getLangConfig();
const DETAIL = LANG.PERSONAL_DETAIL;

export default class UserDetail extends EventEmitter {
	constructor(element, options) {
	    super();

	    this.data = {};
	    this.options = {
	    	itemAvatarClass: 'item-avatar',
	    	itemUsernameClass: 'item-username',
	    	itemGenderClass: 'item-gender',
	    	itemAgeClass: 'item-age',
	    	itemHeightClass: 'item-height',
	    	itemWeightClass: 'item-weight',
	    	itemInterestClass: 'item-interest',
	    	itemTypeClass: 'item-type',
	    	itemLoveClass: 'item-love',
	    	itemFriendsClass: 'item-friends',
	    	itemMetaTxtClass: 'list-item-meta-txt',
	    	itemUserImgClass: 'user-img',
	    	dataSexIndex: 'sex'
        };

	    extend(this.options, options);
	    extend(this.data, LANG);

	    this.init(element);
	}

	init(element) {
		const SendBird = new SendBirdAction();
		const {userId} = getUserInfo();

		let getPersonInfo = personInfo();
		let connectSendBird = SendBird.connect(userId);

		let getHobby = findHobbyByUserId(userId);
		let getCharacterType = findCharacterTypeByUserId(userId, 1);
		let getCharacterLove = findCharacterTypeByUserId(userId, 2);

		Spinner.start(body);
		Promise.all([getPersonInfo, getHobby, getCharacterType, getCharacterLove, connectSendBird]).then((data) => {
			this.data.UserDetail = data[0];
			this.data.HobbyList = data[1] ? data[1] : false;
			this.data.CharacterType = data[2] ? data[2] : false;
			this.data.CharacterLove = data[3] ? data[3] : false;
			this.userId = userId;

			this.UserDetailEl = createDom(Template.render(element, this.data));
			this.trigger('pageLoadStart', this.UserDetailEl);
			this._init();
			Spinner.remove();
		});
	}

	_init() {
		this.itemAvatarEl = this.UserDetailEl.getElementsByClassName(this.options.itemAvatarClass)[0];
		this.itemUsernameEl = this.UserDetailEl.getElementsByClassName(this.options.itemUsernameClass)[0];
		this.itemGenderEl = this.UserDetailEl.getElementsByClassName(this.options.itemGenderClass)[0];
		this.itemAgeEl = this.UserDetailEl.getElementsByClassName(this.options.itemAgeClass)[0];
		this.itemHeightEl = this.UserDetailEl.getElementsByClassName(this.options.itemHeightClass)[0];
		this.itemWeightEl = this.UserDetailEl.getElementsByClassName(this.options.itemWeightClass)[0];
		this.itemInterestEl = this.UserDetailEl.getElementsByClassName(this.options.itemInterestClass)[0];
		this.itemTypeEl = this.UserDetailEl.getElementsByClassName(this.options.itemTypeClass)[0];
		this.itemLoveEl = this.UserDetailEl.getElementsByClassName(this.options.itemLoveClass)[0];
		this.itemFriendsEl = this.UserDetailEl.getElementsByClassName(this.options.itemFriendsClass)[0];

		this.itemUserImgEl = this.itemAvatarEl.getElementsByClassName(this.options.itemUserImgClass)[0];
		this.itemUsernameTxtEl = this.itemUsernameEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemGenderTxtEl = this.itemGenderEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemAgeTxtEl = this.itemAgeEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemHeightTxtEl = this.itemHeightEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemWeightTxtEl = this.itemWeightEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemFriendsTxtEl = this.itemFriendsEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemInterestTxtEl = this.itemInterestEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemTypeTxtEl = this.itemTypeEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		this.itemLoveTxtEl = this.itemLoveEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];

		this._bindEvent();
	}

	_bindEvent() {
		// 头像
		addEvent(this.itemAvatarEl, 'click', () => {
			let recordPhoto = new RecordPhoto({
				clippingRound: true
			});

			recordPhoto.on('recordPhoto.clipping', (File, URL) => {
                uploadHead(File, (data) => {
					SendBirdAction.getInstance().updateCurrentUserInfo(null, data).then((user) => {
						this.itemUserImgEl.style.backgroundImage = 'url('+ data +')';
					});
                });
            });
        });

		// 用户名
		addEvent(this.itemUsernameEl, 'click', () => {
			prompt({
				title: `${DETAIL.Username.Madal.Title}`,
				text: `${DETAIL.Username.Madal.Placeholder}`,
				callback: (value) => {
					this.itemUsernameTxtEl.innerText = value;
					updateUserInfo({ name: value }).then((data) => {
						if (!data) return;

						SendBirdAction.getInstance().updateCurrentUserInfo(value, null);
					});
				}
			});
        });

		// 性别
		addEvent(this.itemGenderEl, 'click', () => {
			options({
				data: [{
					title: `${DETAIL.Gender.Madal.Male}`,
					value: 1,
					onClick: (text, value) => {
						this.itemGenderTxtEl.innerText = text;
						setData(this.itemGenderTxtEl, this.options.dataSexIndex, value);
						updateUserInfo({
							sex: value
						});
					}
				}, {
					title: `${DETAIL.Gender.Madal.Female}`,
					value: 2,
					onClick: (text, value) => {
						this.itemGenderTxtEl.innerText = text;
						setData(this.itemGenderTxtEl, this.options.dataSexIndex, value);
						updateUserInfo({
							sex: value
						});
					}
				}]
			});
        });

		// 年龄
		addEvent(this.itemAgeEl, 'click', () => {
			timePicker({
				title: `${DETAIL.Age.Madal.Title}`,
				callback: (value) => {
					let ages = dataAges(value);

					this.itemAgeTxtEl.innerText = ages;
					updateUserInfo({
						age: ages
					});
				}
			});
		});

		// 身高
		addEvent(this.itemHeightEl, 'click', () => {

			prompt({
				title: `${DETAIL.Height.Madal.Title}`,
				text: `${DETAIL.Height.Madal.Placeholder}`,
				callback: (value) => {
					this.itemHeightTxtEl.innerText = value + DETAIL.Height.Unit;
					updateUserInfo({
						height: value
					});
				}
			});
		});

		// 体重
		addEvent(this.itemWeightEl, 'click', () => {

			prompt({
				title: `${DETAIL.Body_Weight.Madal.Title}`,
				text: `${DETAIL.Body_Weight.Madal.Placeholder}`,
				callback: (value) => {
					this.itemWeightTxtEl.innerText = value + DETAIL.Body_Weight.Unit;
					updateUserInfo({
						weight: value
					});
				}
			});
		});

		// 用户交友目的
		addEvent(this.itemFriendsEl, 'click', () => {

			pickers({
				title: `${DETAIL.Why_Make_Friends.Madal.Title}`,
				data: DETAIL.Why_Make_Friends.Madal.Lists,
				callback: (value, text, index) => {
					this.itemFriendsTxtEl.innerText = text;
					updateUserInfo({
						goal: value
					});
				}
			});
		});

		// 兴趣
		addEvent(this.itemInterestEl, 'click', () => {
			let getAllUserHobby = findAllUserHobby();
			let getHobby = findHobbyByUserId(this.userId);

			Promise.all([getAllUserHobby, getHobby]).then((data) => {
				checkbox({
					data: data[0],
					title: `${DETAIL.Interest.Madal.Title}`,
					text: `${DETAIL.Interest.Madal.Text}`,
					nameValue: 'id',
					nameText: 'hobby_name',
					selectData: data[1],
					selected: 3,
					callbackOk: (value, text) => {
						this.itemInterestTxtEl.innerText = '';

						text.forEach((itemData, index) => {
							let tagLabel = createDivEl({element: 'label', className: 'tag-label', content: itemData});
					        this.itemInterestTxtEl.appendChild(tagLabel);
						});
						saveInterest(value.toString());
					}
				});
			});
		});

		// 你的类型
		addEvent(this.itemTypeEl, 'click', () => {
			let sexIndex = getData(this.itemGenderTxtEl, this.options.dataSexIndex);
			let getAllCharacterType = findAllCharacterType();
			let getCharacterType = findCharacterTypeByUserId(this.userId, 1);

			Promise.all([getAllCharacterType, getCharacterType]).then((data) => {

				checkbox({
					data: data[0],
					title: `${DETAIL.Your_Type.Madal.Title}`,
					text: `${DETAIL.Your_Type.Madal.Text}`,
					nameValue: 'id',
					nameText: 'type_name',
					filterName: 'sex',
					filterIndex: sexIndex,
					selectData: data[1],
					selected: 3,
					callbackOk: (value, text) => {
						this.itemTypeTxtEl.innerText = '';

						text.forEach((itemData, index) => {
							let tagLabel = createDivEl({element: 'label', className: 'tag-label', content: itemData});
					        this.itemTypeTxtEl.appendChild(tagLabel);
						});
						saveMyType(value.toString(), 1);
					}
				});
			});
		});

		// 喜爱的类型
		addEvent(this.itemLoveEl, 'click', () => {
			let sexIndex = getData(this.itemGenderTxtEl, this.options.dataSexIndex);
			let getAllCharacterType = findAllCharacterType();
			let getCharacterLove = findCharacterTypeByUserId(this.userId, 2);

			Promise.all([getAllCharacterType, getCharacterLove]).then((data) => {

				checkbox({
					data: data[0],
					title: `${DETAIL.Love.Madal.Title}`,
					text: `${DETAIL.Love.Madal.Text}`,
					nameValue: 'id',
					nameText: 'type_name',
					filterName: 'sex',
					filterIndex: sexIndex == 1 ? 2 : 1,
					selectData: data[1],
					selected: 3,
					callbackOk: (value, text) => {
						this.itemLoveTxtEl.innerText = '';

						text.forEach((itemData, index) => {
							let tagLabel = createDivEl({element: 'label', className: 'tag-label', content: itemData});
					        this.itemLoveTxtEl.appendChild(tagLabel);
						});
						saveMyType(value.toString(), 2);
					}
				});
			});
		});
	}

	static attachTo(element, options) {
	    return new UserDetail(element, options);
	}
}