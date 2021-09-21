import { Component, css, html } from 'platform/elements';

/**
 * Description for your Component here.
 *
 * ```html
 * <horizon-countdown>
 * </horizon-countdown>
 * ```
 * @prop {String} width - Width of the countdown timer.
 * @prop {String} height - Height of the countdown timer.
 * @attr {Number} time-limit - Time limit in seconds.
 * @attr {Number} warning-threshold - Time when warning colors is shown in seconds.
 * @attr {Number} alert-threshold - Time when alert colors is shown in seconds
 */
export class ComponentCountdown extends Component {

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

		this.FULL_DASH_ARRAY = 283;
		this.timeLimit = 60;
		this.warningThreshold = 25;
		this.alertThreshold = 10;

		this.COLOR_CODES = {
			info: {
				color: `info`
			},
			warning: {
				color: `warning`,
				threshold: this.warningThreshold
			},
			alert: {
				color: `alert`,
				threshold: this.alertThreshold
			}
		};

		this.width = 200;
		this.height = 200;
		this.circleDasharray = `283`;
		this.timePassed = 0;
		this.timeLeft = this.timeLimit;
		this.timerInterval = null;
		this.remainingPathColor = this.COLOR_CODES.info.color;
		this.startTimer();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 */
	static get properties() {

		return {
			width: { type: String },
			height: { type: String },
			circleDasharray: { type: String, attribute: false },
			remainingPathColor: { type: String, attribute: false },
			timeLeft: { type: String, attribute: false },
			timeLimit: { type: String, attribute: `time-limit` },
			warningThreshold: { type: String, attribute: `warning-threshold` },
			alertThreshold: { type: String, attribute: `alert-threshold` }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	disconnectedCallback() {

		clearInterval(this.timerInterval);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	onTimesUp() {
		clearInterval(this.timerInterval);
		this.dispatchEvent(new CustomEvent(`time-expired`, {
			detail: {}
		}));
	}

	startTimer() {
		this.timerInterval = setInterval(() => {
			this.timePassed += 1;
			this.timeLeft = this.timeLimit - this.timePassed;
			this.setCircleDasharray();
			this.setRemainingPathColor(this.timeLeft);

			if (this.timeLeft === 0) {
				this.onTimesUp();
			}
			this.requestUpdate();
		}, 1000);
	}

	formatTime(time) {
		const minutes = Math.floor(time / 60);
		let seconds = time % 60;

		if (seconds < 10) {
			seconds = `0${seconds}`;
		}

		return `${minutes}:${seconds}`;
	}

	setRemainingPathColor(timeLeft) {
		const { alert, warning } = this.COLOR_CODES;

		if (timeLeft <= alert.threshold) {
			this.remainingPathColor = alert.color;
		} else if (timeLeft <= warning.threshold) {
			this.remainingPathColor = warning.color;
		}
	}

	calculateTimeFraction() {
		const rawTimeFraction = this.timeLeft / this.timeLimit;

		return rawTimeFraction - ((1 / this.timeLimit) * (1 - rawTimeFraction));
	}

	setCircleDasharray() {
		this.circleDasharray = `${(this.calculateTimeFraction() * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
		this.requestUpdate(`circleDasharray`);
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
				.base-timer {
					position: relative;
					width: 200px;
					height: 200px;
				}

				.svg {
					transform: scaleX(-1);
				}

				.circle {
					fill: none;
					stroke: none;
				}

				.path-elapsed {
					stroke-width: 7px;
					opacity: 0.2;
				}

				.path-remaining {
					stroke-width: 7px;
					stroke-linecap: round;
					transform: rotate(90deg);
					transform-origin: center;
					transition: 1s linear all;
					fill-rule: nonzero;
					stroke: currentColor;
				}

				.info {
					color: #08A6B5;
					stroke: #08A6B5;
					transition: 1s linear all;
				}

				.warning {
					color: #D4781C;
					stroke: #D4781C;
					transition: 1s linear all;
				}

				.alert {
					color: #A5132A;
					stroke: #A5132A;
					transition: 1s linear all;
				}

				.label {
					position: absolute;
					width: 200px;
					height: 200px;
					top: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24px;
					color: #3A3A3A;
					font-weight: bold;
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
		const style = `width:${this.width}px; height:${this.height}px`;

		return html`
			<div class="base-timer" style=${style}>
				<svg class="svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<g class="circle">
						<circle class="path-elapsed ${this.remainingPathColor}" cx="50" cy="50" r="45"></circle>
						<path
							id="base-timer-path-remaining"
							stroke-dasharray="${this.circleDasharray}"
							class="path-remaining ${this.remainingPathColor}"
							d="
							M 50, 50
							m -45, 0
							a 45,45 0 1,0 90,0
							a 45,45 0 1,0 -90,0
							"
						></path>
					</g>
				</svg>
				<span id="base-timer-label" class="label ${this.remainingPathColor}" style=${style}>${this.formatTime(this.timeLeft)}</span>
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

window.customElements.define(`horizon-countdown`, ComponentCountdown);