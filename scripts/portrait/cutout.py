"""
Step 1 of 3: lifts the person off the background.

    python cutout.py <foto-agora.jpg> <foto-crianca.jpg> <pasta-de-saida>

Writes agora.png and crianca.png with a soft alpha. Needs rembg — see
README.md in this folder. The mask is left soft on purpose (no
post_process_mask): defringe.py needs the partial-alpha edge to unmix the
background out of the hair.
"""
import sys
import time
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

now, kid, out = sys.argv[1:4]
out = Path(out)
out.mkdir(parents=True, exist_ok=True)

session = new_session('isnet-general-use')
for source, tag in ((now, 'agora'), (kid, 'crianca')):
    started = time.time()
    image = Image.open(source).convert('RGB')
    cut = remove(image, session=session, post_process_mask=False)
    cut.save(out / f'{tag}.png')
    print(f'{tag}: {cut.size} em {time.time() - started:.1f}s')
