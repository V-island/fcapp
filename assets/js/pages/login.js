let login = {
	init: function() {
		console.log('这里是登录js');
		this.event();
	},
	event: function() {
		let Group = $('.form-group');

		// 选择国家
		Group.on('click', '.form-control.country', function(e) {
			let _self = $(this);

			$.countryModal(function(value) {
				console.log('确认修改' + value);
			});
		});
	}
}
export default login;