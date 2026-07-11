;(function (window) {
	'use strict';

	var MOBILE_BREAKPOINT = 768;
	var INIT_DELAY_MS = 300;

	var PRESETS = {
		cover: {
			number: 18,
			speed: 1.2,
			opacityMin: 0.35,
			opacityMax: 0.65,
			sizeMin: 6,
			sizeMax: 14
		},
		invitation: {
			number: 12,
			speed: 0.8,
			opacityMin: 0.25,
			opacityMax: 0.5,
			sizeMin: 5,
			sizeMax: 12
		}
	};

	var Petals = {
		instances: {},

		reducedMotion: function () {
			return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		},

		hasEngine: function () {
			return typeof window.tsParticles !== 'undefined' && typeof window.tsParticles.load === 'function';
		},

		resolvePreset: function (mode) {
			var preset = PRESETS[mode] || PRESETS.cover;
			var count = preset.number;

			if (window.innerWidth < MOBILE_BREAKPOINT) {
				count = Math.max(4, Math.round(count * 0.6));
			}

			return {
				count: count,
				speed: preset.speed,
				opacityMin: preset.opacityMin,
				opacityMax: preset.opacityMax,
				sizeMin: preset.sizeMin,
				sizeMax: preset.sizeMax
			};
		},

		buildOptions: function (preset) {
			return {
				fullScreen: { enable: false },
				background: { color: { value: 'transparent' } },
				fpsLimit: 60,
				detectRetina: true,
				particles: {
					number: { value: preset.count },
					shape: {
						type: 'image',
						options: {
							image: {
								src: 'images/petal.png',
								width: 32,
								height: 32
							}
						}
					},
					opacity: {
						value: { min: preset.opacityMin, max: preset.opacityMax }
					},
					size: {
						value: { min: preset.sizeMin, max: preset.sizeMax }
					},
					rotate: {
						value: { min: 0, max: 360 },
						animation: { enable: true, speed: 8, sync: false }
					},
					move: {
						enable: true,
						speed: preset.speed,
						direction: 'bottom',
						random: true,
						straight: false,
						outModes: { default: 'out' }
					}
				}
			};
		},

		markActive: function () {
			document.documentElement.classList.add('js-petals-active');
		},

		init: function (selector, mode) {
			var self = this;
			mode = mode || 'cover';

			if (self.reducedMotion() || !self.hasEngine()) {
				return Promise.resolve(null);
			}

			var container = typeof selector === 'string' ? document.querySelector(selector) : selector;
			if (!container || self.instances[container.id]) {
				return Promise.resolve(null);
			}

			var runInit = function () {
				var preset = self.resolvePreset(mode);
				return window.tsParticles
					.load({
						id: container.id,
						element: container,
						options: self.buildOptions(preset)
					})
					.then(function (instance) {
						self.instances[container.id] = instance;
						self.markActive();
						return instance;
					})
					.catch(function () {
						return null;
					});
			};

			if ('requestIdleCallback' in window) {
				return new Promise(function (resolve) {
					window.requestIdleCallback(
						function () {
							window.setTimeout(function () {
								resolve(runInit());
							}, INIT_DELAY_MS);
						},
						{ timeout: 1200 }
					);
				});
			}

			return new Promise(function (resolve) {
				window.setTimeout(function () {
					resolve(runInit());
				}, INIT_DELAY_MS);
			});
		},

		destroy: function (selector) {
			var container = typeof selector === 'string' ? document.querySelector(selector) : selector;
			if (!container || !this.instances[container.id]) {
				return;
			}

			this.instances[container.id].destroy();
			delete this.instances[container.id];
		}
	};

	window.NuptialFX = window.NuptialFX || {};
	window.NuptialFX.Petals = Petals;
})(window);
