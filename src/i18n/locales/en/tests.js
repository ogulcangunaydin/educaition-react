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
      description: "This test evaluates your decision-making patterns and cognitive consistency.",
      instructions: "Please answer the following questions honestly.",
      jobRecommendation: "Career Recommendation",
      viewRecommendation: "View Your Career Recommendation",
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
