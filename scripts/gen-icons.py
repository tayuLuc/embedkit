#!/usr/bin/env python3
"""Generate PWA icons and the OG card from the favicon concept.

Source of truth is public/favicon.svg: rounded square #0b62ff, white
iframe frame, white play triangle. Output goes to public/icons/ and
public/og.png. Re-run after changing the concept:

    python3 scripts/gen-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "public" / "icons"
BLUE = (11, 98, 255)
WHITE = (255, 255, 255)
INK = (14, 16, 20)  # --bg in dark mode


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    # index 1 in HelveticaNeue.ttc is the Bold face
    idx = 1 if bold else 0
    for cand in ("HelveticaNeue.ttc", "Helvetica.ttc"):
        p = Path("/System/Library/Fonts") / cand
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size=size, index=idx)
            except OSError:
                continue
    return ImageFont.load_default()


def icon(size: int, *, maskable: bool = False) -> Image.Image:
    """Rounded square with the iframe frame + play triangle.

    maskable=True fills the whole canvas (no transparent corners) so the
    OS can crop it; content is scaled to the 80% safe zone.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = size / 64.0  # favicon is authored on a 64x64 viewBox
    scale = 0.8 if maskable else 1.0

    # centre the mark inside the safe zone
    shift = size * (1 - scale) / 2.0

    def box(x: float, y: float, w: float, h: float) -> list[float]:
        return [shift + x * s * scale, shift + y * s * scale,
                shift + (x + w) * s * scale, shift + (y + h) * s * scale]

    if maskable:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=0, fill=BLUE)
        # blue field covering the safe zone, keeps the mark on brand blue
        d.rounded_rectangle(box(0, 0, 64, 64), radius=12 * s * scale, fill=BLUE)
    else:
        d.rounded_rectangle(box(0, 0, 64, 64), radius=14 * s, fill=BLUE)

    # iframe frame
    fx, fy, fw, fh = box(14, 20, 36, 24)
    stroke = 4 * s * scale
    d.rounded_rectangle([fx, fy, fw, fh], radius=5 * s * scale,
                        outline=WHITE, width=int(round(stroke)) or 1)

    # play triangle
    tri = [(28, 27), (38, 32), (28, 37)]
    d.polygon([(shift + x * s * scale, shift + y * s * scale) for x, y in tri],
              fill=WHITE)
    return img


def og_card() -> Image.Image:
    """1200x630 card: dark ink background, blue accent, wordmark + tagline."""
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(img)

    # accent bar on the left edge
    d.rectangle([0, 0, 12, h], fill=BLUE)

    pad = 96
    # app icon at 128, composited on the dark background
    mark = icon(128)
    img.paste(mark, (pad, pad), mark)

    title = font(112, bold=True)
    d.text((pad + 168, pad - 8), "EmbedKit", font=title, fill=WHITE)

    tag = font(46)
    d.text((pad, pad + 178), "Paste a link. Copy the embed.", font=tag,
           fill=(232, 234, 240))

    # provider strip, muted
    providers = ("YouTube, Vimeo, Twitch, Dailymotion, TikTok, "
                 "Telegram, Spotify")
    strip = font(30)
    d.text((pad, h - pad - 34), providers, font=strip, fill=(152, 162, 179))

    # blue underline separating tagline from the strip
    d.rectangle([pad, h - pad - 64, pad + 320, h - pad - 60], fill=BLUE)
    return img


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    icon(1024).save(ICONS / "icon-1024.png", optimize=True)
    icon(512).save(ICONS / "icon-512.png", optimize=True)
    icon(192).save(ICONS / "icon-192.png", optimize=True)
    icon(180).save(ICONS / "apple-touch-icon.png", optimize=True)
    # maskable variants fill the canvas so launchers can crop freely
    icon(512, maskable=True).save(ICONS / "icon-512-maskable.png", optimize=True)
    icon(192, maskable=True).save(ICONS / "icon-192-maskable.png", optimize=True)
    og_card().save(ROOT / "public" / "og.png", optimize=True)
    for p in sorted(ICONS.iterdir()) + [ROOT / "public" / "og.png"]:
        print(f"{p.relative_to(ROOT)} {p.stat().st_size} bytes")


if __name__ == "__main__":
    main()
