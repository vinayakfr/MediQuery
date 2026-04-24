from transformers import pipeline

class HFLoader:

    _cache = {}

    @classmethod
    def load_pipeline(cls, task: str, model: str):
        key = f"{task}:{model}"

        if key not in cls._cache:
            cls._cache[key] = pipeline(task, model=model)

        return cls._cache[key]