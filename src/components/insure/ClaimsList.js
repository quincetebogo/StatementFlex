import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

// #endregion CONSTANTS

/**
 * Claims list component
 *  
 * @export
 * @class InsureClaimsList
 * @extends {Component}
 */
class InsureClaimsList extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion

	// #region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientClaims: { type: Object, state: true }
		};
	}

	// #endregion

	// #region EVENT HANDLERS

	navigateToClaimSummary(claim) {
		this.dispatchEvent(new CustomEvent(`navigate-to-claim-summary`, {
			detail: { claimReference: claim.claimReference }
		}));
	}

	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				.header-label{
					padding-left: 0px;
				}
				.header-label > capitec-label{
					font-size: 16px;
					font-weight: bold;
				}

				.label-claim-number {
					--theme-label-cursor: pointer;
					--horizon-label-value-color: #009DE0;
				}
				.fixed-label {
					width: 22%;
					--horizon-label-max-overflow-width: 170px;
				}
				.vertical-line {
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
				}

				.options-group {
					height: 80px; 
					margin: 17px 0px 15px 0px;
					width: auto;
				}
				.options-group > horizon-option-button {
					width: 184px;
					height: 80px;
					margin-left: 16px;
					padding: 0px;
	
					--horizon-option-btn-text-margin-top: 3px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}
	
				/* Expander header and content styles */
				horizon-expander {
					margin-bottom: 16px;
					--theme-expander-height: auto;
					--theme-layout-gap-spacing: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-padding: 0 6px 0 0;
					--theme-expander-indicator-width: 16px;
				}
				horizon-expander[expanded] {
					box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
					display: block;
					--theme-overflow-menu-width: 200px !important;
				}
				.expander-header > capitec-icon {
					--theme-icon-size-default: 20px;
					--theme-layout-gap-spacing: 0px;
					margin-left: 10px;
				}
				.expander-header > capitec-button {
					width: 128px;
				}
				.expander-content {
					border-left: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
					border-right: 1px solid #E1E1E1;
					border-radius: 0px 0px 4px 4px
				}
				.expander-content > capitec-title-bar {
					border-top: 0px;
				}
				.expander-header > horizon-label[label="Status"] {
					width: 200px;
					text-overflow: ellipsis;
				}
				horizon-label {
					width: 135px;
					padding-left: 16px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-content-box class="header-label">
				<capitec-label label="Open"></capitec-label>
			</capitec-content-box>

			${this._renderOpenClaims()}
			

			<capitec-content-box class="header-label">
				<capitec-label label="Closed"></capitec-label>
			</capitec-content-box>
			${this._renderClosedClaims()}
		`;
	}

	_renderOpenClaims() {
		return html`
		${this.clientClaims.filter((claim) => claim.open === true).map(claim => html`
				<horizon-expander
					expandButtonAlignment="none"
					id="horizon-expander-${claim.claimReference}"
					disabled>
					<capitec-group 
						class="expander-header"
						slot="custom-header"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="center">
							<horizon-label
								class="label-claim-number fixed-label"
								label="${claim.claimType}"
								textOverflow="ellipsis"
								value="${claim.claimReference}"
								@click="${() => this.navigateToClaimSummary(claim)}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label
								label="Date of Death"
								value="${formatDate(claim.dateOfDeath, `dd mmm yyyy`)}">
							</horizon-label>
							<horizon-label
								label="Claim Type"
								value="${claim.claimType}">
							</horizon-label>
							<horizon-label
								label="Status"
								value="${claim.claimStatus}">
							</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group 
							class="expander-content" 
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								
						</capitec-group>
					</div>
				</horizon-expander>
			`)}
		`;
	}

	_renderClosedClaims() {
		return html`
		${this.clientClaims.filter((claim) => claim.open === false).map(claim => html`
				<horizon-expander
					expandButtonAlignment="none"
					id="horizon-expander-${claim.claimReference}"
					disabled>
					<capitec-group 
						class="expander-header"
						slot="custom-header"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="center">
							<horizon-label
								class="label-claim-number fixed-label"
								label="${claim.claimType}"
								textOverflow="ellipsis"
								value="${claim.claimReference}"
								@click="${() => this.navigateToClaimSummary(claim)}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label
								label="Date of Death"
								value="${formatDate(claim.dateOfDeath, `dd mmm yyyy`)}">
							</horizon-label>
							<horizon-label
								label="Claim Type"
								value="${claim.claimType}">
							</horizon-label>
							<horizon-label
								label="Status"
								value="${claim.claimStatus}">
							</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group 
							class="expander-content" 
							layout="vertical"
							gap="none"
							halign="left"
							valign="center">
								
						</capitec-group>
					</div>
				</horizon-expander>
			`)}
		`
	}

	// #endregion
}

window.customElements.define(`horizon-insure-claims-list`, InsureClaimsList);