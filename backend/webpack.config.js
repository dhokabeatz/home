const path = require('path');

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  mode: 'production',
  externals: {
    // AWS SDK is provided by Lambda runtime
    'aws-sdk': 'aws-sdk',
    // Don't bundle these large packages, they'll be included as node_modules
    '@prisma/client': '@prisma/client',
    'prisma': 'prisma',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lambda.js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: true,
    // Don't split chunks for Lambda
    splitChunks: false,
  },
  // Ignore warnings about large files
  performance: {
    hints: false,
  },
};
