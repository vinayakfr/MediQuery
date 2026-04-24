from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    # Model defaults
    NLP_MODEL_ID: str = "dmis-lab/biobert-v1.1"
    VISION_MODEL_ID: str = "nickmuchi/vit-finetuned-chest-xray-pneumonia"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
