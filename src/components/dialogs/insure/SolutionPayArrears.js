import { Component, css, html } from 'platform/elements';
import '../../common/HorizonSolutionDialog';
export class PayArrears extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.solutionDetails = {
			solutionHeader: `Solution - Pay Arrears`,
			radioButtonsAvailable: [
				{ "key": `0`, "value": `Payment has been made` },
				{ "key": `1`, "value": `System error - assign now` },
				{ "key": `2`, "value": `Client has informed that they are not in arrear - assign now` }
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
					--horizon-feedback-label-margin-top: 20px;
					--horizon-radio-button-container-margin-bottom: 52px;
				}

				.navigate-info-label {
					height: 26px;
					width: 553px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					line-height: 24px;
					color: #545D60;
					letter-spacing: 0;
					margin: 0px 0px 11px 0px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 623px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					line-height: 24px;
					color: #545D60;
					margin: 0px 0px 0px 14px;
				}

				.navigate-label {
					height: 24px;
					padding: 0px 0px 0px 36px;
					width: 622px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
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

				<p class="navigate-info-label">Navigate to <b> SBL T62053 </b> (Landing page) </p>
				<li class="navigate-bullet-label"> Enter valid client details. Verify client </li>
				<li class="navigate-bullet-label"> Choose Insure tab </li>
				<li class="navigate-bullet-label"> Pay Outstanding Amount </li>
				<li class="navigate-bullet-label"> This option can be used if the client missed a payment and reflects in arrears. </li>
				<li class="navigate-bullet-label"> Choose the account the client wants to make the outstanding payment from then transmit to </li>
				<p class="navigate-label"> complete the payment. </p>
				<li class="navigate-bullet-label"> Click transmit </li>

			</horizon-solution-dialog>
		`;
	}

}

window.customElements.define(`horizon-pay-arrears`, PayArrears);