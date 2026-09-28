from pathlib import Path

from app.imaging.detect import detect_kind
from app.imaging.loaders import load_medical_file


SAMPLE_DIR = Path("sample_data")
OUTPUT_DIR = Path("sample_previews")

OUTPUT_DIR.mkdir(exist_ok=True)


for path in SAMPLE_DIR.iterdir():

    if not path.is_file():
        continue

    try:
        kind = detect_kind(path)

        print(f"{path.name} -> {kind}")

        if kind != "prescription":
            image = load_medical_file(path, kind)

            output_path = OUTPUT_DIR / f"{path.stem}_preview.png"

            image.save(output_path)

            print(f"  Preview: {output_path}")

        else:
            print("  PDF detected; no image preview generated.")

    except Exception as e:
        print(f"{path.name} -> ERROR: {e}")