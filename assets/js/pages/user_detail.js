import Picker from 'better-picker';

let userDetail = {
	event: function() {
		let Info = $('.list-info');
		let metaClass = '.list-item-meta-txt';

		// 用户名
		Info.on('click', '.list-item[data-madal-username]', function(e) {
			let _self = $(this);
			let _madal = $.langConfig.PERSONAL_DETAIL.Username.Madal;

			$.prompt(_madal.Placeholder, _madal.Title,
				function(value) {
					console.log('确认修改' + value);
					_self.find(metaClass).text(value);
				},
				function(value) {
					console.log('取消修改' + value);
				}
			);
		});

		// 性别
		Info.on('click', '.list-item[data-madal-gender]', function(e) {
			let _self = $(this);
			let _madal = $.langConfig.PERSONAL_DETAIL.Gender.Madal;

			$.options({
				buttons: [{
					text: _madal.Male,
					value: _madal.Male,
					fill: true,
					onClick: function(text, value) {
						console.log('确认修改' + value);
						_self.find(metaClass).text(text);
					}
				}, {
					text: _madal.Female,
					value: _madal.Female,
					onClick: function(text, value) {
						console.log('确认修改' + value);
						_self.find(metaClass).text(text);
					}
				}]
			});
		});

		// 年龄
		Info.on('click', '.list-item[data-madal-age]', function(e) {
			let _self = $(this);

		});

		// 身高
		Info.on('click', '.list-item[data-madal-height]', function(e) {
			let _self = $(this);
			let _madal = $.langConfig.PERSONAL_DETAIL.Height.Madal;
			let _unit = $.langConfig.PERSONAL_DETAIL.Height.Unit;

			$.prompt(_madal.Placeholder, _madal.Title,
				function(value) {
					console.log('确认修改' + value);
					_self.find(metaClass).text(value + _unit);
				},
				function(value) {
					console.log('取消修改' + value);
				}
			);

		});

		// 体重
		Info.on('click', '.list-item[data-madal-weight]', function(e) {
			let _self = $(this);
			let _madal = $.langConfig.PERSONAL_DETAIL.Body_Weight.Madal;
			let _unit = $.langConfig.PERSONAL_DETAIL.Body_Weight.Unit;

			$.prompt(_madal.Placeholder, _madal.Title,
				function(value) {
					console.log('确认修改' + value);
					_self.find(metaClass).text(value + _unit);
				},
				function(value) {
					console.log('取消修改' + value);
				}
			);

		});

		Info.on('click', '.list-item[data-madal-interest]', function(e) {
			let _self = $(this);

		});

		Info.on('click', '.list-item[data-madal-type]', function(e) {
			let _self = $(this);

		});

		Info.on('click', '.list-item[data-madal-love]', function(e) {
			let _self = $(this);

		});

		Info.on('click', '.list-item[data-madal-friends]', function(e) {
			let _self = $(this);
			let _madal = $.langConfig.PERSONAL_DETAIL.Why_Make_Friends.Madal;
			console.log(Picker);
			console.log(_madal.Lists);
			let picker = new Picker({
				data: [_madal.Lists]
			});
			picker.show();

			picker.on('picker.valuechange', function(selectedVal, selectedIndex) {
				console.log(selectedVal);
				console.log(selectedIndex);
			});
		});
	},
	init: function() {
		console.log('这里是userDetailjs');
		this.event();
	}
}
export default userDetail;