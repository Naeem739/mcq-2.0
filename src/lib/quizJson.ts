import type { ParsedQuestion } from "./quizCsv";

function parseAnswerToIndex(answerRaw: string | number, options: string[]): number | null {
  if (typeof answerRaw === "number") {
    if (answerRaw >= 0 && answerRaw < options.length) return answerRaw;
    if (answerRaw >= 1 && answerRaw <= options.length) return answerRaw - 1;
    return null;
  }

  const a = String(answerRaw).trim();
  if (!a) return null;

  // A/B/C/D ...
  const alpha = a.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
  if (alpha >= 0 && alpha < options.length) return alpha;

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

export function parseQuizJson(jsonText: string): { questions: ParsedQuestion[]; errors: string[] } {
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  try {
    const data = JSON.parse(jsonText);

    // Handle array of questions
    const questionsArray = Array.isArray(data) ? data : data.questions || [];

    if (!Array.isArray(questionsArray)) {
      return {
        questions: [],
        errors: ["JSON must contain an array of questions or an object with a 'questions' array"],
      };
    }

    questionsArray.forEach((item, idx) => {
      const questionNum = idx + 1;

      // Validate question text
      const text = String(item.text || item.question || "").trim();
      if (!text) {
        errors.push(`Question ${questionNum}: missing 'text' or 'question' field`);
        return;
      }

      // Validate options
      let options: string[] = [];
      if (Array.isArray(item.options)) {
        options = item.options.map((o) => String(o).trim()).filter(Boolean);
      } else if (item.optionA || item.optionB) {
        // Support optionA, optionB, optionC, optionD format
        const optionKeys = Object.keys(item)
          .filter((k) => /^option[a-z0-9]+$/i.test(k))
          .sort();
        options = optionKeys.map((k) => String(item[k]).trim()).filter(Boolean);
      }

      if (options.length < 2) {
        errors.push(`Question ${questionNum}: need at least 2 options`);
        return;
      }

      // Parse correct answer
      const answerRaw = item.answer || item.correct || item.correctAnswer || item.correctIndex;
      const correctIndex = parseAnswerToIndex(answerRaw, options);

      if (correctIndex === null) {
        errors.push(
          `Question ${questionNum}: invalid answer "${answerRaw}" (expected A/B/1..N/0..N-1/or option text)`
        );
        return;
      }

      const hint = item.hint || item.explanation || undefined;

      questions.push({
        text,
        options,
        correctIndex,
        hint: hint ? String(hint).trim() : undefined,
      });
    });

    if (questions.length === 0 && errors.length === 0) {
      errors.push("No valid questions found in JSON");
    }
  } catch (error) {
    return {
      questions: [],
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }

  return { questions, errors };
}
