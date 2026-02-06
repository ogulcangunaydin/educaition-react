/**
 * User Management Page
 *
 * Admin-only page for managing system users.
 * Features: List users, create, edit, delete, role management.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tooltip,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Add, Person, Search, Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PageLayout } from "@components/templates";
import { Button, Loading } from "@components/atoms";
import { EmptyState, ConfirmDialog } from "@components/molecules";
import userService from "@services/userService";
import { UNIVERSITY_CONFIG } from "@contexts/UniversityContext";

// Role colors for chips
const ROLE_COLORS = {
  admin: "error",
  teacher: "primary",
  viewer: "info",
  student: "default",
};

// Initial form state
const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  role: "student",
  university: "halic",
};

export default function UserManagement() {
  const { t } = useTranslation();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      showSnackbar(t("users.messages.fetchError"), "error");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  // Snackbar helper
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Open create dialog
  const handleCreate = () => {
    setSelectedUser(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      university: user.university,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = t("validation.required");
    }

    if (!formData.email.trim()) {
      errors.email = t("validation.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t("validation.invalidEmail");
    }

    if (!selectedUser && !formData.password) {
      errors.password = t("validation.required");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
        showSnackbar(t("users.messages.updateSuccess"));
      } else {
        await userService.createUser(formData);
        showSnackbar(t("users.messages.createSuccess"));
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      showSnackbar(
        selectedUser ? t("users.messages.updateError") : t("users.messages.createError"),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await userService.deleteUser(selectedUser.id);
      showSnackbar(t("users.messages.deleteSuccess"));
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      showSnackbar(t("users.messages.deleteError"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Form field change handler
  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Get university display name
  const getUniversityName = (key) => {
    return UNIVERSITY_CONFIG[key]?.displayName || key;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <PageLayout title={t("users.title")}>
        <Loading />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t("users.title")}
      subtitle={t("users.subtitle")}
      maxWidth="lg"
      actions={
        <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
          {t("users.createUser")}
        </Button>
      }
    >
      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder={t("common.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Person}
          title={t("users.noUsers")}
          description={t("users.noUsersDescription")}
          action={
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
              {t("users.createUser")}
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("users.username")}</TableCell>
                <TableCell>{t("users.email")}</TableCell>
                <TableCell>{t("users.role")}</TableCell>
                <TableCell>{t("users.university")}</TableCell>
                <TableCell>{t("users.status")}</TableCell>
                <TableCell>{t("users.createdAt")}</TableCell>
                <TableCell align="right">{t("users.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        {user.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`users.roles.${user.role}`)}
                      size="small"
                      color={ROLE_COLORS[user.role] || "default"}
                    />
                  </TableCell>
                  <TableCell>{getUniversityName(user.university)}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? t("users.active") : t("users.inactive")}
                      size="small"
                      color={user.is_active ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("users.editUser")}>
                      <IconButton size="small" onClick={() => handleEdit(user)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("users.deleteUser")}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? t("users.form.title.edit") : t("users.form.title.create")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("users.form.username")}
              placeholder={t("users.form.usernamePlaceholder")}
              value={formData.username}
              onChange={handleFormChange("username")}
              error={!!formErrors.username}
              helperText={formErrors.username}
              fullWidth
              required
            />

            <TextField
              label={t("users.form.email")}
              placeholder={t("users.form.emailPlaceholder")}
              type="email"
              value={formData.email}
              onChange={handleFormChange("email")}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              required
            />

            <TextField
              label={t("users.form.password")}
              placeholder={t("users.form.passwordPlaceholder")}
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleFormChange("password")}
              error={!!formErrors.password}
              helperText={formErrors.password || (selectedUser ? t("users.form.passwordHint") : "")}
              fullWidth
              required={!selectedUser}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>{t("users.form.role")}</InputLabel>
              <Select
                value={formData.role}
                onChange={handleFormChange("role")}
                label={t("users.form.role")}
              >
                <MenuItem value="admin">{t("users.roles.admin")}</MenuItem>
                <MenuItem value="teacher">{t("users.roles.teacher")}</MenuItem>
                <MenuItem value="viewer">{t("users.roles.viewer")}</MenuItem>
                <MenuItem value="student">{t("users.roles.student")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t("users.form.university")}</InputLabel>
              <Select
                value={formData.university}
                onChange={handleFormChange("university")}
                label={t("users.form.university")}
              >
                {Object.entries(UNIVERSITY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    {config.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="contained" onClick={handleSubmit} loading={submitting}>
            {selectedUser ? t("common.update") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={t("users.deleteUser")}
        message={t("users.messages.deleteConfirm")}
        warning={t("users.messages.deleteWarning")}
        confirmLabel={t("common.delete")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={submitting}
        destructive
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
