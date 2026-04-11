export default [
  {
    ignores: ["dist/**", "build/**"],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
