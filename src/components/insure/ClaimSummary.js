import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ClaimSummaryEvents } from 'app/constants/telemetry/events/Insure';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { getClaimStatusDisplay, getClaimTrackingLabel } from 'app/utils/insureUtils';
import 'app/components/common/HorizonStatusTracker';

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

	_getClaimStatusDisplay() {
		return getClaimStatusDisplay(this.claimSummary);
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

				.claim-detail-layout {
					display: grid;
					grid-template-columns: repeat(2, minmax(0, 1fr));
					gap: 16px;
					padding: 0 15px 16px;
				}

				.section-card {
					background: #FFFFFF;
					border: 1px solid #D9E0EA;
					border-radius: 12px;
					padding: 16px 18px 18px;
					box-shadow: none;
				}

				.section-title {
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					--theme-label-font-color: #2D3440;
				}

				.section-divider {
					height: 1px;
					background: #E9EDF3;
					margin: 12px 0 4px;
				}

				.detail-list {
					display: flex;
					flex-direction: column;
				}

				.detail-row {
					display: grid;
					grid-template-columns: 128px minmax(0, 1fr);
					gap: 12px;
					align-items: center;
					padding: 11px 0;
					border-bottom: 1px solid #EEF2F7;
				}

				.detail-row-last {
					border-bottom: none;
				}

				.detail-label {
					--theme-label-font-size: 12px;
					--theme-label-font-weight: 400;
					--theme-label-font-color: #8A919B;
				}

				.detail-value {
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;
					--theme-label-font-color: #2D3440;
					word-break: break-word;
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
					class="row-item"
						value="${this._getClaimStatusDisplay()}">
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
							value="${!this.claimSummary?.causeOfIncident?.displayValue ? `-` : this.claimSummary?.causeOfIncident?.displayValue}">
						</horizon-label>
					` : html``}
				</div>

				<div class="claim-detail-layout">
					${this._renderDeceasedDetails()}
					${this._renderClaimTracking()}
				</div>
			</capitec-card>
		`;
	}

	_renderClaimTracking() {
		return html`<capitec-content-box class="section-card tracker-card" noPadding>
				<capitec-label class="label-text" label="Track your claim" type="strong"></capitec-label>
				<div class="section-divider"></div>
				<horizon-status-tracker 
					.stages="${this.claimSummary?.claimTracking}"
					.stageLabel="${getClaimTrackingLabel}"
					.outstandingDocs="${this.claimSummary?.outstandingDocs}">
				</horizon-status-tracker>
			</capitec-content-box>`;
	}

	_renderDetailRow(label, value, last = false) {
		return html`
			<div class="detail-row ${last ? `detail-row-last` : ``}">
				<capitec-label class="detail-label" label="${label}" type="default"></capitec-label>
				<capitec-label class="detail-value" label="${value}" type="subtitle"></capitec-label>
			</div>
		`;
	}

	_renderDeceasedDetails() {
		return html`<capitec-content-box class="section-card details-card" noPadding>
				<capitec-label class="label-text" label="${this.claimSummary?.claimType?.toUpperCase() === `DEATH` ? `Deceased details` : `Life assured`}" type="strong"></capitec-label>
				<div class="section-divider"></div>
				<div class="detail-list">
					<div class="detail-row">
						<capitec-label class="detail-label" label="Relationship" type="default"></capitec-label>
						<capitec-label class="detail-value" label="${this.claimSummary?.lifeAssured?.relationship}" type="subtitle"></capitec-label>
					</div>
					<div class="detail-row">
						<capitec-label class="detail-label" label="First name" type="default"></capitec-label>
						<capitec-label class="detail-value" label="${this.claimSummary?.lifeAssured?.firstName}" type="subtitle"></capitec-label>
					</div>
					<div class="detail-row">
						<capitec-label class="detail-label" label="Surname" type="default"></capitec-label>
						<capitec-label class="detail-value" label="${this.claimSummary?.lifeAssured?.surname}" type="subtitle"></capitec-label>
					</div>
					<div class="detail-row">
						<capitec-label class="detail-label" label="Date of birth" type="default"></capitec-label>
						<capitec-label class="detail-value" label="${isNullorEmpty(this.claimSummary?.lifeAssured?.dateOfBirth) ? `-` : formatDate(this.claimSummary?.lifeAssured?.dateOfBirth, `dd mmm yyyy`)}" type="subtitle"></capitec-label>
					</div>
					<div class="detail-row detail-row-last">
						<capitec-label class="detail-label" label="ID Number" type="default"></capitec-label>
						<capitec-label class="detail-value" label="${isNullorEmpty(this.claimSummary?.lifeAssured?.idNumber) ? `-` : this.claimSummary?.lifeAssured?.idNumber}" type="subtitle"></capitec-label>
					</div>
				</div>
			</capitec-content-box>`;
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