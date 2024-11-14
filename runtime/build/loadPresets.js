import { merge } from 'webpack-merge';

export default async (env = { presets: [] }) => {

	const presets = env.presets || [];

	const mergedPresets = [].concat(...[presets]);

	const mergedConfigs = await Promise.all(mergedPresets.map(async presetName => (await import(new URL(`./presets/webpack.${presetName}.js`, import.meta.url))).default(env)));

	return merge({}, ...mergedConfigs);
};