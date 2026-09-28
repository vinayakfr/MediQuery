X_RAY_MODEL = "nickmuchi/vit-finetuned-chest-xray-pneumonia"

MRI_MODEL = "Hemg/Brain-Tumor-Classification"

CT_MODEL = "oohtmeel/swin-tiny-patch4-finetuned-lung-cancer-ct-scans"

MEDICINE_NER_MODEL = "d4data/biomedical-ner-all"


MODELS = {
    "xray": {
        "model": X_RAY_MODEL,
        "labels": ["NORMAL", "PNEUMONIA"],
    },
    "mri": {
        "model": MRI_MODEL,
        "labels": [
            "glioma",
            "meningioma",
            "notumor",
            "pituitary",
        ],
    },
    "ct": {
        "model": CT_MODEL,
        "labels": ["negative", "positive"],
    },
    "medicine_ner": {
        "model": MEDICINE_NER_MODEL,
    },
}