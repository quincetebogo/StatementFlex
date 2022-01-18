import { Component, css, html } from 'platform/elements';
import { getMonthName } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';

/**
 * A dialog to show linked transaction details 
 * 
 * Events raised
 * -------------
 * on-close
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

		this.transactionDetails = null;
	}

	connectedCallback() {
		super.connectedCallback();
		this.dispatchEvent(new CustomEvent(`on-loading`, { detail: {} }));
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} transactionDetails Object contains the details of each linked transaction
	 *
	 * @readonly
	 * @static
	 * @memberof LinkedTransactionDetails
	 */
	static get properties() {
		return {
			transactionDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	_onCloseClick() {
		this.dispatchEvent(new CustomEvent(`on-close`, { detail: {} }));
	}

	// ---------
	// PRIVATE METHODS
	// ---------

	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
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
					width: 572px;
					border-radius: 4px 4px 0px 0px;
					position: absolute;
					left: -551px;
					top: -44px;
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					--theme-label-title-font-size: 18px;
					--theme-titlebar-padding: 20px 16px;
					--theme-label-font-family: 'Hind Vadodara semibold';
				}

				.header-gradient > capitec-label {
					line-height: 64px;
					padding-left: 16px;
					--theme-label-default-font-size: 18px;
					--theme-label-font-color: #ffffff;
					letter-spacing: 0;
					--theme-label-font-family: 'Hind Vadodara SemiBold';
				}

				/* Transaction details Styles */
				.details-vertical {
					width: 572px;
					height: 453px; 
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 8px;
					--theme-layout-gap-spacing: 0px;
				}

				.details-horizontal {
					--theme-layout-gap-spacing: 9px;
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
						<capitec-title-bar type="primary" label="Transaction Details" class="header-gradient">
						</capitec-title-bar>
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
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
				<capitec-group 
				class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<horizon-label 
							data-automation-id="linked-transaction-details-category"
							class="col-1" 
							label="Category" 
							value="${this.transactionDetails.category ? this.transactionDetails.category : `-`}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
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
							value="${this.transactionDetails.fromAccount ? this.transactionDetails.fromAccount : `-`}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-transaction-date"
							class="col-1" 
							label="Transaction date" 
							value="${this._formatDate(this.transactionDetails.transactionDate)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="linked-transaction-details-posting-date"
							class="col-2" 
							label="Posting date" 
							value="${this._formatDate(this.transactionDetails.postingDate)}">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="linked-transaction-details-description"
							label="Description" 
							value="${this.transactionDetails.originalDescription ? this.transactionDetails.originalDescription : `-`}">
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
							value="${this.transactionDetails.longDescription ? this.transactionDetails.longDescription : `-`}">
						</horizon-label>
				</capitec-group>
		</capitec-content-box>
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

/**
 * When clicked on close button
 *
 * @example
 * <horizon-linked-transaction-details ... @on-close="${this._handler}"></horizon-linked-transaction-details>
 *
 * @event LinkedTransactionDetails#on-close
 * @type {Object} - N/A
 */