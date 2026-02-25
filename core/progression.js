export const PROGRESSION_MAP = [
  {
    gradeBand: "6-7",
    cognitiveLevel: 1,
    description:
      "Pattern Recognition: learners notice form-meaning links and build reliable tense identification.",
    recommendedGameTypes: [
      "timeline-intercept",
      "drag-sort",
      "guided-retrieval",
      "visual-contrast"
    ],
    allowedScaffolds: [
      "verb-highlight",
      "timeline-visual",
      "color-coding",
      "micro-hints",
      "step-prompts"
    ],
    skillFocus: [
      "past_continuous_pattern",
      "past_simple_event",
      "when_while_basic",
      "time_markers_basic",
      "verb2_recognition"
    ]
  },
  {
    gradeBand: "8-9",
    cognitiveLevel: 2,
    description:
      "Controlled Retrieval: learners retrieve tense logic with reduced scaffolding and robust error analysis.",
    recommendedGameTypes: [
      "error-intelligence",
      "retrieval-raid",
      "logic-check",
      "contrast-repair"
    ],
    allowedScaffolds: [
      "brief-rule-reminder",
      "post-answer-explanation",
      "mistake-tagging",
      "limited-hint-use"
    ],
    skillFocus: [
      "mixed_past_paragraphs",
      "interrupt_logic",
      "irregular_verbs_context",
      "multi_clause_control",
      "error_detection_repair"
    ]
  },
  {
    gradeBand: "10-12",
    cognitiveLevel: 3,
    description:
      "Abstract Logic and Transfer: learners maintain consistency and justify choices across new contexts.",
    recommendedGameTypes: [
      "logic-lock",
      "agent-builder",
      "paragraph-repair",
      "consistency-audit"
    ],
    allowedScaffolds: [
      "high-level-feedback",
      "summary-hints",
      "mission-recommendations"
    ],
    skillFocus: [
      "narrative_tense_control",
      "embedded_clause_tense",
      "paragraph_consistency",
      "transfer_reasoning",
      "production_accuracy"
    ]
  }
];

export function getProgressionByGradeBand(gradeBand) {
  return PROGRESSION_MAP.find((row) => row.gradeBand === gradeBand) || null;
}

export function getProgressionByLevel(level) {
  return PROGRESSION_MAP.find((row) => row.cognitiveLevel === level) || null;
}

export function inferLevelFromGrade(grade) {
  const n = Number(grade);
  if (Number.isNaN(n)) return null;
  if (n <= 7) return 1;
  if (n <= 9) return 2;
  return 3;
}
