// Header.js
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function Header({ title, children }) {
  return (
    <AppBar position="fixed" style={{ backgroundColor: "blue" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>{children}</Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
