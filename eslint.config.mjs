import eslint from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import typescriptEslint from "typescript-eslint";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";

export default [
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  ...storybook.configs["flat/recommended"],
  prettierRecommended,
  {
    ignores: ["**/.eslint.config.mjs", "**/lint-staged.config.js"],
  },
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptEslintPlugin,
      "unused-imports": unusedImports,
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.jest,
      },
      parser: typescriptEslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      "import/resolver": {
        typescript: {},
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "eol-last": ["error", "always"],
      "no-duplicate-imports": "error",
      "no-empty-pattern": "off",
      "no-undef": "off",
      "react/display-name": "off",
      "react/jsx-boolean-value": ["error", "always"],
      "react/jsx-uses-react": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "spaced-comment": "off",
      "unused-imports/no-unused-imports": "error",
      camelcase: "off",
      quotes: "off",
    },
  },
];
