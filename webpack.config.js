const  HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
module.exports = env => {
  return {
    mode: 'development', //for analysis build code
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'system' // module standard
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: { loader: 'babel-loader' },
        exclude: /node_modules/
      }]
    },
    plugins: [
      !env.production && new HtmlWebpackPlugin({
        template: 'public/index.html'
      })
    ].filter(Boolean),
    devServer: {
      port: 4900
    },
    externals: env.production ? ['react', 'react-dom']:[]
  }
}