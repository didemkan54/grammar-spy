import { getAllAttempts } from "/core/progressStore.js";
import {
  awardXp,
  getActiveClassId,
  getActiveStudentId,
  getStudentProfile,
  listStudentProfiles,
  setActiveContext,
  upsertStudentProfile
} from "/student/identity-store.js";

const STORAGE_KEYS = {
  teachers: "gs_teachers_v1",
  classrooms: "gs_classrooms",
  students: "gs_students_v1",
  assignments: "gs_assignments_v1",
  studentProgress: "gs_student_progress_v1",
  quizzes: "gs_quizzes_v1",
  testAttempts: "gs_test_attempts_v1",
  testAttemptState: "gs_test_attempt_state_v1",
  coachSessions: "gs_grammar_coach_sessions_v1",
  worksheets: "gs_worksheets_v1",
  aiConfig: "gs_ai_config_v1",
  legacyStudentClassroom: "gs_student_classroom"
};

const ROLE_PERMISSIONS = {
  teacher: new Set([
    "classroom:create",
    "classroom:manage",
    "assignment:create",
    "quiz:create",
    "worksheet:create",
    "attempt:review"
  ]),
  student: new Set([
    "classroom:join",
    "assignment:complete",
    "quiz:take",
    "coach:chat"
  ])
};

const QUIZ_TYPES = ["multiple_choice", "error_correction", "fill_blank", "sentence_builder"];
const WORKSHEET_TYPES = ["practice_worksheet", "exit_ticket", "homework_sheet", "quick_review"];

const GRAMMAR_BANK = {
  past_tense: [
    {
      incorrect: "She go to school yesterday.",
      corrected: "She went to school yesterday.",
      rule: "simple past irregular verbs",
      explanation: "Use the irregular past form 'went' for yesterday."
    },
    {
      incorrect: "They was late for class.",
      corrected: "They were late for class.",
      rule: "be-verb agreement in past tense",
      explanation: "Use 'were' with plural subjects like 'they'."
    },
    {
      incorrect: "We didn't went to the lab.",
      corrected: "We didn't go to the lab.",
      rule: "auxiliary + base verb",
      explanation: "After 'didn't', use the base verb: go."
    },
    {
      incorrect: "He study English last night.",
      corrected: "He studied English last night.",
      rule: "regular past tense -ed",
      explanation: "Regular verbs add -ed in the simple past."
    }
  ],
  present_tense: [
    {
      incorrect: "She go to school every day.",
      corrected: "She goes to school every day.",
      rule: "third person singular in simple present",
      explanation: "Use verb + s/es for he/she/it in simple present."
    },
    {
      incorrect: "They plays soccer after school.",
      corrected: "They play soccer after school.",
      rule: "subject-verb agreement with plural subjects",
      explanation: "Plural subjects use the base form: play."
    },
    {
      incorrect: "My brother have two notebooks.",
      corrected: "My brother has two notebooks.",
      rule: "has/have agreement",
      explanation: "Use 'has' with singular third-person subjects."
    },
    {
      incorrect: "I am usually walk to class.",
      corrected: "I usually walk to class.",
      rule: "simple present without extra auxiliary",
      explanation: "Do not use 'am' before a simple present main verb."
    }
  ],
  subject_verb_agreement: [
    {
      incorrect: "The students in this class is focused.",
      corrected: "The students in this class are focused.",
      rule: "plural subject with be-verb",
      explanation: "The subject is 'students' (plural), so use 'are'."
    },
    {
      incorrect: "Each student write a reflection.",
      corrected: "Each student writes a reflection.",
      rule: "each + singular verb",
      explanation: "'Each student' is singular, so use 'writes'."
    },
    {
      incorrect: "The list of rules are on the wall.",
      corrected: "The list of rules is on the wall.",
      rule: "head noun agreement",
      explanation: "The subject is 'list' (singular), so use 'is'."
    }
  ],
  auxiliary_verbs: [
    {
      incorrect: "She don't like grammar drills.",
      corrected: "She doesn't like grammar drills.",
      rule: "do/does agreement",
      explanation: "Use 'doesn't' with third-person singular subjects."
    },
    {
      incorrect: "Do he understand the clue?",
      corrected: "Does he understand the clue?",
      rule: "question auxiliary agreement",
      explanation: "Questions with he/she/it use 'does'."
    },
    {
      incorrect: "They doesn't need a hint.",
      corrected: "They don't need a hint.",
      rule: "plural auxiliary form",
      explanation: "Plural subjects use 'don't', not 'doesn't'."
    }
  ],
  plural_singular: [
    {
      incorrect: "Those notebook is on the desk.",
      corrected: "Those notebooks are on the desk.",
      rule: "plural noun and verb agreement",
      explanation: "Use plural noun 'notebooks' and plural verb 'are'."
    },
    {
      incorrect: "Many student likes this game.",
      corrected: "Many students like this game.",
      rule: "plural noun after many",
      explanation: "After 'many', use a plural noun and matching verb."
    },
    {
      incorrect: "This clues is important.",
      corrected: "These clues are important.",
      rule: "demonstrative + noun number agreement",
      explanation: "Plural noun 'clues' needs 'these' and 'are'."
    }
  ],
  tense_consistency: [
    {
      incorrect: "Yesterday we study and then we watch a movie.",
      corrected: "Yesterday we studied and then we watched a movie.",
      rule: "keep tense consistent in one timeline",
      explanation: "Use past tense for both actions in a past-time sequence."
    },
    {
      incorrect: "He opens his notebook and wrote the answer.",
      corrected: "He opened his notebook and wrote the answer.",
      rule: "parallel tense in compound verbs",
      explanation: "Both actions should stay in the same tense."
    },
    {
      incorrect: "Last week they are absent and missed the quiz.",
      corrected: "Last week they were absent and missed the quiz.",
      rule: "past-time be-verb",
      explanation: "Past-time markers require past be-verb forms."
    }
  ]
};

function nowIso() {
  return new Date().toISOString();
}

function canUseStorage() {
  try {
    const probe = "__gs_product_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch (_err) {
    return false;
  }
}

function readJson(key, fallback) {
  if (!canUseStorage()) return fallback;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed == null ? fallback : parsed;
  } catch (_err) {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) return value;
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function randomId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toUpperCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function normalizeName(value, fallback = "Untitled") {
  const clean = String(value || "").trim();
  return clean || fallback;
}

function average(list) {
  const rows = Array.isArray(list) ? list : [];
  if (!rows.length) return 0;
  const sum = rows.reduce((acc, row) => acc + Number(row || 0), 0);
  return Math.round(sum / rows.length);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function uniq(values) {
  return Array.from(new Set(values || []));
}

function slugId(value, fallback) {
  const raw = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return raw || fallback;
}

function readTeachers() {
  const rows = readJson(STORAGE_KEYS.teachers, []);
  return Array.isArray(rows) ? rows : [];
}

function writeTeachers(rows) {
  return writeJson(STORAGE_KEYS.teachers, (rows || []).slice(-500));
}

function defaultJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let idx = 0; idx < 6; idx += 1) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function normalizeTeacher(row) {
  const teacher = row || {};
  return {
    id: String(teacher.id || randomId("teacher")),
    name: normalizeName(teacher.name, "Teacher"),
    email: String(teacher.email || "").trim().toLowerCase(),
    createdAt: String(teacher.createdAt || nowIso()),
    updatedAt: nowIso()
  };
}

function normalizeClassroom(row) {
  const classroom = row || {};
  const joinCode = toUpperCode(classroom.joinCode || classroom.code || defaultJoinCode());
  return {
    id: String(classroom.id || randomId("class")),
    teacherId: String(classroom.teacherId || classroom.teacher_id || ""),
    name: normalizeName(classroom.name, "Classroom"),
    joinCode,
    createdAt: String(classroom.createdAt || nowIso()),
    updatedAt: nowIso(),
    archived: Boolean(classroom.archived),
    studentIds: Array.isArray(classroom.studentIds) ? uniq(classroom.studentIds.map(String)) : [],
    assignmentIds: Array.isArray(classroom.assignmentIds) ? uniq(classroom.assignmentIds.map(String)) : []
  };
}

function readClassrooms() {
  const raw = readJson(STORAGE_KEYS.classrooms, []);
  if (!Array.isArray(raw)) return [];

  const migratedStudents = [];
  const rows = raw.map((entry) => {
    const next = normalizeClassroom(entry);
    if (entry && Array.isArray(entry.students) && entry.students.length) {
      entry.students.forEach((student) => {
        const studentName = normalizeName(student && student.name, "");
        if (!studentName) return;
        const studentId = `name_${slugId(studentName, "student")}`;
        next.studentIds.push(studentId);
        migratedStudents.push({
          id: studentId,
          name: studentName,
          guestIdentifier: studentId,
          joinedClasses: [{ classId: next.id, joinedAt: String(student.joinedAt || nowIso()) }],
          createdAt: String(student.joinedAt || nowIso()),
          updatedAt: nowIso()
        });
      });
      next.studentIds = uniq(next.studentIds);
    }
    return next;
  });

  if (migratedStudents.length) {
    const existingStudents = readStudents();
    const merged = [...existingStudents];
    migratedStudents.forEach((row) => {
      if (!merged.some((student) => student.id === row.id)) {
        merged.push(normalizeStudent(row));
      }
    });
    writeStudents(merged);
  }

  writeClassrooms(rows);
  return rows;
}

function writeClassrooms(rows) {
  return writeJson(STORAGE_KEYS.classrooms, (rows || []).map(normalizeClassroom).slice(-800));
}

function normalizeStudent(row) {
  const student = row || {};
  const id = String(student.id || randomId("student"));
  const joinedClasses = Array.isArray(student.joinedClasses) ? student.joinedClasses : [];
  return {
    id,
    name: normalizeName(student.name, "Agent"),
    email: String(student.email || "").trim().toLowerCase(),
    guestIdentifier: String(student.guestIdentifier || id),
    joinedClasses: joinedClasses
      .map((entry) => ({
        classId: String(entry.classId || entry.class_id || "").trim(),
        joinedAt: String(entry.joinedAt || nowIso())
      }))
      .filter((entry) => entry.classId),
    createdAt: String(student.createdAt || nowIso()),
    updatedAt: nowIso()
  };
}

function readStudents() {
  const rows = readJson(STORAGE_KEYS.students, []);
  return Array.isArray(rows) ? rows.map(normalizeStudent) : [];
}

function writeStudents(rows) {
  return writeJson(STORAGE_KEYS.students, (rows || []).map(normalizeStudent).slice(-5000));
}

function normalizeAssignment(row) {
  const entry = row || {};
  const type = ["mission", "quiz", "worksheet"].includes(entry.type) ? entry.type : "mission";
  return {
    id: String(entry.id || randomId("assign")),
    classId: String(entry.classId || "").trim(),
    type,
    targetId: String(entry.targetId || "").trim(),
    title: normalizeName(entry.title, "Untitled Assignment"),
    assignedAt: String(entry.assignedAt || nowIso()),
    dueAt: entry.dueAt ? String(entry.dueAt) : "",
    status: String(entry.status || "active"),
    createdBy: String(entry.createdBy || "")
  };
}

function readAssignments() {
  const rows = readJson(STORAGE_KEYS.assignments, []);
  return Array.isArray(rows) ? rows.map(normalizeAssignment) : [];
}

function writeAssignments(rows) {
  return writeJson(STORAGE_KEYS.assignments, (rows || []).map(normalizeAssignment).slice(-12000));
}

function normalizeStudentProgress(row) {
  const entry = row || {};
  return {
    id: String(entry.id || randomId("progress")),
    classId: String(entry.classId || "").trim(),
    studentId: String(entry.studentId || "").trim(),
    missionId: String(entry.missionId || "").trim(),
    quizId: String(entry.quizId || "").trim(),
    assignmentId: String(entry.assignmentId || "").trim(),
    completionPercent: clamp(entry.completionPercent, 0, 100),
    xpEarned: Math.max(0, Number(entry.xpEarned || 0)),
    accuracy: clamp(entry.accuracy, 0, 100),
    streak: Math.max(0, Number(entry.streak || 0)),
    lastPlayedAt: String(entry.lastPlayedAt || nowIso())
  };
}

function readStudentProgressRows() {
  const rows = readJson(STORAGE_KEYS.studentProgress, []);
  return Array.isArray(rows) ? rows.map(normalizeStudentProgress) : [];
}

function writeStudentProgressRows(rows) {
  return writeJson(STORAGE_KEYS.studentProgress, (rows || []).map(normalizeStudentProgress).slice(-24000));
}

function normalizeQuiz(row) {
  const quiz = row || {};
  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  return {
    id: String(quiz.id || randomId("quiz")),
    title: normalizeName(quiz.title, "Generated Quiz"),
    topic: normalizeName(quiz.topic, "grammar"),
    difficulty: String(quiz.difficulty || "intermediate"),
    createdBy: String(quiz.createdBy || ""),
    createdAt: String(quiz.createdAt || nowIso()),
    updatedAt: nowIso(),
    source: String(quiz.source || "fallback"),
    questions: questions.map((question, index) => normalizeQuizQuestion(question, index))
  };
}

function readQuizzes() {
  const rows = readJson(STORAGE_KEYS.quizzes, []);
  return Array.isArray(rows) ? rows.map(normalizeQuiz) : [];
}

function writeQuizzes(rows) {
  return writeJson(STORAGE_KEYS.quizzes, (rows || []).map(normalizeQuiz).slice(-2000));
}

function normalizeQuizQuestion(row, index) {
  const question = row || {};
  const type = QUIZ_TYPES.includes(question.type) ? question.type : "multiple_choice";
  return {
    id: String(question.id || `q_${index + 1}`),
    type,
    prompt: normalizeName(question.prompt, "Choose the best answer."),
    options: Array.isArray(question.options) ? question.options.map((item) => String(item)) : [],
    correctAnswer: String(question.correctAnswer || ""),
    explanation: String(question.explanation || ""),
    xpReward: Math.max(5, Number(question.xpReward || 20))
  };
}

function normalizeTestAttempt(row) {
  const entry = row || {};
  return {
    id: String(entry.id || randomId("attempt")),
    quizId: String(entry.quizId || "").trim(),
    studentId: String(entry.studentId || "").trim(),
    classId: String(entry.classId || "").trim().toUpperCase(),
    startedAt: String(entry.startedAt || nowIso()),
    submittedAt: entry.submittedAt ? String(entry.submittedAt) : "",
    durationSeconds: Math.max(60, Number(entry.durationSeconds || 900)),
    tabLeaveCount: Math.max(0, Number(entry.tabLeaveCount || 0)),
    violationLog: Array.isArray(entry.violationLog) ? entry.violationLog : [],
    score: clamp(entry.score, 0, 100),
    answers: Array.isArray(entry.answers) ? entry.answers : []
  };
}

function readTestAttempts() {
  const rows = readJson(STORAGE_KEYS.testAttempts, []);
  return Array.isArray(rows) ? rows.map(normalizeTestAttempt) : [];
}

function writeTestAttempts(rows) {
  return writeJson(STORAGE_KEYS.testAttempts, (rows || []).map(normalizeTestAttempt).slice(-12000));
}

function readTestAttemptState() {
  const store = readJson(STORAGE_KEYS.testAttemptState, {});
  return store && typeof store === "object" ? store : {};
}

function writeTestAttemptState(store) {
  return writeJson(STORAGE_KEYS.testAttemptState, store || {});
}

function normalizeCoachSession(row) {
  const session = row || {};
  return {
    id: String(session.id || randomId("coach")),
    studentId: String(session.studentId || getActiveStudentId()),
    messages: Array.isArray(session.messages) ? session.messages : [],
    createdAt: String(session.createdAt || nowIso()),
    updatedAt: nowIso()
  };
}

function readCoachSessions() {
  const rows = readJson(STORAGE_KEYS.coachSessions, []);
  return Array.isArray(rows) ? rows.map(normalizeCoachSession) : [];
}

function writeCoachSessions(rows) {
  return writeJson(STORAGE_KEYS.coachSessions, (rows || []).map(normalizeCoachSession).slice(-2000));
}

function normalizeWorksheet(row) {
  const entry = row || {};
  return {
    id: String(entry.id || randomId("worksheet")),
    title: normalizeName(entry.title, "Grammar Spy Worksheet"),
    topic: normalizeName(entry.topic, "grammar"),
    difficulty: String(entry.difficulty || "intermediate"),
    type: WORKSHEET_TYPES.includes(entry.type) ? entry.type : "practice_worksheet",
    questions: Array.isArray(entry.questions) ? entry.questions.map((question, idx) => normalizeQuizQuestion(question, idx)) : [],
    answerKey: Array.isArray(entry.answerKey) ? entry.answerKey : [],
    createdBy: String(entry.createdBy || ""),
    createdAt: String(entry.createdAt || nowIso()),
    updatedAt: nowIso()
  };
}

function readWorksheets() {
  const rows = readJson(STORAGE_KEYS.worksheets, []);
  return Array.isArray(rows) ? rows.map(normalizeWorksheet) : [];
}

function writeWorksheets(rows) {
  return writeJson(STORAGE_KEYS.worksheets, (rows || []).map(normalizeWorksheet).slice(-2000));
}

function readAiConfig() {
  const local = readJson(STORAGE_KEYS.aiConfig, {});
  const cloud = window.GSCloud && typeof window.GSCloud.getConfig === "function" ? window.GSCloud.getConfig() : {};
  return {
    endpoint: String(local.endpoint || cloud.endpoint || "").trim(),
    apiKey: String(local.apiKey || cloud.apiKey || "").trim(),
    model: String(local.model || "").trim()
  };
}

function detectRole(hint) {
  if (hint === "teacher" || hint === "student") return hint;
  const pathname = String((window.location && window.location.pathname) || "").toLowerCase();
  if (pathname.includes("/dashboard/teacher") || pathname.includes("teacher")) return "teacher";
  if (pathname.includes("/dashboard/student") || pathname.includes("/student/")) return "student";
  const activeStudent = String(getActiveStudentId() || "").trim();
  return activeStudent && activeStudent !== "student_local" ? "student" : "teacher";
}

function resolveActor(actor) {
  const role = detectRole(actor && actor.role);
  if (role === "teacher") {
    const session = window.GS_AUTH && typeof window.GS_AUTH.getSession === "function" ? window.GS_AUTH.getSession() : null;
    const email = String((actor && actor.email) || (session && session.email) || "").trim().toLowerCase();
    const name = normalizeName((actor && actor.name) || (session && session.name) || "Teacher", "Teacher");
    const id = String((actor && actor.id) || (session && session.accountId) || slugId(email || name, "teacher_local"));
    return { role, id, name, email };
  }
  const studentId = String((actor && actor.id) || getActiveStudentId() || "student_local");
  const profile = getStudentProfile(studentId);
  return {
    role,
    id: studentId,
    name: normalizeName((actor && actor.name) || (profile && profile.display_name) || studentId, "Agent"),
    email: String((actor && actor.email) || "").trim().toLowerCase()
  };
}

function canPerform(actor, permission) {
  const role = detectRole(actor && actor.role);
  const set = ROLE_PERMISSIONS[role] || new Set();
  return set.has(permission);
}

function assertRole(actor, permission) {
  if (canPerform(actor, permission)) return;
  throw new Error(`Role '${detectRole(actor && actor.role)}' cannot perform '${permission}'.`);
}

function upsertTeacher(fields) {
  const teachers = readTeachers();
  const incoming = normalizeTeacher(fields || {});
  const idx = teachers.findIndex((teacher) => teacher.id === incoming.id || (incoming.email && teacher.email === incoming.email));
  if (idx >= 0) {
    teachers[idx] = normalizeTeacher({ ...teachers[idx], ...incoming });
  } else {
    teachers.push(incoming);
  }
  writeTeachers(teachers);
  return idx >= 0 ? teachers[idx] : incoming;
}

function generateJoinCode() {
  const used = new Set(readClassrooms().map((row) => row.joinCode));
  let code = defaultJoinCode();
  while (used.has(code)) code = defaultJoinCode();
  return code;
}

function createClass(input, actor) {
  assertRole(actor, "classroom:create");
  const creator = resolveActor(actor);
  const teacher = upsertTeacher({
    id: String(input?.teacherId || creator.id || randomId("teacher")),
    name: normalizeName(input?.teacherName || creator.name, "Teacher"),
    email: String(input?.teacherEmail || creator.email || "").trim().toLowerCase()
  });
  const classrooms = readClassrooms();
  const row = normalizeClassroom({
    id: randomId("class"),
    teacherId: teacher.id,
    name: normalizeName(input?.name, "Untitled Class"),
    joinCode: input?.joinCode ? toUpperCode(input.joinCode) : generateJoinCode(),
    createdAt: nowIso(),
    archived: false,
    studentIds: [],
    assignmentIds: []
  });
  classrooms.push(row);
  writeClassrooms(classrooms);
  return row;
}

function listClassesByTeacher(teacherId) {
  const id = String(teacherId || "").trim();
  if (!id) return [];
  return readClassrooms().filter((row) => row.teacherId === id);
}

function getClassroomById(classId) {
  const id = String(classId || "").trim();
  return readClassrooms().find((row) => row.id === id) || null;
}

function getClassroomByJoinCode(code) {
  const normalized = toUpperCode(code);
  if (!normalized) return null;
  return readClassrooms().find((row) => row.joinCode === normalized && !row.archived) || null;
}

function renameClass(classId, nextName, actor) {
  assertRole(actor, "classroom:manage");
  const id = String(classId || "").trim();
  const classrooms = readClassrooms();
  const index = classrooms.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("Classroom not found.");
  classrooms[index] = normalizeClassroom({ ...classrooms[index], name: normalizeName(nextName, classrooms[index].name) });
  writeClassrooms(classrooms);
  return classrooms[index];
}

function rotateClassJoinCode(classId, actor) {
  assertRole(actor, "classroom:manage");
  const id = String(classId || "").trim();
  const classrooms = readClassrooms();
  const index = classrooms.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("Classroom not found.");
  classrooms[index] = normalizeClassroom({
    ...classrooms[index],
    joinCode: generateJoinCode()
  });
  writeClassrooms(classrooms);
  return classrooms[index];
}

function archiveClass(classId, archived, actor) {
  assertRole(actor, "classroom:manage");
  const id = String(classId || "").trim();
  const classrooms = readClassrooms();
  const index = classrooms.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("Classroom not found.");
  classrooms[index] = normalizeClassroom({ ...classrooms[index], archived: Boolean(archived) });
  writeClassrooms(classrooms);
  return classrooms[index];
}

function deleteClass(classId, actor) {
  assertRole(actor, "classroom:manage");
  const id = String(classId || "").trim();
  const classrooms = readClassrooms().filter((row) => row.id !== id);
  writeClassrooms(classrooms);
  writeAssignments(readAssignments().filter((row) => row.classId !== id));
  writeStudentProgressRows(readStudentProgressRows().filter((row) => row.classId !== id));
  return true;
}

function upsertStudent(fields) {
  const students = readStudents();
  const seedId = fields?.id || fields?.studentId || fields?.guestIdentifier || `name_${slugId(fields?.name, "student")}`;
  const row = normalizeStudent({
    ...fields,
    id: String(seedId)
  });
  const idx = students.findIndex(
    (entry) => entry.id === row.id || (row.email && row.email === entry.email) || (row.guestIdentifier && row.guestIdentifier === entry.guestIdentifier)
  );
  if (idx >= 0) {
    const joinedClasses = uniq([
      ...students[idx].joinedClasses.map((entry) => `${entry.classId}::${entry.joinedAt}`),
      ...row.joinedClasses.map((entry) => `${entry.classId}::${entry.joinedAt}`)
    ]).map((entry) => {
      const [classId, joinedAt] = entry.split("::");
      return { classId, joinedAt };
    });
    students[idx] = normalizeStudent({ ...students[idx], ...row, joinedClasses });
  } else {
    students.push(row);
  }
  writeStudents(students);
  return idx >= 0 ? students[idx] : row;
}

function joinClassByCode(payload, actor) {
  assertRole(actor, "classroom:join");
  const code = toUpperCode(payload?.code || payload?.joinCode);
  if (!code) throw new Error("Join code is required.");
  const classroom = getClassroomByJoinCode(code);
  if (!classroom) throw new Error("Classroom code was not found.");

  const studentName = normalizeName(payload?.studentName || payload?.name, "Agent");
  const student = upsertStudent({
    id: payload?.studentId || `name_${slugId(studentName, "student")}`,
    name: studentName,
    email: payload?.email || "",
    guestIdentifier: payload?.guestIdentifier || payload?.studentId || "",
    joinedClasses: [{ classId: classroom.id, joinedAt: nowIso() }]
  });

  const classrooms = readClassrooms();
  const index = classrooms.findIndex((row) => row.id === classroom.id);
  if (index >= 0) {
    const nextIds = uniq([...(classrooms[index].studentIds || []), student.id]);
    classrooms[index] = normalizeClassroom({ ...classrooms[index], studentIds: nextIds });
    writeClassrooms(classrooms);
  }

  setActiveContext(student.id, classroom.joinCode);
  upsertStudentProfile(student.id, {
    display_name: student.name,
    class_id: classroom.joinCode,
    identity_ready: true
  });

  writeJson(STORAGE_KEYS.legacyStudentClassroom, {
    classroomId: classroom.id,
    classroomName: classroom.name,
    teacherId: classroom.teacherId,
    code: classroom.joinCode,
    studentId: student.id,
    studentName: student.name,
    joinedAt: nowIso()
  });

  return { classroom: getClassroomById(classroom.id), student };
}

function assignToClass(payload, actor) {
  assertRole(actor, "assignment:create");
  const classId = String(payload?.classId || "").trim();
  if (!classId) throw new Error("classId is required.");
  const classroom = getClassroomById(classId);
  if (!classroom) throw new Error("Classroom not found.");
  const type = ["mission", "quiz", "worksheet"].includes(payload?.type) ? payload.type : "mission";
  const assignment = normalizeAssignment({
    id: randomId("assign"),
    classId,
    type,
    targetId: String(payload?.targetId || "").trim(),
    title: normalizeName(payload?.title, "Class Assignment"),
    assignedAt: nowIso(),
    dueAt: payload?.dueAt || "",
    status: payload?.status || "active",
    createdBy: String(payload?.createdBy || resolveActor(actor).id)
  });
  const assignments = readAssignments();
  assignments.push(assignment);
  writeAssignments(assignments);

  const classrooms = readClassrooms();
  const index = classrooms.findIndex((row) => row.id === classId);
  if (index >= 0) {
    classrooms[index] = normalizeClassroom({
      ...classrooms[index],
      assignmentIds: uniq([...(classrooms[index].assignmentIds || []), assignment.id])
    });
    writeClassrooms(classrooms);
  }
  return assignment;
}

function getClassAssignments(classId) {
  const id = String(classId || "").trim();
  return readAssignments()
    .filter((row) => row.classId === id)
    .sort((a, b) => String(b.assignedAt).localeCompare(String(a.assignedAt)));
}

function getClassRoster(classId) {
  const classroom = getClassroomById(classId);
  if (!classroom) return [];
  const students = readStudents();
  const byId = new Map(students.map((row) => [row.id, row]));
  return (classroom.studentIds || [])
    .map((studentId) => byId.get(studentId))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function upsertStudentProgress(payload) {
  const rows = readStudentProgressRows();
  const row = normalizeStudentProgress(payload || {});
  const index = rows.findIndex(
    (entry) =>
      entry.classId === row.classId &&
      entry.studentId === row.studentId &&
      entry.assignmentId === row.assignmentId &&
      entry.missionId === row.missionId &&
      entry.quizId === row.quizId
  );
  if (index >= 0) {
    rows[index] = normalizeStudentProgress({ ...rows[index], ...row });
  } else {
    rows.push(row);
  }
  writeStudentProgressRows(rows);
  return index >= 0 ? rows[index] : row;
}

function listClassStudentProgress(classId) {
  const id = String(classId || "").trim();
  return readStudentProgressRows().filter((row) => row.classId === id);
}

function assignmentCompletionForStudent(assignment, studentId, classId, missionAttempts, quizAttempts, worksheetProgressRows) {
  if (!assignment || !studentId) return false;
  if (assignment.type === "mission") {
    return missionAttempts.some((attempt) => attempt.student_id === studentId && attempt.class_id === classId && attempt.mission_id === assignment.targetId);
  }
  if (assignment.type === "quiz") {
    return quizAttempts.some((attempt) => attempt.studentId === studentId && attempt.classId === classId && attempt.quizId === assignment.targetId && attempt.submittedAt);
  }
  if (assignment.type === "worksheet") {
    return worksheetProgressRows.some(
      (row) => row.studentId === studentId && row.classId === classId && row.assignmentId === assignment.id && Number(row.completionPercent) >= 100
    );
  }
  return false;
}

function getClassProgress(classId) {
  const classroom = getClassroomById(classId);
  if (!classroom) {
    return {
      classId: String(classId || ""),
      className: "",
      assignmentCount: 0,
      studentCount: 0,
      averageAccuracy: 0,
      averageCompletion: 0,
      students: [],
      assignments: []
    };
  }

  const roster = getClassRoster(classroom.id);
  const assignments = getClassAssignments(classroom.id).filter((row) => row.status !== "archived");
  const missionAttempts = getAllAttempts();
  const quizAttempts = readTestAttempts();
  const worksheetProgressRows = listClassStudentProgress(classroom.id);
  const profiles = new Map(listStudentProfiles().map((row) => [row.student_id, row]));

  const students = roster.map((student) => {
    const missionRows = missionAttempts.filter(
      (attempt) => attempt.student_id === student.id && String(attempt.class_id).toUpperCase() === classroom.joinCode
    );
    const quizRows = quizAttempts.filter(
      (attempt) => attempt.studentId === student.id && String(attempt.classId).toUpperCase() === classroom.joinCode && attempt.submittedAt
    );
    const completionCount = assignments.filter((assignment) =>
      assignmentCompletionForStudent(assignment, student.id, classroom.joinCode, missionAttempts, quizAttempts, worksheetProgressRows)
    ).length;
    const completionPercent = assignments.length ? Math.round((completionCount / assignments.length) * 100) : 0;
    const profile = profiles.get(student.id) || getStudentProfile(student.id) || null;
    const avgMissionAccuracy = average(missionRows.map((row) => Number(row.accuracy || 0)));
    const avgQuizScore = average(quizRows.map((row) => Number(row.score || 0)));
    const blendedAccuracy = missionRows.length || quizRows.length ? average([avgMissionAccuracy, avgQuizScore].filter((v) => v > 0)) : 0;
    const lastPlayedAt = [missionRows[0]?.created_at || "", quizRows[0]?.submittedAt || "", student.updatedAt || ""]
      .filter(Boolean)
      .sort((a, b) => String(b).localeCompare(String(a)))[0];
    return {
      id: student.id,
      name: student.name,
      completionPercent,
      assignmentsCompleted: completionCount,
      xpEarned: Number((profile && profile.total_xp) || 0),
      accuracy: blendedAccuracy,
      streak: Number((profile && profile.streak_days) || 0),
      lastPlayedAt: lastPlayedAt || "",
      tabLeaveCount: quizRows.reduce((sum, row) => sum + Number(row.tabLeaveCount || 0), 0)
    };
  });

  return {
    classId: classroom.id,
    className: classroom.name,
    joinCode: classroom.joinCode,
    assignmentCount: assignments.length,
    studentCount: roster.length,
    averageAccuracy: average(students.map((row) => row.accuracy)),
    averageCompletion: average(students.map((row) => row.completionPercent)),
    students,
    assignments
  };
}

function normalizeTopic(topic) {
  const clean = String(topic || "").toLowerCase().trim();
  if (clean.includes("past")) return "past_tense";
  if (clean.includes("present")) return "present_tense";
  if (clean.includes("subject")) return "subject_verb_agreement";
  if (clean.includes("aux")) return "auxiliary_verbs";
  if (clean.includes("plural") || clean.includes("singular")) return "plural_singular";
  if (clean.includes("consisten")) return "tense_consistency";
  return clean.replace(/[^a-z0-9]+/g, "_") || "present_tense";
}

function difficultyLabel(difficulty) {
  const clean = String(difficulty || "intermediate").toLowerCase();
  if (["beginner", "rookie", "easy"].includes(clean)) return "beginner";
  if (["advanced", "hard", "senior"].includes(clean)) return "advanced";
  return "intermediate";
}

function shuffle(list) {
  const rows = [...(list || [])];
  for (let idx = rows.length - 1; idx > 0; idx -= 1) {
    const swap = Math.floor(Math.random() * (idx + 1));
    const next = rows[idx];
    rows[idx] = rows[swap];
    rows[swap] = next;
  }
  return rows;
}

function pickBankRows(topic, count) {
  const key = normalizeTopic(topic);
  const rows = GRAMMAR_BANK[key] || GRAMMAR_BANK.present_tense;
  const picks = [];
  while (picks.length < count) {
    const row = rows[picks.length % rows.length];
    picks.push({ ...row });
  }
  return picks;
}

function splitSentence(sentence) {
  return String(sentence || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function extractWrongToken(entry) {
  const wrongTokens = splitSentence(entry.incorrect);
  const rightTokens = splitSentence(entry.corrected);
  for (let idx = 0; idx < Math.max(wrongTokens.length, rightTokens.length); idx += 1) {
    if (wrongTokens[idx] !== rightTokens[idx]) {
      return {
        wrong: wrongTokens[idx] || "",
        correct: rightTokens[idx] || ""
      };
    }
  }
  return { wrong: wrongTokens[0] || "", correct: rightTokens[0] || "" };
}

function difficultyXp(difficulty) {
  const label = difficultyLabel(difficulty);
  if (label === "beginner") return 15;
  if (label === "advanced") return 30;
  return 22;
}

function buildQuestion(entry, type, index, difficulty) {
  const token = extractWrongToken(entry);
  const xpReward = difficultyXp(difficulty);
  if (type === "error_correction") {
    return normalizeQuizQuestion(
      {
        id: `q_${index + 1}`,
        type,
        prompt: `Fix the sentence: ${entry.incorrect}`,
        options: [],
        correctAnswer: entry.corrected,
        explanation: entry.explanation,
        xpReward
      },
      index
    );
  }
  if (type === "fill_blank") {
    const prompt = entry.incorrect.replace(token.wrong, "_____");
    return normalizeQuizQuestion(
      {
        id: `q_${index + 1}`,
        type,
        prompt: `Fill in the blank: ${prompt}`,
        options: [],
        correctAnswer: token.correct || entry.corrected,
        explanation: entry.explanation,
        xpReward
      },
      index
    );
  }
  if (type === "sentence_builder") {
    const tokens = shuffle(splitSentence(entry.corrected));
    return normalizeQuizQuestion(
      {
        id: `q_${index + 1}`,
        type,
        prompt: "Reorder the words to build the correct sentence.",
        options: tokens,
        correctAnswer: entry.corrected,
        explanation: entry.explanation,
        xpReward
      },
      index
    );
  }
  const distractors = shuffle(
    uniq([
      token.wrong,
      token.correct,
      `did ${token.wrong}`,
      token.correct.endsWith("s") ? token.correct.slice(0, -1) : `${token.correct}s`
    ])
  ).slice(0, 4);
  if (!distractors.includes(token.correct)) distractors[0] = token.correct;
  return normalizeQuizQuestion(
    {
      id: `q_${index + 1}`,
      type: "multiple_choice",
      prompt: `${entry.incorrect} Choose the best correction for "${token.wrong}".`,
      options: distractors,
      correctAnswer: token.correct,
      explanation: entry.explanation,
      xpReward
    },
    index
  );
}

function validateQuizQuestions(input) {
  const questions = Array.isArray(input) ? input : Array.isArray(input?.questions) ? input.questions : [];
  const errors = [];
  const normalized = questions.map((row, idx) => normalizeQuizQuestion(row, idx));
  normalized.forEach((question, idx) => {
    if (!QUIZ_TYPES.includes(question.type)) errors.push(`Question ${idx + 1}: unsupported type '${question.type}'.`);
    if (!question.prompt) errors.push(`Question ${idx + 1}: prompt is required.`);
    if (!question.correctAnswer) errors.push(`Question ${idx + 1}: correctAnswer is required.`);
    if (question.type === "multiple_choice" && (!question.options || question.options.length < 2)) {
      errors.push(`Question ${idx + 1}: multiple_choice requires at least 2 options.`);
    }
  });
  return {
    ok: errors.length === 0,
    errors,
    questions: normalized
  };
}

async function callAiJson(payload) {
  const cfg = readAiConfig();
  if (window.GSAI && typeof window.GSAI.generate === "function") {
    return window.GSAI.generate(payload);
  }
  if (!cfg.endpoint) return null;
  const headers = { "Content-Type": "application/json" };
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`;
  const response = await fetch(cfg.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`AI request failed (${response.status}).`);
  return response.json();
}

async function tryAiQuizGeneration(input, actor) {
  const payload = {
    task: "generate_grammar_quiz",
    topic: input.topic,
    difficulty: input.difficulty,
    count: input.count,
    types: input.types,
    constraints: [
      "Return JSON with fields: title, topic, difficulty, questions.",
      "Each question must include type, prompt, options if needed, correctAnswer, explanation, xpReward.",
      "Focus on ESL/ELD grammar rules only."
    ]
  };
  const data = await callAiJson(payload);
  if (!data || !data.questions) return null;
  const quiz = normalizeQuiz({
    id: randomId("quiz"),
    title: data.title || `${normalizeName(input.topic, "Grammar")} Quiz`,
    topic: input.topic,
    difficulty: input.difficulty,
    createdBy: resolveActor(actor).id,
    source: "ai",
    questions: data.questions
  });
  const validation = validateQuizQuestions(quiz.questions);
  if (!validation.ok) return null;
  quiz.questions = validation.questions;
  return quiz;
}

function fallbackQuizGeneration(input, actor) {
  const count = Math.max(1, Number(input?.count || 10));
  const types = Array.isArray(input?.types) && input.types.length ? input.types.filter((row) => QUIZ_TYPES.includes(row)) : QUIZ_TYPES.slice(0, 3);
  const picks = pickBankRows(input.topic, count);
  const questions = picks.map((entry, idx) => buildQuestion(entry, types[idx % types.length], idx, input.difficulty));
  return normalizeQuiz({
    id: randomId("quiz"),
    title: input.title || `${normalizeName(input.topic, "Grammar")} Quiz`,
    topic: normalizeName(input.topic, "grammar"),
    difficulty: difficultyLabel(input.difficulty),
    createdBy: resolveActor(actor).id,
    source: "fallback",
    questions
  });
}

async function generateQuiz(input, actor) {
  assertRole(actor, "quiz:create");
  const payload = {
    topic: normalizeName(input?.topic, "Grammar"),
    difficulty: difficultyLabel(input?.difficulty),
    count: Math.max(1, Number(input?.count || 10)),
    types: Array.isArray(input?.types) ? input.types : []
  };
  let quiz = null;
  try {
    quiz = await tryAiQuizGeneration(payload, actor);
  } catch (_err) {
    quiz = null;
  }
  if (!quiz) quiz = fallbackQuizGeneration(payload, actor);
  const validation = validateQuizQuestions(quiz.questions);
  if (!validation.ok) throw new Error(`Generated quiz failed validation: ${validation.errors.join(" ")}`);
  quiz.questions = validation.questions;
  return quiz;
}

function saveQuiz(quiz, actor) {
  assertRole(actor, "quiz:create");
  const row = normalizeQuiz(quiz || {});
  const validation = validateQuizQuestions(row.questions);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  row.questions = validation.questions;
  const quizzes = readQuizzes();
  const idx = quizzes.findIndex((entry) => entry.id === row.id);
  if (idx >= 0) quizzes[idx] = normalizeQuiz({ ...quizzes[idx], ...row, updatedAt: nowIso() });
  else quizzes.push(row);
  writeQuizzes(quizzes);
  return idx >= 0 ? quizzes[idx] : row;
}

function updateQuiz(quizId, patch, actor) {
  assertRole(actor, "quiz:create");
  const id = String(quizId || "").trim();
  const quizzes = readQuizzes();
  const idx = quizzes.findIndex((entry) => entry.id === id);
  if (idx < 0) throw new Error("Quiz not found.");
  const next = normalizeQuiz({ ...quizzes[idx], ...(patch || {}), id, updatedAt: nowIso() });
  const validation = validateQuizQuestions(next.questions);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  next.questions = validation.questions;
  quizzes[idx] = next;
  writeQuizzes(quizzes);
  return next;
}

function listQuizzes() {
  return readQuizzes().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getQuizById(quizId) {
  const id = String(quizId || "").trim();
  return readQuizzes().find((row) => row.id === id) || null;
}

function assignQuizToClass(payload, actor) {
  assertRole(actor, "assignment:create");
  const quiz = getQuizById(payload?.quizId);
  if (!quiz) throw new Error("Quiz not found.");
  return assignToClass(
    {
      classId: payload.classId,
      type: "quiz",
      targetId: quiz.id,
      title: payload.title || quiz.title,
      dueAt: payload.dueAt || "",
      status: payload.status || "active",
      createdBy: payload.createdBy || resolveActor(actor).id
    },
    actor
  );
}

function startTestAttempt(payload, actor) {
  assertRole(actor, "quiz:take");
  const quizId = String(payload?.quizId || "").trim();
  const quiz = getQuizById(quizId);
  if (!quiz) throw new Error("Quiz not found.");
  const student = resolveActor({ ...(actor || {}), role: "student" });
  const classId = String(payload?.classId || getActiveClassId() || "DEMO").toUpperCase();
  const attempts = readTestAttempts();
  const existing = attempts.find(
    (row) => row.quizId === quizId && row.studentId === student.id && row.classId === classId && !row.submittedAt
  );
  if (existing) return existing;
  const entry = normalizeTestAttempt({
    id: randomId("attempt"),
    quizId,
    studentId: student.id,
    classId,
    startedAt: nowIso(),
    submittedAt: "",
    durationSeconds: Math.max(60, Number(payload?.durationSeconds || 900)),
    tabLeaveCount: 0,
    violationLog: [],
    score: 0,
    answers: []
  });
  attempts.push(entry);
  writeTestAttempts(attempts);
  const state = readTestAttemptState();
  state[entry.id] = {
    attemptId: entry.id,
    answers: [],
    warningShown: false,
    expiresAt: new Date(Date.parse(entry.startedAt) + entry.durationSeconds * 1000).toISOString(),
    remainingSeconds: entry.durationSeconds,
    updatedAt: nowIso()
  };
  writeTestAttemptState(state);
  return entry;
}

function getTestAttempt(attemptId) {
  const id = String(attemptId || "").trim();
  return readTestAttempts().find((row) => row.id === id) || null;
}

function listTestAttempts(filters = {}) {
  const rows = readTestAttempts();
  return rows.filter((row) => {
    if (filters.quizId && row.quizId !== filters.quizId) return false;
    if (filters.studentId && row.studentId !== filters.studentId) return false;
    if (filters.classId && String(row.classId).toUpperCase() !== String(filters.classId).toUpperCase()) return false;
    return true;
  });
}

function logViolation(attemptId, type, details = {}) {
  const attempts = readTestAttempts();
  const idx = attempts.findIndex((row) => row.id === String(attemptId || ""));
  if (idx < 0) throw new Error("Attempt not found.");
  const violation = {
    timestamp: nowIso(),
    type: ["tab_leave", "copy_attempt", "context_menu", "blur"].includes(type) ? type : "blur",
    details
  };
  const current = attempts[idx];
  const tabLeaveCount = ["tab_leave", "blur"].includes(violation.type)
    ? Number(current.tabLeaveCount || 0) + 1
    : Number(current.tabLeaveCount || 0);
  attempts[idx] = normalizeTestAttempt({
    ...current,
    tabLeaveCount,
    violationLog: [...(current.violationLog || []), violation]
  });
  writeTestAttempts(attempts);
  return attempts[idx];
}

function saveTestAttemptDraft(attemptId, answers, remainingSeconds) {
  const state = readTestAttemptState();
  const id = String(attemptId || "").trim();
  const current = state[id] || {};
  state[id] = {
    ...current,
    attemptId: id,
    answers: Array.isArray(answers) ? answers : current.answers || [],
    remainingSeconds: Math.max(0, Number(remainingSeconds ?? current.remainingSeconds ?? 0)),
    updatedAt: nowIso()
  };
  writeTestAttemptState(state);
  return state[id];
}

function submitTestAttempt(payload) {
  const attemptId = String(payload?.attemptId || "").trim();
  const attempts = readTestAttempts();
  const idx = attempts.findIndex((row) => row.id === attemptId);
  if (idx < 0) throw new Error("Attempt not found.");
  const current = attempts[idx];
  if (current.submittedAt) return current;
  const answers = Array.isArray(payload?.answers) ? payload.answers : current.answers;
  const score = clamp(payload?.score, 0, 100);
  const submitted = normalizeTestAttempt({
    ...current,
    answers,
    score,
    submittedAt: nowIso()
  });
  attempts[idx] = submitted;
  writeTestAttempts(attempts);

  const state = readTestAttemptState();
  delete state[attemptId];
  writeTestAttemptState(state);

  upsertStudentProgress({
    id: randomId("progress"),
    classId: submitted.classId,
    studentId: submitted.studentId,
    quizId: submitted.quizId,
    missionId: "",
    assignmentId: "",
    completionPercent: 100,
    xpEarned: Math.round((score / 100) * 80),
    accuracy: score,
    streak: 0,
    lastPlayedAt: submitted.submittedAt
  });
  return submitted;
}

function autoSubmitIfNeeded(attemptId) {
  const attempt = getTestAttempt(attemptId);
  if (!attempt || attempt.submittedAt) return attempt;
  const state = readTestAttemptState()[attempt.id];
  if (!state || !state.expiresAt) return attempt;
  if (Date.now() < Date.parse(state.expiresAt)) return attempt;
  return submitTestAttempt({
    attemptId: attempt.id,
    answers: state.answers || [],
    score: 0
  });
}

function createTestModeRuntime(options) {
  const attemptId = String(options?.attemptId || "").trim();
  if (!attemptId) throw new Error("attemptId is required.");
  const attempt = getTestAttempt(attemptId);
  if (!attempt) throw new Error("Attempt not found.");
  if (typeof document === "undefined") {
    return {
      stop() {},
      saveAnswers() {},
      getAttempt() {
        return getTestAttempt(attemptId);
      }
    };
  }
  const stateStore = readTestAttemptState();
  const initial = stateStore[attemptId] || {
    attemptId,
    answers: [],
    warningShown: false,
    remainingSeconds: attempt.durationSeconds,
    expiresAt: new Date(Date.parse(attempt.startedAt) + attempt.durationSeconds * 1000).toISOString()
  };
  writeTestAttemptState({ ...stateStore, [attemptId]: initial });

  function updateState(patch) {
    const rows = readTestAttemptState();
    rows[attemptId] = { ...(rows[attemptId] || initial), ...patch, updatedAt: nowIso() };
    writeTestAttemptState(rows);
    return rows[attemptId];
  }

  function handleViolation(type, details) {
    const updatedAttempt = logViolation(attemptId, type, details);
    const draft = readTestAttemptState()[attemptId] || initial;
    if (!draft.warningShown && (type === "tab_leave" || type === "blur")) {
      updateState({ warningShown: true });
      if (typeof options?.onWarning === "function") options.onWarning(updatedAttempt);
    } else if (typeof options?.onViolation === "function") {
      options.onViolation(updatedAttempt);
    }
  }

  function onVisibilityChange() {
    if (document.hidden) handleViolation("tab_leave", { reason: "visibility_hidden" });
  }

  function onWindowBlur() {
    handleViolation("blur", { reason: "window_blur" });
  }

  function onCopy(ev) {
    ev.preventDefault();
    handleViolation("copy_attempt", { reason: "copy_blocked" });
  }

  function onPaste(ev) {
    ev.preventDefault();
    handleViolation("copy_attempt", { reason: "paste_blocked" });
  }

  function onContextMenu(ev) {
    ev.preventDefault();
    handleViolation("context_menu", { reason: "context_menu_blocked" });
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("blur", onWindowBlur);
  document.addEventListener("copy", onCopy);
  document.addEventListener("paste", onPaste);
  document.addEventListener("contextmenu", onContextMenu);

  const tick = window.setInterval(() => {
    const draft = readTestAttemptState()[attemptId];
    if (!draft) return;
    const remainingSeconds = Math.max(0, Math.round((Date.parse(draft.expiresAt) - Date.now()) / 1000));
    updateState({ remainingSeconds });
    if (typeof options?.onTick === "function") options.onTick(remainingSeconds);
    if (remainingSeconds <= 0) {
      window.clearInterval(tick);
      const submitted = autoSubmitIfNeeded(attemptId);
      if (typeof options?.onAutoSubmit === "function") options.onAutoSubmit(submitted);
    }
  }, 1000);

  return {
    stop() {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    },
    saveAnswers(answers) {
      const draft = readTestAttemptState()[attemptId];
      const remainingSeconds = draft ? draft.remainingSeconds : attempt.durationSeconds;
      saveTestAttemptDraft(attemptId, answers, remainingSeconds);
    },
    getAttempt() {
      return getTestAttempt(attemptId);
    }
  };
}

function analyzeGrammarInput(input) {
  const text = String(input || "").trim();
  if (!text) {
    return {
      correctedSentence: "",
      shortExplanation: "Share one sentence and I will help correct it.",
      relatedRule: "sentence basics",
      extraExample: "Example: She goes to school every day.",
      practicePrompt: "Try correcting: He go to class on time."
    };
  }
  const lowered = text.toLowerCase();
  if (lowered.includes("she go")) {
    return {
      correctedSentence: text.replace(/she go/gi, "She goes"),
      shortExplanation: "With he/she/it in simple present, the verb usually takes -s or -es.",
      relatedRule: "third person singular simple present",
      extraExample: "He studies before dinner.",
      practicePrompt: "Fix this: My sister walk to school."
    };
  }
  if (lowered.includes("they is")) {
    return {
      correctedSentence: text.replace(/they is/gi, "They are"),
      shortExplanation: "Use 'are' with plural subjects like they/we/you.",
      relatedRule: "be-verb agreement",
      extraExample: "They are ready for the mission.",
      practicePrompt: "Fix this: The students is in the lab."
    };
  }
  if (lowered.includes("didn't went")) {
    return {
      correctedSentence: text.replace(/didn'?t went/gi, "didn't go"),
      shortExplanation: "After did/didn't, use the base form of the verb.",
      relatedRule: "auxiliary + base verb",
      extraExample: "We didn't finish early.",
      practicePrompt: "Fix this: She didn't ate breakfast."
    };
  }
  if (lowered.includes("yesterday") && /\bgo\b/.test(lowered)) {
    return {
      correctedSentence: text.replace(/\bgo\b/gi, "went"),
      shortExplanation: "Past-time markers like 'yesterday' usually require simple past.",
      relatedRule: "simple past tense",
      extraExample: "Yesterday they watched a movie.",
      practicePrompt: "Fix this: Last week he walk to class."
    };
  }
  return {
    correctedSentence: text,
    shortExplanation: "I checked the sentence. If it sounds off, check subject-verb agreement and tense consistency first.",
    relatedRule: "grammar review strategy",
    extraExample: "The students are preparing for the test.",
    practicePrompt: "Try this check: Identify subject, tense, and verb form."
  };
}

function grammarCoachResponse(analysis) {
  return [
    `Corrected sentence: ${analysis.correctedSentence || "(no correction needed)"}`,
    `Why: ${analysis.shortExplanation}`,
    `Related rule: ${analysis.relatedRule}`,
    `Example: ${analysis.extraExample}`,
    `Quick practice: ${analysis.practicePrompt}`
  ].join("\n");
}

async function tryAiCoachReply(message) {
  const payload = {
    task: "grammar_coach",
    userMessage: message,
    constraints: [
      "Only discuss English grammar.",
      "Return JSON with correctedSentence, shortExplanation, relatedRule, extraExample, practicePrompt.",
      "Keep explanations concise and supportive for high-school ESL/ELD learners."
    ]
  };
  const data = await callAiJson(payload);
  if (!data) return null;
  if (!data.correctedSentence && !data.shortExplanation) return null;
  return {
    correctedSentence: String(data.correctedSentence || ""),
    shortExplanation: String(data.shortExplanation || ""),
    relatedRule: String(data.relatedRule || "grammar rule"),
    extraExample: String(data.extraExample || ""),
    practicePrompt: String(data.practicePrompt || "")
  };
}

function createCoachSession(payload, actor) {
  assertRole(actor, "coach:chat");
  const student = resolveActor({ ...(actor || {}), role: "student", id: payload?.studentId || getActiveStudentId() });
  const sessions = readCoachSessions();
  const entry = normalizeCoachSession({
    id: randomId("coach"),
    studentId: student.id,
    messages: [],
    createdAt: nowIso()
  });
  sessions.push(entry);
  writeCoachSessions(sessions);
  return entry;
}

function getCoachSession(sessionId) {
  const id = String(sessionId || "").trim();
  return readCoachSessions().find((row) => row.id === id) || null;
}

function listCoachSessions(studentId) {
  const id = String(studentId || "").trim();
  return readCoachSessions()
    .filter((row) => (!id ? true : row.studentId === id))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

async function sendCoachMessage(payload, actor) {
  assertRole(actor, "coach:chat");
  const sessionId = String(payload?.sessionId || "").trim();
  const sessions = readCoachSessions();
  const idx = sessions.findIndex((row) => row.id === sessionId);
  if (idx < 0) throw new Error("Coach session not found.");
  const content = normalizeName(payload?.content, "");
  if (!content) throw new Error("Message content is required.");
  const userMessage = {
    id: randomId("msg"),
    role: "user",
    content,
    createdAt: nowIso()
  };
  const updatedMessages = [...sessions[idx].messages, userMessage];
  let analysis = null;
  try {
    analysis = await tryAiCoachReply(content);
  } catch (_err) {
    analysis = null;
  }
  if (!analysis) analysis = analyzeGrammarInput(content);
  const assistantMessage = {
    id: randomId("msg"),
    role: "assistant",
    content: grammarCoachResponse(analysis),
    createdAt: nowIso(),
    analysis
  };
  sessions[idx] = normalizeCoachSession({
    ...sessions[idx],
    messages: [...updatedMessages, assistantMessage],
    updatedAt: nowIso()
  });
  writeCoachSessions(sessions);
  return {
    session: sessions[idx],
    message: assistantMessage
  };
}

function generatePracticeFollowup(ruleOrAnalysis) {
  const rule = typeof ruleOrAnalysis === "string" ? ruleOrAnalysis : ruleOrAnalysis?.relatedRule || "";
  const normalized = normalizeTopic(rule);
  const sample = pickBankRows(normalized, 1)[0];
  return {
    prompt: `Try this: ${sample.incorrect}`,
    expected: sample.corrected,
    explanation: sample.explanation
  };
}

async function generateWorksheet(payload, actor) {
  assertRole(actor, "worksheet:create");
  const type = WORKSHEET_TYPES.includes(payload?.type) ? payload.type : "practice_worksheet";
  const questionTypes = Array.isArray(payload?.questionTypes) && payload.questionTypes.length ? payload.questionTypes : ["fill_blank", "error_correction"];
  const baseQuiz = fallbackQuizGeneration(
    {
      topic: payload?.topic || "grammar",
      difficulty: payload?.difficulty || "intermediate",
      count: Math.max(1, Number(payload?.count || 10)),
      types: questionTypes
    },
    actor
  );
  const worksheet = normalizeWorksheet({
    id: randomId("worksheet"),
    title: payload?.title || `${normalizeName(payload?.topic, "Grammar")} ${type.replace(/_/g, " ")}`,
    topic: payload?.topic || "grammar",
    difficulty: payload?.difficulty || "intermediate",
    type,
    questions: baseQuiz.questions,
    answerKey: [],
    createdBy: resolveActor(actor).id,
    createdAt: nowIso()
  });
  worksheet.answerKey = buildAnswerKey(worksheet);
  return worksheet;
}

function buildAnswerKey(worksheet) {
  const row = normalizeWorksheet(worksheet || {});
  return row.questions.map((question, idx) => ({
    questionNumber: idx + 1,
    questionId: question.id,
    answer: question.correctAnswer,
    explanation: question.explanation
  }));
}

function saveWorksheet(worksheet, actor) {
  assertRole(actor, "worksheet:create");
  const row = normalizeWorksheet({ ...(worksheet || {}), answerKey: buildAnswerKey(worksheet) });
  const rows = readWorksheets();
  const idx = rows.findIndex((entry) => entry.id === row.id);
  if (idx >= 0) rows[idx] = normalizeWorksheet({ ...rows[idx], ...row, updatedAt: nowIso() });
  else rows.push(row);
  writeWorksheets(rows);
  return idx >= 0 ? rows[idx] : row;
}

function getWorksheetById(worksheetId) {
  const id = String(worksheetId || "").trim();
  return readWorksheets().find((row) => row.id === id) || null;
}

function listWorksheets() {
  return readWorksheets().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function exportWorksheetData(worksheetOrId) {
  const worksheet =
    typeof worksheetOrId === "string" ? getWorksheetById(worksheetOrId) : normalizeWorksheet(worksheetOrId || {});
  if (!worksheet) throw new Error("Worksheet not found.");
  const answerKey = buildAnswerKey(worksheet);
  return {
    worksheetId: worksheet.id,
    printable: {
      title: worksheet.title,
      meta: {
        topic: worksheet.topic,
        difficulty: worksheet.difficulty,
        type: worksheet.type,
        createdAt: worksheet.createdAt
      },
      instructions: "Complete each question. Show edits clearly for correction questions.",
      questions: worksheet.questions.map((question, idx) => ({
        number: idx + 1,
        type: question.type,
        prompt: question.prompt,
        options: question.options
      }))
    },
    answerKey,
    exportVersion: 1
  };
}

function awardStudentXp(payload) {
  const studentId = String(payload?.studentId || getActiveStudentId() || "student_local");
  const amount = Math.max(0, Number(payload?.amount || 0));
  const metadata = payload?.metadata || {};
  return awardXp(studentId, amount, metadata);
}

function trackMissionProgress(payload) {
  return upsertStudentProgress({
    id: randomId("progress"),
    classId: payload?.classId || getActiveClassId(),
    studentId: payload?.studentId || getActiveStudentId(),
    missionId: payload?.missionId || "",
    quizId: "",
    assignmentId: payload?.assignmentId || "",
    completionPercent: clamp(payload?.completionPercent, 0, 100),
    xpEarned: Math.max(0, Number(payload?.xpEarned || 0)),
    accuracy: clamp(payload?.accuracy, 0, 100),
    streak: Math.max(0, Number(payload?.streak || 0)),
    lastPlayedAt: payload?.lastPlayedAt || nowIso()
  });
}

function trackQuizAttemptProgress(payload) {
  return upsertStudentProgress({
    id: randomId("progress"),
    classId: payload?.classId || getActiveClassId(),
    studentId: payload?.studentId || getActiveStudentId(),
    missionId: "",
    quizId: payload?.quizId || "",
    assignmentId: payload?.assignmentId || "",
    completionPercent: clamp(payload?.completionPercent ?? 100, 0, 100),
    xpEarned: Math.max(0, Number(payload?.xpEarned || 0)),
    accuracy: clamp(payload?.accuracy, 0, 100),
    streak: 0,
    lastPlayedAt: payload?.lastPlayedAt || nowIso()
  });
}

function getCurrentRole() {
  return detectRole();
}

function getTeacherRecord(actor) {
  const resolved = resolveActor({ ...(actor || {}), role: "teacher" });
  return upsertTeacher(resolved);
}

function ensureDashboardClassroom(classCode, actor) {
  const teacher = getTeacherRecord(actor);
  const code = toUpperCode(classCode || getActiveClassId() || "");
  const classrooms = readClassrooms();
  let classroom = classrooms.find((row) => row.joinCode === code && row.teacherId === teacher.id);
  if (!classroom && code) {
    classroom = normalizeClassroom({
      id: randomId("class"),
      teacherId: teacher.id,
      name: `Class ${code}`,
      joinCode: code,
      createdAt: nowIso(),
      archived: false
    });
    classrooms.push(classroom);
    writeClassrooms(classrooms);
  }
  if (!classroom) {
    classroom = createClass({ name: "Demo Class", teacherId: teacher.id }, { role: "teacher", id: teacher.id });
  }
  return classroom;
}

const API = {
  storageKeys: STORAGE_KEYS,
  getCurrentRole,
  resolveActor,
  canPerform,
  assertRole,
  getTeacherRecord,
  ensureDashboardClassroom,
  createClass,
  generateJoinCode,
  joinClassByCode,
  renameClass,
  rotateClassJoinCode,
  archiveClass,
  deleteClass,
  getClassroomById,
  getClassroomByJoinCode,
  listClassesByTeacher,
  assignToClass,
  getClassAssignments,
  getClassRoster,
  getClassProgress,
  upsertStudentProgress,
  listClassStudentProgress,
  generateQuiz,
  validateQuizQuestions,
  saveQuiz,
  updateQuiz,
  listQuizzes,
  getQuizById,
  assignQuizToClass,
  startTestAttempt,
  logViolation,
  autoSubmitIfNeeded,
  submitTestAttempt,
  getTestAttempt,
  listTestAttempts,
  saveTestAttemptDraft,
  createTestModeRuntime,
  createCoachSession,
  sendCoachMessage,
  analyzeGrammarInput,
  generatePracticeFollowup,
  getCoachSession,
  listCoachSessions,
  generateWorksheet,
  buildAnswerKey,
  saveWorksheet,
  getWorksheetById,
  listWorksheets,
  exportWorksheetData,
  awardStudentXp,
  trackMissionProgress,
  trackQuizAttemptProgress
};

if (typeof window !== "undefined") {
  window.GSProductSystem = API;
}

export {
  STORAGE_KEYS,
  getCurrentRole,
  resolveActor,
  canPerform,
  assertRole,
  getTeacherRecord,
  ensureDashboardClassroom,
  createClass,
  generateJoinCode,
  joinClassByCode,
  renameClass,
  rotateClassJoinCode,
  archiveClass,
  deleteClass,
  getClassroomById,
  getClassroomByJoinCode,
  listClassesByTeacher,
  assignToClass,
  getClassAssignments,
  getClassRoster,
  getClassProgress,
  upsertStudentProgress,
  listClassStudentProgress,
  generateQuiz,
  validateQuizQuestions,
  saveQuiz,
  updateQuiz,
  listQuizzes,
  getQuizById,
  assignQuizToClass,
  startTestAttempt,
  logViolation,
  autoSubmitIfNeeded,
  submitTestAttempt,
  getTestAttempt,
  listTestAttempts,
  saveTestAttemptDraft,
  createTestModeRuntime,
  createCoachSession,
  sendCoachMessage,
  analyzeGrammarInput,
  generatePracticeFollowup,
  getCoachSession,
  listCoachSessions,
  generateWorksheet,
  buildAnswerKey,
  saveWorksheet,
  getWorksheetById,
  listWorksheets,
  exportWorksheetData,
  awardStudentXp,
  trackMissionProgress,
  trackQuizAttemptProgress
};

export default API;
