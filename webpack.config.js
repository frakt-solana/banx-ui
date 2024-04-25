// Generated using webpack-cli https://github.com/webpack/webpack-cli

const Webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const { sentryWebpackPlugin } = require('@sentry/webpack-plugin')

const isProduction = process.env.NODE_ENV == 'production'

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader'

require('dotenv').config({ path: './.env' })

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  devServer: {
    static: './public',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    open: true,
    client: {
      overlay: true,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      filename: 'index.html',
      manifest: './public/manifest.json',
    }),
    new Webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new Webpack.ProvidePlugin({ process: 'process/browser' }),
    new Webpack.DefinePlugin({ 'process.env': JSON.stringify(process.env) }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: stylesHandler,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.\w+$/i,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: stylesHandler,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.\w+$/i,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    alias: {
      '@banx': path.resolve(__dirname, 'src/'),
    },
    fallback: {
      assert: require.resolve('assert'),
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: false,
    },
  },
}

module.exports = () => {
  if (isProduction) {
    config.mode = 'production'

    config.performance = {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    }

    config.plugins.push(new MiniCssExtractPlugin())

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW())

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: {
              ignore: ['**/*.html', '**/*.ico'],
            },
          },
        ],
      }),
    )

    if (process.env.SENTRY_DEPLOY_SOURCEMAP === 'true') {
      config.plugins.push(
        sentryWebpackPlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
      )
    }
  } else {
    config.mode = 'development'
    config.cache = true
    config.devtool = 'eval-source-map'

    config.plugins.push(new ReactRefreshWebpackPlugin())
  }
  return config
}
