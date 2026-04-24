from app.models.model_registry import MODEL_REGISTRY

class RouterAgent:

    def route(self, task_type: str):
        if task_type not in MODEL_REGISTRY:
            raise ValueError(f"Unsupported task: {task_type}")

        return MODEL_REGISTRY[task_type]