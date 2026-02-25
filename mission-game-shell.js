(function () {
  var params = new URLSearchParams(window.location.search);
  var gameKey = window.GS_GAME_KEY || "error-smash";
  var pack = params.get("pack") || "pack01";
  var difficulty = params.get("difficulty") || "field";
  var timerOn = (params.get("timer") || "on") !== "off";
  var requestedCount = Number(params.get("count") || 10) || 10;
  var count = Math.max(6, Math.min(20, requestedCount));
  var playFormat = params.get("play_format") || "individuals";

  var games = {
    "error-smash": {
      title: "Error Smash",
      subtitle: "Scan fast and choose the best correction.",
      howTo: "Read the sentence evidence, then choose the strongest correction. Score rises with accuracy and streak."
    },
    "past-sort": {
      title: "Past Sort",
      subtitle: "Sort timeline meaning by selecting the best tense line.",
      howTo: "Read each context clue and choose the sentence that best matches completed versus ongoing past action."
    },
    "narrative-builder": {
      title: "Narrative Builder",
      subtitle: "Build story flow with accurate grammar choices.",
      howTo: "Pick the sentence that keeps the narrative sequence clear and grammatically correct."
    },
    "dialogue-repair": {
      title: "Dialogue Repair",
      subtitle: "Repair spoken lines to make classroom meaning clear.",
      howTo: "Each witness line has one best repair. Choose it to keep dialogue natural and accurate."
    },
    "rewrite-studio": {
      title: "Rewrite Studio",
      subtitle: "Rewrite weak lines into strong mission-ready grammar.",
      howTo: "Select the strongest rewrite for each original line. Focus on clarity, tense, and agreement."
    },
    "rule-sprint-present": {
      title: "Rule Sprint (Present)",
      subtitle: "Apply present tense rules under pressure.",
      howTo: "Read each present-tense context and choose the grammatically strongest sentence."
    },
    "signal-decoder-present": {
      title: "Signal Decoder (Present)",
      subtitle: "Decode clue signals and match the correct present form.",
      howTo: "Use context signals like now, usually, and right now to choose the best verb form."
    },
    "present-case-interview": {
      title: "Case Interview (Present)",
      subtitle: "Interview evidence and lock the best present-tense line.",
      howTo: "Treat each item like an interview clue. Choose the line that best matches present-time meaning."
    },
    "be-verb-rule-sprint": {
      title: "Be-Verb Rule Sprint",
      subtitle: "Use am/is/are with clean subject matching.",
      howTo: "Check subject clues and choose the best be-verb form with agreement."
    },
    "be-verb-agreement-sweep": {
      title: "Agreement Sweep",
      subtitle: "Sweep for agreement errors and fix them quickly.",
      howTo: "Focus on singular/plural agreement and choose the line with correct subject-verb matching."
    },
    "be-verb-case-interview": {
      title: "Case Interview (Be-Verb)",
      subtitle: "Interview evidence to secure agreement accuracy.",
      howTo: "Read the scene and pick the sentence with the strongest be-verb agreement."
    },
    "mission-sequence-lab": {
      title: "Mission Sequence Lab",
      subtitle: "Sequence sentence logic with grammar precision.",
      howTo: "Choose the line that keeps sequence logic and grammar accurate from one step to the next."
    },
    "evidence-sort-board": {
      title: "Evidence Sort Board",
      subtitle: "Sort evidence lines by the strongest grammar choice.",
      howTo: "Each option is evidence. Select the sentence that best secures meaning and correctness."
    }
  };

  var gameUx = {
    "error-smash": { accent: "#b04444", columns: 2, modeLabel: "Smash Wrong Line", sceneLabel: "Error File", startText: "Start Smash", replayText: "Smash Again", endText: "End Smash", playMode: "smash" },
    "past-sort": { accent: "#2f6fd8", columns: 1, modeLabel: "Classify Timeline", sceneLabel: "Timeline Card", startText: "Start Sorting", replayText: "Sort Again", endText: "End Sort", playMode: "classify" },
    "narrative-builder": { accent: "#7b4ad9", columns: 1, modeLabel: "Sequence Choice", sceneLabel: "Story Step", startText: "Build Story", replayText: "Build Again", endText: "End Story", playMode: "sequence" },
    "dialogue-repair": { accent: "#0f8b7f", columns: 1, modeLabel: "Repair Line", sceneLabel: "Witness Line", startText: "Repair Dialogue", replayText: "Repair Again", endText: "End Repair", playMode: "repair" },
    "rewrite-studio": { accent: "#b3631f", columns: 1, modeLabel: "Rewrite Duel", sceneLabel: "Rewrite File", startText: "Start Rewrite", replayText: "Rewrite Again", endText: "End Rewrite", playMode: "duel" },
    "rule-sprint-present": { accent: "#d84f7f", columns: 2, modeLabel: "Smash Rule Breach", sceneLabel: "Rule Prompt", startText: "Start Sprint", replayText: "Sprint Again", endText: "End Sprint", playMode: "smash" },
    "signal-decoder-present": { accent: "#0a7fa5", columns: 1, modeLabel: "Signal Verdict", sceneLabel: "Signal File", startText: "Decode Signals", replayText: "Decode Again", endText: "End Decode", playMode: "binary" },
    "present-case-interview": { accent: "#3559b8", columns: 1, modeLabel: "Interview Verdict", sceneLabel: "Interview File", startText: "Start Interview", replayText: "Interview Again", endText: "End Interview", playMode: "binary" },
    "be-verb-rule-sprint": { accent: "#1f8f63", columns: 2, modeLabel: "Smash Agreement Error", sceneLabel: "Rule Check", startText: "Start Sprint", replayText: "Sprint Again", endText: "End Sprint", playMode: "smash" },
    "be-verb-agreement-sweep": { accent: "#2d9f7a", columns: 1, modeLabel: "Board Sweep", sceneLabel: "Sweep File", startText: "Start Sweep", replayText: "Sweep Again", endText: "End Sweep", playMode: "sweep" },
    "be-verb-case-interview": { accent: "#226b88", columns: 1, modeLabel: "Case Verdict", sceneLabel: "Case File", startText: "Open Case", replayText: "Open New Case", endText: "Close Case", playMode: "binary" },
    "mission-sequence-lab": { accent: "#8c5dd7", columns: 1, modeLabel: "Sequence Verdict", sceneLabel: "Sequence Step", startText: "Run Lab", replayText: "Run Lab Again", endText: "End Lab", playMode: "binary" },
    "evidence-sort-board": { accent: "#a66a1d", columns: 1, modeLabel: "Evidence Board Sweep", sceneLabel: "Evidence Card", startText: "Start Sorting", replayText: "Sort Again", endText: "End Board", playMode: "sweep" }
  };

  var fallbackRounds = [
    {
      scene: "Mission Warmup",
      prompt: "Choose the strongest sentence.",
      options: [
        "The team checked the notes before class started.",
        "The team checks the notes before class started.",
        "The team was check the notes before class started.",
        "The team checking the notes before class started."
      ],
      answer: 0,
      explain: "Completed action before a past event should stay in simple past."
    },
    {
      scene: "Live Prompt",
      prompt: "Pick the clearest present-time line.",
      options: [
        "The class is discussing the clue right now.",
        "The class discuss the clue right now.",
        "The class discussed the clue right now.",
        "The class are discussing the clue right now."
      ],
      answer: 0,
      explain: "Right now signals present continuous with a singular subject."
    },
    {
      scene: "Question Desk",
      prompt: "Select the correct question form.",
      options: [
        "Did the team finish the report?",
        "Did the team finished the report?",
        "Does the team finished the report?",
        "Team did finish the report?"
      ],
      answer: 0,
      explain: "After did, use the base verb."
    }
  ];

  var roundBanks = {
    "error-smash": [
      {
        scene: "Hallway Camera",
        prompt: "Smash the incorrect draft and choose the best fix.",
        options: [
          "When the bell rang, students were finding their seats.",
          "When the bell rang, students finds their seats.",
          "When the bell rang, students are finding their seats yesterday.",
          "When the bell rang, students was finding their seats."
        ],
        answer: 0,
        explain: "Interrupted past action is best with past continuous."
      },
      {
        scene: "Announcement Edit",
        prompt: "Select the corrected sentence.",
        options: [
          "Yesterday the principal approves the final memo.",
          "Yesterday the principal approved the final memo.",
          "Yesterday the principal is approving the final memo.",
          "Yesterday the principal approve the final memo."
        ],
        answer: 1,
        explain: "Finished action yesterday needs simple past."
      },
      {
        scene: "Lab Notebook",
        prompt: "Which sentence is error-free?",
        options: [
          "The monitor were flashing during the test.",
          "The monitor was flashing during the test.",
          "The monitor are flashing during the test.",
          "The monitor flashing during the test."
        ],
        answer: 1,
        explain: "Singular subject monitor pairs with was."
      },
      {
        scene: "Team Debrief",
        prompt: "Choose the strongest correction.",
        options: [
          "After we fix the script, the class read it aloud.",
          "After we fixed the script, the class read it aloud.",
          "After we fixed the script, the class reads it aloud yesterday.",
          "After we were fix the script, the class read it aloud."
        ],
        answer: 1,
        explain: "Both events are completed in the past."
      },
      {
        scene: "Final Report",
        prompt: "Pick the best be-verb line.",
        options: [
          "The final version was clear and complete.",
          "The final version were clear and complete.",
          "The final version are clear and complete.",
          "The final version be clear and complete."
        ],
        answer: 0,
        explain: "Singular subject takes was in a past report."
      },
      {
        scene: "Exit Ticket",
        prompt: "Select the accurate question sentence.",
        options: [
          "Did the class finished the task before lunch?",
          "Did the class finish the task before lunch?",
          "Does the class finish the task before lunch yesterday?",
          "Class did finish the task before lunch?"
        ],
        answer: 1,
        explain: "Did + base verb is the correct question pattern."
      }
    ],
    "past-sort": [
      {
        scene: "Timeline Card A",
        prompt: "Choose the line for background action interrupted by an event.",
        options: [
          "The team was checking clues when the lights went out.",
          "The team checked clues when the lights go out.",
          "The team is checking clues when the lights went out.",
          "The team check clues when the lights went out."
        ],
        answer: 0,
        explain: "Past continuous plus simple past shows interruption clearly."
      },
      {
        scene: "Timeline Card B",
        prompt: "Select the sentence for two completed past actions in order.",
        options: [
          "We are solved the puzzle, then we wrote the report.",
          "We solved the puzzle, then we wrote the report.",
          "We were solving the puzzle, then we write the report.",
          "We solve the puzzle, then we wrote the report."
        ],
        answer: 1,
        explain: "Sequence of finished events should stay in simple past."
      },
      {
        scene: "Timeline Card C",
        prompt: "Pick the best while-clause combination.",
        options: [
          "While Maya interviewed witnesses, Leo was updating the board.",
          "While Maya interview witnesses, Leo was updating the board.",
          "While Maya interviewed witnesses, Leo updates the board.",
          "While Maya was interviewed witnesses, Leo was updating the board."
        ],
        answer: 0,
        explain: "Parallel past context needs accurate verb forms."
      },
      {
        scene: "Timeline Card D",
        prompt: "Choose the sentence with clear past completion.",
        options: [
          "By second period, the class submits the corrected script.",
          "By second period, the class submitted the corrected script.",
          "By second period, the class is submitting the corrected script.",
          "By second period, the class were submitting the corrected script."
        ],
        answer: 1,
        explain: "By + past checkpoint points to completed simple past."
      },
      {
        scene: "Timeline Card E",
        prompt: "Select the line that keeps time meaning accurate.",
        options: [
          "When I arrived, they discuss the answer.",
          "When I arrived, they were discussing the answer.",
          "When I arrived, they are discussing the answer.",
          "When I arrived, they discussed the answer every day."
        ],
        answer: 1,
        explain: "Arrival interrupts an ongoing past action."
      },
      {
        scene: "Timeline Card F",
        prompt: "Pick the strongest retell sentence.",
        options: [
          "First we collected clues, and then we compared notes.",
          "First we collect clues, and then we compared notes.",
          "First we were collect clues, and then we compared notes.",
          "First we collected clues, and then we compare notes yesterday."
        ],
        answer: 0,
        explain: "Retelling a finished sequence works best in simple past."
      }
    ],
    "narrative-builder": [
      {
        scene: "Story Step 1",
        prompt: "Which line best continues this story clearly?",
        options: [
          "First, we reviewed the clue cards; then we grouped them by time.",
          "First, we review the clue cards; then we grouped them by time.",
          "First, we reviewed the clue cards; then we grouping them by time.",
          "First, we were review the clue cards; then we grouped them by time."
        ],
        answer: 0,
        explain: "Strong narrative flow uses stable tense and sequence markers."
      },
      {
        scene: "Story Step 2",
        prompt: "Pick the best transition sentence.",
        options: [
          "Because the evidence was weak, we tested a second explanation.",
          "Because the evidence weak, we tested a second explanation.",
          "Because the evidence was weak, we are testing a second explanation yesterday.",
          "Because the evidence were weak, we tested a second explanation."
        ],
        answer: 0,
        explain: "Cause-and-result must be grammatical and time-consistent."
      },
      {
        scene: "Story Step 3",
        prompt: "Choose the strongest line for background and event.",
        options: [
          "The class read quietly when the speaker failed.",
          "The class was reading quietly when the speaker failed.",
          "The class is reading quietly when the speaker failed.",
          "The class reads quietly when the speaker failed yesterday."
        ],
        answer: 1,
        explain: "Ongoing background plus interrupting event is most precise."
      },
      {
        scene: "Story Step 4",
        prompt: "Which sentence keeps pronoun reference clear?",
        options: [
          "Aylin handed Nisa the file after she corrected it.",
          "Aylin handed Nisa the file after Aylin corrected it.",
          "Aylin handed Nisa the file after it corrected it.",
          "Aylin handed Nisa the file after she were correcting it."
        ],
        answer: 1,
        explain: "Naming the person removes pronoun ambiguity."
      },
      {
        scene: "Story Step 5",
        prompt: "Select the best final sentence.",
        options: [
          "At the end, we submit the report and celebrate.",
          "At the end, we submitted the report and celebrated.",
          "At the end, we are submitting the report and celebrated.",
          "At the end, we submitted the report and celebrates."
        ],
        answer: 1,
        explain: "Ending a past narrative should stay in completed past forms."
      },
      {
        scene: "Story Step 6",
        prompt: "Choose the clearest timeline link.",
        options: [
          "After we checked the evidence, we finalize the poster.",
          "After we checked the evidence, we finalized the poster.",
          "After we check the evidence, we finalized the poster yesterday.",
          "After we were checked the evidence, we finalized the poster."
        ],
        answer: 1,
        explain: "After-clause and result are both completed in the past."
      }
    ],
    "dialogue-repair": [
      {
        scene: "Classroom Pair Talk",
        prompt: "Pick the repaired dialogue line.",
        options: [
          "I no understand this clue.",
          "I did not understand this clue.",
          "I am not understood this clue.",
          "I not understanded this clue."
        ],
        answer: 1,
        explain: "Past misunderstanding should be expressed with did not + base verb."
      },
      {
        scene: "Teacher Check-in",
        prompt: "Which response sounds natural and correct?",
        options: [
          "She are waiting near the board.",
          "She is waiting near the board.",
          "She waiting near the board.",
          "She was wait near the board."
        ],
        answer: 1,
        explain: "Singular she takes is in present continuous."
      },
      {
        scene: "Group Discussion",
        prompt: "Choose the best repaired question.",
        options: [
          "Where you put the final note?",
          "Where did you put the final note?",
          "Where did you putted the final note?",
          "Where you did put the final note?"
        ],
        answer: 1,
        explain: "Wh-question pattern is Wh + did + subject + base verb."
      },
      {
        scene: "Partner Clarification",
        prompt: "Select the clearest spoken line.",
        options: [
          "After she read it, she gave it to her.",
          "After Elif read the draft, she gave it to Ada.",
          "After she read it, gave it to her.",
          "After Elif read it, she give it to Ada."
        ],
        answer: 1,
        explain: "Replacing ambiguous pronouns makes dialogue clearer."
      },
      {
        scene: "Hallway Debrief",
        prompt: "Pick the corrected connector line.",
        options: [
          "We were late because so the printer failed.",
          "We were late because the printer failed.",
          "We were late because and the printer failed.",
          "We were late, so because the printer failed."
        ],
        answer: 1,
        explain: "Use one connector that fits the relationship."
      },
      {
        scene: "Mission Wrap",
        prompt: "Which line is the strongest final response?",
        options: [
          "Yes, we did finished the mission.",
          "Yes, we finished the mission.",
          "Yes, we are finished the mission yesterday.",
          "Yes, we were finish the mission."
        ],
        answer: 1,
        explain: "Simple past is the cleanest form for a completed mission."
      }
    ],
    "rewrite-studio": [
      {
        scene: "Original: The note was not clear and students were confused.",
        prompt: "Choose the strongest rewrite.",
        options: [
          "Students were confused because the note was unclear.",
          "Students confusion because note unclear.",
          "Because unclear note, students was confusion.",
          "Students are confused because the note was unclear yesterday."
        ],
        answer: 0,
        explain: "Good rewrites improve grammar and preserve meaning."
      },
      {
        scene: "Original: She give me the paper after she edit it.",
        prompt: "Select the best rewrite.",
        options: [
          "She gave me the paper after she edited it.",
          "She gives me the paper after she edited it yesterday.",
          "She gave me the paper after she edit it.",
          "She was gave me the paper after she edited it."
        ],
        answer: 0,
        explain: "Completed sequence should use gave and edited."
      },
      {
        scene: "Original: Team A and Team B was ready.",
        prompt: "Pick the best rewrite.",
        options: [
          "Team A and Team B were ready.",
          "Team A and Team B is ready.",
          "Team A and Team B ready.",
          "Team A and Team B was being ready."
        ],
        answer: 0,
        explain: "Plural compound subject requires were."
      },
      {
        scene: "Original: We did not knew where the clue was.",
        prompt: "Select the strongest rewrite.",
        options: [
          "We did not know where the clue was.",
          "We did not knew where the clue is.",
          "We not knowed where the clue was.",
          "We did not knowing where the clue was."
        ],
        answer: 0,
        explain: "After did not, use base verb know."
      },
      {
        scene: "Original: Because we checked twice, so the answer was correct.",
        prompt: "Choose the cleaner rewrite.",
        options: [
          "Because we checked twice, the answer was correct.",
          "Because we checked twice, so the answer was correct.",
          "We checked twice because so answer correct.",
          "Because we were check twice, the answer was correct."
        ],
        answer: 0,
        explain: "Avoid double connectors in one clause link."
      },
      {
        scene: "Original: Maria told Ana that she should rewrite it.",
        prompt: "Pick the rewrite with clearer reference.",
        options: [
          "Maria told Ana that Ana should rewrite the paragraph.",
          "Maria told Ana that she should rewrite it quickly.",
          "Maria told Ana she should rewrite it, and she did.",
          "Maria told Ana that it should rewrite."
        ],
        answer: 0,
        explain: "Clear noun references make the sentence easier to understand."
      }
    ],
    "rule-sprint-present": [
      {
        scene: "Morning Routine Board",
        prompt: "Choose the sentence that states a routine.",
        options: [
          "The class is checking homework every day.",
          "The class checks homework every day.",
          "The class checked homework every day now.",
          "The class check homework every day."
        ],
        answer: 1,
        explain: "Routine habits usually take simple present."
      },
      {
        scene: "Live Classroom Feed",
        prompt: "Pick the line for an action happening now.",
        options: [
          "The teacher explains the clue right now.",
          "The teacher is explaining the clue right now.",
          "The teacher explained the clue right now.",
          "The teacher explaining the clue right now."
        ],
        answer: 1,
        explain: "Right now calls for present continuous."
      },
      {
        scene: "Schedule Check",
        prompt: "Select the strongest third-person present sentence.",
        options: [
          "Mina write the summary after lunch.",
          "Mina writes the summary after lunch.",
          "Mina is write the summary after lunch.",
          "Mina wrote the summary after lunch usually."
        ],
        answer: 1,
        explain: "Third-person singular takes writes."
      },
      {
        scene: "Noise Monitor",
        prompt: "Choose the best negative present sentence.",
        options: [
          "The team does not talks during silent reading.",
          "The team does not talk during silent reading.",
          "The team do not talks during silent reading.",
          "The team not talk during silent reading."
        ],
        answer: 1,
        explain: "Does not is followed by a base verb."
      },
      {
        scene: "Help Desk",
        prompt: "Pick the correct present question.",
        options: [
          "Does the team needs another hint?",
          "Do the team need another hint?",
          "Does the team need another hint?",
          "Team does need another hint?"
        ],
        answer: 2,
        explain: "Singular team takes does + base verb."
      },
      {
        scene: "Board Update",
        prompt: "Select the sentence with accurate present timing.",
        options: [
          "They are solving the final clue at the moment.",
          "They solve the final clue at the moment.",
          "They solved the final clue at the moment.",
          "They is solving the final clue at the moment."
        ],
        answer: 0,
        explain: "At the moment signals present continuous."
      }
    ],
    "signal-decoder-present": [
      {
        scene: "Signal: usually",
        prompt: "Decode the signal and choose the correct line.",
        options: [
          "The librarian is opening the archive usually.",
          "The librarian opens the archive usually.",
          "The librarian opened the archive usually.",
          "The librarian open the archive usually."
        ],
        answer: 1,
        explain: "Usually points to simple present, opens."
      },
      {
        scene: "Signal: right now",
        prompt: "Which sentence matches the signal?",
        options: [
          "Students compare notes right now.",
          "Students compared notes right now.",
          "Students are comparing notes right now.",
          "Students compares notes right now."
        ],
        answer: 2,
        explain: "Right now requires present continuous."
      },
      {
        scene: "Signal: every Monday",
        prompt: "Choose the routine sentence.",
        options: [
          "She is leading the briefing every Monday.",
          "She leads the briefing every Monday.",
          "She leaded the briefing every Monday.",
          "She lead the briefing every Monday."
        ],
        answer: 1,
        explain: "Repeated weekly actions use simple present."
      },
      {
        scene: "Signal: listen",
        prompt: "Pick the line that fits immediate action.",
        options: [
          "Listen, the printer is making a strange sound.",
          "Listen, the printer makes a strange sound now always.",
          "Listen, the printer made a strange sound.",
          "Listen, the printer make a strange sound."
        ],
        answer: 0,
        explain: "Immediate observation is best in present continuous."
      },
      {
        scene: "Signal: on Fridays",
        prompt: "Select the strongest habitual statement.",
        options: [
          "Our class review feedback on Fridays.",
          "Our class reviews feedback on Fridays.",
          "Our class is reviewing feedback on Fridays now.",
          "Our class reviewed feedback on Fridays."
        ],
        answer: 1,
        explain: "Singular class takes reviews for habits."
      },
      {
        scene: "Signal: currently",
        prompt: "Decode the signal and choose correctly.",
        options: [
          "The team currently prepares the final slide.",
          "The team is currently preparing the final slide.",
          "The team currently prepared the final slide.",
          "The team currently prepare the final slide."
        ],
        answer: 1,
        explain: "Currently usually signals an in-progress action."
      }
    ],
    "present-case-interview": [
      {
        scene: "Interview File 1",
        prompt: "Witness says this is a daily routine. Choose the best line.",
        options: [
          "He checks the clue board before lunch.",
          "He is checking the clue board before lunch every day right now.",
          "He checked the clue board before lunch every day.",
          "He check the clue board before lunch."
        ],
        answer: 0,
        explain: "Daily routine should use simple present with checks."
      },
      {
        scene: "Interview File 2",
        prompt: "Witness says action is happening now. Select the line.",
        options: [
          "They read the witness statement now.",
          "They are reading the witness statement now.",
          "They were reading the witness statement now.",
          "They reads the witness statement now."
        ],
        answer: 1,
        explain: "Now supports present continuous."
      },
      {
        scene: "Interview File 3",
        prompt: "Choose the strongest present question.",
        options: [
          "Does she explains the clue clearly?",
          "Does she explain the clue clearly?",
          "Do she explain the clue clearly?",
          "She does explain the clue clearly?"
        ],
        answer: 1,
        explain: "Does + base verb is required in this question."
      },
      {
        scene: "Interview File 4",
        prompt: "Pick the most accurate negative present form.",
        options: [
          "The witness do not remember the code.",
          "The witness does not remembers the code.",
          "The witness does not remember the code.",
          "The witness not remember the code."
        ],
        answer: 2,
        explain: "Does not must pair with base verb remember."
      },
      {
        scene: "Interview File 5",
        prompt: "Choose the line that best matches right now.",
        options: [
          "The class is organizing evidence right now.",
          "The class organizes evidence right now every day.",
          "The class organized evidence right now.",
          "The class are organizing evidence right now."
        ],
        answer: 0,
        explain: "In-progress present uses is organizing."
      },
      {
        scene: "Interview File 6",
        prompt: "Select the strongest statement for school policy.",
        options: [
          "The team submit logs before dismissal.",
          "The team submits logs before dismissal.",
          "The team is submitting logs before dismissal every day now.",
          "The team submitted logs before dismissal."
        ],
        answer: 1,
        explain: "Policy or rule statements use simple present."
      }
    ],
    "be-verb-rule-sprint": [
      {
        scene: "Status Board",
        prompt: "Choose the correct be-verb sentence.",
        options: [
          "I am ready for the mission.",
          "I is ready for the mission.",
          "I are ready for the mission.",
          "I be ready for the mission."
        ],
        answer: 0,
        explain: "I pairs with am."
      },
      {
        scene: "Team Check",
        prompt: "Select the line with correct agreement.",
        options: [
          "The clues are on the back table.",
          "The clues is on the back table.",
          "The clues am on the back table.",
          "The clues be on the back table."
        ],
        answer: 0,
        explain: "Plural clues takes are."
      },
      {
        scene: "Speaker Note",
        prompt: "Pick the strongest be-verb form.",
        options: [
          "Our teacher are in the media room.",
          "Our teacher is in the media room.",
          "Our teacher am in the media room.",
          "Our teacher be in the media room."
        ],
        answer: 1,
        explain: "Singular teacher needs is."
      },
      {
        scene: "Past Evidence",
        prompt: "Choose the accurate past be-verb sentence.",
        options: [
          "The final list were on my desk.",
          "The final list was on my desk.",
          "The final list are on my desk yesterday.",
          "The final list be on my desk."
        ],
        answer: 1,
        explain: "Singular list in past takes was."
      },
      {
        scene: "Dual Subject",
        prompt: "Select the sentence with correct plural agreement.",
        options: [
          "Mina and Sude is in the hallway.",
          "Mina and Sude are in the hallway.",
          "Mina and Sude am in the hallway.",
          "Mina and Sude was in the hallway."
        ],
        answer: 1,
        explain: "Two names form a plural subject, so use are."
      },
      {
        scene: "Negative Form",
        prompt: "Pick the best negative be-verb sentence.",
        options: [
          "The clues not are complete.",
          "The clues are not complete.",
          "The clues is not complete.",
          "The clues be not complete."
        ],
        answer: 1,
        explain: "Plural subject uses are not."
      }
    ],
    "be-verb-agreement-sweep": [
      {
        scene: "Sweep 01",
        prompt: "Find the line with correct subject-be agreement.",
        options: [
          "Each student are prepared for discussion.",
          "Each student is prepared for discussion.",
          "Each student am prepared for discussion.",
          "Each student be prepared for discussion."
        ],
        answer: 1,
        explain: "Each student is grammatically singular."
      },
      {
        scene: "Sweep 02",
        prompt: "Choose the sentence that matches the subject.",
        options: [
          "The notebooks is on the shelf.",
          "The notebooks are on the shelf.",
          "The notebooks am on the shelf.",
          "The notebooks was on the shelf now."
        ],
        answer: 1,
        explain: "Plural notebooks pairs with are."
      },
      {
        scene: "Sweep 03",
        prompt: "Select the strongest agreement line.",
        options: [
          "My partner and I is ready.",
          "My partner and I are ready.",
          "My partner and I am ready.",
          "My partner and I was ready."
        ],
        answer: 1,
        explain: "Compound subject with I takes are in present."
      },
      {
        scene: "Sweep 04",
        prompt: "Pick the correct sentence for past context.",
        options: [
          "The answers was on the board yesterday.",
          "The answers were on the board yesterday.",
          "The answers is on the board yesterday.",
          "The answers be on the board yesterday."
        ],
        answer: 1,
        explain: "Plural subject in past takes were."
      },
      {
        scene: "Sweep 05",
        prompt: "Choose the line with correct singular agreement.",
        options: [
          "The new instruction are clear.",
          "The new instruction is clear.",
          "The new instruction am clear.",
          "The new instruction were clear."
        ],
        answer: 1,
        explain: "Instruction is singular, so use is."
      },
      {
        scene: "Sweep 06",
        prompt: "Select the accurate negative agreement sentence.",
        options: [
          "The pages is not dry yet.",
          "The pages are not dry yet.",
          "The pages am not dry yet.",
          "The pages were not dry yet now."
        ],
        answer: 1,
        explain: "Plural pages requires are not."
      }
    ],
    "be-verb-case-interview": [
      {
        scene: "Interview A",
        prompt: "Witness refers to one folder in the present. Choose the line.",
        options: [
          "The folder are on the top shelf.",
          "The folder is on the top shelf.",
          "The folder am on the top shelf.",
          "The folder be on the top shelf."
        ],
        answer: 1,
        explain: "Singular folder pairs with is."
      },
      {
        scene: "Interview B",
        prompt: "Witness refers to two students. Select the sentence.",
        options: [
          "The students is in the lab.",
          "The students are in the lab.",
          "The students am in the lab.",
          "The students was in the lab now."
        ],
        answer: 1,
        explain: "Plural students requires are."
      },
      {
        scene: "Interview C",
        prompt: "Past-time clue: choose the best form.",
        options: [
          "The key cards was missing after break.",
          "The key cards were missing after break.",
          "The key cards are missing after break yesterday.",
          "The key cards be missing after break."
        ],
        answer: 1,
        explain: "Plural subject in past uses were."
      },
      {
        scene: "Interview D",
        prompt: "Pick the strongest be-verb question.",
        options: [
          "Is the witness notes complete?",
          "Are the witness notes complete?",
          "Am the witness notes complete?",
          "Be the witness notes complete?"
        ],
        answer: 1,
        explain: "Plural notes takes are in a yes-no question."
      },
      {
        scene: "Interview E",
        prompt: "Choose the line with correct first-person agreement.",
        options: [
          "I is sure this is the right code.",
          "I am sure this is the right code.",
          "I are sure this is the right code.",
          "I be sure this is the right code."
        ],
        answer: 1,
        explain: "I always pairs with am."
      },
      {
        scene: "Interview F",
        prompt: "Select the sentence with the cleanest agreement.",
        options: [
          "Your explanation are helpful.",
          "Your explanation is helpful.",
          "Your explanation am helpful.",
          "Your explanation were helpful now."
        ],
        answer: 1,
        explain: "Singular explanation requires is."
      }
    ],
    "mission-sequence-lab": [
      {
        scene: "Sequence Draft 1",
        prompt: "Choose the sentence with clear order markers.",
        options: [
          "First we reviewed the clue, then we tested our answer.",
          "First we review the clue, then we tested our answer yesterday.",
          "First we reviewed the clue, then we are testing our answer.",
          "First reviewed clue, then tested answer."
        ],
        answer: 0,
        explain: "Sequence writing should keep tense and connectors consistent."
      },
      {
        scene: "Sequence Draft 2",
        prompt: "Pick the strongest cause-result sequence line.",
        options: [
          "Because the label was unclear, we rewrote it before posting.",
          "Because the label unclear, we rewrote it before posting.",
          "Because the label was unclear, so we rewrote it before posting.",
          "Because label was unclear we were rewrite it."
        ],
        answer: 0,
        explain: "Use one correct cause connector and complete verb forms."
      },
      {
        scene: "Sequence Draft 3",
        prompt: "Select the line that links contrast correctly.",
        options: [
          "We prepared carefully, but the first draft still had errors.",
          "We prepared carefully, but and the first draft still had errors.",
          "We prepared carefully, however but the first draft had errors.",
          "We prepared carefully, but the first draft has errors yesterday."
        ],
        answer: 0,
        explain: "Contrast should use one connector in a clear structure."
      },
      {
        scene: "Sequence Draft 4",
        prompt: "Choose the best before-after sentence.",
        options: [
          "Before we print the poster, we checked each source line.",
          "Before we printed the poster, we checked each source line.",
          "Before we printed the poster, we check each source line yesterday.",
          "Before printed poster, checked sources."
        ],
        answer: 1,
        explain: "Both actions were completed in past context."
      },
      {
        scene: "Sequence Draft 5",
        prompt: "Which line gives the clearest final step?",
        options: [
          "Finally, we submitted the corrected report.",
          "Finally, we submit the corrected report yesterday.",
          "Finally, we were submitted the corrected report.",
          "Finally, submitted corrected report."
        ],
        answer: 0,
        explain: "Final step in a past sequence should be simple past."
      },
      {
        scene: "Sequence Draft 6",
        prompt: "Pick the sentence with strongest transition logic.",
        options: [
          "We checked the chart; therefore, we caught the mismatch early.",
          "We checked the chart; therefore because we caught the mismatch early.",
          "We checked the chart; so therefore caught mismatch.",
          "We checked the chart; therefore, we catch the mismatch early yesterday."
        ],
        answer: 0,
        explain: "One precise transition makes reasoning clear."
      }
    ],
    "evidence-sort-board": [
      {
        scene: "Evidence Card A",
        prompt: "Choose the strongest evidence sentence.",
        options: [
          "The timestamp showed the update happened at 09:12.",
          "The timestamp show the update happened at 09:12.",
          "The timestamp was showing the update happened at 09:12 every day.",
          "The timestamp happened the update at 09:12."
        ],
        answer: 0,
        explain: "Clear subject-verb match keeps evidence statements precise."
      },
      {
        scene: "Evidence Card B",
        prompt: "Pick the line with clear reference.",
        options: [
          "Selin shared the note with Rana after Selin verified it.",
          "Selin shared the note with Rana after she verified it.",
          "Selin shared the note with Rana after it verified it.",
          "Selin shared note with Rana after she were verify it."
        ],
        answer: 0,
        explain: "Explicit naming avoids ambiguity in evidence logs."
      },
      {
        scene: "Evidence Card C",
        prompt: "Select the best question evidence line.",
        options: [
          "Did the team archive the file before lunch?",
          "Did the team archived the file before lunch?",
          "Does the team archived the file before lunch?",
          "Team did archive the file before lunch?"
        ],
        answer: 0,
        explain: "Question evidence should follow the did + base pattern."
      },
      {
        scene: "Evidence Card D",
        prompt: "Choose the sentence with valid cause/result.",
        options: [
          "The microphone failed, so the recording stopped.",
          "The microphone failed, because so the recording stopped.",
          "The microphone failed, and because recording stopped.",
          "The microphone failed, so stopped recording be."
        ],
        answer: 0,
        explain: "A single correct connector keeps logic clean."
      },
      {
        scene: "Evidence Card E",
        prompt: "Pick the strongest present evidence statement.",
        options: [
          "The system is currently syncing the backup files.",
          "The system currently sync the backup files.",
          "The system currently synced the backup files.",
          "The system are currently syncing the backup files."
        ],
        answer: 0,
        explain: "Currently aligns with present continuous."
      },
      {
        scene: "Evidence Card F",
        prompt: "Select the line with accurate be-verb agreement.",
        options: [
          "The results is in the folder.",
          "The results are in the folder.",
          "The results am in the folder.",
          "The results was in the folder now."
        ],
        answer: 1,
        explain: "Plural results takes are."
      }
    ]
  };

  var packVariantBanks = {
    "dialogue-repair": {
      pack01: [
        {
          scene: "Retell Dialogue 1",
          prompt: "Repair the past-time dialogue line.",
          options: [
            "Yesterday we fix the timeline after class.",
            "Yesterday we fixed the timeline after class.",
            "Yesterday we are fixing the timeline after class.",
            "Yesterday we were fix the timeline after class."
          ],
          answer: 1,
          explain: "Past-time marker yesterday requires simple past."
        },
        {
          scene: "Retell Dialogue 2",
          prompt: "Choose the best interrupted-action line.",
          options: [
            "We were checking clues when the bell rang.",
            "We checking clues when the bell rang.",
            "We are checking clues when the bell rang.",
            "We checked clues when the bell rings."
          ],
          answer: 0,
          explain: "Ongoing past action interrupted by a past event is best here."
        },
        {
          scene: "Retell Dialogue 3",
          prompt: "Pick the strongest question form.",
          options: [
            "Did the team finished the report?",
            "Did the team finish the report?",
            "Does the team finished the report?",
            "Team did finish the report?"
          ],
          answer: 1,
          explain: "Did + base verb is the correct question pattern."
        }
      ],
      pack02: [
        {
          scene: "Present Dialogue 1",
          prompt: "Repair the line for routine meaning.",
          options: [
            "She checks the board every morning.",
            "She is checking the board every morning right now.",
            "She checked the board every morning.",
            "She check the board every morning."
          ],
          answer: 0,
          explain: "Routine actions take simple present with third-person s."
        },
        {
          scene: "Present Dialogue 2",
          prompt: "Choose the best line for action happening now.",
          options: [
            "They read the clues right now.",
            "They are reading the clues right now.",
            "They were reading the clues right now.",
            "They reads the clues right now."
          ],
          answer: 1,
          explain: "Right now matches present continuous."
        },
        {
          scene: "Present Dialogue 3",
          prompt: "Pick the strongest present question.",
          options: [
            "Does the class need more time?",
            "Does the class needs more time?",
            "Do the class need more time?",
            "Class does need more time?"
          ],
          answer: 0,
          explain: "Singular class takes does + base verb."
        }
      ],
      pack03: [
        {
          scene: "Agreement Dialogue 1",
          prompt: "Repair the be-verb agreement line.",
          options: [
            "I is ready for the mission.",
            "I am ready for the mission.",
            "I are ready for the mission.",
            "I be ready for the mission."
          ],
          answer: 1,
          explain: "I always pairs with am."
        },
        {
          scene: "Agreement Dialogue 2",
          prompt: "Choose the strongest plural agreement sentence.",
          options: [
            "The clues is in the folder.",
            "The clues are in the folder.",
            "The clues am in the folder.",
            "The clues was in the folder now."
          ],
          answer: 1,
          explain: "Plural subject clues takes are."
        },
        {
          scene: "Agreement Dialogue 3",
          prompt: "Pick the correct past be-verb line.",
          options: [
            "The final draft were clear.",
            "The final draft was clear.",
            "The final draft are clear yesterday.",
            "The final draft be clear."
          ],
          answer: 1,
          explain: "Singular draft in past context uses was."
        }
      ],
      pack04: [
        {
          scene: "Connector Dialogue 1",
          prompt: "Repair the cause-result dialogue sentence.",
          options: [
            "The clue was unclear, so we checked the source.",
            "The clue was unclear, because so we checked the source.",
            "The clue was unclear, and because we checked the source.",
            "The clue unclear, so checked source."
          ],
          answer: 0,
          explain: "Use one connector to link reason and result."
        },
        {
          scene: "Connector Dialogue 2",
          prompt: "Choose the strongest contrast line.",
          options: [
            "We practiced a lot, but the first take still failed.",
            "We practiced a lot, but and the first take still failed.",
            "We practiced a lot, however but the first take still failed.",
            "We practiced a lot, but first take fail yesterday."
          ],
          answer: 0,
          explain: "Contrast should use a single, accurate connector."
        },
        {
          scene: "Connector Dialogue 3",
          prompt: "Pick the best purpose sentence.",
          options: [
            "We rewrote the note to make the meaning clearer.",
            "We rewrote the note for make the meaning clearer.",
            "We rewrote the note to making the meaning clearer.",
            "We rewrote the note because to clearer meaning."
          ],
          answer: 0,
          explain: "To + base verb is the strongest purpose structure."
        }
      ],
      pack05: [
        {
          scene: "Reference Dialogue 1",
          prompt: "Repair the line for clear pronoun reference.",
          options: [
            "Aylin gave Ece the file after Aylin checked it.",
            "Aylin gave Ece the file after she checked it.",
            "Aylin gave Ece the file after it checked it.",
            "Aylin gave Ece file after she were checking it."
          ],
          answer: 0,
          explain: "Repeating the subject name avoids ambiguity."
        },
        {
          scene: "Reference Dialogue 2",
          prompt: "Choose the line with explicit ownership.",
          options: [
            "Mina told Defne that Mina would present first.",
            "Mina told Defne that she would present first.",
            "Mina told Defne that it would present first.",
            "Mina told Defne she were presenting first."
          ],
          answer: 0,
          explain: "Explicit naming keeps meaning precise."
        },
        {
          scene: "Reference Dialogue 3",
          prompt: "Pick the clearest reference sentence.",
          options: [
            "The math club submitted the poster, and the club signed it.",
            "The math club submitted the poster, and it signed it.",
            "Math club submitted poster and signed it.",
            "The math club submitted the poster and they was sign it."
          ],
          answer: 0,
          explain: "Clear repeated noun references improve clarity."
        }
      ],
      pack06: [
        {
          scene: "Question Dialogue 1",
          prompt: "Repair the yes-no question.",
          options: [
            "Did the team check the final list?",
            "Did the team checked the final list?",
            "Does the team checked the final list?",
            "Team did check the final list?"
          ],
          answer: 0,
          explain: "Did is followed by a base verb."
        },
        {
          scene: "Question Dialogue 2",
          prompt: "Choose the strongest Wh-question.",
          options: [
            "Where did the class post the final notice?",
            "Where did the class posted the final notice?",
            "Where the class did post the final notice?",
            "Where did posted the class final notice?"
          ],
          answer: 0,
          explain: "Wh + did + subject + base verb is the correct order."
        },
        {
          scene: "Question Dialogue 3",
          prompt: "Pick the best present question form.",
          options: [
            "Does the monitor show the update?",
            "Does the monitor shows the update?",
            "Do the monitor show the update?",
            "Monitor does show the update?"
          ],
          answer: 0,
          explain: "Singular subject monitor takes does + base verb."
        }
      ]
    },
    "rewrite-studio": {
      pack01: [
        {
          scene: "Past Rewrite 1",
          prompt: "Choose the strongest rewrite.",
          options: [
            "Yesterday we checked the board, then we fixed the report.",
            "Yesterday we check the board, then we fixed the report.",
            "Yesterday we checked the board, then we fixing the report.",
            "Yesterday checked board then fixed report."
          ],
          answer: 0,
          explain: "Retell sequence should keep completed past forms."
        },
        {
          scene: "Past Rewrite 2",
          prompt: "Pick the best rewrite for interrupted action.",
          options: [
            "We were reviewing clues when the bell rang.",
            "We review clues when the bell rang.",
            "We are reviewing clues when the bell rang.",
            "We were review clues when the bell rang."
          ],
          answer: 0,
          explain: "Interrupted background action works with past continuous."
        },
        {
          scene: "Past Rewrite 3",
          prompt: "Select the cleanest question rewrite.",
          options: [
            "Did the class finish the mission before lunch?",
            "Did the class finished the mission before lunch?",
            "Does the class finished the mission before lunch?",
            "Class did finish the mission before lunch?"
          ],
          answer: 0,
          explain: "Did + base verb makes the strongest form."
        }
      ],
      pack02: [
        {
          scene: "Present Rewrite 1",
          prompt: "Choose the strongest routine rewrite.",
          options: [
            "She checks attendance every morning.",
            "She is checking attendance every morning now.",
            "She checked attendance every morning.",
            "She check attendance every morning."
          ],
          answer: 0,
          explain: "Routine meaning is best in simple present."
        },
        {
          scene: "Present Rewrite 2",
          prompt: "Pick the best rewrite for right now.",
          options: [
            "They are testing the audio right now.",
            "They test the audio right now.",
            "They tested the audio right now.",
            "They is testing the audio right now."
          ],
          answer: 0,
          explain: "Right now aligns with present continuous."
        },
        {
          scene: "Present Rewrite 3",
          prompt: "Select the strongest question rewrite.",
          options: [
            "Does the class need one more minute?",
            "Does the class needs one more minute?",
            "Do the class need one more minute?",
            "Class does need one more minute?"
          ],
          answer: 0,
          explain: "Singular class uses does + base verb."
        }
      ],
      pack03: [
        {
          scene: "Agreement Rewrite 1",
          prompt: "Choose the best be-verb rewrite.",
          options: [
            "I am ready for the final check.",
            "I is ready for the final check.",
            "I are ready for the final check.",
            "I be ready for the final check."
          ],
          answer: 0,
          explain: "I pairs with am."
        },
        {
          scene: "Agreement Rewrite 2",
          prompt: "Pick the strongest plural agreement rewrite.",
          options: [
            "The students are in the lab.",
            "The students is in the lab.",
            "The students am in the lab.",
            "The students was in the lab now."
          ],
          answer: 0,
          explain: "Plural subject students takes are."
        },
        {
          scene: "Agreement Rewrite 3",
          prompt: "Select the strongest past agreement rewrite.",
          options: [
            "The checklist was complete.",
            "The checklist were complete.",
            "The checklist are complete yesterday.",
            "The checklist be complete."
          ],
          answer: 0,
          explain: "Singular checklist in past takes was."
        }
      ],
      pack04: [
        {
          scene: "Connector Rewrite 1",
          prompt: "Choose the strongest cause-result rewrite.",
          options: [
            "The instructions were unclear, so we simplified them.",
            "The instructions were unclear, because so we simplified them.",
            "The instructions were unclear, and because we simplified them.",
            "Instructions unclear, so simplified."
          ],
          answer: 0,
          explain: "Use one connector for clear logic."
        },
        {
          scene: "Connector Rewrite 2",
          prompt: "Pick the best contrast rewrite.",
          options: [
            "We practiced all morning, but the first try still failed.",
            "We practiced all morning, but and the first try still failed.",
            "We practiced all morning, however but the first try still failed.",
            "We practiced all morning, but first try fail."
          ],
          answer: 0,
          explain: "Contrast should use one transition signal."
        },
        {
          scene: "Connector Rewrite 3",
          prompt: "Select the strongest purpose rewrite.",
          options: [
            "We added labels to make each step clearer.",
            "We added labels for make each step clearer.",
            "We added labels to making each step clearer.",
            "We added labels because to clear each step."
          ],
          answer: 0,
          explain: "To + base verb is the clean purpose form."
        }
      ],
      pack05: [
        {
          scene: "Reference Rewrite 1",
          prompt: "Choose the clearest rewrite.",
          options: [
            "Mina gave Ece the report after Mina checked it.",
            "Mina gave Ece the report after she checked it.",
            "Mina gave Ece the report after it checked it.",
            "Mina gave Ece report after she were checking it."
          ],
          answer: 0,
          explain: "Explicit naming removes pronoun confusion."
        },
        {
          scene: "Reference Rewrite 2",
          prompt: "Pick the strongest reference rewrite.",
          options: [
            "Kerem told Arda that Kerem would speak first.",
            "Kerem told Arda that he would speak first.",
            "Kerem told Arda that it would speak first.",
            "Kerem told Arda he were speaking first."
          ],
          answer: 0,
          explain: "Clear repeated subject preserves meaning."
        },
        {
          scene: "Reference Rewrite 3",
          prompt: "Select the best ownership rewrite.",
          options: [
            "The robotics team submitted the plan, and the team signed it.",
            "The robotics team submitted the plan, and it signed it.",
            "Robotics team submitted plan and signed it.",
            "The robotics team submitted the plan and they was sign it."
          ],
          answer: 0,
          explain: "Clear ownership helps readers track reference."
        }
      ],
      pack06: [
        {
          scene: "Question Rewrite 1",
          prompt: "Choose the strongest yes-no question rewrite.",
          options: [
            "Did the class check the final answer?",
            "Did the class checked the final answer?",
            "Does the class checked the final answer?",
            "Class did check the final answer?"
          ],
          answer: 0,
          explain: "Did requires the base verb."
        },
        {
          scene: "Question Rewrite 2",
          prompt: "Pick the best Wh-question rewrite.",
          options: [
            "Where did the team upload the final file?",
            "Where did the team uploaded the final file?",
            "Where the team did upload the final file?",
            "Where did uploaded the team final file?"
          ],
          answer: 0,
          explain: "Wh + did + subject + base verb is correct."
        },
        {
          scene: "Question Rewrite 3",
          prompt: "Select the strongest present question rewrite.",
          options: [
            "Does the speaker explain the rubric clearly?",
            "Does the speaker explains the rubric clearly?",
            "Do the speaker explain the rubric clearly?",
            "Speaker does explain the rubric clearly?"
          ],
          answer: 0,
          explain: "Singular subject speaker uses does."
        }
      ]
    },
    "mission-sequence-lab": {
      pack04: [
        {
          scene: "Connector Sequence 1",
          prompt: "Choose the sentence with the clearest cause/result order.",
          options: [
            "We checked the sources, so we corrected the sentence.",
            "We checked the sources, because so we corrected the sentence.",
            "We checked the sources, and because we corrected the sentence.",
            "Checked sources so corrected sentence."
          ],
          answer: 0,
          explain: "Sequence logic is strongest with one connector."
        },
        {
          scene: "Connector Sequence 2",
          prompt: "Pick the strongest contrast sequence line.",
          options: [
            "We prepared carefully, but the first draft still had errors.",
            "We prepared carefully, but and the first draft still had errors.",
            "We prepared carefully, however but the first draft still had errors.",
            "We prepared carefully, but first draft have errors."
          ],
          answer: 0,
          explain: "One contrast signal keeps sequence readable."
        },
        {
          scene: "Connector Sequence 3",
          prompt: "Select the best purpose sequence sentence.",
          options: [
            "We color-coded notes to make the timeline easier to follow.",
            "We color-coded notes for make the timeline easier to follow.",
            "We color-coded notes to making the timeline easier to follow.",
            "We color-coded notes because to easy timeline."
          ],
          answer: 0,
          explain: "Purpose is cleanest with to + base verb."
        }
      ],
      pack05: [
        {
          scene: "Reference Sequence 1",
          prompt: "Choose the sequence line with clear reference.",
          options: [
            "Mina reviewed the script, then Mina sent it to Ece.",
            "Mina reviewed the script, then she sent it to Ece.",
            "Mina reviewed script, then sent it to Ece.",
            "Mina reviewed the script, then she were sending it to Ece."
          ],
          answer: 0,
          explain: "Explicit subject naming keeps sequence reference clear."
        },
        {
          scene: "Reference Sequence 2",
          prompt: "Pick the strongest sequence sentence.",
          options: [
            "The science club finished the chart, and the club posted it.",
            "The science club finished the chart, and it posted it.",
            "Science club finished chart and posted it.",
            "The science club finished the chart, and they was post it."
          ],
          answer: 0,
          explain: "Clear ownership strengthens sequence writing."
        },
        {
          scene: "Reference Sequence 3",
          prompt: "Select the best timeline sentence with clear names.",
          options: [
            "Elif called Duru, and Elif explained the correction.",
            "Elif called Duru, and she explained the correction.",
            "Elif called Duru and explained correction.",
            "Elif called Duru, and she were explaining the correction."
          ],
          answer: 0,
          explain: "Explicit reference avoids ambiguity across steps."
        }
      ],
      pack06: [
        {
          scene: "Question Sequence 1",
          prompt: "Choose the strongest question in sequence order.",
          options: [
            "First we checked notes; then we asked, Did we miss anything?",
            "First we checked notes; then we asked, Did we missed anything?",
            "First we checked notes; then we asked, Does we miss anything?",
            "First checked notes then asked did missed anything."
          ],
          answer: 0,
          explain: "Did + base verb keeps the question stage accurate."
        },
        {
          scene: "Question Sequence 2",
          prompt: "Pick the strongest Wh-question sequence line.",
          options: [
            "After comparing drafts, we asked where the file was saved.",
            "After comparing drafts, we asked where did the file saved.",
            "After comparing drafts, we asked where file did save.",
            "After comparing drafts, asked where saved file."
          ],
          answer: 0,
          explain: "Question sequence should preserve grammatical word order."
        },
        {
          scene: "Question Sequence 3",
          prompt: "Select the best present question sentence.",
          options: [
            "Now we ask: Does each sentence match the evidence?",
            "Now we ask: Does each sentence matches the evidence?",
            "Now we ask: Do each sentence match the evidence?",
            "Now we ask does each sentence match evidence?"
          ],
          answer: 0,
          explain: "Singular subject each sentence takes does."
        }
      ]
    },
    "evidence-sort-board": {
      pack04: [
        {
          scene: "Connector Evidence 1",
          prompt: "Choose the line that links reason and result clearly.",
          options: [
            "The sign was unclear, so students asked for help.",
            "The sign was unclear, because so students asked for help.",
            "The sign was unclear, and because students asked for help.",
            "The sign unclear, so asked for help students."
          ],
          answer: 0,
          explain: "Use one logical connector for a clean evidence chain."
        },
        {
          scene: "Connector Evidence 2",
          prompt: "Pick the strongest contrast sentence.",
          options: [
            "We prepared carefully, but the first attempt failed.",
            "We prepared carefully, but and the first attempt failed.",
            "We prepared carefully, however but the first attempt failed.",
            "We prepared carefully, but the first attempt fail yesterday."
          ],
          answer: 0,
          explain: "Contrast should use one connector with correct verbs."
        },
        {
          scene: "Connector Evidence 3",
          prompt: "Select the clearest purpose sentence.",
          options: [
            "We highlighted key words to make directions clearer.",
            "We highlighted key words for make directions clearer.",
            "We highlighted key words to making directions clearer.",
            "We highlighted key words because to clearer directions."
          ],
          answer: 0,
          explain: "To + base verb expresses purpose clearly."
        }
      ],
      pack05: [
        {
          scene: "Reference Evidence 1",
          prompt: "Choose the sentence with clear pronoun reference.",
          options: [
            "Aylin gave Melis the file after Aylin checked it.",
            "Aylin gave Melis the file after she checked it.",
            "Aylin gave Melis the file after it checked it.",
            "Aylin gave Melis file after she were checking it."
          ],
          answer: 0,
          explain: "Repeating the noun prevents pronoun ambiguity."
        },
        {
          scene: "Reference Evidence 2",
          prompt: "Pick the strongest rewrite for clarity.",
          options: [
            "The science club submitted the report, and the club signed it.",
            "The science club submitted the report, and it signed it.",
            "The science club submitted report, and signed it.",
            "The science club submitted the report and they was sign it."
          ],
          answer: 0,
          explain: "Clear references avoid confusion in evidence logs."
        },
        {
          scene: "Reference Evidence 3",
          prompt: "Select the option with no unclear pronoun.",
          options: [
            "Mina called Ece after Mina reviewed the notes.",
            "Mina called Ece after she reviewed the notes.",
            "Mina called Ece after it reviewed the notes.",
            "Mina called Ece after she were reviewing the notes."
          ],
          answer: 0,
          explain: "Explicit subject naming keeps reference accurate."
        }
      ],
      pack06: [
        {
          scene: "Question Evidence 1",
          prompt: "Choose the correct yes-no question.",
          options: [
            "Did the class finish the draft before noon?",
            "Did the class finished the draft before noon?",
            "Does the class finished the draft before noon?",
            "Class did finish the draft before noon?"
          ],
          answer: 0,
          explain: "Did + base verb is required."
        },
        {
          scene: "Question Evidence 2",
          prompt: "Pick the strongest Wh-question.",
          options: [
            "Where did the team save the final file?",
            "Where did the team saved the final file?",
            "Where the team did save the final file?",
            "Where did saved the team final file?"
          ],
          answer: 0,
          explain: "Wh + did + subject + base verb is the target order."
        },
        {
          scene: "Question Evidence 3",
          prompt: "Select the best present question.",
          options: [
            "Does the monitor show the update status?",
            "Does the monitor shows the update status?",
            "Do the monitor show the update status?",
            "Monitor does show the update status?"
          ],
          answer: 0,
          explain: "Singular subject takes does + base verb."
        }
      ]
    }
  };

  function cloneRound(round) {
    return {
      scene: round.scene,
      prompt: round.prompt,
      options: round.options.slice(),
      answer: round.answer,
      explain: round.explain
    };
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function cloneRounds(list) {
    return list.map(cloneRound);
  }

  function resolveRoundBank(key, packId) {
    var variant = packVariantBanks[key];
    if (variant && variant[packId]) return variant[packId];
    return roundBanks[key] || fallbackRounds;
  }

  function resolveGameConfig(key, packId, baseCfg) {
    var packLabels = {
      pack01: "Retell What Happened",
      pack02: "Speak In The Moment",
      pack03: "Sentence Confidence Missions",
      pack04: "Link Ideas Clearly",
      pack05: "Reference Smartly",
      pack06: "Question Flow Missions"
    };
    var next = {
      title: baseCfg.title,
      subtitle: baseCfg.subtitle,
      howTo: baseCfg.howTo
    };
    if (key === "dialogue-repair" || key === "rewrite-studio" || key === "mission-sequence-lab" || key === "evidence-sort-board") {
      var focus = packLabels[packId] || packId.toUpperCase();
      next.subtitle = baseCfg.subtitle + " Pack focus: " + focus + ".";
      next.howTo = baseCfg.howTo + " Keep answers aligned to the " + focus + " grammar target.";
    }
    return next;
  }

  function applyGameUx(ux) {
    var accent = ux && ux.accent ? ux.accent : "#1f5f63";
    var columns = ux && ux.columns === 1 ? "1fr" : "1fr 1fr";
    var style = document.createElement("style");
    style.textContent = ""
      + ".k{color:" + accent + " !important;}"
      + ".chip b{color:" + accent + " !important;}"
      + ".opt b{color:" + accent + " !important;}"
      + ".opt:hover{border-color:" + accent + " !important;}"
      + ".btn.primary{background:" + accent + " !important;border-color:" + accent + " !important;}"
      + ".scene .label{color:" + accent + " !important;}"
      + ".modal h2{color:" + accent + " !important;}"
      + "#options{grid-template-columns:" + columns + " !important;}"
      + ".binary-card{border:1px solid #d9dee6;border-radius:12px;background:#fbfdff;padding:12px;display:grid;gap:8px;}"
      + ".binary-card b{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:" + accent + ";}"
      + ".binary-card p{margin:0;font-size:15px;line-height:1.45;color:#16223a;font-weight:700;}"
      + ".binary-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;}"
      + ".binary-actions .opt{min-height:56px;}"
      + ".sweep-board{display:grid;gap:10px;}"
      + ".sweep-row{border:1px solid #d9dee6;border-radius:12px;background:#fff;padding:10px;display:grid;gap:8px;}"
      + ".sweep-row p{margin:0;font-size:14px;line-height:1.45;color:#16223a;}"
      + ".sweep-actions{display:flex;gap:8px;flex-wrap:wrap;}"
      + ".sweep-pick{border:1px solid #d9dee6;border-radius:8px;background:#fff;padding:8px 10px;cursor:pointer;font:700 11px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#24334c;}"
      + ".sweep-pick.active-secure{background:#eaf8ef;border-color:#4fb28c;color:#176a49;}"
      + ".sweep-pick.active-breach{background:#fff0f0;border-color:#d47f7f;color:#8b2f2f;}"
      + ".sweep-submit{margin-top:2px;}"
      + ".opt.eliminated{opacity:.6;pointer-events:none;}"
      + ".duel-wrap{display:grid;gap:10px;}"
      + ".duel-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;}"
      + ".duel-actions .opt{min-height:72px;}"
      + ".classify-board{display:grid;gap:10px;}"
      + ".classify-row{border:1px solid #d9dee6;border-radius:12px;background:#fff;padding:10px;display:grid;gap:8px;}"
      + ".classify-row p{margin:0;font-size:14px;line-height:1.45;color:#16223a;}"
      + ".classify-actions{display:flex;gap:8px;flex-wrap:wrap;}"
      + ".classify-pick{border:1px solid #d9dee6;border-radius:8px;background:#fff;padding:8px 10px;cursor:pointer;font:700 11px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#24334c;}"
      + ".classify-pick.active-completed{background:#eaf2ff;border-color:#6a8fdf;color:#23427f;}"
      + ".classify-pick.active-ongoing{background:#efeafe;border-color:#9a78df;color:#4b2c84;}"
      + "@media (max-width:900px){.binary-actions{grid-template-columns:1fr;}}";
    document.head.appendChild(style);
  }

  function modeHelperText(mode) {
    if (mode === "smash") return "Mode rule: tap the line that contains the error.";
    if (mode === "binary") return "Mode rule: judge one highlighted line as Secure or Needs Repair.";
    if (mode === "classify") return "Mode rule: classify one sentence as Completed action or Ongoing background.";
    if (mode === "repair") return "Mode rule: read the broken line and choose the strongest repair.";
    if (mode === "duel") return "Mode rule: compare two rewrites and pick the stronger one.";
    if (mode === "sequence") return "Mode rule: choose the strongest next line for story flow.";
    if (mode === "eliminate") return "Mode rule: eliminate three weak lines and keep the strongest one.";
    if (mode === "sweep") return "Mode rule: mark each line Secure or Needs Repair, then submit the board.";
    return "Mode rule: choose the single strongest line.";
  }

  function buildRounds(bank, desiredCount) {
    var source = (bank && bank.length) ? bank : fallbackRounds;
    var target = Math.max(1, Math.min(20, desiredCount, source.length));
    return shuffle(cloneRounds(source)).slice(0, target);
  }

  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function html(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  var cfg = resolveGameConfig(gameKey, pack, games[gameKey] || games["error-smash"]);
  var ux = gameUx[gameKey] || gameUx["error-smash"];
  var activeMode = ux.playMode || "best";
  applyGameUx(ux);
  var packTitle = (window.GSPacks && window.GSPacks.meta && window.GSPacks.meta[pack] && window.GSPacks.meta[pack].short) || pack.toUpperCase();
  var teacherBtn = document.getElementById("btnTeacher");
  var homeBtn = document.getElementById("btnHome");
  if (teacherBtn) teacherBtn.setAttribute("href", "teacher-mode.html?pack=" + encodeURIComponent(pack));
  if (homeBtn) homeBtn.setAttribute("href", "index.html");

  text("gameTitle", cfg.title);
  text("gameSub", cfg.subtitle);
  text("gameK", "Pack: " + packTitle + " \u00b7 Difficulty: " + difficulty + " \u00b7 Mode: " + (ux.modeLabel || "Standard"));
  text("howToText", cfg.howTo + " " + modeHelperText(activeMode) + (playFormat === "teams" ? " Teams mode enabled: alternate turns between teams." : ""));
  text("howToTitle", "How to play: " + cfg.title);
  text("hudTimer", timerOn ? "--" : "Off");
  var sceneLabelEl = document.querySelector(".scene .label");
  if (sceneLabelEl && ux.sceneLabel) sceneLabelEl.textContent = ux.sceneLabel;

  var rounds = buildRounds(resolveRoundBank(gameKey, pack), count);
  var idx = 0;
  var correct = 0;
  var streak = 0;
  var locked = false;
  var sec = timerOn ? rounds.length * 9 : null;
  var timer = null;

  var optionsEl = document.getElementById("options");

  function updateHud() {
    text("hudCase", Math.min(idx + 1, rounds.length) + "/" + rounds.length);
    text("hudAcc", Math.round((correct / Math.max(1, idx)) * 100) + "%");
    text("hudStreak", String(streak));
    if (timerOn) text("hudTimer", Math.max(0, sec) + "s");
  }

  function buildOptionButton(label, description) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opt";
    var b = document.createElement("b");
    b.textContent = label;
    var span = document.createElement("span");
    span.textContent = description;
    btn.appendChild(b);
    btn.appendChild(span);
    return btn;
  }

  function finishRound(userCorrect, successMsg, failMsg, btn) {
    if (locked) return;
    locked = true;
    idx += 1;
    if (userCorrect) {
      correct += 1;
      streak += 1;
      if (btn) btn.classList.add("good");
      html("feedback", "<span class=\"ok\">" + successMsg + "</span>");
      if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
    } else {
      streak = 0;
      if (btn) btn.classList.add("bad");
      html("feedback", "<span class=\"bad\">" + failMsg + "</span>");
    }
    updateHud();
    setTimeout(showRound, 900);
  }

  function showChoiceOptions(round) {
    optionsEl.style.gridTemplateColumns = ux.columns === 1 ? "1fr" : "1fr 1fr";
    optionsEl.innerHTML = "";
    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item, displayIdx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>" + String.fromCharCode(65 + displayIdx) + "</b><span>" + item.lineText + "</span>";
      btn.addEventListener("click", function () {
        selectOption(item.optionIdx, item.lineText, round, btn);
      });
      optionsEl.appendChild(btn);
    });
  }

  function pickWrongIndex(round, excludeIdx) {
    var wrong = [];
    for (var i = 0; i < round.options.length; i++) {
      if (i !== round.answer && i !== excludeIdx) wrong.push(i);
    }
    return wrong[Math.floor(Math.random() * wrong.length)];
  }

  function showRepairOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var brokenIdx = pickWrongIndex(round);
    var brokenLine = round.options[brokenIdx];
    var rightLine = round.options[round.answer];

    var card = document.createElement("div");
    card.className = "binary-card";
    var cardK = document.createElement("b");
    cardK.textContent = "Broken line";
    var cardText = document.createElement("p");
    cardText.textContent = brokenLine;
    card.appendChild(cardK);
    card.appendChild(cardText);
    optionsEl.appendChild(card);

    var choices = [round.answer];
    while (choices.length < Math.min(3, round.options.length)) {
      var candidate = pickWrongIndex(round, brokenIdx);
      if (choices.indexOf(candidate) === -1) choices.push(candidate);
    }
    choices = shuffle(choices.map(function (idx) { return { idx: idx, text: round.options[idx] }; }));

    var choicesWrap = document.createElement("div");
    choicesWrap.className = "duel-actions";
    choices.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>Repair " + String.fromCharCode(65 + i) + "</b><span>" + item.text + "</span>";
      btn.addEventListener("click", function () {
        finishRound(
          item.idx === round.answer,
          "Repair secured: strongest correction chosen. " + round.explain,
          "Repair missed: correct line is \"" + rightLine + "\". " + round.explain,
          btn
        );
      });
      choicesWrap.appendChild(btn);
    });
    optionsEl.appendChild(choicesWrap);
  }

  function showDuelOptions(round, duelLabel) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var wrongIdx = pickWrongIndex(round);
    var duel = shuffle([
      { idx: round.answer, text: round.options[round.answer] },
      { idx: wrongIdx, text: round.options[wrongIdx] }
    ]);

    var wrap = document.createElement("div");
    wrap.className = "duel-wrap";
    var card = document.createElement("div");
    card.className = "binary-card";
    var cardK = document.createElement("b");
    cardK.textContent = duelLabel;
    var cardText = document.createElement("p");
    cardText.textContent = "Choose the stronger sentence.";
    card.appendChild(cardK);
    card.appendChild(cardText);
    wrap.appendChild(card);

    var actions = document.createElement("div");
    actions.className = "duel-actions";
    duel.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>Option " + String.fromCharCode(65 + i) + "</b><span>" + item.text + "</span>";
      btn.addEventListener("click", function () {
        finishRound(
          item.idx === round.answer,
          "Strong choice secured. " + round.explain,
          "Weaker option selected. " + round.explain,
          btn
        );
      });
      actions.appendChild(btn);
    });
    wrap.appendChild(actions);
    optionsEl.appendChild(wrap);
  }

  function sentenceClass(lineText) {
    return /\b(was|were)\s+\w+ing\b/i.test(lineText) ? "ongoing" : "completed";
  }

  function showClassifyOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var assignments = {};

    var board = document.createElement("div");
    board.className = "classify-board";

    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item) {
      var row = document.createElement("div");
      row.className = "classify-row";
      var line = document.createElement("p");
      line.textContent = item.lineText;

      var actions = document.createElement("div");
      actions.className = "classify-actions";
      var completedBtn = document.createElement("button");
      completedBtn.type = "button";
      completedBtn.className = "classify-pick";
      completedBtn.textContent = "Completed Event";

      var ongoingBtn = document.createElement("button");
      ongoingBtn.type = "button";
      ongoingBtn.className = "classify-pick";
      ongoingBtn.textContent = "Ongoing Background";

      function setPick(kind) {
        assignments[item.optionIdx] = kind;
        completedBtn.classList.toggle("active-completed", kind === "completed");
        ongoingBtn.classList.toggle("active-ongoing", kind === "ongoing");
      }

      completedBtn.addEventListener("click", function () {
        if (locked) return;
        setPick("completed");
      });
      ongoingBtn.addEventListener("click", function () {
        if (locked) return;
        setPick("ongoing");
      });

      actions.appendChild(completedBtn);
      actions.appendChild(ongoingBtn);
      row.appendChild(line);
      row.appendChild(actions);
      board.appendChild(row);
    });

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn primary sweep-submit";
    submitBtn.textContent = "Submit Classification";
    submitBtn.addEventListener("click", function () {
      if (locked) return;
      if (Object.keys(assignments).length < round.options.length) {
        html("feedback", "<span class=\"bad\">Classify every line first, then submit.</span>");
        return;
      }
      var allCorrect = true;
      for (var i = 0; i < round.options.length; i++) {
        if (assignments[i] !== sentenceClass(round.options[i])) {
          allCorrect = false;
          break;
        }
      }
      finishRound(
        allCorrect,
        "Timeline classification secured. " + round.explain,
        "Timeline classification mismatch. " + round.explain,
        submitBtn
      );
    });

    optionsEl.appendChild(board);
    optionsEl.appendChild(submitBtn);
  }

  function showBinaryOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var candidateIdx = Math.floor(Math.random() * round.options.length);
    var candidateText = round.options[candidateIdx];
    var candidateCorrect = candidateIdx === round.answer;

    var card = document.createElement("div");
    card.className = "binary-card";
    var cardK = document.createElement("b");
    cardK.textContent = "Line under review";
    var cardText = document.createElement("p");
    cardText.textContent = candidateText;
    card.appendChild(cardK);
    card.appendChild(cardText);

    var actions = document.createElement("div");
    actions.className = "binary-actions";
    var secureBtn = buildOptionButton("Secure", "This line is grammatically correct.");
    var repairBtn = buildOptionButton("Needs Repair", "This line has an error.");

    secureBtn.addEventListener("click", function () {
      selectBinaryVerdict(true, candidateCorrect, round, secureBtn);
    });
    repairBtn.addEventListener("click", function () {
      selectBinaryVerdict(false, candidateCorrect, round, repairBtn);
    });

    actions.appendChild(secureBtn);
    actions.appendChild(repairBtn);
    optionsEl.appendChild(card);
    optionsEl.appendChild(actions);
  }

  function showEliminateOptions(round) {
    optionsEl.style.gridTemplateColumns = ux.columns === 1 ? "1fr" : "1fr 1fr";
    optionsEl.innerHTML = "";
    var removedWrong = 0;
    var totalWrong = Math.max(0, round.options.length - 1);

    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item, displayIdx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>" + String.fromCharCode(65 + displayIdx) + "</b><span>" + item.lineText + "</span>";
      btn.addEventListener("click", function () {
        if (locked || btn.classList.contains("eliminated")) return;
        if (item.optionIdx === round.answer) {
          locked = true;
          idx += 1;
          streak = 0;
          btn.classList.add("bad");
          html("feedback", "<span class=\"bad\">You eliminated the strongest line. Keep one strong line and remove weak ones. " + round.explain + "</span>");
          updateHud();
          setTimeout(showRound, 900);
          return;
        }
        btn.classList.add("bad", "eliminated");
        removedWrong += 1;
        if (removedWrong >= totalWrong) {
          locked = true;
          idx += 1;
          correct += 1;
          streak += 1;
          html("feedback", "<span class=\"ok\">All weak lines eliminated. Strongest line secured. " + round.explain + "</span>");
          if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
          updateHud();
          setTimeout(showRound, 900);
        } else {
          html("feedback", "<span class=\"ok\">Weak line removed. " + (totalWrong - removedWrong) + " weak lines left.</span>");
        }
      });
      optionsEl.appendChild(btn);
    });
  }

  function showSweepOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var selections = {};

    var board = document.createElement("div");
    board.className = "sweep-board";

    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item) {
      var row = document.createElement("div");
      row.className = "sweep-row";

      var line = document.createElement("p");
      line.textContent = item.lineText;

      var actions = document.createElement("div");
      actions.className = "sweep-actions";

      var secureBtn = document.createElement("button");
      secureBtn.type = "button";
      secureBtn.className = "sweep-pick";
      secureBtn.textContent = "Secure";

      var repairBtn = document.createElement("button");
      repairBtn.type = "button";
      repairBtn.className = "sweep-pick";
      repairBtn.textContent = "Needs Repair";

      function setChoice(isSecure) {
        selections[item.optionIdx] = isSecure;
        secureBtn.classList.toggle("active-secure", isSecure);
        repairBtn.classList.toggle("active-breach", !isSecure);
      }

      secureBtn.addEventListener("click", function () {
        if (locked) return;
        setChoice(true);
      });
      repairBtn.addEventListener("click", function () {
        if (locked) return;
        setChoice(false);
      });

      actions.appendChild(secureBtn);
      actions.appendChild(repairBtn);
      row.appendChild(line);
      row.appendChild(actions);
      board.appendChild(row);
    });

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn primary sweep-submit";
    submitBtn.textContent = "Submit Board Verdict";
    submitBtn.addEventListener("click", function () {
      if (locked) return;
      if (Object.keys(selections).length < round.options.length) {
        html("feedback", "<span class=\"bad\">Mark every line first, then submit your verdict.</span>");
        return;
      }
      locked = true;
      idx += 1;
      var allCorrect = true;
      for (var i = 0; i < round.options.length; i++) {
        var shouldSecure = i === round.answer;
        if (selections[i] !== shouldSecure) {
          allCorrect = false;
          break;
        }
      }
      if (allCorrect) {
        correct += 1;
        streak += 1;
        html("feedback", "<span class=\"ok\">Board verified: only the strongest line is marked secure. " + round.explain + "</span>");
        if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
      } else {
        streak = 0;
        html("feedback", "<span class=\"bad\">Board mismatch: one or more verdicts are incorrect. " + round.explain + "</span>");
      }
      updateHud();
      setTimeout(showRound, 900);
    });

    optionsEl.appendChild(board);
    optionsEl.appendChild(submitBtn);
  }

  function showRound() {
    if (idx >= rounds.length) {
      endGame();
      return;
    }
    locked = false;
    text("feedback", "");
    var round = rounds[idx];
    text("scene", round.scene);
    if (activeMode === "smash") {
      text("prompt", round.prompt + " Smash the line with the error.");
      showChoiceOptions(round);
    } else if (activeMode === "binary") {
      text("prompt", round.prompt + " Evaluate the highlighted line.");
      showBinaryOptions(round);
    } else if (activeMode === "classify") {
      text("prompt", round.prompt + " Classify each line by timeline role.");
      showClassifyOptions(round);
    } else if (activeMode === "repair") {
      text("prompt", round.prompt + " Repair the broken line.");
      showRepairOptions(round);
    } else if (activeMode === "duel") {
      text("prompt", round.prompt + " Compare two rewrites.");
      showDuelOptions(round, "Rewrite Duel");
    } else if (activeMode === "sequence") {
      text("prompt", round.prompt + " Choose the stronger next line.");
      showDuelOptions(round, "Next-line Duel");
    } else if (activeMode === "eliminate") {
      text("prompt", round.prompt + " Eliminate 3 weak lines and keep the strongest one.");
      showEliminateOptions(round);
    } else if (activeMode === "sweep") {
      text("prompt", round.prompt + " Mark each line Secure or Needs Repair, then submit.");
      showSweepOptions(round);
    } else {
      text("prompt", round.prompt);
      showChoiceOptions(round);
    }
    updateHud();
  }

  function selectOption(selectedIdx, selectedText, round, btn) {
    if (locked) return;
    locked = true;
    idx += 1;
    var userCorrect = activeMode === "smash" ? selectedIdx !== round.answer : selectedIdx === round.answer;
    if (userCorrect) {
      correct += 1;
      streak += 1;
      btn.classList.add("good");
      if (activeMode === "smash") {
        html("feedback", "<span class=\"ok\">Hit confirmed: you smashed an incorrect line. " + round.explain + "</span>");
      } else {
        html("feedback", "<span class=\"ok\">Secure: " + round.explain + "</span>");
      }
      if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
    } else {
      streak = 0;
      btn.classList.add("bad");
      if (activeMode === "smash") {
        html("feedback", "<span class=\"bad\">That line is already correct. Smash an error line instead. " + round.explain + "</span>");
      } else {
        html("feedback", "<span class=\"bad\">Needs repair: " + round.explain + "</span>");
      }
    }
    updateHud();
    setTimeout(showRound, 850);
  }

  function selectBinaryVerdict(markSecure, candidateCorrect, round, btn) {
    if (locked) return;
    locked = true;
    idx += 1;
    var userCorrect = markSecure ? candidateCorrect : !candidateCorrect;
    if (userCorrect) {
      correct += 1;
      streak += 1;
      btn.classList.add("good");
      html("feedback", "<span class=\"ok\">Verdict confirmed: " + (candidateCorrect ? "this line is secure. " : "this line needs repair. ") + round.explain + "</span>");
      if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
    } else {
      streak = 0;
      btn.classList.add("bad");
      html("feedback", "<span class=\"bad\">Verdict mismatch: this line is " + (candidateCorrect ? "secure. " : "not secure. ") + round.explain + "</span>");
    }
    updateHud();
    setTimeout(showRound, 850);
  }

  function endGame() {
    if (timer) clearInterval(timer);
    var acc = Math.round((correct / Math.max(1, idx)) * 100);
    text("reportAcc", "Accuracy: " + acc + "% (" + correct + "/" + Math.max(1, idx) + ")");
    text("reportPlan", acc >= 80 ? "Recommendation: advance to the next mission game." : "Recommendation: replay this game for retrieval strength.");
    text("reportPack", "Pack: " + packTitle + " \u00b7 Game: " + cfg.title);
    var report = document.getElementById("reportOverlay");
    if (report) report.classList.add("show");
  }

  function startTimer() {
    if (!timerOn) return;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      sec -= 1;
      text("hudTimer", Math.max(0, sec) + "s");
      if (sec <= 0) endGame();
    }, 1000);
  }

  var startOverlay = document.getElementById("startOverlay");
  var startBtn = document.getElementById("startBtn");
  if (startBtn && ux.startText) startBtn.textContent = ux.startText;
  if (startBtn) {
    startBtn.addEventListener("click", function () {
      if (startOverlay) startOverlay.classList.remove("show");
      showRound();
      startTimer();
    });
  }

  var endBtn = document.getElementById("endBtn");
  if (endBtn && ux.endText) endBtn.textContent = ux.endText;
  if (endBtn) endBtn.addEventListener("click", endGame);

  var replayBtn = document.getElementById("replayBtn");
  if (replayBtn && ux.replayText) replayBtn.textContent = ux.replayText;
  if (replayBtn) {
    replayBtn.addEventListener("click", function () {
      var report = document.getElementById("reportOverlay");
      if (report) report.classList.remove("show");
      rounds = buildRounds(resolveRoundBank(gameKey, pack), count);
      idx = 0;
      correct = 0;
      streak = 0;
      sec = timerOn ? rounds.length * 9 : null;
      showRound();
      startTimer();
    });
  }
})();
