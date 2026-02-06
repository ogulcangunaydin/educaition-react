/**
 * Test Questions Data
 *
 * Centralized questions for all test types.
 * Prepared for future internationalization (i18n).
 *
 * Structure:
 * - Each test type has its own section
 * - Questions are keyed for easy translation lookup
 * - Keep texts here instead of hardcoding in components
 */

// =============================================================================
// DISSONANCE TEST QUESTIONS
// =============================================================================

export const DISSONANCE_TEST = {
  // Welcome/intro text
  welcome: {
    title: "Career Discovery Journey",
    description:
      "Embark on a fun discovery journey for your career! Based on your age, personality traits, and zodiac sign, we'll brainstorm the most suitable professions and create an enjoyable plan! Remember, the results are inspiring but not definitive!",
  },

  // Step 1: Initial question about taxi problem importance
  step1: {
    taxiProblemQuestion: "How important do you think the taxi problem in Istanbul is?",
  },

  // Step 2: Demographics
  step2: {
    emailLabel: "Your email address:",
    ageLabel: "Your age:",
    genderLabel: "Your gender:",
    educationLabel: "Your education level:",
    starSignLabel: "Your zodiac sign:",
    risingSignLabel: "Your rising sign:",
    workloadLabel: "Work tempo that motivates me:",
    workloadMin: "Relaxed",
    workloadMax: "Intense",
    careerStartLabel: "How should my career start:",
    careerStartMin: "Easy",
    careerStartMax: "Challenging",
    flexibilityLabel: "How flexible should my profession be:",
    flexibilityMin: "Rigid",
    flexibilityMax: "Flexible",
  },

  // Step 3: Taxi service questions
  step3: {
    taxiComfortQuestion:
      "To what extent does the taxi service in Istanbul (ease of finding a taxi, ride comfort, driver behavior, etc.) meet your expectations?",
    taxiFaresQuestion:
      "In your opinion, how well does the quality of taxi service in Istanbul match the fare balance?",
  },

  // Step 4: Processing message
  step4: {
    thankYou: "Thank you for your participation!",
    averageResults: "Average Results:",
    taxiComfortAverage: "Taxi Service Comfort",
    taxiFaresAverage: "Taxi Fare Balance",
    votes: "votes",
    processing: "Your answers are being saved, please wait...",
  },

  // Step 5: Error simulation
  step5: {
    errorTitle: "HTTP Error 504: Gateway Timeout",
    errorMessage: "The server could not save your first answer. Could you please answer again?",
  },

  // Step 6: Completion
  step6: {
    success: "Your answers have been saved correctly.",
    nextStep: "Click to take the personality test",
  },

  // Common
  next: "Next",
  save: "Save",
  submit: "Submit",
};

// =============================================================================
// PRISONERS DILEMMA QUESTIONS
// =============================================================================

export const PRISONERS_DILEMMA = {
  // Welcome page
  welcome: {
    title: "Prisoner's Dilemma Game",
    description:
      "Join the classic game theory experiment! You'll be playing against other participants in a series of rounds. Choose to cooperate or defect - your strategy determines your score!",
    instructions: [
      "Enter your name to join the game",
      "Wait for the game master to start a session",
      "In each round, choose to cooperate or defect",
      "Your score depends on both your choice and your opponent's choice",
    ],
  },

  // Registration
  registration: {
    nameLabel: "Enter your name",
    namePlaceholder: "Your display name",
    joinButton: "Join Game",
    waitingMessage: "Waiting for game to start...",
  },

  // Tactic preparation
  tactics: {
    title: "Prepare Your Tactic",
    description: "Before the game starts, describe your strategy:",
    tacticLabel: "Your tactic/strategy",
    tacticPlaceholder: "Describe how you plan to play...",
    saveButton: "Save Tactic",
  },

  // Game choices
  game: {
    cooperate: "Cooperate",
    defect: "Defect",
    roundLabel: "Round",
    opponentLabel: "Opponent",
    yourChoice: "Your Choice",
    opponentChoice: "Opponent's Choice",
    yourScore: "Your Score",
    totalScore: "Total Score",
  },

  // Payoff matrix explanation
  payoffs: {
    bothCooperate: "Both Cooperate: 3 points each",
    bothDefect: "Both Defect: 1 point each",
    cooperateVsDefect: "You Cooperate, They Defect: 0 points for you, 5 for them",
    defectVsCooperate: "You Defect, They Cooperate: 5 points for you, 0 for them",
  },

  // Personality test integration
  personalityTest: {
    title: "Personality Assessment",
    description: "Complete this quick personality assessment to help us analyze game strategies.",
  },

  // Common
  ready: "Ready",
  notReady: "Not Ready",
  waiting: "Waiting for other players...",
};

// =============================================================================
// COMMON ANSWER SCALES
// =============================================================================

export const ANSWER_SCALES = {
  // 1-10 scale for sliders
  scale10: {
    min: 1,
    max: 10,
  },

  // 1-5 scale for Likert questions
  likert5: [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ],

  // Sentiment icons mapping (1-10)
  sentiment: [
    { value: 1, sentiment: "very-dissatisfied" },
    { value: 2, sentiment: "very-dissatisfied" },
    { value: 3, sentiment: "dissatisfied" },
    { value: 4, sentiment: "dissatisfied" },
    { value: 5, sentiment: "neutral" },
    { value: 6, sentiment: "neutral" },
    { value: 7, sentiment: "satisfied" },
    { value: 8, sentiment: "satisfied" },
    { value: 9, sentiment: "very-satisfied" },
    { value: 10, sentiment: "very-satisfied" },
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get question text with fallback
 * Useful for future i18n integration
 */
export function getQuestionText(testType, path, fallback = "") {
  const parts = path.split(".");
  let current = testType;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return fallback;
    }
  }

  return typeof current === "string" ? current : fallback;
}

const testQuestions = {
  DISSONANCE_TEST,
  PRISONERS_DILEMMA,
  ANSWER_SCALES,
  getQuestionText,
};

export default testQuestions;
