from crewai import Agent

def create_reasoning_agent():
    return Agent(
        role="Clinical Reasoning Expert",
        goal="Analyze symptoms and infer possible medical conditions",
        backstory=(
            "You are a clinical decision support system that maps symptoms "
            "to potential health conditions using logical reasoning."
        ),
        verbose=True
    )