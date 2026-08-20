const js = require("@eslint/js");
const prettier = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "public/dist/**"],
  },

  js.configs.recommended,

  // Fichiers JavaScript du backend
  {
    files: ["**/*.js", "!public/js/**/*.js"],

    plugins: {
      prettier,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",

      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        Buffer: "readonly",
      },
    },

    rules: {
      "prettier/prettier": "error",

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Fichiers JavaScript du frontend
  {
    files: ["public/js/**/*.js"],

    plugins: {
      prettier,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        location: "readonly",
        mapboxgl: "readonly",
      },
    },

    rules: {
      "prettier/prettier": "error",

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
