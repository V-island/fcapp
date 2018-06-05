let home = {
	event: function($) {
		$('.card-content','.card-list').on('click', function() {
			$.alert('She is looking forward to your true love', 'Not enough coins', function() {
				// modal.popup();
				location.hash = '#/live';
			});
		});
	},
	init: function($) {
		console.log('这里是homejs');
		// homeSwiper();
		this.event($);
	}
}
export default home;