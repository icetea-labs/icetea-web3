
const path = require('path')
const webpack = require('webpack')
const packageJson = require('./package')

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const outDir = process.env.RUNTYPER ? '.runtyper' : 'dist'
const runtyper = process.env.RUNTYPER ? ['babel-plugin-runtyper', {
  warnLevel: 'break',
  implicitAddStringNumber: 'allow'
}] : null
const babelPlugins = [runtyper].filter(Boolean)

const outFile = path.basename(packageJson.browser)

module.exports = env => ({
  mode: env === 'prod' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(outDir),
    filename: outFile,
    libraryTarget: 'umd',
    library: 'icetea',
    globalObject: 'this' // https://github.com/webpack/webpack/issues/6525
  },
  devtool: 'source-map',
  externals: {
    websocket: 'root WebSocket',
    'node-fetch': 'root fetch',
    'node-localstorage': 'root localStorage'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  "exclude": ["@babel/plugin-transform-async-to-generator", "@babel/plugin-transform-regenerator"]
                }
              ]
            ],
            plugins: babelPlugins
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin(`${packageJson.name} v${packageJson.version}`)
    // new BundleAnalyzerPlugin()
  ]
})
