let live = {
	templateDOM: {},
	event: function() {
		let _self = this;
		let btn = $('.live-buttons');

		$('.icon-news', btn).on('click', function() {
			console.log('评论');
			Modal.actions(_self.templateDOM.live_news, {
				title: false,
				closeBtn: false
			});
		});

		$('.icon-share', btn).on('click', function() {
			console.log('分享');
			Modal.actions(_self.templateDOM.live_share, {
				title: 'Share to',
				closeBtn: true
			});
		});

		$('.icon-gift', btn).on('click', function() {
			console.log('礼物');
			Modal.actions(_self.templateDOM.live_gift, {
				title: 'Gift',
				closeBtn: true
			});
		});
	},
	init: function() {
		console.log('这里是livejs');
		let publicTpl = HTMLImport.attachTo(PUBLICFILE.actions_lives);
		this.templateDOM = publicTpl.tpl;
		this.event();
	}
}
export default live;