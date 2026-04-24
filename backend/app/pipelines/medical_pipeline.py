from app.services.nlp_services import NLPService
from app.services.classification_services import ClassificationService
from app.pipelines.crew_pipeline import CrewPipeline
import json


class MedicalPipeline:

    def __init__(self):
        self.nlp = NLPService()
        self.classifier = ClassificationService()
        self.crew = CrewPipeline()

    def run(self, text: str):
        entities = self.nlp.extract_entities(text)
        classification = self.classifier.classify(text)

        agent_output = self.crew.run(entities, classification)

        parsed_output = self.safe_parse(agent_output)

        return {
            "entities": entities,
            "classification": classification,
            "agent_analysis": parsed_output
        }
    
    def safe_parse(self, output):
        try:
            if not isinstance(output, str):
                output = str(output)

            if "```" in output:
                output = output.split("```")[1] if "```" in output else output

            output = output.strip()

            return json.loads(output)

        except Exception:
            return {
                "error": "Invalid agent output",
                "raw": output
            }