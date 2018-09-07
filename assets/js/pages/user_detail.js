import Template from 'art-template/lib/template-web';
import { Spinner } from '../components/Spinner';
import EventEmitter from '../eventEmitter';
import RecordPhoto from '../record-photo';
import SendBirdAction from '../SendBirdAction';
import Modal from '../modal';

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
    createDom
} from '../util';

const LANG = getLangConfig();
const DETAIL = LANG.PERSONAL_DETAIL;
const modal = new Modal();

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

		Spinner.start(body);
		Promise.all([getPersonInfo, connectSendBird]).then((data) => {
			this.data.UserDetail = data[0];
			this.UserId = userId;

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
		// this.itemInterestTxtEl = this.itemInterestEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		// this.itemTypeTxtEl = this.itemTypeEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];
		// this.itemLoveTxtEl = this.itemLoveEl.getElementsByClassName(this.options.itemMetaTxtClass)[0];

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
			modal.prompt(DETAIL.Username.Madal.Placeholder, DETAIL.Username.Madal.Title,
				(value) => {
					this.itemUsernameTxtEl.innerText = value;
					updateUserInfo({ name: value }).then((data) => {
						if (!data) return;

						SendBirdAction.getInstance().updateCurrentUserInfo(value, null);
					});
				}
			);
        });

		// 性别
		addEvent(this.itemGenderEl, 'click', () => {
			modal.options({
				buttons: [{
					text: DETAIL.Gender.Madal.Male,
					value: 1,
					onClick: (text, value) => {
						this.itemGenderTxtEl.innerText = text;
						setData(this.itemGenderTxtEl, this.options.dataSexIndex, value);
						updateUserInfo({
							sex: value
						});
					}
				}, {
					text: DETAIL.Gender.Madal.Female,
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

			modal.dateTimePickerModal(DETAIL.Age.Madal.Title,
				(value) => {
					let ages = dataAges(value);

					this.itemAgeTxtEl.innerText = ages;
					updateUserInfo({
						age: ages
					});
				},
			);
		});

		// 身高
		addEvent(this.itemHeightEl, 'click', () => {

			modal.prompt(DETAIL.Height.Madal.Placeholder, DETAIL.Height.Madal.Title,
				(value) => {
					this.itemHeightTxtEl.innerText = value + DETAIL.Height.Unit;
					updateUserInfo({
						height: value
					});
				}
			);
		});

		// 体重
		addEvent(this.itemWeightEl, 'click', () => {

			modal.prompt(DETAIL.Body_Weight.Madal.Placeholder, DETAIL.Body_Weight.Madal.Title,
				(value) => {
					this.itemWeightTxtEl.innerText = value + DETAIL.Body_Weight.Unit;
					updateUserInfo({
						weight: value
					});
				}
			);
		});

		// 用户交友目的
		addEvent(this.itemFriendsEl, 'click', () => {

			modal.pickerModal(DETAIL.Why_Make_Friends.Madal.Lists, DETAIL.Why_Make_Friends.Madal.Title,
				(value, text, index) => {
					this.itemFriendsTxtEl.innerText = text;
					updateUserInfo({
						goal: value
					});
				}
			);
		});

		// 兴趣
		addEvent(this.itemInterestEl, 'click', () => {
			let getAllUserHobby = findAllUserHobby();
			let getHobby = findHobbyByUserId(this.UserId)

			Promise.all([getAllUserHobby, getHobby]).then((data) => {
				modal.checkboxModal({
					text: DETAIL.Interest.Madal.Text,
					title: DETAIL.Interest.Madal.Title,
					data: data[0],
					nameValue: 'id',
					nameText: 'hobby_name',
					selectData: data[1],
					closeBtn: true,
					selected: 3,
				}, (value, text) => {
					saveInterest(value.toString());
				});
			});
		});

		// 你的类型
		addEvent(this.itemTypeEl, 'click', () => {
			let sexIndex = getData(this.itemGenderTxtEl, this.options.dataSexIndex);
			let getAllCharacterType = findAllCharacterType();
			let getCharacterType = findCharacterTypeByUserId(this.UserId, 1);

			Promise.all([getAllCharacterType, getCharacterType]).then((data) => {
				modal.checkboxModal({
					text: DETAIL.Your_Type.Madal.Text,
					title: DETAIL.Your_Type.Madal.Title,
					data: data[0],
					nameValue: 'id',
					nameText: 'type_name',
					selectData: data[1],
					filterName: 'sex',
					filterIndex: sexIndex,
					closeBtn: true,
					selected: 3,
				}, (value, text) => {
					saveMyType(value.toString(), 1);
				});
			});
		});

		// 喜爱的类型
		addEvent(this.itemLoveEl, 'click', () => {
			let sexIndex = getData(this.itemGenderTxtEl, this.options.dataSexIndex);
			let getAllCharacterType = findAllCharacterType();
			let getCharacterType = findCharacterTypeByUserId(this.UserId, 2);

			Promise.all([getAllCharacterType, getCharacterType]).then((data) => {
				modal.checkboxModal({
					text: DETAIL.Love.Madal.Text,
					title: DETAIL.Love.Madal.Title,
					data: data[0],
					nameValue: 'id',
					nameText: 'type_name',
					selectData: data[1],
					filterName: 'sex',
					filterIndex: sexIndex == 1 ? 2 : 1,
					closeBtn: true,
					selected: 3,
				}, (value, text) => {
					saveMyType(value.toString(), 2);
				});
			});
		});
	}

	static attachTo(element, options) {
	    return new UserDetail(element, options);
	}
}