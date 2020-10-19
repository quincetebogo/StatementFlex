import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';
import 'app/components/dialogs/insure/VerifyCaller';

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
					width: 375;
					border-radius: 5px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 7px 16px 17px 16px;
				}
			
				div[slot="header"] {
					width: 375px;
					--theme-modal-header-height: 64px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -352px;
					top: -15px;
				}

				div[slot="header"] > span {
					height: 24px;
					width: 300px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 15px;
				}

				div[slot="body"] {
					width: 375px;
					height: 198px;
				}

				.body-box {
					height: 198px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 17px;
				}

				.header-text {
					padding-left: 8px;
					height: 24px;
					width: auto;
					color: #D4781C;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				.body-details{
						height: 96px;
						width: 343px;
						color: #4E6066;
						font-family: "Hind Vadodara";
						font-size: 15px;
						font-weight: 500;
						letter-spacing: 0;
						line-height: 24px;
				}

				.status-icon {
					height: var(--theme-icon-size-default,24px);
					width: 24px;
					margin-right: 0px;
				}

				#id-cancel-button {
					width : 98px;
					--theme-button-clear-border-width: 0px;
					
				}

				#id-verify-button {
					width : 127px;
					--theme-button-primary-border-width: 0px;
				}

				capitec-button {
					height: 48px;
					border-radius: 5px;
					--theme-button-height: 20px;
					--theme-button-width: 41px;
					--theme-button-color: #FFFFFF;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-letter-spacing: 0;
					--theme-button-line-height: 20px;
					--theme-button-text-align: center;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 22px;
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
							<capitec-label class="header-text" label="Client Not Verified"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderDetails() {
		return html`
<capitec-label class="body-details" label="In order to process the transaction, you need to be verified.

Do you want to continue?">
</capitec-label>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button id="id-cancel-button" type="clear" label="Cancel" @click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button id="id-verify-button" type="primary" label="Verify Now" @click="${() => this._onVerifyNowClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

}

window.customElements.define(`horizon-client-not-verified`, ClientNotVerified);