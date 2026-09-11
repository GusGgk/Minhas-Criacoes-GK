"""
Step 3 of 3. Puts both cutouts on one canvas so the site can stack them 1:1.

The child is scaled and moved so both pupils land on the adult's pupils; the
canvas is then a 4:5 portrait crop around the adult's face. The child's own
image borders are feathered, otherwise the reveal shows a hard straight edge
where the kid's photo ends and the hoodie continues.
"""
import sys
import numpy as np
from PIL import Image

SP = sys.argv[1]   # folder holding agora-clean.png and crianca-clean.png
OUT = sys.argv[2]  # public/media/retrato

ADULT_EYES = ((905, 690), (1205, 690))
CHILD_EYES = ((343, 368), (522, 366))

# canvas in adult coordinates: 4:5, tight enough that the child covers it
CANVAS = (350, 0, 1710, 1700)   # x0, y0, x1, y1  -> 1360 x 1700
FINAL_W = 1200                 # delivered size; height follows the 4:5
FEATHER = 70                   # px, in child-scaled space

adult = Image.open(f'{SP}/agora-clean.png').convert('RGBA')
child = Image.open(f'{SP}/crianca-clean.png').convert('RGBA')

def mid(a, b): return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
def dist(a, b): return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5

scale = dist(*ADULT_EYES) / dist(*CHILD_EYES)
a_mid, c_mid = mid(*ADULT_EYES), mid(*CHILD_EYES)

# child scaled, then placed so its eye midpoint sits on the adult's
cw, ch = round(child.width * scale), round(child.height * scale)
child_big = child.resize((cw, ch), Image.LANCZOS)
ox = a_mid[0] - c_mid[0] * scale
oy = a_mid[1] - c_mid[1] * scale

# feather the child's own borders (left, right, bottom; the top is hair on air)
alpha = np.asarray(child_big.split()[3], dtype=np.float64) / 255
ys, xs = np.mgrid[0:ch, 0:cw]
edge = np.minimum.reduce([xs, cw - 1 - xs, ch - 1 - ys]) / FEATHER
alpha *= np.clip(edge, 0, 1)
child_big.putalpha(Image.fromarray((alpha * 255).round().astype(np.uint8)))

x0, y0, x1, y1 = CANVAS
W, H = x1 - x0, y1 - y0
canvas_child = Image.new('RGBA', (W, H), (0, 0, 0, 0))
canvas_child.alpha_composite(child_big, (round(ox - x0), round(oy - y0)))
canvas_adult = adult.crop(CANVAS)

final_h = round(FINAL_W * H / W)
for name, im in (('agora', canvas_adult), ('crianca', canvas_child)):
    small = im.resize((FINAL_W, final_h), Image.LANCZOS)
    small.save(f'{OUT}/{name}.webp', 'WEBP', quality=88, method=6)
    small.save(f'{SP}/{name}-final.png')

# previews: adult alone, child alone, both at 50%, and a fake reveal circle
def over_dark(im):
    bg = Image.new('RGBA', im.size, (8, 9, 8, 255)); bg.alpha_composite(im); return bg
sheet = Image.new('RGB', (W * 4 // 3, H // 3), (8, 9, 8))
thumb = lambda im: over_dark(im).convert('RGB').resize((W // 3, H // 3), Image.LANCZOS)
sheet.paste(thumb(canvas_adult), (0, 0))
sheet.paste(thumb(canvas_child), (W // 3, 0))
half = canvas_child.copy(); half.putalpha(half.split()[3].point(lambda v: v // 2))
both = over_dark(canvas_adult); both.alpha_composite(half)
sheet.paste(both.convert('RGB').resize((W // 3, H // 3), Image.LANCZOS), (2 * W // 3, 0))
# simulated reveal: circle around the right eye
mask = Image.new('L', (W, H), 0)
from PIL import ImageDraw, ImageFilter
ImageDraw.Draw(mask).ellipse((a_mid[0] - x0 - 260 + 150, a_mid[1] - y0 - 260, a_mid[0] - x0 + 260 + 150, a_mid[1] - y0 + 260), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(40))
reveal = over_dark(canvas_adult)
kid = canvas_child.copy(); kid.putalpha(Image.fromarray((np.asarray(kid.split()[3]) * (np.asarray(mask) / 255)).astype(np.uint8)))
reveal.alpha_composite(kid)
sheet.paste(reveal.convert('RGB').resize((W // 3, H // 3), Image.LANCZOS), (W, 0))
sheet.save(f'{SP}/sheet.jpg', quality=90)

print(f'escala {scale:.3f} | canvas {W}x{H} -> entregue {FINAL_W}x{final_h} | crianca em ({ox - x0:.0f}, {oy - y0:.0f}) tamanho {cw}x{ch}')
