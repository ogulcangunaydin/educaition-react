/**
 * English - Tests Translations
 *
 * Translations for all test types: Personality, Dissonance, Prisoner's Dilemma
 */

const tests = {
  tests: {
    // Common test terms
    room: "Room",
    rooms: "Rooms",
    participant: "Participant",
    participants: "Participants",
    joinRoom: "Join Room",
    createRoom: "Create Room",
    roomCode: "Room Code",
    enterRoomCode: "Enter room code",
    startTest: "Start Test",
    submitTest: "Submit Test",
    completeTest: "Complete Test",
    testCompleted: "Test Completed",
    testInProgress: "Test in Progress",
    question: "Question",
    questionOf: "Question {{current}} of {{total}}",
    answer: "Answer",
    result: "Result",
    results: "Results",
    score: "Score",
    totalScore: "Total Score",
    averageScore: "Average Score",
    viewResults: "View Results",
    downloadResults: "Download Results",
    exportResults: "Export Results",

    thankYou: "Thank you for completing the test!",
    answerAllQuestions: "Please answer all questions",
    submissionFailed: "Submission failed",

    // Participant info
    participantInfo: {
      title: "Participant Information",
      name: "Full Name",
      email: "Email (optional)",
      studentId: "Student ID",
      studentNumber: "Student No",
      department: "Department",
      continue: "Continue",
      nameRequired: "Full Name is required",
      studentIdRequired: "Student ID is required",
      studentIdMustBeNumber: "Student ID must contain only numbers",
      alreadyCompleted: "You have already completed this test on this device.",
      registrationFailed: "Registration failed",
    },

    // Personality Test
    personality: {
      title: "Personality Test",
      subtitle: "Big Five Personality Assessment",
      description:
        "This test measures your personality traits across five dimensions: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
      instructions: "Please rate how accurately each statement describes you.",
      scale: {
        stronglyDisagree: "Strongly Disagree",
        disagree: "Disagree",
        neutral: "Neutral",
        agree: "Agree",
        stronglyAgree: "Strongly Agree",
      },
      traits: {
        openness: "Openness",
        conscientiousness: "Conscientiousness",
        extraversion: "Extraversion",
        agreeableness: "Agreeableness",
        neuroticism: "Neuroticism",
      },
      resultsReady: "Your personality analysis is ready!",
      roomDetail: {
        pageTitle: "Personality Test Room",
        traitsLabel: "Personality Traits",
        resultsTitle: "Personality Test Results",
        jobRecommendations: "Job Recommendations",
      },
    },

    // Dissonance Test
    dissonance: {
      title: "Cognitive Dissonance Test",
      subtitle: "Decision Making Assessment",
      description:
        "Embark on a fun discovery journey for your career! Based on your age, personality traits, and zodiac sign, we'll brainstorm the most suitable professions and create an enjoyable plan! Remember, the results are inspiring but not definitive!",
      instructions: "Please answer the following questions honestly.",
      jobRecommendation: "Career Recommendation",
      viewRecommendation: "View Your Career Recommendation",
      // Step labels
      steps: {
        registration: "Registration",
        personalInfo: "Personal Info",
        taxiQuestions: "Taxi Questions",
        processing: "Processing",
        verification: "Verification",
        complete: "Complete",
      },
      // Step 0: Welcome
      welcome: {
        taxiProblemQuestion: "How important do you think the taxi problem in Istanbul is?",
        veryImportant: "I find it very important",
        notImportant: "I don't find it that important",
      },
      // Step 1: Personal Information
      personalInfo: {
        title: "Personal Information",
        fullName: "Full Name",
        studentNumber: "Student Number",
        classYear: "Your class year:",
        gender: "Your gender:",
        starSign: "Your zodiac sign:",
        risingSign: "Your rising sign:",
        workload: "Work tempo that motivates me:",
        workloadMin: "Relaxed",
        workloadMax: "Intense",
        careerStart: "How should my career start:",
        careerStartMin: "Easy",
        careerStartMax: "Challenging",
        flexibility: "How flexible should my profession be:",
        flexibilityMin: "Rigid",
        flexibilityMax: "Flexible",
      },
      // Step 2: Taxi questions
      taxiQuestions: {
        title: "Taxi Service Questions",
        comfortQuestion:
          "To what extent does the taxi service in Istanbul (ease of finding a taxi, ride comfort, driver behavior, etc.) meet your expectations?",
        fareQuestion:
          "In your opinion, how well does the quality of taxi service in Istanbul match the fare balance?",
      },
      // Step 3: Processing
      processingStep: {
        thankYou: "Thank you for your participation!",
        averageResults: "Average Results:",
        taxiComfortAverage: "Taxi Service Comfort",
        taxiFaresAverage: "Taxi Fare Balance",
        votes: "votes",
        saving: "Your answers are being saved, please wait...",
      },
      // Step 4: Verification (fake error + re-ask)
      verificationStep: {
        errorTitle: "HTTP Error 504: Gateway Timeout",
        errorMessage: "The server could not save your first answer. Could you please answer again?",
        answerAgain: "Please Answer Again",
        average: "Average",
      },
      // Step 5: Complete
      completeStep: {
        success: "Your answers have been saved correctly.",
        thankYou: "Thank you for participating in this study.",
      },
      roomDetail: {
        pageTitle: "Dissonance Test Room",
        classYear: "Class Year",
        comfortFirst: "Comfort",
        fareFirst: "Fare",
        comfortSecond: "Comfort (2nd)",
        fareSecond: "Fare (2nd)",
        comfortAvg: "Comfort Avg",
        fareAvg: "Fare Avg",
        resultsTitle: "Dissonance Test Results",
        firstRound: "First Round Answers",
        secondRound: "Second Round Answers",
        displayedAverages: "Displayed Averages",
        dissonanceAnalysis: "Dissonance Analysis",
        compatibilityAnalysis: "Zodiac Compatibility Analysis",
      },
    },

    // Prisoner's Dilemma
    prisonersDilemma: {
      title: "Prisoner's Dilemma",
      subtitle: "Game Theory Experiment",
      description:
        "A game theory experiment where you develop strategies to compete with other players.",
      cooperate: "Cooperate",
      defect: "Defect",
      round: "Round",
      rounds: "Rounds",
      totalRounds: "Total Rounds",
      yourMove: "Your Move",
      opponentMove: "Opponent's Move",
      player: "Player",
      tactic: "Tactic",

      // Game Rooms page (teacher)
      gameRooms: {
        title: "Game Rooms",
        subtitle: "Manage your Prisoner's Dilemma game rooms",
        noRoomsTitle: "No Rooms Yet",
        noRoomsMessage: "Create your first game room to get started.",
        createTitle: "Create New Room",
        roomName: "Room Name",
        roomNamePlaceholder: "Enter room name",
      },

      // Room Detail page (teacher)
      roomDetail: {
        pageTitle: "Prisoner's Dilemma Room",
        functionName: "Function Name",
        shortTactic: "Short Tactic",
        ready: "Ready",
        notReady: "Not Ready",
        resultsTitle: "Player Details",
        jobRecommendation: "Career Recommendation",
        tacticReason: "Strategy Motivation",
      },

      // Playground page (teacher)
      playgroundPage: {
        show: "Show",
        hide: "Hide",
        start: "Start",
        sessions: "Sessions",
        showQRCode: "Show QR Code",
        startNewSession: "Start New Session",
        sessionName: "Session Name",
        deleteParticipant: "Delete Participant",
        deleteConfirm: "Are you sure you want to delete this participant?",
        deleteNotReadyAndStart: "Delete Not Ready & Start",
        personalityTraits: "Personality Traits",
      },

      // Leaderboard page (teacher)
      leaderboardPage: {
        backToPlayground: "Back to Playground",
        gameInProgress: "Game in progress. Please wait...",
        resultsMatrix: "Results Matrix",
      },

      // Tactic Preparation page
      tacticPage: {
        title: "Tactic Preparation",
        subtitle: "Prepare your strategy for the Prisoner's Dilemma game",
        yourStrategy: "Your Strategy",
        describeTactic: "Describe Your Tactic",
        tacticPlaceholder:
          "What approach will you take? How will you respond to different situations?",
        saveTactic: "Save My Tactic",
      },

      // Public page (QR-scanned by students)
      publicPage: {
        steps: {
          join: "Join",
          prepareTactic: "Strategy",
          selectReason: "Analysis",
          results: "Results",
        },
        welcome: {
          title: "Prisoner's Dilemma Game",
          description: "Join the classic game theory experiment! Enter your name to get started.",
          room: "Room: {{name}}",
        },
        registration: {
          nameLabel: "Enter your name",
          namePlaceholder: "Your display name",
          joinButton: "Join Game",
        },
        gameExplanation: {
          title: "Prepare Your Strategy",
          intro:
            "Welcome to the Prisoner's Dilemma, one of the most famous experiments in game theory! In this game, you'll be matched against other players across multiple rounds.",
          conceptTitle: "The Core Concept",
          conceptDescription:
            "In each round, you and your opponent simultaneously choose one of two actions: **Cooperate** or **Defect**. Neither player knows the other's choice until both have decided. Your combined choices determine both players' scores.",
          payoffTitle: "Scoring System",
          payoffDescription: "Each round's scores depend on the combination of choices:",
          payoffBothCooperate: "🤝 Both Cooperate → **3 points each** — Mutual trust pays off!",
          payoffBothDefect: "⚔️ Both Defect → **1 point each** — Mutual suspicion, minimal gain.",
          payoffYouCoopTheyDefect:
            "😔 You Cooperate, They Defect → **0 points for you, 5 for them** — You got exploited!",
          payoffYouDefectTheyCoop:
            "😈 You Defect, They Cooperate → **5 points for you, 0 for them** — You exploited them!",
          dilemmaTitle: "The Dilemma",
          dilemmaDescription:
            "Here's the key tension: **Defecting always seems individually better** (5 > 3 if they cooperate, 1 > 0 if they defect), but **if everyone thinks this way, everyone scores low** (1 point each). The best mutual outcome comes from cooperation (3 each), but this requires trust.",
          strategyTitle: "Your Task: Define Your Strategy",
          strategyDescription:
            "Describe how you plan to play across multiple rounds. Your strategy will be converted into code that plays the game for you automatically. Consider:",
          strategyPoints: [
            "What will you do in the first round?",
            "How will you respond if your opponent cooperated?",
            "How will you respond if your opponent defected?",
            "Will you consider the history of previous rounds?",
            "Will you try to forgive, retaliate, or adapt?",
          ],
          examplesTitle: "Example Strategies",
          exampleAlwaysCoop:
            "**Always Cooperate**: Trust unconditionally — cooperate every round regardless.",
          exampleAlwaysDefect:
            "**Always Defect**: Maximize self-interest — defect every round regardless.",
          exampleTitForTat:
            "**Tit for Tat**: Start by cooperating, then copy your opponent's last move.",
          exampleGrimTrigger:
            "**Grim Trigger**: Cooperate until betrayed once, then defect forever.",
          exampleRandom: "**Random**: Randomly cooperate or defect — keep them guessing!",
          creativityNote:
            "💡 Be creative! You can invent your own unique strategy. The more specific you are, the better your strategy will be implemented.",
          tacticLabel: "Describe your strategy",
          tacticPlaceholder:
            "Example: I will start by cooperating. If my opponent cooperates, I'll continue cooperating. If they defect, I'll defect for 2 rounds to punish them, then go back to cooperating to give them another chance...",
          saveButton: "Submit Strategy",
          processing: "Analyzing your strategy...",
          processingSubtext:
            "Your strategy is being converted into game code. This may take a moment.",
        },
        reasons: {
          title: "Why Did You Choose This Strategy?",
          description:
            "Based on your strategy, we've identified some possible motivations. Select the one that best describes why you chose this approach:",
          loading: "Analyzing your strategy...",
          loadingSubtext: "Generating possible motivations based on your strategy...",
          selectPrompt: "Select the reason that resonates most with you:",
          submitButton: "Continue",
          otherReason: "Other (my reason is different)",
        },
        result: {
          title: "Your Career Analysis",
          description:
            "Based on your strategy and motivation, here are career suggestions that match your personality traits:",
          loading: "Generating your personalized career analysis...",
          jobRecommendation: "Career Recommendation",
        },
        waiting: {
          title: "You're all set, {{name}}!",
          message: "Waiting for other players...",
          gameMasterNote: "The game master will start a session when all players are ready.",
          canClosePage: "You can close this page - you'll be notified when it's time to play.",
        },
      },

      // Instructions component
      instructions: {
        welcomeTitle: "Welcome to the Prisoner's Dilemma Game!",
        intro:
          "In this game, you and another player will repeatedly choose to either cooperate or defect. Your choices will affect both your outcomes and the other player's outcomes. Here's how you can define your tactic:",
        choicesTitle: "Understanding the Choices:",
        cooperateDesc:
          "If you choose to cooperate, you are trusting the other player and working together for a potentially better mutual outcome.",
        defectDesc:
          "If you choose to defect, you are acting in your own self-interest, which could lead to a better individual outcome but might hurt the other player.",
        scoringTitle: "Scoring System:",
        scoringIntro:
          "Each round, you and your opponent will receive points based on your choices. The payoffs for each possible combination of choices are as follows:",
        bothCooperate: "Both Cooperate: Both players receive 3 points.",
        youCooperateTheyDefect:
          "You Cooperate, Opponent Defects: You receive 0 points (Sucker's payoff), and your opponent receives 5 points (Temptation).",
        youDefectTheyCooperate:
          "You Defect, Opponent Cooperates: You receive 5 points (Temptation), and your opponent receives 0 points (Sucker's payoff).",
        bothDefect: "Both Defect: Both players receive 1 point (Punishment).",
        scoringGoal:
          "The goal is to maximize your points over multiple rounds and finish at the top of the leaderboard.",
        taskTitle: "Your Task:",
        taskDesc:
          "We need you to describe the strategy or tactic you would like to use in the game. This tactic will be used to determine your next move based on the previous rounds of the game.",
        howToDescribeTitle: "How to Describe Your Tactic:",
        beSpecific:
          "Clearly state when you would choose to cooperate and when you would choose to defect.",
        considerScenarios: "Consider Different Scenarios:",
        scenario1: "What will you do if both you and the opponent cooperated in the last round?",
        scenario2: "What will you do if you cooperated and the opponent defected?",
        scenario3: "What will you do if you defected and the opponent cooperated?",
        scenario4: "What will you do if both you and the opponent defected?",
        thinkPatterns:
          "You can also think about patterns over several rounds. For example, you might cooperate if the opponent has cooperated for the last three rounds, or defect if they have defected two times in a row.",
        examplesTitle: "Example Tactics:",
        alwaysCooperate:
          "Always Cooperate: Always choose to cooperate, regardless of the opponent's previous moves.",
        alwaysDefect:
          "Always Defect: Always choose to defect, regardless of the opponent's previous moves.",
        titForTat:
          "Tit for Tat: Start by cooperating, then in each subsequent round, do whatever the opponent did in the previous round.",
        grimTrigger:
          "Grim Trigger: Start by cooperating, but if the opponent ever defects, defect for the rest of the game.",
        yourTacticTitle: "Your Tactic:",
        yourTacticDesc:
          "Now it's your turn! Describe your tactic in detail. Remember, the more specific you are, the better your strategy will be implemented in the game.",
        leaderboardTitle: "Leaderboard:",
        leaderboardDesc:
          "At the end of the game, your total points will determine your position on the leaderboard. Aim to develop a strategy that maximizes your points and helps you climb to the top!",
        questions: "Feel free to ask if you need more information or have any questions!",
      },
    },

    // Room status
    status: {
      active: "Active",
      inactive: "Inactive",
      completed: "Completed",
      inProgress: "In Progress",
      pending: "Pending",
      open: "Open",
      closed: "Closed",
    },

    // Room statistics
    stats: {
      totalParticipants: "Total Participants",
      completedCount: "Completed",
      inProgressCount: "In Progress",
      completionRate: "Completion Rate",
    },

    // Empty state
    noParticipantsYet: "No participants yet",
    shareQRDescription: "Share the QR code to let your students join the test.",
  },
};

export default tests;
