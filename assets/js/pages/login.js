let login = {
	init: function() {
		console.log('这里是登录js');
	},
	event: function() {
		let Info = $('.list-info');

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
	}
}
export default login;