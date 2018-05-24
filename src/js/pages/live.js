import modal from '../components/modal';

let live = {
	event: function() {
		let btn = $('.live-buttons');

		$('.icon-news', btn).on('click', function() {
			console.log('评论');
			// modal.actions( , {
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
		this.event();
	}
}
export default live;