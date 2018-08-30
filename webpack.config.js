const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const WorkboxPlugin = require('workbox-webpack-plugin');

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const PRODUCTION = 'production';

module.exports = {
	entry: {
		webcomponentsLite: '@webcomponents/webcomponentsjs/webcomponents-lite',
		fc: [
			// 'es5-shim',
			// 'es6-shim',
			'./assets/js/components/webcomponents-bundle',
			'./assets/js/zepto-adapter',
			'./assets/js/lang',
			'./assets/js/device',
			'./assets/js/fastclick',
			'./assets/js/scroller',
			'./assets/js/panels',
			'./assets/js/init',
			'./assets/js/router',
			'./assets/js/last-position',
			'./assets/js/navigator',
			'./assets/scss/fc.scss'
		],
		'fc-extend': [
			'jquery-ripple'
		]
	},
	devtool: 'inline-source-map',
	output: {
		filename: './assets/js/[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
		{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [{
					loader: 'css-loader',
					options: {
						module: true,
						minimize: process.env.WEBPACK_MODE === PRODUCTION,
						// sourceMap: true,
						localIdentName: '[local]'
					}
				}, {
					loader: 'sass-loader'
				}]
			})
		}, {
			test: /\.(png|svg|jpg|gif)$/,
			use: [{
				loader: 'url-loader',
				options: {
					name: '[hash].[ext]',
					outputPath: '/assets/img',
					// publicPath: '/dist/',
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
					// publicPath: '/dist/'
				}
			}]
		}, {
			test: /\.html$/,
			use: [{
				loader: 'html-loader',
				options: {
					minimize: true
				}
			}]
		}, {
			test: require.resolve('jquery'),
			use: [{
				loader: 'exports-loader',
				options: 'jQuery'
			}, {
				loader: 'exports-loader',
				options: '$'
			}, {
				loader: 'script-loader'
			}]
		}
		// , {
		// 	test: require.resolve('zepto'),
		// 	use: [{
		// 		loader: 'exports-loader',
		// 		options: 'window.Zepto'
		// 	}, {
		// 		loader: 'script-loader'
		// 	}]
		// }
		]
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
			title: 'Fun Chat',
			filename: 'index.html',
			template: './assets/index.html',
			favicon: './assets/img/favicon.ico',
			meta: {
				viewport: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,shrink-to-fit=no,user-scalable=no',
				keywords: 'chat,fun chat',
				description: 'fun chat',
				auther: 'douliao@outlook.com',
				robots: 'index,fun chat',
				copyright: 'Copyright 友语 版权所有',
				'apple-touch-fullscreen': 'yes',
				'apple-mobile-web-app-capable': 'yes', //网站开启对web app程序的支持
				'apple-mobile-web-app-status-bar-style': 'black-translucent', //在web app应用下状态条（屏幕顶部条）的颜色
				'apple-mobile-web-app-title': 'fun chat', //添加到桌面时标题
				'format-detection': 'telephone=no', //是否将网页内容中的手机号码显示为拨号的超链接
				'revisit-after': '1 days',
				'theme-color': '#313443'
			}
		}),
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, 'assets/pages'),
			to: './pages'
		}, {
			from: path.resolve(__dirname, 'assets/public'),
			to: './public'
		}, {
			from: path.resolve(__dirname, 'assets/img/logos'),
			to: './assets/img'
		}, {
			from: path.resolve(__dirname, 'assets/sw'),
			to: './'
		}]),
		new webpack.ProvidePlugin({
			$: 'jquery',
			// Template: 'art-template/lib/template-web'
			// ,Zepto: 'zepto'
			// _: 'lodash'
		}),
		new ExtractTextPlugin({
			// filename: './css/[name].css',
			filename:  (getPath) => {
				return getPath('assets/css/[name].css').replace('css/js', 'css');
			},
			allChunks: true
		})
	]
}