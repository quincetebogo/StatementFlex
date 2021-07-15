import { Component, css, html } from 'platform/elements';
import { ValueAddedService } from 'app/services/ValueAddedService';

/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServiceUnavailable
 * @extends {Component}
 */

export class ValueAddedServiceUnavailable extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -----------
	// PROPERTIES
	// -----------

	static get properties() {
		return {}
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

	_accept() {
		this.dispatchEvent(new CustomEvent(`accept-unavailable`, {}));
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
				capitec-modal {
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;
				}

				capitec-alert-banner[type="warning"] {
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 9px;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-alert-banner-height: 48px;
				}

				.main-container {
					height: auto;
					width: 808px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-top: 15px;
					--theme-container-padding-right: 17px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-layout-gap-spacing: 16px;
				}

				.unavailable-alert {
					width: 712px;
				}

				.unavailable-content-box {
					height: 64px;
					padding: 0px;
					margin-bottom: 10px;
				}

				.unavailable-content-label {
					margin: 0px;
					font-size: 15px;
				}

				.unavailable-content-email-label {
					margin: 0px;
					font-size: 15px;
					color: #009EE6;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Value Added Services">
				<div slot="body">
					<capitec-content-box class="main-container">
						${this._renderUnavailableAlertBanner()}
						${this._renderUnavailableContent()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderUnavailableAlertBanner() {
		return html`
			<capitec-alert-banner type="warning">
				<p class="unavailable-alert"><strong>Notify:</strong> Value added services for this client is currently unavailable.</p>
			</capitec-alert-banner>
		`;
	}

	_renderUnavailableContent() {
		return html`
			<capitec-content-box class="unavailable-content-box">

				<capitec-label 
						class="unavailable-content-label"
						label="Please email the client’s request to update Value Added Services to the following mailbox">
				</capitec-label>
				<capitec-label 
						class="unavailable-content-email-label"
						label="DLClientProfileSupport@capitecbank.co.za">
				</capitec-label>

			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					type="primary" 
					label="Accept"
					@click="${() => this._accept()}">
				</capitec-button>

			</capitec-group>
		`;
	}

}

window.customElements.define(`horizon-value-added-services-unavailable`, ValueAddedServiceUnavailable);