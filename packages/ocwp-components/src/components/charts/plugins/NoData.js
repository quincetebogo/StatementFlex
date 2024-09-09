/* eslint-disable func-names */
import { Chart, ChartOptions, EmptyObject, Plugin } from 'chart.js';

/**
 * @type {Plugin}
 */
const NoDataPlugin = {
	id: `noData`,

	/**
	 * @desc Called after the `chart` has been drawn. Note that this hook will not be called
	 * if the drawing has been previously cancelled.
	 * @param {Chart} chart - The chart instance.
	 * @param {EmptyObject} args - The call arguments.
	 * @param {ChartOptions} options - The plugin options.
	 * @returns {void}
	 */
	afterDraw: (chart, args, options) => {
		if (!chart?.options?.loading && (!chart.data || chart.data?.datasets?.length === 0)) {
			// No data is present
			const ctx = chart.ctx;
			const width = chart.width;
			const height = chart.height;

			ctx.save();
			ctx.textAlign = `center`;
			ctx.textBaseline = `middle`;
			ctx.font = `18px normal 'Hind Vadodara'`;
			ctx.fillText(`No data to display`, width / 2, height / 2);
			ctx.restore();
		}
	}
};

export default NoDataPlugin;