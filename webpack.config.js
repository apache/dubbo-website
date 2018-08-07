const path = require('path');
const webpack = require('webpack');

module.exports = {
  cache: true,
  entry: {
    page: './src/index.jsx'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: './build/',
    filename: '[name].js',
    chunkFilename: '[chunkhash].js',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
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
        test: /\.(s)?css$/,
        use: ['style-loader', 'raw-loader', 'sass-loader'],
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
  ]
};
