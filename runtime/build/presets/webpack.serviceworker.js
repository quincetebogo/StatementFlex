import WorkboxPlugin from 'workbox-webpack-plugin';
import path from 'path';

export default () => ({
	plugins: [
		new WorkboxPlugin.InjectManifest({
			swSrc: path.join(process.cwd(), `/src/sw.js`)
		})
	]
});