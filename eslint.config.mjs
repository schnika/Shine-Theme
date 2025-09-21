import globals from "globals";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-console": "off"
    }
  }
];
