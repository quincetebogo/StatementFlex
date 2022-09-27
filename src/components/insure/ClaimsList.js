import { Component, css, html } from 'platform/elements';
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

	navigateToClaimSummary(claim) {
		this.dispatchEvent(new CustomEvent(`navigate-to-claim-summary`, {
			detail: { claimReference: claim.claimReference }
		}));
	}

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
					padding-left: 16px;
				}
				.header-label > capitec-label{
					font-size: 16px;
					font-weight: bold;
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

	

			${this.clientClaims.filter((filter) => filter.open === true).map(claim => html`

				<capitec-card style="display: flex; justify-content: start; flex-direction: row">
				

						<horizon-label
							label="Status2"
							value="Hey1">
						</horizon-label>
						<horizon-label
							label="Status"
							value="Hey">
						</horizon-label>
		

				</capitec-card>

			
				<!-- <div @click="${(e) => this.navigateToClaimSummary(claim)}">${claim.claimReference}</div> -->
			`)}

			<capitec-content-box class="header-label">
				<capitec-label label="Closed"></capitec-label>
			</capitec-content-box>

			${this.clientClaims.filter((filter) => filter.open === false).map(claim => html`
				<div @click="${(e) => this.navigateToClaimSummary(filter)}">${claim.claimReference}</div>
			`)}
		`;
	}

	// #endregion
}

window.customElements.define(`horizon-insure-claims-list`, InsureClaimsList);