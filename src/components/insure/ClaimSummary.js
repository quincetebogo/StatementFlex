import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Claim Summary component
 *  
 * @export
 * @class ClaimSummary
 * @extends {Component}
 */
class ClaimSummary extends Component {

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
			claimSummary: { type: Object, state: true }
		};
	}

	// #endregion

	// #region EVENT HANDLERS 

	/**
	 * Navigate to Insure Landing page
	 * @returns {null} null
	 */
	_backToClientPoliciesPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	// #endregion

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
				${INSURE_CSS}

				.insure-title-bar{
					margin-bottom: 0px; 
					border-top-left-radius: 5px; 
					border-top-right-radius: 5px;
				}

				.action-image{
					cursor: pointer;
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
			<capitec-card data-automation-id="policy-summary">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<img class="action-image" src="/images/insure/left-arrow.svg"
						data-automation-id="policy-summary-back-to-policies" @click="${() => this._backToClientPoliciesPage()}" />
					<capitec-label label="Claim Summary" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>

				<div style="display: flex; justify-content: start; margin: 20px; 10px; ">
					<horizon-label label="Policy Number" style="flex: 0 0 250px;"
						value="FP000012021">
					</horizon-label>
					<horizon-label label="Life Assured" style="flex: 0 0 250px;"
						value="Joe Soap">
					</horizon-label>
					<horizon-label label="Claim Reference" style="flex: 0 0 250px;"
						value="00019290">
					</horizon-label>
					<horizon-label label="Type Of Claim" style="flex: 0 0 250px;"
						value="Death Claim">
					</horizon-label>
				</div>

				<div style="display: flex; justify-content: start; margin: 20px; 10px; ">
					<horizon-label label="Status" style="flex: 0 0 250px;"
						value="Claim Being Assessed">
					</horizon-label>
					<horizon-label label="Cause of Death" style="flex: 0 0 250px;"
						value="Natural Causes">
					</horizon-label>
					<horizon-label label="Date of Death" style="flex: 0 0 250px;"
						value="03/05/2022">
					</horizon-label>
					<horizon-label label="Date of Claim" style="flex: 0 0 250px;"
						value="18/05/2022">
					</horizon-label>
				</div>

				<div style="margin: 20px; 0px;">
					<horizon-label label="Outstanding Documents"
						value="">
					</horizon-label>
					<ul>
						<li>ID document of nominated beneficiary</li>
						<li>Bank statement of nominated beneficiary</li>
					</ul>
				</div>
			</capitec-card>`;
	}

	// #endregion
}

window.customElements.define(`horizon-insure-claim-summary`, ClaimSummary);