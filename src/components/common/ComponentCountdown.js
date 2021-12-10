import { Component, css, html } from 'platform/elements';

/**
 * The Horizon Component Countdown is the circular progress time indicator.
 * 
 * ```html
 * <horizon-countdown>
 * </horizon-countdown>
 * ```
 * 
 * @export
 * @class ComponentCountdown
 * @extends {Component}
 */
export class ComponentCountdown extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		this.FULL_DASH_ARRAY = 283;
		this.timeLimit = 70;
		this.warningThreshold = 25;
		this.alertThreshold = 10;

		this.COLOR_CODES = {
			info: {
				color: `info`
			},
			warning: {
				color: `warning`
			},
			alert: {
				color: `alert`
			}
		};

		this.width = 150;
		this.height = 150;
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
	 
	 * @property {String} width - Width of the countdown timer.
	 * @property {String} height - Height of the countdown timer.
	 * @property {Number} timeLimit - Time limit in seconds.
	 * @property {Number} warningthreshold - Time when warning colors is shown in seconds.
	 * @property {Number} alertthreshold - Time when alert colors is shown in seconds
	 * 
	 * @readonly
	 * @static
	 * @memberof ComponentCountdown
	 */
	static get properties() {

		return {
			width: { type: String },
			height: { type: String },
			timeLimit: { type: Number, attribute: `time-limit` },
			warningThreshold: { type: Number, attribute: `warning-threshold` },
			alertThreshold: { type: Number, attribute: `alert-threshold` },
			tickCallback: { type: Object },

			circleDasharray: { state: true },
			timeLeft: { state: true }
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
			
			if (this.tickCallback) {
				this.tickCallback(this.timeLeft);
			}

			if (this.timeLeft === 0) {
				this.onTimesUp();
			}
		}, 1000);
	}

	// TODO: TEST the Reset function to put timer back to 60/70
	// TEST: "Try Again" button will implement this functionality 
	resetTimer() {
		clearInterval(this.timerInterval);
		
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
		const minutes = `0${Math.floor(time / 60)}`;
		let seconds = time % 60;

		if (seconds < 10) {
			seconds = `0${seconds}`;
		}

		return `${minutes}:${seconds}`;
	}

	setRemainingPathColor(timeLeft) {
		const { alert, warning } = this.COLOR_CODES;

		if (timeLeft <= this.alertThreshold) {
			this.remainingPathColor = alert.color;
		} else if (timeLeft <= this.warningThreshold) {
			this.remainingPathColor = warning.color;
		}
	}

	calculateTimeFraction() {
		const rawTimeFraction = this.timeLeft / this.timeLimit;

		return rawTimeFraction - ((1 / this.timeLimit) * (1 - rawTimeFraction));
	}

	setCircleDasharray() {
		this.circleDasharray = `${(this.calculateTimeFraction() * this.FULL_DASH_ARRAY).toFixed(0)} 283`;
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
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
					stroke-width: 5px;
					opacity: 0.2;
				}

				.path-remaining {
					stroke-width: 5px;
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
						<circle 
							class="path-elapsed ${this.remainingPathColor}" 
							cx="50" cy="50" r="45">
						</circle>
						<path
							id="base-timer-path-remaining"
							stroke-dasharray="${this.circleDasharray}"
							class="path-remaining ${this.remainingPathColor}"
							d="
							M 50, 50
							m -45, 0
							a 45,45 0 1,0 90,0
							a 45,45 0 1,0 -90,0
							">
						</path>
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