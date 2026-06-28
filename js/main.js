;(function () {
	
	'use strict';

	// iPad and iPod detection	
	var isiPad = function(){
		return (navigator.platform.indexOf("iPad") != -1);
	};


	var isiPhone = function(){
	    return (
			(navigator.platform.indexOf("iPhone") != -1) || 
			(navigator.platform.indexOf("iPod") != -1)
	    );
	};

	// Parallax
	var parallax = function() {
		if ( !isiPad() || !isiPhone() ) {
			$(window).stellar();
		}
	};

	// Animations

	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							el.addClass('fadeInUp animated');
							el.removeClass('item-animate');
						},  k * 50, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};
	
	var invitationGate = function() {
		var cover = $('#cover');
		var content = $('#invitation-content');
		var openButton = $('#open-invitation');

		if (!cover.length || !content.length || !openButton.length) {
			return;
		}

		$('html, body').scrollTop(0);
		content.hide();

		openButton.on('click', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			cover.fadeOut(600, function() {
				content.fadeIn(600, function() {
					if (typeof Waypoint !== 'undefined' && Waypoint.refreshAll) {
						Waypoint.refreshAll();
					}
					$('html, body').animate({
						scrollTop: content.offset().top
					}, 500, 'easeInOutExpo');
				});
			});
		});
	};

	var personalizedGuest = function() {
		var guestName = $('#guest-name');

		if (!guestName.length) {
			return;
		}

		var fallbackName = guestName.data('fallback') || 'Tamu Undangan';
		var params = new URLSearchParams(window.location.search);
		var guestCode = (params.get('to') || params.get('code') || params.get('guest') || '').trim();

		if (!guestCode) {
			guestName.text(fallbackName);
			return;
		}

		fetch('guests.json', { cache: 'no-store' })
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Guest list could not be loaded.');
				}
				return response.json();
			})
			.then(function(guests) {
				var normalizedCode = guestCode.toLowerCase();
				var guest = guests.find(function(item) {
					return item.code && item.code.toLowerCase() === normalizedCode;
				});

				guestName.text(guest && guest.name ? guest.name : fallbackName);
			})
			.catch(function() {
				guestName.text(fallbackName);
			});
	};

	var weddingCountdown = function() {
		var countDownDate = new Date("Dec 28, 2026 09:00:00").getTime();
		var dayElement = document.getElementById("days");
		var hourElement = document.getElementById("hours");
		var minuteElement = document.getElementById("minutes");
		var secondElement = document.getElementById("seconds");
		var messageElement = document.getElementById("countdown-message");

		if (!dayElement || !hourElement || !minuteElement || !secondElement) {
			return;
		}

		var updateCountdown = function() {
			var now = new Date().getTime();
			var distance = countDownDate - now;

			if (distance < 0) {
				dayElement.innerHTML = "0 <small>hari</small>";
				hourElement.innerHTML = "0 <small>jam</small>";
				minuteElement.innerHTML = "0 <small>menit</small>";
				secondElement.innerHTML = "0 <small>detik</small>";
				if (messageElement) {
					messageElement.innerHTML = "Acara pernikahan telah berlangsung.";
				}
				clearInterval(timer);
				return;
			}

			dayElement.innerHTML = Math.floor(distance / (1000 * 60 * 60 * 24)) + " <small>hari</small>";
			hourElement.innerHTML = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + " <small>jam</small>";
			minuteElement.innerHTML = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) + " <small>menit</small>";
			secondElement.innerHTML = Math.floor((distance % (1000 * 60)) / 1000) + " <small>detik</small>";
		};

		var timer = setInterval(updateCountdown, 1000);
		updateCountdown();
	};

	var smoothScroll = function() {
		$('#fh5co-page a[href^="#"]').on('click', function(e) {
			if ($(this).is('#open-invitation')) {
				return;
			}

			var href = $(this).attr('href');
			if (!href || href.length <= 1) {
				return;
			}

			var target = $(href);
			if (target.length) {
				e.preventDefault();
				$('html, body').animate({
					scrollTop: target.offset().top
				}, 700, 'easeInOutExpo');
			}
		});
	};

	var staticForms = function() {
		$('#fh5co-started form, #ucapan form').on('submit', function(e) {
			e.preventDefault();
			$(this).find('button[type="submit"]').text('Terkirim');
		});
	};

	var copyGiftNumber = function() {
		$('.js-copy-gift').on('click', function(e) {
			e.preventDefault();
			var button = $(this);
			var text = button.data('copy');
			var fallbackInput = $('<input>');

			$('body').append(fallbackInput);
			fallbackInput.val(text).select();
			document.execCommand('copy');
			fallbackInput.remove();

			button.text('Tersalin');
			setTimeout(function() {
				button.text('Salin Nomor');
			}, 1500);
		});
	};

	// Document on load.

	$(function(){
		parallax();
		contentWayPoint();
		personalizedGuest();
		invitationGate();
		weddingCountdown();
		smoothScroll();
		staticForms();
		copyGiftNumber();
	});


}());