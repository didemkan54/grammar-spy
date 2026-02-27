(function () {
  var CLASSROOMS_KEY = "gs_classrooms";
  var STUDENT_KEY = "gs_student_classroom";

  function generateCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var code = "";
    for (var i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function getClassrooms() {
    try {
      return JSON.parse(localStorage.getItem(CLASSROOMS_KEY)) || [];
    } catch (e) { return []; }
  }

  function saveClassrooms(list) {
    try { localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function createClassroom(name, teacherName) {
    var list = getClassrooms();
    var code = generateCode();
    while (list.some(function (c) { return c.code === code; })) {
      code = generateCode();
    }
    var classroom = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      teacherName: (teacherName || "").trim(),
      code: code,
      students: [],
      createdAt: new Date().toISOString()
    };
    list.push(classroom);
    saveClassrooms(list);
    return classroom;
  }

  function deleteClassroom(classroomId) {
    var list = getClassrooms().filter(function (c) { return c.id !== classroomId; });
    saveClassrooms(list);
  }

  function getClassroomByCode(code) {
    var normalized = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    return getClassrooms().find(function (c) { return c.code === normalized; }) || null;
  }

  function addStudentToClassroom(code, studentName) {
    var normalized = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    var list = getClassrooms();
    var classroom = list.find(function (c) { return c.code === normalized; });
    if (!classroom) return null;

    var name = (studentName || "").trim();
    if (!name) return null;

    var exists = classroom.students.some(function (s) { return s.name.toLowerCase() === name.toLowerCase(); });
    if (!exists) {
      classroom.students.push({
        name: name,
        joinedAt: new Date().toISOString()
      });
      saveClassrooms(list);
    }

    try {
      localStorage.setItem(STUDENT_KEY, JSON.stringify({
        classroomId: classroom.id,
        classroomName: classroom.name,
        teacherName: classroom.teacherName,
        code: classroom.code,
        studentName: name,
        joinedAt: new Date().toISOString()
      }));
    } catch (e) {}

    return classroom;
  }

  function removeStudent(classroomId, studentName) {
    var list = getClassrooms();
    var classroom = list.find(function (c) { return c.id === classroomId; });
    if (!classroom) return;
    classroom.students = classroom.students.filter(function (s) {
      return s.name.toLowerCase() !== studentName.toLowerCase();
    });
    saveClassrooms(list);
  }

  function getStudentClassroom() {
    try {
      return JSON.parse(localStorage.getItem(STUDENT_KEY)) || null;
    } catch (e) { return null; }
  }

  function leaveClassroom() {
    try { localStorage.removeItem(STUDENT_KEY); } catch (e) {}
  }

  window.GSClassroom = {
    getClassrooms: getClassrooms,
    createClassroom: createClassroom,
    deleteClassroom: deleteClassroom,
    getClassroomByCode: getClassroomByCode,
    addStudentToClassroom: addStudentToClassroom,
    removeStudent: removeStudent,
    getStudentClassroom: getStudentClassroom,
    leaveClassroom: leaveClassroom
  };
})();
