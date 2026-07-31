/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  rules: {
    'css-semicolonexpected': 'off',
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['index', 'navbar']
      }
    ],
    'no-var': 'off' // [关闭]变量未改变时建议用const
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    './output/.eslintrc-auto-import.json'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
