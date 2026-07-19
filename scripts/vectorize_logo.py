from pathlib import Path

import numpy as np
from PIL import Image
from skimage import measure, morphology


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "imagenes/Logos/logo-animation.png"
OUTPUT = ROOT / "imagenes/Logos/logo-vector.svg"


def contour_path(mask: np.ndarray, tolerance: float = 1.15) -> str:
    padded = np.pad(mask.astype(float), 1)
    paths = []

    for contour in measure.find_contours(padded, 0.5, fully_connected="high"):
        contour = measure.approximate_polygon(contour, tolerance=tolerance)
        if len(contour) < 4:
            continue

        points = [(float(column - 1), float(row - 1)) for row, column in contour]
        command = [f"M{points[0][0]:.1f} {points[0][1]:.1f}"]
        command.extend(f"L{x:.1f} {y:.1f}" for x, y in points[1:])
        command.append("Z")
        paths.append("".join(command))

    return "".join(paths)


image = np.asarray(Image.open(SOURCE).convert("RGBA"))
rgb = image[:, :, :3].astype(float)
alpha = image[:, :, 3]
height, width = alpha.shape

visible = alpha > 42
blue = visible & (rgb[:, :, 2] > rgb[:, :, 0] * 1.22) & (rgb[:, :, 1] > rgb[:, :, 0] * 1.32)
gray = visible & ~blue

# Remove isolated antialiasing noise while preserving the thin signature strokes.
blue = morphology.remove_small_objects(blue, max_size=3)
gray = morphology.remove_small_objects(gray, max_size=3)

rows = np.arange(height)[:, None]
regions = {
    "symbol-blue": blue & (rows < 425),
    "symbol-gray": gray & (rows < 425),
    "signature": blue & (rows >= 360) & (rows < 575),
    "specialty": gray & (rows >= 535),
}

colors = {
    "symbol-blue": "#146891",
    "symbol-gray": "#84969d",
    "signature": "#146891",
    "specialty": "#84969d",
}

parts = []
for name, mask in regions.items():
    path = contour_path(mask)
    parts.append(
        f'    <path id="{name}" pathLength="1" fill="{colors[name]}" '
        f'fill-rule="evenodd" d="{path}"/>'
    )

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">\n'
    "  <defs>\n"
    + "\n".join(parts)
    + "\n  </defs>\n"
    + '  <use href="#symbol-blue"/>\n'
    + '  <use href="#symbol-gray"/>\n'
    + '  <use href="#signature"/>\n'
    + '  <use href="#specialty"/>\n'
    + "</svg>\n"
)

OUTPUT.write_text(svg, encoding="utf-8")
print(f"Created {OUTPUT} ({OUTPUT.stat().st_size / 1024:.1f} KB)")
