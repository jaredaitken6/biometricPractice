import globals from "globals";  // Make sure you're using 'import' here
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,  // Ensures browser globals are included
        ...globals.jest,     // Fix: Add Jest globals to support test/expect
      },
    },
    rules: {
      "no-unused-vars": "warn", // Change error to warning for unused vars
      "no-undef": "off",        // Disable the 'no-undef' rule since Jest globals are used
    },
  },
  pluginJs.configs.recommended,
];
