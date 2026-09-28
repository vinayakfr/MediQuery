from pathlib import Path

from PIL import Image

from app.ml.huggingface import HuggingFaceProvider
from app.ml.registry import X_RAY_MODEL


IMAGE_PATH = Path("sample_data/chest_xray.jpg")


provider = HuggingFaceProvider()

image = Image.open(IMAGE_PATH)

result = provider.classify(
    image,
    X_RAY_MODEL,
)

print(result)