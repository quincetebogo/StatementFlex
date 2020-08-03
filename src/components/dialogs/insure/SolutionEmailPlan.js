import { Component, html, css } from 'platform/elements';
import '../../Common/HorizonSolutionDialog';

export class EmailPlan extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDetails = {
			solutionHeader: "Solution - Email plan",
			radioButtonsAvailable: [
				{ "key": "0", "value": "Email sent" },
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
					--horizon-feedback-label-margin-top: 24px;
					--horizon-radio-button-container-margin-bottom: 41px;
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
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px 0px 0px 12px;
				}

				.navigate-label {
					height: 24px;
					padding: 0px 0px 0px 34px;
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

		`];
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
				
					<p class="navigate-info-label">Navigate to ......</p>
					<li class="navigate-bullet-label"> Retrieve the relevant policy document from CDS using the client's ID number or Policy </li>
					<p class="navigate-label"> number </p>
					<li class="navigate-bullet-label"> Send the document from STRACK to the client's email address. </li>
				
			</horizon-solution-dialog>
		
			`;
	}

}

window.customElements.define(`horizon-email-plan`, EmailPlan)