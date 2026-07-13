(function(window) {
	'use strict';

	var ASSET_TIMEOUT_MS = 12000;

	var INVITATION_ASSETS = [
		'images/journey-couple-photo.png',
		'images/journey-section-bg.png',
		'images/bride.jpg',
		'images/groom.jpg',
		'images/profile-frame-joglo.png',
		'images/couple-akan-menikah.png',
		'images/gallery-1.png',
		'images/gallery-2.png',
		'images/gallery-3.png',
		'images/gallery-4.png',
		'images/gallery-5.png',
		'images/gallery-6.png',
		'images/closing-couple-photo.png',
		'images/closing-floral-bg.png',
		'music/wedding.mp3'
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
		loader.setAttribute('aria-busy', 'true');
		updateProgress(0);
	};

	var hide = function() {
		var loader = getLoader();
		if (!loader) {
			return;
		}
		loader.hidden = true;
		loader.setAttribute('aria-busy', 'false');
	};

	var updateProgress = function(percent) {
		var progress = document.querySelector('.invitation-loader__progress');
		if (progress) {
			progress.textContent = percent + '%';
		}
	};

	var preloadOne = function(url) {
		return new Promise(function(resolve) {
			var finished = false;
			var isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(url);
			var media;

			var finish = function() {
				if (finished) {
					return;
				}
				finished = true;
				resolve();
			};

			setTimeout(finish, ASSET_TIMEOUT_MS);

			if (isAudio) {
				media = new Audio();
				media.preload = 'auto';
				media.addEventListener('canplaythrough', finish, { once: true });
				media.addEventListener('error', finish, { once: true });
				media.src = url;
				media.load();
				return;
			}

			media = new Image();
			media.onload = finish;
			media.onerror = finish;
			media.src = url;
		});
	};

	var preload = function(urls, onProgress) {
		var list = (urls || INVITATION_ASSETS).map(withAssetBase);
		var loaded = 0;
		var total = list.length;

		if (!total) {
			if (onProgress) {
				onProgress(100);
			}
			return Promise.resolve();
		}

		return Promise.all(list.map(function(url) {
			return preloadOne(url).then(function() {
				loaded += 1;
				if (onProgress) {
					onProgress(Math.round((loaded / total) * 100));
				}
			});
		}));
	};

	window.NuptialPreloader = {
		assets: INVITATION_ASSETS,
		show: show,
		hide: hide,
		updateProgress: updateProgress,
		preload: preload
	};
}(window));
