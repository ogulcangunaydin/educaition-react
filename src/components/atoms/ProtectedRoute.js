import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({
  children,
  allowedRoles = null,
  redirectTo = "/login",
  requireAuth = true,
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
