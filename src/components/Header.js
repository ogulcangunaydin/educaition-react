// Header.js
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function Header({ title, children }) {
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
        <Box sx={{ display: "flex", alignItems: "center" }}>{children}</Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
