// Header.js
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

function Header({ title, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("universityKey");
    navigate("/login");
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "primary.light" }}>
      <Toolbar>
        <Box
          component="img"
          src="/halic_universitesi_logo.svg"
          alt="Haliç Üniversitesi"
          sx={{
            height: 40,
            mr: 2,
          }}
        />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {children}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Çıkış
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
