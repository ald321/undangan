(function(window) {
	'use strict';

	var ASSET_TIMEOUT_MS = 8000;
	var CRITICAL_TIMEOUT_MS = 10000;

	// First screen only — used when opening invitation from cover.
	var OPEN_ASSETS = [
		'images/journey-couple-photo.png',
		'images/journey-section-bg.png',
		'images/journey-floral-bottom.png'
	];

	// Must be ready before invitation scroll animations start.
	var CRITICAL_ASSETS = [
		'images/journey-couple-photo.png',
		'images/journey-section-bg.png',
		'images/journey-floral-bottom.png'
	];

	// Loaded in the background after invitation is interactive.
	var DEFERRED_ASSETS = [
		'images/profile-dewi.png',
		'images/profile-aldi.png',
		'images/profile-blossom.png',
		'images/profile-joglo-floral.png',
		'images/couple-akan-menikah.png',
		'images/gallery-1.png',
		'images/gallery-2.png',
		'images/gallery-3.png',
		'images/gallery-4.png',
		'images/gallery-5.png',
		'images/gallery-6.png',
		'images/closing-thankyou.png',
		'images/denah-omah-joglo.png',
		'images/acara-card-bg.png',
		'music/wedding.mp3'
	];

	var INVITATION_ASSETS = OPEN_ASSETS.concat(DEFERRED_ASSETS);

	var CRITICAL_IMG_SELECTORS = [
		'#invitation-content .journey-photo'
	];

	var getAssetBase = function() {
		var root = document.documentElement;
		return (root && root.getAttribute('data-asset-base')) || '';
	};

	var withAssetBase = function(url) {
		if (!url || /^(https?:)?\/\//i.test(url) || url.charAt(0) === '/') {
			return url;
		}
		return getAssetBase() + url;
	};

	var getLoader = function() {
		return document.getElementById('invitation-loader');
	};

	var show = function() {
		var loader = getLoader();
		if (!loader) {
			return;
		}
		loader.hidden = false;
		loader.removeAttribute('hidden');
		loader.setAttribute('aria-busy', 'true');
		updateProgress(0);
	};

	var hide = function() {
		var loader = getLoader();
		if (!loader) {
			return;
		}
		loader.hidden = true;
		loader.setAttribute('hidden', '');
		loader.setAttribute('aria-busy', 'false');
	};

	var updateProgress = function(percent) {
		var progress = document.querySelector('.invitation-loader__progress');
		if (progress) {
			progress.textContent = percent + '%';
		}
	};

	var decodeImage = function(img) {
		if (img && typeof img.decode === 'function') {
			return img.decode().catch(function() {
				return undefined;
			});
		}
		return Promise.resolve();
	};

	var preloadOne = function(url, options) {
		options = options || {};
		var timeoutMs = options.timeoutMs || ASSET_TIMEOUT_MS;
		var requireSuccess = !!options.requireSuccess;

		return new Promise(function(resolve, reject) {
			var finished = false;
			var isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(url);
			var media;
			var timer;

			var finish = function(ok) {
				if (finished) {
					return;
				}
				finished = true;
				if (timer) {
					clearTimeout(timer);
				}
				if (requireSuccess && !ok) {
					reject(new Error('Failed to load ' + url));
					return;
				}
				resolve(ok);
			};

			timer = setTimeout(function() {
				finish(!requireSuccess);
			}, timeoutMs);

			if (isAudio) {
				media = new Audio();
				media.preload = 'metadata';
				media.addEventListener('loadedmetadata', function() {
					finish(true);
				}, { once: true });
				media.addEventListener('canplaythrough', function() {
					finish(true);
				}, { once: true });
				media.addEventListener('error', function() {
					finish(false);
				}, { once: true });
				media.src = url;
				media.load();
				return;
			}

			media = new Image();
			media.onload = function() {
				decodeImage(media).then(function() {
					finish(true);
				});
			};
			media.onerror = function() {
				finish(false);
			};
			media.src = url;
		});
	};

	var preload = function(urls, onProgress, options) {
		options = options || {};
		var list = (urls || OPEN_ASSETS).map(withAssetBase);
		var loaded = 0;
		var total = list.length;

		if (!total) {
			if (onProgress) {
				onProgress(100);
			}
			return Promise.resolve();
		}

		return Promise.all(list.map(function(url) {
			return preloadOne(url, options)
				.catch(function() {
					return false;
				})
				.then(function() {
					loaded += 1;
					if (onProgress) {
						onProgress(Math.round((loaded / total) * 100));
					}
				});
		}));
	};

	var scheduleIdle = function(fn, delayMs) {
		var run = function() {
			try {
				fn();
			} catch (error) {}
		};

		if (typeof window.requestIdleCallback === 'function') {
			window.requestIdleCallback(run, { timeout: delayMs || 2500 });
			return;
		}

		setTimeout(run, delayMs || 1200);
	};

	var preloadDeferred = function() {
		return preload(DEFERRED_ASSETS, null, {
			timeoutMs: ASSET_TIMEOUT_MS,
			requireSuccess: false
		});
	};

	var waitForImageElement = function(img, timeoutMs) {
		return new Promise(function(resolve) {
			var done = false;
			var finish = function() {
				if (done) {
					return;
				}
				done = true;
				resolve();
			};

			setTimeout(finish, timeoutMs || CRITICAL_TIMEOUT_MS);

			if (!img) {
				finish();
				return;
			}

			if (img.complete && img.naturalWidth > 0) {
				decodeImage(img).then(finish);
				return;
			}

			img.addEventListener('load', function() {
				decodeImage(img).then(finish);
			}, { once: true });
			img.addEventListener('error', finish, { once: true });
		});
	};

	var waitForDomImages = function(selectors, timeoutMs) {
		var list = selectors || CRITICAL_IMG_SELECTORS;
		var nodes = [];

		list.forEach(function(selector) {
			document.querySelectorAll(selector).forEach(function(node) {
				nodes.push(node);
			});
		});

		if (!nodes.length) {
			return Promise.resolve();
		}

		return Promise.all(nodes.map(function(img) {
			return waitForImageElement(img, timeoutMs);
		}));
	};

	var waitForCriticalAssets = function(onProgress) {
		var criticalUrls = CRITICAL_ASSETS.map(withAssetBase);
		var loaded = 0;
		var total = criticalUrls.length + 1;

		var tick = function() {
			loaded += 1;
			if (onProgress) {
				onProgress(Math.min(100, Math.round((loaded / total) * 100)));
			}
		};

		var preloadCritical = Promise.all(criticalUrls.map(function(url) {
			return preloadOne(url, {
				timeoutMs: CRITICAL_TIMEOUT_MS,
				requireSuccess: false
			})
				.catch(function() {
					return false;
				})
				.then(tick);
		}));

		return preloadCritical
			.then(function() {
				return waitForDomImages(CRITICAL_IMG_SELECTORS, CRITICAL_TIMEOUT_MS);
			})
			.then(function() {
				tick();
				if (onProgress) {
					onProgress(100);
				}
			});
	};

	window.NuptialPreloader = {
		assets: OPEN_ASSETS,
		openAssets: OPEN_ASSETS,
		criticalAssets: CRITICAL_ASSETS,
		deferredAssets: DEFERRED_ASSETS,
		allAssets: INVITATION_ASSETS,
		show: show,
		hide: hide,
		updateProgress: updateProgress,
		preload: preload,
		preloadDeferred: preloadDeferred,
		scheduleIdle: scheduleIdle,
		waitForDomImages: waitForDomImages,
		waitForCriticalAssets: waitForCriticalAssets
	};
}(window));
