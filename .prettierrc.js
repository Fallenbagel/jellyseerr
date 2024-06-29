module.exports = {
  plugins: [require('./merged-prettier-plugin.js')],
  singleQuote: true,
  trailingComma: 'es5',
  overrides: [
    {
      files: 'gen-docs/pnpm-lock.yaml',
      options: {
        rangeEnd: 0, // default: Infinity
      },
    },
  ],
};
