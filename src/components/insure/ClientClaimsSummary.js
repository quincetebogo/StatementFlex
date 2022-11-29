import { Component, css, html } from 'platform/elements';
import { formatDate } from 'app/utils/channelServiceUtilities';

/**
 * Display a summary of all client claims, in progress and completed.
 * 
 * Events Raised 
 * -------------
 * claim-selected
 * 
 * @export
 * @class ClientClaimsSummary
 * @extends {Component}
 */

class ClientClaimsSummary extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} clientClaims summary of all clients claims
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			clientClaims: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	* Claim selected, navigate to claim details
	* @param {object} claim Selected claim object
	* @returns {void} 
	*/
	navigateToClaimSummary(claim) {
		this.dispatchEvent(new CustomEvent(`claim-selected`, { detail: { claim } }));
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

				.outstanding-docs{
					--horizon-label-value-color: #C83C37 !important;
				}

				.no-outstanding-docs{
					--horizon-label-value-color: #70af00!important;
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
			${this._renderClaimList()}
		`;
	}

	/**
	 * List of expanders for each claim item
	 * @returns {html} The html content of the component.
	 */
	_renderClaimList() {
		return html`
		${this.clientClaims?.claimSummaries?.map(claim => html`
			<horizon-expander
				expandButtonAlignment="none"
				id="horizon-expander-${claim.claimsReference}"
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
							label="Reference"
							textOverflow="ellipsis"
							value="${claim?.claimsReference}"
							@click="${() => this.navigateToClaimSummary(claim)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							label="Claim type"
							value="${claim?.claimType}">
						</horizon-label>
						<horizon-label
							label="Date of event"
							value="${formatDate(claim?.dateOfEvent, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							label="Policy number"
							value="${claim?.policyNumber}">
						</horizon-label>
						<horizon-label
							class="${claim?.outstandingDocs?.length > 0 ? `outstanding-docs` : `no-outstanding-docs`}"
							label="Outstanding Docs"
							value="${claim?.outstandingDocs?.length > 0 ? claim?.outstandingDocs?.length : `None`}">
						</horizon-label>
						<horizon-label
							label="Status"
							value="${claim?.claimStatus}">
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
		`)}`;
	}

	// #endregion
}

window.customElements.define(`horizon-insure-client-claims-summary`, ClientClaimsSummary);

/**
 * Triggered when a claim is selected, contains the selected claim object
 *
 * @example
 * <horizon-insure-client-claims-summary ... @claim-selected = "${() => this._handler}"></horizon-insure-client-claims-summary>
 *
 * @event InsureClaimsList#claim-selected
 * @type {Object} - N/A
 */