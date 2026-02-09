/**
 * English - Authentication Translations
 */

const auth = {
  auth: {
    login: "Login",
    logout: "Logout",
    register: "Register",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    username: "Username",
    rememberMe: "Remember me",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",

    // Standard login (educaition)
    educaition: {
      welcomeTitle: "Welcome to Educaition",
      welcomeSubtitle: "Sign in to access the test management panel",
      copyright: "© {{year}} Educaition - Test Management System",
      halicRedirect: "Are you from a university?",
    },

    // Halic login
    halic: {
      welcomeTitle: "Welcome to University Comparison",
      welcomeSubtitle: "Sign in to access the university comparison tool",
      copyright: "© {{year}} Haliç University - University Comparison",
    },

    // Messages
    loginSuccess: "Login successful",
    loginError: "Invalid username or password",
    logoutSuccess: "Logged out successfully",
    sessionExpired: "Your session has expired. Please login again.",
    unauthorized: "You are not authorized to access this page",
    viewerNotAllowed: "Viewers can only access through the university comparison portal.",
    studentNotAllowed: "Students should access tests through links provided by their teachers.",
    accountCreated: "Account created successfully",
    passwordResetSent: "Password reset link sent to your email",
    passwordResetSuccess: "Password reset successfully",
    passwordMismatch: "Passwords do not match",
    invalidEmail: "Please enter a valid email address",
    weakPassword: "Password must be at least 8 characters",
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
  },
};

export default auth;
