let live = {
	templateDOM: {},
	event: function() {
		let btn = $('.live-buttons');

		$('.icon-news', btn).on('click', function() {
			console.log('评论');
			// Modal.actions( , {
			// 	title: 'Gift',
			// 	closeBtn: true
			// });
		});

		$('.icon-share', btn).on('click', function() {
			console.log('分享');
		});

		$('.icon-gift', btn).on('click', function() {
			console.log('礼物');
		});
	},
	init: function() {
		console.log('这里是livejs');
		let templateDOM = HTMLImport.attachTo(PUBLICFILE.actions_lives);
		let html = templateDOM.querySelector('#live-news');
		console.log(html);
		this.event();
	}
}
export default live;