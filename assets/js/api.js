import SendBirdAction from './SendBirdAction';
import Modal from './modal';
import {
	fcConfig,
	baseURL
} from './intro';
import {
	getLangConfig
} from './lang';
import {
	extend,
	typeOf,
	isObject,
	isFunction,
	getUuid,
	urlParse,
	getLocalStorage,
	setLocalStorage,
	removeLocalStorage,
	clearLocalStorage
} from './util';

const LANG = getLangConfig();
const modal = new Modal();

// const baseURL = 'http://10.30.11.112:8080/live-app/open/gate';
// const baseURL = 'https://10.30.11.112:8443/live-app/open/gate';
// const baseURL = 'https://10.30.11.112:8443/live-app/register';
const Type = 'POST';
const MacType = 1; // 设备类型 1.手机 2.PC
const PhoneType = null;
const LoginMode = 2; // 登入方式 1.APP 2.web 3.PC

// localStorage KEY
const TOKEN_NAME = 'TOKEN';
const UER_NAME = 'USE_INFO';
const UUID = 'UUID';
const COUNTRY_ID_NAME = 'COUNTRY_ID';
const COUNTRY_NAME = 'COUNTRY';

const NEW_List_DATA = [{
	user_id: 1,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 9999,
	live_price: 10,
	status: 1,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const HOT_List_DATA = [{
	user_id: 1,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 9999,
	live_price: 10,
	status: 1,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	live_url: "https://media.html5media.info/video.mp4",
	everyday_img: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	heat: 889,
	live_price: 10,
	status: 3,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const VIDEO_List_DATA = [{
	user_id: 1,
	id: 199,
	img_url: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	video_url: "http://10.30.11.112:8080/file/14/videos/video.mp4",
	video_description: "Do you like me",
	create_time: "2018-8-19",
	support: 9999,
	watch_number: 999,
	price: 10,
	status: 2,
	type: 1,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "LIVE"
}, {
	user_id: 2,
	id: 456,
	img_url: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	video_description: "Do you not come to see such",
	video_url: "http://10.30.11.112:8080/file/14/videos/video.mp4",
	create_time: "2018-8-19",
	support: 685,
	watch_number: 9999,
	price: 10,
	status: 2,
	type: 2,
	user_head: "http://www.opixer.com/var/thumb/a4430993ef8cfca015e83a1e5680edc5-1280-900.jpg",
	user_name: "COME"
}];

const ADVERTISEMENT_DATA = [{
	id: 199,
	show_url: "http://www.opixer.com/var/thumb/50f1591d615e5ad388ec310aac4207d9-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/50f1591d615e5ad388ec310aac4207d9-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}, {
	id: 456,
	show_url: "http://www.opixer.com/var/thumb/4183a3a24cf2d2650c294a337d9c4288-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/4183a3a24cf2d2650c294a337d9c4288-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}, {
	id: 456,
	show_url: "http://www.opixer.com/var/thumb/10b0e941baa19b6049cf9c677eff2f09-1280-900.jpg",
	save_url: "http://www.opixer.com/var/thumb/10b0e941baa19b6049cf9c677eff2f09-1280-900.jpg",
	img_title: "Do you like me",
	description: "LIVE",
	status: 1
}];

const VIDEO_TYPE_DATA = [{
	id: 1,
	video_type: 'Dance',
	status: 1
}, {
	id: 2,
	video_type: 'Singing',
	status: 1
}, {
	id: 3,
	video_type: 'Emotion',
	status: 1
}, {
	id: 4,
	video_type: 'Art',
	status: 1
}];

const USER_INFO = {
	user_id: 0,
	user_name: 'live',
	user_head: null,
	user_sex: 1,
	user_age: 0,
	user_package: 0,
	user_score: 0,
	user_identity: 2,
	user_authentication: 1,
	live_level: 3,
	live_price: 0,
	vmount: 0,
	wmount: 0
}


function getPost(_url, param, callback, callbackCancel, onProgress, _type, _header, async) {
	if (isObject(_url)) {
		onProgress = arguments[2];
	    callback = arguments[1];
	    param = _url;
	}

	let token = localStorage.getItem('token');
		_type = _type == undefined ? Type : _type;
		// _baseURL = _url.indexOf('https')>-1 ? _url : baseURL;
		_header = _header != undefined ? _header : '';
		param = param != undefined ? param : '';

	if (!isObject(_url)) {
		param.keyword = _url.indexOf('/') > -1 ? _url.slice(1) : _url;
	}

	let ajaxOpt ={
		type: _type,
		async: true,
	  	crossDomain: true,
		url: baseURL,
		cache: false,
	    statusCode: {
	        200: function() {console.log(200)},
	        400: function() {toastr.error('400 你已经在其它设备登入，请重新登入');clearLocalStorage();location.href = '#/login';},
	        401: function() {toastr.error('401');removeLocalStorage(TOKEN_NAME);session.jumpPage('session/#/login');},
	        403: function() {toastr.error('403 用户没有对应操作权限')},
	        404: function() {toastr.error('404')},
	        405: function() {toastr.error('405');removeLocalStorage(TOKEN_NAME);session.jumpPage('session/#/login');}
	    }
	};

	if (isObject(_url)) {
		ajaxOpt.processData = false;
		ajaxOpt.contentType = false;
		ajaxOpt.mimeType = "multipart/form-data";
		ajaxOpt.xhr = function() {
			var xhr = $.ajaxSettings.xhr();
			if (xhr.upload) {
				xhr.upload.onprogress = function(progress) {
					if (progress.lengthComputable) {
						onProgress(progress.loaded / progress.total * 100);
					}
				};
		　　　 }
			return xhr;
		};
	}
	if(_header !== ''){
		ajaxOpt.headers = _header;
	}
	if(param !== ''){
		ajaxOpt.data = param;
	}

	console.log(ajaxOpt);
	let post = Promise.resolve($.ajax(ajaxOpt)).then(function(response) {
		console.log(response);
		if (!isObject(response)) {
			response = JSON.parse(response);
			console.log(response);
		}
		if (response.code === 1000 || response.code === 1001) {
			return callback(response);
		}
		if (response.code === 2012) {
			modal.toast(LANG.SYSTEM_CODE[response.code]);
			clearLocalStorage();
			return location.href = '#/login';
		}

		modal.alert(LANG.SYSTEM_CODE[response.code], function(_modal) {
			modal.closeModal(_modal);
		});

		if (isFunction(callbackCancel)) {
			return callbackCancel(response);
		}
	});
	return post;
}

function getMac() {
	let uuid = getLocalStorage(UUID);
	if (uuid) {
		return uuid;
	}
	uuid = getUuid();
	setLocalStorage(UUID, uuid);
	return uuid;
}

// 获取用户信息
export function getUserInfo() {
	let _info = getLocalStorage(UER_NAME);
	console.log(_info);
	if (_info === null) {
		clearLocalStorage();
		return location.href = '#/login';
	}

	return _info;
}

// 更新用户信息
export function setUserInfo(name, value) {
	let _info = getUserInfo();
	_info[name] = value;

	return setLocalStorage(UER_NAME, _info);
}

// 判断是否是主播
export function checkAuth() {
	let {userAuth} = getUserInfo();

	return userAuth === 2 ? true : false;
	// return userIdentity === 2 ? true : false;
}

// 验证登录状态
export function checkLogin() {
	return getLocalStorage(UER_NAME) === null ? true : false;
}

// 验证是否保存国家信息
export function checkCountry() {
	let country = getLocalStorage(COUNTRY_ID_NAME);

	return new Promise((resolve) => {

		if (country === null) {
			let _country = findAllCountry();
			_country.then((data) => {
	            resolve(true);
	        });
		}else if (!country.gain) {
			let _country = findAllCountry(country.id, country.langId);
			_country.then((data) => {
	            resolve(true);
	        });
		}else {
			resolve(false);
		}
	});
}

export function createGroupChannel(SendBird, userID, URL, Type) {
	return new Promise((resolve) => {
		if (URL != null) resolve(URL);

		SendBird.createGroupChannel(userID, Type).then((data) => {
			resolve(data.url);
		});
	});
}

/**
 * 验证IM频道
 * @param  {[type]} userID     用户ID
 * @param  {[type]} praiseURL  点赞频道
 * @param  {[type]} commentURL 评论频道
 * @param  {[type]} giftURL    礼物频道
 * @return {[type]}            [description]
 */
export function checkIMChannel(userID, praiseURL, commentURL, giftURL) {

	return new Promise((resolve, reject) => {
		if (praiseURL != null && commentURL != null && giftURL != null) {
			return reject(false);
		}

		const SendBird = new SendBirdAction();

		SendBird.connect(userID).then(user => {
			let createComment = createGroupChannel(SendBird, userID, commentURL, 'Comment');
			let createLike =createGroupChannel(SendBird, userID, commentURL, 'Like');
			let createGift = createGroupChannel(SendBird, userID, commentURL, 'Gift');

			Promise.all([createComment, createLike, createGift]).then((data) => {
				console.log(data);

			    resolve({
			    	commentURL: data[0],
			    	praiseURL: data[1],
			    	giftURL: data[2]
			    });
			});
		}).catch(() => {
			redirectToIndex('SendBird connection failed.');
			reject('SendBird connection failed.');
		});
	});
}

//------------------------------------------------------------------------------------------------------
//-----注册、登入模块
//------------------------------------------------------------------------------------------------------

/**
 * 获取所有国家和号码编号
 * @return {[type]} [description]
 */
export function findAllCountry(id = 2, langId = 2) {

	return new Promise((resolve) => {

		getPost('/findAllCountry', {
			language_id: langId
		}, ({data}) => {
			console.log(data);
			data.forEach((_data, index) => {
			    if (_data.id === id) {
			    	_data.gain = true;
			    	setLocalStorage(COUNTRY_ID_NAME, _data);
    				setLocalStorage(COUNTRY_NAME, data);
    				resolve(true);
			    }else {
			    	resolve(false);
			    }
			});
		});
	});
};

/**
 * 发送验证码
 * @param  {[string]} _phone 	   手机号
 * @return {[type]} [description]
 */
export function sendVerificationCode(_phone) {

	return new Promise((resolve) => {

		getPost('/sendAuthCode', {
			phone: _phone
		}, (response) => {
			resolve(true);
		});
	});
};

/**
 * 注册
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function getRegister(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);

	return new Promise((resolve) => {

		getPost('/insRegister', _params, (response) => {
			getLogin({
				phoneCode: _params.phoneCode,
				userPhone: _params.userPhone,
				userPassword: _params.userPassword
			});
			resolve(true);
		});
	});
};

/**
 * 登录
 * @param  {[object]} params 	   [description]
 * @param  {[type]} callback     回调事件
 * @return {[type]} [description]
 */
export function getLogin(params, callback) {
	let _params = isObject(params) ? params : urlParse(params);
	let _mac = getMac();
	_params.mac = _mac;
	_params.macType = MacType;
	_params.phoneType = PhoneType;
	_params.loginMode = LoginMode;
	_params.status = 1;
	getPost('/appLogin', _params, (response) => {
		modal.toast(LANG.SYSTEM_CODE[response.code]);
		const {token, userId, phoneCode, userPhone, praise_channel, comment_channel, gift_channel} = response.data;

		setLocalStorage(TOKEN_NAME, token);

		checkIMChannel(userId, praise_channel, comment_channel, gift_channel).then(({praiseURL, commentURL, giftURL}) => {
			SendBirdAction.getInstance().disconnect();
			CreateIMChannel(userId, praiseURL, commentURL, giftURL).then((data) => {
				if (!data) getLogin(_params);

				personCenter({
					userId: userId,
					phoneCode: phoneCode,
					userPhone: userPhone
				}, token, _mac, true);
			});
		}).catch(() => {
			personCenter({
				userId: userId,
				phoneCode: phoneCode,
				userPhone: userPhone
			}, token, _mac, true);
		});
	});
};

/**
 * 找回密码
 * @param  {[object]} params 	   [description]
 * @return {[type]} [description]
 */
export function getFindPassword(params) {
	let {phoneCode, userPhone} = isObject(params) ? params : urlParse(params);

	return new Promise((resolve) => {
		getPost('/findPassword', _params, (response) => {
			setLocalStorage(UER_NAME, {
				phoneCode: phoneCode,
				userPhone: userPhone
			});
			resolve(true);
		});
	});
};

/**
 * 更新密码
 * @param  {[object]} params 	   [description]
 * @return {[type]} [description]
 */
export function getUpdatePassword(params) {
	let _params = isObject(params) ? params : urlParse(params);
	let {phoneCode, userPhone} = getUserInfo();
	_params.phoneCode = phoneCode;
	_params.userPhone = userPhone;

	return new Promise((resolve) => {
		getPost('/updatePassword', _params, (response) => {
			modal.toast(LANG.SYSTEM_CODE[response.code]);
			resolve(true);
		});
	});
};

/**
 * 登出
 * @return {[type]} [description]
 */
export function appLoginOut() {
	let {userId} = getUserInfo();
	let _params = {
		status: 2,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/appLoginOut', _params, (response) => {
			modal.toast(LANG.SYSTEM_CODE[response.code]);
			clearLocalStorage();
			location.href = '#/login';
			resolve(true);
		});
	});
};

/**
 * 创建IM频道
 * @param {[type]} userId    用户ID
 * @param {[type]} praiseId  点赞频道
 * @param {[type]} commentId 评论频道
 * @param {[type]} giftsID   礼物频道
 */
export function CreateIMChannel(userId, praiseId, commentId, giftsID) {
	let _params = {
		userId: userId,
		praise_channel: praiseId,
		comment_channel: commentId,
		gift_channel: giftsID
	}

	return new Promise((resolve) => {
		getPost('/CreateIMChannel', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

//------------------------------------------------------------------------------------------------------
//-----个人中心模块
//------------------------------------------------------------------------------------------------------

/**
 * 个人中心/个人信息
 * @return {[type]} [description]
 */
export function personCenter(params, token, mac, _checkLogin = false) {
	let _info = isObject(params) ? params : getUserInfo();
		token = typeof token !== 'undefined' ? token : getLocalStorage(TOKEN_NAME);
		mac = typeof mac !== 'undefined' ? mac : getMac();;
	let _params = {
		userId: _info.userId,
		token: token,
		loginMode: LoginMode,
		mac: mac
	}

	return new Promise((resolve) => {
		getPost('/personCenter', _params, (response) => {
			_info.userAuth = response.data.user_authentication;
			// _info.userIdentity = response.data.user_identity;
			_info.userName = response.data.user_name;
			_info.userHead = response.data.user_head;
			_info.userSex = response.data.user_sex;
			_info.userPackage = response.data.user_package;

			setLocalStorage(UER_NAME, _info);

			if (_checkLogin) {
				return location.href = '#/home';
			}
			resolve(response.data ? response.data : USER_INFO);
		});
	});
};

/**
 * 所有兴趣爱好列表
 * @return {[type]} [description]
 */
export function findAllUserHobby() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/findAllUserHobby', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 查询某个用户的兴趣爱好
 * @param  {[type]} Id 用户ID
 * @return {[type]}    [description]
 */
export function findHobbyByUserId(userID) {
	let _params = {
		userId: userID
	}

	return new Promise((resolve) => {
		getPost('/findHobbyByUserId', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 获取所有性格特点列表
 * @return {[type]} [description]
 */
export function findAllCharacterType() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/findAllCharacterType', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 查询某个用户的性格类型
 * @return {[type]} [description]
 */
export function findCharacterTypeByUserId(userID, id = 1) {
	let _params = {
		belongId: id,
		userId: userID
	}

	return new Promise((resolve) => {
		getPost('/findCharacterTypeByUserId', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 保存我的兴趣爱好
 * @param  {[type]} id 兴趣爱好ID，数组字符串，如 String[] hobby_id.tostring()
 * @return {[type]}    [description]
 */
export function saveInterest(id) {
	let {userId} = getUserInfo();
	let _params = {
		hobby_id: id,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/saveInterest', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 保存我喜欢的性格类型或我的性格类型
 * @param  {[type]} typeId 性格编号ID，数组字符串，如 String[] type_id.tostring()
 * @param  {Number} id     属于关系(1.自身类型 2.喜欢类型)
 * @return {[type]}        [description]
 */
export function saveMyType(typeId, id = 1) {
	let {userId} = getUserInfo();
	let _params = {
		type_id: typeId,
		belong_id: id,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/saveMyType', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 个人详情
 * @return {[type]} [description]
 */
export function personInfo() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/personInfo', _params, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 修改个人资料
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
export function updateUserInfo(params) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}
	if (typeof params.name !== 'undefined') {
		_params.userName = params.name;
	}
	if (typeof params.sex !== 'undefined') {
		_params.userSex = params.sex;
	}
	if (typeof params.age !== 'undefined') {
		_params.userAge = params.age;
	}
	if (typeof params.height !== 'undefined') {
		_params.userHeight = params.height;
	}
	if (typeof params.weight !== 'undefined') {
		_params.userWeight = params.weight;
	}
	if (typeof params.goal !== 'undefined') {
		_params.makeFriendsGoal = params.goal;
	}

	return new Promise((resolve) => {
		getPost('/updateUserInfo', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 我上传的视频
 * @param  {Number} _page   当前页
 * @param  {Number} _number 每页条数
 * @return {[type]}         [description]
 */
export function findMyVideo(_page = 1, _number = 10) {
	let {userId} = getUserInfo();
	let _params = {
		page: _page,
		number: _number,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/findMyVideo', _params, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 查看我的历史观看视频
 * @param  {Number} _page   当前页
 * @param  {Number} _number 每页条数
 * @return {[type]}         [description]
 */
export function findWatchHistory(_page = 1, _number = 10) {
	let {userId} = getUserInfo();
	let _params = {
		page: _page,
		number: _number,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/findWatchHistory', _params, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 关注
 * @param  {[type]} _id     关注（粉丝ID）的用户ID
 * @param  {[type]} _status 状态 1. 关注 2.取消关注
 * @return {[type]}         [description]
 */
export function follow(_id, _status) {
	let {userId} = getUserInfo();
	let _params = {
		fans_user_id: userId,
		status: _status,
		userId: _id
	}

	return new Promise((resolve) => {

		getPost('/follow', _params, (response) => {
			resolve(true);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 根据用户ID查找用户上传视频
 * @param  {[type]} userId  用户ID
 * @param  {Number} _page   当前页
 * @param  {Number} _number 数量
 * @return {[type]}         [description]
 */
export function selVideoByUserId(userId, _page = 1, _number = 10) {
	let _params = {
		userId: userId,
		page: _page,
		number: _number
	}

	return new Promise((resolve) => {
		getPost('/selVideoByUserId', _params, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 查询某个视频的评论信息
 * @param  {[type]} videoId 视频ID
 * @param  {Number} _page   当前页
 * @param  {Number} _number 条数
 * @return {[type]}         [description]
 */
export function selCommentById(videoId, _page = 1, _number = 10) {
	let {userId} = getUserInfo();
	let _params = {
		videoId: videoId,
		page: _page,
		number: _number,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/selCommentById', _params, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 评论视频接口
 * @param  {[type]} videoId 视频ID
 * @param  {[type]} content 评论内容
 * @return {[type]}         [description]
 */
export function commentVideo(videoId, content) {
	let {userId} = getUserInfo();
	let _params = {
		videoId: videoId,
		content: content,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/commentVideo', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 点赞接口
 * @param  {[type]} videoId 视频ID
 * @param  {[type]} status  状态
 * @return {[type]}         [description]
 */
export function praiseVideo(videoId, status = 1) {
	let {userId} = getUserInfo();
	let _params = {
		videoId: videoId,
		status: status,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/praiseVideo', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 查看别人的详细信息接口
 * @param  {[type]} userId 	用户ID
 * @return {[type]}         [description]
 */
export function searchUserInfo(_userID) {
	let {userId} = getUserInfo();
	let _params = {
		userId: _userID,
		loginUserId: userId
	}

	return new Promise((resolve) => {
		getPost('/searchUserInfo', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 关注和被关注用户列表
 * @param  {Number} _page   当前页
 * @param  {Number} _number 数量
 * @param  {[type]} _type   类型：1.我关注的人  2.关注我的人
 * @return {[type]}         [description]
 */
export function followList(_page = 1, _number = 10, _type) {
	let {userId} = getUserInfo();
	let _params = {
		type: _type,
		page: _page,
		number: _number,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/followList', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 观看视频赠送礼物
 * @param  {[type]} videoUserId 视频拥有者
 * @param  {[type]} videoId     视频ID
 * @param  {[type]} giftsId     礼物ID
 * @param  {[type]} amount      礼物数量
 * @param  {[type]} price       礼物价格
 * @return {[type]}             [description]
 */
export function videoGifts(videoUserId, videoId, giftsId, amount = 1, price) {
	let {userId, userPackage} = getUserInfo();
	let _params = {
		giftsId: giftsId,
		videoId: videoId,
		amount: amount,
		videoUserId: videoUserId,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		if (price == 0) resolve(userPackage);

		getPost('/videoGifts', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};


/**
 * 头像上传
 * @param  {[type]}   _file      上传照片
 * @param  {Function} callback   [description]
 * @param  {[type]}   onProgress [description]
 * @return {[type]}              [description]
 */
export function uploadHead(_file, callback, onProgress) {
	let {userId} = getUserInfo();
	let formData = new FormData();

	formData.append("keyword", 'uploadHead');
	formData.append("userId", userId);
	formData.append("token", getLocalStorage(TOKEN_NAME));
	formData.append("loginMode", LoginMode);
	formData.append("mac", getMac());
	formData.append("file", _file);

	getPost(formData, (response) => {
		callback(response.data);
	}, (progress) => {
		if (typeof onProgress === 'function') {
		  onProgress(progress);
		}
	});
};


//------------------------------------------------------------------------------------------------------
//-----直播模块
//------------------------------------------------------------------------------------------------------
/**
 * 礼物数据字典
 * @return {[type]} [description]
 */
export function findAllgifts() {

	return new Promise((resolve) => {

		getPost('/findAllgifts', {}, (response) => {
			resolve(response.data);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 主播创建直播间并加入
 * @return {[type]} [description]
 */
export function createChannel() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {

		getPost('/createChannel', _params, (response) => {
			resolve(response.data);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 直播状态--开播或下播
 * @param  {[int]}  _status 	   状态 1.上播（直播等待中） 2.下播 3.直播中 4.禁播
 * @return {[type]} [description]
 */
export function liveStatus(_status) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		status: _status
	}
	return new Promise((resolve) => {

		getPost('/liveStatus', _params, (response) => {
			resolve(true);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 用户接受邀请加入直播间
 * @param  {[type]} channel   频道ID
 * @return {[type]}           [description]
 */
export function loginChannel(channel) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		channel: channel
	}
	return new Promise((resolve) => {

		getPost('/loginChannel', _params, (response) => {
			resolve(true);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 关闭频道
 * @param  {[type]} channel 频道ID
 * @return {[type]}         [description]
 */
export function closeChannel(channel) {
	let _params = {
		channel: channel
	}
	return new Promise((resolve) => {

		getPost('/closeChannel', _params, (response) => {
			resolve(response.data);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 用户评价
 * @param  {[type]} channel    频道ID
 * @param  {[type]} liveUserId 主播ID
 * @param  {[type]} stars      评价星级
 * @return {[type]}            [description]
 */
export function userEvaluate(channel, liveUserId, stars) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		channel: channel,
		liveUserId: liveUserId,
		stars: stars,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}
	return new Promise((resolve) => {

		getPost('/userEvaluate', _params, (response) => {
			resolve(true);
		},(response) => {
			resolve(false);
		});
	});
};

/**
 * 每日一录--开播前查询是否需要重新录制小视频
 * @return {[type]} [description]
 */
export function newDayRecord() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/selEverdayVideo', _params, (response) => {
			resolve(response.data ? true : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 获取广告
 * @return {[type]} [description]
 */
export function getAdvertisement() {

	return new Promise((resolve) => {
		getPost('/getAdvertisement', {}, (response) => {
			resolve(response.data ? response.data : ADVERTISEMENT_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 获取播放视频地址
 * @param  {[type]} videoID [description]
 * @return {[type]}         [description]
 */
export function playVideo(videoID) {
	let {userId} = getUserInfo();
	let _params = {
		id: videoID,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/playVideo', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};


/**
 * 新人列表
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @return {[type]} [description]
 */
export function newVideo(_page = 1, _number = 10) {

	return new Promise((resolve) => {
		getPost('/newVideo', {
			page: _page,
			number: _number
		}, (response) => {
			resolve(response.data ? response.data : NEW_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 热门列表
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @return {[type]} [description]
 */
export function hotVideo(_page = 1, _number = 10) {

	return new Promise((resolve) => {
		getPost('/hotVideo', {
			page: _page,
			number: _number
		}, (response) => {
			resolve(response.data ? response.data : HOT_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 显示视频
 * @param  {[String]} _page 	   当前页
 * @param  {[String]} _number 	   条数
 * @param  {[String]} _type 	   类别 1.免费 2.收费
 * @return {[type]} [description]
 */
export function videoClips(_page = 1, _number = 10, _tag = 0, _type) {

	return new Promise((resolve) => {
		getPost('/videoClips', {
			page: _page,
			number: _number,
			type: _type,
			video_tag: _tag
		}, (response) => {
			resolve(response.data ? response.data : VIDEO_List_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 获取视频类别
 * @return {[type]} [description]
 */
export function videoType() {

	return new Promise((resolve) => {
		getPost('/getVideoType', {}, (response) => {
			resolve(response.data ? response.data : VIDEO_TYPE_DATA);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 直播赠送礼物接口
 * @param  {[type]} liveID    主播ID
 * @param  {[type]} channelID 直播间ID
 * @param  {[type]} giftsID   礼物ID
 * @param  {Number} amount    礼物数量
 * @return {[type]}           [description]
 */
export function reward(liveID, channelID, giftsID, amount = 1) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac(),
		live_user_id: liveID,
		live_room_id: channelID,
		gifts_id: giftsID,
		amount: amount
	}

	return new Promise((resolve) => {
		getPost('/reward', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 获取该直播间的收益详情
 * @param  {[type]} channelID 直播间ID
 * @return {[type]}           [description]
 */
export function roomProfit(channelID) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac(),
		channel: channelID
	}

	return new Promise((resolve) => {
		getPost('/roomProfit', _params, (response) => {
			resolve(response.data ? response.data : false);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 直播结束切换主播状态
 * @return {[type]} [description]
 */
export function liveAgain() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/liveAgain', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};


//------------------------------------------------------------------------------------------------------
//-----视频模块
//------------------------------------------------------------------------------------------------------

/**
 * 用户上传视频
 * @param  {[type]}   _file      视频文体
 * @param  {[type]}   _type      类型 1.上传15秒视频     2.上传每日打招呼小视频
 * @param  {[type]}   _title     标题/描述
 * @param  {[type]}   _tagID     标签
 * @param  {Function} callback   成功回调
 * @param  {[type]}   onProgress 进度回调
 * @return {[type]}              [description]
 */
export function uploadVideo(_file, _type, _title, callback, onProgress) {
	if (typeof _title === 'function') {
	    callback = arguments[2];
	    onProgress = arguments[3];
	    _title = false;
	}
	let {userId} = getUserInfo();
	let formData = new FormData();

	formData.append("userId", userId);
	formData.append("type", _type);
	formData.append("token", getLocalStorage(TOKEN_NAME));
	formData.append("loginMode", LoginMode);
	formData.append("mac", getMac());
	formData.append("keyword", 'upload');

	if (Array.isArray(_file)) {
		for (let i = 0; i < _file.length; i++) {
			formData.append("file", _file[i]);
		}
	}else {
		formData.append("file", _file);
	}

	if (_title) {
		formData.append("description", _title);
	}

	getPost(formData, (response) => {
		callback(response);
	}, (progress) => {
		onProgress(progress);
	});
};

/**
 * 查询是否有在审核中的打招呼视频
 * @return {[type]} [description]
 */
export function hasAudit() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/hasAudit', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 删除视频
 * @param  {[type]} _id 视频ID
 * @return {[type]}     [description]
 */
export function deleteVideo(_id) {
	let {userId} = getUserInfo();
	let _params = {
		id: _id,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/deleteVideo', _params, (response) => {
			resolve(true);
		}, (response) => {
			resolve(false);
		});
	});
};

//------------------------------------------------------------------------------------------------------
//-----支付模块
//------------------------------------------------------------------------------------------------------
/**
 * 创建订单
 * @param  {[type]} goodsId 商品ID
 * @param  {[type]} type    支付类型
 * @return {[type]}         [description]
 */
export function createOrder(goodsId, type) {
	let {userId} = getUserInfo();
	let _params = {
		goods_id: goodsId,
		pay_type: type,
		userId: userId,
		token: getLocalStorage(TOKEN_NAME),
		loginMode: LoginMode,
		mac: getMac()
	}

	return new Promise((resolve) => {
		getPost('/createOrder', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 交易历史记录
 * @param  {Number} _page   当前页
 * @param  {Number} _number 条数
 * @return {[type]}         [description]
 */
export function payHistory(_page = 1, _number = 10) {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId,
		page: _page,
		number: _number
	}

	return new Promise((resolve) => {
		getPost('/payHistory', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 积分提现界面接口
 * @return {[type]} [description]
 */
export function extractScore() {
	let {userId} = getUserInfo();
	let _params = {
		userId: userId
	}

	return new Promise((resolve) => {
		getPost('/extractScore', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 申请积分提现
 * @param  {[type]} money   体现金额（带上货币单位，如50￥，50$）
 * @param  {[type]} account 提现账户
 * @param  {Number} type    账户类型 1.paypal 2.visa
 * @return {[type]}         [description]
 */
export function applyCash(money, account, type = 1) {
	let {userId} = getUserInfo();
	let { currency_code } = getLocalStorage(COUNTRY_ID_NAME);
	let _params = {
		user_id: userId,
		blank_account: account,
		blank_type: type,
		total_money: money + currency_code
	}

	return new Promise((resolve) => {
		getPost('/applyCash', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 绑定银行卡或paypal账号
 * @param  {[type]} account 提现账户
 * @param  {Number} type    账户类型 1.paypal 2.visa
 * @param  {[type]} time    过期时间（paypal不需要，visa必传）
 * @param  {[type]} csc     安全码（paypal不需要，visa必传）
 * @return {[type]}         [description]
 */
export function bindBlank(account, type = 1, time, csc) {
	let { userId } = getUserInfo();
	let { id } = getLocalStorage(COUNTRY_ID_NAME);
	let _params = {
		user_id: userId,
		blank_account: account,
		blank_type: type,
		country_id: id
	}

	if (type == 2) {
		_params.expire_time = time;
		_params.csc = csc;
	}

	return new Promise((resolve) => {
		getPost('/bindBlank', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

/**
 * 判断用户是否已有账号
 * @param  {Number}  type 账户类型 1.paypal 2.visa
 * @return {Boolean}      [description]
 */
export function hasBindBlank(type = 1) {
	let { userId } = getUserInfo();
	let _params = {
		user_id: userId,
		blank_type: type
	}

	return new Promise((resolve) => {
		getPost('/hasBindBlank', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};


export function applyCashHistory(_page = 1, _number = 10) {
	let {userId} = getUserInfo();
	let _params = {
		user_id: userId,
		page: _page,
		number: _number
	}

	return new Promise((resolve) => {
		getPost('/applyCashHistory', _params, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};

//------------------------------------------------------------------------------------------------------
//-----商品订单模块
//------------------------------------------------------------------------------------------------------

/**
 * 获取这个区域的所有商品
 * @return {[type]} [description]
 */
export function selAllGoods() {
	let { id } = getLocalStorage(COUNTRY_ID_NAME);

	return new Promise((resolve) => {
		getPost('/selAllGoods', {country_id: id}, (response) => {
			resolve(response.data);
		}, (response) => {
			resolve(false);
		});
	});
};