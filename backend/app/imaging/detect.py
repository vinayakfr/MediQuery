from collections import defaultdict
from pathlib import Path

import numpy as np
import pydicom
from PIL import Image


def detect_dicom_kind(path: str | Path) -> str:
    """
    Detect medical imaging kind from DICOM Modality.
    """

    ds = pydicom.dcmread(path, stop_before_pixels=True)

    modality = getattr(ds, "Modality", "").upper()

    if modality in {"CR", "DX"}:
        return "xray"

    if modality == "MR":
        return "mri"

    if modality == "CT":
        return "ct"

    raise ValueError(
        f"Unsupported DICOM modality: {modality}"
    )


def detect_image_kind(path: str | Path) -> str:
    """
    Detect the kind of a normal image using filename hints
    and then a basic brightness heuristic.
    """

    path = Path(path)

    filename = path.name.lower()

    # Filename hints
    if any(word in filename for word in [
        "xray",
        "x-ray",
        "chest",
        "lung",
        "cxr",
    ]):
        return "xray"

    if any(word in filename for word in [
        "mri",
        "brain",
        "tumor",
        "t1",
        "t2",
    ]):
        return "mri"

    if any(word in filename for word in [
        "prescription",
        "prescription",
        "medicine",
        "medication",
        "rx",
    ]):
        return "prescription"

    # Brightness check
    image = Image.open(path).convert("L")

    # Resize to make this inexpensive
    image.thumbnail((256, 256))

    pixels = np.asarray(image, dtype=np.float32)

    brightness = pixels.mean()

    # Documents are generally mostly white.
    # X-rays are generally much darker.
    if brightness > 180:
        return "prescription"

    return "xray"


def detect_kind(path: str | Path) -> str:
    """
    Detect the medical file kind.
    """

    path = Path(path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return "prescription"

    if suffix == ".nii":
        return "mri"

    if suffix == ".dcm":
        return detect_dicom_kind(path)

    if suffix in {
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".bmp",
    }:
        return detect_image_kind(path)

    raise ValueError(
        f"Unsupported file type: {path.suffix}"
    )


def group_dicom_series(paths: list[str | Path]) -> dict[str, list[Path]]:
    """
    Group DICOM files by SeriesInstanceUID.
    """

    groups = defaultdict(list)

    for path in paths:
        path = Path(path)

        ds = pydicom.dcmread(
            path,
            stop_before_pixels=True,
        )

        series_uid = getattr(
            ds,
            "SeriesInstanceUID",
            None,
        )

        if series_uid is None:
            series_uid = f"unknown-{path.name}"

        groups[series_uid].append(path)

    return dict(groups)