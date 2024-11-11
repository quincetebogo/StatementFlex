import { Utils } from '../../cli/Utils.js';

import path from 'path';
import fs from 'fs';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const packageJson = JSON.parse(fs.readFileSync('./package.json'));
const bundle = packageJson.name + '-' + packageJson.version;

export default {
	mode: 'development',
	entry: {
		[bundle]: './index.js',
	},
	output: {
		path: path.join(process.cwd(), 'dist'),
		publicPath: '',
		filename: '[name].js'
	},
	// resolve: {
	//     modules: [
	//         Utils.platformPath('./packages/ocwp-components/node_modules')
	//     ]
	// },
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				include: [
					// These packages are distributed as es2015 modules, therefore they need to be transpiled to ES5.
					// /node_modules(?:\/|\\)lit-element|lit-html|\@webcomponents\/webcomponentsjs/
					/node_modules(?:\/|\\)lit/
				],
				// use: {
				// 	loader: 'babel-loader',
				// 	options: {
				// 		presets: ['@babel/preset-env', {
				// 			// targets: '> 0.25%, not dead'
				// 			targets: {
				// 				// "useBuiltIns": "entry"
				// 				// "esmodules": true
				// 				browsers: ["last 2 versions"]
				// 			}
				// 		}]
				// 	}
				// }
			}
		]
	},
	devtool: 'source-map',
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
		}),
		new HtmlWebpackPlugin({
			inject: false,
			filename: 'index.html',
			template: Utils.platformPath('./packages/ocwp-components/build/index.html'),
			version: packageJson.version
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					context: 'build',
					from: 'favicon.ico',
					to: '.'
				},
				{
					context: 'node_modules/@webcomponents/webcomponentsjs',
					from: '**/*.js',
					to: 'webcomponentsjs'
				},
				{
					context: 'node_modules/@webcomponents/webcomponentsjs',
					from: '**/*.js.map',
					to: 'webcomponentsjs'
				},
				{
					context: 'src/templates',
					from: '*.css',
					to: 'templates'
				},
				{
					context: 'src/fonts',
					from: '**/*',
					to: 'platform/fonts'
				},
				{
					context: 'src/icons',
					from: '**/*',
					to: 'platform/icons'
				},
				{
					context: 'src/illustrations',
					from: '**/*',
					to: 'platform/illustrations'
				}
			]
		})
	],
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: true
			}),
		]
	}
};