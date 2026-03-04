const ITEM_TARGET = 15;
const GAME_TARGET = 3;

function pad(value) {
  return String(value).padStart(2, "0");
}

function withIds(prefix, rows) {
  return rows.map((row, idx) => ({
    id: `${prefix}_${pad(idx + 1)}`,
    ...row
  }));
}

function tokenizeForBuilder(sentence) {
  return String(sentence || "")
    .replace(/[?.!]/g, "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function scrambleTokens(tokens) {
  const list = tokens.slice();
  if (list.length <= 1) return list;
  const first = list.shift();
  list.push(first);
  if (list.join(" ") === tokens.join(" ")) {
    list.reverse();
  }
  return list;
}

function buildSentenceBuilderItems(prefix, rows, explainFallback) {
  return rows.map((row, idx) => {
    const solution = String(row.solution || "").trim();
    const answerTokens = tokenizeForBuilder(solution);
    return {
      id: `${prefix}_${pad(idx + 1)}`,
      prompt: row.prompt,
      context: row.context || "",
      solution,
      answerTokens,
      bank: row.bank && row.bank.length ? row.bank.slice() : scrambleTokens(answerTokens),
      explain: row.explain || explainFallback
    };
  });
}

function buildSubjectSwitchItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `subject_switch_${pad(idx + 1)}`;
    const singularSubject = row.singularSubject || "The student";
    return {
      id: itemId,
      prompt: `Sort each subject under the correct verb form for "${row.verb}".`,
      columns: [
        { id: "base", label: row.verb },
        { id: "s", label: `${row.verb}s` }
      ],
      cards: [
        { id: `${itemId}_a`, text: `I ___ ${row.tail}.`, columnId: "base" },
        { id: `${itemId}_b`, text: `You ___ ${row.tail}.`, columnId: "base" },
        { id: `${itemId}_c`, text: `We ___ ${row.tail}.`, columnId: "base" },
        { id: `${itemId}_d`, text: `They ___ ${row.tail}.`, columnId: "base" },
        { id: `${itemId}_e`, text: `He ___ ${row.tail}.`, columnId: "s" },
        { id: `${itemId}_f`, text: `She ___ ${row.tail}.`, columnId: "s" },
        { id: `${itemId}_g`, text: `${singularSubject} ___ ${row.tail}.`, columnId: "s" }
      ],
      explain: `Use "${row.verb}" with I/you/we/they. Use "${row.verb}s" with he/she/it.`
    };
  });
}

function buildDoDoesSortItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `do_does_sort_${pad(idx + 1)}`;
    const singularSubject = row.singularSubject || "the student";
    return {
      id: itemId,
      prompt: "Sort each question stem under Do or Does.",
      columns: [
        { id: "do", label: "Do" },
        { id: "does", label: "Does" }
      ],
      cards: [
        { id: `${itemId}_a`, text: `___ I ${row.tail}?`, columnId: "do" },
        { id: `${itemId}_b`, text: `___ you ${row.tail}?`, columnId: "do" },
        { id: `${itemId}_c`, text: `___ we ${row.tail}?`, columnId: "do" },
        { id: `${itemId}_d`, text: `___ they ${row.tail}?`, columnId: "do" },
        { id: `${itemId}_e`, text: `___ he ${row.tail}?`, columnId: "does" },
        { id: `${itemId}_f`, text: `___ she ${row.tail}?`, columnId: "does" },
        { id: `${itemId}_g`, text: `___ ${singularSubject} ${row.tail}?`, columnId: "does" }
      ],
      explain: "Use Do with I/you/we/they. Use Does with he/she/it."
    };
  });
}

function buildWhSwapItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `wh_swap_${pad(idx + 1)}`;
    return {
      id: itemId,
      prompt: "Sort each clue under the best WH word.",
      columns: [
        { id: "what", label: "What" },
        { id: "where", label: "Where" },
        { id: "when", label: "When" },
        { id: "why", label: "Why" },
        { id: "how", label: "How" }
      ],
      cards: [
        { id: `${itemId}_a`, text: row.what, columnId: "what" },
        { id: `${itemId}_b`, text: row.where, columnId: "where" },
        { id: `${itemId}_c`, text: row.when, columnId: "when" },
        { id: `${itemId}_d`, text: row.why, columnId: "why" },
        { id: `${itemId}_e`, text: row.how, columnId: "how" }
      ],
      explain: "WH word + do/does + subject + base verb."
    };
  });
}

function buildAuxSortItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `aux_sort_${pad(idx + 1)}`;
    return {
      id: itemId,
      prompt: "Sort each sentence by the auxiliary family.",
      columns: [
        { id: "be_aux", label: "am / is / are" },
        { id: "do_aux", label: "do / does" }
      ],
      cards: [
        { id: `${itemId}_a`, text: `Are you ${row.ing} now?`, columnId: "be_aux" },
        { id: `${itemId}_b`, text: `Is she ${row.ing} now?`, columnId: "be_aux" },
        { id: `${itemId}_c`, text: `Are they ${row.ing} now?`, columnId: "be_aux" },
        { id: `${itemId}_d`, text: `Do you ${row.base} every day?`, columnId: "do_aux" },
        { id: `${itemId}_e`, text: `Does he ${row.base} every day?`, columnId: "do_aux" },
        { id: `${itemId}_f`, text: `Do they ${row.base} every day?`, columnId: "do_aux" }
      ],
      explain: "Use am/is/are with actions happening now. Use do/does for simple present questions."
    };
  });
}

function buildEdEndingLabItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `ed_lab_${pad(idx + 1)}`;
    return {
      id: itemId,
      prompt: "Sort each verb by its regular past spelling rule.",
      columns: [
        { id: "add_ed", label: "Add -ed" },
        { id: "change_y", label: "Change y to ied" },
        { id: "double_consonant", label: "Double consonant + ed" }
      ],
      cards: [
        { id: `${itemId}_a`, text: row.addEd[0], columnId: "add_ed" },
        { id: `${itemId}_b`, text: row.addEd[1], columnId: "add_ed" },
        { id: `${itemId}_c`, text: row.changeY[0], columnId: "change_y" },
        { id: `${itemId}_d`, text: row.changeY[1], columnId: "change_y" },
        { id: `${itemId}_e`, text: row.doubleConsonant[0], columnId: "double_consonant" },
        { id: `${itemId}_f`, text: row.doubleConsonant[1], columnId: "double_consonant" }
      ],
      explain: "Regular past spelling patterns: add -ed, change y to ied, or double a final consonant + ed."
    };
  });
}

function buildIrregularMatchItems(prefix, rows) {
  return rows.map((row, idx) => {
    const itemId = `${prefix}_${pad(idx + 1)}`;
    const cards = [];
    (row.pairs || []).forEach((pair, pairIdx) => {
      cards.push(
        { id: `${itemId}_b${pairIdx}`, text: pair.base, columnId: "base_form" },
        { id: `${itemId}_p${pairIdx}`, text: pair.past, columnId: "irregular_past" }
      );
    });
    return {
      id: itemId,
      prompt: "Sort each card under base verb or irregular past form.",
      columns: [
        { id: "base_form", label: "Base Verb" },
        { id: "irregular_past", label: "Irregular Past" }
      ],
      cards,
      explain: "Irregular past verbs do not use -ed. Match each base form with its special past form."
    };
  });
}

function buildWasWereSortItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `past_be_sort_${pad(idx + 1)}`;
    const singularSubject = row.singularSubject || "the student";
    return {
      id: itemId,
      prompt: "Sort each subject sentence under was or were.",
      columns: [
        { id: "was", label: "was" },
        { id: "were", label: "were" }
      ],
      cards: [
        { id: `${itemId}_a`, text: `I ___ ${row.tail}.`, columnId: "was" },
        { id: `${itemId}_b`, text: `He ___ ${row.tail}.`, columnId: "was" },
        { id: `${itemId}_c`, text: `She ___ ${row.tail}.`, columnId: "was" },
        { id: `${itemId}_d`, text: `It ___ ${row.tail}.`, columnId: "was" },
        { id: `${itemId}_e`, text: `${singularSubject} ___ ${row.tail}.`, columnId: "was" },
        { id: `${itemId}_f`, text: `You ___ ${row.tail}.`, columnId: "were" },
        { id: `${itemId}_g`, text: `We ___ ${row.tail}.`, columnId: "were" },
        { id: `${itemId}_h`, text: `They ___ ${row.tail}.`, columnId: "were" }
      ],
      explain: "Use was with I/he/she/it. Use were with you/we/they."
    };
  });
}

function buildPastVsActionSortItems(rows) {
  return rows.map((row, idx) => {
    const itemId = `past_mix_sort_${pad(idx + 1)}`;
    return {
      id: itemId,
      prompt: "Sort each action by long background action or short interrupting action.",
      columns: [
        { id: "long_action", label: "Long action (was/were + verb-ing)" },
        { id: "short_action", label: "Interrupting action (simple past)" }
      ],
      cards: [
        { id: `${itemId}_a`, text: row.longActionOne, columnId: "long_action" },
        { id: `${itemId}_b`, text: row.longActionTwo, columnId: "long_action" },
        { id: `${itemId}_c`, text: row.shortActionOne, columnId: "short_action" },
        { id: `${itemId}_d`, text: row.shortActionTwo, columnId: "short_action" }
      ],
      explain: "Use was/were + verb-ing for background actions. Use simple past for the interrupting action."
    };
  });
}

function buildFutureTimeMatchItems(rows) {
  const columns = [
    { id: "tomorrow", label: "tomorrow" },
    { id: "next_week", label: "next week" },
    { id: "next_year", label: "next year" },
    { id: "later", label: "later" },
    { id: "soon", label: "soon" },
    { id: "in_the_future", label: "in the future" },
    { id: "in_two_days", label: "in two days" }
  ];

  return rows.map((row, idx) => {
    const itemId = `future_time_match_${pad(idx + 1)}`;
    return {
      id: itemId,
      prompt: "Sort each clue under the matching future time expression.",
      columns,
      cards: [
        { id: `${itemId}_a`, text: row.tomorrow, columnId: "tomorrow" },
        { id: `${itemId}_b`, text: row.nextWeek, columnId: "next_week" },
        { id: `${itemId}_c`, text: row.nextYear, columnId: "next_year" },
        { id: `${itemId}_d`, text: row.later, columnId: "later" },
        { id: `${itemId}_e`, text: row.soon, columnId: "soon" },
        { id: `${itemId}_f`, text: row.inTheFuture, columnId: "in_the_future" },
        { id: `${itemId}_g`, text: row.inTwoDays, columnId: "in_two_days" }
      ],
      explain: "Future time words help show when an action will happen."
    };
  });
}

const presentContinuousNowOrNot = withIds("pc_now_or_not", [
  {
    prompt: "Choose the best sentence for right now.",
    context: "In science class, Mia ___ the microscope right now.",
    options: [
      "is checking",
      "check",
      "checked",
      "are checking"
    ],
    answerIndex: 0,
    explain: "Mia is one person, so use is + verb-ing."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "At the bus stop, I ___ for my friend now.",
    options: [
      "am waiting",
      "is waiting",
      "wait",
      "waiting"
    ],
    answerIndex: 0,
    explain: "With I, use am + verb-ing."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "In the library, they ___ quietly at this moment.",
    options: [
      "are reading",
      "is reading",
      "read",
      "reads"
    ],
    answerIndex: 0,
    explain: "They takes are + verb-ing."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "During lunch, Ben ___ his sandwich now.",
    options: [
      "is eating",
      "are eating",
      "eats",
      "eat"
    ],
    answerIndex: 0,
    explain: "Ben is singular, so use is eating."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "Near the office, we ___ the volunteer forms now.",
    options: [
      "are sorting",
      "is sorting",
      "sort",
      "sorted"
    ],
    answerIndex: 0,
    explain: "We uses are + verb-ing for actions happening now."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "After school, you ___ with Coach Rivera right now.",
    options: [
      "are talking",
      "is talking",
      "talks",
      "talk"
    ],
    answerIndex: 0,
    explain: "You uses are in present continuous."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "In math, Nora ___ notes now.",
    options: [
      "is copying",
      "are copying",
      "copy",
      "copies"
    ],
    answerIndex: 0,
    explain: "Nora is one person, so use is copying."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "At the cafe, my brother and I ___ tea right now.",
    options: [
      "are drinking",
      "is drinking",
      "drink",
      "drinks"
    ],
    answerIndex: 0,
    explain: "My brother and I is plural, so use are drinking."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "In the hallway, the principal ___ with a parent right now.",
    options: [
      "is speaking",
      "are speaking",
      "speaks",
      "speak"
    ],
    answerIndex: 0,
    explain: "The principal is singular, so use is speaking."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "On the stage, the students ___ for the show now.",
    options: [
      "are practicing",
      "is practicing",
      "practice",
      "practiced"
    ],
    answerIndex: 0,
    explain: "The students is plural, so use are practicing."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "At home, my mom ___ dinner now.",
    options: [
      "is cooking",
      "are cooking",
      "cooks",
      "cook"
    ],
    answerIndex: 0,
    explain: "My mom is singular, so use is cooking."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "In the garden, Dad and Eli ___ the plants now.",
    options: [
      "are watering",
      "is watering",
      "water",
      "waters"
    ],
    answerIndex: 0,
    explain: "Dad and Eli is plural, so use are watering."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "At work, the cashier ___ a customer now.",
    options: [
      "is helping",
      "are helping",
      "help",
      "helps"
    ],
    answerIndex: 0,
    explain: "The cashier is singular, so use is helping."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "In PE, I ___ my shoes now.",
    options: [
      "am tying",
      "is tying",
      "tie",
      "ties"
    ],
    answerIndex: 0,
    explain: "Use am with I."
  },
  {
    prompt: "Choose the best sentence for right now.",
    context: "At the station, the buses ___ in now.",
    options: [
      "are coming",
      "is coming",
      "come",
      "comes"
    ],
    answerIndex: 0,
    explain: "The buses is plural, so use are coming."
  }
]);

const presentContinuousBuilder = buildSentenceBuilderItems(
  "pc_builder",
  [
    { prompt: "Build the status update.", solution: "I am carrying the art folders right now." },
    { prompt: "Build the status update.", solution: "She is writing a lab report now." },
    { prompt: "Build the status update.", solution: "They are playing chess in the club room." },
    { prompt: "Build the status update.", solution: "We are cleaning the table after lunch." },
    { prompt: "Build the status update.", solution: "He is checking the class website now." },
    { prompt: "Build the status update.", solution: "You are studying for the quiz tonight." },
    { prompt: "Build the status update.", solution: "The nurse is calling the next student now." },
    { prompt: "Build the status update.", solution: "My friends are waiting outside the gym." },
    { prompt: "Build the status update.", solution: "I am washing dishes after dinner." },
    { prompt: "Build the status update.", solution: "The team is practicing in the field now." },
    { prompt: "Build the status update.", solution: "Our teacher is explaining the homework now." },
    { prompt: "Build the status update.", solution: "The barista is making iced tea now." },
    { prompt: "Build the status update.", solution: "We are walking to the bus stop now." },
    { prompt: "Build the status update.", solution: "Rina is texting her cousin now." },
    { prompt: "Build the status update.", solution: "The dogs are barking at the mail truck now." }
  ],
  "Use subject + am/is/are + verb-ing."
);

const presentContinuousErrorSpotter = withIds("pc_bug_fix", [
  {
    prompt: "Fix one grammar bug.",
    sentence: "She are reading near the window now.",
    correction: "She is reading near the window now.",
    explain: "She takes is, not are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "They is working on the poster now.",
    correction: "They are working on the poster now.",
    explain: "They takes are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "I is packing my backpack now.",
    correction: "I am packing my backpack now.",
    explain: "I takes am."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "We am checking the schedule now.",
    correction: "We are checking the schedule now.",
    explain: "We takes are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "He are talking to the counselor now.",
    correction: "He is talking to the counselor now.",
    explain: "He takes is."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "You is standing by the door now.",
    correction: "You are standing by the door now.",
    explain: "You takes are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "The coach am blowing the whistle now.",
    correction: "The coach is blowing the whistle now.",
    explain: "The coach is singular, so use is."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "My sister are doing her homework now.",
    correction: "My sister is doing her homework now.",
    explain: "My sister takes is."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "The students am lining up now.",
    correction: "The students are lining up now.",
    explain: "The students is plural, so use are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "Dad are driving to work now.",
    correction: "Dad is driving to work now.",
    explain: "Dad takes is."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "The servers is fixing the computer now.",
    correction: "The servers are fixing the computer now.",
    explain: "The servers is plural, so use are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "I are looking for my ID now.",
    correction: "I am looking for my ID now.",
    explain: "I takes am."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "The baby are sleeping now.",
    correction: "The baby is sleeping now.",
    explain: "The baby takes is."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "We is waiting for the bus now.",
    correction: "We are waiting for the bus now.",
    explain: "We takes are."
  },
  {
    prompt: "Fix one grammar bug.",
    sentence: "The artist am painting a mural now.",
    correction: "The artist is painting a mural now.",
    explain: "The artist takes is."
  }
]);

const simplePresentHabitMatch = withIds("sp_habit_match", [
  {
    prompt: "Choose the best habit sentence.",
    context: "Every morning, I ___ my bed before school.",
    options: ["make", "makes", "made", "am making"],
    answerIndex: 0,
    explain: "Use base verb with I."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "On Mondays, she ___ the class agenda.",
    options: ["post", "posts", "posted", "is posting"],
    answerIndex: 1,
    explain: "She takes verb + s in simple present."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "They ___ soccer after homework.",
    options: ["plays", "play", "are playing", "played"],
    answerIndex: 1,
    explain: "They takes base verb."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "My dad ___ coffee at 6:00 AM.",
    options: ["drink", "drinks", "drank", "is drinking"],
    answerIndex: 1,
    explain: "My dad is singular, so add s."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "We ___ the bus to campus.",
    options: ["takes", "take", "are taking", "took"],
    answerIndex: 1,
    explain: "Use base verb with we."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "The librarian ___ new books on Fridays.",
    options: ["adds", "add", "adding", "added"],
    answerIndex: 0,
    explain: "The librarian is singular, so add s."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "You ___ clear notes in science.",
    options: ["takes", "take", "taking", "took"],
    answerIndex: 1,
    explain: "Use base verb with you."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "Omar ___ his little brother each afternoon.",
    options: ["help", "helps", "helping", "helped"],
    answerIndex: 1,
    explain: "Omar is singular, so use helps."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "The bakery ___ fresh bread daily.",
    options: ["bake", "bakes", "baking", "baked"],
    answerIndex: 1,
    explain: "The bakery takes verb + s."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "I ___ my keys in the same pocket.",
    options: ["keeps", "keep", "keeping", "kept"],
    answerIndex: 1,
    explain: "Use base verb with I."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "Our principal ___ every classroom each week.",
    options: ["visit", "visits", "visiting", "visited"],
    answerIndex: 1,
    explain: "Our principal is singular, so add s."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "The students ___ their badges at the gate.",
    options: ["shows", "show", "showing", "showed"],
    answerIndex: 1,
    explain: "The students is plural, so use base verb."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "Mia ___ piano after dinner.",
    options: ["practice", "practices", "practicing", "practiced"],
    answerIndex: 1,
    explain: "Mia is singular, so add s."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "We ___ spelling words on Tuesdays.",
    options: ["reviews", "review", "reviewing", "reviewed"],
    answerIndex: 1,
    explain: "Use base verb with we."
  },
  {
    prompt: "Choose the best habit sentence.",
    context: "The train ___ at 7:10 every morning.",
    options: ["arrive", "arrives", "arriving", "arrived"],
    answerIndex: 1,
    explain: "The train is singular, so use arrives."
  }
]);

const simplePresentBuilder = buildSentenceBuilderItems(
  "sp_builder",
  [
    { prompt: "Build the routine sentence.", solution: "I pack my lunch every night." },
    { prompt: "Build the routine sentence.", solution: "She checks the weather before school." },
    { prompt: "Build the routine sentence.", solution: "They finish homework before dinner." },
    { prompt: "Build the routine sentence.", solution: "We read for twenty minutes at home." },
    { prompt: "Build the routine sentence.", solution: "He drives to work at sunrise." },
    { prompt: "Build the routine sentence.", solution: "You clean your desk after class." },
    { prompt: "Build the routine sentence.", solution: "The coach starts practice at four." },
    { prompt: "Build the routine sentence.", solution: "My friends study in the library on Fridays." },
    { prompt: "Build the routine sentence.", solution: "I wash my water bottle every day." },
    { prompt: "Build the routine sentence.", solution: "Ravi calls his grandmother every Sunday." },
    { prompt: "Build the routine sentence.", solution: "The shop opens at nine each morning." },
    { prompt: "Build the routine sentence.", solution: "We share ideas during group work." },
    { prompt: "Build the routine sentence.", solution: "Lina writes in her journal every night." },
    { prompt: "Build the routine sentence.", solution: "The bus stops near our block." },
    { prompt: "Build the routine sentence.", solution: "Teachers plan lessons on weekends." }
  ],
  "Use base verb with I/you/we/they and verb + s with he/she/it."
);

const subjectSwitchItems = buildSubjectSwitchItems([
  { verb: "play", tail: "soccer after school", singularSubject: "The coach" },
  { verb: "watch", tail: "science videos at home", singularSubject: "The intern" },
  { verb: "carry", tail: "notebooks to class", singularSubject: "The office aide" },
  { verb: "wash", tail: "dishes after dinner", singularSubject: "The chef" },
  { verb: "read", tail: "news updates each morning", singularSubject: "The reporter" },
  { verb: "drive", tail: "to work at six", singularSubject: "The manager" },
  { verb: "study", tail: "English on Tuesdays", singularSubject: "The tutor" },
  { verb: "cook", tail: "rice for lunch", singularSubject: "The parent" },
  { verb: "walk", tail: "to the bus stop", singularSubject: "The guard" },
  { verb: "check", tail: "email before class", singularSubject: "The teacher" },
  { verb: "practice", tail: "guitar in the evening", singularSubject: "The musician" },
  { verb: "paint", tail: "posters for events", singularSubject: "The designer" },
  { verb: "help", tail: "neighbors on weekends", singularSubject: "The volunteer" },
  { verb: "open", tail: "the store at nine", singularSubject: "The owner" },
  { verb: "close", tail: "windows before bedtime", singularSubject: "The custodian" }
]);

const yesNoQuestionMc = withIds("yes_no_mc", [
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ you play chess after class?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 0,
    explain: "Use Do with you."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ she ride the bus to school?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 1,
    explain: "Use Does with she."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ they live near the park?",
    options: ["Does", "Do", "Is", "Are"],
    answerIndex: 1,
    explain: "Use Do with they."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ he need a calculator today?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Use Does with he."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ we have practice tomorrow?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 0,
    explain: "Use Do with we."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ your brother work at the cafe?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 1,
    explain: "Your brother is singular, so use Does."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ I submit this form online?",
    options: ["Does", "Do", "Am", "Is"],
    answerIndex: 1,
    explain: "Use Do with I."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ the students wear IDs at school?",
    options: ["Does", "Do", "Is", "Are"],
    answerIndex: 1,
    explain: "The students is plural, so use Do."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ Ms. Lee teach science this year?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Ms. Lee is singular, so use Does."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ your friends like the new game?",
    options: ["Does", "Do", "Is", "Are"],
    answerIndex: 1,
    explain: "Your friends is plural, so use Do."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ the manager open at eight?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "The manager is singular, so use Does."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ we bring notebooks every day?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 0,
    explain: "Use Do with we."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ she call her grandmother on Sundays?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Use Does with she."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ the buses stop here at night?",
    options: ["Does", "Do", "Is", "Are"],
    answerIndex: 1,
    explain: "The buses is plural, so use Do."
  },
  {
    prompt: "Pick the correct yes/no question.",
    context: "___ your dad drive to work early?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Your dad is singular, so use Does."
  }
]);

const yesNoBuilder = buildSentenceBuilderItems(
  "yes_no_builder",
  [
    { prompt: "Build the yes/no question.", solution: "Do you study after school?" },
    { prompt: "Build the yes/no question.", solution: "Does she play volleyball on Fridays?" },
    { prompt: "Build the yes/no question.", solution: "Do they bring lunch from home?" },
    { prompt: "Build the yes/no question.", solution: "Does he wash the car on weekends?" },
    { prompt: "Build the yes/no question.", solution: "Do we need permission for this trip?" },
    { prompt: "Build the yes/no question.", solution: "Does your sister read before bed?" },
    { prompt: "Build the yes/no question.", solution: "Do I sign this paper here?" },
    { prompt: "Build the yes/no question.", solution: "Does the teacher post grades online?" },
    { prompt: "Build the yes/no question.", solution: "Do your friends walk to campus?" },
    { prompt: "Build the yes/no question.", solution: "Does the cafe serve breakfast all day?" },
    { prompt: "Build the yes/no question.", solution: "Do students wear uniforms at your school?" },
    { prompt: "Build the yes/no question.", solution: "Does Maya check her email at night?" },
    { prompt: "Build the yes/no question.", solution: "Do we start class at eight?" },
    { prompt: "Build the yes/no question.", solution: "Does the bus arrive on time?" },
    { prompt: "Build the yes/no question.", solution: "Do they practice with the team tonight?" }
  ],
  "Use Do/Does + subject + base verb."
);

const doDoesSortItems = buildDoDoesSortItems([
  { tail: "like spicy noodles", singularSubject: "your brother" },
  { tail: "need extra help after class", singularSubject: "the coach" },
  { tail: "walk to school together", singularSubject: "the manager" },
  { tail: "work on Saturdays", singularSubject: "your cousin" },
  { tail: "watch the morning news", singularSubject: "the nurse" },
  { tail: "carry laptops to class", singularSubject: "the intern" },
  { tail: "eat breakfast at home", singularSubject: "your mom" },
  { tail: "play soccer on Sundays", singularSubject: "the captain" },
  { tail: "study in the library", singularSubject: "your teacher" },
  { tail: "call their cousins often", singularSubject: "your dad" },
  { tail: "take the late bus", singularSubject: "the student leader" },
  { tail: "wash the dishes at night", singularSubject: "the chef" },
  { tail: "open the shop at nine", singularSubject: "the owner" },
  { tail: "finish homework before dinner", singularSubject: "the tutor" },
  { tail: "speak English at work", singularSubject: "the mechanic" }
]);

const whQuestionMc = withIds("wh_mc", [
  {
    prompt: "Pick the correct WH question.",
    context: "Ask about locker location.",
    options: [
      "Where do the new students keep their bags?",
      "Where does the new students keep their bags?",
      "Where are the new students keep their bags?",
      "Where do the new students keeps their bags?"
    ],
    answerIndex: 0,
    explain: "Use Where + do + plural subject + base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask about bus arrival time.",
    options: [
      "When do the bus arrive at school?",
      "When does the bus arrive at school?",
      "When is the bus arrive at school?",
      "When does the bus arrives at school?"
    ],
    answerIndex: 1,
    explain: "Use does with singular subject and base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask why the team practices indoors.",
    options: [
      "Why do the team practice indoors today?",
      "Why does the team practice indoors today?",
      "Why does the team practices indoors today?",
      "Why is the team practice indoors today?"
    ],
    answerIndex: 1,
    explain: "The team is singular, so use does + base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask what Maya eats for breakfast.",
    options: [
      "What do Maya eat for breakfast?",
      "What does Maya eat for breakfast?",
      "What does Maya eats for breakfast?",
      "What is Maya eat for breakfast?"
    ],
    answerIndex: 1,
    explain: "Use does + Maya + base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask how they travel to work.",
    options: [
      "How do they travel to work?",
      "How does they travel to work?",
      "How are they travel to work?",
      "How do they travels to work?"
    ],
    answerIndex: 0,
    explain: "Use do with they."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask where your brother studies after class.",
    options: [
      "Where do your brother study after class?",
      "Where does your brother study after class?",
      "Where does your brother studies after class?",
      "Where is your brother study after class?"
    ],
    answerIndex: 1,
    explain: "Your brother is singular, so use does."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask when we submit lab reports.",
    options: [
      "When do we submit lab reports?",
      "When does we submit lab reports?",
      "When are we submit lab reports?",
      "When do we submits lab reports?"
    ],
    answerIndex: 0,
    explain: "Use do with we."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask why she checks the weather app.",
    options: [
      "Why do she check the weather app?",
      "Why does she check the weather app?",
      "Why does she checks the weather app?",
      "Why is she check the weather app?"
    ],
    answerIndex: 1,
    explain: "Use does + she + base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask what students read in English class.",
    options: [
      "What do the students read in English class?",
      "What does the students read in English class?",
      "What do the students reads in English class?",
      "What are the students read in English class?"
    ],
    answerIndex: 0,
    explain: "Use do with plural subject."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask how the nurse tracks appointments.",
    options: [
      "How do the nurse track appointments?",
      "How does the nurse track appointments?",
      "How does the nurse tracks appointments?",
      "How is the nurse track appointments?"
    ],
    answerIndex: 1,
    explain: "The nurse is singular, so use does."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask where I park my bike.",
    options: [
      "Where does I park my bike?",
      "Where do I park my bike?",
      "Where am I park my bike?",
      "Where do I parks my bike?"
    ],
    answerIndex: 1,
    explain: "Use do with I."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask when the movie club meets.",
    options: [
      "When do the movie club meet?",
      "When does the movie club meet?",
      "When does the movie club meets?",
      "When is the movie club meet?"
    ],
    answerIndex: 1,
    explain: "Use does + singular subject + base verb."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask why you bring a water bottle.",
    options: [
      "Why does you bring a water bottle?",
      "Why do you bring a water bottle?",
      "Why are you bring a water bottle?",
      "Why do you brings a water bottle?"
    ],
    answerIndex: 1,
    explain: "Use do with you."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask what he cooks on weekends.",
    options: [
      "What do he cook on weekends?",
      "What does he cook on weekends?",
      "What does he cooks on weekends?",
      "What is he cook on weekends?"
    ],
    answerIndex: 1,
    explain: "Use does with he."
  },
  {
    prompt: "Pick the correct WH question.",
    context: "Ask how we get to the museum.",
    options: [
      "How does we get to the museum?",
      "How do we get to the museum?",
      "How are we get to the museum?",
      "How do we gets to the museum?"
    ],
    answerIndex: 1,
    explain: "Use do + we + base verb."
  }
]);

const whBuilder = buildSentenceBuilderItems(
  "wh_builder",
  [
    { prompt: "Build the WH question.", solution: "Where do they play after school?" },
    { prompt: "Build the WH question.", solution: "When does she start her shift?" },
    { prompt: "Build the WH question.", solution: "Why do you carry two notebooks?" },
    { prompt: "Build the WH question.", solution: "What does he study at college?" },
    { prompt: "Build the WH question.", solution: "How do we join the club?" },
    { prompt: "Build the WH question.", solution: "Where does your family eat on Fridays?" },
    { prompt: "Build the WH question.", solution: "When do buses leave this station?" },
    { prompt: "Build the WH question.", solution: "Why does Maya call her cousin nightly?" },
    { prompt: "Build the WH question.", solution: "What do students need for art class?" },
    { prompt: "Build the WH question.", solution: "How does the chef prepare rice?" },
    { prompt: "Build the WH question.", solution: "Where do I turn in this form?" },
    { prompt: "Build the WH question.", solution: "When does the store close on Sundays?" },
    { prompt: "Build the WH question.", solution: "Why do they wear badges at work?" },
    { prompt: "Build the WH question.", solution: "What does your brother fix at the shop?" },
    { prompt: "Build the WH question.", solution: "How do we solve this problem?" }
  ],
  "Use WH word + do/does + subject + base verb."
);

const whSwapItems = buildWhSwapItems([
  {
    what: "___ do you pack for art class?",
    where: "___ do they park their bikes?",
    when: "___ does the bus arrive?",
    why: "___ do we review notes tonight?",
    how: "___ do you get to work?"
  },
  {
    what: "___ does she eat for lunch?",
    where: "___ do your cousins live?",
    when: "___ do classes begin?",
    why: "___ does he check his planner?",
    how: "___ do they solve this puzzle?"
  },
  {
    what: "___ do students need for lab day?",
    where: "___ does Maya study after school?",
    when: "___ do we submit this form?",
    why: "___ do you carry two pens?",
    how: "___ does the nurse track visits?"
  },
  {
    what: "___ does the chef cook on Fridays?",
    where: "___ do we meet for practice?",
    when: "___ does your shift end?",
    why: "___ does she call her grandmother?",
    how: "___ do you open this app?"
  },
  {
    what: "___ do they watch in media class?",
    where: "___ does the train stop?",
    when: "___ do I pay the fee?",
    why: "___ do we wear badges here?",
    how: "___ does he fix the printer?"
  },
  {
    what: "___ does your brother collect?",
    where: "___ do the interns sit?",
    when: "___ does school end today?",
    why: "___ do they ask that question?",
    how: "___ do you pronounce this word?"
  },
  {
    what: "___ do you bring to the picnic?",
    where: "___ does she keep her keys?",
    when: "___ do buses leave this station?",
    why: "___ does he practice every day?",
    how: "___ do we sign in online?"
  },
  {
    what: "___ does the class read in English?",
    where: "___ do your parents work?",
    when: "___ do we call the office?",
    why: "___ do they study in groups?",
    how: "___ does she get home?"
  },
  {
    what: "___ do they build in robotics club?",
    where: "___ does your friend buy snacks?",
    when: "___ does lunch period start?",
    why: "___ do we recycle bottles?",
    how: "___ do you tie this knot?"
  },
  {
    what: "___ does he draw in art class?",
    where: "___ do we turn in homework?",
    when: "___ do your games begin?",
    why: "___ does she take notes?",
    how: "___ do they prepare for tests?"
  },
  {
    what: "___ do we need for the trip?",
    where: "___ does the manager store files?",
    when: "___ do they clean the lab?",
    why: "___ do you save your drafts?",
    how: "___ does he cook rice?"
  },
  {
    what: "___ does your team practice?",
    where: "___ do these students wait?",
    when: "___ do we start warm-ups?",
    why: "___ does she leave early?",
    how: "___ do they send reports?"
  },
  {
    what: "___ do you read before bed?",
    where: "___ does your class meet?",
    when: "___ do buses run on weekends?",
    why: "___ do we lock the doors?",
    how: "___ does she solve that equation?"
  },
  {
    what: "___ does the bakery sell daily?",
    where: "___ do your keys belong?",
    when: "___ do we submit projects?",
    why: "___ does he carry a map?",
    how: "___ do they train new staff?"
  },
  {
    what: "___ do students wear on field day?",
    where: "___ does your uncle teach?",
    when: "___ do we board the train?",
    why: "___ do they check the weather?",
    how: "___ does she organize her files?"
  }
]);

const auxiliaryIdMc = withIds("aux_id", [
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ she studying for the test right now?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 2,
    explain: "Use is for present continuous with she."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ you play soccer after class?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 0,
    explain: "Use do for simple present questions with you."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ they waiting outside now?",
    options: ["Is", "Are", "Do", "Does"],
    answerIndex: 1,
    explain: "Use are with plural subject in present continuous."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ he work at the bookstore?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Use does with he for simple present questions."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ I carrying the right folder now?",
    options: ["Do", "Am", "Is", "Does"],
    answerIndex: 1,
    explain: "Use am with I in present continuous."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ we have math on Mondays?",
    options: ["Are", "Do", "Is", "Does"],
    answerIndex: 1,
    explain: "Use do with we for habits."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ the students listening now?",
    options: ["Do", "Does", "Are", "Is"],
    answerIndex: 2,
    explain: "Use are with plural subject + verb-ing."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ your sister drive to work?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Use does with singular subject."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ the baby sleeping now?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 2,
    explain: "Use is with singular subject + verb-ing."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ they need badges here?",
    options: ["Are", "Do", "Does", "Is"],
    answerIndex: 1,
    explain: "Use do with they in simple present questions."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ the coach giving instructions now?",
    options: ["Do", "Is", "Are", "Does"],
    answerIndex: 1,
    explain: "The coach is singular, so use is + verb-ing."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ you and Ben coming with us now?",
    options: ["Is", "Are", "Do", "Does"],
    answerIndex: 1,
    explain: "You and Ben is plural, so use are."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ Maya read before bed?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 1,
    explain: "Use does for singular subject in simple present questions."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ we meeting in room 12 now?",
    options: ["Do", "Does", "Is", "Are"],
    answerIndex: 3,
    explain: "Use are + verb-ing with we."
  },
  {
    prompt: "Choose the correct auxiliary.",
    context: "___ I submit this online each week?",
    options: ["Do", "Am", "Is", "Does"],
    answerIndex: 0,
    explain: "Use do with I in simple present questions."
  }
]);

const auxiliaryErrorSpotter = withIds("aux_bug", [
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Do she study at night?",
    correction: "Does she study at night?",
    explain: "Use does with she."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Are he working now?",
    correction: "Is he working now?",
    explain: "Use is with he."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Is they playing outside now?",
    correction: "Are they playing outside now?",
    explain: "Use are with they."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Does you take the bus every day?",
    correction: "Do you take the bus every day?",
    explain: "Use do with you."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Do Maya reading now?",
    correction: "Is Maya reading now?",
    explain: "Use is with singular subject + verb-ing."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Am they waiting near the office?",
    correction: "Are they waiting near the office?",
    explain: "Use are with they."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Are your brother work here?",
    correction: "Does your brother work here?",
    explain: "Use does for simple present question with singular subject."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Does we need this form?",
    correction: "Do we need this form?",
    explain: "Use do with we."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Is you carrying the files now?",
    correction: "Are you carrying the files now?",
    explain: "Use are with you."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Are she calling her mom tonight?",
    correction: "Is she calling her mom tonight?",
    explain: "Use is with she."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Do the teacher post grades weekly?",
    correction: "Does the teacher post grades weekly?",
    explain: "Use does with singular subject."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Does they practice after school?",
    correction: "Do they practice after school?",
    explain: "Use do with they."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Am I take this class now?",
    correction: "Do I take this class now?",
    explain: "Use do for simple present question."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Do she working in the lab now?",
    correction: "Is she working in the lab now?",
    explain: "Present continuous needs is + verb-ing."
  },
  {
    prompt: "Fix one auxiliary error.",
    sentence: "Is we meeting after lunch?",
    correction: "Are we meeting after lunch?",
    explain: "Use are with we."
  }
]);

const auxSortItems = buildAuxSortItems([
  { base: "read the instructions", ing: "reading the instructions" },
  { base: "pack lunch at home", ing: "packing lunch at home" },
  { base: "check email before class", ing: "checking email before class" },
  { base: "practice piano after dinner", ing: "practicing piano after dinner" },
  { base: "watch the morning news", ing: "watching the morning news" },
  { base: "clean the lab table", ing: "cleaning the lab table" },
  { base: "drive to work early", ing: "driving to work early" },
  { base: "walk to school together", ing: "walking to school together" },
  { base: "call their parents nightly", ing: "calling their parents nightly" },
  { base: "carry ID badges", ing: "carrying ID badges" },
  { base: "open the store at nine", ing: "opening the store at nine" },
  { base: "close the gate at dusk", ing: "closing the gate at dusk" },
  { base: "study grammar online", ing: "studying grammar online" },
  { base: "cook dinner at home", ing: "cooking dinner at home" },
  { base: "play chess after school", ing: "playing chess after school" }
]);

const regularPastYesterdayFile = withIds("past_reg_mc", [
  {
    prompt: "Choose the best simple past sentence.",
    context: "Yesterday, she ___ her cousin after school.",
    options: ["visited", "visit", "visits", "visiting"],
    answerIndex: 0,
    explain: "Use regular past verb + ed for finished actions."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last night, we ___ the kitchen after dinner.",
    options: ["cleaned", "clean", "cleans", "cleaning"],
    answerIndex: 0,
    explain: "The action finished last night, so use cleaned."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "After class, he ___ for the grammar quiz.",
    options: ["studied", "study", "studies", "studying"],
    answerIndex: 0,
    explain: "Use studied for a finished past action."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "On Saturday, they ___ boxes into the storage room.",
    options: ["carried", "carry", "carries", "carrying"],
    answerIndex: 0,
    explain: "They carried the boxes in the past."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last week, I ___ chess with my uncle.",
    options: ["played", "play", "plays", "playing"],
    answerIndex: 0,
    explain: "Use played for last week."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Yesterday evening, Maya ___ a movie with her sister.",
    options: ["watched", "watch", "watches", "watching"],
    answerIndex: 0,
    explain: "Yesterday evening signals simple past."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "This morning, the club ___ the lab early.",
    options: ["opened", "open", "opens", "opening"],
    answerIndex: 0,
    explain: "The finished action uses opened."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last month, Dad ___ the fence behind the house.",
    options: ["painted", "paint", "paints", "painting"],
    answerIndex: 0,
    explain: "Use painted for a completed past action."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Yesterday, the team ___ the uniforms before practice.",
    options: ["washed", "wash", "washes", "washing"],
    answerIndex: 0,
    explain: "Yesterday requires simple past."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last night, you ___ your aunt after dinner.",
    options: ["called", "call", "calls", "calling"],
    answerIndex: 0,
    explain: "Use called for finished action in the past."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Yesterday afternoon, I ___ to the library.",
    options: ["walked", "walk", "walks", "walking"],
    answerIndex: 0,
    explain: "Use walked with yesterday afternoon."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "On Sunday, my mom ___ soup for lunch.",
    options: ["cooked", "cook", "cooks", "cooking"],
    answerIndex: 0,
    explain: "Use cooked for a completed Sunday action."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last period, we ___ to a short podcast.",
    options: ["listened", "listen", "listens", "listening"],
    answerIndex: 0,
    explain: "Last period means finished, so use listened."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Yesterday, the class ___ the poster before lunch.",
    options: ["finished", "finish", "finishes", "finishing"],
    answerIndex: 0,
    explain: "Use finished for completed action."
  },
  {
    prompt: "Choose the best simple past sentence.",
    context: "Last Friday, she ___ a laptop from the office.",
    options: ["borrowed", "borrow", "borrows", "borrowing"],
    answerIndex: 0,
    explain: "Use borrowed because the action is done."
  }
]);

const regularPastBuilder = buildSentenceBuilderItems(
  "past_reg_builder",
  [
    { prompt: "Build the past sentence.", solution: "I cleaned my desk after class." },
    { prompt: "Build the past sentence.", solution: "She visited her cousin on Sunday." },
    { prompt: "Build the past sentence.", solution: "They watched a movie last night." },
    { prompt: "Build the past sentence.", solution: "We cooked rice for dinner." },
    { prompt: "Build the past sentence.", solution: "He played soccer after school." },
    { prompt: "Build the past sentence.", solution: "You called your friend after practice." },
    { prompt: "Build the past sentence.", solution: "The class started at eight this morning." },
    { prompt: "Build the past sentence.", solution: "My sister carried the books upstairs." },
    { prompt: "Build the past sentence.", solution: "I listened to the coach yesterday." },
    { prompt: "Build the past sentence.", solution: "The team finished warmups before lunch." },
    { prompt: "Build the past sentence.", solution: "Dad washed the car on Saturday." },
    { prompt: "Build the past sentence.", solution: "The nurse checked my name at the desk." },
    { prompt: "Build the past sentence.", solution: "We painted posters for the science fair." },
    { prompt: "Build the past sentence.", solution: "Maya borrowed my notes yesterday." },
    { prompt: "Build the past sentence.", solution: "The bus arrived early this morning." }
  ],
  "Use regular verb + ed for finished past actions."
);

const edEndingLabItems = buildEdEndingLabItems([
  {
    addEd: ["visit", "clean"],
    changeY: ["study", "carry"],
    doubleConsonant: ["stop", "plan"]
  },
  {
    addEd: ["open", "wash"],
    changeY: ["try", "copy"],
    doubleConsonant: ["drop", "grab"]
  },
  {
    addEd: ["paint", "listen"],
    changeY: ["hurry", "worry"],
    doubleConsonant: ["clap", "skip"]
  },
  {
    addEd: ["start", "help"],
    changeY: ["dry", "reply"],
    doubleConsonant: ["nod", "tap"]
  },
  {
    addEd: ["watch", "call"],
    changeY: ["marry", "tidy"],
    doubleConsonant: ["jog", "rub"]
  },
  {
    addEd: ["cook", "check"],
    changeY: ["apply", "bury"],
    doubleConsonant: ["slip", "trip"]
  },
  {
    addEd: ["walk", "answer"],
    changeY: ["cry", "fry"],
    doubleConsonant: ["drag", "slam"]
  },
  {
    addEd: ["play", "rain"],
    changeY: ["spy", "identify"],
    doubleConsonant: ["hop", "shop"]
  },
  {
    addEd: ["open", "close"],
    changeY: ["occupy", "study"],
    doubleConsonant: ["drip", "chat"]
  },
  {
    addEd: ["call", "visit"],
    changeY: ["worry", "hurry"],
    doubleConsonant: ["pin", "slip"]
  },
  {
    addEd: ["paint", "wash"],
    changeY: ["dry", "reply"],
    doubleConsonant: ["grab", "stop"]
  },
  {
    addEd: ["check", "help"],
    changeY: ["carry", "marry"],
    doubleConsonant: ["clap", "nod"]
  },
  {
    addEd: ["listen", "open"],
    changeY: ["tidy", "copy"],
    doubleConsonant: ["jog", "drop"]
  },
  {
    addEd: ["walk", "call"],
    changeY: ["try", "cry"],
    doubleConsonant: ["plan", "rub"]
  },
  {
    addEd: ["start", "watch"],
    changeY: ["bury", "fry"],
    doubleConsonant: ["hop", "tap"]
  }
]);

const irregularIdMc = withIds("past_irregular_mc", [
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday, he ___ home after practice.",
    options: ["went", "goed", "go", "goes"],
    answerIndex: 0,
    explain: "The past of go is went."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last night, I ___ noodles for dinner.",
    options: ["ate", "eated", "eat", "eats"],
    answerIndex: 0,
    explain: "The past of eat is ate."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "At the game, we ___ our English teacher.",
    options: ["saw", "seed", "see", "sees"],
    answerIndex: 0,
    explain: "The past of see is saw."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday, she ___ a long email to her coach.",
    options: ["wrote", "writed", "write", "writes"],
    answerIndex: 0,
    explain: "The past of write is wrote."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last weekend, they ___ the train downtown.",
    options: ["took", "taked", "take", "takes"],
    answerIndex: 0,
    explain: "The past of take is took."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday morning, Maya ___ her friend a note.",
    options: ["gave", "gived", "give", "gives"],
    answerIndex: 0,
    explain: "The past of give is gave."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last night, we ___ the missing key in the kitchen.",
    options: ["found", "finded", "find", "finds"],
    answerIndex: 0,
    explain: "The past of find is found."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday, Dad ___ new batteries at the store.",
    options: ["bought", "buyed", "buy", "buys"],
    answerIndex: 0,
    explain: "The past of buy is bought."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "In class, he ___ clearly during the presentation.",
    options: ["spoke", "speaked", "speak", "speaks"],
    answerIndex: 0,
    explain: "The past of speak is spoke."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last week, they ___ a robot model in science.",
    options: ["made", "maked", "make", "makes"],
    answerIndex: 0,
    explain: "The past of make is made."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday evening, I ___ hot tea at home.",
    options: ["drank", "drinked", "drink", "drinks"],
    answerIndex: 0,
    explain: "The past of drink is drank."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last Friday, she ___ to practice late.",
    options: ["came", "comed", "come", "comes"],
    answerIndex: 0,
    explain: "The past of come is came."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday, we ___ to the museum before lunch.",
    options: ["drove", "drived", "drive", "drives"],
    answerIndex: 0,
    explain: "The past of drive is drove."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Last night, the glass ___ in the sink.",
    options: ["broke", "breaked", "break", "breaks"],
    answerIndex: 0,
    explain: "The past of break is broke."
  },
  {
    prompt: "Choose the correct irregular past verb.",
    context: "Yesterday, you ___ the blue folder.",
    options: ["chose", "choosed", "choose", "chooses"],
    answerIndex: 0,
    explain: "The past of choose is chose."
  }
]);

const irregularVerbPairs = [
  { base: "go", past: "went" },
  { base: "eat", past: "ate" },
  { base: "see", past: "saw" },
  { base: "write", past: "wrote" },
  { base: "take", past: "took" },
  { base: "give", past: "gave" },
  { base: "find", past: "found" },
  { base: "buy", past: "bought" },
  { base: "speak", past: "spoke" },
  { base: "make", past: "made" },
  { base: "drink", past: "drank" },
  { base: "come", past: "came" },
  { base: "drive", past: "drove" },
  { base: "break", past: "broke" },
  { base: "choose", past: "chose" },
  { base: "bring", past: "brought" },
  { base: "run", past: "ran" },
  { base: "sing", past: "sang" },
  { base: "sit", past: "sat" },
  { base: "sleep", past: "slept" }
];

const irregularMatchItems = buildIrregularMatchItems(
  "past_irregular_match",
  Array.from({ length: ITEM_TARGET }, (_, idx) => ({
    pairs: [0, 1, 2, 3].map((offset) => irregularVerbPairs[(idx + offset) % irregularVerbPairs.length])
  }))
);

const fixPastErrorSpotter = withIds("past_irregular_fix", [
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "He goed home after practice.",
    correction: "He went home after practice.",
    explain: "The past of go is went."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "I eated lunch at school.",
    correction: "I ate lunch at school.",
    explain: "The past of eat is ate."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "We taked the late bus yesterday.",
    correction: "We took the late bus yesterday.",
    explain: "The past of take is took."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "She buyed new shoes last week.",
    correction: "She bought new shoes last week.",
    explain: "The past of buy is bought."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "They finded the answer quickly.",
    correction: "They found the answer quickly.",
    explain: "The past of find is found."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "Maya writed a note to her teacher.",
    correction: "Maya wrote a note to her teacher.",
    explain: "The past of write is wrote."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "Dad gived me a ride yesterday.",
    correction: "Dad gave me a ride yesterday.",
    explain: "The past of give is gave."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "We comed back before dark.",
    correction: "We came back before dark.",
    explain: "The past of come is came."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "The dog runned into the yard.",
    correction: "The dog ran into the yard.",
    explain: "The past of run is ran."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "I drinked too much soda last night.",
    correction: "I drank too much soda last night.",
    explain: "The past of drink is drank."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "He breaked his pencil in class.",
    correction: "He broke his pencil in class.",
    explain: "The past of break is broke."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "You choosed the wrong file.",
    correction: "You chose the wrong file.",
    explain: "The past of choose is chose."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "They bringed snacks for the trip.",
    correction: "They brought snacks for the trip.",
    explain: "The past of bring is brought."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "She singed in the school concert.",
    correction: "She sang in the school concert.",
    explain: "The past of sing is sang."
  },
  {
    prompt: "Fix one irregular past verb bug.",
    sentence: "We sitted in the front row.",
    correction: "We sat in the front row.",
    explain: "The past of sit is sat."
  }
]);

const wasWereMc = withIds("was_were_mc", [
  {
    prompt: "Choose the correct past be verb.",
    context: "I ___ tired after practice yesterday.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with I."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "They ___ happy after the game.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with they."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "She ___ at the clinic yesterday.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with she."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "We ___ in the gym at 3 PM.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with we."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The weather ___ cold last night.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with singular subject."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "You ___ my partner yesterday.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with you."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "He ___ late for class this morning.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with he."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "My friends ___ at the library last night.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with plural subject."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The movie ___ interesting.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with singular noun."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The buses ___ crowded after school.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with buses."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "It ___ sunny in the morning.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with it."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The students ___ ready for the test.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with plural subject."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "Dad ___ at work all day yesterday.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with Dad."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The shoes ___ wet after the rain.",
    options: ["was", "were", "is", "are"],
    answerIndex: 1,
    explain: "Use were with plural noun."
  },
  {
    prompt: "Choose the correct past be verb.",
    context: "The cat ___ under the table.",
    options: ["was", "were", "is", "are"],
    answerIndex: 0,
    explain: "Use was with singular noun."
  }
]);

const classPhotoBuilder = buildSentenceBuilderItems(
  "was_were_builder",
  [
    { prompt: "Build the past be sentence.", solution: "I was in the front row yesterday." },
    { prompt: "Build the past be sentence.", solution: "They were very quiet in class." },
    { prompt: "Build the past be sentence.", solution: "She was at dance practice last night." },
    { prompt: "Build the past be sentence.", solution: "We were at the museum on Friday." },
    { prompt: "Build the past be sentence.", solution: "He was late for the meeting." },
    { prompt: "Build the past be sentence.", solution: "You were my lab partner yesterday." },
    { prompt: "Build the past be sentence.", solution: "The weather was warm this morning." },
    { prompt: "Build the past be sentence.", solution: "My cousins were in town last weekend." },
    { prompt: "Build the past be sentence.", solution: "It was noisy near the stadium." },
    { prompt: "Build the past be sentence.", solution: "The teachers were in the office at noon." },
    { prompt: "Build the past be sentence.", solution: "Dad was at the store after work." },
    { prompt: "Build the past be sentence.", solution: "The books were on my desk." },
    { prompt: "Build the past be sentence.", solution: "Our bus was early on Monday." },
    { prompt: "Build the past be sentence.", solution: "The students were ready for rehearsal." },
    { prompt: "Build the past be sentence.", solution: "My notebook was in my backpack." }
  ],
  "Use was with I/he/she/it and were with you/we/they."
);

const pastBeSubjectSwitchItems = buildWasWereSortItems([
  { tail: "at the gym after school", singularSubject: "the coach" },
  { tail: "at the bus stop at 7 AM", singularSubject: "the bus driver" },
  { tail: "happy about the project result", singularSubject: "the principal" },
  { tail: "in the library before lunch", singularSubject: "the tutor" },
  { tail: "ready for the science fair", singularSubject: "the nurse" },
  { tail: "late to the meeting yesterday", singularSubject: "the manager" },
  { tail: "in the lab at noon", singularSubject: "the intern" },
  { tail: "inside during the storm", singularSubject: "the class monitor" },
  { tail: "at the game last night", singularSubject: "the announcer" },
  { tail: "in the cafeteria at break", singularSubject: "the chef" },
  { tail: "very calm during the test", singularSubject: "the counselor" },
  { tail: "near the office this morning", singularSubject: "the office aide" },
  { tail: "excited about field day", singularSubject: "the teacher" },
  { tail: "outside after rehearsal", singularSubject: "the actor" },
  { tail: "at home last weekend", singularSubject: "the student leader" }
]);

const pastContinuousMc = withIds("past_continuous_mc", [
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 8 PM, she ___ for the math test.",
    options: ["was studying", "were studying", "studied", "was study"],
    answerIndex: 0,
    explain: "Use was + verb-ing with she."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 7:30, they ___ dinner together.",
    options: ["was eating", "were eating", "ate", "were eat"],
    answerIndex: 1,
    explain: "Use were + verb-ing with they."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At noon, I ___ to the office.",
    options: ["was walking", "were walking", "walked", "was walk"],
    answerIndex: 0,
    explain: "Use was with I in past continuous."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 9 PM, we ___ a movie at home.",
    options: ["was watching", "were watching", "watched", "were watch"],
    answerIndex: 1,
    explain: "Use were + verb-ing with we."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 6 AM, he ___ his bike to work.",
    options: ["was riding", "were riding", "rode", "was ride"],
    answerIndex: 0,
    explain: "Use was + verb-ing with he."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 5 PM, you ___ your project slides.",
    options: ["was finishing", "were finishing", "finished", "were finish"],
    answerIndex: 1,
    explain: "Use were + verb-ing with you."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 10 PM, the dog ___ by the door.",
    options: ["was sleeping", "were sleeping", "slept", "was sleep"],
    answerIndex: 0,
    explain: "Use was + verb-ing with singular subject."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 4 PM, my friends ___ in the gym.",
    options: ["was practicing", "were practicing", "practiced", "were practice"],
    answerIndex: 1,
    explain: "Use were + verb-ing with plural subject."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 3 PM, it ___ heavily outside.",
    options: ["was raining", "were raining", "rained", "was rain"],
    answerIndex: 0,
    explain: "Use was with it."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 11 AM, the students ___ a quiz.",
    options: ["was taking", "were taking", "took", "were take"],
    answerIndex: 1,
    explain: "Use were + verb-ing with students."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At midnight, Dad ___ in the kitchen.",
    options: ["was cooking", "were cooking", "cooked", "was cook"],
    answerIndex: 0,
    explain: "Use was + verb-ing with Dad."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 8:15, we ___ for the bus.",
    options: ["was waiting", "were waiting", "waited", "were wait"],
    answerIndex: 1,
    explain: "Use were + verb-ing with we."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 1 PM, she ___ to her counselor.",
    options: ["was talking", "were talking", "talked", "was talk"],
    answerIndex: 0,
    explain: "Use was + verb-ing with she."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 2 PM, they ___ through the museum.",
    options: ["was walking", "were walking", "walked", "were walk"],
    answerIndex: 1,
    explain: "Use were + verb-ing with they."
  },
  {
    prompt: "Choose the best past continuous sentence.",
    context: "At 9:45, I ___ my notes for history.",
    options: ["was reviewing", "were reviewing", "reviewed", "was review"],
    answerIndex: 0,
    explain: "Use was + verb-ing with I."
  }
]);

const pastContinuousBuilder = buildSentenceBuilderItems(
  "past_continuous_builder",
  [
    { prompt: "Build the scene sentence.", solution: "She was studying at 8 PM." },
    { prompt: "Build the scene sentence.", solution: "They were playing cards after dinner." },
    { prompt: "Build the scene sentence.", solution: "I was walking home at six." },
    { prompt: "Build the scene sentence.", solution: "We were waiting for the bus at 7 AM." },
    { prompt: "Build the scene sentence.", solution: "He was cooking dinner at five." },
    { prompt: "Build the scene sentence.", solution: "You were checking the map at noon." },
    { prompt: "Build the scene sentence.", solution: "The coach was shouting from the sideline." },
    { prompt: "Build the scene sentence.", solution: "My friends were watching a movie at night." },
    { prompt: "Build the scene sentence.", solution: "Dad was driving home at nine." },
    { prompt: "Build the scene sentence.", solution: "The students were cleaning the lab after class." },
    { prompt: "Build the scene sentence.", solution: "It was raining hard at noon." },
    { prompt: "Build the scene sentence.", solution: "She was reading in bed at ten." },
    { prompt: "Build the scene sentence.", solution: "We were making posters after school." },
    { prompt: "Build the scene sentence.", solution: "I was texting my cousin during lunch." },
    { prompt: "Build the scene sentence.", solution: "They were cooking when the lights went out." }
  ],
  "Use was/were + verb-ing for actions in progress in the past."
);

const fixTimelineErrorSpotter = withIds("past_continuous_fix", [
  {
    prompt: "Fix one past continuous bug.",
    sentence: "She were studying at 8 PM.",
    correction: "She was studying at 8 PM.",
    explain: "Use was with she."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "They was playing cards when I arrived.",
    correction: "They were playing cards when I arrived.",
    explain: "Use were with they."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "I were walking home at six.",
    correction: "I was walking home at six.",
    explain: "Use was with I."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "We was waiting for the bus at seven.",
    correction: "We were waiting for the bus at seven.",
    explain: "Use were with we."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "He were cooking dinner at five.",
    correction: "He was cooking dinner at five.",
    explain: "Use was with he."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "You was checking the map at noon.",
    correction: "You were checking the map at noon.",
    explain: "Use were with you."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "The coach was shout at the team.",
    correction: "The coach was shouting at the team.",
    explain: "Use verb-ing in past continuous."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "My friends were watch a movie.",
    correction: "My friends were watching a movie.",
    explain: "Use were + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "Dad was drive home at nine.",
    correction: "Dad was driving home at nine.",
    explain: "Use was + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "The students were clean the lab after class.",
    correction: "The students were cleaning the lab after class.",
    explain: "Use were + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "It were raining hard at noon.",
    correction: "It was raining hard at noon.",
    explain: "Use was with it."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "She was read in bed at ten.",
    correction: "She was reading in bed at ten.",
    explain: "Use was + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "We were make posters after school.",
    correction: "We were making posters after school.",
    explain: "Use were + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "I was text my cousin during lunch.",
    correction: "I was texting my cousin during lunch.",
    explain: "Use was + verb-ing."
  },
  {
    prompt: "Fix one past continuous bug.",
    sentence: "They were cook when the lights went out.",
    correction: "They were cooking when the lights went out.",
    explain: "Use were + verb-ing."
  }
]);

const pastVsPastContinuousMc = withIds("past_mix_mc", [
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "I was doing homework when the power went out.",
      "I did homework when the power went out.",
      "I was doing homework when the power was going out.",
      "I did homework when the power was going out."
    ],
    answerIndex: 0,
    explain: "Long action uses was/were + verb-ing. Interrupting action uses simple past."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "She was walking home when it started to rain.",
      "She walked home when it started to rain.",
      "She was walking home when it was starting to rain.",
      "She walked home when it was starting to rain."
    ],
    answerIndex: 0,
    explain: "Background action takes was/were + verb-ing."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "They were eating dinner when the phone rang.",
      "They ate dinner when the phone rang.",
      "They were eating dinner when the phone was ringing.",
      "They ate dinner when the phone was ringing."
    ],
    answerIndex: 0,
    explain: "Use simple past for the short interrupting action."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "We were waiting for the bus when it arrived.",
      "We waited for the bus when it arrived.",
      "We were waiting for the bus when it was arriving.",
      "We waited for the bus when it was arriving."
    ],
    answerIndex: 0,
    explain: "Long action in progress + short past interrupt."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "He was playing soccer when he fell.",
      "He played soccer when he fell.",
      "He was playing soccer when he was falling.",
      "He played soccer when he was falling."
    ],
    answerIndex: 0,
    explain: "Past continuous marks ongoing background action."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "I was reading when my friend texted me.",
      "I read when my friend texted me.",
      "I was reading when my friend was texting me.",
      "I read when my friend was texting me."
    ],
    answerIndex: 0,
    explain: "The text interrupt is simple past."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "The class was taking notes when the bell rang.",
      "The class took notes when the bell rang.",
      "The class was taking notes when the bell was ringing.",
      "The class took notes when the bell was ringing."
    ],
    answerIndex: 0,
    explain: "Use was/were + verb-ing for the ongoing action."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "You were washing dishes when the lights went out.",
      "You washed dishes when the lights went out.",
      "You were washing dishes when the lights were going out.",
      "You washed dishes when the lights were going out."
    ],
    answerIndex: 0,
    explain: "Short event takes simple past."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "Dad was driving when a tire popped.",
      "Dad drove when a tire popped.",
      "Dad was driving when a tire was popping.",
      "Dad drove when a tire was popping."
    ],
    answerIndex: 0,
    explain: "Driving is the long action, popped is the short event."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "The dog was sleeping when the door slammed.",
      "The dog slept when the door slammed.",
      "The dog was sleeping when the door was slamming.",
      "The dog slept when the door was slamming."
    ],
    answerIndex: 0,
    explain: "Use past continuous + when + simple past."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "Maya was cooking when her brother arrived.",
      "Maya cooked when her brother arrived.",
      "Maya was cooking when her brother was arriving.",
      "Maya cooked when her brother was arriving."
    ],
    answerIndex: 0,
    explain: "The ongoing action uses was + verb-ing."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "They were studying while the rain fell outside.",
      "They studied while the rain fell outside.",
      "They were studying while the rain was falling outside.",
      "They studied while the rain was falling outside."
    ],
    answerIndex: 0,
    explain: "Studying is the long action; fell is the short event."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "I was making lunch when the fire alarm rang.",
      "I made lunch when the fire alarm rang.",
      "I was making lunch when the fire alarm was ringing.",
      "I made lunch when the fire alarm was ringing."
    ],
    answerIndex: 0,
    explain: "Fire alarm rang is the simple past interrupt."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "We were practicing when the coach called time.",
      "We practiced when the coach called time.",
      "We were practicing when the coach was calling time.",
      "We practiced when the coach was calling time."
    ],
    answerIndex: 0,
    explain: "Past continuous and simple past show timeline clearly."
  },
  {
    prompt: "Choose the best interrupt pattern sentence.",
    context: "Use one long action and one interrupting action.",
    options: [
      "She was texting when the bus arrived.",
      "She texted when the bus arrived.",
      "She was texting when the bus was arriving.",
      "She texted when the bus was arriving."
    ],
    answerIndex: 0,
    explain: "Texting is in progress. Bus arrived is the interrupt."
  }
]);

const whenWhileBuilder = buildSentenceBuilderItems(
  "past_mix_builder",
  [
    { prompt: "Build the timeline sentence.", solution: "I was reading when my phone rang." },
    { prompt: "Build the timeline sentence.", solution: "She was walking home when it started to rain." },
    { prompt: "Build the timeline sentence.", solution: "They were eating dinner when the lights went out." },
    { prompt: "Build the timeline sentence.", solution: "We were waiting outside when the bus arrived." },
    { prompt: "Build the timeline sentence.", solution: "He was playing soccer when he fell." },
    { prompt: "Build the timeline sentence.", solution: "You were studying while your brother cooked dinner." },
    { prompt: "Build the timeline sentence.", solution: "The class was taking notes when the bell rang." },
    { prompt: "Build the timeline sentence.", solution: "Dad was driving when a tire popped." },
    { prompt: "Build the timeline sentence.", solution: "The dog was sleeping when the door slammed." },
    { prompt: "Build the timeline sentence.", solution: "Maya was cooking when her friend called." },
    { prompt: "Build the timeline sentence.", solution: "They were practicing while the rain fell outside." },
    { prompt: "Build the timeline sentence.", solution: "I was making lunch when the fire alarm rang." },
    { prompt: "Build the timeline sentence.", solution: "We were talking when the teacher entered." },
    { prompt: "Build the timeline sentence.", solution: "She was texting when the train arrived." },
    { prompt: "Build the timeline sentence.", solution: "I was cleaning my room when my cousin knocked." }
  ],
  "Use was/were + verb-ing for long action, then when + simple past for the interrupt."
);

const whichActionSortItems = buildPastVsActionSortItems([
  {
    longActionOne: "I was reading in bed",
    longActionTwo: "We were waiting at the stop",
    shortActionOne: "the phone rang",
    shortActionTwo: "the bus arrived"
  },
  {
    longActionOne: "She was cooking dinner",
    longActionTwo: "They were studying in the library",
    shortActionOne: "the alarm rang",
    shortActionTwo: "the lights went out"
  },
  {
    longActionOne: "He was driving home",
    longActionTwo: "We were watching a movie",
    shortActionOne: "a tire popped",
    shortActionTwo: "the door slammed"
  },
  {
    longActionOne: "The class was taking notes",
    longActionTwo: "I was organizing my files",
    shortActionOne: "the bell rang",
    shortActionTwo: "my friend texted me"
  },
  {
    longActionOne: "Dad was fixing the bike",
    longActionTwo: "They were eating lunch",
    shortActionOne: "the rain started",
    shortActionTwo: "the coach called us"
  },
  {
    longActionOne: "You were washing dishes",
    longActionTwo: "She was practicing piano",
    shortActionOne: "the sink clogged",
    shortActionTwo: "the teacher arrived"
  },
  {
    longActionOne: "I was walking to class",
    longActionTwo: "We were reviewing flashcards",
    shortActionOne: "my shoe broke",
    shortActionTwo: "the timer beeped"
  },
  {
    longActionOne: "The students were cleaning the lab",
    longActionTwo: "He was carrying the boxes",
    shortActionOne: "the principal entered",
    shortActionTwo: "a box dropped"
  },
  {
    longActionOne: "Maya was drawing posters",
    longActionTwo: "They were planning the event",
    shortActionOne: "the marker ran out",
    shortActionTwo: "the bell rang"
  },
  {
    longActionOne: "We were jogging in the park",
    longActionTwo: "I was checking my schedule",
    shortActionOne: "it started to rain",
    shortActionTwo: "my coach called"
  },
  {
    longActionOne: "The dog was sleeping near the door",
    longActionTwo: "She was reading in the kitchen",
    shortActionOne: "the package arrived",
    shortActionTwo: "the kettle whistled"
  },
  {
    longActionOne: "They were setting up the stage",
    longActionTwo: "I was practicing my speech",
    shortActionOne: "the microphone failed",
    shortActionTwo: "the host announced our names"
  },
  {
    longActionOne: "He was riding his bike to school",
    longActionTwo: "We were waiting in line",
    shortActionOne: "his chain snapped",
    shortActionTwo: "the doors opened"
  },
  {
    longActionOne: "I was doing my project",
    longActionTwo: "They were packing their bags",
    shortActionOne: "the internet crashed",
    shortActionTwo: "the bus horn sounded"
  },
  {
    longActionOne: "She was talking to her counselor",
    longActionTwo: "We were organizing the classroom",
    shortActionOne: "the bell rang",
    shortActionTwo: "a parent called the office"
  }
]);

const didOrWasMc = withIds("past_questions_mc", [
  {
    prompt: "Choose the correct question helper.",
    context: "___ you finish the project last night?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did + subject + base verb for past action."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ she at practice yesterday?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 1,
    explain: "Use was for past be with she."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ they at the game last night?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 2,
    explain: "Use were for past be with they."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ he call his grandmother after school?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did for past action question."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ we late for class this morning?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 2,
    explain: "Use were with we."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ I leave my notebook here yesterday?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did + I + base verb."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ the movie interesting last night?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 1,
    explain: "Movie is singular, so use was."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ your parents drive to work yesterday?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did for past action."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ the students quiet during the test?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 2,
    explain: "Students is plural, so use were."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ Maya clean her desk yesterday?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did with action verb clean."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ it cold this morning?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 1,
    explain: "Use was with it."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ you and Ben ready for rehearsal?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 2,
    explain: "You and Ben is plural, so use were."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ he send the email before lunch?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did + base verb send."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ the buses on time yesterday?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 2,
    explain: "Use were with plural noun buses."
  },
  {
    prompt: "Choose the correct question helper.",
    context: "___ she take the late train?",
    options: ["Did", "Was", "Were", "Does"],
    answerIndex: 0,
    explain: "Use Did for past action question."
  }
]);

const pastQuestionBuilder = buildSentenceBuilderItems(
  "past_questions_builder",
  [
    { prompt: "Build the past question.", solution: "Did you finish your homework last night?" },
    { prompt: "Build the past question.", solution: "Did she call her coach after practice?" },
    { prompt: "Build the past question.", solution: "Did they watch the game yesterday?" },
    { prompt: "Build the past question.", solution: "Did he bring his ID to school?" },
    { prompt: "Build the past question.", solution: "Did we leave early this morning?" },
    { prompt: "Build the past question.", solution: "Did I send the right file?" },
    { prompt: "Build the past question.", solution: "Did your brother clean the kitchen?" },
    { prompt: "Build the past question.", solution: "Did Maya study for the science quiz?" },
    { prompt: "Build the past question.", solution: "Did the class finish the poster yesterday?" },
    { prompt: "Build the past question.", solution: "Did your parents drive to work today?" },
    { prompt: "Build the past question.", solution: "Did the bus arrive on time?" },
    { prompt: "Build the past question.", solution: "Did she borrow your notebook?" },
    { prompt: "Build the past question.", solution: "Did they practice after school?" },
    { prompt: "Build the past question.", solution: "Did he open the lab door?" },
    { prompt: "Build the past question.", solution: "Did we meet in room twelve?" }
  ],
  "Use Did + subject + base verb for simple past questions."
);

const fixPastQuestionSpotter = withIds("past_questions_fix", [
  {
    prompt: "Fix one past question bug.",
    sentence: "Did she went to practice?",
    correction: "Did she go to practice?",
    explain: "After Did, use base verb go."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did he ate breakfast at home?",
    correction: "Did he eat breakfast at home?",
    explain: "After Did, use base verb eat."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did they saw the movie?",
    correction: "Did they see the movie?",
    explain: "After Did, use base verb see."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did Maya wrote the report?",
    correction: "Did Maya write the report?",
    explain: "After Did, use base verb write."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did you took the late bus?",
    correction: "Did you take the late bus?",
    explain: "After Did, use base verb take."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did we came before lunch?",
    correction: "Did we come before lunch?",
    explain: "After Did, use base verb come."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did Dad drove to work?",
    correction: "Did Dad drive to work?",
    explain: "After Did, use base verb drive."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did the team won the game?",
    correction: "Did the team win the game?",
    explain: "After Did, use base verb win."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did your sister sang at the concert?",
    correction: "Did your sister sing at the concert?",
    explain: "After Did, use base verb sing."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did I forgot my ID card?",
    correction: "Did I forget my ID card?",
    explain: "After Did, use base verb forget."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did the store closed early?",
    correction: "Did the store close early?",
    explain: "After Did, use base verb close."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did they brought snacks for class?",
    correction: "Did they bring snacks for class?",
    explain: "After Did, use base verb bring."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did he made coffee this morning?",
    correction: "Did he make coffee this morning?",
    explain: "After Did, use base verb make."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did she ran to class?",
    correction: "Did she run to class?",
    explain: "After Did, use base verb run."
  },
  {
    prompt: "Fix one past question bug.",
    sentence: "Did you choosed the red folder?",
    correction: "Did you choose the red folder?",
    explain: "After Did, use base verb choose."
  }
]);

const futureSimplePredictionChallenge = withIds("future_simple_prediction", [
  {
    prompt: "Pick the correct future simple prediction.",
    context: "She ___ travel tomorrow.",
    options: ["will travel", "will travels", "is travel", "going travel"],
    answerIndex: 0,
    explain: "Future simple uses will + base verb."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "I ___ call you later.",
    options: ["will call", "will calls", "am call", "going to calls"],
    answerIndex: 0,
    explain: "Use will + base verb."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "They ___ finish soon.",
    options: ["will finish", "will finishes", "are finish", "going finish"],
    answerIndex: 0,
    explain: "Use will with all subjects."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "He ___ pass the test next week.",
    options: ["will pass", "will passes", "is pass", "going to passs"],
    answerIndex: 0,
    explain: "After will, use base verb pass."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "We ___ arrive on time.",
    options: ["will arrive", "will arrives", "are arrive", "going arrive"],
    answerIndex: 0,
    explain: "Future simple does not add s."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "The bus ___ come in five minutes.",
    options: ["will come", "will comes", "is come", "going to comes"],
    answerIndex: 0,
    explain: "Use will + base verb come."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "You ___ like this game.",
    options: ["will like", "will likes", "are like", "going to likes"],
    answerIndex: 0,
    explain: "Use will with you."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "My team ___ win later.",
    options: ["will win", "will wins", "is win", "going to wins"],
    answerIndex: 0,
    explain: "Use will + base verb win."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "The weather ___ change tomorrow.",
    options: ["will change", "will changes", "is change", "going to changes"],
    answerIndex: 0,
    explain: "Future simple uses will + base verb."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "Dad ___ cook tonight.",
    options: ["will cook", "will cooks", "is cook", "going to cooks"],
    answerIndex: 0,
    explain: "Use will + cook."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "I ___ remember this clue.",
    options: ["will remember", "will remembers", "am remember", "going remember"],
    answerIndex: 0,
    explain: "Use base verb after will."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "The students ___ submit next week.",
    options: ["will submit", "will submits", "are submit", "going to submits"],
    answerIndex: 0,
    explain: "Will works with plural subjects too."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "She ___ open the file later.",
    options: ["will open", "will opens", "is open", "going open"],
    answerIndex: 0,
    explain: "Use will + open."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "We ___ solve this puzzle soon.",
    options: ["will solve", "will solves", "are solve", "going to solves"],
    answerIndex: 0,
    explain: "Future simple: will + base verb."
  },
  {
    prompt: "Pick the correct future simple prediction.",
    context: "The club ___ meet in two days.",
    options: ["will meet", "will meets", "is meet", "going to meets"],
    answerIndex: 0,
    explain: "Use will + meet."
  }
]);

const futureSimpleSentenceBuilder = buildSentenceBuilderItems(
  "future_simple_builder",
  [
    { prompt: "Build the future simple sentence.", solution: "She will travel tomorrow." },
    { prompt: "Build the future simple sentence.", solution: "I will call you later." },
    { prompt: "Build the future simple sentence.", solution: "They will study next week." },
    { prompt: "Build the future simple sentence.", solution: "He will bring the laptop soon." },
    { prompt: "Build the future simple sentence.", solution: "We will finish in two days." },
    { prompt: "Build the future simple sentence.", solution: "The class will start at nine tomorrow." },
    { prompt: "Build the future simple sentence.", solution: "You will join the team next year." },
    { prompt: "Build the future simple sentence.", solution: "My brother will text me later." },
    { prompt: "Build the future simple sentence.", solution: "The bus will arrive soon." },
    { prompt: "Build the future simple sentence.", solution: "I will review this mission tomorrow." },
    { prompt: "Build the future simple sentence.", solution: "The students will submit next week." },
    { prompt: "Build the future simple sentence.", solution: "Dad will cook dinner tonight." },
    { prompt: "Build the future simple sentence.", solution: "The coach will announce the plan later." },
    { prompt: "Build the future simple sentence.", solution: "We will decode the clue soon." },
    { prompt: "Build the future simple sentence.", solution: "She will open the case file tomorrow." }
  ],
  "Future simple uses subject + will + base verb."
);

const futureSimpleErrorDetection = withIds("future_simple_fix", [
  {
    prompt: "Fix one future simple bug.",
    sentence: "She will travels tomorrow.",
    correction: "She will travel tomorrow.",
    explain: "After will, use base verb."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "I will calls you later.",
    correction: "I will call you later.",
    explain: "Do not add s after will."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "They will studies next week.",
    correction: "They will study next week.",
    explain: "Use base verb study."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "He will brings the folder soon.",
    correction: "He will bring the folder soon.",
    explain: "Use base verb bring."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "We will finished in two days.",
    correction: "We will finish in two days.",
    explain: "Use base verb finish."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "The class will starts at nine.",
    correction: "The class will start at nine.",
    explain: "After will, use start."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "You will joining us later.",
    correction: "You will join us later.",
    explain: "Future simple does not use verb-ing."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "My brother will texts me soon.",
    correction: "My brother will text me soon.",
    explain: "Use base verb text."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "The bus will arrives soon.",
    correction: "The bus will arrive soon.",
    explain: "Use base verb arrive."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "I will reviewing this case tomorrow.",
    correction: "I will review this case tomorrow.",
    explain: "Use base verb review."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "The students will submits next week.",
    correction: "The students will submit next week.",
    explain: "Remove s after will."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "Dad will cooks dinner tonight.",
    correction: "Dad will cook dinner tonight.",
    explain: "After will, use cook."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "The coach will announcing later.",
    correction: "The coach will announce later.",
    explain: "Use base verb announce."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "We will solves the puzzle soon.",
    correction: "We will solve the puzzle soon.",
    explain: "Use base verb solve."
  },
  {
    prompt: "Fix one future simple bug.",
    sentence: "She will opens the case file tomorrow.",
    correction: "She will open the case file tomorrow.",
    explain: "Use base verb open."
  }
]);

const goingToPlanOrPrediction = withIds("going_to_mc", [
  {
    prompt: "Pick the correct going to form.",
    context: "They ___ study tonight.",
    options: ["are going to", "is going to", "will be", "do going to"],
    answerIndex: 0,
    explain: "Use are going to with they."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "She ___ visit her aunt tomorrow.",
    options: ["are going to", "is going to", "am going to", "will going to"],
    answerIndex: 1,
    explain: "Use is going to with she."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "I ___ read after dinner.",
    options: ["am going to", "is going to", "are going to", "will going"],
    answerIndex: 0,
    explain: "Use am going to with I."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "We ___ leave soon.",
    options: ["is going to", "are going to", "am going to", "will going to"],
    answerIndex: 1,
    explain: "Use are going to with we."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "He ___ play tomorrow.",
    options: ["is going to", "are going to", "am going to", "will be"],
    answerIndex: 0,
    explain: "Use is going to with he."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "You ___ send the report later.",
    options: ["are going to", "is going to", "am going to", "will going"],
    answerIndex: 0,
    explain: "Use are going to with you."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "The class ___ start in ten minutes.",
    options: ["is going to", "are going to", "am going to", "will to"],
    answerIndex: 0,
    explain: "Class is singular, so use is going to."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "My friends ___ join us next week.",
    options: ["is going to", "are going to", "am going to", "will going to"],
    answerIndex: 1,
    explain: "Use are going to with plural subject."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "Dad ___ cook tonight.",
    options: ["are going to", "is going to", "am going to", "will be"],
    answerIndex: 1,
    explain: "Use is going to with Dad."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "I ___ practice piano later.",
    options: ["am going to", "are going to", "is going to", "will going"],
    answerIndex: 0,
    explain: "Use am going to with I."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "They ___ build a model tomorrow.",
    options: ["is going to", "are going to", "am going to", "will be going"],
    answerIndex: 1,
    explain: "Use are going to with they."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "She ___ bring her notebook.",
    options: ["is going to", "are going to", "am going to", "will going"],
    answerIndex: 0,
    explain: "Use is going to with she."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "We ___ meet next year.",
    options: ["is going to", "are going to", "am going to", "will to"],
    answerIndex: 1,
    explain: "Use are going to with we."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "The bus ___ arrive soon.",
    options: ["is going to", "are going to", "am going to", "will going"],
    answerIndex: 0,
    explain: "Bus is singular, so use is going to."
  },
  {
    prompt: "Pick the correct going to form.",
    context: "You ___ solve this quickly.",
    options: ["are going to", "is going to", "am going to", "will be going"],
    answerIndex: 0,
    explain: "Use are going to with you."
  }
]);

const goingToSentenceBuilder = buildSentenceBuilderItems(
  "going_to_builder",
  [
    { prompt: "Build the going to sentence.", solution: "They are going to study tonight." },
    { prompt: "Build the going to sentence.", solution: "She is going to visit her aunt tomorrow." },
    { prompt: "Build the going to sentence.", solution: "I am going to read later." },
    { prompt: "Build the going to sentence.", solution: "We are going to leave soon." },
    { prompt: "Build the going to sentence.", solution: "He is going to play next week." },
    { prompt: "Build the going to sentence.", solution: "You are going to send the report." },
    { prompt: "Build the going to sentence.", solution: "The class is going to start in ten minutes." },
    { prompt: "Build the going to sentence.", solution: "My friends are going to join us later." },
    { prompt: "Build the going to sentence.", solution: "Dad is going to cook dinner tonight." },
    { prompt: "Build the going to sentence.", solution: "I am going to practice piano tomorrow." },
    { prompt: "Build the going to sentence.", solution: "They are going to build a model soon." },
    { prompt: "Build the going to sentence.", solution: "She is going to bring her notebook." },
    { prompt: "Build the going to sentence.", solution: "We are going to meet next year." },
    { prompt: "Build the going to sentence.", solution: "The bus is going to arrive soon." },
    { prompt: "Build the going to sentence.", solution: "You are going to solve this quickly." }
  ],
  "Going to future uses subject + be + going to + base verb."
);

const goingToErrorCorrection = withIds("going_to_fix", [
  {
    prompt: "Fix one going to error.",
    sentence: "They is going to study tonight.",
    correction: "They are going to study tonight.",
    explain: "Use are with they."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "She are going to visit tomorrow.",
    correction: "She is going to visit tomorrow.",
    explain: "Use is with she."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "I are going to read later.",
    correction: "I am going to read later.",
    explain: "Use am with I."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "We is going to leave soon.",
    correction: "We are going to leave soon.",
    explain: "Use are with we."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "He are going to play next week.",
    correction: "He is going to play next week.",
    explain: "Use is with he."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "You is going to send the report.",
    correction: "You are going to send the report.",
    explain: "Use are with you."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "The class are going to start soon.",
    correction: "The class is going to start soon.",
    explain: "Class is singular, so use is."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "My friends is going to join us later.",
    correction: "My friends are going to join us later.",
    explain: "Friends is plural, so use are."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "Dad are going to cook tonight.",
    correction: "Dad is going to cook tonight.",
    explain: "Dad takes is."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "I is going to practice tomorrow.",
    correction: "I am going to practice tomorrow.",
    explain: "Use am with I."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "They am going to build a model.",
    correction: "They are going to build a model.",
    explain: "Use are with they."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "She am going to bring her notebook.",
    correction: "She is going to bring her notebook.",
    explain: "Use is with she."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "We is going to meet next year.",
    correction: "We are going to meet next year.",
    explain: "Use are with we."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "The bus are going to arrive soon.",
    correction: "The bus is going to arrive soon.",
    explain: "Bus is singular, so use is."
  },
  {
    prompt: "Fix one going to error.",
    sentence: "You am going to solve this quickly.",
    correction: "You are going to solve this quickly.",
    explain: "Use are with you."
  }
]);

const futureContinuousTimeDetective = withIds("future_continuous_mc", [
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At 8 PM, she ___.",
    options: ["will be working", "will working", "is working", "will works"],
    answerIndex: 0,
    explain: "Future continuous uses will be + verb-ing."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At noon tomorrow, they ___ lunch.",
    options: ["will be eating", "will eating", "are eating", "will eats"],
    answerIndex: 0,
    explain: "Use will be eating."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "This time next week, I ___ to school.",
    options: ["will be walking", "will walking", "am walking", "will walks"],
    answerIndex: 0,
    explain: "Use will be + verb-ing."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At 9 AM, we ___ the test.",
    options: ["will be taking", "will taking", "are taking", "will takes"],
    answerIndex: 0,
    explain: "Future continuous is will be taking."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Tomorrow at five, he ___ dinner.",
    options: ["will be cooking", "will cooking", "is cooking", "will cooks"],
    answerIndex: 0,
    explain: "Use will be cooking."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Later tonight, you ___ the report.",
    options: ["will be finishing", "will finishing", "are finishing", "will finishs"],
    answerIndex: 0,
    explain: "Use will be finishing."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At this time tomorrow, the bus ___ downtown.",
    options: ["will be driving", "will driving", "is driving", "will drives"],
    answerIndex: 0,
    explain: "Use will be driving."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Next year, my friends ___ in college.",
    options: ["will be studying", "will studying", "are studying", "will studies"],
    answerIndex: 0,
    explain: "Use will be studying."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Tomorrow at 7, Dad ___ to work.",
    options: ["will be driving", "will driving", "is driving", "will drives"],
    answerIndex: 0,
    explain: "Future continuous uses will be driving."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At lunch tomorrow, I ___ with the team.",
    options: ["will be meeting", "will meeting", "am meeting", "will meets"],
    answerIndex: 0,
    explain: "Use will be meeting."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "In two days, the class ___ a presentation.",
    options: ["will be giving", "will giving", "is giving", "will gives"],
    answerIndex: 0,
    explain: "Use will be giving."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Tomorrow evening, she ___ the case notes.",
    options: ["will be reviewing", "will reviewing", "is reviewing", "will reviews"],
    answerIndex: 0,
    explain: "Use will be reviewing."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "At 10 PM, we ___ the final clue.",
    options: ["will be decoding", "will decoding", "are decoding", "will decodes"],
    answerIndex: 0,
    explain: "Future continuous is will be decoding."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Soon, they ___ for the mission.",
    options: ["will be preparing", "will preparing", "are preparing", "will prepares"],
    answerIndex: 0,
    explain: "Use will be preparing."
  },
  {
    prompt: "Pick the correct future continuous sentence.",
    context: "Tomorrow morning, he ___ the timeline.",
    options: ["will be checking", "will checking", "is checking", "will checks"],
    answerIndex: 0,
    explain: "Use will be checking."
  }
]);

const futureContinuousSentenceBuilder = buildSentenceBuilderItems(
  "future_continuous_builder",
  [
    { prompt: "Build the future continuous sentence.", solution: "She will be working at 8 PM." },
    { prompt: "Build the future continuous sentence.", solution: "They will be studying tomorrow night." },
    { prompt: "Build the future continuous sentence.", solution: "I will be walking to class at nine." },
    { prompt: "Build the future continuous sentence.", solution: "We will be taking notes during the meeting." },
    { prompt: "Build the future continuous sentence.", solution: "He will be cooking dinner later." },
    { prompt: "Build the future continuous sentence.", solution: "You will be finishing the report soon." },
    { prompt: "Build the future continuous sentence.", solution: "The bus will be arriving in ten minutes." },
    { prompt: "Build the future continuous sentence.", solution: "My friends will be practicing next week." },
    { prompt: "Build the future continuous sentence.", solution: "Dad will be driving home at six." },
    { prompt: "Build the future continuous sentence.", solution: "I will be meeting the coach tomorrow." },
    { prompt: "Build the future continuous sentence.", solution: "The class will be giving presentations later." },
    { prompt: "Build the future continuous sentence.", solution: "She will be reviewing the clues tonight." },
    { prompt: "Build the future continuous sentence.", solution: "We will be decoding the message at noon." },
    { prompt: "Build the future continuous sentence.", solution: "They will be preparing for the mission soon." },
    { prompt: "Build the future continuous sentence.", solution: "He will be checking the timeline tomorrow." }
  ],
  "Future continuous uses subject + will be + verb-ing."
);

const futureContinuousErrorFix = withIds("future_continuous_fix", [
  {
    prompt: "Fix one future continuous error.",
    sentence: "She will working at 8 PM.",
    correction: "She will be working at 8 PM.",
    explain: "Future continuous needs will be + verb-ing."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "They will be study tomorrow night.",
    correction: "They will be studying tomorrow night.",
    explain: "Use verb-ing after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "I will be walk to class at nine.",
    correction: "I will be walking to class at nine.",
    explain: "Use verb-ing walk -> walking."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "We will taking notes during the meeting.",
    correction: "We will be taking notes during the meeting.",
    explain: "Add be after will."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "He will be cook dinner later.",
    correction: "He will be cooking dinner later.",
    explain: "Use cooking, not cook."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "You will be finish the report soon.",
    correction: "You will be finishing the report soon.",
    explain: "Use finishing after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "The bus will arriving in ten minutes.",
    correction: "The bus will be arriving in ten minutes.",
    explain: "Add be after will."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "My friends will be practice next week.",
    correction: "My friends will be practicing next week.",
    explain: "Use practicing after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "Dad will be drive home at six.",
    correction: "Dad will be driving home at six.",
    explain: "Use driving after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "I will meeting the coach tomorrow.",
    correction: "I will be meeting the coach tomorrow.",
    explain: "Add be after will."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "The class will be give presentations later.",
    correction: "The class will be giving presentations later.",
    explain: "Use giving after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "She will review the clues tonight.",
    correction: "She will be reviewing the clues tonight.",
    explain: "Future continuous needs will be reviewing."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "We will be decode the message at noon.",
    correction: "We will be decoding the message at noon.",
    explain: "Use decoding after will be."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "They will preparing for the mission soon.",
    correction: "They will be preparing for the mission soon.",
    explain: "Add be after will."
  },
  {
    prompt: "Fix one future continuous error.",
    sentence: "He will be checks the timeline tomorrow.",
    correction: "He will be checking the timeline tomorrow.",
    explain: "Use checking after will be."
  }
]);

const futureTimeDragAndMatch = buildFutureTimeMatchItems([
  {
    tomorrow: "The class will review this clue ___ morning.",
    nextWeek: "We will present our report ___ in science.",
    nextYear: "She will start high school ___.",
    later: "I will call the team ___.",
    soon: "The bell will ring ___.",
    inTheFuture: "Robots will help in classrooms ___.",
    inTwoDays: "They will submit the case file ___."
  },
  {
    tomorrow: "Dad will drive me to practice ___.",
    nextWeek: "Our club will meet ___ for the final round.",
    nextYear: "My cousin will move here ___.",
    later: "We will decode the final clue ___.",
    soon: "The bus will arrive ___.",
    inTheFuture: "Students will use more AI tools ___.",
    inTwoDays: "I will finish this mission ___."
  },
  {
    tomorrow: "She will print the worksheet ___.",
    nextWeek: "The teacher will return feedback ___.",
    nextYear: "They will join the new program ___.",
    later: "I will text you ___ today.",
    soon: "The game will start ___.",
    inTheFuture: "Cities will have cleaner transport ___.",
    inTwoDays: "The team will travel ___."
  },
  {
    tomorrow: "We will organize the folders ___.",
    nextWeek: "He will take the quiz ___.",
    nextYear: "Our school will open a new lab ___.",
    later: "She will finish the chart ___.",
    soon: "The rain will stop ___.",
    inTheFuture: "People will live longer ___.",
    inTwoDays: "I will send the invite ___."
  },
  {
    tomorrow: "They will read chapter six ___.",
    nextWeek: "The coach will post the schedule ___.",
    nextYear: "My brother will graduate ___.",
    later: "I will check the timeline ___.",
    soon: "The timer will beep ___.",
    inTheFuture: "Classes will be more flexible ___.",
    inTwoDays: "She will call her aunt ___."
  },
  {
    tomorrow: "The class will begin the project ___.",
    nextWeek: "We will test the app ___.",
    nextYear: "He will learn another language ___.",
    later: "They will compare answers ___.",
    soon: "The movie will begin ___.",
    inTheFuture: "Homes will use less energy ___.",
    inTwoDays: "Dad will buy supplies ___."
  },
  {
    tomorrow: "You will bring your notebook ___.",
    nextWeek: "I will meet the counselor ___.",
    nextYear: "Our team will play in a new league ___.",
    later: "She will update the plan ___.",
    soon: "The package will arrive ___.",
    inTheFuture: "Cars will be safer ___.",
    inTwoDays: "The class will vote ___."
  },
  {
    tomorrow: "He will solve this puzzle ___.",
    nextWeek: "They will check the data ___.",
    nextYear: "I will visit my uncle ___.",
    later: "We will clean the lab ___.",
    soon: "The lights will turn on ___.",
    inTheFuture: "Doctors will use better tools ___.",
    inTwoDays: "She will share the notes ___."
  },
  {
    tomorrow: "I will practice guitar ___.",
    nextWeek: "The principal will announce results ___.",
    nextYear: "Students will have new lockers ___.",
    later: "Dad will cook pasta ___.",
    soon: "The game will end ___.",
    inTheFuture: "People will travel faster ___.",
    inTwoDays: "We will start Unit 4 ___."
  },
  {
    tomorrow: "She will complete page two ___.",
    nextWeek: "Our class will visit the museum ___.",
    nextYear: "The city will build a park ___.",
    later: "I will revise my answer ___.",
    soon: "The team will begin ___.",
    inTheFuture: "Computers will be smarter ___.",
    inTwoDays: "They will return the books ___."
  },
  {
    tomorrow: "They will watch the tutorial ___.",
    nextWeek: "He will lead warm-up ___ at practice.",
    nextYear: "My family will move ___.",
    later: "We will review this chart ___.",
    soon: "The teacher will arrive ___.",
    inTheFuture: "Farms will use more tech ___.",
    inTwoDays: "I will complete this chart ___."
  },
  {
    tomorrow: "The bus will leave early ___.",
    nextWeek: "I will submit my draft ___.",
    nextYear: "Our school will add coding class ___.",
    later: "She will answer your question ___.",
    soon: "The clue will appear ___.",
    inTheFuture: "People will learn online more often ___.",
    inTwoDays: "We will call the office ___."
  },
  {
    tomorrow: "He will bring snacks ___ for the trip.",
    nextWeek: "The class will practice speeches ___.",
    nextYear: "They will start college ___.",
    later: "I will update the board ___.",
    soon: "The bus will come ___.",
    inTheFuture: "Cities will have more bikes ___.",
    inTwoDays: "She will finish her poster ___."
  },
  {
    tomorrow: "We will review vocabulary ___.",
    nextWeek: "Dad will repair the shelf ___.",
    nextYear: "My sister will change schools ___.",
    later: "They will open the envelope ___.",
    soon: "The meeting will start ___.",
    inTheFuture: "Students will have new tools ___.",
    inTwoDays: "I will check your draft ___."
  },
  {
    tomorrow: "She will write the summary ___.",
    nextWeek: "We will compare ideas ___.",
    nextYear: "The club will expand ___.",
    later: "He will return your call ___.",
    soon: "The app will update ___.",
    inTheFuture: "People will recycle more ___.",
    inTwoDays: "They will decode the final clue ___."
  }
]);

const futureTimeSentenceCompletion = withIds("future_time_completion", [
  {
    prompt: "Choose the best future time expression.",
    context: "We will start the mini-mission ___.",
    options: ["tomorrow", "yesterday", "last week", "earlier"],
    answerIndex: 0,
    explain: "Tomorrow signals future time."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "The class will present ___ at assembly.",
    options: ["next week", "last week", "yesterday", "this morning"],
    answerIndex: 0,
    explain: "Next week is a future expression."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "She will apply for college ___.",
    options: ["next year", "last year", "yesterday", "earlier"],
    answerIndex: 0,
    explain: "Next year is future time."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "I will call you ___ after class.",
    options: ["later", "before", "last night", "yesterday"],
    answerIndex: 0,
    explain: "Later means after now."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "The bus will arrive ___.",
    options: ["soon", "earlier", "last week", "yesterday"],
    answerIndex: 0,
    explain: "Soon points to near future."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "In many schools ___, classes will include AI projects.",
    options: ["in the future", "last year", "yesterday", "before"],
    answerIndex: 0,
    explain: "In the future refers to a later time."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "They will submit the report ___.",
    options: ["in two days", "two days ago", "yesterday", "last Monday"],
    answerIndex: 0,
    explain: "In two days means two days from now."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "Dad will fix the shelf ___.",
    options: ["later", "last week", "earlier", "yesterday"],
    answerIndex: 0,
    explain: "Later means future time."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "Our game challenge starts ___.",
    options: ["tomorrow", "last night", "two days ago", "earlier"],
    answerIndex: 0,
    explain: "Tomorrow is future."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "The team will review clues ___.",
    options: ["next week", "yesterday", "last week", "this morning"],
    answerIndex: 0,
    explain: "Next week points to upcoming time."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "The school will open a new lab ___.",
    options: ["next year", "last year", "yesterday", "before"],
    answerIndex: 0,
    explain: "Next year is future."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "The app will update ___.",
    options: ["soon", "last night", "earlier", "two days ago"],
    answerIndex: 0,
    explain: "Soon is a future time marker."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "We will solve harder missions ___.",
    options: ["in the future", "yesterday", "last month", "earlier"],
    answerIndex: 0,
    explain: "In the future is the correct marker."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "She will return the books ___.",
    options: ["in two days", "two days ago", "last week", "yesterday"],
    answerIndex: 0,
    explain: "In two days is future."
  },
  {
    prompt: "Choose the best future time expression.",
    context: "I will text the answer ___.",
    options: ["later", "last night", "earlier", "yesterday"],
    answerIndex: 0,
    explain: "Later shows future time."
  }
]);

const futureTimeTimelineChallenge = withIds("future_time_timeline", [
  {
    prompt: "Choose the time expression that means nearest future.",
    context: "Which expression shows the action will happen very quickly?",
    options: ["soon", "next year", "in the future", "last week"],
    answerIndex: 0,
    explain: "Soon means in a short time."
  },
  {
    prompt: "Choose the best expression for one day after today.",
    context: "The mission continues ___.",
    options: ["tomorrow", "later", "next week", "in the future"],
    answerIndex: 0,
    explain: "Tomorrow is exactly one day after today."
  },
  {
    prompt: "Choose the best expression for seven days from now.",
    context: "We will present the timeline ___.",
    options: ["next week", "tomorrow", "soon", "later"],
    answerIndex: 0,
    explain: "Next week is the correct timeline clue."
  },
  {
    prompt: "Choose the best expression for one year from now.",
    context: "The new mission pack arrives ___.",
    options: ["next year", "in two days", "soon", "tomorrow"],
    answerIndex: 0,
    explain: "Next year means one year in the future."
  },
  {
    prompt: "Choose the broad long-term future expression.",
    context: "Technology will change learning ___.",
    options: ["in the future", "tomorrow", "in two days", "soon"],
    answerIndex: 0,
    explain: "In the future is broad and long-term."
  },
  {
    prompt: "Choose the expression for 48 hours from now.",
    context: "We will check this file ___.",
    options: ["in two days", "next year", "last week", "earlier"],
    answerIndex: 0,
    explain: "In two days means 48 hours from now."
  },
  {
    prompt: "Choose the best expression for a flexible future time.",
    context: "I will finish the report ___.",
    options: ["later", "last year", "yesterday", "two days ago"],
    answerIndex: 0,
    explain: "Later means at a time after now."
  },
  {
    prompt: "Choose the earliest option among these future markers.",
    context: "Pick the closest upcoming time.",
    options: ["soon", "next week", "next year", "in the future"],
    answerIndex: 0,
    explain: "Soon is earlier than the others."
  },
  {
    prompt: "Choose the marker for immediate next-day planning.",
    context: "The class will begin Unit 5 ___.",
    options: ["tomorrow", "next year", "in two days", "later"],
    answerIndex: 0,
    explain: "Tomorrow is the next day."
  },
  {
    prompt: "Choose the marker for events not this week but the following one.",
    context: "The mission challenge will restart ___.",
    options: ["next week", "soon", "tomorrow", "later"],
    answerIndex: 0,
    explain: "Next week is the right phrase."
  },
  {
    prompt: "Choose the marker for the most distant specific option.",
    context: "The full program update is planned ___.",
    options: ["next year", "in two days", "tomorrow", "soon"],
    answerIndex: 0,
    explain: "Next year is the farthest specific timeline."
  },
  {
    prompt: "Choose the expression for something not fixed to a specific date.",
    context: "I will call you ___.",
    options: ["later", "tomorrow", "next week", "in two days"],
    answerIndex: 0,
    explain: "Later is unspecific but future."
  },
  {
    prompt: "Choose the broad expression for unknown distant time.",
    context: "People will use cleaner energy ___.",
    options: ["in the future", "tomorrow", "soon", "in two days"],
    answerIndex: 0,
    explain: "In the future is broad and distant."
  },
  {
    prompt: "Choose the expression that fits a short scheduled delay.",
    context: "The coach will arrive ___ after class.",
    options: ["soon", "next year", "last week", "yesterday"],
    answerIndex: 0,
    explain: "Soon fits a short delay."
  },
  {
    prompt: "Choose the expression for exactly two days from now.",
    context: "They will return to this mission ___.",
    options: ["in two days", "next week", "later", "tomorrow"],
    answerIndex: 0,
    explain: "In two days is exact."
  }
]);

export const MISSIONS_DATA = {
  missions: [
    {
      id: "speak_in_the_moment",
      slug: "speak-in-the-moment",
      hubPath: "/missions/speak-in-the-moment/",
      title: "Speak in the Moment",
      subtitle: "Present Tenses",
      description:
        "Talk about what is true, what happens regularly, and what is happening right now.",
      icon: "🛰️",
      subskills: [
        {
          id: "present_continuous_am_is_are_ing",
          title: "Present Continuous",
          difficulty: "Rookie",
          ruleFocus: "Use am/is/are + verb-ing for actions happening now.",
          examplePattern: "She is studying. / They are talking.",
          notesForELD:
            "Look for am, is, or are plus a verb ending in -ing. This often means right now.",
          games: [
            {
              id: "now_or_not",
              title: "Now or Not?",
              description: "Pick the correct am/is/are + verb-ing form for right-now actions.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: presentContinuousNowOrNot
            },
            {
              id: "agent_status_update",
              title: "Agent Status Update",
              description: "Build present continuous status updates from word tiles.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: presentContinuousBuilder
            },
            {
              id: "fix_the_bug",
              title: "Fix the Bug",
              description: "Repair one present continuous bug in each sentence.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: presentContinuousErrorSpotter
            }
          ]
        },
        {
          id: "simple_present_affirmative",
          title: "Simple Present",
          difficulty: "Rookie",
          ruleFocus: "Use base verb (or -s) for habits and facts.",
          examplePattern: "I play soccer. / He plays soccer.",
          notesForELD:
            "Use base verb with I/you/we/they. Add -s with he/she/it.",
          games: [
            {
              id: "habit_match",
              title: "Habit Match",
              description: "Choose the best simple present form for daily routines and facts.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: simplePresentHabitMatch
            },
            {
              id: "routine_builder",
              title: "Routine Builder",
              description: "Assemble clear habit sentences with correct verb endings.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: simplePresentBuilder
            },
            {
              id: "subject_switch",
              title: "Subject Switch",
              description: "Sort subjects to base verb vs verb + s lanes.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: subjectSwitchItems
            }
          ]
        },
        {
          id: "yes_no_questions_do_does",
          title: "Yes/No Questions",
          difficulty: "Agent",
          ruleFocus: "Do/Does + subject + base verb?",
          examplePattern: "Do you like pizza? / Does she like pizza?",
          notesForELD:
            "Use Do with I/you/we/they. Use Does with he/she/it. Keep the main verb in base form.",
          games: [
            {
              id: "interrogation_room",
              title: "Interrogation Room",
              description: "Identify the correct Do/Does question stem.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: yesNoQuestionMc
            },
            {
              id: "build_the_question",
              title: "Build the Question",
              description: "Build yes/no questions with Do/Does + base verb.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: yesNoBuilder
            },
            {
              id: "do_vs_does",
              title: "Do vs Does",
              description: "Sort question stems into Do and Does lanes.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: doDoesSortItems
            }
          ]
        },
        {
          id: "wh_questions_do_does",
          title: "WH Questions",
          difficulty: "Agent",
          ruleFocus: "WH word + do/does + subject + base verb?",
          examplePattern: "Where do they live? / When does he work?",
          notesForELD:
            "Start with a WH word. Then add do/does, subject, and base verb.",
          games: [
            {
              id: "find_the_file",
              title: "Find the File",
              description: "Pick the WH question with correct structure.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: whQuestionMc
            },
            {
              id: "wh_builder",
              title: "WH Builder",
              description: "Build WH questions in the correct word order.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: whBuilder
            },
            {
              id: "wh_swap",
              title: "WH Swap",
              description: "Match clues to the right WH word lane.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: whSwapItems
            }
          ]
        },
        {
          id: "auxiliary_verb_focus",
          title: "Auxiliary Verb Focus",
          difficulty: "Director",
          ruleFocus: "Choose the correct auxiliary based on tense and structure.",
          examplePattern: "Are you coming? / Do you come here often?",
          notesForELD:
            "Use am/is/are for actions happening now. Use do/does for habits and facts.",
          games: [
            {
              id: "auxiliary_id",
              title: "Auxiliary ID",
              description: "Choose between be auxiliaries and do auxiliaries.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: auxiliaryIdMc
            },
            {
              id: "two_truths",
              title: "Two Truths",
              description: "Fix one auxiliary error in each sentence.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: auxiliaryErrorSpotter
            },
            {
              id: "aux_sorting_desk",
              title: "Aux Sorting Desk",
              description: "Sort sentences by be auxiliary or do auxiliary family.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: auxSortItems
            }
          ]
        }
      ]
    },
    {
      id: "time_traveler",
      slug: "time-traveler",
      hubPath: "/missions/hub.html?mission=time_traveler",
      title: "Time Traveler",
      subtitle: "Past Tenses",
      description: "Talk about finished actions and tell stories.",
      icon: "⏳",
      subskills: [
        {
          id: "simple_past_regular_verbs",
          title: "Simple Past - Regular Verbs",
          difficulty: "Rookie",
          ruleFocus: "Use verb + -ed for finished past actions.",
          examplePattern: "She visited her cousin.",
          notesForELD:
            "Look for time words like yesterday or last night. Use regular past forms such as visited, cleaned, and studied.",
          games: [
            {
              id: "yesterday_file",
              title: "Yesterday File",
              description: "Choose the correct regular past verb in context.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: regularPastYesterdayFile
            },
            {
              id: "past_builder_regular",
              title: "Past Builder: Regular",
              description: "Build clear regular past sentences from word tiles.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: regularPastBuilder
            },
            {
              id: "ed_ending_lab",
              title: "ED Ending Lab",
              description: "Sort verbs by regular past spelling patterns.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: edEndingLabItems
            }
          ]
        },
        {
          id: "simple_past_irregular_verbs",
          title: "Simple Past - Irregular Verbs",
          difficulty: "Agent",
          ruleFocus: "Use irregular forms such as go to went.",
          examplePattern: "He went home.",
          notesForELD:
            "Irregular verbs do not use -ed. Memorize pairs like go/went, see/saw, and eat/ate.",
          games: [
            {
              id: "irregular_id",
              title: "Irregular ID",
              description: "Pick the correct irregular past form.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: irregularIdMc
            },
            {
              id: "time_machine_match",
              title: "Time Machine Match",
              description: "Match base verbs and irregular past forms.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: irregularMatchItems
            },
            {
              id: "fix_the_past",
              title: "Fix the Past",
              description: "Repair one irregular past mistake per sentence.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: fixPastErrorSpotter
            }
          ]
        },
        {
          id: "was_were_past_be",
          title: "Was / Were",
          difficulty: "Rookie",
          ruleFocus: "Use was with I/he/she/it and were with you/we/they.",
          examplePattern: "They were happy.",
          notesForELD:
            "Match subject and past be carefully. Singular subjects use was, plural subjects use were.",
          games: [
            {
              id: "was_or_were",
              title: "Was or Were?",
              description: "Choose the correct past be verb.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: wasWereMc
            },
            {
              id: "class_photo_captions",
              title: "Class Photo Captions",
              description: "Build past be sentences from scene captions.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: classPhotoBuilder
            },
            {
              id: "subject_switch_past_be",
              title: "Subject Switch: Past Be",
              description: "Sort subjects under was and were.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: pastBeSubjectSwitchItems
            }
          ]
        },
        {
          id: "past_continuous_was_were_ing",
          title: "Past Continuous",
          difficulty: "Agent",
          ruleFocus: "Use was/were + verb-ing for actions in progress in the past.",
          examplePattern: "She was studying at 8 PM.",
          notesForELD:
            "Past continuous shows an action that was happening at a specific past time.",
          games: [
            {
              id: "in_progress",
              title: "In Progress",
              description: "Identify correct was/were + verb-ing forms.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: pastContinuousMc
            },
            {
              id: "scene_builder",
              title: "Scene Builder",
              description: "Assemble past continuous scene sentences.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: pastContinuousBuilder
            },
            {
              id: "fix_the_timeline",
              title: "Fix the Timeline",
              description: "Correct one past continuous error each round.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: fixTimelineErrorSpotter
            }
          ]
        },
        {
          id: "past_vs_past_continuous",
          title: "Past vs Past Continuous",
          difficulty: "Director",
          ruleFocus: "Use was/were + verb-ing + when + simple past.",
          examplePattern: "I was sleeping when the phone rang.",
          notesForELD:
            "The long background action uses was/were + verb-ing. The short interrupting action uses simple past.",
          games: [
            {
              id: "interrupt_alert",
              title: "Interrupt Alert",
              description: "Choose the sentence with correct long action + interrupt pattern.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: pastVsPastContinuousMc
            },
            {
              id: "when_while_builder",
              title: "When/While Builder",
              description: "Build timeline sentences using when and while.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: whenWhileBuilder
            },
            {
              id: "which_action",
              title: "Which Action?",
              description: "Sort clauses into long action versus interrupting action.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: whichActionSortItems
            }
          ]
        },
        {
          id: "past_questions_did_base",
          title: "Past Questions",
          difficulty: "Agent",
          ruleFocus: "Use Did + subject + base verb.",
          examplePattern: "Did you go?",
          notesForELD:
            "After Did, use the base verb, not the past form. Example: Did she go? not Did she went?",
          games: [
            {
              id: "did_or_was",
              title: "Did or Was?",
              description: "Choose the right helper for past questions.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: didOrWasMc
            },
            {
              id: "build_the_question_past",
              title: "Build the Question: Past",
              description: "Build Did + subject + base verb questions.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: pastQuestionBuilder
            },
            {
              id: "fix_the_question",
              title: "Fix the Question",
              description: "Correct one past question error each round.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: fixPastQuestionSpotter
            }
          ]
        }
      ]
    },
    {
      id: "time_travelers",
      slug: "time-travelers",
      hubPath: "/missions/hub.html?mission=time_travelers",
      title: "Time Travelers",
      subtitle: "Future Tenses",
      description:
        "Agents must analyze future plans, predictions, and ongoing future actions to decode the timeline of upcoming events.",
      icon: "🚀",
      subskills: [
        {
          id: "future_simple_will",
          title: "Future Simple (Will)",
          difficulty: "Rookie",
          ruleFocus: "Subject + will + base verb.",
          examplePattern: "She will travel tomorrow.",
          notesForELD:
            "Use will with all subjects. Keep the main verb in base form after will.",
          games: [
            {
              id: "future_simple_sentence_builder",
              title: "Future Simple - Sentence Builder",
              description: "Build correct future simple sentences with will + base verb.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: futureSimpleSentenceBuilder
            },
            {
              id: "future_simple_error_detection",
              title: "Future Simple - Error Detection",
              description: "Find and correct future simple mistakes with will.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: futureSimpleErrorDetection
            },
            {
              id: "future_simple_prediction_challenge",
              title: "Future Simple - Prediction Challenge",
              description: "Choose the best future simple prediction sentence.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: futureSimplePredictionChallenge
            }
          ]
        },
        {
          id: "going_to_future",
          title: "Going To Future",
          difficulty: "Rookie",
          ruleFocus: "Subject + be + going to + base verb.",
          examplePattern: "They are going to study tonight.",
          notesForELD:
            "Match be verb to the subject first, then add going to and base verb.",
          games: [
            {
              id: "going_to_sentence_builder",
              title: "Going To - Sentence Builder",
              description: "Build future plan sentences using be + going to + base verb.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: goingToSentenceBuilder
            },
            {
              id: "going_to_error_correction",
              title: "Going To - Error Correction",
              description: "Correct one be + going to structure error in each item.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: goingToErrorCorrection
            },
            {
              id: "going_to_plan_or_prediction",
              title: "Going To - Plan or Prediction",
              description: "Select the correct going to form for plans and predictions.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: goingToPlanOrPrediction
            }
          ]
        },
        {
          id: "future_continuous_will_be_ing",
          title: "Future Continuous",
          difficulty: "Agent",
          ruleFocus: "Subject + will be + verb-ing.",
          examplePattern: "She will be working at 8 PM.",
          notesForELD:
            "Use future continuous for actions in progress at a future time point.",
          games: [
            {
              id: "future_continuous_sentence_builder",
              title: "Future Continuous - Sentence Builder",
              description: "Assemble future continuous sentences with will be + verb-ing.",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: futureContinuousSentenceBuilder
            },
            {
              id: "future_continuous_time_detective",
              title: "Future Continuous - Time Detective",
              description: "Identify the correct will be + verb-ing form for time clues.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: futureContinuousTimeDetective
            },
            {
              id: "future_continuous_error_fix",
              title: "Future Continuous - Error Fix",
              description: "Fix future continuous structure errors quickly.",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: futureContinuousErrorFix
            }
          ]
        },
        {
          id: "future_time_expressions",
          title: "Future Time Expressions",
          difficulty: "Director",
          ruleFocus:
            "Use clear future markers such as tomorrow, next week, next year, later, soon, in the future, and in two days.",
          examplePattern: "We will start tomorrow. / They will submit in two days.",
          notesForELD:
            "Time expressions help show exactly when future actions happen. Match the clue and timeline.",
          games: [
            {
              id: "future_time_drag_match",
              title: "Future Time Expressions - Drag and Match",
              description: "Drag sentence clues to the correct future time expression.",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: futureTimeDragAndMatch
            },
            {
              id: "future_time_sentence_completion",
              title: "Future Time Expressions - Sentence Completion",
              description: "Complete each sentence with the best future time phrase.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: futureTimeSentenceCompletion
            },
            {
              id: "future_time_timeline_challenge",
              title: "Future Time Expressions - Timeline Challenge",
              description: "Choose the right future time marker for timeline clues.",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: futureTimeTimelineChallenge
            }
          ]
        }
      ]
    }
  ]
};

function validateMissionData(payload) {
  const allowedDifficulties = new Set(["Rookie", "Agent", "Director"]);
  const allowedGameTypes = new Set([
    "multiple_choice",
    "sentence_builder",
    "drag_sort",
    "error_spotter"
  ]);

  if (!payload || !Array.isArray(payload.missions)) {
    throw new Error("MISSIONS_DATA must include a missions array.");
  }

  payload.missions.forEach((mission) => {
    if (!mission.id || !mission.title || !mission.subtitle || !mission.description) {
      throw new Error("Each mission must include id, title, subtitle, and description.");
    }
    if (!Array.isArray(mission.subskills) || !mission.subskills.length) {
      throw new Error(`Mission ${mission.id} must define subskills.`);
    }

    mission.subskills.forEach((subskill) => {
      if (!subskill.id || !subskill.title || !subskill.ruleFocus || !subskill.examplePattern) {
        throw new Error(
          `Subskill in mission ${mission.id} must include id, title, ruleFocus, and examplePattern.`
        );
      }
      if (!allowedDifficulties.has(subskill.difficulty)) {
        throw new Error(
          `Subskill ${subskill.id} in mission ${mission.id} must set difficulty to Rookie, Agent, or Director.`
        );
      }
      if (!Array.isArray(subskill.games) || subskill.games.length !== GAME_TARGET) {
        throw new Error(
          `Subskill ${subskill.id} in mission ${mission.id} must define exactly ${GAME_TARGET} games.`
        );
      }

      subskill.games.forEach((game) => {
        if (!game.id || !game.title || !game.description) {
          throw new Error(
            `Game in subskill ${subskill.id} mission ${mission.id} must include id, title, and description.`
          );
        }
        if (!allowedGameTypes.has(game.gameType)) {
          throw new Error(
            `Game ${game.id} in mission ${mission.id} has unsupported gameType "${game.gameType}".`
          );
        }
        if (game.itemCount !== ITEM_TARGET) {
          throw new Error(`Game ${game.id} in mission ${mission.id} must set itemCount=${ITEM_TARGET}.`);
        }
        if (!Array.isArray(game.items) || game.items.length !== ITEM_TARGET) {
          throw new Error(`Game ${game.id} in mission ${mission.id} must include exactly ${ITEM_TARGET} items.`);
        }
      });
    });
  });
}

validateMissionData(MISSIONS_DATA);

export default MISSIONS_DATA;
