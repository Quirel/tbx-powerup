const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


const publicPath = path.join(__dirname, 'public');
const templateHtml = path.join(__dirname, 'templates/index.html');

const clientFiles = glob.sync('./src/client/*.js');

const entries = clientFiles.reduce((acc, entry) => {
  const fileName = path.basename(entry, '.js');

  acc.bundles[fileName] = [entry];

  const htmlPage = new HtmlWebpackPlugin({
    inject: true,
    chunks: [fileName],
    template: templateHtml,
    filename: `${publicPath}/${fileName}.html`,
  });

  acc.html.push(htmlPage);
  return acc;
}, {
  bundles: {},
  html: []
});

module.exports = {
  mode: 'production',
  // mode: 'development',
  entry: entries.bundles,
  output: {
    filename: '[name].bundle.js',
    path: publicPath
  },
  plugins: [
    new CleanWebpackPlugin()
  ].concat(entries.html)
};
