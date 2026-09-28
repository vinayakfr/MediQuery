"""
Rule-based parsing of prescription text into medicine rows.

Prescriptions are very regular: each medicine starts with a form word
(TAB., CAP., SYP., INJ. ...) often after a number "1)", followed by the
name, then dosage/timing and a duration like "10 Days". Rules catch this
reliably even from noisy OCR, and even when the name isn't a real drug
(so an NER model would never tag it).
"""

from __future__ import annotations

import difflib
import re

# Medicine form prefixes, as doctors write them. OCR often turns "." into ","
FORMS = r"TAB|TABS|TABLET|CAP|CAPS|CAPSULE|SYP|SYR|SYRUP|INJ|INJECTION|SUSP|OINT|OINTMENT|CREAM|GEL|DROP|DROPS|LOTION|INH|NEB|SACHET|POWDER"

# "1) TAB. DEMO MEDICINE 1 ..." / "2. CAP, Amoxicillin 500mg ..." / "Tab Dolo 650 ..."
MED_START = re.compile(
    rf"^\s*(?:\d{{1,2}}\s*[\).:-]\s*)?(?P<form>{FORMS})\b[\s\.,:]*(?P<rest>.+)$",
    re.IGNORECASE,
)

# A numbered row: "1) ...", "2. ...", "3- ..."
NUMBERED = re.compile(r"^\s*\d{1,2}\s*[\).:-]\s*(?P<rest>.+)$")
FORM_LIST = FORMS.split("|")


def match_medicine_start(line: str) -> tuple[str, str] | None:
    """
    Does this line start a medicine? Returns (form, rest of line) or None.
    Handles OCR slips in the form word ("TAR." for "TAB.") on numbered rows,
    and numbered rows with no form word at all ("1) Amoxicillin 500 mg ...").
    """
    exact = MED_START.match(line)
    if exact:
        return exact.group("form").upper(), exact.group("rest")

    numbered = NUMBERED.match(line)
    if not numbered:
        return None
    rest = numbered.group("rest")
    first, _, remainder = rest.partition(" ")
    guess = difflib.get_close_matches(re.sub(r"[^A-Za-z]", "", first).upper(), FORM_LIST, n=1, cutoff=0.6)
    if guess and remainder:
        return guess[0], remainder
    # Numbered line starting with a word: treat it as a medicine without a form.
    return ("", rest) if re.match(r"[A-Za-z]{3,}", rest) else None


# Where the name stops and the dosing starts.
DOSE_START = re.compile(
    r"""(
        \b\d+(?:/\d+)?\s*(?:morning|mor\w*|aft\w*|eve\w*|night|n\w{2,4}t)\b   # 1 Morning, 1/2 Night
      | \b[01]\s*-\s*[01]\s*-\s*[01]\b                                     # 1-0-1
      | \b(?:OD|BD|BID|TDS|TID|QID|HS|SOS|STAT|PRN)\b                      # Latin shorthand
      | \b(?:once|twice|thrice)\b
    )""",
    re.IGNORECASE | re.VERBOSE,
)

DURATION = re.compile(r"\b(\d+)\s*(day|days|week|weeks|wk|wks|month|months)\b", re.IGNORECASE)
STRENGTH = re.compile(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units?)\b", re.IGNORECASE)
TIMING_NOTE = re.compile(r"\((?:before|after|with|empty)[^)]*\)?", re.IGNORECASE)

# Common OCR slips in timing words, fixed by closest match.
TIMING_WORDS = ["Morning", "Afternoon", "Aft", "Evening", "Eve", "Night", "Before", "After", "Food"]


def fix_timing_words(text: str) -> str:
    """'i Morming, 1 Might' -> '1 Morning, 1 Night'. Only touches near-misses of known timing words."""

    def fix(match: re.Match) -> str:
        word = match.group(0)
        close = difflib.get_close_matches(word.capitalize(), TIMING_WORDS, n=1, cutoff=0.6)
        return close[0] if close else word

    text = re.sub(r"[A-Za-z]{3,}", fix, text)
    # A lone "i"/"l"/"I" right before a timing word is an OCR'd "1".
    return re.sub(r"(?<![\w/])[iIl](?=\s+(?:Morning|Afternoon|Aft|Evening|Eve|Night)\b)", "1", text)


def tidy(text: str) -> str:
    text = text.replace("}", ")").replace("{", "(")
    return " ".join(text.split()).strip(" ,.;:-")


# A form word followed by punctuation marks a new medicine even mid-line: "... 10 Days 4) TAB: X"
MID_LINE_START = re.compile(rf"(?=(?:\b\d{{1,2}}\s*[\).:-]?\s*)?\b(?:{FORMS})[\.:,])", re.IGNORECASE)

# Sections that come after the medicine table. Matched fuzzily because OCR mangles them ("Advce Given").
STOP_WORDS = ["advice", "follow", "charts", "diagnosis", "signature", "investigations", "remarks"]

# A row that runs longer than this has swallowed text it shouldn't have.
MAX_DOSING_CHARS = 90


def _is_stop_line(line: str) -> bool:
    first = re.sub(r"[^a-z]", "", line.split()[0].lower()) if line.split() else ""
    return bool(first) and bool(difflib.get_close_matches(first, STOP_WORDS, n=1, cutoff=0.75)) or line.lower().startswith("dr.")


def split_joined_lines(lines: list[str]) -> list[tuple[int, str]]:
    """Split lines that contain several medicines. Keeps the original line index for OCR confidence."""
    out = []
    for index, line in enumerate(lines):
        cuts = [m.start() for m in MID_LINE_START.finditer(line) if m.start() > 0]
        start = 0
        for cut in cuts:
            out.append((index, line[start:cut]))
            start = cut
        out.append((index, line[start:]))
    return out


def parse_rows(lines: list[str]) -> list[dict]:
    """
    Turn OCR/text lines into medicine rows:
    [{"name", "dose", "frequency", "duration", "line_index"}]

    A row starts at a line matching MED_START. Following lines that don't
    start a new medicine (e.g. "(Before Food) (Tot:20 Tab)") belong to it.
    """
    rows: list[dict] = []
    current: dict | None = None

    for index, raw in split_joined_lines(lines):
        line = tidy(raw)
        if not line:
            continue

        start = match_medicine_start(line)
        if start:
            if current:
                rows.append(current)
            form, body = start
            current = {"form": form, "body": body, "extra": [], "line_index": index}
            continue

        if current is not None:
            # Stop collecting at section headers after the medicine table.
            if _is_stop_line(line):
                rows.append(current)
                current = None
                continue
            # A medicine takes at most four continuation lines (dosing, duration, "(Before Food)", "(Tot:20 Tab)").
            if len(current["extra"]) < 4:
                current["extra"].append(line)

    if current:
        rows.append(current)

    return [_split_fields(row) for row in rows]


def _looks_like_quantity(token: str) -> bool:
    """'1', '1/2', 'i', '1/F', 'U/?' — a (possibly OCR-mangled) count before a timing word."""
    return len(token) <= 3 and not token.isalpha() or token.lower() in {"i", "l", "½"}


def _is_timing_word(token: str) -> bool:
    word = re.sub(r"[^A-Za-z]", "", token)
    return len(word) >= 3 and bool(difflib.get_close_matches(word.capitalize(), TIMING_WORDS, n=1, cutoff=0.6))


def _name_end(tokens: list[str]) -> int:
    """Index where the medicine name stops: at the first dosing marker (fuzzy, OCR-tolerant)."""
    for i, token in enumerate(tokens):
        if i == 0:
            continue  # the first word is always part of the name
        if _is_timing_word(token) or DOSE_START.match(token) or DURATION.match(" ".join(tokens[i : i + 2])):
            # "... MEDICINE 1 1 Morning": the count before "Morning" belongs to the dose.
            return i - 1 if i > 1 and _looks_like_quantity(tokens[i - 1]) else i
        if re.fullmatch(r"x|×", token, re.IGNORECASE):
            return i
    return len(tokens)


def _split_fields(row: dict) -> dict:
    tokens = row["body"].split()
    cut = _name_end(tokens)
    name = tidy(" ".join(tokens[:cut]))
    dosing = " ".join([" ".join(tokens[cut:]), *row["extra"]])

    # Strength like "500 mg" is the dose, not part of the name.
    strength = STRENGTH.search(name) or STRENGTH.search(dosing)
    if strength and strength.group(0) in name:
        name = tidy(name.replace(strength.group(0), ""))
    elif strength:
        dosing = dosing.replace(strength.group(0), "")

    duration_match = DURATION.search(dosing)
    duration = f"{duration_match.group(1)} {duration_match.group(2).lower()}" if duration_match else ""

    notes = [fix_timing_words(tidy(n)).strip("()") for n in TIMING_NOTE.findall(dosing)]
    # Anything after the pack total "(Tot:20 Tab)" belongs to something else on the page.
    total = re.search(r"\(?\s*tot\s*:?[^)]*\)?", dosing, re.IGNORECASE)
    if total:
        dosing = dosing[: total.end()]
    frequency = DURATION.sub("", dosing)
    frequency = TIMING_NOTE.sub("", frequency)
    frequency = re.sub(r"\(?\s*tot\s*:?[^)]*\)?", "", frequency, flags=re.IGNORECASE)  # pack totals "(Tot:20 Tab)"
    frequency = re.sub(r"(?:^|\s)[x×](?=\s|$)", " ", frequency)                          # "1-0-1 x 5 days"
    frequency = fix_timing_words(tidy(frequency))
    if notes:
        frequency = f"{frequency} ({', '.join(dict.fromkeys(notes))})".strip()
    garbled = len(frequency) > MAX_DOSING_CHARS
    if garbled:
        frequency = frequency[:MAX_DOSING_CHARS].rsplit(" ", 1)[0] + "…"

    return {
        "name": f"{_form_word(row['form'])} {name}".strip() if name else "",
        "dose": strength.group(0) if strength else "",
        "frequency": frequency,
        "duration": duration,
        "line_index": row["line_index"],
        "garbled": garbled,
    }


def _form_word(form: str) -> str:
    if not form:
        return ""
    return {"TAB": "Tab.", "TABS": "Tab.", "TABLET": "Tab.", "CAP": "Cap.", "CAPS": "Cap.", "CAPSULE": "Cap.", "SYP": "Syp.", "SYR": "Syp.", "SYRUP": "Syp.", "INJ": "Inj.", "INJECTION": "Inj."}.get(form, form.title())


def appears_in_text(name: str, text: str, cutoff: float = 0.8) -> bool:
    """Grounding check: is this medicine name (roughly) written in the document?"""
    name = name.lower()
    for prefix in ("tab. ", "cap. ", "syp. ", "inj. "):
        name = name.removeprefix(prefix)
    text = text.lower()
    if name in text:
        return True
    words = name.split()
    tokens = text.split()
    for i in range(len(tokens) - len(words) + 1):
        window = " ".join(tokens[i : i + len(words)])
        if difflib.SequenceMatcher(None, name, window).ratio() >= cutoff:
            return True
    return False