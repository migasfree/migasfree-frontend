/** @type { import('@storybook/vue3-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-links'],
  framework: {
    name: '@storybook/vue3-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // Add aliases to match the project
    config.resolve.alias = {
      ...config.resolve.alias,
      src: require('path').resolve(__dirname, '../src'),
      components: require('path').resolve(__dirname, '../src/components'),
      composables: require('path').resolve(__dirname, '../src/composables'),
      config: require('path').resolve(__dirname, '../src/config'),
      boot: require('path').resolve(__dirname, '../src/boot'),
      stores: require('path').resolve(__dirname, '../src/stores'),
    }

    // Add sass-loader for .sass files
    config.module.rules.push({
      test: /\.sass$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              indentedSyntax: true,
            },
          },
        },
      ],
    })

    return config
  },
}

export default config
