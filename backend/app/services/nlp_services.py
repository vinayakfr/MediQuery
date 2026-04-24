from app.models.hf_loader import HFLoader
from app.models.model_registry import MODEL_REGISTRY

class NLPService:

    def __init__(self):
        config = MODEL_REGISTRY["ner"]
        self.pipeline = HFLoader.load_pipeline(
            config["task"],
            config["model"]
        )

    def merge_phrases(self, entities):
        merged = []
        i = 0

        while i < len(entities):
            current = entities[i]

            # merge "body part + pain" pattern
            if (
                i + 1 < len(entities)
                and current["type"] == "Biological_structure"
                and entities[i + 1]["type"] == "Sign_symptom"
            ):
                combined = {
                    "text": current["text"] + " " + entities[i + 1]["text"],
                    "type": "Sign_symptom",
                    "confidence": (current["confidence"] + entities[i + 1]["confidence"]) / 2
                }
                merged.append(combined)
                i += 2
            else:
                merged.append(current)
                i += 1

        return merged

    def extract_entities(self, text: str):
        raw_output = self.pipeline(text)

        entities = []
        current = None

        for item in raw_output:
            word = item["word"]
            entity = item.get("entity_group") or item.get("entity")
            score = float(item["score"])

            clean_word = word.replace("##", "")

            if entity.startswith("B-"):
                if current:
                    entities.append(current)

                current = {
                    "text": clean_word,
                    "type": entity[2:],
                    "scores": [score]
                }

            elif entity.startswith("I-") and current:
                if word.startswith("##"):
                    current["text"] += clean_word
                else:
                    current["text"] += " " + clean_word

                current["scores"].append(score)

        if current:
            entities.append(current)

        # average confidence
        for ent in entities:
            ent["confidence"] = sum(ent["scores"]) / len(ent["scores"])
            del ent["scores"]

        entities = self.merge_phrases(entities)
        return entities