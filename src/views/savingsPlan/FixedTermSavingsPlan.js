import { Component, css, html } from 'platform/elements';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
/**
 * Savings Plan View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class FixedTermSavingsPlan
 * @extends {Component}
 */
export class FixedTermSavingsPlan extends Component {
	
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
				.grid-layout {
					width: 95%;
					margin-top: 23px;  
					margin-left: 20px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-body-group-padding-top: 0px;
					--theme-data-table-body-group-padding-bottom: 0px;
					--theme-data-table-body-group-color: #3A3A3A;
					
				}
				.interest-label {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				.term {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					background-color: #F5F5F5;
				}
				.interest {
					height: 32px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 12px;
					font-weight: 600;
					letter-spacing: 2;
					line-height: 12px;
					background-color: #F5F5F5;
				}
				.interest-rate {
					height: 48px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 20px;
				}
				.tab {
					display: inline-block;
					margin-left: 40px;
				}
				.tab1 {
					display: inline-block;
					margin-left: 50px;
				}
				capitec-table > capitec-table-column {
					border: 1px solid black;
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
							<capitec-label label="Fixed-term Savings Plan" type="Title"></capitec-label>
							<capitec-label label="House deposit - 1633824509" type="default"></capitec-label>
			</capitec-group>
					</capitec-title-bar>

			${this._renderFixedTermSavingsPlan()}
			</capitec-card>
		`;
	}

	_renderFixedTermSavingsPlan() {
		
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
						<horizon-label label="Effective interest rate" value="6.15%"></horizon-label>
						<horizon-label label="Interest earned for tax year" value="R548.00"></horizon-label>
						<horizon-label label="Maturity date" value="12 Jan 2021"></horizon-label>
						<horizon-label label="Available contributions" value="R0.00"></horizon-label>
						<horizon-label label="Last updated" value="12 Jun 2021"></horizon-label>

					</capitec-group>	
					<capitec-group
					layout="vertical"
					gap="clear"
					halign="left"
					valign="top">

					<horizon-label label="Available balance" value="R25 000.00"></horizon-label>
					<horizon-label label="Interest earned May" value="R75.00"></horizon-label>
					<horizon-label label="Date fixed" value="12 Jun 2019"></horizon-label>
					<horizon-label label="Interest option" value="Reinvest"></horizon-label>
					<horizon-label label="Contribution limit" value="R1 200.00"></horizon-label>
					<horizon-label label="Account status" value="Open"></horizon-label>

					</capitec-group>
					<capitec-group
					layout="vertical"
					gap="clear"
					halign="left"
					valign="top">

					<horizon-label label="Nominal interest rate" value="5.98%"></horizon-label>
					<horizon-label label="Interest earned Apr" value="R135.00"></horizon-label>
					<horizon-label label="Term (months)" value="24"></horizon-label>
					<horizon-label label="Total contributions" value="R0.00"></horizon-label>
					<horizon-label label="Posting restrictions" value="No-hold"></horizon-label>
					<capitec-label class="blank-space" label="._"></capitec-label>
					<capitec-label class="blank-space"label="_"></capitec-label>
					
					</capitec-group>	
			</capitec-group>
			<capitec-group class="grid-layout" layout="grid" gap="line" columns="auto" rows="auto" halign = "left">
			<div class="interest-label" row="1" column="1" colspan="4" label="Interest Rate %" size="0.5">Interest Rate %</div>
	<div class="term" row="2" column="1" label="Term" size="1">Term</div>
	<div class="interest" row="3" column="1" type="save" size="1"></div>
	<div class="interest-rate" row="4" column="1" rowspan="2" label="24 months" size="1">24 months</div>
	<div class="term" row="2" column="2" size="1">R0-R24 999</div>
	<div class="term" row="2" column="3" size="1">R25-R99 999</div>
	<div class="term" row="2" column="4" size="1">R100 000+</div>
	<div class="interest" row="3" column="2" size="0.5">Nominal<span class="tab"></span>Effective</div>
	<div class="interest" row="3" column="3" size="0.5">Nominal<span class="tab"></span>Effective</div>
	<div class="interest" row="3" column="4" size="0.5">Nominal<span class="tab"></span>Effective</div>
	<div class="interest-rate" row="4" column="2" size="1">5.77%<span class="tab1"></span>5.93%</div>
	<div class="interest-rate" row="4" column="3" size="1">5.77%<span class="tab1"></span>5.93%</div>
	<div class="interest-rate" row="4" column="4" size="1">5.98%<span class="tab1"></span>6.15%</div>
</capitec-group>
`
	}
}

customElements.define(`horizon-fixed-term-savings-plan`, FixedTermSavingsPlan);