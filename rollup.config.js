const html = require('@rollup/plugin-html');

module.exports = {
  input: 'src/main.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [html()]
};