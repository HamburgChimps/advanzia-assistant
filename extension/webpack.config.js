const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'inline-source-map',
  entry: './content-script.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'content-script.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
};
