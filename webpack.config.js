const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  cache: true,
  entry: {
    page: './src/index.jsx'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].js',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'highlight.js': 'hljs',
    'markdown-it': 'markdownit',
    'react-router-dom': 'ReactRouterDOM',
  },
  module: {
    loaders: [
      {
        test: /\.js|jsx$/,
        exclude: [/node_modules/, /build\/lib/, /\.min\.js$/],
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['raw-loader', 'sass-loader'] }),
      },
      {
        test: /\.css$/,
        // exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'raw-loader' }),
      },
      {
        test: /\.json?$/,
        exclude: /node_modules/,
        use: 'json-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('[name].css')
  ]
};
