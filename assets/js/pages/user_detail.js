let userDetail = {
	event: function() {
		let Info = $('.list-info');

		Info.on('click', '.list-item[data-madal-prompt]', function(e) {
			let _self = $(this);
			let _title = _self.data('madalTitle');
			let _placeholder = _self.data('inputPlaceholder');

			console.log(_type, _title, _placeholder);
		})
	},
	init: function($) {
		console.log('这里是userDetailjs');
		this.event();
	}
}
export default userDetail;