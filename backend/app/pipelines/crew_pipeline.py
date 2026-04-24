from crewai import Task, Crew
from app.agents.nlp_agent import create_nlp_agent
from app.agents.reasoning_agent import create_reasoning_agent
from app.agents.report_agent import create_report_agent


class CrewPipeline:

    def run(self, entities, classification):

        nlp_agent = create_nlp_agent()
        reasoning_agent = create_reasoning_agent()
        report_agent = create_report_agent()

        # Task 1
        task1 = Task(
            description=f"""
Analyze the following extracted entities:
{entities}
""",
            agent=nlp_agent,
            expected_output="Structured understanding of symptoms"
        )

        # Task 2 (depends on Task 1)
        task2 = Task(
            description=f"""
Using the analysis from previous step, and classification:
{classification}

Infer top 3 most likely medical conditions with reasoning.
""",
            agent=reasoning_agent,
            context=[task1],  # ✅ IMPORTANT
            expected_output="Top conditions with reasoning"
        )

        # Task 3 (FINAL OUTPUT)
        task3 = Task(
            description="""
Generate final structured output in STRICT JSON format.
Use previous analysis.
""",
            agent=report_agent,
            context=[task2],  # ✅ IMPORTANT
            expected_output="Valid JSON medical report"
        )

        crew = Crew(
            agents=[nlp_agent, reasoning_agent, report_agent],
            tasks=[task1, task2, task3],
            verbose=True
        )

        result = crew.kickoff()

        # ✅ Extract clean output
        if hasattr(result, "raw"):
            return result.raw
        elif hasattr(result, "result"):
            return result.result
        else:
            return str(result)