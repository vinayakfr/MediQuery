import threading
import time

from .store import case_store


class Reporter:

    def __init__(self, case_id: str):
        self.case_id = case_id
        self.lock = threading.Lock()

        # Stores completed agent timings
        self.timings = []

        # Stores currently running agents
        self._running = {}

    def agent(self, agent_id: str, status: str):
        """
        Update the status of an agent.
        """

        with self.lock:

            case = case_store.get_case(self.case_id)

            if case is None:
                return

            case.agents[agent_id] = status

    def log(self, agent_id: str, message: str):
        """
        Add a message to the live run log.
        """

        with self.lock:

            case = case_store.get_case(self.case_id)

            if case is None:
                return

            case.log.append(
                {
                    "time": self._now(),
                    "agent": agent_id,
                    "message": message,
                }
            )

    def progress(
        self,
        file_name: str,
        text: str,
        percent: int,
    ):
        """
        Update routing/progress information for a file.
        """

        with self.lock:

            case = case_store.get_case(self.case_id)

            if case is None:
                return

            for item in case.routing:

                if item.file_name == file_name:

                    item.status = text
                    item.progress = percent

                    return

    def start_timer(self, agent_id: str):
        """
        Start timing an agent.
        """

        with self.lock:
            self._running[agent_id] = time.perf_counter()

    def stop_timer(
        self,
        agent_id: str,
        display_name: str | None = None,
        used: str = "",
    ):
        """
        Stop timing an agent and save the result.
        """

        with self.lock:

            started = self._running.pop(
                agent_id,
                None,
            )

            if started is None:
                return

            seconds = time.perf_counter() - started

            self.timings.append(
                {
                    "agent": display_name or agent_id,
                    "used": used,
                    "seconds": round(seconds, 2),
                }
            )

    def running(
        self,
        agent_id: str,
        display_name: str | None = None,
        used: str = "",
    ):
        """
        Context manager for timing an agent.

        Usage:

            with reporter.running(
                "xray",
                "X-ray agent",
                "chest-xray-cls",
            ):
                ...
        """

        return _AgentTimer(
            reporter=self,
            agent_id=agent_id,
            display_name=display_name,
            used=used,
        )

    @staticmethod
    def _now():

        from datetime import datetime, timezone

        return (
            datetime.now(timezone.utc)
            .isoformat()
            .replace("+00:00", "Z")
        )


class _AgentTimer:

    def __init__(
        self,
        reporter: Reporter,
        agent_id: str,
        display_name: str | None,
        used: str,
    ):
        self.reporter = reporter
        self.agent_id = agent_id
        self.display_name = display_name
        self.used = used

    def __enter__(self):

        self.reporter.start_timer(
            self.agent_id
        )

        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):

        self.reporter.stop_timer(
            self.agent_id,
            self.display_name,
            self.used,
        )

        return False