const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
// const WorkboxPlugin = require('workbox-webpack-plugin');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = {
	entry: {
		main: './src/js/index.js'
	},
	devtool: 'inline-source-map',
	output: {
		filename: './js/[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // 在开发环境使用 style-loader
                fallback: "style-loader"
            })
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
		// new ExtractTextPlugin({
		//     filename: "[name].[contenthash].css",
		//     disable: process.env.NODE_ENV === "development"
		// }),
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