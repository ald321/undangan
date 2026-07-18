#!/usr/bin/env python3
"""Generate thin /tamu/{uuid}/index.html Open Graph share pages (option B).

Share URL (WhatsApp preview):  {baseUrl}/tamu/{uuid}/
Invite / open URL (cover):     {baseUrl}/?to={uuid}

Each guest page is OG meta only + redirect to the shared cover at /?to=.
Humans land on index.html; crawlers read personalized og:title/description here.
"""

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
# UUID and legacy short codes (letters, digits, underscore, hyphen, dot).
CODE_PATTERN = re.compile(r"^[A-Za-z0-9._-]+$")


def escape_html(value: str) -> str:
	return (
		str(value)
		.replace("&", "&amp;")
		.replace("<", "&lt;")
		.replace(">", "&gt;")
		.replace('"', "&quot;")
		.replace("'", "&#39;")
	)


def escape_js(value: str) -> str:
	return (
		str(value)
		.replace("\\", "\\\\")
		.replace("'", "\\'")
		.replace("\n", "\\n")
		.replace("\r", "\\r")
	)


def build_page(guest: dict, config: dict) -> str:
	code = str(guest.get("code") or "").strip()
	name = str(guest.get("name") or "Tamu Undangan").strip()
	base = config["baseUrl"].rstrip("/")
	encoded_code = quote(code)
	page_url = f"{base}/tamu/{encoded_code}/"
	invite_url = f"{base}/?to={encoded_code}"
	og_image = f"{base}/{config['ogImage'].lstrip('/')}"
	title = f"Undangan untuk {name} — {config['coupleNames']}"
	description = f"Kepada Yth. {name}. {config['defaultDescription']}"

	safe_title = escape_html(title)
	safe_description = escape_html(description)
	safe_site_name = escape_html(config["siteName"])
	safe_couple = escape_html(config["coupleNames"])
	safe_page_url = escape_html(page_url)
	safe_invite_url = escape_html(invite_url)
	safe_og_image = escape_html(og_image)
	js_invite_url = escape_js(invite_url)

	return f"""<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>{safe_title}</title>
	<meta name="description" content="{safe_description}" />
	<meta name="author" content="{safe_couple}" />
	<meta name="robots" content="noindex" />
	<link rel="canonical" href="{safe_invite_url}" />

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

	<link rel="shortcut icon" href="../../favicon.ico">
	<meta http-equiv="refresh" content="2;url={safe_invite_url}" />
	<script>location.replace('{js_invite_url}');</script>
	<style>
		body {{
			margin: 0;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			font-family: Georgia, "Times New Roman", serif;
			background: #f7f3ee;
			color: #3a322c;
			text-align: center;
			padding: 1.5rem;
		}}
		a {{ color: #6b4f3a; }}
		p {{ margin: 0.5rem 0; line-height: 1.5; }}
	</style>
</head>
<body>
	<main>
		<p>Membuka undangan untuk <strong>{escape_html(name)}</strong>…</p>
		<p><a href="{safe_invite_url}">Lanjut ke undangan</a></p>
	</main>
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
	base = config["baseUrl"].rstrip("/")

	if tamu_root.exists():
		shutil.rmtree(tamu_root)
	tamu_root.mkdir(parents=True)

	links = []
	skipped = 0
	for guest in guests:
		code = str(guest.get("code") or "").strip()
		name = str(guest.get("name") or "").strip()
		if not code:
			skipped += 1
			continue
		if not CODE_PATTERN.fullmatch(code):
			print(f"Skip unsupported code: {code!r}")
			skipped += 1
			continue

		out_dir = tamu_root / code
		out_dir.mkdir(parents=True)
		(out_dir / "index.html").write_text(build_page(guest, config), encoding="utf-8")

		share_url = f"{base}/tamu/{quote(code)}/"
		invite_url = f"{base}/?to={quote(code)}"
		links.append({
			"code": code,
			"name": name or guest.get("name"),
			"shareUrl": share_url,
			"inviteUrl": invite_url,
		})
		print(f"Generated: {share_url}  ({name})")

	manifest = {
		"generatedAt": datetime.now(timezone.utc).isoformat(),
		"baseUrl": config["baseUrl"],
		"mode": "B-thin",
		"sharePattern": "{baseUrl}/tamu/{code}/",
		"invitePattern": "{baseUrl}/?to={code}",
		"guests": links,
	}
	(tamu_root / "share-links.json").write_text(
		json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
		encoding="utf-8",
	)
	print(f"\nDone. {len(links)} thin OG page(s) written to tamu/ (skipped {skipped})")


if __name__ == "__main__":
	main()
