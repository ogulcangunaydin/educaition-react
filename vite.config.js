import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@mui/private-theming",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/styles",
      "@mui/material/Box",
      "@mui/material/Button",
      "@mui/material/Typography",
      "@mui/material/Fade",
      "@mui/material/LinearProgress",
      "@mui/material/Grow",
      "@mui/material/Collapse",
    ],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@atoms": path.resolve(__dirname, "./src/components/atoms"),
      "@molecules": path.resolve(__dirname, "./src/components/molecules"),
      "@organisms": path.resolve(__dirname, "./src/components/organisms"),
      "@templates": path.resolve(__dirname, "./src/components/templates"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@theme": path.resolve(__dirname, "./src/theme"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@i18n": path.resolve(__dirname, "./src/i18n"),
    },
  },
  server: {
    port: 8080,
    open: true,
    force: true,
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
});
