module.exports = {
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'import/order': ['warn', { 'newlines-between': 'always' }]
  }
};

