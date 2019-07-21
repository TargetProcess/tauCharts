module.exports =  {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "node": true,
    "browser": true,
    "mocha": true,
    "es6": true
  },
  "rules": {
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/indent": 0,
    "no-prototype-builtins": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-use-before-define": 0,
  },
};
