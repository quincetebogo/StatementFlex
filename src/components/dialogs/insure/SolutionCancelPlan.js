import { Component, css, html } from 'platform/elements';
import '../../common/HorizonSolutionDialog';

export class SolutionCancelPlan extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDetails = {
			solutionHeader: `Solution - Cancel Plan`,
			radioButtonsAvailable: [
				{ "key": `0`, "value": `Funeral Plan has been canceled` },
				{ "key": `1`, "value": `System error - assign now` }
			]
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			solutionDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-solution`, {}));
	}

	_onDoneClick() {
		this.dispatchEvent(new CustomEvent(`solution-provided`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.solution-modal{
					--horizon-solution-modal-height: auto;
					--horizon-solution-modal-width: 694px;
					--horizon-feedback-label-margin-top: 24px;
					--horizon-radio-button-container-margin-bottom: 40px;
				}
			
				.navigate-info-label {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 0px 0px 11px 0px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 534px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
					padding-left: 12px;
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-solution-dialog
				class="solution-modal"
				.solutionDetails="${this.solutionDetails}"
				@on-cancel = "${() => this._onCancelClick()}"
				@on-done = "${() => this._onDoneClick()}">

				<p class="navigate-info-label"> Navigate to <b>SBL T62053</b> (Landing Page) </p>
				<li class="navigate-bullet-label"> Enter valid client details. </li>
				<li class="navigate-bullet-label"> Choose Insure tab. </li>
				<li class="navigate-bullet-label"> Click cancel policy </li>
				<li class="navigate-bullet-label"> Choose Cancellation Reason and Transmit </li>

			</horizon-solution-dialog>
		`;
	}
}

window.customElements.define(`horizon-cancel-plan`, SolutionCancelPlan);