from crewai import Agent

def create_nlp_agent():
    return Agent(
        role="Medical NLP Analyst",
        goal="Understand extracted medical entities from patient data",
        backstory=(
            "You are an expert in interpreting structured clinical entities "
            "like symptoms, medications, and anatomical references."
        ),
        verbose=True
    )