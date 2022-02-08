import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

/**
 * Flexible Savings Plan verified Screen
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class FlexibleSavingsPlanDetails
 * @extends {Component}
 */
export class FlexibleSavingsPlanDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsPlanDetails = null;
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
	 * @property {savingsPlanDetails} savingsPlanDetails Data for verified flexible savings plan display
	 *
	 */
	static get properties() {
		return {
			savingsPlanDetails: { type: Object }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to savings plan landing page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	// N/A
	
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
					--theme-titlebar-padding: 16px 16px 12px 16px;
					--theme-titlebar-item-gap: 0px;
					margin-bottom: 0px;
				}
				.left-arrow {
					padding-bottom: 26px;
					cursor: pointer;
				}
				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 0px 16px;
				}
				.first-column {
					padding: 16px;
				}
				.details {
					font-weight: 800;
					margin-top: -10px;
					margin-bottom: 20px;
				}
				horizon-label[value="Open"] {
					width: 132px;
					--horizon-label-value-color: #70AF00;
				}
				.blank-space {
					color: #FFFFFF;
					font-weight: 800;
					margin-top: -10px;
					margin-bottom: 20px;
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
				data-automation-id="flexible-savings-details"
				class="card">
					<capitec-title-bar 
						data-automation-id="flexible-savings-details-title"
						type="save">
							<img
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow"/>
							<horizon-label class="main-title" label="Flexible Savings Plan" value="My new car - 1633823409"></horizon-label>
					</capitec-title-bar>
					 
					${this._renderFlexibleSavingsPlan()}
			</capitec-card>`;
	}

	_renderFlexibleSavingsPlan() {
		return html`
			<capitec-group
				layout="horizontal"
				gap="clear"
				halign="stretch" 
				valign="center">
					<capitec-group
						class= "first-column"
						layout="vertical"
						gap="clear"
						halign="left"
						valign="center">
						<horizon-label label="Current balance" value="R25 000.00"></horizon-label>
						<horizon-label label="Accrued interest May" value="R75.00"></horizon-label>
						<horizon-label label="Fees last month" value="R5.80"></horizon-label>
						<horizon-label label="Posting restrictions" value="R0.00"></horizon-label>
						<horizon-label label="Date opened" value="19 Dec 2019"></horizon-label>
					</capitec-group>

					<capitec-group
						layout="vertical"
						gap="clear"
						halign="left"
						valign="top">
						<horizon-label label="Available balance" value="R25 000.00"></horizon-label>
						<horizon-label label="Interest earned Apr" value="R135.00"></horizon-label>
						<horizon-label label="Last maturity date" value="12 Jan 2021"></horizon-label>
						<horizon-label label="Outstanding authorisations" value="R0.00"></horizon-label>
						<horizon-label label="Last Update" value="12 Jun 2021"></horizon-label>
					</capitec-group>
					<capitec-group
						layout="vertical"
						gap="clear"
						halign="left"
						valign="top">
						<horizon-label label="Interest rate" value="5.5%"></horizon-label>
						<horizon-label label="Interest earned for tax year" value="R548.00"></horizon-label>
						<capitec-label class="blank-space" label="_"></capitec-label>
						<capitec-label class="blank-space" label="_"></capitec-label>
						<horizon-label label="Holds" value="R0.00"></horizon-label>
						<horizon-label label="Account status" value="Open"></horizon-label>
					</capitec-group>
			</capitec-group>`;
	}
}

customElements.define(`capitec-flexible-savings-plan-details`, FlexibleSavingsPlanDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-flexible-savings-plan-details ... @back="${this._handler}"></capitec-flexible-savings-plan-details>
 *
 * @event FlexibleSavingsPlanDetails#back
 * @type {Object} - N/A
 */