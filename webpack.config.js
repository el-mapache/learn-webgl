var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: __dirname + '/js',
  entry: 'index.js',
  resolve: {
    modules: [
      path.resolve('./js')
    ]
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    }]
  },
  output: {
    path: __dirname + '/build',
    filename: 'output.js'
  }
};
