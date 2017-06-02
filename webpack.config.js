module.exports = {
  entry: './index.js',
  output: {
    filename: 'dist/identityfusion.js',
    libraryTarget: 'umd',
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
