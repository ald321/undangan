;(function (window, $) {
	'use strict';

	var popupOptions = {
		type: 'image',
		removalDelay: 300,
		mainClass: 'mfp-with-zoom',
		gallery: {
			enabled: true
		},
		zoom: {
			enabled: true,
			duration: 300,
			easing: 'ease-in-out',
			opener: function (openerElement) {
				return openerElement.is('img') ? openerElement : openerElement.find('img');
			}
		}
	};

	window.initNuptialMagnificPopup = function (parentSelector) {
		if (!$ || !$.fn.magnificPopup) {
			return;
		}

		var scope = parentSelector ? $(parentSelector) : $(document.body);
		var targets = scope.find('.image-popup');

		if (!targets.length) {
			return;
		}

		targets.each(function () {
			var $el = $(this);
			if ($el.data('mfp-bound')) {
				return;
			}

			$el.magnificPopup(popupOptions);
			$el.data('mfp-bound', true);
		});
	};

	$(document).ready(function () {
		if (!$('.gallery-swiper').length) {
			window.initNuptialMagnificPopup();
		}

		$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
			disableOn: 700,
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: false
		});
	});
})(window, window.jQuery);
