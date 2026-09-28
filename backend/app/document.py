"""
Document agent helpers: prescription (PDF or photo) → list of Medication.

Pipeline:
  1. Get text: the PDF text layer if it has one, otherwise OCR at 300 DPI.
     Printed documents use Tesseract (much better than EasyOCR on printed
     tables); EasyOCR is the fallback, e.g. when Tesseract isn't installed.
  2. Rules first: parse medicine rows (TAB./CAP./SYP. … + dosing + "10 Days").
     Works on noisy OCR and on names an NER model has never seen.
  3. Only if the rules find nothing (free-text prescriptions): ask the LLM,
     and keep only names that actually appear in the document text.
  4. Mark a row "Please check" when its OCR confidence is low or it looks garbled.
"""

import json
import re
from pathlib import Path

import pdfplumber
from PIL import Image, ImageOps

from .ml.huggingface import HuggingFaceProvider
from .ml.registry import MEDICINE_NER_MODEL
from .prescription_parser import appears_in_text, parse_rows
from .schemas import Medication

# NOTE: if another module also creates HuggingFaceProvider(), models load twice
# and /health can report 0. Prefer one shared instance (e.g. get_provider()).
provider = HuggingFaceProvider()

OCR_DPI = 300                # 150 DPI is too low for small table text
MIN_TEXT_LAYER_CHARS = 20    # less than this = scanned PDF, use OCR
LOW_CONFIDENCE = 0.6


# --------------------------------------------------
# TEXT / OCR EXTRACTION
# --------------------------------------------------

def extract_pdf_text(path: Path) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()


def prepare_for_ocr(image: Image.Image) -> Image.Image:
    """Grayscale, stretch contrast and upscale small scans. Big win for OCR accuracy."""
    image = ImageOps.autocontrast(ImageOps.grayscale(image))
    if image.width < 2000:
        scale = 2000 / image.width
        image = image.resize((2000, int(image.height * scale)), Image.LANCZOS)
    return image.convert("RGB")


def merge_boxes_into_rows(lines: list[dict]) -> list[dict]:
    """
    EasyOCR returns one box per text chunk, so a table row ("TAB. X", "1 Morning",
    "10 Days") comes back as 3 separate items. If boxes are available, glue
    chunks that sit on the same line back together, left to right.
    Expects each item to have "text", "confidence" and optionally "bbox" (4 points).
    """
    if not lines or "bbox" not in lines[0]:
        return lines  # already one item per line

    boxes = []
    for line in lines:
        ys = [p[1] for p in line["bbox"]]
        xs = [p[0] for p in line["bbox"]]
        boxes.append({**line, "_y": (min(ys) + max(ys)) / 2, "_h": max(ys) - min(ys), "_x": min(xs)})
    boxes.sort(key=lambda b: (b["_y"], b["_x"]))

    rows: list[list[dict]] = []
    for box in boxes:
        if rows and abs(rows[-1][0]["_y"] - box["_y"]) < max(rows[-1][0]["_h"], box["_h"]) * 0.6:
            rows[-1].append(box)
        else:
            rows.append([box])

    return [
        {
            "text": " ".join(b["text"] for b in sorted(row, key=lambda b: b["_x"])),
            # Average, not minimum: one smudged word shouldn't sink a whole row.
            "confidence": sum(b["confidence"] for b in row) / len(row),
        }
        for row in rows
    ]


def ocr_tesseract(image: Image.Image) -> list[dict]:
    """
    Tesseract OCR, one entry per printed line. "--psm 6" treats the page as one
    block of text, which keeps each table row (name, dosage, duration) on one line.
    Needs `brew install tesseract` and `pip install pytesseract`.
    """
    import pytesseract

    data = pytesseract.image_to_data(image, config="--psm 6", output_type=pytesseract.Output.DICT)
    lines: dict[tuple, dict] = {}
    for i, word in enumerate(data["text"]):
        confidence = float(data["conf"][i])
        if not word.strip() or confidence < 0:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        line = lines.setdefault(key, {"words": [], "confs": []})
        line["words"].append(word)
        line["confs"].append(confidence / 100)
    return [
        {"text": " ".join(line["words"]), "confidence": sum(line["confs"]) / len(line["confs"])}
        for line in lines.values()
    ]


def ocr_image(image: Image.Image) -> list[dict]:
    image = prepare_for_ocr(image)
    try:
        return ocr_tesseract(image)
    except Exception as exc:  # Tesseract not installed, or pytesseract missing
        print(f"Tesseract unavailable ({exc}), falling back to EasyOCR")
        return merge_boxes_into_rows(provider.ocr_detailed(image))


def get_document_text(path: Path) -> tuple[str, list[dict]]:
    """Returns (full text, OCR lines). OCR lines are empty when the PDF had real text."""
    if path.suffix.lower() == ".pdf":
        text = extract_pdf_text(path)
        if len(text) >= MIN_TEXT_LAYER_CHARS:
            return text, []

        # Scanned PDF: render each page at 300 DPI and OCR it.
        ocr_lines: list[dict] = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                ocr_lines.extend(ocr_image(page.to_image(resolution=OCR_DPI).original))
    else:
        ocr_lines = ocr_image(Image.open(path))

    return "\n".join(line["text"] for line in ocr_lines), ocr_lines


# --------------------------------------------------
# LLM FALLBACK (free-text prescriptions only)
# --------------------------------------------------

def extract_with_llm(text: str, hints: list[str]) -> list[dict]:
    import ollama

    prompt = f"""List every medicine prescribed in this document.
Copy each medicine name exactly as written. Do not invent anything.
If a field is not written, use "".

Return JSON: {{"medications": [{{"name": "", "dose": "", "frequency": "", "duration": ""}}]}}

Possible medicine words found by a medical NER model (may be incomplete or wrong):
{json.dumps(hints, ensure_ascii=False)}

Document:
{text}
"""
    response = ollama.chat(
        model="llama3.2:3b",
        messages=[{"role": "user", "content": prompt}],
        format="json",
        options={"temperature": 0},
    )
    data = json.loads(response["message"]["content"])
    meds = data.get("medications", []) if isinstance(data, dict) else []
    return [m for m in meds if isinstance(m, dict)]


def ner_hints(text: str) -> list[str]:
    """Medication words from the NER model, used only as hints for the LLM."""
    try:
        entities = provider.ner(text, MEDICINE_NER_MODEL)
    except Exception:
        return []
    hints = []
    for entity in entities:
        label = str(entity.get("label") or entity.get("entity_group") or "").lower()
        word = str(entity.get("word") or entity.get("text") or entity.get("token") or "").replace("##", "").strip()
        if "medication" in label and len(word) >= 3 and word not in hints:
            hints.append(word)
    return hints


# --------------------------------------------------
# READ QUALITY
# --------------------------------------------------

GARBLED = re.compile(r"[?|\\]|/[A-Za-z]|\b[A-Z]{1,2}\b(?![.:])")


def read_clearly(medication: dict, ocr_lines: list[dict], line_index: int | None) -> bool:
    """False when the row's OCR confidence is low, or the text looks garbled (e.g. '1/F Morning')."""
    text = f"{medication['frequency']} {medication['dose']}"
    if medication.get("garbled") or GARBLED.search(text):
        return False
    if not ocr_lines or line_index is None:
        return True
    # The medicine line plus the continuation line under it ("(Before Food)").
    nearby = ocr_lines[line_index : line_index + 2]
    return min((line["confidence"] for line in nearby), default=1.0) >= LOW_CONFIDENCE


# --------------------------------------------------
# BUILD MEDICATIONS
# --------------------------------------------------

def normalize(value) -> str:
    return " ".join(str(value or "").split())


def dedupe(medications: list[dict]) -> list[dict]:
    seen, unique = set(), []
    for med in medications:
        key = (med["name"].lower(), med["dose"].lower(), med["frequency"].lower(), med["duration"].lower())
        if key not in seen:
            seen.add(key)
            unique.append(med)
    return unique


def build_medications(path: Path) -> list[Medication]:
    text, ocr_lines = get_document_text(path)
    if not text.strip():
        return []

    lines = [line["text"] for line in ocr_lines] if ocr_lines else text.splitlines()

    # 1. Rules: works for typed/printed prescriptions with TAB./CAP./SYP. rows.
    medications = parse_rows(lines)

    # 2. LLM only when the rules found nothing, grounded against the document text.
    if not medications:
        try:
            candidates = extract_with_llm(text, ner_hints(text))
        except Exception as exc:
            print(f"LLM extraction unavailable: {exc}")
            candidates = []
        medications = [
            {**{k: normalize(m.get(k)) for k in ("name", "dose", "frequency", "duration")}, "line_index": None}
            for m in candidates
            if normalize(m.get("name")) and appears_in_text(normalize(m.get("name")), text)
        ]

    medications = dedupe([m for m in medications if len(m["name"]) >= 3])

    return [
        Medication(
            name=med["name"],
            dose=med["dose"],
            frequency=med["frequency"],
            duration=med["duration"],
            source_file=path.name,
            read_clearly=read_clearly(med, ocr_lines, med.get("line_index")),
        )
        for med in medications
    ]