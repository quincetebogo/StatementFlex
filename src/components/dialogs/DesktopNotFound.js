import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

export class DesktopAgentNotFound extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onTryAgain() {

	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			// .contaner .onboard {
			// 	width: 632px;
			// 	height: 494px;
			// }
			#error-label {
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				line-height: 32px;
			}
			
			#error-message {
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				letter-spacing: 0;
				line-height: 24px;
				text-align: center;
				display: block;
				margin-left: 0px;
				margin-right: 0px ;
				padding-top: 24px;
				padding-bottom: 24px;
			}

			#try-again-button {
				padding-bottom: 24px;
			}
			div[slot="body"] {
				background-color: #FFFFFF;
			}
		
			.image {
				padding-top: 30px
			}
		`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		<capitec-modal type="onboard">
			<div class="modal-container" slot="body">
				${this._renderErrorMessage()}
			</div>
		</capitec-modal>
		`;
	}

	_renderErrorMessage() {
		return html`
		<img class="image" src="../images/error.svg" alt="" />
		<capitec-label id="error-label" label="Error 404" type="strong"></capitec-label>
		<capitec-label id="error-message" label="There seems to be an issue please be patient"></capitec-label>
		<capitec-button id="try-again-button" type="primary" label="Try Again"></capitec-button>
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-error-modal`, DesktopAgentNotFound);