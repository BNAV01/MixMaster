module.exports = {
  presets: [require('../tailwind.preset.cjs')],
  content: [
    './src/**/*.{html,ts,scss}',
    '../libs/**/*.{html,ts,scss}'
  ]
};
