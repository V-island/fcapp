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
				name: 'My Manifest',  // 用作当用户被提示安装应用时出现的文本
				short_name: "Fun Chat",  // 用作当应用安装后出现在用户主屏幕上的文本
				start_url: "/index.html",  // 打开后第一个出现的页面地址
				/**
				 *  display 配置项 设置 web 应用的显示模式
				 * 	FullScreen 打开 Web 应用并占用整个可用的显示区域。
				 *	Standalone 独立原生应用模式 用户代理将排除诸如 URL 栏等标准浏览器 UI 元素，但可以包括诸如状态栏和系统返回按钮的其他系统 UI 元素
				 *	Minimal-ui 此模式类似于 fullscreen，但为终端用户提供了可访问的最小 UI 元素集合，例如，后退按钮、前进按钮、重载按钮以及查看网页地址的一些方式。
				 *	Browser 使用操作系统内置的标准浏览器来打开 Web 应用
				 */
				display: "standalone",  // 定义应用的显示方式
				description: "逗聊APP 交友软件", // 参考 meta 中的 description
				orientation: "natural", // 定义默认应用显示方向，竖屏、横屏
				prefer_related_applications: false, // 是否设置对应应用
				theme_color: "#383840",  // 主题颜色，用于控制浏览器地址栏着色
				background_color: "#383840",  //  应用加载之前的背景色，用于应用启动时的过渡
				// 定义不同尺寸的图标，最终会根据应用场景选择合适大小的图标
				icons: [{
					"src": "e.png",
					"sizes": "256x256",
					"type": "image/png"
				}],
				scope: "/" // 设置 PWA 的作用域
			}
		})
	]
}