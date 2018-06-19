import Swiper from 'swiper';

let home = {
	init: function() {
		console.log('这里是homejs');
		this.homeSwiper();
		this.event();
	},
	event: function() {
		const LANG = $.langConfig.HOME.Madal;

		$('.card-content','.card-list').on('click', function() {
			let _notCoins = LANG.NotCoins;

			$.alert(_notCoins.Text, _notCoins.Title, function() {
				// modal.popup();
				location.hash = '#/live';
			}, _notCoins.ButtonsText);
		});
	},
	homeSwiper: function() {
		//暂时设计每个slide大小需要一致
		const TSPEED = 300; //切换速度300ms
		const _TSPEED = TSPEED - 250; //切换速度50ms

		let navSwiper = new Swiper('.nav-tab', {
			wrapperClass: 'buttons-tab',
			slideClass: 'tab-link',
			slideActiveClass: 'active',
			initialSlide: 1,
			slidesPerView: 3,
			freeMode: true,
			on: {
				init: function() {
					const navSlideWidth = this.slides.eq(1).css('width');
					let line = this.$el.find('.line');
					line.css('width', navSlideWidth);
					line.transition(TSPEED);
				},
				touchstart: function(e) {
					e.preventDefault();
				}
			},
		})

		let pageSwiper = new Swiper('.tabs-container', {
			wrapperClass: 'tabs-wrapper',
			slideClass: 'tab-item',
			slideActiveClass: 'active',
			initialSlide: 1,
			watchSlidesProgress: true,
			resistanceRatio: 0,
			on: {
				touchstart: function(e) {
					e.preventDefault();
				},
				touchMove: function() {
					let progress = this.progress;
					let navsum = navSwiper.slides[navSwiper.slides.length - 1].offsetLeft;
					let line = navSwiper.$el.find('.line');
					line.transition(0);
					line.transform('translateX(' + navsum * progress + 'px)');
					for (let i = 0; i < this.slides.length; i++) {
						let slideProgress = this.slides[i].progress;
						if (Math.abs(slideProgress) < 1) {
							navSwiper.slides.eq(i).css('font-size', '0.85rem');
						}
					}
				},
				transitionStart: function() {
					let activeIndex = this.activeIndex;
					let activeSlidePosition = navSwiper.slides[activeIndex].offsetLeft;
					//释放时导航粉色条移动过渡
					let line = navSwiper.$el.find('.line');
					line.transition(TSPEED);
					line.transform('translateX(' + activeSlidePosition + 'px)');

					//释放时文字变色过渡
					navSwiper.slides.eq(activeIndex).transition(_TSPEED);
					navSwiper.slides.eq(activeIndex).css('font-size', '0.85rem');
					if (activeIndex > 0) {
						navSwiper.slides.eq(activeIndex - 1).transition(_TSPEED);
						navSwiper.slides.eq(activeIndex - 1).css('font-size', '0.651rem');
					}
					if (activeIndex < this.slides.length) {
						navSwiper.slides.eq(activeIndex + 1).transition(_TSPEED);
						navSwiper.slides.eq(activeIndex + 1).css('font-size', '0.651rem');
					}

					//导航居中
					let navActiveSlideLeft = navSwiper.slides[activeIndex].offsetLeft;
					let navSlideWidth = line.css('width');
					let clientWidth = parseInt(navSwiper.$wrapperEl.css('width'));
					let navWidth = 0;
					for (let i = 0; i < navSwiper.slides.length; i++) {
						navWidth += parseInt(navSwiper.slides.eq(i).css('width'))
					}

					navSwiper.setTransition(TSPEED);
					if (navActiveSlideLeft < (clientWidth - parseInt(navSlideWidth)) / 2) {
						navSwiper.setTranslate(0)
					} else if (navActiveSlideLeft > navWidth - (parseInt(navSlideWidth) + clientWidth) / 2) {
						navSwiper.setTranslate(clientWidth - navWidth)
					} else {
						navSwiper.setTranslate((clientWidth - parseInt(navSlideWidth)) / 2 - navActiveSlideLeft)
					}

				},
			}
		})

		// navSwiper.$el.on('touchstart', function(e) {
		// 	e.preventDefault();
		// })

		navSwiper.on('tap', function(e) {

			let clickIndex = this.clickedIndex;
			let clickSlide = this.slides.eq(clickIndex);
			pageSwiper.slideTo(clickIndex, 0);
			this.slides.css('font-size', '0.651rem');
			clickSlide.css('font-size', '0.85rem');
		})

		let bannerSwiper = new Swiper('.banner', {
			wrapperClass: 'banner-box',
			slideClass: 'banner-item',
			slideActiveClass: 'active',
			loop: true,
			pagination: {
				el: '.banner-pagination',
				type: 'bullets',
				bulletClass : 'item',
				bulletActiveClass: 'active',
			}
		})
	}
}
export default home;