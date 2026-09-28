import numpy as np
import torch
import easyocr

from PIL import Image

from transformers import (
    AutoImageProcessor,
    AutoModelForImageClassification,
    AutoTokenizer,
    AutoModelForTokenClassification,
)

from .provider import ModelProvider
from .registry import MEDICINE_NER_MODEL


class HuggingFaceProvider(ModelProvider):

    def __init__(self):
        self.device = self._get_device()

        self.image_processors = {}
        self.image_models = {}

        self.ner_tokenizer = None
        self.ner_model = None

        self.ocr_reader = None

        print(f"Using device: {self.device}")

    def _get_device(self):

        if torch.backends.mps.is_available():
            return torch.device("mps")

        if torch.cuda.is_available():
            return torch.device("cuda")

        return torch.device("cpu")

    # --------------------------------------------------
    # IMAGE CLASSIFICATION
    # --------------------------------------------------

    def _load_classifier(self, model_name):

        if model_name not in self.image_models:

            print(f"Loading model: {model_name}")

            processor = AutoImageProcessor.from_pretrained(
                model_name
            )

            model = AutoModelForImageClassification.from_pretrained(
                model_name
            )

            model = model.to(self.device)
            model.eval()

            self.image_processors[model_name] = processor
            self.image_models[model_name] = model

        return (
            self.image_processors[model_name],
            self.image_models[model_name],
        )

    def classify(
        self,
        image: Image.Image,
        model_name: str,
    ) -> dict[str, float]:

        processor, model = self._load_classifier(
            model_name
        )

        image = image.convert("RGB")

        inputs = processor(
            images=image,
            return_tensors="pt",
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = model(**inputs)

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1,
        )[0]

        result = {}

        for index, probability in enumerate(probabilities):

            label = model.config.id2label.get(
                index,
                f"LABEL_{index}",
            )

            result[label] = float(
                probability.item()
            )

        return result

    # --------------------------------------------------
    # OCR
    # --------------------------------------------------

    def _load_ocr(self):

        if self.ocr_reader is None:

            self.ocr_reader = easyocr.Reader(
                ["en"],
                gpu=False,
            )

        return self.ocr_reader

    def ocr(
        self,
        image: Image.Image,
    ) -> str:

        reader = self._load_ocr()

        image_array = np.array(
            image.convert("RGB")
        )

        results = reader.readtext(
            image_array,
            detail=0,
        )

        return "\n".join(results)
    
    def ocr_detailed(
        self,
        image: Image.Image,
    ) -> list[dict]:
        reader = self._load_ocr()

        image_array = np.array(
            image.convert("RGB")
        )

        results = reader.readtext(
            image_array,
            detail=1,
        )

        return [
            {
                "text": text,
                "confidence": float(confidence),
            }
            for _, text, confidence in results
        ]

    # --------------------------------------------------
    # MEDICINE NER
    # --------------------------------------------------

    def _load_ner(self):

        if self.ner_model is None:

            print(
                f"Loading NER model: {MEDICINE_NER_MODEL}"
            )

            self.ner_tokenizer = AutoTokenizer.from_pretrained(
                MEDICINE_NER_MODEL
            )

            self.ner_model = AutoModelForTokenClassification.from_pretrained(
                MEDICINE_NER_MODEL
            )

            self.ner_model = self.ner_model.to(
                self.device
            )

            self.ner_model.eval()

        return (
            self.ner_tokenizer,
            self.ner_model,
        )

    def ner(
        self,
        text: str,
        model_name: str = MEDICINE_NER_MODEL,
    ) -> list[dict]:

        tokenizer, model = self._load_ner()

        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = model(**inputs)

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1,
        )

        predictions = torch.argmax(
            probabilities,
            dim=-1,
        )[0]

        tokens = tokenizer.convert_ids_to_tokens(
            inputs["input_ids"][0]
        )

        results = []

        for token, prediction in zip(
            tokens,
            predictions,
        ):

            label = model.config.id2label.get(
                int(prediction),
                "UNKNOWN",
            )

            if label != "O":

                results.append(
                    {
                        "token": token,
                        "label": label,
                    }
                )

        return results