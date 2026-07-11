;(function (window) {
	'use strict';

	var MOBILE_BREAKPOINT = 768;

	var GallerySwiper = {
		instance: null,
		mediaQuery: null,

		init: function () {
			var swiperEl = document.querySelector('.gallery-swiper');
			if (!swiperEl || typeof window.Swiper === 'undefined') {
				this.bindMagnific('.gallery-grid-desktop');
				return;
			}

			this.mediaQuery = window.matchMedia('(max-width: ' + (MOBILE_BREAKPOINT - 1) + 'px)');
			this.handleBreakpoint();

			if (typeof this.mediaQuery.addEventListener === 'function') {
				this.mediaQuery.addEventListener('change', this.handleBreakpoint.bind(this));
			} else if (typeof this.mediaQuery.addListener === 'function') {
				this.mediaQuery.addListener(this.handleBreakpoint.bind(this));
			}
		},

		handleBreakpoint: function () {
			if (this.mediaQuery.matches) {
				this.createSwiper();
			} else {
				this.destroySwiper();
				this.bindMagnific('.gallery-grid-desktop');
			}
		},

		createSwiper: function () {
			var swiperEl = document.querySelector('.gallery-swiper');
			if (!swiperEl || this.instance) {
				return;
			}

			var self = this;
			this.instance = new window.Swiper(swiperEl, {
				slidesPerView: 1.15,
				spaceBetween: 16,
				centeredSlides: true,
				loop: true,
				pagination: {
					el: '.gallery-swiper .swiper-pagination',
					clickable: true
				},
				on: {
					init: function () {
						self.bindMagnific('.gallery-swiper');
					}
				}
			});
		},

		destroySwiper: function () {
			if (!this.instance) {
				return;
			}

			this.instance.destroy(true, true);
			this.instance = null;
		},

		bindMagnific: function (parentSelector) {
			if (typeof window.initNuptialMagnificPopup === 'function') {
				window.initNuptialMagnificPopup(parentSelector);
			}
		}
	};

	window.NuptialFX = window.NuptialFX || {};
	window.NuptialFX.GallerySwiper = GallerySwiper;
})(window);
