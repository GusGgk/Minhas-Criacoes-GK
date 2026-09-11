# O retrato da home

Os dois arquivos em `public/media/retrato/` saem destes três passos, a partir
das duas fotos originais (que não ficam no repositório):

```bash
python -m venv .venv && .venv/Scripts/pip install "rembg[cpu]" pillow numpy
python scripts/portrait/cutout.py  foto-agora.jpg foto-crianca.jpg tmp/
python scripts/portrait/defringe.py foto-agora.jpg   tmp/agora.png   tmp/agora-clean.png
python scripts/portrait/defringe.py foto-crianca.jpg tmp/crianca.png tmp/crianca-clean.png
python scripts/portrait/compose.py tmp/ public/media/retrato/
```

- `cutout.py` separa a pessoa do fundo (rembg, modelo isnet).
- `defringe.py` tira a cor do fundo dos pixels de borda — sem isso o cabelo
  fica com um halo cinza sobre o fundo escuro do site.
- `compose.py` põe as duas num mesmo canvas 4:5, escalando a criança para os
  olhos dela caírem exatamente sobre os olhos de agora. As coordenadas das
  pupilas estão no topo do arquivo; trocando as fotos, meça de novo.

O `PortraitReveal` só empilha os dois arquivos e move a máscara.
