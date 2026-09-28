from abc import ABC, abstractmethod
from PIL import Image


class ModelProvider(ABC):

    @abstractmethod
    def classify(
        self,
        image: Image.Image,
        model_name: str,
    ) -> dict[str, float]:
        pass

    @abstractmethod
    def ocr(
        self,
        image: Image.Image,
    ) -> str:
        pass

    @abstractmethod
    def ner(
        self,
        text: str,
        model_name: str,
    ) -> list[dict]:
        pass