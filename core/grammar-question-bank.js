const QUESTION_TYPES = ["error_detection", "multiple_choice", "fill_blank", "sentence_builder"];
const DIFFICULTY_LEVELS = ["rookie", "field", "senior"];
const TOPICS = [
  "present_tense",
  "past_tense",
  "future_tense",
  "subject_verb_agreement",
  "questions",
  "negatives",
  "pronouns",
  "conjunctions",
  "tense_consistency"
];

const TYPE_PATTERN = [
  "error_detection",
  "multiple_choice",
  "fill_blank",
  "sentence_builder",
  "error_detection",
  "multiple_choice",
  "fill_blank",
  "sentence_builder",
  "error_detection",
  "multiple_choice"
];

const DIFFICULTY_PATTERN = [
  "rookie",
  "rookie",
  "rookie",
  "rookie",
  "field",
  "field",
  "field",
  "senior",
  "senior",
  "senior"
];

const TOPIC_SEEDS = {
  present_tense: [
    ["She go to school every day.", "She goes to school every day.", "Use 'goes' with third-person singular subjects like she."],
    ["They plays soccer after class.", "They play soccer after class.", "Plural subjects use the base verb in simple present."],
    ["He don't check his email before lunch.", "He doesn't check his email before lunch.", "Use doesn't with he/she/it."],
    ["My brother have a new notebook.", "My brother has a new notebook.", "Use 'has' with a singular third-person subject."],
    ["The bus arrive at seven each morning.", "The bus arrives at seven each morning.", "A singular subject takes verb + s in simple present."],
    ["We studies in the library on Tuesdays.", "We study in the library on Tuesdays.", "Plural subjects use the base form: study."],
    ["I am usually walk to class with Ana.", "I usually walk to class with Ana.", "Simple present routines do not use 'am' before a base verb."],
    ["The teacher explain the rule, and we take notes.", "The teacher explains the rule, and we take notes.", "The singular subject 'teacher' needs 'explains'."],
    ["It rain every afternoon in spring.", "It rains every afternoon in spring.", "Use verb + s with 'it' in simple present."],
    ["She brush her teeth before bed.", "She brushes her teeth before bed.", "Some verbs add -es with he/she/it: brushes."]
  ],
  past_tense: [
    ["She go to school yesterday.", "She went to school yesterday.", "Use the irregular past form 'went' for yesterday."],
    ["They was late to class.", "They were late to class.", "Plural subjects use 'were' in past tense."],
    ["We didn't went to the lab.", "We didn't go to the lab.", "After didn't, use the base verb."],
    ["He study English last night.", "He studied English last night.", "Regular verbs usually add -ed in simple past."],
    ["Did you saw the announcement?", "Did you see the announcement?", "After did, use the base form: see."],
    ["I am watched the demo yesterday.", "I watched the demo yesterday.", "Do not use be + past verb for simple past actions."],
    ["The team win the challenge last week.", "The team won the challenge last week.", "Use the irregular past form 'won'."],
    ["She were tired after practice.", "She was tired after practice.", "Singular subjects use 'was' in past tense."],
    ["They don't finished the worksheet.", "They didn't finish the worksheet.", "Past negative uses didn't + base verb."],
    ["When he arrive, we started the game.", "When he arrived, we started the game.", "Past-time sequence needs past tense in both clauses."]
  ],
  future_tense: [
    ["She will goes to the meeting tomorrow.", "She will go to the meeting tomorrow.", "After will, use the base verb."],
    ["They is going to travel next month.", "They are going to travel next month.", "Plural subjects use 'are' in be going to."],
    ["We will to study tonight.", "We will study tonight.", "Do not use 'to' after will."],
    ["He going to call after dinner.", "He is going to call after dinner.", "Use be + going to + base verb for future plans."],
    ["Tomorrow I am visit my cousin.", "Tomorrow I am going to visit my cousin.", "For planned future, use be going to + base verb."],
    ["Will she comes with us?", "Will she come with us?", "After will, use the base form: come."],
    ["They won't to miss the bus.", "They won't miss the bus.", "Do not add 'to' after won't."],
    ["Next week the class start a new mission.", "Next week the class will start a new mission.", "Future-time markers often take will + base verb."],
    ["By tonight, we will finished the report.", "By tonight, we will finish the report.", "After will, keep the verb in base form."],
    ["The team are going to wins the match.", "The team is going to win the match.", "Singular collective subject uses 'is' and base verb."]
  ],
  subject_verb_agreement: [
    ["The students in this class is focused.", "The students in this class are focused.", "Plural subject 'students' takes 'are'."],
    ["Each student write a reflection.", "Each student writes a reflection.", "Each + singular noun uses a singular verb."],
    ["The list of rules are on the wall.", "The list of rules is on the wall.", "The head noun 'list' is singular."],
    ["My friends likes grammar games.", "My friends like grammar games.", "Plural subject needs base verb: like."],
    ["Neither the teacher nor the students was ready.", "Neither the teacher nor the students were ready.", "With neither...nor, verb agrees with the nearest subject."],
    ["One of the books have a torn cover.", "One of the books has a torn cover.", "One is singular, so use has."],
    ["The news are surprising everyone.", "The news is surprising everyone.", "'News' is treated as singular."],
    ["There is many reasons to revise this sentence.", "There are many reasons to revise this sentence.", "Use are with plural noun 'reasons'."],
    ["A pair of shoes were on the floor.", "A pair of shoes was on the floor.", "The subject 'pair' is singular."],
    ["The data from the experiment shows errors.", "The data from the experiment show errors.", "In academic style, 'data' is often plural."]
  ],
  questions: [
    ["Why she is late today?", "Why is she late today?", "In questions, place the auxiliary before the subject."],
    ["Do he understand the clue?", "Does he understand the clue?", "Use does with he/she/it in present questions."],
    ["Where you went yesterday?", "Where did you go yesterday?", "Past questions use did + base verb."],
    ["What she doing after school?", "What is she doing after school?", "Present continuous questions use be + -ing."],
    ["Did they finished their project?", "Did they finish their project?", "After did, use the base form."],
    ["How many students is absent today?", "How many students are absent today?", "Plural subject needs are."],
    ["When the bus will arrive?", "When will the bus arrive?", "Future questions use will before the subject."],
    ["Who she called last night?", "Who did she call last night?", "Past simple questions use did + base verb."],
    ["Are you can help me now?", "Can you help me now?", "Do not stack two auxiliaries in simple questions."],
    ["Why did he went home early?", "Why did he go home early?", "Did pairs with base verb: go."]
  ],
  negatives: [
    ["She not like loud music.", "She does not like loud music.", "Use does not + base verb for he/she/it present negatives."],
    ["They doesn't study on Fridays.", "They do not study on Fridays.", "Plural subjects use do not."],
    ["I didn't ate breakfast.", "I didn't eat breakfast.", "After didn't, use base verb."],
    ["He isn't go to class today.", "He isn't going to class today.", "Be negative needs verb-ing for present continuous."],
    ["We no finished the worksheet.", "We did not finish the worksheet.", "Use did not + base verb for past negatives."],
    ["The team don't has enough time.", "The team doesn't have enough time.", "Singular subject takes doesn't + base verb."],
    ["She never don't submits late work.", "She never submits late work.", "Do not use double negatives in standard English."],
    ["You wasn't at the meeting.", "You were not at the meeting.", "Use were not with you in past tense."],
    ["He won't to forget the password.", "He won't forget the password.", "After won't, use base verb."],
    ["They didn't were ready.", "They were not ready.", "Do not combine didn't with be-verb past forms."]
  ],
  pronouns: [
    ["Maria told I the answer.", "Maria told me the answer.", "Use object pronoun 'me' after told."],
    ["Him and I finished the task.", "He and I finished the task.", "Use subject pronoun 'he' in subject position."],
    ["The teacher gave the books to she.", "The teacher gave the books to her.", "After a preposition, use object pronoun."],
    ["Each student should bring their notebook.", "Each student should bring his or her notebook.", "Singular antecedents take singular pronoun agreement in formal style."],
    ["Me and my friend joined the class.", "My friend and I joined the class.", "Use subject pronoun 'I' as part of the subject."],
    ["The coach asked we to stay late.", "The coach asked us to stay late.", "Use object pronoun 'us' after asked."],
    ["This is between you and I.", "This is between you and me.", "After prepositions, use object pronouns."],
    ["Every student must submit their work, and he must check it twice.", "Every student must submit his or her work, and he or she must check it twice.", "Pronouns should remain consistent with the antecedent."],
    ["The principal called they to the office.", "The principal called them to the office.", "Use object pronoun 'them' as the object."],
    ["Her is the best candidate for class leader.", "She is the best candidate for class leader.", "Use subject pronoun 'she' before a verb."]
  ],
  conjunctions: [
    ["I stayed home but I was sick.", "I stayed home because I was sick.", "Use because to show cause."],
    ["She studied hard so she passed the quiz, but she was prepared.", "She studied hard, so she passed the quiz.", "Remove unnecessary conjunction chains and keep one clear relation."],
    ["We can review now and we can review later, because we choose now.", "We can review now or we can review later.", "Use or for alternatives."],
    ["He brought a notebook, and because he forgot a pen.", "He brought a notebook because he forgot a pen.", "Because should connect reason directly to the clause."],
    ["They were tired so they finished the project.", "They were tired but they finished the project.", "Use but for contrast."],
    ["If you finish early, and you can help your partner.", "If you finish early, you can help your partner.", "Do not add an extra conjunction after if-clause commas."],
    ["She practiced every day because she wanted improve.", "She practiced every day because she wanted to improve.", "Use the infinitive marker 'to' before improve."],
    ["Although it was late, but we kept working.", "Although it was late, we kept working.", "Do not pair although with but in the same sentence."],
    ["The class was noisy so however the teacher stayed calm.", "The class was noisy; however, the teacher stayed calm.", "Use transition adverbs with proper punctuation."],
    ["We checked the clue before we had lunch and after we had lunch, we celebrate.", "We checked the clue before we had lunch, and after we had lunch, we celebrated.", "Keep verb tense consistent across connected clauses."]
  ],
  tense_consistency: [
    ["Yesterday we study and then we watch a video.", "Yesterday we studied and then we watched a video.", "Keep both actions in simple past for a past timeline."],
    ["He opens his notebook and wrote the answer.", "He opened his notebook and wrote the answer.", "Parallel verbs in one sequence should stay in the same tense."],
    ["Last week they are absent and missed the quiz.", "Last week they were absent and missed the quiz.", "Past-time markers require past verb forms."],
    ["When she arrives yesterday, we started the activity.", "When she arrived yesterday, we started the activity.", "Use past tense consistently with yesterday."],
    ["The teacher explained the rule, and the class is taking notes.", "The teacher explained the rule, and the class took notes.", "Match the tense when describing completed past events."],
    ["By the time we finished, the bus leaves.", "By the time we finished, the bus left.", "Both actions happened in the past."],
    ["He was checking the answer and then submits it.", "He was checking the answer and then submitted it.", "Switch both verbs to a consistent past sequence."],
    ["Tomorrow we practiced dialogue and then we present.", "Tomorrow we will practice dialogue and then we will present.", "Future-time markers need future forms."],
    ["She has completed the task and presented it yesterday.", "She completed the task and presented it yesterday.", "Yesterday conflicts with present perfect; use simple past."],
    ["If they were ready, they submit the report last night.", "If they were ready, they submitted the report last night.", "Past condition with last night needs past verb form."]
  ]
};

const TOPIC_ALIASES = {
  present: "present_tense",
  present_tense: "present_tense",
  past: "past_tense",
  past_tense: "past_tense",
  future: "future_tense",
  future_tense: "future_tense",
  subject_verb_agreement: "subject_verb_agreement",
  subjectverbagreement: "subject_verb_agreement",
  agreement: "subject_verb_agreement",
  questions: "questions",
  question_forms: "questions",
  negatives: "negatives",
  negative_forms: "negatives",
  pronouns: "pronouns",
  conjunctions: "conjunctions",
  tense_consistency: "tense_consistency",
  consistency: "tense_consistency"
};

const XP_BY_DIFFICULTY = {
  rookie: 20,
  field: 30,
  senior: 40
};

function copyQuestion(question) {
  return JSON.parse(JSON.stringify(question));
}

function cleanWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function splitTokens(sentence) {
  return cleanWhitespace(sentence)
    .split(" ")
    .filter(Boolean);
}

function deterministicReorder(tokens, salt) {
  const rows = (tokens || []).slice();
  if (rows.length < 2) return rows;
  const offset = Math.max(1, Math.abs(Number(salt || 1)) % rows.length);
  return rows.slice(offset).concat(rows.slice(0, offset));
}

function firstDiffIndex(leftTokens, rightTokens) {
  const max = Math.max(leftTokens.length, rightTokens.length);
  for (let idx = 0; idx < max; idx += 1) {
    if (leftTokens[idx] !== rightTokens[idx]) return idx;
  }
  return 0;
}

function normalizeDifficulty(value) {
  const raw = String(value || "").toLowerCase().trim();
  if (["rookie", "beginner", "easy"].includes(raw)) return "rookie";
  if (["senior", "advanced", "hard"].includes(raw)) return "senior";
  return "field";
}

function normalizeType(value) {
  const raw = String(value || "").toLowerCase().trim();
  if (raw === "error_correction") return "error_detection";
  if (raw === "mcq") return "multiple_choice";
  if (QUESTION_TYPES.includes(raw)) return raw;
  return "error_detection";
}

function resolveTopicKey(topic) {
  const raw = String(topic || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!raw) return "present_tense";
  if (TOPIC_ALIASES[raw]) return TOPIC_ALIASES[raw];
  if (raw.includes("present")) return "present_tense";
  if (raw.includes("past")) return "past_tense";
  if (raw.includes("future")) return "future_tense";
  if (raw.includes("question")) return "questions";
  if (raw.includes("negative")) return "negatives";
  if (raw.includes("pronoun")) return "pronouns";
  if (raw.includes("conjunction")) return "conjunctions";
  if (raw.includes("consisten")) return "tense_consistency";
  if (raw.includes("subject") || raw.includes("agreement")) return "subject_verb_agreement";
  return TOPICS.includes(raw) ? raw : "present_tense";
}

function createMultipleChoiceOptions(correction, wrongToken) {
  const correct = cleanWhitespace(correction);
  const wrong = cleanWhitespace(wrongToken);
  const options = [correct, wrong, `${correct}ed`, `${wrong}s`]
    .map((entry) => cleanWhitespace(entry))
    .filter(Boolean);
  return Array.from(new Set(options)).slice(0, 4);
}

function buildQuestion(topic, seed, index) {
  const type = normalizeType(seed.type || TYPE_PATTERN[index % TYPE_PATTERN.length]);
  const difficulty = normalizeDifficulty(seed.difficulty || DIFFICULTY_PATTERN[index % DIFFICULTY_PATTERN.length]);
  const incorrectSentence = cleanWhitespace(seed[0]);
  const correctedSentence = cleanWhitespace(seed[1]);
  const explanation = cleanWhitespace(seed[2]);

  const correctedTokens = splitTokens(correctedSentence);
  const incorrectTokens = splitTokens(incorrectSentence);
  const diffIndex = typeof seed.incorrectIndex === "number" ? seed.incorrectIndex : firstDiffIndex(incorrectTokens, correctedTokens);
  const safeIncorrectIndex = Math.max(0, Math.min(diffIndex, Math.max(0, correctedTokens.length - 1)));
  const correction = cleanWhitespace(seed.correction || correctedTokens[safeIncorrectIndex] || correctedTokens[0] || "");

  let sentenceParts = incorrectTokens.length ? incorrectTokens.slice() : correctedTokens.slice();
  if (type === "fill_blank") {
    sentenceParts = correctedTokens.slice();
    sentenceParts[safeIncorrectIndex] = "_____";
  } else if (type === "sentence_builder") {
    sentenceParts = deterministicReorder(correctedTokens, index + topic.length);
  }

  const wrongToken = incorrectTokens[safeIncorrectIndex] || "";
  const options = Array.isArray(seed.options) && seed.options.length
    ? seed.options.map((entry) => String(entry))
    : createMultipleChoiceOptions(correction, wrongToken);

  const promptByType = {
    error_detection: "Click the incorrect word.",
    multiple_choice: "Choose the best correction.",
    fill_blank: "Complete the blank with the best word.",
    sentence_builder: "Arrange the words into the correct sentence."
  };

  const gameModes = {
    error_detection: ["grammar_detective", "error_smash", "speed_challenge"],
    multiple_choice: ["error_smash", "speed_challenge", "ai_quiz", "worksheet"],
    fill_blank: ["speed_challenge", "ai_quiz", "worksheet"],
    sentence_builder: ["sentence_builder", "ai_quiz", "worksheet"]
  };

  return {
    id: `${topic}_${String(index + 1).padStart(3, "0")}`,
    topic,
    difficulty,
    type,
    sentenceParts,
    incorrectIndex: safeIncorrectIndex,
    correction,
    correctedSentence,
    explanation,
    xpReward: XP_BY_DIFFICULTY[difficulty] || 25,
    options,
    prompt: seed.prompt || promptByType[type],
    correctAnswer: correction,
    gameModes: gameModes[type] || ["ai_quiz", "worksheet"]
  };
}

function buildQuestionBank() {
  const rows = [];
  TOPICS.forEach((topic) => {
    const seeds = TOPIC_SEEDS[topic] || [];
    seeds.forEach((seed, index) => rows.push(buildQuestion(topic, seed, index)));
  });
  return rows;
}

const QUESTION_BANK = buildQuestionBank();

function filterByTopic(list, topic) {
  if (!topic) return list;
  const key = resolveTopicKey(topic);
  return list.filter((row) => row.topic === key);
}

function filterByDifficulty(list, difficulty) {
  if (!difficulty) return list;
  const label = normalizeDifficulty(difficulty);
  return list.filter((row) => row.difficulty === label);
}

function filterByType(list, type) {
  if (!type) return list;
  const label = normalizeType(type);
  return list.filter((row) => row.type === label);
}

function shuffle(list) {
  const rows = (list || []).slice();
  for (let idx = rows.length - 1; idx > 0; idx -= 1) {
    const swap = Math.floor(Math.random() * (idx + 1));
    const next = rows[idx];
    rows[idx] = rows[swap];
    rows[swap] = next;
  }
  return rows;
}

function expandToCount(pool, count) {
  const desired = Math.max(0, Number(count || 0));
  if (!desired || !pool.length) return [];
  const randomized = shuffle(pool);
  const out = [];
  let index = 0;
  while (out.length < desired) {
    out.push(copyQuestion(randomized[index % randomized.length]));
    index += 1;
  }
  return out;
}

function getAllQuestions() {
  return QUESTION_BANK.map(copyQuestion);
}

function getQuestionsByTopic(topic) {
  return filterByTopic(QUESTION_BANK, topic).map(copyQuestion);
}

function getQuestionsByDifficulty(difficulty) {
  return filterByDifficulty(QUESTION_BANK, difficulty).map(copyQuestion);
}

function getQuestionsByType(type) {
  return filterByType(QUESTION_BANK, type).map(copyQuestion);
}

function getRandomQuestions(topic, difficulty, count) {
  let pool = QUESTION_BANK.slice();
  pool = filterByTopic(pool, topic);
  const difficultyFiltered = filterByDifficulty(pool, difficulty);
  if (difficultyFiltered.length) pool = difficultyFiltered;
  if (!pool.length) pool = QUESTION_BANK.slice();
  return expandToCount(pool, count || 10);
}

function getQuestionsForGame(gameKey, options = {}) {
  const key = String(gameKey || "").toLowerCase().trim();
  const count = Math.max(1, Number(options.count || 10));
  const topic = options.topic || "";
  const difficulty = options.difficulty || "";

  const preferredTypeByGame = {
    grammar_detective: ["error_detection"],
    error_smash: ["error_detection", "multiple_choice"],
    sentence_builder: ["sentence_builder"],
    speed_challenge: ["multiple_choice", "fill_blank", "error_detection"],
    ai_quiz: QUESTION_TYPES,
    worksheet: QUESTION_TYPES
  };
  const preferred = preferredTypeByGame[key] || QUESTION_TYPES;
  let pool = QUESTION_BANK.slice();
  pool = filterByTopic(pool, topic);
  const withDifficulty = filterByDifficulty(pool, difficulty);
  if (withDifficulty.length) pool = withDifficulty;
  const byType = pool.filter((row) => preferred.includes(row.type));
  const finalPool = byType.length ? byType : pool;
  return expandToCount(finalPool.length ? finalPool : QUESTION_BANK, count);
}

function validateQuestion(question) {
  const required = [
    "id",
    "topic",
    "difficulty",
    "type",
    "sentenceParts",
    "incorrectIndex",
    "correction",
    "correctedSentence",
    "explanation",
    "xpReward"
  ];
  return required.every((key) => typeof question[key] !== "undefined");
}

function getBankStats() {
  const byTopic = {};
  const byType = {};
  const byDifficulty = {};
  QUESTION_BANK.forEach((row) => {
    byTopic[row.topic] = (byTopic[row.topic] || 0) + 1;
    byType[row.type] = (byType[row.type] || 0) + 1;
    byDifficulty[row.difficulty] = (byDifficulty[row.difficulty] || 0) + 1;
  });
  return {
    total: QUESTION_BANK.length,
    byTopic,
    byType,
    byDifficulty
  };
}

const API = {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  TOPICS,
  QUESTION_BANK,
  resolveTopicKey,
  normalizeDifficulty,
  normalizeType,
  getAllQuestions,
  getQuestionsByTopic,
  getQuestionsByDifficulty,
  getQuestionsByType,
  getRandomQuestions,
  getQuestionsForGame,
  validateQuestion,
  getBankStats
};

if (typeof window !== "undefined") {
  window.GSQuestionBank = API;
}

export {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  TOPICS,
  QUESTION_BANK,
  resolveTopicKey,
  normalizeDifficulty,
  normalizeType,
  getAllQuestions,
  getQuestionsByTopic,
  getQuestionsByDifficulty,
  getQuestionsByType,
  getRandomQuestions,
  getQuestionsForGame,
  validateQuestion,
  getBankStats
};

export default API;
