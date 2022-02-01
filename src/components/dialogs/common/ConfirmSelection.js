import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

/**
 * A warning dialog that prompts the agent to confirm if the changes made should be discarded
 *
 * @export
 * @class DiscardChanges
 * @extends {Component}
 */

export class ConfirmSelection extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_onConfirmClick() {
		this.dispatchEvent(new CustomEvent(`on-confirm`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: 326px;
					width: 376px;
					border-radius: 4px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
				}

				div[slot="header"] {
					width: 376px;
					height: auto;
					position: absolute;
					display: flex;
					align-items: center;
					left: -350px;
					top: -11px;
					--theme-modal-header-height: 64px;
				}

				div[slot="header"] > span {
					padding-left: 15px;
				}

				capitec-content-box {
					height: 198px;
					border-bottom: 1px solid #E1E1E1;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 21px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}

				capitec-label {
					padding-left: 16px;
					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 24px;
				}

				capitec-content-box > p {
					height: 160px;
					width: 344px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 500;
					margin: 0px;
				}

				.status-icon {
					height: var(--theme-icon-size-default,24px);
					width: 24px;
					margin-right: 0px;
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
					--theme-button-padding-top: 10px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 10px;
					--theme-button-padding-left: 22px;
				}

				#id-cancel-button {
					width : 96px;
				}

				#id-continue-button {
					width: 103px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
							<capitec-label label="Please Note"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box>
						<p>You have active temporary limits. Updating your permanent limits will replace your temporary limits. Are you sure you want to continue?</p>
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
						data-automation-id="confirm-selection-cancel"
						id="id-cancel-button"
						label="Cancel" 
						@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button 
						data-automation-id="confirm-selection-continue"
						id="id-continue-button" 
						type="primary" 
						label="Continue" 
						@click="${() => this._onConfirmClick()}">
				</capitec-button>
			</capitec-group>
		
			`;
	}
}
window.customElements.define(`horizon-confirm-selection`, ConfirmSelection);