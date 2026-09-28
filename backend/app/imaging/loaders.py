from pathlib import Path

import nibabel as nib
import numpy as np
import pydicom
from PIL import Image


def normalize_to_rgb(array: np.ndarray) -> Image.Image:
    """
    Convert a numeric image array into an 8-bit RGB PIL image.
    """

    array = np.asarray(array, dtype=np.float32)

    # Remove NaN / infinity values
    array = np.nan_to_num(array)

    # Normalize to 0-255
    min_value = array.min()
    max_value = array.max()

    if max_value == min_value:
        normalized = np.zeros_like(array, dtype=np.uint8)
    else:
        normalized = (
            (array - min_value)
            / (max_value - min_value)
            * 255
        ).astype(np.uint8)

    # Convert grayscale to RGB
    image = Image.fromarray(normalized, mode="L")
    return image.convert("RGB")


def load_dicom(path: str | Path) -> Image.Image:
    """
    Load a DICOM image and return an RGB PIL image.
    """

    ds = pydicom.dcmread(path)

    pixels = ds.pixel_array.astype(np.float32)

    # Apply RescaleSlope / RescaleIntercept
    slope = float(getattr(ds, "RescaleSlope", 1))
    intercept = float(getattr(ds, "RescaleIntercept", 0))

    pixels = pixels * slope + intercept

    modality = getattr(ds, "Modality", "")

    # CT lung window: -1000 to 400 HU
    if modality == "CT":
        pixels = np.clip(pixels, -1000, 400)

    # MONOCHROME1 means lower values are brighter.
    # Invert it so the output behaves like a normal image.
    if getattr(ds, "PhotometricInterpretation", "") == "MONOCHROME1":
        pixels = pixels.max() - pixels

    return normalize_to_rgb(pixels)


def load_nifti(path: str | Path) -> Image.Image:
    """
    Load a NIfTI volume and create a preview from
    approximately 16 slices around the middle.
    """

    nii = nib.load(path)

    volume = nii.get_fdata()

    # Remove singleton dimensions
    volume = np.squeeze(volume)

    if volume.ndim != 3:
        raise ValueError(
            f"Expected a 3D NIfTI volume, got shape {volume.shape}"
        )

    depth = volume.shape[2]

    # Select about 16 slices around the middle
    count = min(16, depth)

    start = max(0, depth // 2 - count // 2)
    end = start + count

    slices = volume[:, :, start:end]

    # Create a montage
    columns = 4
    rows = int(np.ceil(len(slices) / columns))

    slice_images = [
        normalize_to_rgb(slices[:, :, i])
        for i in range(len(slices))
    ]

    width = max(image.width for image in slice_images)
    height = max(image.height for image in slice_images)

    montage = Image.new(
        "RGB",
        (columns * width, rows * height),
    )

    for index, image in enumerate(slice_images):
        x = (index % columns) * width
        y = (index // columns) * height

        montage.paste(image, (x, y))

    return montage


def load_image(path: str | Path) -> Image.Image:
    """
    Load a normal image file and return RGB PIL image.
    """

    return Image.open(path).convert("RGB")


def load_medical_file(path: str | Path, kind: str) -> Image.Image:
    """
    Load a medical file based on its detected kind.
    """

    path = Path(path)

    if path.suffix.lower() == ".dcm":
        return load_dicom(path)

    if path.suffix.lower() == ".nii":
        return load_nifti(path)

    if kind in {"xray", "mri"}:
        return load_image(path)

    raise ValueError(f"Cannot create image preview for: {path}")