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
      },
      {
        scene: "Briefing Room",
        prompt: "Smash the incorrect draft and choose the best fix.",
        options: [
          "While the agent was reviewing the map, a message arrived.",
          "While the agent reviewing the map, a message arrived.",
          "While the agent is reviewing the map, a message arrived.",
          "While the agent were reviewing the map, a message arrived."
        ],
        answer: 0,
        explain: "Past continuous with was shows an ongoing past action interrupted by an event."
      },
      {
        scene: "Supply Closet",
        prompt: "Which sentence is error-free?",
        options: [
          "Someone take the last notebook before third period.",
          "Someone took the last notebook before third period.",
          "Someone is took the last notebook before third period.",
          "Someone were taking the last notebook before third period."
        ],
        answer: 1,
        explain: "A completed past event uses simple past took."
      },
      {
        scene: "Detention Log",
        prompt: "Choose the strongest correction.",
        options: [
          "The students was talking when the supervisor walked in.",
          "The students talked when the supervisor walks in.",
          "The students were talking when the supervisor walked in.",
          "The students talking when the supervisor walked in."
        ],
        answer: 2,
        explain: "Plural subject students takes were in past continuous."
      },
      {
        scene: "Staff Memo",
        prompt: "Select the corrected sentence.",
        options: [
          "The staff discussed the schedule and then they leaves.",
          "The staff discussed the schedule and then they left.",
          "The staff discuss the schedule and then they left yesterday.",
          "The staff was discuss the schedule and then they left."
        ],
        answer: 1,
        explain: "A completed sequence in the past keeps both verbs in simple past."
      },
      {
        scene: "Gym Locker",
        prompt: "Choose the error-free sentence.",
        options: [
          "The coach was explaining the drill when the fire alarm rang.",
          "The coach was explaining the drill when the fire alarm was ring.",
          "The coach explaining the drill when the fire alarm rang.",
          "The coach were explaining the drill when the fire alarm rings."
        ],
        answer: 0,
        explain: "Past continuous with was plus simple past rang shows an interrupted action."
      },
      {
        scene: "Library Return Log",
        prompt: "Select the strongest correction.",
        options: [
          "She returned the books and then she goes to class.",
          "She returned the books and then she went to class.",
          "She returning the books and then she went to class.",
          "She was returned the books and then she went to class."
        ],
        answer: 1,
        explain: "Two completed actions in sequence both need simple past."
      },
      {
        scene: "Nurse's Office",
        prompt: "Which sentence is grammatically correct?",
        options: [
          "The student was waited in the nurse's office when the bell rang.",
          "The student waiting in the nurse's office when the bell rang.",
          "The student waited in the nurse's office when the bell rings.",
          "The student was waiting in the nurse's office when the bell rang."
        ],
        answer: 3,
        explain: "Was waiting shows an ongoing action interrupted by the bell."
      },
      {
        scene: "Parking Lot Cam",
        prompt: "Smash the error and pick the best sentence.",
        options: [
          "Did the buses left before the rain started?",
          "Did the buses leave before the rain started?",
          "Does the buses leave before the rain started?",
          "The buses did left before the rain started?"
        ],
        answer: 1,
        explain: "Did + base verb leave is the correct past question form."
      },
      {
        scene: "Witness Log",
        prompt: "Smash the incorrect draft and choose the best fix.",
        options: [
          "The witness was describing the suspect when the officer arrived.",
          "The witness describing the suspect when the officer arrived.",
          "The witness were describing the suspect when the officer arrived.",
          "The witness is describing the suspect when the officer arrived."
        ],
        answer: 0,
        explain: "Singular subject takes was in past continuous; simple past arrived shows the interruption."
      },
      {
        scene: "Morning Brief",
        prompt: "Select the corrected sentence.",
        options: [
          "The captain reviewed the case notes before the meeting started.",
          "The captain review the case notes before the meeting started.",
          "The captain was review the case notes before the meeting started.",
          "The captain reviews the case notes before the meeting started yesterday."
        ],
        answer: 0,
        explain: "Two completed past actions use simple past reviewed and started."
      },
      {
        scene: "Field Report",
        prompt: "Which sentence is error-free?",
        options: [
          "The officers was searching the building when backup arrived.",
          "The officers were searching the building when backup arrived.",
          "The officers searched the building when backup arrives.",
          "The officers searching the building when backup arrived."
        ],
        answer: 1,
        explain: "Plural officers takes were in past continuous; arrived is simple past for the interruption."
      },
      {
        scene: "Incident Record",
        prompt: "Choose the strongest correction.",
        options: [
          "Did the team completed the report before midnight?",
          "Did the team complete the report before midnight?",
          "Does the team complete the report before midnight yesterday?",
          "The team did completed the report before midnight?"
        ],
        answer: 1,
        explain: "Did + base verb complete is the correct past question form."
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
      },
      {
        scene: "Timeline Card G",
        prompt: "Choose the sentence that shows a completed past action.",
        options: [
          "The principal announced the results after lunch.",
          "The principal was announcing the results after lunch.",
          "The principal announces the results after lunch yesterday.",
          "The principal is announcing the results after lunch."
        ],
        answer: 0,
        explain: "A completed single action in the past takes simple past announced."
      },
      {
        scene: "Timeline Card H",
        prompt: "Select the line that shows an ongoing action interrupted by an event.",
        options: [
          "We were organizing the files when the power went out.",
          "We organized the files when the power goes out.",
          "We are organizing the files when the power went out.",
          "We organizing the files when the power went out."
        ],
        answer: 0,
        explain: "Were organizing shows background action interrupted by went out."
      },
      {
        scene: "Timeline Card I",
        prompt: "Pick the sentence with correct timeline meaning.",
        options: [
          "She finished the report, saved it, and then she leave.",
          "She finished the report, saved it, and then she left.",
          "She was finish the report, saved it, and then she left.",
          "She finishing the report, saving it, and then she left."
        ],
        answer: 1,
        explain: "A sequence of completed actions uses consistent simple past verbs."
      },
      {
        scene: "Timeline Card J",
        prompt: "Which sentence matches the meaning: background action in progress?",
        options: [
          "The librarian sorted the returns while students studied quietly.",
          "The librarian was sorting the returns while students were studying quietly.",
          "The librarian sorts the returns while students were studying quietly.",
          "The librarian was sorting the returns while students study quietly."
        ],
        answer: 1,
        explain: "Two simultaneous ongoing past actions both use past continuous."
      },
      {
        scene: "Timeline Card K",
        prompt: "Choose the sentence that shows two simultaneous past actions.",
        options: [
          "The teacher was reading aloud while the students were taking notes.",
          "The teacher read aloud while the students takes notes.",
          "The teacher reads aloud while the students were taking notes.",
          "The teacher was reading aloud while the students take notes."
        ],
        answer: 0,
        explain: "Two simultaneous ongoing past actions both use past continuous."
      },
      {
        scene: "Timeline Card L",
        prompt: "Select the sentence for a completed past sequence.",
        options: [
          "The secretary filed the documents after the meeting ended.",
          "The secretary was filing the documents after the meeting ended.",
          "The secretary files the documents after the meeting ended yesterday.",
          "The secretary filing the documents after the meeting ended."
        ],
        answer: 0,
        explain: "A completed sequence in the past uses simple past for both actions."
      },
      {
        scene: "Timeline Card M",
        prompt: "Pick the line that shows an interrupted action.",
        options: [
          "We were reviewing the answers when the alarm sounded.",
          "We reviewed the answers when the alarm sounds.",
          "We are reviewing the answers when the alarm sounded.",
          "We reviewing the answers when the alarm sounded."
        ],
        answer: 0,
        explain: "Past continuous were reviewing shows the action interrupted by sounded."
      },
      {
        scene: "Timeline Card N",
        prompt: "Choose the sentence with correct past sequence.",
        options: [
          "After the coach blew the whistle, the players stop running.",
          "After the coach blew the whistle, the players stopped running.",
          "After the coach blows the whistle, the players stopped running.",
          "After the coach was blew the whistle, the players stopped running."
        ],
        answer: 1,
        explain: "A past sequence uses simple past in both clauses."
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
        explain: "Cause/result logic must keep tense and clause structure consistent."
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
        explain: "Past continuous background plus past simple interrupting verb gives correct timeline logic."
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
      },
      {
        scene: "Story Step 7",
        prompt: "Which line best continues the narrative?",
        options: [
          "Meanwhile, two agents were guarding the entrance while a third searched the office.",
          "Meanwhile, two agents guarding the entrance while a third searched the office.",
          "Meanwhile, two agents were guarding the entrance while a third searches the office.",
          "Meanwhile, two agents was guarding the entrance while a third searched the office."
        ],
        answer: 0,
        explain: "Parallel past actions need past continuous with correct subject-verb agreement."
      },
      {
        scene: "Story Step 8",
        prompt: "Pick the sentence that maintains story flow.",
        options: [
          "Next, the team gathered the clues and prepared a summary for the commander.",
          "Next, the team gather the clues and prepared a summary for the commander.",
          "Next, the team gathered the clues and prepares a summary for the commander.",
          "Next, the team were gathered the clues and prepared a summary for the commander."
        ],
        answer: 0,
        explain: "Sequence markers like next require consistent simple past verbs."
      },
      {
        scene: "Story Step 9",
        prompt: "Choose the strongest narrative transition.",
        options: [
          "Because the evidence was strong, the squad decided to move forward.",
          "Because the evidence strong, the squad decided to move forward.",
          "Because the evidence was strong, the squad decides to move forward yesterday.",
          "Because the evidence were strong, the squad decided to move forward."
        ],
        answer: 0,
        explain: "Cause and result clauses should keep tense consistent in past narrative."
      },
      {
        scene: "Story Step 10",
        prompt: "Select the best closing line for the story.",
        options: [
          "Finally, the captain reviewed the mission log and signed the report.",
          "Finally, the captain review the mission log and signed the report.",
          "Finally, the captain reviewed the mission log and signs the report.",
          "Finally, the captain was review the mission log and signed the report."
        ],
        answer: 0,
        explain: "A narrative conclusion uses simple past for completed actions in sequence."
      },
      {
        scene: "Story Step 11",
        prompt: "Which line continues the story with correct tense?",
        options: [
          "After the team gathered the evidence, the leader presents the plan.",
          "After the team gathered the evidence, the leader presented the plan.",
          "After the team was gather the evidence, the leader presented the plan.",
          "After the team gathers the evidence, the leader presented the plan."
        ],
        answer: 1,
        explain: "Both clauses in a past narrative need consistent simple past."
      },
      {
        scene: "Story Step 12",
        prompt: "Select the sentence that keeps the story flowing.",
        options: [
          "Meanwhile, the scout was mapping the trail while the others rested nearby.",
          "Meanwhile, the scout mapping the trail while the others rested nearby.",
          "Meanwhile, the scout was mapping the trail while the others rests nearby.",
          "Meanwhile, the scout maps the trail while the others rested nearby."
        ],
        answer: 0,
        explain: "Simultaneous past actions use past continuous and simple past together."
      },
      {
        scene: "Story Step 13",
        prompt: "Pick the best next story line.",
        options: [
          "The group decided to split up, and each member choose a different route.",
          "The group decided to split up, and each member chose a different route.",
          "The group decides to split up, and each member chose a different route.",
          "The group decided to split up, and each member was choose a different route."
        ],
        answer: 1,
        explain: "Parallel completed past actions both take simple past forms."
      },
      {
        scene: "Story Step 14",
        prompt: "Choose the line that wraps up the chapter correctly.",
        options: [
          "At last, the crew returned to base and files the final report.",
          "At last, the crew returned to base and filed the final report.",
          "At last, the crew returns to base and filed the final report.",
          "At last, the crew was returned to base and filed the final report."
        ],
        answer: 1,
        explain: "A past narrative closing needs consistent simple past verbs."
      },
      {
        scene: "Story Step 15",
        prompt: "Which line best continues the narrative?",
        options: [
          "Before the sun rose, the scouts prepared the trail markers.",
          "Before the sun rose, the scouts prepare the trail markers.",
          "Before the sun rises, the scouts prepared the trail markers.",
          "Before the sun was rose, the scouts prepared the trail markers."
        ],
        answer: 0,
        explain: "A past narrative uses simple past consistently in both clauses."
      },
      {
        scene: "Story Step 16",
        prompt: "Pick the sentence that maintains story flow.",
        options: [
          "The commander reviewed the map and assigned each team a zone.",
          "The commander review the map and assigned each team a zone.",
          "The commander reviewed the map and assigns each team a zone.",
          "The commander was review the map and assigned each team a zone."
        ],
        answer: 0,
        explain: "Parallel completed past actions both take simple past forms."
      },
      {
        scene: "Story Step 17",
        prompt: "Choose the strongest narrative transition.",
        options: [
          "While the medic was treating the wound, the radio crackled with a new message.",
          "While the medic treating the wound, the radio crackled with a new message.",
          "While the medic was treating the wound, the radio crackles with a new message.",
          "While the medic were treating the wound, the radio crackled with a new message."
        ],
        answer: 0,
        explain: "Past continuous background with was plus simple past interruption keeps the narrative clear."
      },
      {
        scene: "Story Step 18",
        prompt: "Select the best closing line for the chapter.",
        options: [
          "In the end, the team solved every puzzle and celebrated their victory.",
          "In the end, the team solve every puzzle and celebrated their victory.",
          "In the end, the team solved every puzzle and celebrates their victory.",
          "In the end, the team was solved every puzzle and celebrated their victory."
        ],
        answer: 0,
        explain: "A narrative conclusion uses consistent simple past verbs for completed actions."
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
      },
      {
        scene: "Science Lab Chat",
        prompt: "Pick the repaired dialogue line.",
        options: [
          "We doesn't have enough test tubes for the experiment.",
          "We don't have enough test tubes for the experiment.",
          "We not have enough test tubes for the experiment.",
          "We do not has enough test tubes for the experiment."
        ],
        answer: 1,
        explain: "Plural subject we takes do not (don't) plus base verb."
      },
      {
        scene: "Library Whisper",
        prompt: "Choose the best repaired question.",
        options: [
          "Can you helped me find the reference book?",
          "Can you help me find the reference book?",
          "Can you helps me find the reference book?",
          "Can you helping me find the reference book?"
        ],
        answer: 1,
        explain: "Modal can must be followed by the base verb form."
      },
      {
        scene: "Recess Recap",
        prompt: "Select the clearest spoken line.",
        options: [
          "She told him that he need to finish the poster before lunch.",
          "She told him that he needed to finish the poster before lunch.",
          "She told he that he needed to finish the poster before lunch.",
          "She told him that he needing to finish the poster before lunch."
        ],
        answer: 1,
        explain: "Reported past speech uses past tense needed for correct sequence."
      },
      {
        scene: "Morning Lineup",
        prompt: "Which response sounds natural and correct?",
        options: [
          "The teacher asked why was we late to class.",
          "The teacher asked why we were late to class.",
          "The teacher asked why we was late to class.",
          "The teacher asked why were we late to class."
        ],
        answer: 1,
        explain: "Embedded questions keep statement order: subject before verb."
      },
      {
        scene: "Cafeteria Check-in",
        prompt: "Pick the repaired dialogue line.",
        options: [
          "She don't know where the meeting is.",
          "She doesn't know where the meeting is.",
          "She doesn't knows where the meeting is.",
          "She not know where the meeting is."
        ],
        answer: 1,
        explain: "Third-person singular she requires doesn't + base verb know."
      },
      {
        scene: "Office Referral",
        prompt: "Choose the best correction for the dialogue.",
        options: [
          "He asked me where did I put the folder.",
          "He asked me where I putted the folder.",
          "He asked me where I put the folder.",
          "He asked me where I did put the folder."
        ],
        answer: 2,
        explain: "Embedded questions use statement word order: subject before verb."
      },
      {
        scene: "Study Hall Whisper",
        prompt: "Select the natural, error-free dialogue.",
        options: [
          "We was supposed to finish this yesterday, but we didn't.",
          "We were supposed to finish this yesterday, but we didn't.",
          "We were suppose to finish this yesterday, but we don't.",
          "We supposed to finish this yesterday, but we didn't."
        ],
        answer: 1,
        explain: "Plural we takes were; supposed keeps the past participle form."
      },
      {
        scene: "After-School Meetup",
        prompt: "Which line repairs the dialogue correctly?",
        options: [
          "Can you helped me carry these books to the car?",
          "Can you help I carry these books to the car?",
          "Can you help me carry these books to the car?",
          "Can you helps me carry these books to the car?"
        ],
        answer: 2,
        explain: "Modal can is followed by the base verb help; object pronoun is me."
      },
      {
        scene: "Exit Briefing",
        prompt: "Pick the repaired dialogue line.",
        options: [
          "The officer said that he don't need more evidence.",
          "The officer said that he didn't need more evidence.",
          "The officer said that he doesn't needed more evidence.",
          "The officer said that he not need more evidence."
        ],
        answer: 1,
        explain: "Reported past speech uses didn't + base verb for negative statements."
      },
      {
        scene: "Quick Check",
        prompt: "Choose the best repaired question.",
        options: [
          "Have you saw the new schedule on the board?",
          "Have you seen the new schedule on the board?",
          "Have you see the new schedule on the board?",
          "Did you have seen the new schedule on the board?"
        ],
        answer: 1,
        explain: "Have + past participle seen is the correct present perfect form."
      },
      {
        scene: "Lineup Review",
        prompt: "Select the clearest spoken line.",
        options: [
          "The principal told us that we needs to arrive on time.",
          "The principal told us that we needed to arrive on time.",
          "The principal told us that we needing to arrive on time.",
          "The principal told us that we need arrives on time."
        ],
        answer: 1,
        explain: "Reported past speech uses needed for correct tense agreement."
      },
      {
        scene: "Case Close",
        prompt: "Which response sounds natural and correct?",
        options: [
          "They was already finished when the inspector arrived.",
          "They already finish when the inspector arrived.",
          "They had already finished when the inspector arrived.",
          "They have already finish when the inspector arrived."
        ],
        answer: 2,
        explain: "Had + past participle shows an action completed before another past event."
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
        explain: "A strong rewrite preserves meaning while improving tense and clause grammar."
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
      },
      {
        scene: "Original: They was working on the task when bell ring.",
        prompt: "Choose the strongest rewrite.",
        options: [
          "They were working on the task when the bell rang.",
          "They was working on the task when the bell rang.",
          "They working on the task when bell ring.",
          "They are working on the task when bell ring yesterday."
        ],
        answer: 0,
        explain: "Plural they takes were; past interruption needs rang."
      },
      {
        scene: "Original: The student not have the right answer.",
        prompt: "Select the best rewrite.",
        options: [
          "The student did not have the right answer.",
          "The student not has the right answer.",
          "The student do not has the right answer.",
          "The student not having the right answer."
        ],
        answer: 0,
        explain: "Negative past requires did not + base verb have."
      },
      {
        scene: "Original: Me and him went to class after we eats lunch.",
        prompt: "Pick the best rewrite.",
        options: [
          "He and I went to class after we ate lunch.",
          "Me and him went to class after we ate lunch.",
          "Him and me went to class after we eats lunch.",
          "He and I gone to class after we eats lunch."
        ],
        answer: 0,
        explain: "Subject pronouns are He and I; ate is correct past of eat."
      },
      {
        scene: "Original: She telled the teacher that them was ready.",
        prompt: "Select the strongest rewrite.",
        options: [
          "She told the teacher that they were ready.",
          "She telled the teacher that they was ready.",
          "She told the teacher that them were ready.",
          "She telled the teacher that them was ready."
        ],
        answer: 0,
        explain: "Told is the correct past of tell; they were is proper agreement."
      },
      {
        scene: "Original: The students doesn't have they notebooks today.",
        prompt: "Choose the strongest rewrite.",
        options: [
          "The students don't have their notebooks today.",
          "The students doesn't have their notebooks today.",
          "The students don't has they notebooks today.",
          "The students doesn't has they notebooks today."
        ],
        answer: 0,
        explain: "Plural students takes don't; possessive their replaces they."
      },
      {
        scene: "Original: Me and her was working on the project when teacher came.",
        prompt: "Select the strongest rewrite.",
        options: [
          "She and I were working on the project when the teacher came.",
          "Me and her were working on the project when teacher came.",
          "Her and I was working on the project when the teacher came.",
          "She and me was working on the project when teacher came."
        ],
        answer: 0,
        explain: "Subject pronouns She and I with plural were; the teacher needs the article."
      },
      {
        scene: "Original: He don't remember where did he left the keys.",
        prompt: "Choose the strongest rewrite.",
        options: [
          "He doesn't remember where he left the keys.",
          "He don't remember where he left the keys.",
          "He doesn't remembers where did he left the keys.",
          "He doesn't remember where did he leave the keys."
        ],
        answer: 0,
        explain: "Singular he takes doesn't + base verb; embedded questions use statement order."
      },
      {
        scene: "Original: Although it rained, but the game was not cancelled.",
        prompt: "Select the strongest rewrite.",
        options: [
          "Although it rained, but the game was not cancelled.",
          "Although it rained, the game was not cancelled.",
          "It rained, although but the game was not cancelled.",
          "Although it raining, the game was not cancelled."
        ],
        answer: 1,
        explain: "Use one connector only; although and but should not appear together."
      },
      {
        scene: "Original: The students was excited about the results.",
        prompt: "Choose the strongest rewrite.",
        options: [
          "The students were excited about the results.",
          "The students was excited about the results.",
          "The students is excited about the results.",
          "The students excited about the results."
        ],
        answer: 0,
        explain: "Plural students requires were for correct subject-verb agreement."
      },
      {
        scene: "Original: He goed to the store and buyed some milk.",
        prompt: "Select the best rewrite.",
        options: [
          "He went to the store and bought some milk.",
          "He goed to the store and bought some milk.",
          "He went to the store and buyed some milk.",
          "He goes to the store and bought some milk."
        ],
        answer: 0,
        explain: "Went and bought are the correct irregular past forms."
      },
      {
        scene: "Original: The teacher ask us to opened our books.",
        prompt: "Pick the best rewrite.",
        options: [
          "The teacher asked us to open our books.",
          "The teacher ask us to open our books.",
          "The teacher asked us to opened our books.",
          "The teacher asking us to open our books."
        ],
        answer: 0,
        explain: "Past tense asked plus infinitive to open is the correct pattern."
      },
      {
        scene: "Original: Them don't know where is the library at.",
        prompt: "Select the strongest rewrite.",
        options: [
          "They don't know where the library is.",
          "Them don't know where the library is.",
          "They doesn't know where is the library.",
          "They don't knows where the library is at."
        ],
        answer: 0,
        explain: "Subject pronoun they with don't + base verb; embedded clause uses statement order."
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
      },
      {
        scene: "Attendance Call",
        prompt: "Choose the sentence that states a routine.",
        options: [
          "The teacher calls each name every morning.",
          "The teacher is calling each name every morning.",
          "The teacher called each name every morning now.",
          "The teacher call each name every morning."
        ],
        answer: 0,
        explain: "Every morning signals a habit, requiring simple present with calls."
      },
      {
        scene: "Lab Station",
        prompt: "Pick the line for an action happening now.",
        options: [
          "The students measure the liquid right now.",
          "The students are measuring the liquid right now.",
          "The students measured the liquid right now.",
          "The students measuring the liquid right now."
        ],
        answer: 1,
        explain: "Right now calls for present continuous with are measuring."
      },
      {
        scene: "Cafeteria Line",
        prompt: "Select the strongest third-person present sentence.",
        options: [
          "The lunch monitor watch the line every day.",
          "The lunch monitor watches the line every day.",
          "The lunch monitor is watch the line every day.",
          "The lunch monitor watched the line every day usually."
        ],
        answer: 1,
        explain: "Third-person singular routine takes watches."
      },
      {
        scene: "Hallway Pass",
        prompt: "Choose the best negative present sentence.",
        options: [
          "She does not walks in the hallway without a pass.",
          "She does not walk in the hallway without a pass.",
          "She do not walks in the hallway without a pass.",
          "She not walk in the hallway without a pass."
        ],
        answer: 1,
        explain: "Does not is followed by the base verb walk."
      },
      {
        scene: "Timer Alert",
        prompt: "Choose the sentence about a routine.",
        options: [
          "The bell is ringing every hour.",
          "The bell rings every hour.",
          "The bell rung every hour.",
          "The bell ring every hour."
        ],
        answer: 1,
        explain: "Every hour signals a routine, requiring simple present rings."
      },
      {
        scene: "Status Update",
        prompt: "Pick the line for an action happening now.",
        options: [
          "The principal announces the results right now.",
          "The principal is announcing the results right now.",
          "The principal announced the results right now.",
          "The principal announcing the results right now."
        ],
        answer: 1,
        explain: "Right now requires present continuous is announcing."
      },
      {
        scene: "Rule Board",
        prompt: "Select the correct third-person present sentence.",
        options: [
          "Mr. Khan teach science on Tuesdays.",
          "Mr. Khan teaches science on Tuesdays.",
          "Mr. Khan is teach science on Tuesdays.",
          "Mr. Khan teached science on Tuesdays usually."
        ],
        answer: 1,
        explain: "Third-person singular routine takes teaches."
      },
      {
        scene: "Quick Check",
        prompt: "Choose the correct present question.",
        options: [
          "Does the printer works after lunch?",
          "Do the printer work after lunch?",
          "Does the printer work after lunch?",
          "Printer does work after lunch?"
        ],
        answer: 2,
        explain: "Singular printer takes does + base verb work."
      },
      {
        scene: "Attendance Log",
        prompt: "Choose the sentence that states a routine.",
        options: [
          "The secretary is recording attendance every morning.",
          "The secretary records attendance every morning.",
          "The secretary recorded attendance every morning now.",
          "The secretary record attendance every morning."
        ],
        answer: 1,
        explain: "Every morning signals a routine, requiring simple present records."
      },
      {
        scene: "Lab Monitor",
        prompt: "Pick the line for an action happening now.",
        options: [
          "The student monitors the experiment right now.",
          "The student is monitoring the experiment right now.",
          "The student monitored the experiment right now.",
          "The student monitoring the experiment right now."
        ],
        answer: 1,
        explain: "Right now calls for present continuous is monitoring."
      },
      {
        scene: "Daily Briefing",
        prompt: "Select the strongest third-person present sentence.",
        options: [
          "The manager brief the team every afternoon.",
          "The manager briefs the team every afternoon.",
          "The manager is brief the team every afternoon.",
          "The manager briefed the team every afternoon usually."
        ],
        answer: 1,
        explain: "Third-person singular routine takes briefs."
      },
      {
        scene: "Quick Poll",
        prompt: "Choose the correct present question.",
        options: [
          "Does the class agrees with the new schedule?",
          "Do the class agree with the new schedule?",
          "Does the class agree with the new schedule?",
          "Class does agree with the new schedule?"
        ],
        answer: 2,
        explain: "Singular class takes does + base verb agree."
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
        explain: "Currently signals present continuous verb structure for in-progress action."
      },
      {
        scene: "Signal: at this moment",
        prompt: "Decode the signal and choose the correct line.",
        options: [
          "The principal is addressing the assembly at this moment.",
          "The principal addresses the assembly at this moment.",
          "The principal addressed the assembly at this moment.",
          "The principal address the assembly at this moment."
        ],
        answer: 0,
        explain: "At this moment signals present continuous for an action in progress."
      },
      {
        scene: "Signal: never",
        prompt: "Which sentence matches the signal?",
        options: [
          "He is never finishing homework on time.",
          "He never finishes homework on time.",
          "He never finished homework on time now.",
          "He never finish homework on time."
        ],
        answer: 1,
        explain: "Never describes a general habit, requiring simple present finishes."
      },
      {
        scene: "Signal: look",
        prompt: "Pick the line that fits immediate observation.",
        options: [
          "Look, the screen is flickering again.",
          "Look, the screen flickers again always.",
          "Look, the screen flickered again.",
          "Look, the screen flicker again."
        ],
        answer: 0,
        explain: "Look draws attention to something happening now, requiring present continuous."
      },
      {
        scene: "Signal: each morning",
        prompt: "Select the strongest habitual statement.",
        options: [
          "The janitor is unlocking the doors each morning.",
          "The janitor unlocks the doors each morning.",
          "The janitor unlocked the doors each morning.",
          "The janitor unlock the doors each morning."
        ],
        answer: 1,
        explain: "Each morning signals a repeated routine using simple present unlocks."
      },
      {
        scene: "Signal: at this moment",
        prompt: "Decode the signal and choose the correct line.",
        options: [
          "The nurse checks the roster at this moment.",
          "The nurse is checking the roster at this moment.",
          "The nurse checked the roster at this moment.",
          "The nurse check the roster at this moment."
        ],
        answer: 1,
        explain: "At this moment signals present continuous is checking."
      },
      {
        scene: "Signal: twice a week",
        prompt: "Which sentence matches the signal?",
        options: [
          "They are practising drills twice a week.",
          "They practise drills twice a week.",
          "They practised drills twice a week now.",
          "They practises drills twice a week."
        ],
        answer: 1,
        explain: "Twice a week describes a routine, requiring simple present practise."
      },
      {
        scene: "Signal: now",
        prompt: "Pick the line that fits the signal.",
        options: [
          "The coach explains the strategy now.",
          "The coach is explaining the strategy now.",
          "The coach explained the strategy now.",
          "The coach explaining the strategy now."
        ],
        answer: 1,
        explain: "Now signals an action in progress, requiring present continuous."
      },
      {
        scene: "Signal: always",
        prompt: "Select the strongest habitual statement.",
        options: [
          "She is always bringing her notebook to class.",
          "She always brings her notebook to class.",
          "She always brought her notebook to class now.",
          "She always bring her notebook to class."
        ],
        answer: 1,
        explain: "Always describes a permanent habit, requiring simple present brings."
      },
      {
        scene: "Signal: every evening",
        prompt: "Decode the signal and choose the correct line.",
        options: [
          "The guard is locking the gates every evening.",
          "The guard locks the gates every evening.",
          "The guard locked the gates every evening now.",
          "The guard lock the gates every evening."
        ],
        answer: 1,
        explain: "Every evening signals a repeated routine using simple present locks."
      },
      {
        scene: "Signal: these days",
        prompt: "Which sentence matches the signal?",
        options: [
          "She works on the new project these days.",
          "She is working on the new project these days.",
          "She worked on the new project these days.",
          "She work on the new project these days."
        ],
        answer: 1,
        explain: "These days signals a temporary ongoing situation, requiring present continuous."
      },
      {
        scene: "Signal: watch out",
        prompt: "Pick the line that fits immediate action.",
        options: [
          "Watch out, the floor is getting slippery.",
          "Watch out, the floor gets slippery always.",
          "Watch out, the floor got slippery.",
          "Watch out, the floor get slippery."
        ],
        answer: 0,
        explain: "Watch out draws attention to something happening now, requiring present continuous."
      },
      {
        scene: "Signal: on weekdays",
        prompt: "Select the strongest habitual statement.",
        options: [
          "The bus is arriving at eight on weekdays.",
          "The bus arrives at eight on weekdays.",
          "The bus arrived at eight on weekdays.",
          "The bus arrive at eight on weekdays."
        ],
        answer: 1,
        explain: "On weekdays signals a regular schedule using simple present arrives."
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
      },
      {
        scene: "Interview File 7",
        prompt: "Witness says this is a weekly habit. Choose the best line.",
        options: [
          "She reviews the case notes every Friday.",
          "She is reviewing the case notes every Friday.",
          "She reviewed the case notes every Friday now.",
          "She review the case notes every Friday."
        ],
        answer: 0,
        explain: "Weekly habit uses simple present reviews."
      },
      {
        scene: "Interview File 8",
        prompt: "Witness says action is happening now. Select the line.",
        options: [
          "The suspect waits in the hallway now.",
          "The suspect is waiting in the hallway now.",
          "The suspect waited in the hallway now.",
          "The suspect waiting in the hallway now."
        ],
        answer: 1,
        explain: "Now signals present continuous is waiting."
      },
      {
        scene: "Interview File 9",
        prompt: "Choose the strongest present question.",
        options: [
          "Do he understand the instructions?",
          "Does he understands the instructions?",
          "Does he understand the instructions?",
          "He does understand the instructions?"
        ],
        answer: 2,
        explain: "Does + base verb understand is required for singular he."
      },
      {
        scene: "Interview File 10",
        prompt: "Pick the most accurate negative present form.",
        options: [
          "The officer do not believe the alibi.",
          "The officer does not believes the alibi.",
          "The officer does not believe the alibi.",
          "The officer not believes the alibi."
        ],
        answer: 2,
        explain: "Does not must pair with base verb believe."
      },
      {
        scene: "Interview File 11",
        prompt: "Witness describes a morning habit. Choose the best line.",
        options: [
          "The guard is locking the gate every morning.",
          "The guard locks the gate every morning.",
          "The guard locked the gate every morning now.",
          "The guard lock the gate every morning."
        ],
        answer: 1,
        explain: "Every morning signals a habit, requiring simple present locks."
      },
      {
        scene: "Interview File 12",
        prompt: "Witness says the action is happening now. Select the line.",
        options: [
          "The detective examines the evidence right now.",
          "The detective is examining the evidence right now.",
          "The detective examined the evidence right now.",
          "The detective examining the evidence right now."
        ],
        answer: 1,
        explain: "Right now requires present continuous is examining."
      },
      {
        scene: "Interview File 13",
        prompt: "Choose the strongest present question for the witness.",
        options: [
          "Does the alarm rings every night?",
          "Do the alarm ring every night?",
          "Does the alarm ring every night?",
          "Alarm does ring every night?"
        ],
        answer: 2,
        explain: "Singular alarm takes does + base verb ring."
      },
      {
        scene: "Interview File 14",
        prompt: "Pick the most accurate negative present form.",
        options: [
          "The witness do not recall the licence plate.",
          "The witness does not recalls the licence plate.",
          "The witness does not recall the licence plate.",
          "The witness not recall the licence plate."
        ],
        answer: 2,
        explain: "Does not must pair with base verb recall."
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
        explain: "Subject I takes the present be-verb form am."
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
      },
      {
        scene: "Roll Call",
        prompt: "Choose the correct be-verb sentence.",
        options: [
          "She am present today.",
          "She is present today.",
          "She are present today.",
          "She be present today."
        ],
        answer: 1,
        explain: "Third-person singular she takes is."
      },
      {
        scene: "Field Report",
        prompt: "Select the line with correct past agreement.",
        options: [
          "The suspects were near the library at noon.",
          "The suspects was near the library at noon.",
          "The suspects am near the library at noon.",
          "The suspects is near the library at noon."
        ],
        answer: 0,
        explain: "Plural suspects in past takes were."
      },
      {
        scene: "Partner Pair",
        prompt: "Pick the strongest be-verb form.",
        options: [
          "Leo and I am assigned to the same group.",
          "Leo and I is assigned to the same group.",
          "Leo and I are assigned to the same group.",
          "Leo and I be assigned to the same group."
        ],
        answer: 2,
        explain: "Compound subject with I takes are."
      },
      {
        scene: "Closing Statement",
        prompt: "Choose the accurate past negative be-verb sentence.",
        options: [
          "The evidence were not strong enough.",
          "The evidence was not strong enough.",
          "The evidence are not strong enough yesterday.",
          "The evidence be not strong enough."
        ],
        answer: 1,
        explain: "Singular uncountable evidence in past takes was not."
      },
      {
        scene: "Question Form",
        prompt: "Choose the correct be-verb question.",
        options: [
          "Are she ready for the presentation?",
          "Is she ready for the presentation?",
          "Am she ready for the presentation?",
          "Be she ready for the presentation?"
        ],
        answer: 1,
        explain: "Third-person singular she takes is in questions."
      },
      {
        scene: "Classroom Roster",
        prompt: "Select the line with correct agreement.",
        options: [
          "The students was excited about the field trip.",
          "The students were excited about the field trip.",
          "The students am excited about the field trip.",
          "The students is excited about the field trip."
        ],
        answer: 1,
        explain: "Plural students in past takes were."
      },
      {
        scene: "There-Sentence",
        prompt: "Pick the strongest be-verb form.",
        options: [
          "There is three books on the desk.",
          "There are three books on the desk.",
          "There am three books on the desk.",
          "There be three books on the desk."
        ],
        answer: 1,
        explain: "Plural books requires there are."
      },
      {
        scene: "Tag Check",
        prompt: "Choose the correct be-verb tag question.",
        options: [
          "He is your partner, aren't he?",
          "He is your partner, isn't he?",
          "He is your partner, wasn't he?",
          "He is your partner, don't he?"
        ],
        answer: 1,
        explain: "Present is matches the negative tag isn't he."
      },
      {
        scene: "Contraction Check",
        prompt: "Choose the correct be-verb contraction.",
        options: [
          "They're ready for the next drill.",
          "They's ready for the next drill.",
          "They'am ready for the next drill.",
          "They is ready for the next drill."
        ],
        answer: 0,
        explain: "Plural they contracts with are to form they're."
      },
      {
        scene: "Mixed Subject",
        prompt: "Pick the sentence with correct be-verb agreement for a mixed subject.",
        options: [
          "Neither the teacher nor the students is in the lab.",
          "Neither the teacher nor the students are in the lab.",
          "Neither the teacher nor the students am in the lab.",
          "Neither the teacher nor the students was in the lab now."
        ],
        answer: 1,
        explain: "With neither…nor the verb agrees with the nearer plural subject students, so use are."
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
      },
      {
        scene: "Sweep 07",
        prompt: "Find the line with correct subject-be agreement.",
        options: [
          "The homework are due tomorrow.",
          "The homework is due tomorrow.",
          "The homework am due tomorrow.",
          "The homework were due tomorrow now."
        ],
        answer: 1,
        explain: "Homework is uncountable and singular, requiring is."
      },
      {
        scene: "Sweep 08",
        prompt: "Choose the sentence that matches the subject.",
        options: [
          "All of the pencils is sharpened.",
          "All of the pencils are sharpened.",
          "All of the pencils am sharpened.",
          "All of the pencils was sharpened now."
        ],
        answer: 1,
        explain: "Plural pencils requires are."
      },
      {
        scene: "Sweep 09",
        prompt: "Select the strongest agreement line.",
        options: [
          "Neither the teacher nor the students is happy about the delay.",
          "Neither the teacher nor the students are happy about the delay.",
          "Neither the teacher nor the students am happy about the delay.",
          "Neither the teacher nor the students was happy about the delay now."
        ],
        answer: 1,
        explain: "With neither...nor the verb agrees with the nearer subject students, so use are."
      },
      {
        scene: "Sweep 10",
        prompt: "Pick the correct sentence for present context.",
        options: [
          "The information are helpful for the test.",
          "The information is helpful for the test.",
          "The information am helpful for the test.",
          "The information were helpful for the test now."
        ],
        answer: 1,
        explain: "Information is uncountable and singular, requiring is."
      },
      {
        scene: "Sweep 11",
        prompt: "Find the line with correct subject-be agreement.",
        options: [
          "There is many reasons for the delay.",
          "There are many reasons for the delay.",
          "There am many reasons for the delay.",
          "There be many reasons for the delay."
        ],
        answer: 1,
        explain: "There are pairs with the plural noun reasons."
      },
      {
        scene: "Sweep 12",
        prompt: "Choose the sentence that matches the subject.",
        options: [
          "The committee are meeting at noon today.",
          "The committee is meeting at noon today.",
          "The committee am meeting at noon today.",
          "The committee were meeting at noon today now."
        ],
        answer: 1,
        explain: "Collective noun committee is treated as singular."
      },
      {
        scene: "Sweep 13",
        prompt: "Select the strongest agreement line.",
        options: [
          "My brother and his friend was at the park yesterday.",
          "My brother and his friend am at the park yesterday.",
          "My brother and his friend were at the park yesterday.",
          "My brother and his friend is at the park yesterday."
        ],
        answer: 2,
        explain: "Compound subject in past takes were."
      },
      {
        scene: "Sweep 14",
        prompt: "Pick the correct sentence for present context.",
        options: [
          "Every seat in the auditorium is taken.",
          "Every seat in the auditorium are taken.",
          "Every seat in the auditorium am taken.",
          "Every seat in the auditorium were taken now."
        ],
        answer: 0,
        explain: "Every makes the subject singular, requiring is."
      },
      {
        scene: "Sweep 15",
        prompt: "Choose the line with correct question agreement.",
        options: [
          "Is the players ready for the match?",
          "Am the players ready for the match?",
          "Are the players ready for the match?",
          "Be the players ready for the match?"
        ],
        answer: 2,
        explain: "Plural subject players requires are in a question."
      },
      {
        scene: "Sweep 16",
        prompt: "Find the line with correct subject-be agreement.",
        options: [
          "There is three apples on the counter.",
          "There am three apples on the counter.",
          "There are three apples on the counter.",
          "There be three apples on the counter."
        ],
        answer: 2,
        explain: "There are pairs with the plural noun apples."
      },
      {
        scene: "Sweep 17",
        prompt: "Select the accurate negative agreement sentence.",
        options: [
          "He were not absent from class last Monday.",
          "He was not absent from class last Monday.",
          "He are not absent from class last Monday.",
          "He am not absent from class last Monday."
        ],
        answer: 1,
        explain: "Singular he in the past takes was not."
      },
      {
        scene: "Sweep 18",
        prompt: "Choose the sentence that matches the subject.",
        options: [
          "Each of the experiments are documented in the log.",
          "Each of the experiments were documented in the log now.",
          "Each of the experiments is documented in the log.",
          "Each of the experiments am documented in the log."
        ],
        answer: 2,
        explain: "Each is singular, requiring is."
      },
      {
        scene: "Sweep 19",
        prompt: "Pick the correct sentence for past context.",
        options: [
          "The dogs in the yard is barking all night.",
          "The dogs in the yard were barking all night.",
          "The dogs in the yard am barking all night.",
          "The dogs in the yard be barking all night."
        ],
        answer: 1,
        explain: "Plural dogs in past takes were."
      },
      {
        scene: "Sweep 20",
        prompt: "Select the strongest agreement line.",
        options: [
          "Was the instructions clear enough for everyone?",
          "Am the instructions clear enough for everyone?",
          "Were the instructions clear enough for everyone?",
          "Be the instructions clear enough for everyone?"
        ],
        answer: 2,
        explain: "Plural instructions in a past question takes were."
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
        explain: "Subject I always takes the be-verb am in present tense."
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
      },
      {
        scene: "Interview G",
        prompt: "Witness refers to one report in the past. Choose the line.",
        options: [
          "The report were incomplete.",
          "The report was incomplete.",
          "The report are incomplete yesterday.",
          "The report be incomplete."
        ],
        answer: 1,
        explain: "Singular report in past takes was."
      },
      {
        scene: "Interview H",
        prompt: "Witness describes two classrooms. Select the sentence.",
        options: [
          "Both classrooms is locked after hours.",
          "Both classrooms are locked after hours.",
          "Both classrooms am locked after hours.",
          "Both classrooms was locked after hours now."
        ],
        answer: 1,
        explain: "Plural classrooms requires are."
      },
      {
        scene: "Interview I",
        prompt: "Past-time clue: choose the best form.",
        options: [
          "The windows was open during the incident.",
          "The windows were open during the incident.",
          "The windows are open during the incident yesterday.",
          "The windows be open during the incident."
        ],
        answer: 1,
        explain: "Plural windows in past takes were."
      },
      {
        scene: "Interview J",
        prompt: "Pick the strongest negative be-verb line.",
        options: [
          "The answer are not correct.",
          "The answer is not correct.",
          "The answer am not correct.",
          "The answer were not correct now."
        ],
        answer: 1,
        explain: "Singular answer requires is not."
      },
      {
        scene: "Interview K",
        prompt: "Witness describes one laptop in the present. Choose the line.",
        options: [
          "The laptop are on the desk right now.",
          "The laptop is on the desk right now.",
          "The laptop am on the desk right now.",
          "The laptop be on the desk right now."
        ],
        answer: 1,
        explain: "Singular laptop pairs with is."
      },
      {
        scene: "Interview L",
        prompt: "Witness refers to several witnesses in the past. Select the sentence.",
        options: [
          "The witnesses was questioned after the event.",
          "The witnesses were questioned after the event.",
          "The witnesses is questioned after the event.",
          "The witnesses am questioned after the event."
        ],
        answer: 1,
        explain: "Plural witnesses in past takes were."
      },
      {
        scene: "Interview M",
        prompt: "Choose the line with correct second-person agreement.",
        options: [
          "You is expected to arrive before nine.",
          "You am expected to arrive before nine.",
          "You are expected to arrive before nine.",
          "You was expected to arrive before nine."
        ],
        answer: 2,
        explain: "Subject you always takes are in present tense."
      },
      {
        scene: "Interview N",
        prompt: "Witness describes a compound subject. Pick the strongest line.",
        options: [
          "The principal and the counselor was present during the meeting.",
          "The principal and the counselor is present during the meeting.",
          "The principal and the counselor were present during the meeting.",
          "The principal and the counselor am present during the meeting."
        ],
        answer: 2,
        explain: "Compound subject in past takes were."
      },
      {
        scene: "Interview O",
        prompt: "Pick the strongest be-verb question.",
        options: [
          "Was the documents stored in the cabinet last week?",
          "Were the documents stored in the cabinet last week?",
          "Am the documents stored in the cabinet last week?",
          "Be the documents stored in the cabinet last week?"
        ],
        answer: 1,
        explain: "Plural documents in a past question takes were."
      },
      {
        scene: "Interview P",
        prompt: "Witness refers to one piece of evidence. Choose the line.",
        options: [
          "The fingerprint are still visible on the glass.",
          "The fingerprint is still visible on the glass.",
          "The fingerprint am still visible on the glass.",
          "The fingerprint were still visible on the glass now."
        ],
        answer: 1,
        explain: "Singular fingerprint requires is."
      },
      {
        scene: "Interview Q",
        prompt: "Select the sentence with the cleanest past-tense agreement.",
        options: [
          "I were in the hallway when the alarm rang.",
          "I was in the hallway when the alarm rang.",
          "I are in the hallway when the alarm rang.",
          "I is in the hallway when the alarm rang."
        ],
        answer: 1,
        explain: "Subject I in past tense takes was."
      },
      {
        scene: "Interview R",
        prompt: "Witness describes a negative statement. Pick the best line.",
        options: [
          "The cameras was not recording during the outage.",
          "The cameras were not recording during the outage.",
          "The cameras am not recording during the outage.",
          "The cameras is not recording during the outage."
        ],
        answer: 1,
        explain: "Plural cameras in past takes were not."
      },
      {
        scene: "Interview S",
        prompt: "Choose the line with correct third-person singular agreement.",
        options: [
          "She are the only witness available today.",
          "She am the only witness available today.",
          "She is the only witness available today.",
          "She were the only witness available today."
        ],
        answer: 2,
        explain: "Third-person singular she takes is in present."
      },
      {
        scene: "Interview T",
        prompt: "Witness describes plural items in present. Select the sentence.",
        options: [
          "The files on the server is encrypted.",
          "The files on the server am encrypted.",
          "The files on the server are encrypted.",
          "The files on the server was encrypted now."
        ],
        answer: 2,
        explain: "Plural files requires are."
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
        explain: "One precise connector keeps clause logic and sequence reasoning clear."
      },
      {
        scene: "Sequence Draft 7",
        prompt: "Choose the sentence with a correct after-clause.",
        options: [
          "After the team decoded the message, they reported the findings to headquarters.",
          "After the team decoded the message, they report the findings to headquarters.",
          "After the team decode the message, they reported the findings to headquarters.",
          "After decoded message, reported findings headquarters."
        ],
        answer: 0,
        explain: "Both clauses in a past narrative need consistent past tense."
      },
      {
        scene: "Sequence Draft 8",
        prompt: "Pick the line with the clearest result connector.",
        options: [
          "The alarm sounded early, so the agents evacuated the building immediately.",
          "The alarm sounded early, so because the agents evacuated the building immediately.",
          "The alarm sounded early, so the agents evacuate the building yesterday.",
          "The alarm sounded early, so evacuated building immediately."
        ],
        answer: 0,
        explain: "Use one result connector and keep past tense consistent."
      },
      {
        scene: "Sequence Draft 9",
        prompt: "Select the line that uses contrast correctly.",
        options: [
          "The first clue seemed obvious; however, it led the team to the wrong conclusion.",
          "The first clue seemed obvious; however but it led the team to the wrong conclusion.",
          "The first clue seemed obvious; however, it leads the team to the wrong conclusion yesterday.",
          "The first clue seemed obvious however led team wrong conclusion."
        ],
        answer: 0,
        explain: "However needs a semicolon before and a comma after, with matching past tense."
      },
      {
        scene: "Sequence Draft 10",
        prompt: "Which line gives the strongest next-step marker?",
        options: [
          "Next, the spy copied the document and returned it to the drawer.",
          "Next, the spy copy the document and returned it to the drawer.",
          "Next, the spy copied the document and return it to the drawer yesterday.",
          "Next the spy was copied the document and was returned it."
        ],
        answer: 0,
        explain: "Sequence markers like next pair with consistent simple past verbs."
      },
      {
        scene: "Sequence Draft 11",
        prompt: "Choose the sentence with clear cause-result markers.",
        options: [
          "The power went out, so the lab lost all unsaved data.",
          "The power went out, so because the lab lost all unsaved data.",
          "The power went out, so the lab loses all unsaved data yesterday.",
          "Power went out so lost unsaved data."
        ],
        answer: 0,
        explain: "One cause-result connector with consistent past tense is correct."
      },
      {
        scene: "Sequence Draft 12",
        prompt: "Pick the strongest contrast sequence line.",
        options: [
          "The team expected rain; however, the sky stayed clear all afternoon.",
          "The team expected rain; however but the sky stayed clear all afternoon.",
          "The team expected rain; however, the sky stays clear all afternoon yesterday.",
          "Team expected rain however sky stayed clear."
        ],
        answer: 0,
        explain: "However with a semicolon before and comma after links contrast correctly."
      },
      {
        scene: "Sequence Draft 13",
        prompt: "Select the line that uses time order correctly.",
        options: [
          "Before the briefing started, the agent reviewed the case files.",
          "Before the briefing started, the agent reviews the case files yesterday.",
          "Before the briefing start, the agent reviewed the case files.",
          "Before briefing started reviewed case files."
        ],
        answer: 0,
        explain: "Both clauses must use consistent past tense with a before connector."
      },
      {
        scene: "Sequence Draft 14",
        prompt: "Choose the best after-clause sentence.",
        options: [
          "After we collected the samples, we labeled each container carefully.",
          "After we collected the samples, we label each container yesterday.",
          "After we collect the samples, we labeled each container carefully.",
          "After collected samples, labeled containers."
        ],
        answer: 0,
        explain: "After-clauses need matching past tense in both parts."
      },
      {
        scene: "Sequence Draft 15",
        prompt: "Which line gives the clearest final step?",
        options: [
          "Finally, the detective sealed the evidence bag and signed the report.",
          "Finally, the detective seal the evidence bag and signed the report.",
          "Finally, the detective sealed the evidence bag and sign the report yesterday.",
          "Finally sealed evidence bag signed report."
        ],
        answer: 0,
        explain: "Final step markers pair with consistent simple past verbs."
      },
      {
        scene: "Sequence Draft 16",
        prompt: "Pick the sentence with the strongest therefore connector.",
        options: [
          "The data was corrupted; therefore, the team restarted the analysis.",
          "The data was corrupted; therefore because the team restarted the analysis.",
          "The data was corrupted; therefore, the team restarts the analysis yesterday.",
          "Data corrupted therefore restarted analysis."
        ],
        answer: 0,
        explain: "Therefore needs a semicolon before and a comma after, with matching past tense."
      },
      {
        scene: "Sequence Draft 17",
        prompt: "Select the line that avoids compound connector errors.",
        options: [
          "The alarm rang early, so the guards secured the perimeter.",
          "The alarm rang early, so because the guards secured the perimeter.",
          "The alarm rang early, because so the guards secured the perimeter.",
          "The alarm rang early, so because guards secure perimeter."
        ],
        answer: 0,
        explain: "Using two connectors together creates a compound connector error."
      },
      {
        scene: "Sequence Draft 18",
        prompt: "Choose the sentence with correct before-after logic.",
        options: [
          "The crew checked the engine before they cleared the runway.",
          "The crew checked the engine before they clear the runway yesterday.",
          "The crew check the engine before they cleared the runway.",
          "Crew checked engine before cleared runway."
        ],
        answer: 0,
        explain: "Both clauses need matching past tense with the before connector."
      },
      {
        scene: "Sequence Draft 19",
        prompt: "Pick the line with the clearest next-step marker.",
        options: [
          "Then the scientist recorded the temperature and noted the change.",
          "Then the scientist record the temperature and noted the change.",
          "Then the scientist recorded the temperature and note the change yesterday.",
          "Then scientist was recorded temperature and was noted change."
        ],
        answer: 0,
        explain: "Then pairs with consistent simple past verbs in sequence writing."
      },
      {
        scene: "Sequence Draft 20",
        prompt: "Select the line that uses because correctly.",
        options: [
          "Because the bridge was damaged, the convoy took the alternate route.",
          "Because the bridge was damaged, so the convoy took the alternate route.",
          "Because the bridge damaged, the convoy took the alternate route.",
          "Because bridge was damaged convoy took alternate route."
        ],
        answer: 0,
        explain: "Because introduces the cause; adding so creates a double connector."
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
        explain: "Explicit noun naming avoids pronoun-reference ambiguity in evidence logs."
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
      },
      {
        scene: "Evidence Card G",
        prompt: "Choose the sentence with correct subject-verb agreement.",
        options: [
          "The list of suspects includes three students from Room 204.",
          "The list of suspects include three students from Room 204.",
          "The list of suspects are including three students from Room 204.",
          "The list of suspects were include three students from Room 204."
        ],
        answer: 0,
        explain: "The subject is list (singular), so the verb must be includes."
      },
      {
        scene: "Evidence Card H",
        prompt: "Pick the line with the clearest pronoun reference.",
        options: [
          "Officer Tran handed the folder to Detective Li before Officer Tran left the room.",
          "Officer Tran handed the folder to Detective Li before he left the room.",
          "Officer Tran handed the folder to Detective Li before they was leaving the room.",
          "Officer Tran handed folder Detective Li before left room."
        ],
        answer: 0,
        explain: "Repeating the noun avoids ambiguous pronoun reference in evidence logs."
      },
      {
        scene: "Evidence Card I",
        prompt: "Select the best question-form evidence line.",
        options: [
          "Does the evidence suggest the suspect was in the building?",
          "Does the evidence suggests the suspect was in the building?",
          "Do the evidence suggest the suspect was in the building?",
          "Evidence does suggest was suspect in building?"
        ],
        answer: 0,
        explain: "Does pairs with the base form suggest, not suggests."
      },
      {
        scene: "Evidence Card J",
        prompt: "Pick the strongest present continuous evidence statement.",
        options: [
          "The investigators are reviewing the surveillance footage right now.",
          "The investigators is reviewing the surveillance footage right now.",
          "The investigators reviewing the surveillance footage right now.",
          "The investigators are review the surveillance footage right now."
        ],
        answer: 0,
        explain: "Plural subject takes are + verb-ing for present continuous."
      },
      {
        scene: "Evidence Card K",
        prompt: "Choose the strongest evidence sentence.",
        options: [
          "The guard confirmed that the gate was locked at midnight.",
          "The guard confirmed that the gate were locked at midnight.",
          "The guard confirm that the gate was locked at midnight.",
          "The guard confirmed that the gate is locked at midnight yesterday."
        ],
        answer: 0,
        explain: "Past tense confirmed and was keep the evidence statement consistent."
      },
      {
        scene: "Evidence Card L",
        prompt: "Pick the line with clear reference.",
        options: [
          "Agent Park forwarded the report to Director Ahn before Agent Park left the office.",
          "Agent Park forwarded the report to Director Ahn before he left the office.",
          "Agent Park forwarded the report to Director Ahn before they was leaving the office.",
          "Agent Park forwarded report Director Ahn before left office."
        ],
        answer: 0,
        explain: "Repeating the noun avoids ambiguous pronoun reference in evidence logs."
      },
      {
        scene: "Evidence Card M",
        prompt: "Select the best question evidence line.",
        options: [
          "Did the witness notice anything unusual near the entrance?",
          "Did the witness noticed anything unusual near the entrance?",
          "Does the witness noticed anything unusual near the entrance?",
          "Witness did notice anything unusual entrance?"
        ],
        answer: 0,
        explain: "Did pairs with the base form notice, not noticed."
      },
      {
        scene: "Evidence Card N",
        prompt: "Choose the sentence with valid cause and result.",
        options: [
          "The sensor triggered the alarm, so the team responded within minutes.",
          "The sensor triggered the alarm, because so the team responded within minutes.",
          "The sensor triggered the alarm, and because responded within minutes.",
          "The sensor triggered alarm, so responded minutes."
        ],
        answer: 0,
        explain: "A single correct connector keeps logic clean."
      },
      {
        scene: "Evidence Card O",
        prompt: "Pick the strongest past tense evidence statement.",
        options: [
          "The technician replaced the faulty cable before the system rebooted.",
          "The technician replace the faulty cable before the system rebooted.",
          "The technician replaced the faulty cable before the system reboot yesterday.",
          "Technician replaced faulty cable before system rebooted."
        ],
        answer: 0,
        explain: "Both verbs must be in past tense for a past evidence statement."
      },
      {
        scene: "Evidence Card P",
        prompt: "Select the line with accurate be-verb agreement.",
        options: [
          "The samples from the lab is contaminated.",
          "The samples from the lab are contaminated.",
          "The samples from the lab am contaminated.",
          "The samples from the lab was contaminated now."
        ],
        answer: 1,
        explain: "Plural samples requires are."
      },
      {
        scene: "Evidence Card Q",
        prompt: "Choose the sentence with correct subject-verb agreement.",
        options: [
          "The stack of papers on the desk need to be filed.",
          "The stack of papers on the desk needs to be filed.",
          "The stack of papers on the desk are needing to be filed.",
          "The stack of papers on the desk were need to be filed."
        ],
        answer: 1,
        explain: "The subject is stack (singular), so the verb must be needs."
      },
      {
        scene: "Evidence Card R",
        prompt: "Pick the line with the clearest pronoun reference.",
        options: [
          "Inspector Yoon compared the two samples and found that the first sample was altered.",
          "Inspector Yoon compared the two samples and found that it was altered.",
          "Inspector Yoon compared the two samples and found that they was altered.",
          "Inspector Yoon compared two samples found first altered."
        ],
        answer: 0,
        explain: "Specifying the first sample removes ambiguity from the pronoun reference."
      },
      {
        scene: "Evidence Card S",
        prompt: "Select the best question-form evidence line.",
        options: [
          "Were the suspects aware of the surveillance cameras?",
          "Was the suspects aware of the surveillance cameras?",
          "Am the suspects aware of the surveillance cameras?",
          "Suspects were aware surveillance cameras?"
        ],
        answer: 0,
        explain: "Plural suspects in a past question requires were."
      },
      {
        scene: "Evidence Card T",
        prompt: "Pick the strongest present continuous evidence statement.",
        options: [
          "The forensic team is analyzing the fingerprints right now.",
          "The forensic team are analyzing the fingerprints right now.",
          "The forensic team analyzing the fingerprints right now.",
          "The forensic team is analyze the fingerprints right now."
        ],
        answer: 0,
        explain: "Singular team takes is plus verb-ing for present continuous."
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
          explain: "Subject I always takes the be-verb am in present tense."
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
          explain: "Explicit noun naming keeps pronoun reference and meaning precise."
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
          explain: "Subject I takes the present be-verb form am."
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
          explain: "Contrast clauses should use one transition connector for clean logic."
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
    var base = roundBanks[key] || fallbackRounds;
    var variant = packVariantBanks[key];
    if (variant && variant[packId]) return variant[packId].concat(base);
    return base;
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
      + ".classify-drag-wrapper{display:grid;gap:16px;}"
      + ".classify-pool{min-height:60px;padding:12px;border:2px dashed #d9dee6;border-radius:14px;background:#f8fafc;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;}"
      + ".classify-zones{display:grid;grid-template-columns:1fr 1fr;gap:14px;}"
      + ".classify-zone{min-height:120px;padding:12px;border:2px dashed #d9dee6;border-radius:14px;background:#fbfdff;display:flex;flex-direction:column;gap:8px;transition:border-color .2s,background .2s;}"
      + ".classify-zone[data-zone=completed]{border-color:#6a8fdf;background:rgba(106,143,223,.06);}"
      + ".classify-zone[data-zone=ongoing]{border-color:#9a78df;background:rgba(154,120,223,.06);}"
      + ".classify-zone.drag-over{border-style:solid;box-shadow:0 0 0 3px rgba(31,95,99,.18);transform:scale(1.01);}"
      + ".classify-zone.drag-over[data-zone=completed]{background:rgba(106,143,223,.14);}"
      + ".classify-zone.drag-over[data-zone=ongoing]{background:rgba(154,120,223,.14);}"
      + ".classify-zone-label{margin:0;font:700 12px Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#4a5568;}"
      + ".classify-card{padding:11px 14px;border:1px solid #d9dee6;border-radius:10px;background:#fff;font-size:14px;line-height:1.45;color:#16223a;cursor:grab;user-select:none;-webkit-user-select:none;transition:transform .15s,box-shadow .15s,opacity .15s;touch-action:none;}"
      + ".classify-card:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(11,16,32,.12);border-color:#c9a227;}"
      + ".classify-card.selected{border-color:#c9a227;background:#fffdf5;box-shadow:0 0 0 3px rgba(201,162,39,.3);transform:translateY(-2px);}"
      + ".classify-card:active,.classify-card.dragging{cursor:grabbing;opacity:.7;transform:scale(.97);}"
      + ".classify-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.85;box-shadow:0 12px 28px rgba(11,16,32,.2);transform:rotate(2deg);}"
      + "@media(max-width:620px){.classify-zones{grid-template-columns:1fr;}}"
      + ".action-bar{border:1px solid #d9dee6;border-radius:12px;background:#fbfdff;padding:10px;display:grid;gap:8px;}"
      + ".action-bar b{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:" + accent + ";}"
      + ".action-bar p{margin:0;font-size:13px;line-height:1.45;color:#34455f;}"
      + ".action-progress{height:8px;background:#e8edf5;border-radius:99px;overflow:hidden;}"
      + ".action-progress > span{display:block;height:100%;width:100%;background:" + accent + ";transition:width .2s ease;}"
      + "@media (max-width:900px){.binary-actions{grid-template-columns:1fr;}}";
    document.head.appendChild(style);
  }

  function ensureActionUI() {
    var hud = document.querySelector(".hud");
    if (hud && !document.getElementById("hudScore")) {
      hud.style.gridTemplateColumns = "repeat(7,minmax(0,1fr))";
      var extra = [
        { label: "Score", id: "hudScore", value: "0" },
        { label: "Combo", id: "hudCombo", value: "1x" },
        { label: "Shot", id: "hudShot", value: "--" }
      ];
      extra.forEach(function (item) {
        var chip = document.createElement("div");
        chip.className = "chip";
        chip.innerHTML = "<b>" + item.label + "</b><span id=\"" + item.id + "\">" + item.value + "</span>";
        hud.appendChild(chip);
      });
    }

    var play = document.querySelector(".play");
    if (play && !document.getElementById("actionBar")) {
      var bar = document.createElement("div");
      bar.id = "actionBar";
      bar.className = "action-bar";
      bar.innerHTML = "<b>Action Briefing</b><p id=\"actionTip\">Mission mode active.</p><div class=\"action-progress\"><span id=\"actionProgressFill\"></span></div>";
      var scene = play.querySelector(".scene");
      if (scene && scene.nextSibling) play.insertBefore(bar, scene.nextSibling);
      else play.insertBefore(bar, play.firstChild);
    }

    var row = document.querySelector(".row");
    if (row && !document.getElementById("btnHint")) {
      var hintBtn = document.createElement("button");
      hintBtn.type = "button";
      hintBtn.className = "btn";
      hintBtn.id = "btnHint";
      hintBtn.textContent = "Hint (1)";

      var skipBtn = document.createElement("button");
      skipBtn.type = "button";
      skipBtn.className = "btn";
      skipBtn.id = "btnSkip";
      skipBtn.textContent = "Skip (1)";

      row.insertBefore(skipBtn, row.firstChild);
      row.insertBefore(hintBtn, row.firstChild);
    }
    if (row && !document.getElementById("btnNext")) {
      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn primary";
      nextBtn.id = "btnNext";
      nextBtn.textContent = "Next";
      nextBtn.style.display = "none";
      row.appendChild(nextBtn);
    }
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

  function modePrompt(mode) {
    if (mode === "smash") return "Find and tap the line with a grammar error.";
    if (mode === "binary") return "Read the highlighted line and decide: Secure or Needs Repair.";
    if (mode === "classify") return "Classify each line: Completed Event or Ongoing Background.";
    if (mode === "repair") return "Choose the strongest repair for the broken line.";
    if (mode === "duel") return "Compare the two options and choose the stronger rewrite.";
    if (mode === "sequence") return "Choose the strongest next line for the sequence.";
    if (mode === "eliminate") return "Eliminate weak lines and leave only the strongest one.";
    if (mode === "sweep") return "Mark each line Secure or Needs Repair, then submit.";
    return "Choose the single strongest line.";
  }

  function modeHowTo(mode, fallback) {
    if (mode === "smash") return "Scan all options and smash only lines that contain errors.";
    if (mode === "binary") return "Judge one line at a time as correct or incorrect.";
    if (mode === "classify") return "Sort lines by timeline role: completed events vs ongoing background actions.";
    if (mode === "repair") return "Read the broken line and pick the best corrected version.";
    if (mode === "duel") return "Compare two rewrites and choose the stronger sentence.";
    if (mode === "sequence") return "Pick the line that best continues the sequence logically and grammatically.";
    if (mode === "eliminate") return "Remove weak lines and keep only the best line.";
    if (mode === "sweep") return "Mark every line secure or needs repair before submitting the board.";
    return fallback || "Choose the strongest line.";
  }

  function buildRounds(bank, desiredCount) {
    var source = (bank && bank.length) ? bank : fallbackRounds;
    var target = Math.max(1, Math.min(20, desiredCount));
    var pool = shuffle(cloneRounds(source));
    while (pool.length < target) {
      pool = pool.concat(shuffle(cloneRounds(source)));
    }
    return pool.slice(0, target);
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
  ensureActionUI();
  var packTitle = (window.GSPacks && window.GSPacks.meta && window.GSPacks.meta[pack] && window.GSPacks.meta[pack].short) || pack.toUpperCase();
  var teacherBtn = document.getElementById("btnTeacher");
  var homeBtn = document.getElementById("btnHome");
  if (teacherBtn) teacherBtn.setAttribute("href", "teacher-mode.html?pack=" + encodeURIComponent(pack));
  if (homeBtn) homeBtn.setAttribute("href", "index.html");

  text("gameTitle", cfg.title);
  text("gameSub", cfg.subtitle);
  text("gameK", "Pack: " + packTitle + " \u00b7 Difficulty: " + difficulty + " \u00b7 Mode: " + (ux.modeLabel || "Standard"));
  text("howToText", modeHowTo(activeMode, cfg.howTo) + " " + modeHelperText(activeMode) + (playFormat === "teams" ? " Teams mode enabled: alternate turns between teams." : ""));
  text("howToTitle", "How to play: " + cfg.title);
  text("actionTip", modePrompt(activeMode));
  text("hudTimer", timerOn ? "--" : "Off");
  var sceneLabelEl = document.querySelector(".scene .label");
  if (sceneLabelEl && ux.sceneLabel) sceneLabelEl.textContent = ux.sceneLabel;

  var rounds = buildRounds(resolveRoundBank(gameKey, pack), count);
  var idx = 0;
  var correct = 0;
  var streak = 0;
  var locked = false;
  var score = 0;
  var combo = 1;
  var hintsLeft = 1;
  var skipsLeft = 1;
  var shotMax = difficulty === "rookie" ? 45 : difficulty === "field" ? 35 : 25;
  var missionSecondsPerRound = difficulty === "rookie" ? 60 : difficulty === "field" ? 50 : 38;
  var shotClock = shotMax;
  var shotTimer = null;
  var currentRoundState = {};
  var awaitingNext = false;
  var sec = timerOn ? rounds.length * missionSecondsPerRound : null;
  var timer = null;

  var optionsEl = document.getElementById("options");

  function updateHud() {
    text("hudCase", Math.min(idx + 1, rounds.length) + "/" + rounds.length);
    text("hudAcc", Math.round((correct / Math.max(1, idx)) * 100) + "%");
    text("hudStreak", String(streak));
    if (timerOn) text("hudTimer", Math.max(0, sec) + "s");
    text("hudScore", String(score));
    text("hudCombo", combo + "x");
    text("hudShot", timerOn ? Math.max(0, shotClock) + "s" : "--");
    var progress = document.getElementById("actionProgressFill");
    if (progress) {
      var pct = timerOn ? Math.max(0, Math.min(100, Math.round((shotClock / shotMax) * 100))) : 100;
      progress.style.width = pct + "%";
    }
    var hintBtn = document.getElementById("btnHint");
    var skipBtn = document.getElementById("btnSkip");
    if (hintBtn) hintBtn.textContent = "Hint (" + hintsLeft + ")";
    if (skipBtn) skipBtn.textContent = "Skip (" + skipsLeft + ")";
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

  function setNextVisibility(show, label) {
    var nextBtn = document.getElementById("btnNext");
    if (!nextBtn) return;
    nextBtn.style.display = show ? "inline-flex" : "none";
    nextBtn.textContent = label || "Next";
    nextBtn.disabled = !show;
  }

  function finishRound(userCorrect, successMsg, failMsg, btn) {
    if (locked) return;
    locked = true;
    awaitingNext = true;
    if (shotTimer) clearInterval(shotTimer);
    idx += 1;
    if (userCorrect) {
      correct += 1;
      streak += 1;
      combo = 1 + Math.floor(Math.max(0, streak - 1) / 3);
      var speedBonus = timerOn ? Math.max(0, shotClock) * 6 : 0;
      var streakBonus = Math.min(80, streak * 10);
      var award = Math.round((80 + speedBonus + streakBonus) * combo);
      score += award;
      if (btn) btn.classList.add("good");
      html("feedback", "<span class=\"ok\"><b>CORRECT.</b> " + successMsg + " +" + award + " pts</span>");
      if (window.GSSound && window.GSSound.clickTone) window.GSSound.clickTone();
    } else {
      streak = 0;
      combo = 1;
      score = Math.max(0, score - 20);
      if (btn) btn.classList.add("bad");
      html("feedback", "<span class=\"bad\"><b>WRONG.</b> " + failMsg + " -20 pts</span>");
    }
    setNextVisibility(true, idx >= rounds.length ? "Finish Mission" : "Next");
    updateHud();
  }

  function startShotClock(round) {
    if (!timerOn) {
      shotClock = shotMax;
      return;
    }
    if (shotTimer) clearInterval(shotTimer);
    shotClock = shotMax;
    updateHud();
    shotTimer = setInterval(function () {
      if (locked) return;
      shotClock -= 1;
      updateHud();
      if (shotClock <= 0) {
        clearInterval(shotTimer);
        finishRound(false, "", "Time breach: no decision submitted. " + round.explain);
      }
    }, 1000);
  }

  function showChoiceOptions(round) {
    optionsEl.style.gridTemplateColumns = ux.columns === 1 ? "1fr" : "1fr 1fr";
    optionsEl.innerHTML = "";
    currentRoundState = { mode: activeMode, round: round };
    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item, displayIdx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>" + String.fromCharCode(65 + displayIdx) + "</b><span>" + item.lineText + "</span>";
      var isTarget = activeMode === "smash" ? item.optionIdx !== round.answer : item.optionIdx === round.answer;
      btn.dataset.target = isTarget ? "1" : "0";
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
    currentRoundState = { mode: "repair", round: round };
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
    var distractorPool = [];
    for (var d = 0; d < round.options.length; d++) {
      if (d !== round.answer && d !== brokenIdx) distractorPool.push(d);
    }
    distractorPool = shuffle(distractorPool);
    for (var p = 0; p < distractorPool.length && choices.length < Math.min(3, round.options.length); p++) {
      choices.push(distractorPool[p]);
    }
    choices = shuffle(choices.map(function (idx) { return { idx: idx, text: round.options[idx] }; }));

    var choicesWrap = document.createElement("div");
    choicesWrap.className = "duel-actions";
    choices.forEach(function (item, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.innerHTML = "<b>Repair " + String.fromCharCode(65 + i) + "</b><span>" + item.text + "</span>";
      btn.dataset.target = item.idx === round.answer ? "1" : "0";
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
    currentRoundState = { mode: activeMode, round: round };
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
      btn.dataset.target = item.idx === round.answer ? "1" : "0";
      btn.addEventListener("click", function () {
        var correctText = round.options[round.answer];
        finishRound(
          item.idx === round.answer,
          "Strong choice secured. " + round.explain,
          "Weaker option selected. Correct line: \"" + correctText + "\". " + round.explain,
          btn
        );
      });
      actions.appendChild(btn);
    });
    wrap.appendChild(actions);
    optionsEl.appendChild(wrap);
  }

  function sentenceClass(lineText) {
    return /\b(am|is|are|was|were)\s+\w+ing\b/i.test(lineText) ? "ongoing" : "completed";
  }

  function showClassifyOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var assignments = {};
    var rowControllers = [];
    currentRoundState = { mode: "classify", round: round, assignments: assignments, rows: rowControllers };

    var dragState = { el: null, optionIdx: -1, ghost: null, offsetX: 0, offsetY: 0 };
    var selected = { el: null, optionIdx: -1 };

    function selectCard(cardEl, optIdx) {
      if (locked) return;
      if (selected.el) selected.el.classList.remove("selected");
      if (selected.el === cardEl) { selected.el = null; selected.optionIdx = -1; return; }
      selected.el = cardEl;
      selected.optionIdx = optIdx;
      cardEl.classList.add("selected");
    }

    var wrapper = document.createElement("div");
    wrapper.className = "classify-drag-wrapper";

    var pool = document.createElement("div");
    pool.className = "classify-pool";
    var poolLabel = document.createElement("p");
    poolLabel.className = "classify-zone-label";
    poolLabel.textContent = "Drag or tap each sentence, then tap a zone";
    pool.appendChild(poolLabel);

    var zones = document.createElement("div");
    zones.className = "classify-zones";

    var completedZone = document.createElement("div");
    completedZone.className = "classify-zone";
    completedZone.dataset.zone = "completed";
    var completedLabel = document.createElement("p");
    completedLabel.className = "classify-zone-label";
    completedLabel.textContent = "Completed Event";
    completedZone.appendChild(completedLabel);

    var ongoingZone = document.createElement("div");
    ongoingZone.className = "classify-zone";
    ongoingZone.dataset.zone = "ongoing";
    var ongoingLabel = document.createElement("p");
    ongoingLabel.className = "classify-zone-label";
    ongoingLabel.textContent = "Ongoing Background";
    ongoingZone.appendChild(ongoingLabel);

    zones.appendChild(completedZone);
    zones.appendChild(ongoingZone);

    function makeCard(item) {
      var card = document.createElement("div");
      card.className = "classify-card";
      card.draggable = true;
      card.dataset.idx = item.optionIdx;
      card.textContent = item.lineText;
      card.setAttribute("touch-action", "none");

      card.addEventListener("click", function () {
        selectCard(card, item.optionIdx);
      });

      card.addEventListener("dragstart", function (e) {
        if (locked) { e.preventDefault(); return; }
        e.dataTransfer.setData("text/plain", item.optionIdx);
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
        setTimeout(function () { card.style.opacity = "0.4"; }, 0);
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        card.style.opacity = "";
      });

      var touchId = null;
      card.addEventListener("touchstart", function (e) {
        if (locked) return;
        var t = e.touches[0];
        touchId = t.identifier;
        var rect = card.getBoundingClientRect();
        dragState.el = card;
        dragState.optionIdx = item.optionIdx;
        dragState.offsetX = t.clientX - rect.left;
        dragState.offsetY = t.clientY - rect.top;
        var ghost = card.cloneNode(true);
        ghost.className = "classify-card classify-ghost";
        ghost.style.width = rect.width + "px";
        ghost.style.left = rect.left + "px";
        ghost.style.top = rect.top + "px";
        document.body.appendChild(ghost);
        dragState.ghost = ghost;
        card.classList.add("dragging");
        e.preventDefault();
      }, { passive: false });

      return card;
    }

    function handleTouchMove(e) {
      if (!dragState.ghost) return;
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId) {
          var t = e.touches[i];
          dragState.ghost.style.left = (t.clientX - dragState.offsetX) + "px";
          dragState.ghost.style.top = (t.clientY - dragState.offsetY) + "px";
          highlightZone(t.clientX, t.clientY);
          e.preventDefault();
          return;
        }
      }
    }

    function handleTouchEnd(e) {
      if (!dragState.ghost) return;
      var found = false;
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          var t = e.changedTouches[i];
          dropAtPoint(t.clientX, t.clientY, dragState.el, dragState.optionIdx);
          found = true;
          break;
        }
      }
      if (dragState.ghost) dragState.ghost.remove();
      if (dragState.el) dragState.el.classList.remove("dragging");
      dragState.ghost = null;
      dragState.el = null;
      completedZone.classList.remove("drag-over");
      ongoingZone.classList.remove("drag-over");
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    function highlightZone(x, y) {
      var cRect = completedZone.getBoundingClientRect();
      var oRect = ongoingZone.getBoundingClientRect();
      completedZone.classList.toggle("drag-over", x >= cRect.left && x <= cRect.right && y >= cRect.top && y <= cRect.bottom);
      ongoingZone.classList.toggle("drag-over", x >= oRect.left && x <= oRect.right && y >= oRect.top && y <= oRect.bottom);
    }

    function dropAtPoint(x, y, cardEl, optIdx) {
      var cRect = completedZone.getBoundingClientRect();
      var oRect = ongoingZone.getBoundingClientRect();
      if (x >= cRect.left && x <= cRect.right && y >= cRect.top && y <= cRect.bottom) {
        placeCard(cardEl, optIdx, "completed");
      } else if (x >= oRect.left && x <= oRect.right && y >= oRect.top && y <= oRect.bottom) {
        placeCard(cardEl, optIdx, "ongoing");
      }
    }

    function placeCard(cardEl, optIdx, zone) {
      assignments[optIdx] = zone;
      var target = zone === "completed" ? completedZone : ongoingZone;
      target.appendChild(cardEl);
      cardEl.classList.remove("dragging");
      cardEl.style.opacity = "";
    }

    [completedZone, ongoingZone].forEach(function (zone) {
      zone.addEventListener("click", function () {
        if (locked || !selected.el) return;
        placeCard(selected.el, selected.optionIdx, zone.dataset.zone);
        selected.el.classList.remove("selected");
        selected.el = null;
        selected.optionIdx = -1;
      });
      zone.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", function () {
        zone.classList.remove("drag-over");
      });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        zone.classList.remove("drag-over");
        var optIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        var cardEl = wrapper.querySelector('.classify-card[data-idx="' + optIdx + '"]');
        if (cardEl) placeCard(cardEl, optIdx, zone.dataset.zone);
      });
    });

    pool.addEventListener("dragover", function (e) { e.preventDefault(); });
    pool.addEventListener("drop", function (e) {
      e.preventDefault();
      var optIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
      var cardEl = wrapper.querySelector('.classify-card[data-idx="' + optIdx + '"]');
      if (cardEl) {
        pool.appendChild(cardEl);
        delete assignments[optIdx];
      }
    });

    shuffle(round.options.map(function (lineText, optionIdx) {
      return { lineText: lineText, optionIdx: optionIdx };
    })).forEach(function (item) {
      var card = makeCard(item);
      pool.appendChild(card);
      rowControllers.push({
        optionIdx: item.optionIdx,
        hasPick: function () { return typeof assignments[item.optionIdx] !== "undefined"; },
        pickCorrect: function () { placeCard(card, item.optionIdx, sentenceClass(round.options[item.optionIdx])); }
      });
    });

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn primary sweep-submit";
    submitBtn.textContent = "Submit Sort";
    submitBtn.addEventListener("click", function () {
      if (locked) return;
      if (Object.keys(assignments).length < round.options.length) {
        html("feedback", "<span class=\"bad\">Drag every sentence to a zone first, then submit.</span>");
        return;
      }
      var allCorrect = true;
      for (var i = 0; i < round.options.length; i++) {
        if (assignments[i] !== sentenceClass(round.options[i])) {
          allCorrect = false;
          break;
        }
      }
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      finishRound(
        allCorrect,
        "Timeline classification secured. " + round.explain,
        "Timeline classification mismatch. " + round.explain,
        submitBtn
      );
    });

    wrapper.appendChild(pool);
    wrapper.appendChild(zones);
    wrapper.appendChild(submitBtn);
    optionsEl.appendChild(wrapper);
  }

  function showBinaryOptions(round) {
    optionsEl.style.gridTemplateColumns = "1fr";
    optionsEl.innerHTML = "";
    var candidateIdx = Math.floor(Math.random() * round.options.length);
    var candidateText = round.options[candidateIdx];
    var candidateCorrect = candidateIdx === round.answer;
    currentRoundState = { mode: "binary", round: round, candidateCorrect: candidateCorrect };

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
    currentRoundState = { mode: "eliminate", round: round };

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
          finishRound(false, "", "You eliminated the strongest line. Keep one strong line and remove weak ones. " + round.explain, btn);
          return;
        }
        btn.classList.add("bad", "eliminated");
        removedWrong += 1;
        if (removedWrong >= totalWrong) {
          finishRound(true, "All weak lines eliminated. Strongest line secured. " + round.explain, "", btn);
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
    var rowControllers = [];
    currentRoundState = { mode: "sweep", round: round, selections: selections, rows: rowControllers };

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
      rowControllers.push({
        optionIdx: item.optionIdx,
        hasPick: function () { return typeof selections[item.optionIdx] !== "undefined"; },
        pickCorrect: function () { setChoice(item.optionIdx === round.answer); }
      });

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
      var allCorrect = true;
      for (var i = 0; i < round.options.length; i++) {
        var shouldSecure = i === round.answer;
        if (selections[i] !== shouldSecure) {
          allCorrect = false;
          break;
        }
      }
      finishRound(
        allCorrect,
        "Board verified: only the strongest line is marked secure. " + round.explain,
        "Board mismatch: one or more verdicts are incorrect. " + round.explain,
        submitBtn
      );
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
    awaitingNext = false;
    setNextVisibility(false);
    text("feedback", "");
    var round = rounds[idx];
    currentRoundState = { mode: activeMode, round: round };
    text("scene", round.scene);
    if (activeMode === "smash") {
      text("prompt", modePrompt(activeMode));
      showChoiceOptions(round);
    } else if (activeMode === "binary") {
      text("prompt", modePrompt(activeMode));
      showBinaryOptions(round);
    } else if (activeMode === "classify") {
      text("prompt", modePrompt(activeMode));
      showClassifyOptions(round);
    } else if (activeMode === "repair") {
      text("prompt", modePrompt(activeMode));
      showRepairOptions(round);
    } else if (activeMode === "duel") {
      text("prompt", modePrompt(activeMode));
      showDuelOptions(round, "Rewrite Duel");
    } else if (activeMode === "sequence") {
      text("prompt", modePrompt(activeMode));
      showDuelOptions(round, "Next-line Duel");
    } else if (activeMode === "eliminate") {
      text("prompt", modePrompt(activeMode));
      showEliminateOptions(round);
    } else if (activeMode === "sweep") {
      text("prompt", modePrompt(activeMode));
      showSweepOptions(round);
    } else {
      text("prompt", modePrompt(activeMode));
      showChoiceOptions(round);
    }
    startShotClock(round);
    updateHud();
  }

  function selectOption(selectedIdx, selectedText, round, btn) {
    var userCorrect = activeMode === "smash" ? selectedIdx !== round.answer : selectedIdx === round.answer;
    finishRound(
      userCorrect,
      activeMode === "smash"
        ? "Hit confirmed: you smashed an incorrect line. " + round.explain
        : "Secure: " + round.explain,
      activeMode === "smash"
        ? "That line is already correct. Smash an error line instead. " + round.explain
        : "Needs repair: correct line is \"" + round.options[round.answer] + "\". " + round.explain,
      btn
    );
  }

  function selectBinaryVerdict(markSecure, candidateCorrect, round, btn) {
    var userCorrect = markSecure ? candidateCorrect : !candidateCorrect;
    finishRound(
      userCorrect,
      "Verdict confirmed: " + (candidateCorrect ? "this line is secure. " : "this line needs repair. ") + round.explain,
      "Verdict mismatch: this line is " + (candidateCorrect ? "secure. " : "not secure. ") + round.explain,
      btn
    );
  }

  function useHint() {
    if (locked) return;
    if (hintsLeft <= 0) {
      html("feedback", "<span class=\"bad\">Hint unavailable: no hints left.</span>");
      return;
    }
    hintsLeft -= 1;
    var used = false;

    if (currentRoundState.mode === "classify" || currentRoundState.mode === "sweep") {
      var rows = currentRoundState.rows || [];
      for (var i = 0; i < rows.length; i++) {
        if (!rows[i].hasPick()) {
          rows[i].pickCorrect();
          used = true;
          break;
        }
      }
      if (used) html("feedback", "<span class=\"ok\">Hint applied: one line was auto-classified.</span>");
    } else if (currentRoundState.mode === "binary") {
      used = true;
      html("feedback", "<span class=\"ok\">Hint: the highlighted line is " + (currentRoundState.candidateCorrect ? "Secure" : "Needs Repair") + ".</span>");
    } else {
      var decoys = Array.prototype.slice.call(optionsEl.querySelectorAll(".opt")).filter(function (btn) {
        return btn.dataset.target === "0" && !btn.classList.contains("eliminated");
      });
      if (decoys.length) {
        decoys[0].classList.add("eliminated");
        decoys[0].disabled = true;
        used = true;
        html("feedback", "<span class=\"ok\">Hint applied: one decoy was removed.</span>");
      }
    }

    if (!used) {
      html("feedback", "<span class=\"bad\">No hint action available for this step.</span>");
    }
    updateHud();
  }

  function useSkip() {
    if (locked) return;
    if (skipsLeft <= 0) {
      html("feedback", "<span class=\"bad\">Skip unavailable: no skips left.</span>");
      return;
    }
    skipsLeft -= 1;
    if (shotTimer) clearInterval(shotTimer);
    locked = true;
    awaitingNext = true;
    idx += 1;
    streak = 0;
    combo = 1;
    score = Math.max(0, score - 15);
    html("feedback", "<span class=\"bad\"><b>SKIPPED.</b> Click Next to continue. -15 pts</span>");
    setNextVisibility(true, idx >= rounds.length ? "Finish Mission" : "Next");
    updateHud();
  }

  function goNext() {
    if (!awaitingNext) return;
    if (idx >= rounds.length) {
      endGame();
      return;
    }
    showRound();
  }

  function endGame() {
    if (timer) clearInterval(timer);
    if (shotTimer) clearInterval(shotTimer);
    var acc = Math.round((correct / Math.max(1, idx)) * 100);
    text("reportAcc", "Accuracy: " + acc + "% (" + correct + "/" + Math.max(1, idx) + ")");
    text("reportPlan", (acc >= 80 ? "Recommendation: advance to the next mission game." : "Recommendation: replay this game for retrieval strength.") + " Final score: " + score + " pts.");
    text("reportPack", "Pack: " + packTitle + " \u00b7 Game: " + cfg.title);
    var report = document.getElementById("reportOverlay");
    if (report) report.classList.add("show");
  }

  function startTimer() {
    if (!timerOn) return;
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      if (awaitingNext) return;
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

  var hintBtn = document.getElementById("btnHint");
  if (hintBtn) hintBtn.addEventListener("click", useHint);
  var skipBtn = document.getElementById("btnSkip");
  if (skipBtn) skipBtn.addEventListener("click", useSkip);
  var nextBtn = document.getElementById("btnNext");
  if (nextBtn) nextBtn.addEventListener("click", goNext);

  var replayBtn = document.getElementById("replayBtn");
  if (replayBtn && ux.replayText) replayBtn.textContent = ux.replayText;
  if (replayBtn) {
    replayBtn.addEventListener("click", function () {
      var report = document.getElementById("reportOverlay");
      if (report) report.classList.remove("show");
      if (shotTimer) clearInterval(shotTimer);
      rounds = buildRounds(resolveRoundBank(gameKey, pack), count);
      idx = 0;
      correct = 0;
      streak = 0;
      score = 0;
      combo = 1;
      hintsLeft = 1;
      skipsLeft = 1;
      shotClock = shotMax;
      awaitingNext = false;
      setNextVisibility(false);
      sec = timerOn ? rounds.length * missionSecondsPerRound : null;
      showRound();
      startTimer();
    });
  }
  updateHud();
})();
