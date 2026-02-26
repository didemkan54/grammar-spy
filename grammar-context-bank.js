(function () {
  var meta = {
    pack01: { title: "Mission 01", short: "Retell What Happened" },
    pack02: { title: "Mission 02", short: "Speak In The Moment" },
    pack03: { title: "Mission 03", short: "Sentence Confidence Missions" },
    pack04: { title: "Mission 04", short: "Link Ideas Clearly" },
    pack05: { title: "Mission 05", short: "Reference Smartly" },
    pack06: { title: "Mission 06", short: "Question Flow Missions" }
  };

  var clueTrail = {
    pack01: [
      {
        scene: "Retell Card 01",
        prompt: "Choose the strongest background + event sentence.",
        options: [
          "The class was reviewing notes when the bell rang.",
          "The class review notes when the bell rang.",
          "The class is reviewing notes when the bell rang.",
          "The class were reviewing notes when the bell rang."
        ],
        answer: 0,
        explain: "Ongoing past action plus interruption is most precise."
      },
      {
        scene: "Retell Card 02",
        prompt: "Pick the best completed-action sentence.",
        options: [
          "Yesterday we submit the corrected paragraph.",
          "Yesterday we submitted the corrected paragraph.",
          "Yesterday we are submitting the corrected paragraph.",
          "Yesterday we were submit the corrected paragraph."
        ],
        answer: 1,
        explain: "Yesterday signals simple past."
      },
      {
        scene: "Retell Card 03",
        prompt: "Select the strongest parallel past sentence.",
        options: [
          "I checked attendance while my partner updates the board.",
          "I was checking attendance while my partner was updating the board.",
          "I was checking attendance while my partner update the board.",
          "I checking attendance while my partner was updating the board."
        ],
        answer: 1,
        explain: "Parallel background actions should align in form."
      },
      {
        scene: "Retell Card 04",
        prompt: "Choose the timeline-accurate close sentence.",
        options: [
          "By lunch, the class completed the report.",
          "By lunch, the class completes the report.",
          "By lunch, the class is completing the report.",
          "By lunch, the class were completing the report."
        ],
        answer: 0,
        explain: "Completed result in the past takes simple past."
      },
      {
        scene: "Retell Card 05",
        prompt: "Pick the clearest question form.",
        options: [
          "Did the class finished the mission before break?",
          "Did the class finish the mission before break?",
          "Does the class finished the mission before break?",
          "Class did finish the mission before break?"
        ],
        answer: 1,
        explain: "Did must be followed by the base verb."
      },
      {
        scene: "Retell Card 06",
        prompt: "Choose the strongest final report line.",
        options: [
          "After we corrected the script, students read it aloud.",
          "After we corrected the script, students reads it aloud.",
          "After we corrected the script, students are reading it aloud yesterday.",
          "After we correcting the script, students read it aloud."
        ],
        answer: 0,
        explain: "Retell summary should keep consistent past forms."
      }
    ],
    pack02: [
      {
        scene: "Present Signal 01",
        prompt: "Choose the routine sentence.",
        options: [
          "The class checks the clue board every morning.",
          "The class is checking the clue board every morning now.",
          "The class checked the clue board every morning.",
          "The class checkes the clue board every morning."
        ],
        answer: 0,
        explain: "Habit signals simple present."
      },
      {
        scene: "Present Signal 02",
        prompt: "Pick the line for an action happening now.",
        options: [
          "The team discusses the clue right now.",
          "The team is discussing the clue right now.",
          "The team discussed the clue right now.",
          "The team are discussing the clue right now."
        ],
        answer: 1,
        explain: "Right now calls for present continuous."
      },
      {
        scene: "Present Signal 03",
        prompt: "Select the strongest third-person sentence.",
        options: [
          "Mira write the summary after lunch.",
          "Mira writes the summary after lunch.",
          "Mira is write the summary after lunch.",
          "Mira wrote the summary after lunch every day."
        ],
        answer: 1,
        explain: "Third-person singular takes writes."
      },
      {
        scene: "Present Signal 04",
        prompt: "Choose the best negative present line.",
        options: [
          "The class does not talks during the briefing.",
          "The class does not talk during the briefing.",
          "The class do not talks during the briefing.",
          "The class not talk during the briefing."
        ],
        answer: 1,
        explain: "Does not + base verb is the correct pattern."
      },
      {
        scene: "Present Signal 05",
        prompt: "Pick the strongest present question.",
        options: [
          "Does the team need another clue?",
          "Does the team needs another clue?",
          "Do the team need another clue?",
          "Team does need another clue?"
        ],
        answer: 0,
        explain: "Singular team takes does + base verb."
      },
      {
        scene: "Present Signal 06",
        prompt: "Select the sentence with accurate timing.",
        options: [
          "They are checking references at the moment.",
          "They check references at the moment every day.",
          "They checked references at the moment.",
          "They is checking references at the moment."
        ],
        answer: 0,
        explain: "At the moment signals current in-progress action."
      }
    ],
    pack03: [
      {
        scene: "Agreement Card 01",
        prompt: "Choose the sentence with correct be-verb agreement.",
        options: [
          "I am ready for the speaking task.",
          "I is ready for the speaking task.",
          "I are ready for the speaking task.",
          "I be ready for the speaking task."
        ],
        answer: 0,
        explain: "I pairs with am."
      },
      {
        scene: "Agreement Card 02",
        prompt: "Pick the strongest plural agreement line.",
        options: [
          "The examples is on page two.",
          "The examples are on page two.",
          "The examples am on page two.",
          "The examples was on page two now."
        ],
        answer: 1,
        explain: "Plural examples takes are."
      },
      {
        scene: "Agreement Card 03",
        prompt: "Select the correct singular agreement sentence.",
        options: [
          "Our coach are in the classroom.",
          "Our coach is in the classroom.",
          "Our coach am in the classroom.",
          "Our coach be in the classroom."
        ],
        answer: 1,
        explain: "Singular coach requires is."
      },
      {
        scene: "Agreement Card 04",
        prompt: "Choose the accurate past be-verb sentence.",
        options: [
          "The final list were complete.",
          "The final list was complete.",
          "The final list are complete yesterday.",
          "The final list be complete."
        ],
        answer: 1,
        explain: "Singular noun in past takes was."
      },
      {
        scene: "Agreement Card 05",
        prompt: "Pick the strongest compound-subject line.",
        options: [
          "Maya and Asli is prepared.",
          "Maya and Asli are prepared.",
          "Maya and Asli am prepared.",
          "Maya and Asli was prepared."
        ],
        answer: 1,
        explain: "Two subjects create plural agreement."
      },
      {
        scene: "Agreement Card 06",
        prompt: "Select the best negative agreement sentence.",
        options: [
          "The students is not late today.",
          "The students are not late today.",
          "The students am not late today.",
          "The students be not late today."
        ],
        answer: 1,
        explain: "Plural students takes are not."
      }
    ],
    pack04: [
      {
        scene: "Connector Card 01",
        prompt: "Choose the sentence with clear cause and result.",
        options: [
          "The clue was blurry, so we checked the original file.",
          "The clue was blurry, because so we checked the original file.",
          "The clue was blurry, and because we checked the original file.",
          "The clue blurry, so checked original file."
        ],
        answer: 0,
        explain: "Use one connector to link cause and result cleanly."
      },
      {
        scene: "Connector Card 02",
        prompt: "Pick the strongest contrast sentence.",
        options: [
          "We practiced the script, but the first recording still sounded rushed.",
          "We practiced the script, but and the first recording sounded rushed.",
          "We practiced the script, however but the first recording sounded rushed.",
          "We practiced script, but sounded rushed recording."
        ],
        answer: 0,
        explain: "Contrast should use one clear transition."
      },
      {
        scene: "Connector Card 03",
        prompt: "Select the best purpose sentence.",
        options: [
          "We labeled each section to make feedback easier to follow.",
          "We labeled each section for make feedback easier to follow.",
          "We labeled each section to making feedback easier to follow.",
          "We labeled each section because to easier feedback."
        ],
        answer: 0,
        explain: "To + base verb expresses purpose correctly."
      },
      {
        scene: "Connector Card 04",
        prompt: "Choose the sentence with clean sequence logic.",
        options: [
          "First we checked evidence, then we edited the final draft.",
          "First we checked evidence, then and we edited the final draft.",
          "First we checked evidence, therefore then we edited the final draft.",
          "First checked evidence then edited draft."
        ],
        answer: 0,
        explain: "Sequence is clearer with stable connectors."
      },
      {
        scene: "Connector Card 05",
        prompt: "Pick the strongest sentence for concession.",
        options: [
          "Although the task was hard, the team completed it on time.",
          "Although the task was hard, but the team completed it on time.",
          "Although hard task, the team completed it on time but.",
          "Although the task was hard, the team complete it on time yesterday."
        ],
        answer: 0,
        explain: "Do not combine although with but in the same clause link."
      },
      {
        scene: "Connector Card 06",
        prompt: "Select the sentence with precise logical linking.",
        options: [
          "The printer jammed; therefore, we sent the file digitally.",
          "The printer jammed; therefore because we sent the file digitally.",
          "The printer jammed; so therefore sent digitally.",
          "The printer jammed; therefore we send the file digitally yesterday."
        ],
        answer: 0,
        explain: "One transition keeps argument flow accurate."
      }
    ],
    pack05: [
      {
        scene: "Reference Card 01",
        prompt: "Choose the sentence with the clearest reference.",
        options: [
          "Aylin sent Duru the report after Aylin reviewed it.",
          "Aylin sent Duru the report after she reviewed it.",
          "Aylin sent Duru the report after it reviewed it.",
          "Aylin sent Duru report after she were reviewing it."
        ],
        answer: 0,
        explain: "Explicit names remove pronoun ambiguity."
      },
      {
        scene: "Reference Card 02",
        prompt: "Pick the strongest line for clear ownership.",
        options: [
          "The drama club submitted the poster, and the club signed it.",
          "The drama club submitted the poster, and it signed it.",
          "Drama club submitted poster and signed it.",
          "The drama club submitted the poster, and they was sign it."
        ],
        answer: 0,
        explain: "Clear noun repetition can improve reference precision."
      },
      {
        scene: "Reference Card 03",
        prompt: "Select the sentence with no unclear pronoun.",
        options: [
          "Maya called Zara after Maya corrected the draft.",
          "Maya called Zara after she corrected the draft.",
          "Maya called Zara after it corrected the draft.",
          "Maya called Zara after she were correcting the draft."
        ],
        answer: 0,
        explain: "Use specific nouns when she could refer to two people."
      },
      {
        scene: "Reference Card 04",
        prompt: "Choose the strongest repair for reference clarity.",
        options: [
          "When Ella met Rana, Ella handed Rana the checklist.",
          "When Ella met Rana, she handed her the checklist.",
          "When Ella met Rana, she handed checklist.",
          "When Ella met Rana, she were handing her the checklist."
        ],
        answer: 0,
        explain: "Precise nouns prevent confusion in mission reports."
      },
      {
        scene: "Reference Card 05",
        prompt: "Pick the clearest sentence.",
        options: [
          "Kerem told Ali that Kerem would present first.",
          "Kerem told Ali that he would present first.",
          "Kerem told Ali that it would present first.",
          "Kerem told Ali that he were presenting first."
        ],
        answer: 0,
        explain: "Explicitly naming who acts avoids ambiguity."
      },
      {
        scene: "Reference Card 06",
        prompt: "Select the best reference line.",
        options: [
          "The science team checked the data, and the team uploaded the file.",
          "The science team checked the data, and it uploaded the file.",
          "Science team checked data and uploaded file.",
          "The science team checked the data, and they was upload the file."
        ],
        answer: 0,
        explain: "Clear repeated noun references improve readability."
      }
    ],
    pack06: [
      {
        scene: "Question Card 01",
        prompt: "Choose the correct yes-no question.",
        options: [
          "Did the class finish the correction before break?",
          "Did the class finished the correction before break?",
          "Does the class finished the correction before break?",
          "Class did finish the correction before break?"
        ],
        answer: 0,
        explain: "Did must be followed by base form."
      },
      {
        scene: "Question Card 02",
        prompt: "Pick the strongest Wh-question.",
        options: [
          "Where did the team save the final file?",
          "Where did the team saved the final file?",
          "Where the team did save the final file?",
          "Where did saved the team final file?"
        ],
        answer: 0,
        explain: "Wh + did + subject + base verb is the correct order."
      },
      {
        scene: "Question Card 03",
        prompt: "Select the best present-tense question.",
        options: [
          "Does the speaker explain the rubric clearly?",
          "Does the speaker explains the rubric clearly?",
          "Do the speaker explain the rubric clearly?",
          "Speaker does explain the rubric clearly?"
        ],
        answer: 0,
        explain: "Singular subject takes does + base verb."
      },
      {
        scene: "Question Card 04",
        prompt: "Choose the strongest information question.",
        options: [
          "Why did the group change the final sentence?",
          "Why did the group changed the final sentence?",
          "Why the group did change the final sentence?",
          "Why did changed the group the final sentence?"
        ],
        answer: 0,
        explain: "Base verb follows did in Wh-questions."
      },
      {
        scene: "Question Card 05",
        prompt: "Pick the correct past question.",
        options: [
          "When did your team submit the mission report?",
          "When did your team submitted the mission report?",
          "When your team did submit the mission report?",
          "When did submitted your team mission report?"
        ],
        answer: 0,
        explain: "Question word + did + subject + base verb."
      },
      {
        scene: "Question Card 06",
        prompt: "Select the best confirmation question.",
        options: [
          "Did you check the references before printing?",
          "Did you checked the references before printing?",
          "Do you checked the references before printing?",
          "You did check the references before printing?"
        ],
        answer: 0,
        explain: "Did + base verb forms the most accurate question."
      }
    ]
  };

  function cloneTrail(trail) {
    return trail.map(function (item) {
      return {
        scene: item.scene,
        prompt: item.prompt,
        options: item.options.slice(),
        answer: item.answer,
        explain: item.explain
      };
    });
  }

  var clueTrailCopy = {
    pack01: cloneTrail(clueTrail.pack01),
    pack02: cloneTrail(clueTrail.pack02),
    pack03: cloneTrail(clueTrail.pack03),
    pack04: cloneTrail(clueTrail.pack04),
    pack05: cloneTrail(clueTrail.pack05),
    pack06: cloneTrail(clueTrail.pack06)
  };

  var existing = window.GSPacks || {};
  window.GSPacks = Object.assign({}, existing, {
    meta: Object.assign({}, meta, existing.meta || {}),
    clueTrail: Object.assign({}, clueTrailCopy, existing.clueTrail || {})
  });
})();
