import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { Button } from "@components/atoms";
import { useAuth } from "@contexts/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 3,
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "6rem", fontWeight: 700, color: "error.main" }}>
        403
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        You don't have permission to access this page. Please contact an administrator if you
        believe this is an error.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        {isAuthenticated ? (
          <Button variant="contained" onClick={logout}>
            Logout
          </Button>
        ) : (
          <Button variant="contained" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </Box>
    </Box>
  );
}
