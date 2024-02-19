import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ClaimSummaryEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

/**
 * Claim Summary component shows details of a selected claim, including any outstanding documents
 * 
 * Events Raised 
 * -------------
 * navigate-back
 * 
 * @export
 * @class ClaimSummary
 * @extends {Component}
 */
class ClaimSummary extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {object} claimSummary summary of selected claim
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			claimSummary: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();

		this.telemetryEvents = ClaimSummaryEvents;
		await this._telemetry.startSpan(this.telemetryEvents.CLAIM_SUMMARY, {});
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.CLAIM_SUMMARY, {});
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS 

	/**
	 * Navigate to Insure Landing page
	 * @return {void} 
	 */
	backToClientPoliciesPage() {
		this._telemetry.logEvent(this.telemetryEvents.CLAIM_SUMMARY_BACK, {
			"screen": TelemetryScreen.INSURE_CLAIM_SUMMARY,
			"next-screen": TelemetryScreen.INSURE_CLIENT_CLAIMS_SUMMARY
		});

		this.dispatchEvent(new CustomEvent(`navigate-back`, {}));
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
				${INSURE_CSS}

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
					margin-top:10px;
					margin-bottom:20px;
					padding-left:15px;
				}

				.doc-container{
					padding-left: 15px;
				}

				.doc-container > .label-text{
					font-weight: 500;
				}

				#doc-item-list{
					padding-left: 20px;
				}

				.doc-item{
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
				}

				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					width: 100%;
					box-shadow: none!important;
				}

				horizon-label {
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: auto;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 15px;
					word-break: break-word;
				}

				.lives-container {
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-top: 0px;
					--theme-layout-gap-spacing: 0px;
					margin-bottom: 15px;
				}

				.fixed-label {
					width: 22%;
					--horizon-label-max-overflow-width: 170px;
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
						 @click="${() => this.backToClientPoliciesPage()}" />
					<capitec-label label="Claim Summary" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>

				<div class="summary-row">
					<horizon-label label="Claims reference" class="row-item"
						value="${this.claimSummary?.claimsReference}">
					</horizon-label>
					<horizon-label label="Task reference" class="row-item"
						value="${!this.claimSummary?.taskReference ? `-` : this.claimSummary?.taskReference}">
					</horizon-label>
					<horizon-label label="Claim type" class="row-item"
						value="${this.claimSummary?.claimType}">
					</horizon-label>
					<horizon-label label="Claim status" 
					class="${this.claimSummary?.claimStatus === `Active` ? `active-status` : `inactive-status`} row-item"
						value="${this.claimSummary?.claimStatus}">
					</horizon-label>
				</div>

				<div class="summary-row">
					<horizon-label label="Date of event" class="row-item"
						value="${isNullorEmpty(this.claimSummary?.dateOfEvent) ? `-` : formatDate(this.claimSummary?.dateOfEvent, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label label="Incident number" class="row-item"
						value="${!this.claimSummary?.incidentNumber ? `-` : this.claimSummary?.incidentNumber}">
					</horizon-label>
					<horizon-label label="Policy number" class="row-item"
						value="${this.claimSummary?.policyNumber}">
					</horizon-label>
					<horizon-label label="Account number" class="row-item"
						value="${this.claimSummary?.bankAccount?.accountNumber}">
					</horizon-label>
				</div>

				<div class="summary-row">
					<horizon-label label="Date of claim" class="row-item"
						value="${isNullorEmpty(this.claimSummary?.dateOfClaim) ? `-` : formatDate(this.claimSummary?.dateOfClaim, `dd mmm yyyy`)}">
					</horizon-label>
					${this.claimSummary?.claimType?.toUpperCase() === `DEATH` ? html`
						<horizon-label label="Cause of death" class="row-item"
							value="${this.claimSummary?.causeOfIncident}">
						</horizon-label>
					` : html``}
				</div>

				<div class="doc-container">
					<capitec-label class="label-text" label="${!isNullorEmpty(this.claimSummary?.outstandingDocs) ? `Outstanding documents` : `No outstanding documents`}" type="default">
					</capitec-label>
					<ul id="doc-item-list">
						${this.claimSummary?.outstandingDocs?.map(doc => html`
							<li class="doc-item">${doc.documentName}</li>
						`)}
					</ul>
				</div>

				<capitec-group layout="vertical" halign="left" valign="top" gap="none">
					<capitec-title-bar type="default" label="${this.claimSummary?.claimType?.toUpperCase() === `DEATH` ? `Deceased details` : `Life assured`}">
					</capitec-title-bar>
					<capitec-content-box class="lives-container">
						<horizon-expander
							expandButtonAlignment="none"
							disabled>
							<capitec-group 
								class="expander-header"
								slot="custom-header"
								layout="horizontal"
								gap="clear"
								halign="left"
								valign="center">
								<horizon-label
									class="fixed-label"
									label="Relationship"
									textOverflow="ellipsis"
									value="${this.claimSummary?.lifeAssured?.relationship}">
								</horizon-label>
								<horizon-label
									class="fixed-label"
									label="First name"
									textOverflow="ellipsis"
									value="${this.claimSummary?.lifeAssured?.firstName}">
								</horizon-label>
								<horizon-label
									class="fixed-label"
									label="Surname"
									textOverflow="ellipsis"
									value="${this.claimSummary?.lifeAssured?.surname}">
								</horizon-label>
								<horizon-label
									class="fixed-label"
									label="Date of birth"
									textOverflow="ellipsis"
									value="${isNullorEmpty(this.claimSummary?.lifeAssured?.dateOfBirth) ? `-` : formatDate(this.claimSummary?.lifeAssured?.dateOfBirth, `dd mmm yyyy`)}">
								</horizon-label>
								<horizon-label
									class="fixed-label"
									label="ID Number"
									textOverflow="ellipsis"
									value="${this.claimSummary?.lifeAssured?.idNumber}">
								</horizon-label>
							</capitec-group>
						</horizon-expander>
					</capitec-content-box>
				</capitec-group>
			</capitec-card>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-claim-summary`, ClaimSummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-policy-summary>
 *
 * @event PolicySummary#navigate-back
 * @type {Object} - N/A
 */