/**
 * English - Users Translations
 */

const users = {
  users: {
    title: "User Management",
    subtitle: "Manage system users and their permissions",

    // Actions
    createUser: "Create User",
    editUser: "Edit User",
    deleteUser: "Delete User",

    // Table headers
    username: "Username",
    email: "Email",
    role: "Role",
    university: "University",
    status: "Status",
    createdAt: "Created At",
    actions: "Actions",

    // Form
    form: {
      title: {
        create: "Create New User",
        edit: "Edit User",
      },
      username: "Username",
      usernamePlaceholder: "Enter username",
      email: "Email",
      emailPlaceholder: "Enter email address",
      password: "Password",
      passwordPlaceholder: "Enter password",
      passwordHint: "Leave empty to keep current password",
      role: "Role",
      selectRole: "Select role",
      university: "University",
      selectUniversity: "Select university",
    },

    // Roles
    roles: {
      admin: "Admin",
      teacher: "Teacher",
      viewer: "Viewer",
      student: "Student",
    },

    // Status
    active: "Active",
    inactive: "Inactive",

    // Validation
    validation: {
      usernameMinLength: "Username must be at least 3 characters",
      usernameFormat:
        "Username must start with a letter and contain only letters, numbers, underscores, and dots",
      passwordMinLength: "Password must be at least 6 characters",
    },

    // Messages
    messages: {
      createSuccess: "User created successfully",
      updateSuccess: "User updated successfully",
      deleteSuccess: "User deleted successfully",
      deleteConfirm: "Are you sure you want to delete this user?",
      deleteWarning: "This action cannot be undone.",
      fetchError: "Failed to fetch users",
      createError: "Failed to create user",
      updateError: "Failed to update user",
      deleteError: "Failed to delete user",
    },

    // Empty state
    noUsers: "No users found",
    noUsersDescription: "Create your first user to get started",
  },
};

export default users;
