import { Utils } from '../cli/Utils.js';

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import express from 'express';
import csp from 'helmet-csp';

const webcomponentsJs = Utils.platformPath('./packages/ocwp-components/node_modules/@webcomponents/webcomponentsjs');
const platformWebCore = Utils.platformPath('./packages/ocwp-core/src');
const platformWebComponents = Utils.platformPath('./packages/ocwp-components/src');

// console.log('##########################################');
// console.log(Utils.platformDir);
// console.log(platformWebCore);
// console.log(platformWebComponents);
// console.log('##########################################');

const polyfills = [
	{
		context: webcomponentsJs,
		from: `./webcomponents-*.{js,map}`,
		to: 'vendor'
	},
	{
		context: webcomponentsJs,
		from: `./bundles/*.{js,map}`,
		to: 'vendor'
	}
];

let optionalAssets = [
	{
		from: path.join(process.cwd(), '/src/icons'),
		to: './icons',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	}
].filter((asset) => fs.existsSync(asset.from) && fs.readdirSync(asset.from).length > 0);

let assets = [
	{
		from: path.join(process.cwd(), '/src/images'),
		to: './images',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	},
	{
		from: path.join(`${platformWebComponents}/fonts`),
		to: './platform/fonts',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	},
	{
		from: path.join(`${platformWebComponents}/icons`),
		to: './platform/icons',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	},
	{
		from: path.join(`${platformWebComponents}/illustrations`),
		to: './platform/illustrations',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	},
	{
		from: path.join(`${platformWebComponents}/templates`),
		to: './platform/templates',
		globOptions: {
			ignore: ['**/.DS_Store']
		}
	},
	{
		from: path.join(process.cwd(), '/src/config.json'),
		to: './config.json'
	},
	{
		from: path.join(process.cwd(), '/src/config.dev.json'),
		to: './config.dev.json'
	},
	{
		from: path.join(process.cwd(), '/src/config.int.json'),
		to: './config.int.json'
	},
	{
		from: path.join(process.cwd(), '/src/config.qa.json'),
		to: './config.qa.json'
	},
	{
		from: path.join(process.cwd(), '/src/config.prod.json'),
		to: './config.prod.json'
	},
	{
		from: path.join(process.cwd(), '/src/manifest.json'),
		to: './manifest.json'
	},
	{
		from: path.join(process.cwd(), '/platform.json'),
		to: './platform.json',
		transform(content) {
			const pf = JSON.parse(content.toString());

			mergePlatformJson(pf);

			return JSON.stringify(pf, null, '\t');
		}
	},
	{
		from: Utils.platformPath('./docs/component-docs.json'),
		to: './component-docs.json'
	}
];

// Append optional assets
assets = [...assets, ...optionalAssets];

// If a "assets" folder exists, import any localised resources from within it.
if (fs.existsSync(path.join(process.cwd(), '/src/assets'))) {

	assets = [...assets,
	{
		from: path.join(process.cwd(), '/src/assets'),
		to: './assets'
	}]
}

// Read the application's platform.json into memory.
const platformJson = getPlatformJson();

// Prepare CSP asset with check to merge project-level directive source(s).
assets.push({
	from: Utils.platformPath('./runtime/csp.json'),
	to: './csp.json',
	transform(content) {
		const cspJson = JSON.parse(content.toString());
		mergeCsp(cspJson, platformJson.application.csp);
		if (platformJson.app === `widget`) {
			delete cspJson[`frame-ancestors`];
		}
		return JSON.stringify(cspJson, null, '\t');
	}
});

// Extract a title deterministically.
const title = platformJson.application.title;
const type = platformJson.type ? platformJson.type : 'desktop';

if (platformJson.app === `widget`) {
	assets = [...assets,
	{
		from: path.join(process.cwd(), '/src/widget.json'),
		to: './widget.json'
	}]
}

assets.push(
	{
		from: Utils.platformPath('./runtime/runtime.json'),
		to: './runtime.json'
	},
	{
		from: Utils.platformPath('./runtime/runtime.dev.json'),
		to: './runtime.dev.json'
	},
	{
		from: Utils.platformPath('./runtime/runtime.int.json'),
		to: './runtime.int.json'
	},
	{
		from: Utils.platformPath('./runtime/runtime.qa.json'),
		to: './runtime.qa.json'
	},
	{
		from: Utils.platformPath('./runtime/runtime.prod.json'),
		to: './runtime.prod.json'
	}
)

// ...
export default async ({ mode, presets, env, shell, platform, serverURL }) => {

	const modeConfig = (await import(new URL(`./build/webpack.${mode}.js`, import.meta.url))).default;
	const loadPresets = (await import(new URL(`./build/loadPresets.js`, import.meta.url))).default;

	let outputPath = path.join(process.cwd(), 'dist');

	// Inject the required cordova dependencies in the build package.
	let shellScripts = ``;
	let baseHRef = `/`;

	// if (mode === `production` && platform === `android`) {
	// 	baseHRef = `file:///android_asset/www/`;
	// }

	if (shell === 'cordova') {

		// Default to running the browser platform if nothing is specified.
		if (!platform) {
			platform = `browser`;
		}

		// Include cordova scripts and plugins in the build bundle, by copying it in from the target platform's /cordova folder.
		let shellPath = null;

		switch (platform) {
			case 'browser':
				shellPath = `./cordova/platforms/browser/www`;
				break;
			case `android`:
				shellPath = `./cordova/platforms/android/app/src/main/assets/www`;
				break;
			case `ios`:
				shellPath = `./cordova/platforms/ios/www`;
				break;
		}

		if (shellPath) {

			assets.push(
				{
					from: path.join(process.cwd(), shellPath, './cordova.js'),
					to: './cordova.js'
				},
				{
					from: path.join(process.cwd(), shellPath, './cordova_plugins.js'),
					to: './cordova_plugins.js'
				},
				{
					from: path.join(process.cwd(), shellPath, './plugins'),
					to: './plugins'
				}
			);
		}

		// Specify how to load the additional cordova scripts.
		shellScripts = `
			<script type="text/javascript" src="cordova.js"></script>
			<script type="text/javascript" src="cordova_plugins.js"></script>
		`;
	}

	// ...
	const plugins = [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false
		}),
		new webpack.ProgressPlugin(),
		new CopyWebpackPlugin({
			patterns: [...polyfills, ...assets]
		})
	];

	// ...
	plugins.push(new HtmlWebpackPlugin({
		filename: 'unsupported.html',
		typeSuffix: type,
		template: Utils.platformPath('./runtime/unsupported.html'),
	}));

	// Remote content "root", used to serve content for mobile apps.
	plugins.push(new HtmlWebpackPlugin({
		filename: 'remote.html',
		typeSuffix: type,
		app: `shell`,
		template: Utils.platformPath('./runtime/remote.html'),
		minify: {
			collapseWhitespace: true,
			removeComments: true,
			minifyCSS: true,
			minifyJS: true
		},
		inject: `body`
	}));

	// ...
	if (platformJson.app !== `widget` || mode !== `production`) {

		plugins.push(new HtmlWebpackPlugin({
			filename: 'index.html',
			title: title,
			typeSuffix: type,
			template: Utils.platformPath('./runtime/index.html'),
			baseHRef: baseHRef,
			targetSystem: platform ? platform : `browser`,
			scripts: shellScripts,
			app: `shell`,
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				minifyCSS: true,
				minifyJS: true
			},
			inject: `body`
		}));
	}

	// ...
	if (platformJson.app === `widget`) {

		plugins.push(new HtmlWebpackPlugin({
			filename: 'widget.html',
			title: title,
			typeSuffix: type,
			template: Utils.platformPath('./runtime/index.html'),
			baseHRef: baseHRef,
			targetSystem: platform ? platform : `browser`,
			scripts: ``,
			app: `widget`,
			minify: {
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true
			}
		}));
	}

	// ...
	const browserlist = platformJson.application.browserlist
		? `${platformJson.application.browserlist.startsWith(`>`) ? `` : `> `}${platformJson.application.browserlist}, not dead, not ie 11`
		: `> 1%, edge >= 16, not dead, not ie 11`;

	// ...
	if (process.argv.includes(`--out-path`)) {
		outputPath = process.argv[process.argv.indexOf(`--out-path`) + 1];
	}

	// ...
	return merge(
		{
			mode,
			output: {
				path: outputPath,
				filename: '[name].[chunkhash:8].js',
				hashFunction: 'xxhash64'
			},
			optimization: {
				splitChunks: {
					chunks: 'all',
				},
			},
			resolve: {
				modules: [
					Utils.projectPath('./node_modules'), // App modules
					Utils.platformPath('./node_modules'), // Project modules
					Utils.platformPath('./packages/ocwp-core/node_modules'),
					Utils.platformPath('./packages/ocwp-components/node_modules')
				],
				alias: {
					['app']: Utils.projectPath('./src'),
					['platform/components']: path.join(platformWebComponents, './components'),
					['platform/elements']: path.join(platformWebComponents, './elements'),
					['platform/decorators']: path.join(platformWebComponents, './decorators'),
					['platform/elements/types']: path.join(platformWebComponents, './elements/types'),
					['platform/core']: platformWebCore,
					['ocwp-core']: platformWebCore,

					// Legacy
					['platform/Auditer']: path.join(platformWebCore, './Auditer.js'),
					['platform/Configuration']: path.join(platformWebCore, './Configuration.js'),
					['platform/EventAggregator']: path.join(platformWebCore, './EventAggregator.js'),
					['platform/ExecutionContext']: path.join(platformWebCore, './ExecutionContext.js'),
					['platform/HttpClient']: path.join(platformWebCore, './HttpClient.js'),
					['platform/Logger']: path.join(platformWebCore, './Logger.js'),
					['platform/NavigationContext']: path.join(platformWebCore, './NavigationContext.js'),
					['platform/Platform']: path.join(platformWebCore, './Platform.js'),
					['platform/Router']: path.join(platformWebCore, './Router.js'),
					['platform/Security']: path.join(platformWebCore, './Security.js'),
					['platform/SecurityContext']: path.join(platformWebCore, './SecurityContext.js'),
					['platform/Utilities']: path.join(platformWebCore, './Utilities.js'),
					['@cb/platform-web-core']: platformWebCore // Legacy
				},
				extensions: ['.ts', '.js', '.d.ts'],
			},
			resolveLoader: {
				modules: [Utils.platformPath('./node_modules'), Utils.projectPath('./node_modules')],
				extensions: ['.js', '.json'],
				mainFields: ['index', 'loader', 'main']
			},
			module: {
				rules: [
					{
						test: /\.(js|ts)$/,
						exclude: /node_modules\/(?!lit-element)\/(?!lit-html)/,
						loader: 'babel-loader',
						resolve: {
							fullySpecified: false,
						},
						options: {
							plugins: [
								Utils.platformPath('./node_modules/@babel/plugin-syntax-dynamic-import'),

								Utils.platformPath('./node_modules/@babel/plugin-transform-async-to-generator'),
								[
									Utils.platformPath('./node_modules/@babel/plugin-proposal-decorators'),
									{
										'legacy': true
									}
								]
							],
							presets: [
								[
									Utils.platformPath('./node_modules/@babel/preset-env'),
									{
										targets: browserlist
									}
								],
								[
									Utils.platformPath('./node_modules/@babel/preset-typescript'),
									{
										allowNamespaces: true
									}
								]
							]
						}
					}
				]
			},
			// context: path.resolve(process.cwd(), ''),
			devtool: mode === 'production' ? undefined : 'source-map',
			plugins,
			devServer: {
				open: false,
				host: '0.0.0.0',
				stats: 'minimal',
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*',
					'Access-Control-Allow-Methods': '*',
					'X-Content-Type-Options': 'nosniff',
				},
				before: (app, server) => {

					// Setup CSP directives - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
					const cspJson = getCspJson();
					const platformJson = getPlatformJson();

					// Merge each directive
					mergeCsp(cspJson, platformJson.application.csp);

					app.use(csp({
						directives: {
							defaultSrc: cspJson['default-src'],
							scriptSrc: cspJson['script-src'],
							styleSrc: cspJson['style-src'],
							fontSrc: cspJson['font-src'],
							imgSrc: cspJson['img-src'],
							connectSrc: ['localhost:*', '10.0.2.2:*', ...cspJson['connect-src']],
							childSrc: ['localhost:*', '10.0.2.2:*', ...cspJson['child-src']]
						}
					}));

					// Parse application/json
					app.use(express.json());

					// "audit" endpoint of host.
					app.post('/platform/auditer/v1/audit', (req, res) => {
						console.log(`AUDIT [${req.path}]: ${JSON.stringify(req.body)}`);
						res.status(200).send();
					});

					// "log" endpoint of host.
					app.post('/platform/logger/v1/log', (req, res) => {
						console.log(`LOG [${req.path}]: ${JSON.stringify(req.body)}`);
						res.status(200).send();
					});

					// "config" endpoint of host.
					app.get('/platform/config/v1/config/:key', (req, res) => {
						console.log(`CONFIG [${req.path}]:`);
						console.log(JSON.stringify(req.body));
						res.status(200).send(process.env[req.params.key]);
					});

					// "metric single" endpoint of host.
					app.post('/platform/metric/v1/single', (req, res) => {
						console.log(`METRIC SINGLE [${req.path}]:`);
						console.log(JSON.stringify(req.body));
						res.status(200).send();
					});

					// "metric batch" endpoint of host.
					app.post('/platform/metric/v1/batch', (req, res) => {
						console.log(`METRIC BATCH [${req.path}]:`);
						console.log(JSON.stringify(req.body));
						res.status(200).send();
					});

					// "telemetry event" endpoint of host.
					app.post('/platform/telemetry/v1/event', (req, res) => {
						console.log(`TELEMETRY EVENT [${req.path}]: ${JSON.stringify(req.body)}`);
						res.status(200).send();
					})

					// "telemetry start span" endpoint of host.
					app.post('/platform/telemetry/v1/span/start', (req, res) => {
						console.log(`SPAN START [${req.path}]: ${JSON.stringify(req.body)}`);
						res.status(200).send();
					});

					// "telemetry end span" endpoint of host.
					app.post('/platform/telemetry/v1/span/end', (req, res) => {
						console.log(`SPAN END [${req.path}]: ${JSON.stringify(req.body)}`);
						res.status(200).send();
					});
				}
			}
		},
		modeConfig({ mode, presets }),
		await loadPresets({ mode, presets })
	);
};

function getCspJson() {
	return JSON.parse(fs.readFileSync(Utils.platformPath('./runtime/csp.json')));
}

function getPlatformJson() {
	const platformJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/platform.json')));

	mergePlatformJson(platformJson);

	return platformJson;
}

function mergePlatformJson(platformJson) {

	// Platform CLI-based projects support.
	if (fs.existsSync(path.join(process.cwd(), `ProjectManifest.json`))) {

		const projectManifestJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), `/ProjectManifest.json`)));

		if (!platformJson.version) {
			platformJson.version = `2.0.0`;
		}

		platformJson.application.name = projectManifestJson.name;
		platformJson.application.version = projectManifestJson.version;
	}
}

function mergeCsp(cspJson, ...additionalCsp) {

	additionalCsp.forEach(addition => {
		if (addition) {
			for (const directive in addition) {
				if (addition.hasOwnProperty(directive)) {
					if (Array.isArray(addition[directive])) {
						cspJson[directive] = [...(cspJson[directive] || []), ...addition[directive]];
					}
					else {
						cspJson[directive] = [...(cspJson[directive] || []), addition[directive]];
					}

					const index = cspJson[directive].indexOf(`'none'`);
					if (cspJson[directive].length > 1 && index > -1) {
						cspJson[directive].splice(index, 1);
					}
				}
			}
		}
	});
}