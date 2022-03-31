module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'next/babel',
        {
          'preset-env': {
            useBuiltIns: 'entry',
            corejs: '3',
          },
        },
      ],
    ],
    plugins: [
      [
        'react-intl-auto',
        {
          removePrefix: 'src/',
        },
      ],
    ],
  };
};
