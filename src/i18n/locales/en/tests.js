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
        comfortFirst: "Comfort (1st)",
        fareFirst: "Fare (1st)",
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
      instructions: "Define your strategy for the game",
      cooperate: "Cooperate",
      defect: "Defect",
      round: "Round",
      rounds: "Rounds",
      totalRounds: "Total Rounds",
      yourMove: "Your Move",
      opponentMove: "Opponent's Move",
      leaderboard: "Leaderboard",
      rank: "Rank",
      player: "Player",
      strategy: "Strategy",
      defineStrategy: "Define Your Strategy",
      strategyDescription: "Describe how you want to play the game",
      playground: "Playground",
      gameRoom: "Game Room",
      waitingForPlayers: "Waiting for other players...",
      gameStarting: "Game is starting...",
      gameEnded: "Game has ended",
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
