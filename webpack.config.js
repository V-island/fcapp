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
		filename: './js/[name].[hash].js',
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
				loader: 'url-loader',
				options: {
					outputPath: 'src/img/',
					limit: 8192
				}
			}]
		}, {
			test: /\.(woff|woff2|eot|ttf|otf)$/,
			use: [{
				loader: 'file-loader',
				options: {
					name: '[path][name].[ext]',
					outputPath: '/'
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
		}, {
			test: require.resolve('jquery'),
			use: [{
				loader: 'expose-loader',
				options: 'jQuery'
			}, {
				loader: 'expose-loader',
				options: '$'
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
			template: './index.html',
			favicon: './src/img/favicon.ico',
			meta: {
				viewport: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,shrink-to-fit=no,user-scalable=no',
				keywords: 'chat,fun chat',
				description: 'fun chat',
				auther: 'douliao@outlook.com',
				robots: 'index,fun chat',
				copyright: 'Copyright 友语 版权所有',
				'apple-touch-fullscreen': 'yes',
				'apple-mobile-web-app-capable': 'yes',//网站开启对web app程序的支持
				'apple-mobile-web-app-status-bar-style': 'black-translucent',//在web app应用下状态条（屏幕顶部条）的颜色
				'apple-mobile-web-app-title': 'fun chat',//添加到桌面时标题
				'format-detection': 'telephone=no',//是否将网页内容中的手机号码显示为拨号的超链接
				'revisit-after': '1 days',
				'theme-color': '#313443'
			}
		}),
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, 'src/pages'),
			to: './pages'
		}, {
			from: path.resolve(__dirname, 'src/public'),
			to: './src/public'
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
				theme_color: "#383840",
				background_color: "#383840",
				icons: [{
					"src": "e.png",
					"sizes": "256x256",
					"type": "image/png"
				}]
			}
		})
	]
}