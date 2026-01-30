import Papa from "papaparse";

export type ParsedQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
};

function pickFirstKey(obj: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    if (k in obj) return k;
  }
  return undefined;
}

function normalizeCell(v: unknown) {
  if (v == null) return "";
  return String(v).trim();
}

function alphaToIndex(s: string) {
  const x = s.trim().toUpperCase();
  if (!x) return null;
  const c = x[0];
  if (c < "A" || c > "Z") return null;
  return c.charCodeAt(0) - "A".charCodeAt(0);
}

function parseAnswerToIndex(answerRaw: string, options: string[]) {
  const a = answerRaw.trim();
  if (!a) return null;

  // A/B/C/D ...
  const alpha = alphaToIndex(a);
  if (alpha != null && alpha >= 0 && alpha < options.length) return alpha;

  // 1..N or 0..N-1
  const n = Number(a);
  if (Number.isFinite(n)) {
    const asInt = Math.trunc(n);
    if (asInt >= 0 && asInt < options.length) return asInt;
    if (asInt >= 1 && asInt <= options.length) return asInt - 1;
  }

  // match option text
  const idx = options.findIndex((o) => o.trim().toLowerCase() === a.toLowerCase());
  if (idx !== -1) return idx;

  return null;
}

export function parseQuizCsv(csvText: string): { questions: ParsedQuestion[]; errors: string[] } {
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];
  if (parsed.errors?.length) {
    for (const e of parsed.errors) errors.push(`CSV parse error: ${e.message}`);
  }

  const questions: ParsedQuestion[] = [];
  const rows = parsed.data ?? [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1

    const qKey = pickFirstKey(row, ["question", "q", "Question", "QUESTION"]);
    const aKey = pickFirstKey(row, ["answer", "ans", "correct", "Answer", "ANS"]);

    const text = normalizeCell(qKey ? row[qKey] : "");
    if (!text) {
      errors.push(`Row ${rowNum}: missing question`);
      return;
    }

    // Options: either a single "options" cell (pipe-separated) or optionA/optionB/...
    const optionsKey = pickFirstKey(row, ["options", "Options", "choice", "choices"]);
    let options: string[] = [];

    if (optionsKey) {
      const raw = normalizeCell(row[optionsKey]);
      options = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (options.length < 2) {
        // fallback separator
        options = raw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } else {
      const optionEntries = Object.entries(row)
        .filter(([k, v]) => /^option[a-z0-9]+$/i.test(k) && normalizeCell(v))
        .sort(([a], [b]) => a.localeCompare(b));
      options = optionEntries.map(([, v]) => normalizeCell(v));
    }

    if (options.length < 2) {
      errors.push(`Row ${rowNum}: need at least 2 options (optionA/optionB/... or options="A|B|C")`);
      return;
    }

    const answerRaw = normalizeCell(aKey ? row[aKey] : "");
    const correctIndex = parseAnswerToIndex(answerRaw, options);
    if (correctIndex == null) {
      errors.push(`Row ${rowNum}: invalid answer "${answerRaw}" (expected A/B/1..N/or option text)`);
      return;
    }

    questions.push({
      text,
      options,
      correctIndex,
    });
  });

  return { questions, errors };
}

