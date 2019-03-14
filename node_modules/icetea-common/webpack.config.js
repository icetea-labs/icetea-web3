
const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package');

const nodeExternals = require('webpack-node-externals');

const outDir = process.env.RUNTYPER ? '.runtyper' : 'dist';
const runtyper = process.env.RUNTYPER ? ['babel-plugin-runtyper', {
  warnLevel: 'break',
  implicitAddStringNumber: 'allow',
}] : null;
const babelPlugins = [runtyper].filter(Boolean);

function makeConfig(target) {
  const isNode = target === 'node'
  const outFile = isNode ? path.basename(packageJson.main) : path.basename(packageJson.browser)
  return {
    target: target,
    externals: isNode ? [nodeExternals()] : undefined,
    mode: 'development',
    entry: './src',
    output: {
      path: path.resolve(outDir),
      filename: outFile,
      libraryTarget: 'umd',
      library: 'IceTeaWeb3',
      globalObject: 'this', // https://github.com/webpack/webpack/issues/6525
    },
    devtool: 'source-map',
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
      new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`)
    ]
  }
};

module.exports = [makeConfig('node'), makeConfig('web')]
