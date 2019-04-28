module.exports = {
    "extends": [
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint",
        "plugin:react/recommended"
    ],
    "env": {
        "browser": true,
        "jest": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "settings": {
        "react": {
        "version": "detect"
        }
    }
};