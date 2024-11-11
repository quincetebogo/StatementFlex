import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

export default () => ({
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [`style-loader`, `css-loader`]
			}
		]
	},
	plugins: [
		// Copy empty ServiceWorker so install doesn't blow up
		new CopyWebpackPlugin({
			patterns: [path.join(process.cwd(), `/src/sw.js`)]
		})
	],
	devtool: `source-map`
});