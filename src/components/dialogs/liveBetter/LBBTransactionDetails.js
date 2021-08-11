import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import 'platform/components/popups/Modal';

/**
 * A dialog to show linked transaction details 
 *
 * @export
 * @class LinkedTransactionDetails
 * @extends {Component}
 */

export class LinkedTransactionDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.transactionDetails = {
			category: "Restaurant",
			transactionType: "Card purchase",
			amount: "R245.91",
			fromAccount: "Savings account",
			transactionDate: "16 Jun 2021",
			postingDate: "16 Jun 2021",
			description: "Card purchase Jon Dori's",
			longDescription: "Card purchase Jon Dori's Somerset West"
		}

		this._telemetry = HorizonTelemetry.instance;
	}

	connectedCallback() {
		super.connectedCallback();
		// Telemetry
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		// Telemetry
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	
	_onCloseClick() {
		this.dispatchEvent(new CustomEvent(`close`, {
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
				capitec-modal {
					height: 581px;
					--theme-modal-free-max-width: 572px;
					--theme-modal-body-box-shadow: 0px;

					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-background-color: #009de0;

					--theme-modal-footer-padding: 0px 0px 0px 0px;
				}

				/* Styles to display background color of header as a gradient*/
				.header-gradient {
					height: 64px;
					width: 572px;
					border-radius: 4px 4px 0px 0px;
					position: absolute;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					left: -551px;
					top: -42px;
				}

				.header-gradient > capitec-label {
					line-height: 64px;
					padding-left: 16px;
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #ffffff;
					letter-spacing: 0;
					--theme-label-font-family: Hind Vadodara SemiBold;
				}

				/* Transaction details Styles */
				.details-vertical {
					width: 572px;
					height: 453px;
					padding: 8px 16px 16px 0px;
				}

				.details-horizontal {
					margin-Top: 9px;
				}

				horizon-label {
					height: 56px;
					padding: 12px 16px 10px;

					--horizon-label-text-height: 12px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-color: #3A3A3A;

					--horizon-label-value-margin-top: 2px;
				}

				.col-1 {
					width: 185px;
				}

				.col-2 {
					width: 134px;
				}

				/* Footer */
				div[slot="footer"] {
					width: 572px;
					border-top: 1px solid #E1E1E1;
					padding: 7px 16px 8px 0px;
				}

				capitec-button {
					height: 48px;
					width: 87px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal 
				type="free" 
				data-automation-id="linked-transaction-details">
					<div slot="header">
						<capitec-group class="header-gradient">
							<capitec-label label="Transaction Details"></capitec-label>
						</capitec-group>
					</div>
					<div slot="body">
						 ${this._renderDetails()}
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
		</capitec-modal>
		`;
	}

	_renderDetails() {
		return html`
		<capitec-group 
			class="details-vertical" 
			layout="vertical" 
			gap="none" 
			halign="left" 
			valign="top">
				<capitec-group 
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<horizon-label 
							data-automation-id="linked-transaction-details-category"
							class="col-1" 
							label="Category" 
							value="${this.transactionDetails.category}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal" 
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-transaction-type"
							class="col-1" 
							label="Transaction type" 
							value="${this.transactionDetails.transactionType}">
						</horizon-label>	
						<horizon-label 
							data-automation-id="linked-transaction-details-amount"
							class="col-2" 
							label="Amount" 
							value="${this.transactionDetails.amount}">
						</horizon-label>
						<horizon-label 
							data-automation-id="linked-transaction-details-from-account"
							label="From account" 
							value="${this.transactionDetails.fromAccount}">
						</horizon-label>			
				</capitec-group>

				<capitec-group 
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-transaction-date"
							class="col-1" 
							label="Transaction date" 
							value="${this.transactionDetails.transactionDate}">
						</horizon-label>
						<horizon-label 
							data-automation-id="linked-transaction-details-posting-date"
							class="col-2" 
							label="Posting date" 
							value="${this.transactionDetails.postingDate}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal" 
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-description"
							label="Description" 
							value="${this.transactionDetails.description}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-long-description"
							label="Long description" 
							value="${this.transactionDetails.longDescription}">
						</horizon-label>
				</capitec-group>
		</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" valign="bottom" halign="right">
				<capitec-button  
						data-automation-id="linked-transaction-details-close"
						type="primary" 
						label="Close" 
						@click="${() => this._onCloseClick()}">
				</capitec-button>
			</capitec-group>
		
			`;
	}
}
window.customElements.define(`horizon-linked-transaction-details`, LinkedTransactionDetails);