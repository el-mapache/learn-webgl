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
  output: {
    path: __dirname + '/build',
    filename: 'output.js'
  }
};
