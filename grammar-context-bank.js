(function () {
  var meta = {
    pack01: { title: "Mission 01", short: "Retell What Happened" },
    pack02: { title: "Mission 02", short: "Speak In The Moment" },
    pack03: { title: "Mission 03", short: "Sentence Confidence Missions" },
    pack04: { title: "Mission 04", short: "Link Ideas Clearly" },
    pack05: { title: "Mission 05", short: "Reference Smartly" },
    pack06: { title: "Mission 06", short: "Question Flow Missions" }
  };

  var baseClues = [
    {
      scene: "Morning Attendance",
      prompt: "Choose the strongest sentence.",
      options: [
        "When the bell rang, students were finding their seats.",
        "When the bell rang, students find their seats.",
        "When the bell rang, students is finding their seats.",
        "When the bell rang, students are found their seats."
      ],
      answer: 0,
      explain: "Use past continuous for an action interrupted by a past event."
    },
    {
      scene: "Announcement Draft",
      prompt: "Pick the correct correction.",
      options: [
        "Yesterday the principal approved the final message.",
        "Yesterday the principal approves the final message.",
        "Yesterday the principal is approving the final message.",
        "Yesterday the principal approve the final message."
      ],
      answer: 0,
      explain: "Completed action yesterday takes simple past."
    },
    {
      scene: "Pair Reflection",
      prompt: "Choose the sentence with parallel structure.",
      options: [
        "I was checking the board while my partner was reviewing attendance.",
        "I was checking the board while my partner review attendance.",
        "I was checking the board while my partner reviews attendance.",
        "I was checking the board while my partner reviewed attendance and now."
      ],
      answer: 0,
      explain: "Parallel ongoing actions use matching past continuous forms."
    },
    {
      scene: "Video Log",
      prompt: "Select the best timeline sentence.",
      options: [
        "The class was reading quietly when the speaker failed.",
        "The class read quietly when the speaker failed and fails.",
        "The class is reading quietly when the speaker failed.",
        "The class reads quietly when the speaker failed."
      ],
      answer: 0,
      explain: "Ongoing past action + interruption is the target pattern."
    },
    {
      scene: "Teacher Debrief",
      prompt: "Which line is the clearest completed sequence?",
      options: [
        "After we fixed the script, students read the corrected version.",
        "After we fixed the script, students reads the corrected version.",
        "After we fixed the script, students are reading the corrected version.",
        "After we fixed the script, students were read the corrected version."
      ],
      answer: 0,
      explain: "Use simple past for the completed follow-up event."
    },
    {
      scene: "Timeline Rebuild",
      prompt: "Complete the while-clause correctly.",
      options: [
        "While we were rebuilding the timeline, we found two errors.",
        "While we rebuild the timeline, we found two errors.",
        "While we are rebuilding the timeline, we found two errors.",
        "While we rebuilt the timeline, we finding two errors."
      ],
      answer: 0,
      explain: "While + ongoing past action takes past continuous."
    },
    {
      scene: "Intercom Check",
      prompt: "Pick the best be-verb form.",
      options: [
        "The final script was clear and ready.",
        "The final script were clear and ready.",
        "The final script are clear and ready.",
        "The final script be clear and ready."
      ],
      answer: 0,
      explain: "Singular subject in a past report uses 'was'."
    },
    {
      scene: "Mission Close",
      prompt: "Choose the strongest close-out line.",
      options: [
        "By first period, the class submitted the corrected announcement.",
        "By first period, the class submits the corrected announcement.",
        "By first period, the class is submitting the corrected announcement.",
        "By first period, the class were submitting the corrected announcement."
      ],
      answer: 0,
      explain: "A completed result in the past takes simple past."
    },
    {
      scene: "Connector Review",
      prompt: "Select the sentence with the clearest connector.",
      options: [
        "Students revised the line, so the meaning became clear.",
        "Students revised the line, because so the meaning became clear.",
        "Students revised the line, and because so clear.",
        "Students revised the line, so meaning clear be."
      ],
      answer: 0,
      explain: "Use one connector that matches cause/result cleanly."
    },
    {
      scene: "Pronoun Audit",
      prompt: "Choose the option with clear reference.",
      options: [
        "Maria gave Ana the script after Maria finished editing it.",
        "Maria gave Ana the script after she finished editing it.",
        "Maria gave Ana the script after it finished editing it.",
        "Maria gave Ana the script after she were editing."
      ],
      answer: 0,
      explain: "Repeat the noun when pronoun reference is ambiguous."
    },
    {
      scene: "Question Flow",
      prompt: "Pick the correct question form.",
      options: [
        "Did the class finish the correction before lunch?",
        "Did the class finished the correction before lunch?",
        "Does the class finished the correction before lunch?",
        "Class did finish before lunch?"
      ],
      answer: 0,
      explain: "After 'did', use the base verb."
    },
    {
      scene: "Wh-Question Precision",
      prompt: "Choose the best Wh-question.",
      options: [
        "Where did the team post the final announcement?",
        "Where did the team posted the final announcement?",
        "Where the team did post the final announcement?",
        "Where did posted the team final announcement?"
      ],
      answer: 0,
      explain: "Wh-word + did + subject + base verb is the target pattern."
    }
  ];

  function copyClues() {
    return baseClues.map(function (item) {
      return {
        scene: item.scene,
        prompt: item.prompt,
        options: item.options.slice(),
        answer: item.answer,
        explain: item.explain
      };
    });
  }

  var clueTrail = {
    pack01: copyClues(),
    pack02: copyClues(),
    pack03: copyClues(),
    pack04: copyClues(),
    pack05: copyClues(),
    pack06: copyClues()
  };

  var existing = window.GSPacks || {};
  window.GSPacks = Object.assign({}, existing, {
    meta: Object.assign({}, meta, existing.meta || {}),
    clueTrail: Object.assign({}, clueTrail, existing.clueTrail || {})
  });
})();
