module.exports = {
  root: true,
  extends: ["@react-native-community", "plugin:react-hooks/recommended", "prettier"],
  plugins: ["react", "react-hooks"],
  env: {
    "react-native/react-native": true,
    es6: true,
    node: true,
  },
  rules: {
    "prettier/prettier": ["error"],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
};
