const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist')
  },
  resolve: {
      modules: ['src', 'node_modules']
  }
  //optimization: {
    //minimize: false
  //}
}

