import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';

/**
 * Flexible Savings Plan verified Screen
 * 
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
		// initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {detail : {category: this.category, need: this.need, issue: this.issue, postAction: this}}));
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
					--theme-titlebar-padding: 12px 16px;
					margin-bottom: 0px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 22px;
					--theme-label-title-font-weight: 500;
				}
				capitec-title-bar > capitec-icon {
					--theme-icon-size-medium: 24px;
				}
				.first-column {
					padding: 16px;
				}
				.details {
					font-weight: 800;
					margin-top: -10px;
					margin-bottom: 20px;
				}
				capitec-label[label="Open"] {
					font-weight: 800;
					margin-top: -10px;
					margin-bottom: 20px;
					color: #70AF00;
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
				data-automation-id="savings-plan-landing-screen"
				class="card">
					<capitec-title-bar 
						data-automation-id="savings-plan-landing-title"
						type="save">
						<capitec-group
								layout="horizontal"
								gap="clear"
								halign="left"
								valign="center">
							<capitec-icon size="small" icon="system/arrow-left-action"
							@click="${() => this._back()}">
							</capitec-icon></capitec-group>
							<capitec-group
								layout="vertical"
								gap="clear"
								halign="left"
								valign="top">
							<capitec-label label="Flexible Savings Plan" type="Title"></capitec-label>
							<capitec-label label="My new car - 1633823409" type="default"></capitec-label>
			</capitec-group>
					</capitec-title-bar>

			${this._renderFlexibleSavingsPlan()}
			</capitec-card>
		`;
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

						<capitec-label label="Current balance" type="default"></capitec-label>
						<capitec-label class="details" label="R25 000.00" type="default"></capitec-label>
						<capitec-label label="Accrued interest May" type="default"></capitec-label>
						<capitec-label class="details" label="R75.00" type="default"></capitec-label>
						<capitec-label label="Fees last month" type="default"></capitec-label>
						<capitec-label class="details" label="R5.80" type="default"></capitec-label>
						<capitec-label label="Posting restrictions" type="default"></capitec-label>
						<capitec-label class="details" label="R0.00" type="default"></capitec-label>
						<capitec-label label="Date opened" type="default"></capitec-label>
						<capitec-label class="details" label="19 Dec 2019" type="default"></capitec-label>

					</capitec-group>	
					<capitec-group
					layout="vertical"
					gap="clear"
					halign="left"
					valign="top">

					<capitec-label label="Available balance" type="default"></capitec-label>
					<capitec-label class="details" label="R25 000.00" type="default"></capitec-label>
					<capitec-label label="Interest earned Apr" type="default"></capitec-label>
					<capitec-label class="details" label="R135.00" type="default"></capitec-label>
					<capitec-label label="Last maturity date" type="default"></capitec-label>
					<capitec-label class="details" label="12 Jan 2021" type="default"></capitec-label>
					<capitec-label label="Outstanding authorisations" type="default"></capitec-label>
					<capitec-label class="details" label="R0.00" type="default"></capitec-label>
					<capitec-label label="Last Update" type="default"></capitec-label>
					<capitec-label class="details" label="12 Jun 2021" type="default"></capitec-label>

					</capitec-group>
					<capitec-group
					layout="vertical"
					gap="clear"
					halign="left"
					valign="top">

					<capitec-label label="Interest rate" type="default"></capitec-label>
					<capitec-label class="details" label="5.5%" type="default"></capitec-label>
					<capitec-label label="Interest earned for tax year" type="default"></capitec-label>
					<capitec-label class="details" label="R548.00" type="default"></capitec-label>
					<capitec-label class="blank-space" label="_"></capitec-label>
					<capitec-label class="blank-space"label="_"></capitec-label>
					<capitec-label label="Holds" type="default"></capitec-label>
					<capitec-label class="details" label="R0.00" type="default"></capitec-label>
					<capitec-label label="Account status" type="default"></capitec-label>
					<capitec-label class="vert-test1" label="Open" type="default"></capitec-label>
					
					</capitec-group>	
			</capitec-group>
					`
	}

}

customElements.define(`capitec-flexible-savings-plan-details`, FlexibleSavingsPlanDetails);
