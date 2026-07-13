#!/usr/bin/env python3
"""Generate /tamu/{code}/index.html with personalized Open Graph tags."""

from __future__ import annotations

import json
import re
import shutil
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_GUESTS_API_URL = (
	"https://script.google.com/macros/s/"
	"AKfycbw_fWxPo-vBfhag9EyPXDL0MrXuTZnpZsexL7mBfX2vHUgEbC16WH4jq_GxaUq6EHvcpA/exec"
)


def escape_html(value: str) -> str:
	return (
		str(value)
		.replace("&", "&amp;")
		.replace("<", "&lt;")
		.replace(">", "&gt;")
		.replace('"', "&quot;")
		.replace("'", "&#39;")
	)


def build_page(guest: dict, config: dict) -> str:
	code = str(guest.get("code") or "").strip()
	name = str(guest.get("name") or "Tamu Undangan").strip()
	base = config["baseUrl"].rstrip("/")
	page_url = f"{base}/tamu/{quote(code)}/"
	og_image = f"{base}/{config['ogImage'].lstrip('/')}"
	title = f"Undangan untuk {name} — {config['coupleNames']}"
	description = f"Kepada Yth. {name}. {config['defaultDescription']}"

	safe_name = escape_html(name)
	safe_title = escape_html(title)
	safe_description = escape_html(description)
	safe_site_name = escape_html(config["siteName"])
	safe_couple = escape_html(config["coupleNames"])
	safe_date = escape_html(config["weddingDateLabel"])
	safe_page_url = escape_html(page_url)
	safe_og_image = escape_html(og_image)
	encoded_code = quote(code)

	def asset(file: str) -> str:
		return f"../../{file}"

	return f"""<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" data-asset-base="../../"> <!--<![endif]-->
	<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>{safe_title}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="{safe_description}" />
	<meta name="keywords" content="undangan pernikahan, wedding invitation, dewi, aldi" />
	<meta name="author" content="{safe_couple}" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="{safe_title}" />
	<meta property="og:description" content="{safe_description}" />
	<meta property="og:url" content="{safe_page_url}" />
	<meta property="og:site_name" content="{safe_site_name}" />
	<meta property="og:image" content="{safe_og_image}" />
	<meta property="og:image:width" content="{escape_html(config['ogImageWidth'])}" />
	<meta property="og:image:height" content="{escape_html(config['ogImageHeight'])}" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{safe_title}" />
	<meta name="twitter:description" content="{safe_description}" />
	<meta name="twitter:image" content="{safe_og_image}" />
	<meta name="twitter:url" content="{safe_page_url}" />

	<link rel="shortcut icon" href="{asset('favicon.ico')}">
	<link href="https://fonts.googleapis.com/css?family=Montez" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700,300" rel="stylesheet" type="text/css">

	<link rel="stylesheet" href="{asset('css/animate.css')}">
	<link rel="stylesheet" href="{asset('css/icomoon.css')}">
	<link rel="stylesheet" href="{asset('css/bootstrap.css')}">
	<link rel="stylesheet" href="{asset('css/superfish.css')}">
	<link rel="stylesheet" href="{asset('css/magnific-popup.css')}">
	<link rel="stylesheet" href="{asset('css/style.css')}">

	<script src="{asset('js/modernizr-2.6.2.min.js')}"></script>
	<!--[if lt IE 9]>
	<script src="{asset('js/respond.min.js')}"></script>
	<![endif]-->
	</head>
	<body>
		<div id="fh5co-wrapper">
		<div id="fh5co-page">

		<div id="cover" class="fh5co-hero floral-cover" data-section="home">
			<div class="viding-scene" aria-hidden="true">
				<img class="viding-layer viding-texture" src="{asset('images/viding-texture.webp')}" alt="">
				<img class="viding-layer viding-tree viding-tree-left" src="{asset('images/viding-tree-1.webp')}" alt="">
				<img class="viding-layer viding-tree viding-tree-right" src="{asset('images/viding-tree-2.webp')}" alt="">
				<img class="viding-layer viding-land" src="{asset('images/viding-land.webp')}" alt="">
				<img class="viding-layer cover-joglo" src="{asset('images/omah-joglo.png')}" alt="" aria-hidden="true">
				<img class="viding-layer viding-lotus viding-lotus-left-far" src="{asset('images/viding-lotus-1.webp')}" alt="">
				<img class="viding-layer viding-lotus viding-lotus-left" src="{asset('images/viding-lotus-1.webp')}" alt="">
				<img class="viding-layer viding-lotus viding-lotus-left-inner" src="{asset('images/viding-lotus-1.webp')}" alt="">
				<img class="viding-layer viding-lotus viding-lotus-right-inner" src="{asset('images/viding-lotus-2.webp')}" alt="">
				<img class="viding-layer viding-lotus viding-lotus-right" src="{asset('images/viding-lotus-2.webp')}" alt="">
				<img class="viding-layer viding-lotus viding-lotus-right-far" src="{asset('images/viding-lotus-2.webp')}" alt="">
				<img class="viding-layer viding-rose viding-rose-left-far" src="{asset('images/viding-rose.webp')}" alt="">
				<img class="viding-layer viding-rose viding-rose-left" src="{asset('images/viding-rose.webp')}" alt="">
				<img class="viding-layer viding-rose viding-rose-center" src="{asset('images/viding-rose.webp')}" alt="">
				<img class="viding-layer viding-rose viding-rose-right" src="{asset('images/viding-rose.webp')}" alt="">
				<img class="viding-layer viding-rose viding-rose-right-far" src="{asset('images/viding-rose.webp')}" alt="">
			</div>
			<div class="falling-petals" aria-hidden="true"></div>
			<div id="petals-canvas" class="petals-layer" aria-hidden="true"></div>
			<div class="fh5co-overlay"></div>
			<div class="fh5co-cover text-center" data-stellar-background-ratio="0.5" style="background-image: url({asset('images/viding-sky.webp')});">
				<div class="display-t">
					<div class="display-tc">
						<div class="container">
							<div class="col-md-10 col-md-offset-1">
								<div class="animate-box">
									<p class="cover-recipient-label">Kepada Bapak/Ibu/Saudara/i</p>
									<h3 id="guest-name" class="cover-guest-name" data-fallback="Tamu Undangan" data-guest-name="{safe_name}">{safe_name}</h3>
									<p class="cover-invite-text">We Invite You to the Wedding of</p>
									<h2>{safe_couple}</h2>
									<p class="cover-date"><span>Sabtu, {safe_date}</span></p>
									<p><a href="{asset('invitation.html')}?guest={encoded_code}" id="open-invitation" class="btn btn-primary btn-sm">Buka Undangan</a></p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

	</div>
	</div>

	<div id="invitation-loader" class="invitation-loader" hidden aria-live="polite" aria-busy="false">
		<div class="invitation-loader__inner">
			<div class="invitation-loader__spinner" aria-hidden="true"></div>
			<p class="invitation-loader__label">Memuat undangan...</p>
			<p class="invitation-loader__progress">0%</p>
		</div>
	</div>

	<script src="{asset('js/jquery.min.js')}"></script>
	<script src="{asset('js/jquery.easing.1.3.js')}"></script>
	<script src="{asset('js/bootstrap.min.js')}"></script>
	<script src="{asset('js/jquery.waypoints.min.js')}"></script>
	<script src="{asset('js/jquery.stellar.min.js')}"></script>
	<script src="{asset('js/vendor/gsap.min.js')}"></script>
	<script src="{asset('js/vendor/ScrollTrigger.min.js')}"></script>
	<script src="{asset('js/vendor/tsparticles.bundle.min.js')}"></script>
	<script src="{asset('js/effects/scroll-animations.js')}"></script>
	<script src="{asset('js/effects/petals.js')}"></script>
	<script src="{asset('js/invitation-preloader.js')}"></script>
	<script src="{asset('js/main.js')}"></script>
	</body>
</html>
"""


def load_guests(config: dict) -> list:
	api_url = str(config.get("guestsApiUrl") or DEFAULT_GUESTS_API_URL).strip()
	if not api_url:
		raise ValueError("guestsApiUrl is missing in site-config.json")

	with urllib.request.urlopen(api_url, timeout=60) as response:
		payload = json.loads(response.read().decode("utf-8"))

	if not isinstance(payload, list):
		raise ValueError("Guests API must return a JSON array of {code, name} objects.")

	return payload


def main() -> None:
	config = json.loads((ROOT / "site-config.json").read_text(encoding="utf-8"))
	guests = load_guests(config)
	tamu_root = ROOT / "tamu"

	if tamu_root.exists():
		shutil.rmtree(tamu_root)
	tamu_root.mkdir(parents=True)

	links = []
	for guest in guests:
		code = str(guest.get("code") or "").strip()
		if not code:
			continue
		# Keep folder names filesystem-safe (codes are simple alphanumerics).
		if not re.fullmatch(r"[A-Za-z0-9_-]+", code):
			raise ValueError(f"Unsupported guest code for folder name: {code!r}")

		out_dir = tamu_root / code
		out_dir.mkdir(parents=True)
		(out_dir / "index.html").write_text(build_page(guest, config), encoding="utf-8")

		share_url = f"{config['baseUrl'].rstrip('/')}/tamu/{quote(code)}/"
		links.append({"code": code, "name": guest.get("name"), "shareUrl": share_url})
		print(f"Generated: {share_url}")

	manifest = {
		"generatedAt": datetime.now(timezone.utc).isoformat(),
		"baseUrl": config["baseUrl"],
		"guests": links,
	}
	(tamu_root / "share-links.json").write_text(
		json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
		encoding="utf-8",
	)
	print(f"\nDone. {len(links)} guest page(s) written to tamu/")


if __name__ == "__main__":
	main()
