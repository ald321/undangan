;(function () {
	
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reducedMotion) {
		document.documentElement.classList.add('reduce-motion');
	}

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

	var contentWayPoint = function() {
		if (window.NuptialFX && window.NuptialFX.ScrollAnimations) {
			window.NuptialFX.ScrollAnimations.init();
			return;
		}

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

	var initCoverEffects = function() {
		var petalsTarget = document.querySelector('#petals-canvas');
		var scrollFx = window.NuptialFX && window.NuptialFX.ScrollAnimations;
		var petalsFx = window.NuptialFX && window.NuptialFX.Petals;

		if (petalsTarget && petalsFx) {
			petalsFx.init('#petals-canvas', 'cover');
		}

		if (scrollFx) {
			scrollFx.initCoverIntro(function (revealGuest) {
				window.NuptialFX._revealCoverGuest = revealGuest;
			});
		}
	};

	var initInvitationEffects = function() {
		var galleryFx = window.NuptialFX && window.NuptialFX.GallerySwiper;
		var scrollFx = window.NuptialFX && window.NuptialFX.ScrollAnimations;

		if (galleryFx) {
			galleryFx.init();
		}

		if (scrollFx) {
			setTimeout(function () {
				scrollFx.refresh();
			}, 400);
		}
	};
	
	var invitationGate = function() {
		var cover = $('#cover');
		var content = $('#invitation-content');
		var openButton = $('#open-invitation');
		var scrollFx = window.NuptialFX && window.NuptialFX.ScrollAnimations;

		if (!cover.length || !openButton.length) {
			return;
		}

		$('html, body').scrollTop(0);

		if (!content.length) {
			openButton.on('click', function(e) {
				var destination = openButton.attr('href') || 'invitation.html';
				var preloader = window.NuptialPreloader;

				e.preventDefault();
				e.stopImmediatePropagation();

				if (openButton.hasClass('is-opening')) {
					return;
				}

				openButton.addClass('is-opening');
				markInvitationOpened(getGuestCodeFromUrl());

				if (window.location.search && destination.indexOf('?') === -1) {
					destination += window.location.search;
				}

				var redirect = function() {
					try {
						sessionStorage.setItem('invitationOpened', 'true');
					} catch (error) {}

					window.location.href = destination;
				};

				var openAfterPreload = function() {
					if (scrollFx) {
						scrollFx.playCoverClose({ onComplete: redirect });
					} else {
						cover.addClass('cover-closing');
						setTimeout(redirect, 950);
					}
				};

				if (preloader) {
					preloader.show();
					preloader.preload(preloader.assets, preloader.updateProgress).then(openAfterPreload);
					return;
				}

				openAfterPreload();
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
			markInvitationOpened(getGuestCodeFromUrl());
			playWeddingMusic();

			var finishOpen = function() {
				if (scrollFx) {
					scrollFx.refresh();
				} else if (typeof Waypoint !== 'undefined' && Waypoint.refreshAll) {
					Waypoint.refreshAll();
				}

				$('html, body').animate({
					scrollTop: content.offset().top
				}, 700, 'easeInOutExpo');
			};

			if (scrollFx) {
				scrollFx.playInlineOpen({
					cover: cover,
					content: content,
					onMidpoint: finishOpen
				});
			} else {
				content
					.css('opacity', 0)
					.show()
					.addClass('invitation-opening');
				cover.addClass('cover-closing');

				setTimeout(function() {
					cover.hide();
					content.css('opacity', '').removeClass('invitation-opening');
					finishOpen();
				}, 950);
			}
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

	var GUESTS_API_URL =
		'https://script.google.com/macros/s/AKfycbw_fWxPo-vBfhag9EyPXDL0MrXuTZnpZsexL7mBfX2vHUgEbC16WH4jq_GxaUq6EHvcpA/exec';

	var getGuestCodeFromUrl = function() {
		var params = new URLSearchParams(window.location.search);
		var pathMatch = window.location.pathname.match(/\/tamu\/([^/]+)\/?$/i);

		return (
			params.get('to') ||
			params.get('code') ||
			params.get('guest') ||
			(pathMatch && pathMatch[1]) ||
			''
		).trim();
	};

	var markInvitationOpened = function(guestCode) {
		if (!guestCode) {
			return;
		}

		var payload = JSON.stringify({
			action: 'opened',
			code: guestCode
		});

		// sendBeacon survives page navigation better than fetch when
		// "Buka Undangan" redirects to invitation.html.
		if (navigator.sendBeacon) {
			var blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
			navigator.sendBeacon(GUESTS_API_URL, blob);
			return;
		}

		fetch(GUESTS_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain;charset=utf-8'
			},
			body: payload,
			keepalive: true,
			redirect: 'follow'
		}).catch(function() {});
	};

	var personalizedGuest = function() {
		var guestName = $('#guest-name');

		if (!guestName.length) {
			return;
		}

		var fallbackName = guestName.data('fallback') || 'Tamu Undangan';
		var bakedName = (guestName.attr('data-guest-name') || '').trim();
		var guestCode = getGuestCodeFromUrl();

		var setGuestName = function(name) {
			guestName.text(name);

			if (window.NuptialFX && typeof window.NuptialFX._revealCoverGuest === 'function') {
				window.NuptialFX._revealCoverGuest();
				window.NuptialFX._revealCoverGuest = null;
			}
		};

		if (bakedName) {
			setGuestName(bakedName);
			return;
		}

		if (!guestCode) {
			setGuestName(fallbackName);
			return;
		}

		var guestsUrl = guestName.attr('data-guests-url') || GUESTS_API_URL;

		fetch(guestsUrl + (guestsUrl.indexOf('?') === -1 ? '?' : '&') + 'code=' + encodeURIComponent(guestCode), {
			cache: 'no-store'
		})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Guest list could not be loaded.');
				}
				return response.json();
			})
			.then(function(guest) {
				// Apps Script may return one guest object or a full list.
				if (Array.isArray(guest)) {
					var normalizedCode = guestCode.toLowerCase();
					guest = guest.find(function(item) {
						return item.code && item.code.toLowerCase() === normalizedCode;
					});
				}

				setGuestName(guest && guest.name ? guest.name : fallbackName);
			})
			.catch(function() {
				setGuestName(fallbackName);
			});
	};

	var weddingCountdown = function() {
		var countDownDate = new Date("Aug 29, 2026 08:00:00").getTime();
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
				dayElement.textContent = "0";
				hourElement.textContent = "0";
				minuteElement.textContent = "0";
				secondElement.textContent = "0";
				if (messageElement) {
					messageElement.textContent = "Acara pernikahan telah berlangsung.";
				}
				clearInterval(timer);
				return;
			}

			dayElement.textContent = Math.floor(distance / (1000 * 60 * 60 * 24));
			hourElement.textContent = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			minuteElement.textContent = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			secondElement.textContent = Math.floor((distance % (1000 * 60)) / 1000);
		};

		var timer = setInterval(updateCountdown, 1000);
		updateCountdown();
	};

	var smoothScroll = function() {
		var invitationScroller = $('#invitation-content');
		var useInvitationScroller = invitationScroller.length && $('body').hasClass('invitation-page');

		$('#fh5co-page a[href^="#"]').on('click', function(e) {
			if ($(this).is('#open-invitation')) {
				return;
			}

			var href = $(this).attr('href');
			if (!href || href.length <= 1) {
				return;
			}

			var target = $(href);
			if (!target.length) {
				return;
			}

			e.preventDefault();

			if (useInvitationScroller) {
				var scrollTop = target.offset().top - invitationScroller.offset().top + invitationScroller.scrollTop();
				invitationScroller.animate({ scrollTop: scrollTop }, 700, 'easeInOutExpo');
				return;
			}

			$('html, body').animate({
				scrollTop: target.offset().top
			}, 700, 'easeInOutExpo');
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
			var originalLabel = button.text();
			var fallbackInput = $('<input>');

			$('body').append(fallbackInput);
			fallbackInput.val(text).select();
			document.execCommand('copy');
			fallbackInput.remove();

			button.text('Tersalin');
			setTimeout(function() {
				button.text(originalLabel);
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
		invitationBackLink();
		invitationGate();

		if ($('#cover').length) {
			initCoverEffects();
		}

		personalizedGuest();
		musicToggle();
		resumeMusicAfterCover();
		startMusicOnFirstInteraction();
		weddingCountdown();
		smoothScroll();
		staticForms();
		copyGiftNumber();

		if ($('#invitation-content').length) {
			initInvitationEffects();
		}
	});


}());
