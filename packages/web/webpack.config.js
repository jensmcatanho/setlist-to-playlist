const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const webpack = require('webpack')
require('dotenv').config()

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  entry: path.resolve(__dirname, 'src', 'index.js'),
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    contentBase: path.join(__dirname, 'public'),
    historyApiFallback: true,
    hot: true,
    port: process.env.PORT,
    watchOptions: {
      poll: true
    }
  },
  output: {
    publicPath: '/'
  },
  plugins: [
    new webpack.EnvironmentPlugin(['WEB_URL', 'SERVER_URL', 'SPOTIFY_CLIENTID']),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html')
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean)
}