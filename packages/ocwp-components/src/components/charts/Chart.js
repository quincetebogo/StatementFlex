/* eslint-disable sort-imports */
// ESLint sort order needs to be disables and the order in which the ChartJS Pluging are imported has a knock on effect.

import {
	ArcElement,
	BarController,
	BarElement,
	BubbleController,
	CategoryScale,
	Chart as ChartJS,
	ChartData,
	ChartOptions,
	ChartType,
	DoughnutController,
	Legend,
	LineController,
	LineElement,
	LinearScale,
	PieController,
	PointElement,
	PolarAreaController,
	RadarController,
	RadialLinearScale,
	ScatterController,
	SubTitle,
	TimeScale,
	Title,
	Tooltip
} from 'chart.js';

import 'chartjs-adapter-luxon';

import { Component, css, html } from '../../elements/index.js';
import CenterTitlePlugin from './plugins/CenterTitle.js';
import NoDataPlugin from './plugins/NoData.js';
import { Utilities } from 'ocwp-core';

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, TimeScale, NoDataPlugin);

/**
 * Control used to show different types of Charts.
 *
 * ```js
 *import 'platform/components/charts/ChartBase;
 * ```
 * 
 * @prop {ChartData} data - Data.
 * @prop {ChartOptions} options - Options.
 * @prop {line|bar|radar|doughnut|polarArea|bubble|pie|scatter|String} type - Type of chart.
 * @prop {String} label - Chart label.
 * @prop {Boolean} loading - Show Loading indicator.
 * @attr {String} sub-label - Chart Sub title.
 * @attr {Number} animation-speed - Sets the animation speed in milliseconds.
 * @attr {top|right|bottom|left|String} legend-position - Sets the legend position.
 * @attr {start|center|end|String} legend-alignment - Sets the legend alignment.
 * @attr {circle|cross|crossRot|dash|line|rect|rectRounded|rectRot|star|triangle|String} legend-style - Sets the legend icon style.
 * @attr {Boolean} hide-legend - Hides the chart legend.
 */
export class Chart extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.

		/**
		 * @type {ChartJS}
		 */
		this.chart = null;

		/**
		 * @type {ChartType}
		 */
		this.type = null;

		/**
		 * @type {ChartData}
		 */
		this.data = null;

		/**
		 * @type {ChartOptions}
		 */
		this.options = null;

		this.label = ``;
		this.subLabel = ``;
		this.animationSpeed = 1000;
		this.loading = false;

		/**
		 * @type {Legend}
		 */
		this.legendPosition = `top`;
		this.legendAlignment = `center`;
		this.legendStyle = `rect`;
		this.hideLegend = false;

		// Set the default private property values.
		this._subscribePropChanges = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * @property {ChartData} data - Data to show on the chart.
	 * @property {ChartOptions} options - Options for the chart.
	 * @property {ChartType} type - Type of chart.
	 * - `line` Line chart
	 * - `bar` Bar chart
	 * - `radar` Radar chart
	 * - `doughnut` Doughnut chart
	 * - `polarArea` PolarArea chart
	 * - `bubble` Bubble chart
	 * - `pie` Pie chart
	 * - `scatter` Scatter chart
	 * @property {String} label - Chart label.
	 * @attribute {String} sub-label - Chart Sub title.
	 * @property {Boolean} [loading] - Show Loading indicator.
	 * @attribute {Number} animation-speed - Sets the animation speed in milliseconds.
	 * @attribute {String} legend-position - Sets the legend position.
	 * - `top` Position legend on top
	 * - `right` Position legend on right
	 * - `bottom` Position legend on bottom
	 * - `left` Position legend on left
	 * @attribute {String} legend-alignment - Sets the legend alignment.
	 * - `start` Align legend at the start
	 * - `center` Align legend in the center
	 * - `end` Align legend at the end
	 * @attribute {String} legend-style - Sets the legend icon style.
	 * - `circle` Circle legend icon
	 * - `cross` Cross legend icon
	 * - `crossRot` CrossRot legend icon
	 * - `dash` Dash legend icon
	 * - `line` Line legend icon
	 * - `rect` Rect legend icon
	 * - `rectRounded` RectRounded legend icon
	 * - `rectRot` RectRot legend icon
	 * - `star` Star legend icon
	 * - `triangle` Triangle legend icon
	 * @attribute {Boolean} hide-legend - Hides the chart legend.
	 * */
	static get properties() {

		return {
			chart: { type: Object, attribute: false },
			data: { type: Object },
			options: { type: Object },
			type: { type: String },
			label: { type: String },
			loading: { type: Boolean },
			subLabel: { type: String, attribute: `sub-label` },
			animationSpeed: { type: Number, attribute: `animation-speed` },
			legendPosition: { type: String, attribute: `legend-position` },
			legendAlignment: { type: String, attribute: `legend-alignment` },
			legendStyle: { type: String, attribute: `legend-style` },
			hideLegend: { type: Boolean, attribute: `hide-legend` }
		};
	}

	set type(value) {
		const oldValue = this._type;

		this._type = value;
		this.requestUpdate(`type`, oldValue);
		this._registerChart();
	}

	get type() {
		return this._type;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	firstUpdated() {
		if (!this.type || this.type === `undefined`) {
			return;
		}

		this._registerChart();

		this._buildChart();

		window.addEventListener(`resize`, () => {
			if (this.chart) {
				this.chart.resize();
			}
		});
	}

	updated() {
		this._buildChart();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Use Proxy to watch object props change
	 * @param {Object} obj - Object to monitor
	 * @returns {Proxy} - Proxy that will monitor changes
	 */
	observe(obj) {
		const that = this;
		const updateChart = that.updateChart;

		return new Proxy(obj, {
			set: (target, prop, val) => {
				target[prop] = val;
				Promise.resolve()
					.then(() => updateChart(that));

				return true;
			}
		});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Manually update chart
	 * @param {ChartBase} self -
	 * @returns {void}
	 */
	updateChart(self) {
		if ((self || this).chart) {
			(self || this).chart.update();
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_registerChart() {

		switch (this.type) {
			case `line`:
				ChartJS.register(LineController, PointElement, LineElement);
				break;
			case `bar`:
				ChartJS.register(BarController, BarElement);
				break;
			case `radar`:
				ChartJS.register(RadarController, RadialLinearScale);
				break;
			case `doughnut`:
				ChartJS.register(DoughnutController, ArcElement, CenterTitlePlugin);
				break;
			case `polarArea`:
				ChartJS.register(PolarAreaController, ArcElement, RadialLinearScale);
				break;
			case `bubble`:
				ChartJS.register(BubbleController);
				break;
			case `pie`:
				ChartJS.register(PieController, ArcElement);
				break;
			case `scatter`:
				ChartJS.register(ScatterController);
				break;
			default:
		}
	}

	_buildChart() {

		if (!this.shadowRoot
			.querySelector(`canvas`)) {
			return;
		}

		/**
		 * @type {ChartData}
		 */
		const data = this.data || { datasets: [] };

		/**
		 * @type {ChartOptions}
		 */
		const options = this.options || {};

		if (!options.onClick) {
			options.onClick = (event, elements, chart) => {
				this.dispatchEvent(new CustomEvent(`element-click`, { detail: { type: event.type, location: { x: event.x, y: event.y }, elements: elements, chart: chart } }));
			};
		}

		// Ensure that chart is responsive an will resize to the component size
		options.responsive = true;

		// Add Loading state to options for use by die NoData plugin
		options.loading = this.loading;

		if (!options.plugins) {
			options.plugins = {};
		}

		switch (this.type) {
			case `polarArea`:
			case `radar`:
				break;
			default:
				options.plugins = { ...options.plugins, radar: false, polarArea: false };
		}

		if (!this.hideLegend) {
			options.plugins.legend = {
				...options.plugins.legend,
				position: this.legendPosition,
				align: this.legendAlignment,
				labels: {
					usePointStyle: true,
					pointStyle: this.legendStyle,
					boxWidth: options.plugins.legend && options.plugins.legend.labels && options.plugins.legend.labels.boxWidth ? options.plugins.legend.labels.boxWidth : 8
				}
			};
		}

		if (Utilities.isString(this.label) && this.label.length > 0) {
			if (!ChartJS.registry.plugins.get(`title`)) {
				ChartJS.register(Title);
			}
		} else {
			ChartJS.unregister(Title);
		}

		if (Utilities.isString(this.subLabel) && this.subLabel.length > 0) {
			if (!ChartJS.registry.plugins.get(`subtitle`)) {
				ChartJS.register(SubTitle);
			}
		} else {
			ChartJS.unregister(SubTitle);
		}

		if (this.label) {
			if (this.type === `doughnut`) {
				options.plugins.centerTitle = { display: true, text: this.label, position: `top` };
			} else {
				options.plugins.title = { display: true, text: this.label, position: `top` };
			}
		}

		if (this.subLabel) {
			options.plugins.subtitle = {
				display: true,
				text: this.subLabel,
				padding: { bottom: 15 }
			};
		}

		if (options.animation) {
			options.animation.duration = this.animationSpeed;
		} else {
			options.animation = { duration: this.animationSpeed };
		}

		if (this.chart && this.chart.type !== this.type) {
			this.chart.destroy();
			const ctx = this.shadowRoot
				.querySelector(`canvas`)
				.getContext(`2d`);
			this.chart = new ChartJS(ctx, {
				type: this.type,
				data: data,
				options: options
			});
		}

		if (!this.chart) {
			const ctx = this.shadowRoot
				.querySelector(`canvas`)
				.getContext(`2d`);
			this.chart = new ChartJS(ctx, {
				type: this.type,
				data: data,
				options: options
			});
		} else {
			this.chart.type = this.type;
			this.chart.data = data;
			this.chart.options = options;
			this.chart.update();
		}

		// Observer changes to Data properties
		this.chart.data = this.observe(this.chart.data);
		// Observer changes to 1st level Data properties
		for (const prop of Object.keys(this.chart.data)) {
			this.chart.data[prop] = this.observe(this.chart.data[prop]);
		}

		// Observer changes to Datasets properties
		this.chart.data.datasets = this.chart.data.datasets.map((dataset) => {
			dataset.data = this.observe(dataset.data);

			return this.observe(dataset);
		});
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					background-color: var(--theme-chart-background-color, #FFFFFF);
				}

				.chart-size {
					position: relative;
				}
				canvas {
					width: 400px;
					height: 400px;

					max-width:  var(--theme-chart-max-width, unset);
					max-height: var(--theme-chart-max-height, unset);
				}
				.loading.overlay {
					display: flex;

					justify-content: center;
					align-items: center;
					
					background-color: var(--theme-chart-loading-overlay-background-color, #FFFFFFA6);

					z-index: 1;
				}
				.loading > .indicator {
					width: var(--theme-chart-loading-indicatory-width, 68px);
					height: var(--theme-chart-loading-indicatory-height, 14px);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		if (!this.type) {
			return html`
				<capitec-label label="Chart type not set" type="title"></capitec-label><
			`;
		}

		return html`
			<div class="chart-size">
				<capitec-group layout="grid" halign="center" valign="center" columns="auto">
					${this.loading ? html`
						<div class="loading overlay" column="1" row="1">
							<img class="loader" src="platform/icons/loader.svg">
						</div>
					` : null}
					<canvas id=${this.id} column="1" row="1"></canvas>
				</capitec-group>
			</div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}
}

window.customElements.define(`capitec-chart`, Chart);

/**
 * @typedef {Object} ChartBase~ClickLocation
 * @property {Number} x - X point
 * @property {Number} y - Y point
 */
/**
 * When the chart is clicked.
 *
 * @example
 * <capitec-chart ... @element-click="${this._handler}"></capitec-chart>
 *
 * @event ChartBase#element-click
 * @type {Object}
 * @property {Object} detail - Contains click details
 * @property {ChartBase~ClickLocation} detail.location - The menu item label
 * @property {Object[]} detail.elements - The clicked elements
 * @property {ChartJS} detail.chart - The chart element
 */