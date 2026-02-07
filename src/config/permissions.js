export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  VIEWER: "viewer",
};

export const UNIVERSITIES = {
  HALIC: "halic",
  IBNHALDUN: "ibnhaldun",
  FSM: "fsm",
  IZU: "izu",
  MAYIS: "mayis",
};

/**
 * Test type identifiers used for device tracking.
 * These must match the test_type values used in backend device tracking.
 */
export const TEST_TYPES = {
  DISSONANCE_TEST: "dissonance_test",
  PROGRAM_SUGGESTION: "program_suggestion",
  PRISONERS_DILEMMA: "prisoners_dilemma",
  PERSONALITY_TEST: "personality_test",
};

export const MODULE_ACCESS = {
  "prisoners-dilemma": [ROLES.ADMIN, ROLES.TEACHER],
  "dissonance-test": [ROLES.ADMIN, ROLES.TEACHER],
  "university-comparison": [ROLES.ADMIN, ROLES.VIEWER],
  "program-suggestion": [ROLES.ADMIN, ROLES.TEACHER],
  "personality-test": [ROLES.ADMIN, ROLES.TEACHER],
  "user-management": [ROLES.ADMIN],
};

export const canAccessModule = (user, moduleId) => {
  if (!user) return false;
  const allowedRoles = MODULE_ACCESS[moduleId];
  if (!allowedRoles) return false;
  return allowedRoles.includes(user.role);
};

export const ROUTE_PERMISSIONS = {
  "/dashboard": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.VIEWER],
  },

  // Prisoners Dilemma Module - Admin and Teacher only
  "/rooms": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  "/prisoners-dilemma-room/:roomId": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  "/playground/:roomId": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  "/leaderboard/:sessionId": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },

  // User Management - Admin only
  "/user-management": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN],
  },

  // Test Management - Unified test room management
  "/test-management": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  "/personality-test-room/:roomId": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },

  // Dissonance Test Module - Admin and Teacher only
  "/dissonance-test": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },
  "/dissonance-test/results": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.TEACHER],
  },

  // University Comparison - Viewer and Admin
  "/university-comparison": {
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.VIEWER],
    restrictToOwnUniversity: true, // Viewers can only see their university
  },

  // Program Suggestion - Public (anonymous students)
  "/program-suggestion": {
    requireAuth: false,
    allowedRoles: null,
  },

  // Tactic Preparation - Public (participants with session token)
  "/tactic/:roomId": {
    requireAuth: false,
    requireParticipantAuth: true,
  },

  // Auth pages - Public
  "/login": {
    requireAuth: false,
    redirectIfAuthenticated: true,
  },
};

export const canAccessRoute = (user, route) => {
  const config = Object.entries(ROUTE_PERMISSIONS).find(([pattern]) => {
    const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
    return regex.test(route);
  });

  if (!config) return true;

  const [, permissions] = config;

  if (!permissions.requireAuth) return true;

  if (!user) return false;

  if (permissions.allowedRoles && !permissions.allowedRoles.includes(user.role)) {
    return false;
  }

  return true;
};

export const canAccessUniversityData = (user, universityKey) => {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  return user.university === universityKey;
};

export const getAccessibleUniversities = (user) => {
  if (!user) return [];
  if (user.role === ROLES.ADMIN) return Object.values(UNIVERSITIES);
  return [user.university];
};

export const hasRole = (user, ...roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isTeacher = (user) => hasRole(user, ROLES.TEACHER);
export const isTeacherOrAdmin = (user) => hasRole(user, ROLES.ADMIN, ROLES.TEACHER);
export const isViewer = (user) => hasRole(user, ROLES.VIEWER);
