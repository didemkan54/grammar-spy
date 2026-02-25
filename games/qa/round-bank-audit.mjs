import fs from "node:fs";
import path from "node:path";

const workspace = "/workspace";

const BAD_ANSWER_PATTERNS = [
  /\bwas\s+approve\b/i,
  /\bwere\s+clear\s+and\s+ready\b/i,
  /\bdoes\s+\w+s\b/i,
  /\bdid\s+\w+ed\b/i,
  /\bis\s+\w+s\b/i,
  /\bdo\s+\w+s\b/i
];

const EXPECTED_REASON_TOKENS = [
  "past",
  "present",
  "continuous",
  "simple",
  "tense",
  "subject",
  "agreement",
  "connector",
  "question",
  "reference",
  "timeline",
  "verb",
  "base",
  "singular",
  "plural",
  "pronoun",
  "noun",
  "sequence",
  "order",
  "logic",
  "clause"
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractObjectFromJs(code, marker) {
  const startMarker = `${marker} = {`;
  const start = code.indexOf(startMarker);
  if (start === -1) throw new Error(`Marker not found: ${marker}`);

  let i = start + startMarker.length - 1;
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (; i < code.length; i += 1) {
    const ch = code[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const literal = code.slice(start + `${marker} = `.length, i + 1);
        return eval(`(${literal})`);
      }
    }
  }
  throw new Error(`Unterminated object: ${marker}`);
}

function extractArrayFromJs(code, marker) {
  const startMarker = `${marker} = [`;
  const start = code.indexOf(startMarker);
  if (start === -1) throw new Error(`Marker not found: ${marker}`);

  let i = start + startMarker.length - 1;
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;

  for (; i < code.length; i += 1) {
    const ch = code[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        const literal = code.slice(start + `${marker} = `.length, i + 1);
        return eval(`(${literal})`);
      }
    }
  }
  throw new Error(`Unterminated array: ${marker}`);
}

function hasReasonSignal(text) {
  const lower = String(text || "").toLowerCase();
  return EXPECTED_REASON_TOKENS.some((token) => lower.includes(token));
}

function auditMultipleChoiceRound(source, round) {
  const issues = [];
  if (!Array.isArray(round.options) || round.options.length < 2) {
    issues.push(`${source}: options missing or <2`);
    return issues;
  }
  if (typeof round.answer !== "number" || round.answer < 0 || round.answer >= round.options.length) {
    issues.push(`${source}: answer index out of range`);
    return issues;
  }
  const unique = new Set(round.options);
  if (unique.size !== round.options.length) issues.push(`${source}: duplicate option lines`);
  if (!round.scene || !round.prompt || !round.explain) issues.push(`${source}: missing scene/prompt/explain`);
  const answerLine = round.options[round.answer];
  BAD_ANSWER_PATTERNS.forEach((pattern) => {
    if (pattern.test(answerLine)) issues.push(`${source}: suspicious correct answer "${answerLine}"`);
  });
  if (!hasReasonSignal(round.explain)) issues.push(`${source}: explanation may be too vague`);
  return issues;
}

function auditCaseInterviewRound(source, round) {
  const issues = [];
  if (!Array.isArray(round.options) || round.options.length < 2) {
    issues.push(`${source}: options missing`);
    return issues;
  }
  const okCount = round.options.filter((opt) => Boolean(opt.ok)).length;
  if (okCount !== 1) issues.push(`${source}: expected exactly one correct option, found ${okCount}`);
  if (!round.title || !round.line || !round.ask) issues.push(`${source}: missing title/line/ask`);
  round.options.forEach((opt, idx) => {
    if (!opt.t || !opt.why) issues.push(`${source}: option[${idx}] missing text/reason`);
  });
  return issues;
}

function main() {
  const missionShellCode = read(path.join(workspace, "mission-game-shell.js"));
  const roundBanks = extractObjectFromJs(missionShellCode, "var roundBanks");
  const packVariants = extractObjectFromJs(missionShellCode, "var packVariantBanks");

  const caseInterviewCode = read(path.join(workspace, "case-interview.html"));
  const caseBank = extractArrayFromJs(caseInterviewCode, "const BANK");

  const issues = [];

  Object.entries(roundBanks).forEach(([gameKey, rounds]) => {
    rounds.forEach((round, idx) => {
      issues.push(...auditMultipleChoiceRound(`mission-shell:${gameKey}[${idx}]`, round));
    });
  });

  Object.entries(packVariants).forEach(([gameKey, packs]) => {
    Object.entries(packs).forEach(([packId, rounds]) => {
      rounds.forEach((round, idx) => {
        issues.push(...auditMultipleChoiceRound(`mission-shell:${gameKey}/${packId}[${idx}]`, round));
      });
    });
  });

  caseBank.forEach((round, idx) => {
    issues.push(...auditCaseInterviewRound(`case-interview[${idx}]`, round));
  });

  const summary = {
    missionGames: Object.keys(roundBanks).length,
    packVariantGames: Object.keys(packVariants).length,
    caseInterviewRounds: caseBank.length,
    issueCount: issues.length
  };

  console.log("=== Grammar Spy Round-Bank QA ===");
  console.log(summary);
  if (!issues.length) {
    console.log("Result: PASS (no structural/content-signal issues detected by audit rules).");
    return;
  }
  console.log("Result: REVIEW REQUIRED");
  issues.forEach((issue) => console.log("-", issue));
  process.exitCode = 1;
}

main();
