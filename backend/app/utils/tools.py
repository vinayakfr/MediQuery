from crewai.tools import tool
from app.models.hf_loader import hf_manager

@tool("Analyze Medical Text Tool")
def analyze_medical_text_tool(text: str) -> str:
    """
    Useful for analyzing raw clinical text to identify structured medical entities or classifications.
    Pass the raw unstructured medical text as the argument.
    """
    try:
        result = hf_manager.process_text(text)
        return str(result)
    except Exception as e:
        return f"Error analyzing text: {e}"

@tool("Analyze Chest X-Ray Tool")
def analyze_xray_tool(image_path: str) -> str:
    """
    Useful for analyzing a chest X-Ray image to detect conditions like Pneumonia or identify visual abnormalities.
    Pass the absolute file path to the X-Ray image as the argument.
    """
    try:
        result = hf_manager.process_xray(image_path)
        return str(result)
    except Exception as e:
        return f"Error analyzing X-ray: {e}"
