from typing import Annotated, TypedDict
import operator


class GraphState(TypedDict, total=False):
    case_id: str

    files: list

    logs: Annotated[list, operator.add]
    progress: Annotated[list, operator.add]