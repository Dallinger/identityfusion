module.exports = {
  entry: './index.js',
  output: {
    filename: 'dist/index.js',
    libraryTarget: 'var',
    library: 'identityfusion',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devtool: 'source-map',
};
