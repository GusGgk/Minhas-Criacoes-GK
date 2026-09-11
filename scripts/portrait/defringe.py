"""
Step 2 of 3: unmixes the background out of the edge pixels. The segmenter gets the alpha
roughly right, but every semi-transparent pixel still carries the studio
grey: C = a*F + (1-a)*B. Knowing B from the nearby fully-transparent pixels,
solve for F and the halo disappears while the hair strands stay.
"""
import sys
import numpy as np
from PIL import Image

# python defringe.py <foto-original> <recorte-do-cutout.png> <saida.png>
src_path, cut_path, out_path = sys.argv[1:4]
orig = np.asarray(Image.open(src_path).convert('RGB'), dtype=np.float64)
cut = np.asarray(Image.open(cut_path).convert('RGBA'), dtype=np.float64)
alpha = cut[..., 3] / 255.0
# The model tops out at 254, which would leave the whole body 0.4% see-through.
alpha = np.where(alpha >= 0.98, 1.0, alpha)
h, w = alpha.shape

def box_mean(values, mask, radius):
    """Mean of `values` over `mask` in a (2r+1)^2 window, via integral images."""
    v = values * mask[..., None]
    m = mask.astype(np.float64)
    def integral(a):
        s = np.cumsum(np.cumsum(a, axis=0), axis=1)
        return np.pad(s, ((1, 0), (1, 0)) + ((0, 0),) * (a.ndim - 2))
    def window_sum(s):
        ys = np.clip(np.arange(h) + radius + 1, 0, h); ys0 = np.clip(np.arange(h) - radius, 0, h)
        xs = np.clip(np.arange(w) + radius + 1, 0, w); xs0 = np.clip(np.arange(w) - radius, 0, w)
        return s[ys][:, xs] - s[ys0][:, xs] - s[ys][:, xs0] + s[ys0][:, xs0]
    sv = window_sum(integral(v))
    sm = window_sum(integral(m))
    return sv, sm

bg_mask = alpha < 0.02
sum_bg, cnt_bg = box_mean(orig, bg_mask, 40)
global_bg = orig[bg_mask].mean(axis=0) if bg_mask.any() else np.array([128.0, 128.0, 128.0])
with np.errstate(invalid='ignore', divide='ignore'):
    local_bg = np.where(cnt_bg[..., None] > 0, sum_bg / np.maximum(cnt_bg, 1)[..., None], global_bg)

edge = (alpha >= 0.02) & (alpha < 0.995)
a = alpha[..., None]
unmixed = (orig - (1 - a) * local_bg) / np.maximum(a, 1e-3)
rgb = np.where(edge[..., None], np.clip(unmixed, 0, 255), orig)

# The segmenter leaves a faint 1px lip of near-zero alpha around the whole
# silhouette; pulling the curve in slightly tightens it without eating hair.
alpha_out = np.clip((alpha - 0.04) / 0.96, 0, 1)

out = np.dstack([rgb, alpha_out * 255]).round().astype(np.uint8)
Image.fromarray(out, 'RGBA').save(out_path)
print(f'{out_path}: {int(edge.sum())} pixels de borda corrigidos, fundo local ~{global_bg.round().astype(int).tolist()}')
