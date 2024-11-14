import { Component, css, html } from 'platform/elements';
import { getMonthName } from 'app/utils/channelServiceUtilities';

/**
 * Main Savings Account Details View
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class MainSavingsAccountDetails
 * @extends {Component}
 */
export class MainSavingsAccountDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsAccountDetails = null;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();


	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {mainSavingsAccountDetails} mainSavingsAccountDetails Data for verified fixed term savings plan display
	 *
	 */
	static get properties() {
		return {
			savingsAccountDetails: { type: Object }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to savings landing page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

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
				.card {
					width: 100%;
					height: 888px;
				}

				/* Title Bar styles */
				capitec-title-bar {
					height: 80px;
					width: 1062px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 10px 24px 6px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 6px 33px 6px 16px;
					height: 64px;
					width: auto;
				}
				.left-arrow {
					cursor: pointer;
					margin-bottom: 24px;
				}
				.details-group {
					padding: 8px 16px;
					--theme-layout-gap-spacing: 0px;
				}
			
				.details-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-font-weight: 500;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-font-weight: 600;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;}
				horizon-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px 12px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				horizon-label[value="Active"][label="Account status"] {
					width: 33%;
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="In arrears"][label="Account status"] {
					width: 33%;
					--horizon-label-value-color: #a5132a;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="fixed-term-savings-details"
				class="card">
					<capitec-title-bar 
						data-automation-id="fixed-term-savings-details-title"
						type="transact">
							<img
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
							<horizon-label class="main-title" label="Main Account" value="${this.savingsAccountDetails.accountNumber}"></horizon-label>
					</capitec-title-bar>

					${this._renderSavingsAccountDetails()}
			</capitec-card>
		`;
	}

	_renderSavingsAccountDetails() {

		return html`
			<capitec-group
				class="details-group"
				layout="horizontal"
				gap="clear"
				halign="left" 
				valign="top"
				wrap>
				${this._renderFields()}
			</capitec-group>`;
	}

	_renderFields() {
		const { accountNumber: _, ...accDetails } = this.savingsAccountDetails;

		return Object.entries(accDetails).map(item => {
			const [key, value] = item;

			return html`
				<horizon-label
					class="details-label"
					label="${key}"
					value="${value}"
					data-automation-id="savings-account-details-${key.toLowerCase().split(``).join(`-`)}">
				</horizon-label>`;
		});
	}
}

customElements.define(`horizon-savings-account-details`, MainSavingsAccountDetails);

/**
* When left arrow on the title bar is clicked to go back
*
* @example
* <horizon-savings-account-details ... @back="${this._handler}"></horizon-savings-account-details>
*
* @event MainSavingsAccountDetails#back
* @type {Object} - N/A
*/