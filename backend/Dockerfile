FROM python:3.12-slim

# System dependency: the Tesseract OCR engine (pytesseract only wraps it)
RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install CPU-only PyTorch first (the default Linux build bundles ~2 GB of CUDA libraries we can't use)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Dependencies before code, so Docker caches this slow layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code last, because it changes most often
COPY app ./app

# Where downloaded Hugging Face models are cached (a Kubernetes volume will mount here later)
ENV HF_HOME=/models/hf

EXPOSE 8000

# 0.0.0.0 means "accept connections from outside the container"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
