from app.models.hf_loader import HFLoader
from app.agents.router_agent import RouterAgent

class ClassificationService:

    def __init__(self):
        router = RouterAgent()
        config = router.route("classification")

        self.pipeline = HFLoader.load_pipeline(
            config["task"],
            config["model"]
        )

    def classify(self, text: str):
        result = self.pipeline(text)

        # normalize output
        return {
            "label": result[0]["label"],
            "score": float(result[0]["score"])
        }