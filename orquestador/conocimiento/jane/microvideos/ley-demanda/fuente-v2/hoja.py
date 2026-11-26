import sys, glob
from PIL import Image, ImageDraw
d = sys.argv[1]; fs = sorted(glob.glob(d + "/t*.png")); n = len(fs); cols = int(sys.argv[2]) if len(sys.argv) > 2 else 6
im0 = Image.open(fs[0]); w, h = im0.size; rows = (n + cols - 1) // cols
hoja = Image.new("RGB", (cols * w, rows * h), "black"); dr = ImageDraw.Draw(hoja)
for i, f in enumerate(fs):
    x, y = (i % cols) * w, (i // cols) * h; hoja.paste(Image.open(f).convert("RGB"), (x, y))
    dr.rectangle([x, y, x + 70, y + 18], fill="black"); dr.text((x + 3, y + 3), f.split("/t")[-1][:-4], fill="yellow")
hoja.save(d + "/hoja.jpg", quality=85); print(hoja.size)
