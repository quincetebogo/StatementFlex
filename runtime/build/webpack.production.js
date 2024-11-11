import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default () => ({
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, `css-loader`]
			}
		]
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				extractComments: false,
				terserOptions: {
					output: {
						comments: false
					}
				}
			})
		]
	},
	plugins: [new MiniCssExtractPlugin()]
});