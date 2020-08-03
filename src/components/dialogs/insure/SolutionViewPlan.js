import { Component, html, css } from 'platform/elements';
import '../../Common/HorizonSolutionDialog';

export class ViewPlan extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDetails = {
			solutionHeader: "Solution - View plan",
			radioButtonsAvailable: [
				{ "key": "0", "value": "Informed client about their Capitec Funeral Plan" },
				{ "key": "1", "value": "System error - assign now" }
			],
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			solutionDetails: { type: Object }
		}
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
		this.dispatchEvent(new CustomEvent('close-solution', {}));
	}

	_onDoneClick() {
		this.dispatchEvent(new CustomEvent('solution-provided', {}));
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
					--horizon-feedback-label-margin-top: 17px;
					--horizon-radio-button-container-margin-bottom: 156px;
				}
			
				.navigate-info-label {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 0px 0px 14px 0px;
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
				<li class="navigate-bullet-label"> Choose the Insure tab </li>
				<li class="navigate-bullet-label"> Choose the relevant funeral plan </li>
				<li class="navigate-bullet-label"> Choose plan details </li>

			</horizon-solution-dialog>
		`;
	}
}

window.customElements.define(`horizon-view-plan`, ViewPlan)