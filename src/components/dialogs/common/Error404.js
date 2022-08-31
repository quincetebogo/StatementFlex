import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

/**
 * A 404 error dialgo that Horizon can display when a resource/service cannot be found
 *
 * @export
 * @class Error404
 * @extends {Component}
 */
export class Error404 extends Component {
	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_onTryAgain() {
		console.log(`dispatch new event`);
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
		}));
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
			
			#error-label {
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				line-height: 32px;
				text-align: center;
				display: block;
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
				align-items: center;
				display: inline-block;
				// -ms-transform: translateX(50%);
				transform: translateX(135%);
			}
			div[slot="body"] {
				background-color: #FFFFFF;
			}
		
			.image {
				padding-top: 30px;
				align-items: center;
				display: inline-flex;
				transform: translateX(50%);
			}
		`
];
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
		<img class="image" src="/images/common/error.svg" alt="" />
		<capitec-label id="error-label" label="Error 404" type="strong"></capitec-label>
		<capitec-label id="error-message" label="There seems to be an issue please be patient"></capitec-label>
		<capitec-button id="try-again-button" type="primary" label="Try Again" @click="${() => this._onTryAgain()}">
		</capitec-button>
		`;
	}
}
window.customElements.define(`horizon-error-404`, Error404);