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
          ruleFocus: "Use am/is/are + verb-ing for actions happening now.",
          examplePattern: "She is studying. / They are talking.",
          notesForELD:
            "Look for am, is, or are plus a verb ending in -ing. This often means right now.",
          games: [
            {
              id: "now_or_not",
              title: "Now or Not?",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: presentContinuousNowOrNot
            },
            {
              id: "agent_status_update",
              title: "Agent Status Update",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: presentContinuousBuilder
            },
            {
              id: "fix_the_bug",
              title: "Fix the Bug",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: presentContinuousErrorSpotter
            }
          ]
        },
        {
          id: "simple_present_affirmative",
          title: "Simple Present",
          ruleFocus: "Use base verb (or -s) for habits and facts.",
          examplePattern: "I play soccer. / He plays soccer.",
          notesForELD:
            "Use base verb with I/you/we/they. Add -s with he/she/it.",
          games: [
            {
              id: "habit_match",
              title: "Habit Match",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: simplePresentHabitMatch
            },
            {
              id: "routine_builder",
              title: "Routine Builder",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: simplePresentBuilder
            },
            {
              id: "subject_switch",
              title: "Subject Switch",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: subjectSwitchItems
            }
          ]
        },
        {
          id: "yes_no_questions_do_does",
          title: "Yes/No Questions",
          ruleFocus: "Do/Does + subject + base verb?",
          examplePattern: "Do you like pizza? / Does she like pizza?",
          notesForELD:
            "Use Do with I/you/we/they. Use Does with he/she/it. Keep the main verb in base form.",
          games: [
            {
              id: "interrogation_room",
              title: "Interrogation Room",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: yesNoQuestionMc
            },
            {
              id: "build_the_question",
              title: "Build the Question",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: yesNoBuilder
            },
            {
              id: "do_vs_does",
              title: "Do vs Does",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: doDoesSortItems
            }
          ]
        },
        {
          id: "wh_questions_do_does",
          title: "WH Questions",
          ruleFocus: "WH word + do/does + subject + base verb?",
          examplePattern: "Where do they live? / When does he work?",
          notesForELD:
            "Start with a WH word. Then add do/does, subject, and base verb.",
          games: [
            {
              id: "find_the_file",
              title: "Find the File",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: whQuestionMc
            },
            {
              id: "wh_builder",
              title: "WH Builder",
              gameType: "sentence_builder",
              itemCount: ITEM_TARGET,
              items: whBuilder
            },
            {
              id: "wh_swap",
              title: "WH Swap",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: whSwapItems
            }
          ]
        },
        {
          id: "auxiliary_verb_focus",
          title: "Auxiliary Verb Focus",
          ruleFocus: "Choose the correct auxiliary based on tense and structure.",
          examplePattern: "Are you coming? / Do you come here often?",
          notesForELD:
            "Use am/is/are for actions happening now. Use do/does for habits and facts.",
          games: [
            {
              id: "auxiliary_id",
              title: "Auxiliary ID",
              gameType: "multiple_choice",
              itemCount: ITEM_TARGET,
              items: auxiliaryIdMc
            },
            {
              id: "two_truths",
              title: "Two Truths",
              gameType: "error_spotter",
              itemCount: ITEM_TARGET,
              items: auxiliaryErrorSpotter
            },
            {
              id: "aux_sorting_desk",
              title: "Aux Sorting Desk",
              gameType: "drag_sort",
              itemCount: ITEM_TARGET,
              items: auxSortItems
            }
          ]
        }
      ]
    }
  ]
};

function validateMissionData(payload) {
  if (!payload || !Array.isArray(payload.missions)) {
    throw new Error("MISSIONS_DATA must include a missions array.");
  }

  payload.missions.forEach((mission) => {
    if (!Array.isArray(mission.subskills) || !mission.subskills.length) {
      throw new Error(`Mission ${mission.id} must define subskills.`);
    }

    mission.subskills.forEach((subskill) => {
      if (!Array.isArray(subskill.games) || subskill.games.length !== GAME_TARGET) {
        throw new Error(
          `Subskill ${subskill.id} in mission ${mission.id} must define exactly ${GAME_TARGET} games.`
        );
      }

      subskill.games.forEach((game) => {
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
