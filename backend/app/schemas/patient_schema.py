from pydantic import BaseModel
from typing import List, Optional

class PatientRequest(BaseModel):
    text: str

class Entity(BaseModel):
    text: str
    type: str
    confidence: float


class Classification(BaseModel):
    label: str
    score: float

class Condition(BaseModel):
    name: str
    confidence: str
    reason: str


class AgentAnalysis(BaseModel):
    summary: str
    symptoms: List[str]
    possible_conditions: List[Condition]
    urgency: str
    recommendation: str

class PatientResponse(BaseModel):
    entities: List[Entity]
    classification: Classification
    agent_analysis: Optional[AgentAnalysis]

