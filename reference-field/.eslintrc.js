module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "import/no-anonymous-default-export": 0,
    "no-async-promise-executor": 0,
    "no-prototype-builtins": 0,
    "react/prop-types": 0,
    "no-useless-escape": 0
  }
};
