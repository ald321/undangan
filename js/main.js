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

		if (!cover.length || !openButton.length) {
			return;
		}

		$('html, body').scrollTop(0);

		if (!content.length) {
			openButton.on('click', function(e) {
				var destination = openButton.attr('href') || 'invitation.html';

				e.preventDefault();
				e.stopImmediatePropagation();

				if (openButton.hasClass('is-opening')) {
					return;
				}

				openButton.addClass('is-opening');
				cover.addClass('cover-closing');

				if (window.location.search && destination.indexOf('?') === -1) {
					destination += window.location.search;
				}

				try {
					sessionStorage.setItem('invitationOpened', 'true');
				} catch (error) {}

				setTimeout(function() {
					window.location.href = destination;
				}, 950);
			});
			return;
		}

		content.hide();

		openButton.on('click', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();

			if (openButton.hasClass('is-opening')) {
				return;
			}

			openButton.addClass('is-opening');
			playWeddingMusic();

			content
				.css('opacity', 0)
				.show()
				.addClass('invitation-opening');
			cover.addClass('cover-closing');

			setTimeout(function() {
				cover.hide();
				content.css('opacity', '').removeClass('invitation-opening');

				if (typeof Waypoint !== 'undefined' && Waypoint.refreshAll) {
					Waypoint.refreshAll();
				}
				$('html, body').animate({
					scrollTop: content.offset().top
				}, 700, 'easeInOutExpo');
			}, 950);
		});
	};

	var protectInvitationPage = function() {
		var isInvitationPage = $('#invitation-content').length && !$('#cover').length;
		var canOpen = false;

		if (!isInvitationPage) {
			return true;
		}

		try {
			canOpen = sessionStorage.getItem('invitationOpened') === 'true';
		} catch (error) {}

		if (!canOpen) {
			window.location.replace('index.html' + window.location.search);
			return false;
		}

		return true;
	};

	var invitationBackLink = function() {
		var backLink = $('#back-to-cover');

		if (!backLink.length || !window.location.search) {
			return;
		}

		backLink.attr('href', backLink.attr('href') + window.location.search);
	};

	var updateMusicButton = function(isPlaying) {
		var button = $('#music-toggle');

		if (!button.length) {
			return;
		}

		button.toggleClass('is-playing', isPlaying);
		button.attr('aria-pressed', isPlaying ? 'true' : 'false');
		button.attr('aria-label', isPlaying ? 'Jeda musik' : 'Putar musik');
		button.find('span').text(isPlaying ? 'Pause' : 'Play');
	};

	var playWeddingMusic = function() {
		var music = document.getElementById('wedding-music');

		if (!music) {
			return;
		}

		var playPromise = music.play();

		if (playPromise && typeof playPromise.then === 'function') {
			playPromise
				.then(function() {
					updateMusicButton(true);
				})
				.catch(function() {
					updateMusicButton(false);
				});
			return;
		}

		updateMusicButton(true);
	};

	var pauseWeddingMusic = function() {
		var music = document.getElementById('wedding-music');

		if (!music) {
			return;
		}

		music.pause();
		updateMusicButton(false);
	};

	var musicToggle = function() {
		var music = document.getElementById('wedding-music');
		var button = $('#music-toggle');

		if (!music || !button.length) {
			return;
		}

		updateMusicButton(!music.paused);

		button.on('click', function(e) {
			e.preventDefault();

			if (music.paused) {
				playWeddingMusic();
			} else {
				pauseWeddingMusic();
			}
		});
	};

	var startMusicOnFirstInteraction = function() {
		$(document).one('click touchstart keydown', function() {
			var music = document.getElementById('wedding-music');

			if (music && music.paused) {
				playWeddingMusic();
			}
		});
	};

	var resumeMusicAfterCover = function() {
		var wasOpened = false;

		try {
			wasOpened = sessionStorage.getItem('invitationOpened') === 'true';
			sessionStorage.removeItem('invitationOpened');
		} catch (error) {}

		if (wasOpened && !$('#cover').length) {
			setTimeout(playWeddingMusic, 300);
		}
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

	$(document).ready(function() {
		if (!protectInvitationPage()) {
			return;
		}

		parallax();
		contentWayPoint();
		personalizedGuest();
		invitationBackLink();
		invitationGate();
		musicToggle();
		resumeMusicAfterCover();
		startMusicOnFirstInteraction();
		weddingCountdown();
		smoothScroll();
		staticForms();
		copyGiftNumber();
	});


}());