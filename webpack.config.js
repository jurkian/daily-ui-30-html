const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

// Conditional builds for dev and prod
let isProd = process.env.NODE_ENV === 'production';

// PostCSS loader settings
let postCSSloader = {
   loader: 'postcss-loader',
   options: {
      plugins: (loader) => [
         require('autoprefixer')({
            browsers: [
               '> 2%',
               'last 3 versions',
            ]
         }),
         require('cssnano')()
      ]
   }
};

// Prepare config for CSS and Sass loaders depending on dev/prod environment
// ExtractTextPlugin doesn't work with HMR, so disable it on development

// CSS build config
let cssDev = ['style-loader', 'css-loader', postCSSloader];
let cssProd = ExtractTextPlugin.extract({
   fallback: 'style-loader',
   use: ['css-loader', postCSSloader],
   publicPath: '../'
});

let cssConfig = isProd ? cssProd : cssDev;

// Sass build config
let sassDev = ['style-loader', 'css-loader', postCSSloader, 'sass-loader'];
let sassProd = ExtractTextPlugin.extract({
   fallback: 'style-loader',
   use: ['css-loader', postCSSloader, 'sass-loader'],
   publicPath: '../'
});

let sassConfig = isProd ? sassProd : sassDev;

module.exports = {
   entry: {
      main: './src/js/index.js',
      vendor: './src/js/vendor.js'
   },

   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].bundle.js'
   },

   module: {
      rules: [{
         test: /\.js$/,
         exclude: /(node_modules|bower_components)/,
         use: ['babel-loader']
      }, {
         test: /\.css$/,
         use: cssConfig
      }, {
         test: /\.scss$/,
         use: sassConfig
      }, {
         test: /\.(jpe?g|png|gif|svg)$/i,
         exclude: [/fonts?/],
         use: [
            'file-loader?name=[name].[ext]&outputPath=images/',
            'image-webpack-loader'
         ]
      }, {
         test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
         exclude: [/(images?|img)/],
         use: 'file-loader?name=fonts/[name].[ext]'
      }]
   },

   devServer: {
      contentBase: path.join(__dirname, 'src'),
      compress: true,
      port: 8080,
      hot: true,
      stats: 'minimal',
      open: true
   },

   plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
         name: 'vendor'
      }),
      new HtmlWebpackPlugin({
         title: 'Webpack Starter',
         minify: {
            collapseWhitespace: true
         },
         hash: true,
         template: './src/index.ejs', // Load a custom template (ejs by default see the FAQ for details)
      }),
      new ExtractTextPlugin({
         filename: 'css/[name].css',
         disable: !isProd,
         allChunks: true
      })
   ]
};