(function () {
  var CLASSROOMS_KEY = "gs_classrooms";
  var STUDENTS_KEY = "gs_students_v1";
  var ASSIGNMENTS_KEY = "gs_assignments_v1";
  var ATTEMPTS_KEY = "gs_progress_attempts_v1";
  var TEST_ATTEMPTS_KEY = "gs_test_attempts_v1";
  var STUDENT_KEY = "gs_student_classroom";

  function nowIso() {
    return new Date().toISOString();
  }

  function readJson(key, fallback) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed == null ? fallback : parsed;
    } catch (_err) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_err) {}
    return value;
  }

  function toCode(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function safeName(value, fallback) {
    var clean = String(value || "").trim();
    return clean || fallback || "Untitled";
  }

  function unique(values) {
    return Array.from(new Set(values || []));
  }

  function randomId(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function asClassroom(entry) {
    var row = entry || {};
    var joinCode = toCode(row.joinCode || row.code || "");
    if (!joinCode) joinCode = generateJoinCode();
    var students = Array.isArray(row.students) ? row.students : [];
    var studentIds = Array.isArray(row.studentIds) ? row.studentIds : [];
    if (students.length && !studentIds.length) {
      studentIds = students.map(function (student) {
        return "name_" + safeName(student && student.name, "student").toLowerCase().replace(/[^a-z0-9]+/g, "_");
      });
    }
    return {
      id: String(row.id || randomId("class")),
      teacherId: String(row.teacherId || ""),
      teacherName: String(row.teacherName || ""),
      name: safeName(row.name, "Classroom"),
      joinCode: joinCode,
      code: joinCode,
      archived: Boolean(row.archived),
      createdAt: String(row.createdAt || nowIso()),
      updatedAt: nowIso(),
      studentIds: unique(studentIds.map(String)),
      students: students
    };
  }

  function getClassrooms() {
    var rows = readJson(CLASSROOMS_KEY, []);
    if (!Array.isArray(rows)) return [];
    return rows.map(asClassroom);
  }

  function saveClassrooms(rows) {
    writeJson(CLASSROOMS_KEY, (rows || []).map(asClassroom));
  }

  function upsertLegacyClassroom(row) {
    var next = asClassroom(row || {});
    var classrooms = getClassrooms();
    var idx = classrooms.findIndex(function (entry) { return entry.id === next.id; });
    if (idx >= 0) classrooms[idx] = asClassroom(Object.assign({}, classrooms[idx], next));
    else classrooms.push(next);
    saveClassrooms(classrooms);
    return next;
  }

  function removeLegacyClassroom(classroomId) {
    var id = String(classroomId || "").trim();
    saveClassrooms(getClassrooms().filter(function (row) { return row.id !== id; }));
    writeJson(ASSIGNMENTS_KEY, readJson(ASSIGNMENTS_KEY, []).filter(function (row) {
      return String(row.classId || "") !== id;
    }));
  }

  function getStudents() {
    var rows = readJson(STUDENTS_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }

  function saveStudents(rows) {
    writeJson(STUDENTS_KEY, rows || []);
  }

  function generateJoinCode() {
    if (window.GSProductSystem && typeof window.GSProductSystem.generateJoinCode === "function") {
      return window.GSProductSystem.generateJoinCode();
    }
    var used = new Set(getClassrooms().map(function (row) { return row.joinCode; }));
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    while (!code || used.has(code)) {
      code = "";
      for (var i = 0; i < 6; i += 1) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return code;
  }

  function createClass(input) {
    if (window.GSProductSystem && typeof window.GSProductSystem.createClass === "function") {
      try {
        var created = window.GSProductSystem.createClass(
          {
            name: input && input.name,
            teacherName: input && input.teacherName,
            teacherId: input && input.teacherId,
            joinCode: input && input.joinCode
          },
          { role: "teacher" }
        );
        if (created) {
          // Keep legacy classroom list in sync with product-system storage.
          upsertLegacyClassroom(created);
          return asClassroom(created);
        }
      } catch (_err) {}
    }
    var classrooms = getClassrooms();
    var row = asClassroom({
      id: randomId("class"),
      teacherId: String((input && input.teacherId) || ""),
      teacherName: safeName(input && input.teacherName, ""),
      name: safeName(input && input.name, "Classroom"),
      joinCode: generateJoinCode(),
      archived: false,
      createdAt: nowIso(),
      students: []
    });
    classrooms.push(row);
    saveClassrooms(classrooms);
    return row;
  }

  function createClassroom(name, teacherName) {
    return createClass({ name: name, teacherName: teacherName });
  }

  function getClassroomByCode(code) {
    var normalized = toCode(code);
    if (!normalized) return null;
    return getClassrooms().find(function (row) { return row.joinCode === normalized && !row.archived; }) || null;
  }

  function getClassroomById(classId) {
    var id = String(classId || "").trim();
    return getClassrooms().find(function (row) { return row.id === id; }) || null;
  }

  function joinClassByCode(payload) {
    var code = payload && (payload.code || payload.joinCode);
    var name = payload && (payload.studentName || payload.name);
    if (window.GSProductSystem && typeof window.GSProductSystem.joinClassByCode === "function") {
      try {
        return window.GSProductSystem.joinClassByCode(
          {
            code: code,
            studentId: payload && payload.studentId,
            studentName: name,
            email: payload && payload.email
          },
          { role: "student" }
        );
      } catch (_err) {}
    }

    var classroom = getClassroomByCode(code);
    if (!classroom) return null;
    var studentName = safeName(name, "");
    if (!studentName) return null;
    var studentId = String((payload && payload.studentId) || ("name_" + studentName.toLowerCase().replace(/[^a-z0-9]+/g, "_")));
    var students = getStudents();
    var idx = students.findIndex(function (student) { return student.id === studentId; });
    var joinedClass = { classId: classroom.id, joinedAt: nowIso() };
    if (idx >= 0) {
      var existingJoined = Array.isArray(students[idx].joinedClasses) ? students[idx].joinedClasses : [];
      var hasClass = existingJoined.some(function (row) { return row.classId === classroom.id; });
      if (!hasClass) existingJoined.push(joinedClass);
      students[idx].name = studentName;
      students[idx].joinedClasses = existingJoined;
      students[idx].updatedAt = nowIso();
    } else {
      students.push({
        id: studentId,
        name: studentName,
        email: "",
        guestIdentifier: studentId,
        joinedClasses: [joinedClass],
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    }
    saveStudents(students);

    var classrooms = getClassrooms();
    var classIdx = classrooms.findIndex(function (row) { return row.id === classroom.id; });
    if (classIdx >= 0) {
      classrooms[classIdx].studentIds = unique((classrooms[classIdx].studentIds || []).concat(studentId));
      var legacyStudents = Array.isArray(classrooms[classIdx].students) ? classrooms[classIdx].students : [];
      var hasLegacy = legacyStudents.some(function (student) {
        return String(student && student.name || "").toLowerCase() === studentName.toLowerCase();
      });
      if (!hasLegacy) legacyStudents.push({ name: studentName, joinedAt: nowIso() });
      classrooms[classIdx].students = legacyStudents;
      classrooms[classIdx].updatedAt = nowIso();
      saveClassrooms(classrooms);
      classroom = classrooms[classIdx];
    }

    writeJson(STUDENT_KEY, {
      classroomId: classroom.id,
      classroomName: classroom.name,
      teacherName: classroom.teacherName || "",
      code: classroom.joinCode,
      studentId: studentId,
      studentName: studentName,
      joinedAt: nowIso()
    });

    return { classroom: classroom, student: { id: studentId, name: studentName } };
  }

  function addStudentToClassroom(code, studentName) {
    return joinClassByCode({ code: code, studentName: studentName });
  }

  function removeStudent(classroomId, studentName) {
    var classrooms = getClassrooms();
    var idx = classrooms.findIndex(function (row) { return row.id === classroomId; });
    if (idx < 0) return;
    var name = String(studentName || "").trim().toLowerCase();
    classrooms[idx].students = (classrooms[idx].students || []).filter(function (student) {
      return String(student && student.name || "").toLowerCase() !== name;
    });
    classrooms[idx].studentIds = (classrooms[idx].studentIds || []).filter(function (studentId) {
      return String(studentId || "").toLowerCase() !== ("name_" + name.replace(/[^a-z0-9]+/g, "_"));
    });
    saveClassrooms(classrooms);
  }

  function deleteClassroom(classroomId) {
    if (window.GSProductSystem && typeof window.GSProductSystem.deleteClass === "function") {
      try {
        window.GSProductSystem.deleteClass(classroomId, { role: "teacher" });
      } catch (_err) {}
    }
    removeLegacyClassroom(classroomId);
  }

  function renameClassroom(classroomId, nextName) {
    if (window.GSProductSystem && typeof window.GSProductSystem.renameClass === "function") {
      return window.GSProductSystem.renameClass(classroomId, nextName, { role: "teacher" });
    }
    var classrooms = getClassrooms();
    var idx = classrooms.findIndex(function (row) { return row.id === classroomId; });
    if (idx < 0) return null;
    classrooms[idx].name = safeName(nextName, classrooms[idx].name);
    classrooms[idx].updatedAt = nowIso();
    saveClassrooms(classrooms);
    return classrooms[idx];
  }

  function archiveClassroom(classroomId, archived) {
    if (window.GSProductSystem && typeof window.GSProductSystem.archiveClass === "function") {
      return window.GSProductSystem.archiveClass(classroomId, archived, { role: "teacher" });
    }
    var classrooms = getClassrooms();
    var idx = classrooms.findIndex(function (row) { return row.id === classroomId; });
    if (idx < 0) return null;
    classrooms[idx].archived = Boolean(archived);
    classrooms[idx].updatedAt = nowIso();
    saveClassrooms(classrooms);
    return classrooms[idx];
  }

  function assignToClass(payload) {
    if (window.GSProductSystem && typeof window.GSProductSystem.assignToClass === "function") {
      return window.GSProductSystem.assignToClass(payload, { role: "teacher" });
    }
    var assignment = {
      id: randomId("assign"),
      classId: String(payload && payload.classId || ""),
      type: String(payload && payload.type || "mission"),
      targetId: String(payload && payload.targetId || ""),
      title: safeName(payload && payload.title, "Class Assignment"),
      assignedAt: nowIso(),
      dueAt: payload && payload.dueAt ? String(payload.dueAt) : "",
      status: String(payload && payload.status || "active")
    };
    var assignments = readJson(ASSIGNMENTS_KEY, []);
    assignments.push(assignment);
    writeJson(ASSIGNMENTS_KEY, assignments);
    return assignment;
  }

  function getClassAssignments(classId) {
    var id = String(classId || "").trim();
    return readJson(ASSIGNMENTS_KEY, []).filter(function (row) { return String(row.classId || "") === id; });
  }

  function getClassRoster(classId) {
    if (window.GSProductSystem && typeof window.GSProductSystem.getClassRoster === "function") {
      try {
        return window.GSProductSystem.getClassRoster(classId);
      } catch (_err) {}
    }
    var classroom = getClassroomById(classId);
    if (!classroom) return [];
    var students = getStudents();
    var byId = {};
    students.forEach(function (student) { byId[String(student.id)] = student; });
    var roster = [];
    (classroom.studentIds || []).forEach(function (studentId) {
      if (byId[studentId]) roster.push(byId[studentId]);
    });
    if (!roster.length && Array.isArray(classroom.students)) {
      roster = classroom.students.map(function (student) {
        return {
          id: "name_" + safeName(student && student.name, "student").toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          name: safeName(student && student.name, "Student"),
          joinedAt: String(student && student.joinedAt || "")
        };
      });
    }
    return roster;
  }

  function getClassProgress(classId) {
    if (window.GSProductSystem && typeof window.GSProductSystem.getClassProgress === "function") {
      try {
        return window.GSProductSystem.getClassProgress(classId);
      } catch (_err) {}
    }
    var classroom = getClassroomById(classId);
    if (!classroom) {
      return { classId: classId || "", className: "", assignmentCount: 0, studentCount: 0, averageCompletion: 0, students: [] };
    }
    var assignments = getClassAssignments(classroom.id);
    var attempts = readJson(ATTEMPTS_KEY, []);
    var testAttempts = readJson(TEST_ATTEMPTS_KEY, []);
    var roster = getClassRoster(classroom.id);
    var students = roster.map(function (student) {
      var sid = String(student.id || "");
      var missionRows = attempts.filter(function (row) {
        return String(row.student_id || "") === sid && String(row.class_id || "").toUpperCase() === classroom.joinCode;
      });
      var quizRows = testAttempts.filter(function (row) {
        return String(row.studentId || "") === sid && String(row.classId || "").toUpperCase() === classroom.joinCode && row.submittedAt;
      });
      var completed = assignments.filter(function (assignment) {
        if (assignment.type === "mission") {
          return missionRows.some(function (attempt) { return String(attempt.mission_id || "") === String(assignment.targetId || ""); });
        }
        if (assignment.type === "quiz") {
          return quizRows.some(function (attempt) { return String(attempt.quizId || "") === String(assignment.targetId || ""); });
        }
        return false;
      }).length;
      var completionPercent = assignments.length ? Math.round((completed / assignments.length) * 100) : 0;
      var missionAccuracy = missionRows.length
        ? Math.round(missionRows.reduce(function (sum, row) { return sum + Number(row.accuracy || 0); }, 0) / missionRows.length)
        : 0;
      var quizAccuracy = quizRows.length
        ? Math.round(quizRows.reduce(function (sum, row) { return sum + Number(row.score || 0); }, 0) / quizRows.length)
        : 0;
      var accuracy = missionRows.length || quizRows.length
        ? Math.round((missionAccuracy + quizAccuracy) / (missionRows.length && quizRows.length ? 2 : 1))
        : 0;
      return {
        id: sid,
        name: student.name || sid,
        completionPercent: completionPercent,
        accuracy: accuracy,
        assignmentsCompleted: completed
      };
    });
    var avg = students.length
      ? Math.round(students.reduce(function (sum, row) { return sum + Number(row.completionPercent || 0); }, 0) / students.length)
      : 0;
    return {
      classId: classroom.id,
      className: classroom.name,
      joinCode: classroom.joinCode,
      assignmentCount: assignments.length,
      studentCount: students.length,
      averageCompletion: avg,
      students: students,
      assignments: assignments
    };
  }

  function getStudentClassroom() {
    return readJson(STUDENT_KEY, null);
  }

  function leaveClassroom() {
    try {
      localStorage.removeItem(STUDENT_KEY);
    } catch (_err) {}
  }

  window.GSClassroom = {
    // legacy
    getClassrooms: getClassrooms,
    createClassroom: createClassroom,
    deleteClassroom: deleteClassroom,
    getClassroomByCode: getClassroomByCode,
    addStudentToClassroom: addStudentToClassroom,
    removeStudent: removeStudent,
    getStudentClassroom: getStudentClassroom,
    leaveClassroom: leaveClassroom,
    // new feature foundation
    createClass: createClass,
    generateJoinCode: generateJoinCode,
    joinClassByCode: joinClassByCode,
    renameClassroom: renameClassroom,
    archiveClassroom: archiveClassroom,
    assignToClass: assignToClass,
    getClassAssignments: getClassAssignments,
    getClassRoster: getClassRoster,
    getClassProgress: getClassProgress
  };
})();
