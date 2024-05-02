import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

const CARD_TYPE_MAPPING = {
	DEBIT_MASTERCARD: `Debit`,
	MASTERCARD_CREDIT: `Credit`,
	DEBIT_MASTERCARD_VIRTUAL: `Debit`
};

/**
 *
 * @export
 * @class ConfirmCardSettings
 * @extends {Component}
 */

export class ConfirmCardSettings extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

	}

	// ---------------
	// PROPERTIES
	// ---------------

	/**
	 * @property {Object} cards Object contains the list of client's cards
	 */
	static get properties() {
		return {
			deactivateCardsList: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

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
					left: -477px;
					top: -11px;
					--theme-modal-header-height: 64px;
				}

				div[slot="header"] > span {
					padding-left: 15px;
				}

				capitec-content-box {
					height: 450px;
					width: 500px;
					border-bottom: 1px solid #E1E1E1;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 21px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}

				capitec-label {
					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 28px;
				}

				capitec-content-box > p {
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

				horizon-product-tile {
					border-radius: 4px;
					border-left: 4px solid #009DE0;
					--theme-product-tile-border-radius: 0px 4px 4px 0px;
				}

				#id-cancel-button {
					width : 96px;
				}

				#id-confirm-button {
					width: 103px;
				}
				.card-details {
					border: 1px solid rgb(225, 225, 225);
					border-radius: 4px;
					padding: 0px 16px;
					border-left: 4px solid #E61414;
				}
				horizon-label {
					--horizon-label-text-font-size: 14px;
					--horizon-label-value-font-size: 16px;
					padding: 8px 0px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-color: #3A3A3A;
				}
				.card-label {
					width: 202px;
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
							<capitec-label label="Confirm deactivation"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box>
						<p>Are you sure you want to turn off online and international purchases on</p>
						${this.deactivateCardsList.map(card => this._renderCardsList(card))}
						<p>This will stop your online shopping, scan to pay transaction and international transactions.</p>
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderCardsList(card) {
		return html`
			<capitec-group
				class="card-details"
				valign="center"
				halign="left"
				gap="clear"
				layout="horizontal">
				<horizon-label
					class="card-label"
					label="${CARD_TYPE_MAPPING[card.cardType]} card"
					value="${card.maskedCardNumber}">
				</horizon-label>
				<horizon-label
					label="Friendly name"
					value="${card.cardFriendlyName}">
				</horizon-label>
			</capitec-group>`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
						data-automation-id="discard-changes-cancel"
						id="id-cancel-button"
						label="Cancel" 
						@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button 
						data-automation-id="discard-changes-discard"
						id="id-confirm-button" 
						type="primary" 
						label="Confirm" 
						@click="${() => this._onConfirmClick()}">
				</capitec-button>
			</capitec-group>
		
			`;
	}
}
window.customElements.define(`horizon-confirm-card-settings-dialog`, ConfirmCardSettings);