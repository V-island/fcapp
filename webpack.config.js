const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
// const WorkboxPlugin = require('workbox-webpack-plugin');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');


module.exports = {
	entry: {
		main: './src/js/app.js'
	},
	devtool: 'inline-source-map',
	output: {
		filename: './js/[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				//如果需要，可以在 sass-loader 之前将 resolve-url-loader 链接进来
				use: ['css-loader', 'sass-loader']
			})
		}, {
			test: /\.(png|svg|jpg|gif)$/,
			use: [{
				loader: 'file-loader',
				options: {
					name: './img/[hash].[ext]'
				}
			}]
		}, {
			test: /\.html$/,
			use: [{
				loader: 'html-loader',
				// options: {
				// 	minimize: true
				// }
			}]
		}]
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		// new WorkboxPlugin.GenerateSW({
		// 	// 这些选项帮助 ServiceWorkers 快速启用
		// 	// 不允许遗留任何“旧的” ServiceWorkers
		// 	clientsClaim: true,
		// 	skipWaiting: true
		// }),
		new HtmlWebpackPlugin({
			title: 'Output Management',
			filename: 'index.html',
			template: './index.html'
		}),
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, 'src/public'),
			to: './public'
		}]),
		new webpack.ProvidePlugin({
			$: 'jquery',
			_: 'lodash'
		}),
		new ExtractTextPlugin({
			filename: './css/[name].css',
			allChunks: true
		}),
		new ManifestPlugin({
			fileName: 'manifest.json',
			basePath: './',
			seed: {
				name: 'My Manifest',
				short_name: "Fun Chat",
				display: "standalone",
				start_url: "/",
				theme_color: "#313131",
				background_color: "#313131",
				icons: [{
					"src": "e.png",
					"sizes": "256x256",
					"type": "image/png"
				}]
			}
		})
	]
}