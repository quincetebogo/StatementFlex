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

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	// #region EVENT HANDLERS 

	/**
	 * Navigate to Insure Landing page
	 * @returns {null} null
	 */
	_backToClientPoliciesPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {}));
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
				.insure-title-bar{
					margin-bottom: 0px; 
					border-top-left-radius: 5px; 
					border-top-right-radius: 5px;
				}

				.action-image{
					cursor: pointer;
				}

				.row-item{
					flex: 0 0 250px;
				}

				.summary-row{
					display: flex; 
					justify-content: start; 
					margin: 20px 10px; 
					padding-left:20px;
				}

				.doc-container{
					padding-left: 30px;
				}

				.doc-container > .label-text{
					font-weight: 500;
				}

				.doc-item{
					color: #003652;
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
			<capitec-card>
				<capitec-title-bar type="insure" class="insure-title-bar">
					<img class="action-image" src="/images/insure/left-arrow.svg"
						 @click="${() => this._backToClientPoliciesPage()}" />
					<capitec-label label="Claim Summary" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>

				<div class="summary-row">
					<horizon-label label="Policy Number" class="row-item"
						value="${this.claimSummary.policyNumber}">
					</horizon-label>
					<horizon-label label="Life Assured" class="row-item"
						value="${this.claimSummary.lifeAssured.firstName} ${this.claimSummary.lifeAssured.lastName}">
					</horizon-label>
					<horizon-label label="Claim Reference" class="row-item"
						value="${this.claimSummary.claimReference}">
					</horizon-label>
					<horizon-label label="Type Of Claim" class="row-item"
						value="${this.claimSummary.claimType}">
					</horizon-label>
				</div>

				<div class="summary-row">
					<horizon-label label="Status" class="row-item"
						value="${this.claimSummary.claimStatus}">
					</horizon-label>
					<horizon-label label="Cause of Death" class="row-item"
						value="${this.claimSummary.causeOfDeath}">
					</horizon-label>
					<horizon-label label="Date of Death" class="row-item"
						value="${this.claimSummary.dateOfDeath}">
					</horizon-label>
					<horizon-label label="Date of Claim" class="row-item"
						value="${this.claimSummary.dateOfClaim}">
					</horizon-label>
				</div>

				<div class="doc-container">
					<capitec-label class="label-text" label="Outstanding Documents" type="default">
					</capitec-label>
					<ul>
						${this.claimSummary.outstandingDocs.map(doc => html`
							<li class="doc-item">${doc.documentName}</li>
						`)}
					</ul>
				</div>
			</capitec-card>`;
	}

	// #endregion
}

window.customElements.define(`horizon-insure-claim-summary`, ClaimSummary);