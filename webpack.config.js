
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const outDir = process.env.RUNTYPER ? '.runtyper' : 'dist';
const runtyper = process.env.RUNTYPER ? ['babel-plugin-runtyper', {
  warnLevel: 'break',
  implicitAddStringNumber: 'allow',
}] : null;
const babelPlugins = [runtyper].filter(Boolean);

const outFile = path.basename(packageJson.browser)

module.exports = {
  mode: 'production',
  entry: "./src/index.js",
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'IceTeaWeb3',
    globalObject: 'this', // https://github.com/webpack/webpack/issues/6525
  },
  devtool: 'source-map',
  externals: {
    websocket: 'root WebSocket',
    'node-fetch': 'root fetch'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: babelPlugins,
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`),
    new BundleAnalyzerPlugin()
  ]
}
