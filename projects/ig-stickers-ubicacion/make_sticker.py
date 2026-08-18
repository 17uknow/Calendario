import io
import math
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.path import Path
import matplotlib.patches as patches

FONT_DIR = r"C:\Users\Xavi\AppData\Local\Microsoft\Windows\Fonts"
FONTS = {
    "bold": FONT_DIR + r"\SFPRODISPLAYBOLD.OTF",
    "regular": FONT_DIR + r"\SFPRODISPLAYREGULAR.OTF",
}

SCALE = 4  # supersample factor for crisp antialiasing


def rounded_rect_mask(size, radius):
    w, h = size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    return mask


def vertical_gradient(size, top_val, bottom_val):
    w, h = size
    col = np.linspace(top_val, bottom_val, h).astype(np.uint8)
    arr = np.tile(col.reshape(h, 1), (1, w))
    return Image.fromarray(arr, mode="L")


def make_pin(target_width):
    # outline map-pin glyph (rounded head + tail tangent to it + inner ring),
    # matching the reference location icon: a true stroked path, not a filled
    # silhouette, rendered via matplotlib so the head/tail seam is seamless.
    Rc = 0.30
    theta = math.radians(58)
    D = Rc / math.cos(theta)
    apex = (0, D)

    start_a = 90 + math.degrees(theta)
    end_a = 90 - math.degrees(theta) + 360
    angles = np.linspace(start_a, end_a, 200)
    arc_pts = [(Rc * math.cos(math.radians(a)), Rc * math.sin(math.radians(a))) for a in angles]
    pts = [apex] + arc_pts + [apex]

    dpi = 200
    fig = plt.figure(figsize=(4, 4), dpi=dpi)
    fig.patch.set_alpha(0)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(-1, 1)
    ax.set_ylim(-1.3, 0.9)
    ax.axis("off")
    ax.invert_yaxis()

    path = Path(pts)
    patch = patches.PathPatch(
        path, facecolor="none", edgecolor="white", linewidth=9,
        joinstyle="round", capstyle="round",
    )
    ax.add_patch(patch)
    ring = patches.Circle((0, -Rc * 0.05), Rc * 0.36, facecolor="none", edgecolor="white", linewidth=7.5)
    ax.add_patch(ring)

    buf = io.BytesIO()
    plt.savefig(buf, transparent=True, format="png")
    plt.close(fig)
    buf.seek(0)
    img = Image.open(buf).convert("RGBA")

    bbox = img.getbbox()
    img = img.crop(bbox)
    scale = target_width / img.width
    img = img.resize((target_width, max(1, int(img.height * scale))), Image.LANCZOS)
    return img


def draw_tracked_text(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return x


def measure_tracked_text(text, font, tracking):
    total = sum(font.getlength(ch) + tracking for ch in text)
    return total - tracking


def build_front_layers(city_text, base_height, weight, glass="flat", margin_factor=0.6):
    """Builds the flat glass capsule + pin + text (no shadow yet), plus a
    capsule-only mask, so callers can add a flat shadow or a 3D extrusion."""
    h = base_height * SCALE
    radius = h / 2
    icon_d = h * 0.46
    pad_left = h * 0.20
    gap = h * 0.16
    pad_right = h * 0.30
    font_size = int(h * 0.40)
    tracking = h * 0.008

    font = ImageFont.truetype(FONTS[weight], font_size)
    text_w = measure_tracked_text(city_text, font, tracking)

    pill_w = int(pad_left + icon_d + gap + text_w + pad_right)
    pill_h = int(h)

    margin = int(pill_h * margin_factor)  # room for shadow / extrusion / perspective
    canvas_w = pill_w + margin * 2
    canvas_h = pill_h + margin * 2

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    # capsule-only mask, on the full canvas, for shadow/extrusion use
    capsule_mask = Image.new("L", (canvas_w, canvas_h), 0)
    capsule_mask.paste(rounded_rect_mask((pill_w, pill_h), int(radius)), (margin, margin))

    mask = rounded_rect_mask((pill_w, pill_h), int(radius))
    zero_l = Image.new("L", (pill_w, pill_h), 0)

    if glass == "lens":
        # much more transparent body, like a real glass lens/disc
        grad_a = vertical_gradient((pill_w, pill_h), 55, 22)
        base_fill = Image.new("RGBA", (pill_w, pill_h), (225, 240, 255, 255))
        base_fill.putalpha(Image.composite(grad_a, zero_l, mask))
        canvas.alpha_composite(base_fill, (margin, margin))

        # inner dark rim: the thick glass edge bends/absorbs light just inside the border
        inset = max(3, int(pill_h * 0.06))
        inner_mask = Image.new("L", (pill_w, pill_h), 0)
        inner_mask.paste(
            rounded_rect_mask((pill_w - 2 * inset, pill_h - 2 * inset), max(1, int(radius - inset))),
            (inset, inset),
        )
        ring_arr = np.clip(np.array(mask, dtype=np.int16) - np.array(inner_mask, dtype=np.int16), 0, 255)
        ring_alpha = Image.fromarray(ring_arr.astype(np.uint8)).point(lambda v: int(v * 0.5))
        ring_layer = Image.new("RGBA", (pill_w, pill_h), (15, 25, 40, 255))
        ring_layer.putalpha(ring_alpha)
        ring_layer = ring_layer.filter(ImageFilter.GaussianBlur(pill_h * 0.025))
        canvas.alpha_composite(ring_layer, (margin, margin))

        # bright refraction crescent along the bottom (like light bending through the lens)
        bottom_hl = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
        bhd = ImageDraw.Draw(bottom_hl)
        bhd.ellipse([pill_w * 0.08, pill_h * 0.50, pill_w * 0.92, pill_h * 1.65], fill=(255, 255, 255, 150))
        bottom_hl = bottom_hl.filter(ImageFilter.GaussianBlur(pill_h * 0.07))
        bottom_hl.putalpha(Image.composite(bottom_hl.split()[3], zero_l, mask))
        canvas.alpha_composite(bottom_hl, (margin, margin))

        # soft top sheen
        top_hl = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
        thd = ImageDraw.Draw(top_hl)
        thd.ellipse([pill_w * 0.06, -pill_h * 0.75, pill_w * 0.60, pill_h * 0.30], fill=(255, 255, 255, 95))
        top_hl = top_hl.filter(ImageFilter.GaussianBlur(pill_h * 0.09))
        top_hl.putalpha(Image.composite(top_hl.split()[3], zero_l, mask))
        canvas.alpha_composite(top_hl, (margin, margin))

        # bright rim stroke with a soft glow halo, uniform all the way around
        stroke_w = max(2, int(pill_h * 0.020))
        border_layer = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(border_layer)
        bd.rounded_rectangle(
            [stroke_w / 2, stroke_w / 2, pill_w - 1 - stroke_w / 2, pill_h - 1 - stroke_w / 2],
            radius=radius - stroke_w / 2, outline=(255, 255, 255, 235), width=stroke_w,
        )
        glow = border_layer.filter(ImageFilter.GaussianBlur(pill_h * 0.05))
        glow.putalpha(glow.split()[3].point(lambda v: int(v * 0.6)))
        canvas.alpha_composite(glow, (margin, margin))
        canvas.alpha_composite(border_layer, (margin, margin))
    else:
        # 1. glass base fill (vertical gradient, cool translucent white)
        grad_a = vertical_gradient((pill_w, pill_h), 92, 48)
        base_fill = Image.new("RGBA", (pill_w, pill_h), (235, 245, 255, 255))
        base_fill.putalpha(Image.composite(grad_a, zero_l, mask))
        canvas.alpha_composite(base_fill, (margin, margin))

        # 2. glossy top highlight
        highlight = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
        hd = ImageDraw.Draw(highlight)
        hd.ellipse(
            [pill_w * 0.04, -pill_h * 0.55, pill_w * 0.96, pill_h * 0.65],
            fill=(255, 255, 255, 130),
        )
        highlight = highlight.filter(ImageFilter.GaussianBlur(pill_h * 0.10))
        highlight.putalpha(Image.composite(highlight.split()[3], zero_l, mask))
        canvas.alpha_composite(highlight, (margin, margin))

        # 3. border stroke, brighter at top
        border_layer = Image.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(border_layer)
        stroke_w = max(2, int(pill_h * 0.012))
        bd.rounded_rectangle(
            [stroke_w / 2, stroke_w / 2, pill_w - 1 - stroke_w / 2, pill_h - 1 - stroke_w / 2],
            radius=radius - stroke_w / 2,
            outline=(255, 255, 255, 255),
            width=stroke_w,
        )
        border_alpha_grad = vertical_gradient((pill_w, pill_h), 200, 30)
        border_layer.putalpha(
            Image.composite(border_alpha_grad, zero_l, border_layer.split()[3])
        )
        canvas.alpha_composite(border_layer, (margin, margin))

    # 4. pin icon
    pin = make_pin(int(icon_d))
    pin_x = margin + int(pad_left)
    pin_y = margin + int((pill_h - pin.height) / 2)
    canvas.alpha_composite(pin, (pin_x, pin_y))

    # 5. city text with soft shadow for legibility + tracked caps
    text_x = pin_x + pin.width + int(gap)
    bbox_ref = font.getbbox("A")
    text_y = margin + (pill_h - (bbox_ref[3] - bbox_ref[1])) / 2 - bbox_ref[1]

    text_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    draw_tracked_text(td, (text_x, text_y + 3), city_text, font, (0, 0, 0, 60), tracking)
    text_layer = text_layer.filter(ImageFilter.GaussianBlur(pill_h * 0.02))
    canvas = Image.alpha_composite(canvas, text_layer)

    final_text = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    ftd = ImageDraw.Draw(final_text)
    draw_tracked_text(ftd, (text_x, text_y), city_text, font, (255, 255, 255, 255), tracking)
    canvas = Image.alpha_composite(canvas, final_text)

    return dict(
        front=canvas, capsule_mask=capsule_mask,
        canvas_w=canvas_w, canvas_h=canvas_h, margin=margin,
        pill_w=pill_w, pill_h=pill_h, radius=radius,
    )


def make_sticker(city_text, out_path, base_height=220, weight="bold"):
    L = build_front_layers(city_text, base_height, weight)
    canvas_w, canvas_h, margin = L["canvas_w"], L["canvas_h"], L["margin"]
    pill_w, pill_h, radius = L["pill_w"], L["pill_h"], L["radius"]

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))

    shadow_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    shadow_offset = int(pill_h * 0.07)
    sd.rounded_rectangle(
        [margin, margin + shadow_offset, margin + pill_w, margin + shadow_offset + pill_h],
        radius=radius,
        fill=(0, 0, 0, 90),
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(pill_h * 0.12))
    canvas = Image.alpha_composite(canvas, shadow_layer)
    canvas = Image.alpha_composite(canvas, L["front"])

    bbox = canvas.getbbox()
    pad = int(pill_h * 0.10)
    bbox = (
        max(0, bbox[0] - pad), max(0, bbox[1] - pad),
        min(canvas_w, bbox[2] + pad), min(canvas_h, bbox[3] + pad),
    )
    canvas = canvas.crop(bbox)

    out_w = canvas.width // SCALE
    out_h = canvas.height // SCALE
    final = canvas.resize((out_w, out_h), Image.LANCZOS)
    final.save(out_path)
    print(f"Saved {out_path} -> {final.size}")


def pil_to_cv(img):
    return np.array(img)


def cv_to_pil(arr):
    return Image.fromarray(arr)


def warp_rgba(img, M, size):
    arr = pil_to_cv(img)
    warped = cv2.warpPerspective(
        arr, M, size, flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0),
    )
    return cv_to_pil(warped)


def make_sticker_3d(city_text, out_path, base_height=220, weight="regular", low_angle=0.30):
    """Glass-lens capsule shown in a pure low-angle (contrapicado) view — no
    rotation, and nothing extends past the capsule's own silhouette (no band,
    no shadow underneath). All the volume is an inner bevel: a bright
    highlight hugging the inside of the top edge and a darker shaded inset
    hugging the inside of the bottom edge, like the embossed-glass reference."""
    L = build_front_layers(city_text, base_height, weight, glass="lens", margin_factor=0.9)
    front, capsule_mask = L["front"], L["capsule_mask"]
    canvas_w, canvas_h = L["canvas_w"], L["canvas_h"]
    pill_h = L["pill_h"]

    src = np.float32([[0, 0], [canvas_w, 0], [canvas_w, canvas_h], [0, canvas_h]])

    # low-angle keystone only: top edge pulled inward/up (farther from camera),
    # bottom edge stays full-width and closer to camera.
    top_in = canvas_w * low_angle * 0.5
    dst = np.float32([
        [top_in, canvas_h * low_angle * 0.35],
        [canvas_w - top_in, canvas_h * low_angle * 0.35],
        [canvas_w, canvas_h],
        [0, canvas_h],
    ])

    M = cv2.getPerspectiveTransform(src, dst)
    size = (canvas_w, canvas_h)

    front_t = warp_rgba(front, M, size)
    mask_rgba = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    mask_rgba.putalpha(capsule_mask)
    mask_t = warp_rgba(mask_rgba, M, size)
    capsule_alpha_t = mask_t.split()[3]

    # inner bevel ring: the band just inside the capsule's own border
    bevel_w = max(3, int(pill_h * 0.10))
    inset_alpha = capsule_alpha_t.filter(ImageFilter.MinFilter(bevel_w * 2 + 1))
    ring_arr = np.clip(np.array(capsule_alpha_t, dtype=np.int16) - np.array(inset_alpha, dtype=np.int16), 0, 255)
    ring = Image.fromarray(ring_arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(pill_h * 0.02))
    ring_np = np.array(ring, dtype=np.float32) / 255.0

    ys = np.linspace(0, 1, canvas_h).reshape(-1, 1)
    top_w = np.clip(1 - ys * 2.2, 0, 1) ** 1.5   # strongest at the very top
    bot_w = np.clip((ys - 0.45) * 2.2, 0, 1) ** 1.5  # strongest at the very bottom

    highlight_arr = (ring_np * top_w * 235).astype(np.uint8)
    shade_arr = (ring_np * bot_w * 130).astype(np.uint8)

    out_canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    highlight_layer = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    highlight_layer.putalpha(Image.fromarray(highlight_arr))
    out_canvas.alpha_composite(highlight_layer)

    shade_layer = Image.new("RGBA", (canvas_w, canvas_h), (8, 16, 28, 255))
    shade_layer.putalpha(Image.fromarray(shade_arr))
    out_canvas.alpha_composite(shade_layer)

    # front glass face on top
    out_canvas = Image.alpha_composite(out_canvas, front_t)

    bbox = out_canvas.getbbox()
    pad = int(pill_h * 0.08)
    bbox = (
        max(0, bbox[0] - pad), max(0, bbox[1] - pad),
        min(canvas_w, bbox[2] + pad), min(canvas_h, bbox[3] + pad),
    )
    out_canvas = out_canvas.crop(bbox)

    out_w = out_canvas.width // SCALE
    out_h = out_canvas.height // SCALE
    final = out_canvas.resize((out_w, out_h), Image.LANCZOS)
    final.save(out_path)
    print(f"Saved {out_path} -> {final.size}")


if __name__ == "__main__":
    out = r"C:\Users\Xavi\Documents\Claude Chavo\projects\ig-stickers-ubicacion"
    make_sticker("Madrid", f"{out}\\madrid.png", weight="regular")
    make_sticker("A Coruña", f"{out}\\acoruna.png", weight="regular")
    make_sticker_3d("A Coruña", f"{out}\\acoruna_3d.png", weight="regular")
