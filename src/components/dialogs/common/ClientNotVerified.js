import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'app/components/dialogs/common/verifyCaller/VerifyCaller';

/**
 * A warning dialog that indicates that the client is not verified and offers the user
 * the opportunity to invoke the verification process.
 *
 * @export
 * @class ClientNotVerified
 * @extends {Component}
 */

export class ClientNotVerified extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {
			detail: {}
		}));
	}

	_onVerifyNowClick() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {
			detail: {}
		}));
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
					height: 326px;
					width: 375px;
					border-radius: 5px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 8px 13px 10px 0px;
				}
			
				div[slot="header"] {
					--theme-modal-header-height: 64px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -352px;
					top: -12px;
				}

				div[slot="header"] > span {
					padding-left: 15px;
				}

				capitec-content-box {
					height: 190px;
					border-bottom: 1px solid #E1E1E1;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}

				capitec-label {
					padding-left: 8px;
					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 24px;
				}

				capitec-content-box > p {
					height: 96px;
					width: 343px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					margin: 0px;
				}

				.status-icon {
					height: var(--theme-icon-size-default,24px);
					width: 24px;
					margin-right: 0px;
				}

				#id-cancel-button {
					width : 98px;
				}

				#id-verify-button {
					width : 127px;
					--theme-button-primary-border-width: 0px;
				}

				capitec-button {
					height: 48px;
					border-radius: 5px;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}`
		];
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
							<capitec-label label="Client Not Verified"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box>
						<p>In order to process the transaction, you need to be verified. <br /> <br /> Do you want to continue?</p>
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
						id="id-cancel-button" 
						label="Cancel" 
						@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button 
						id="id-verify-button" 
						type="primary" 
						label="Verify Now" 
						@click="${() => this._onVerifyNowClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

}

window.customElements.define(`horizon-client-not-verified`, ClientNotVerified);