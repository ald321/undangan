;(function (window) {
	'use strict';

	var ScrollAnimations = {
		reducedMotion: function () {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		},

		hasGSAP: function () {
			return typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
		},

		init: function () {
			if (!this.hasGSAP() || this.reducedMotion()) {
				this.fallbackReveal();
				return;
			}

			window.gsap.registerPlugin(window.ScrollTrigger);
			this.initScrollReveal();
		},

		initCoverIntro: function (onGuestReady) {
			if (!this.hasGSAP() || this.reducedMotion()) {
				return;
			}

			var cover = document.querySelector('#cover');
			if (!cover) {
				return;
			}

			var label = cover.querySelector('.cover-recipient-label');
			var guestName = cover.querySelector('#guest-name');
			var inviteText = cover.querySelector('.cover-invite-text');
			var coupleHeading = cover.querySelector('h2');
			var coverDate = cover.querySelector('.cover-date');
			var openButton = cover.querySelector('#open-invitation');
			var animateBox = cover.querySelector('.animate-box');
			var targets = [label, guestName, inviteText, coupleHeading, coverDate, openButton].filter(Boolean);

			if (animateBox) {
				window.gsap.set(animateBox, { opacity: 1, y: 0 });
			}

			window.gsap.set(targets, { opacity: 0, y: 24 });

			var tl = window.gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.45 } });

			if (label) {
				tl.to(label, { opacity: 1, y: 0 });
			}

			if (typeof onGuestReady === 'function') {
				onGuestReady(function () {
					if (guestName) {
						window.gsap.to(guestName, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
					}
				});
			} else if (guestName) {
				tl.to(guestName, { opacity: 1, y: 0 }, '-=0.05');
			}

			if (inviteText) {
				tl.to(inviteText, { opacity: 1, y: 0 }, '-=0.05');
			}
			if (coupleHeading) {
				tl.to(coupleHeading, { opacity: 1, y: 0 }, '-=0.05');
			}
			if (coverDate) {
				tl.to(coverDate, { opacity: 1, y: 0 }, '-=0.05');
			}
			if (openButton) {
				tl.to(openButton, { opacity: 1, y: 0 }, '-=0.05');
			}

			window.setTimeout(function () {
				var layers = cover.querySelectorAll('.viding-tree, .viding-lotus, .viding-rose');
				if (!layers.length) {
					return;
				}
				window.gsap.from(layers, {
					opacity: 0,
					y: 20,
					duration: 0.6,
					stagger: 0.08,
					ease: 'power2.out'
				});
			}, 1200);
		},

		getRevealElements: function () {
			return window.gsap.utils.toArray('.animate-box').filter(function (el) {
				return !el.closest('#cover');
			});
		},

		isAboveRevealLine: function (el) {
			var rect = el.getBoundingClientRect();
			var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
			return rect.top <= viewportHeight * 0.85;
		},

		revealElement: function (el) {
			window.gsap.to(el, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power2.out',
				overwrite: 'auto'
			});
		},

		initScrollReveal: function () {
			var self = this;
			var gsap = window.gsap;
			var ScrollTrigger = window.ScrollTrigger;

			self.getRevealElements().forEach(function (el) {
				gsap.set(el, { opacity: 0, y: 48 });

				if (self.isAboveRevealLine(el)) {
					self.revealElement(el);
					return;
				}

				ScrollTrigger.create({
					trigger: el,
					start: 'top 85%',
					once: true,
					onEnter: function () {
						self.revealElement(el);
					}
				});
			});

			ScrollTrigger.refresh();

			window.addEventListener('load', function () {
				self.getRevealElements().forEach(function (el) {
					if (parseFloat(gsap.getProperty(el, 'opacity')) < 1 && self.isAboveRevealLine(el)) {
						self.revealElement(el);
					}
				});
				ScrollTrigger.refresh();
			});
		},

		refresh: function () {
			if (this.hasGSAP() && window.ScrollTrigger) {
				window.ScrollTrigger.refresh();
			}
		},

		playCoverClose: function (options) {
			options = options || {};
			var onComplete = options.onComplete;
			var cover = document.querySelector('#cover');

			if (!cover) {
				if (onComplete) {
					onComplete();
				}
				return;
			}

			if (!this.hasGSAP() || this.reducedMotion()) {
				cover.classList.add('cover-closing');
				window.setTimeout(function () {
					if (onComplete) {
						onComplete();
					}
				}, 950);
				return;
			}

			var displayTc = cover.querySelector('.display-tc');
			var scene = cover.querySelector('.viding-scene');
			var tl = window.gsap.timeline({
				onComplete: function () {
					if (onComplete) {
						onComplete();
					}
				}
			});

			if (displayTc) {
				tl.to(displayTc, { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' });
			}

			tl.to(
				cover,
				{ scale: 1.06, opacity: 0, filter: 'blur(6px)', duration: 0.55, ease: 'power2.inOut' },
				displayTc ? '-=0.1' : 0
			);

			if (scene) {
				tl.to(scene, { y: 40, opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.4');
			}
		},

		playInlineOpen: function (options) {
			options = options || {};
			var cover = options.cover;
			var content = options.content;
			var onMidpoint = options.onMidpoint;
			var onComplete = options.onComplete;

			if (!cover || !cover.length) {
				if (onComplete) {
					onComplete();
				}
				return;
			}

			if (!this.hasGSAP() || this.reducedMotion()) {
				cover.addClass('cover-closing');
				content.css('opacity', 0).show().addClass('invitation-opening');
				window.setTimeout(function () {
					if (onMidpoint) {
						onMidpoint();
					}
					window.setTimeout(function () {
						if (onComplete) {
							onComplete();
						}
					}, 100);
				}, 950);
				return;
			}

			var coverEl = cover.get(0);
			var displayTc = coverEl.querySelector('.display-tc');
			var scene = coverEl.querySelector('.viding-scene');

			content.css('opacity', 0).show().addClass('invitation-opening');

			var tl = window.gsap.timeline({
				onComplete: function () {
					if (onComplete) {
						onComplete();
					}
				}
			});

			if (displayTc) {
				tl.to(displayTc, { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' });
			}

			tl.to(
				coverEl,
				{ scale: 1.06, opacity: 0, filter: 'blur(6px)', duration: 0.55, ease: 'power2.inOut' },
				displayTc ? '-=0.1' : 0
			);

			if (scene) {
				tl.to(scene, { y: 40, opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.4');
			}

			tl.add(function () {
				cover.hide();
				content.css('opacity', '').removeClass('invitation-opening');
				if (onMidpoint) {
					onMidpoint();
				}
			});
		},

		fallbackReveal: function () {
			if (typeof window.jQuery === 'undefined') {
				return;
			}

			window.jQuery('.animate-box').addClass('animated fadeInUp');
		}
	};

	window.NuptialFX = window.NuptialFX || {};
	window.NuptialFX.ScrollAnimations = ScrollAnimations;
})(window);
