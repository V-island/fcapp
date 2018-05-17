import Swiper from 'swiper';
import fotorama from 'fotorama/fotorama';

let home = {
	tabsSwiper: function() {
		let tabsSwiper = new Swiper('.tabs-container', {
			wrapperClass: 'tabs-wrapper',
			slideClass: 'tab-item',
			slideActiveClass: 'active',
			initialSlide: 1,
			speed: 500,
			on: {
				slideChangeTransitionStart: function() {
					$(".buttons-tab .active").removeClass('active');
					$(".buttons-tab a").eq(this.activeIndex).addClass('active');
				}
			}
		})
		$(".buttons-tab a").on('click', function(e) {
			e.preventDefault()
			$(".buttons-tab .active").removeClass('active');
			$(this).addClass('active');
			tabsSwiper.slideTo($(this).index());
		})
	},
	init: function() {
		console.log('这里是homejs');
		$('.fotorama').fotorama();
		this.tabsSwiper();
	}
}
export default home;