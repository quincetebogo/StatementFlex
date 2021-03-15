import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/Feedback';

const RENDER_MODE = Object.freeze({
    FEEDBACK: 0
});

/**
 * Search Other Need component
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class SearchOtherNeed
 * @extends {Component}
 */

 export class SearchOtherNeed extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
        this.state = this.horizonStore.recoverState();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), null);
		this.isBusy = false;
		this.chooseNeed = true;
		this.chooseIssue = true;
		this.orgUnit = 'Client Care';
		this.category = '';
		this.need = '';
		this.issue = '';
		this.solutionDisplay = false;
		this.searchObject = null;
		this.specificNeedObjects = null;
		this.issueTypeObjects = null;
		this.solutionObjects = null;

       	this.incomingCallDetails = this.state.incomingCallDetails;
        this.strackURL = `http://strackdevnlb.int.capinet/HEAT/?Scope=SelfService&CommandId=Open&Tab=Incident%23&ItemId=$incidentRecId&frameless=false`
        this.incidentRecId = this.incomingCallDetails.incidentRecId; /* "76E4F06B294147D2A295FE5AA02C9138" */
	}
	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} searchOtherNeed Contains list of other needs
	 *
	 * @readonly
	 * @static
	 * @memberof SearchOtherNeed
	 */
	static get properties() {
        return {
            incomingCallDetails: {type: Object},
			searchOtherNeed: { type: Object },
			chooseNeed: {type: Boolean},
			chooseIssue: {type: Boolean},
			solutionDisplay: {type: Boolean},
			searchObject: {type: Object},
			specificNeedObjects: {type: Object},
			issueTypeObjects: {type: Object},
			solutionObjects: {type: Object},
			renderMode: {attribute: false}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		
		const orgUnit = "Client Care";
		const returnValue = await this.incidentManagementService.otherNeedCategories(orgUnit);
		if (returnValue.succeeded && returnValue.result) {
			this.searchObject = returnValue.result.categories;
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}
	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}
	// ---------
	// PRIVATE METHODS
	// ---------
	 
	async _searchOtherNeed(e) {
			
		this.specificNeedObjects = null;
		this.issueTypeObjects = null;
		this.category = e.currentTarget.value;
		if (this[e.currentTarget.value] = e.detail.new){
			this.chooseNeed = false;
			
			const returnValue = await this.incidentManagementService.otherNeedSpecificNeed(this.orgUnit, this.category);
			
			if (returnValue.succeeded && returnValue.result) {
				this.specificNeedObjects = returnValue.result.needs;
			}
		}
		else {
			this.chooseNeed = true;
			this.chooseIssue = true;
			this.solutionDisplay = false;
		}
	 }

	async _searchSpecificNeed(e) {

		this.solutionDisplay = false;
		this.need = e.currentTarget.value.need;
		
		if (this[e.currentTarget.value.need] = e.detail.new) {
			this.chooseIssue = false;
		
		const returnValue = await this.incidentManagementService.otherNeedIssueType(this.orgUnit, this.category, this.need);
		
				if (returnValue.succeeded && returnValue.result) {
				this.issueTypeObjects = returnValue.result.issues.map(item=>{
					return item.issue;
				});
			}
		}
		else {
			this.chooseIssue = true;
			this.solutionDisplay = false;
		}
	 }

	async _chooseIssueType(e) {
		this.solutionDisplay = true;
		this.issue = e.currentTarget.value.issue;
		const returnValue = await this.incidentManagementService.otherNeedIssueType(this.orgUnit, this.category, this.need);
		
		if (returnValue.succeeded && returnValue.result) {
			this.solutionObjects = returnValue.result.issues.map(item=>{
				return item.solution;
			});
		}
	}

	async _onLaunchStrackClick() {
        this.strackURL = this.strackURL.replace(`$incidentRecId`, this.incidentRecId);
        window.open(this.strackURL);
        this.renderMode = RENDER_MODE.FEEDBACK;
	}
	// ---------
	// RENDERING
	// ---------
	
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
				.other-need {
					height: 888px;
					width: 1064px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-card > capitec-group:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-padding: 0px 0px 0px 16px;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 34px;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 20px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					padding-top: 3px;
					padding-bottom:3px;
					border-top: 0px solid #E1E1E1;
				}
				capitec-content-box{
					height: 645px;
				}
				.otherneed-action-bar {
					height: 56px;
					--theme-actionbar-padding: 8px 16px 8px 16px;
					--theme-actionbar-min-height: 64px;
					--theme-actionbar-item-gap: 8px;
				}
				.otherneed-action-bar > capitec-text-field {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				.otherneed-action-bar > capitec-select {
					height: 49px;
					width: 333px;
					--theme-input-label-font-color: #969B9D;
				}
				#id-button-group {
					justify-content: right;
					padding: 16px;
				}
				#button-right {
					margin-right: 16px;
				}
				.solution-heading {
					--theme-label-subtitle-font-color: #3E4547;
					--theme-label-subtitle-font-size: 16px;
					--theme-label-subtitle-font-weight: 600;
 					letter-spacing: 0;
 					line-height: 20px;
				}
				.solution-content {
					line-height: 20px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 15px;
					letter-spacing: 0;
				}
				.strack-solution-content {
					display: inline;
					line-height: 20px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 15px;
					letter-spacing: 0;
				}
				.bullet-group {
					margin-left: 20px;
				}
				/* No Results CSS */
				.find-need-image-group {
					margin-top: 92px;
				}
				.find-need {
					--theme-layout-gap-spacing: 13px;
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-strong-font-color: #3A3A3A;
				}
				.strack-button {
					padding-right: 16px;
				}
			`
		];
	 }

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderOtherNeeds()}
			${this._renderFeedback()}
			${this._renderLoadingIndicator()}
		`;
	}
	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
	_renderOtherNeeds() {
		return html`
			<capitec-card class="other-need">
				<capitec-title-bar type="default">
					<capitec-icon 
						size="small"
						icon="system/arrow-left-action"
						@click="${() => this._back()}">
					</capitec-icon>
					<capitec-label label="Other Need" type="title"></capitec-label>
				</capitec-title-bar>
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					${this._renderActionBar()}
				</capitec-group>
				<capitec-group layout="vertical" gap="line" halign="center" valign="center">
					${this._renderNoResults()}
				</capitec-group>
				<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
					${this._renderSolution()}
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar type="default">
				<capitec-icon 
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Other Need" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		// add if statement to render next text boxes/drop downs
		// must have a hidden property for the text field
		// create an object 3 properties- hidden object should set to false when properties are populated
		// @input="${(e) => this._searchOtherNeed(e)}"
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-text-field 
					label="Search client need"
					.items="${this.searchObject}"
					data= "${this.searchObject}"
					display-field="category"
					id-field="category"
					type="search"
					keyboardMode="alpha-numeric"
					@value-changed="${(e) => this._searchOtherNeed(e)}">
				</capitec-text-field>
				<capitec-select 
					label="Choose specific need" 
					.items="${this.specificNeedObjects}"
					display-field="need"
					id-field="need"
					.value="Search specific need"
					?hidden = ${this.chooseNeed}
					@value-changed="${(e) => this._searchSpecificNeed(e)}"
					searchable>
				</capitec-select>
				<capitec-select 
					label="Choose issue type" 
					.items="${this.issueTypeObjects}"
					display-field="issue"
					id-field="issues"
					.value="Search specific need"
					?hidden = ${this.chooseIssue}
					@value-changed="${(e) => this._chooseIssueType(e)}"
					searchable>
				</capitec-select>
			</capitec-action-bar>
		`;
	}

	_renderSolution() {
		if (this.solutionDisplay) {
			return html`
				<capitec-title-bar type="default" label="Solution"></capitec-title-bar>
					<capitec-content-box>
						<capitec-label
							class="solution-heading"
							type="subtitle"
							label="${this.solutionObjects}">
						</capitec-label>
			
						<!-- <capitec-group layout="vertical" gap="none" halign="left" valign="top">
							<capitec-label
								class="solution-content"
								type="default" 
								label="Client ID number">
							</capitec-label> 
							<capitec-label
								class="solution-content"
								type="default"
								halign="left"
								label="Savings account number">
							</capitec-label>
							<capitec-label
								class="solution-content"
								type="default"
								halign="left"
								label="Amount of Disputed transaction/s">
							</capitec-label>
							<capitec-label
								class="solution-content"
								type="default"
								halign="left"
								label="Transaction Date range">
							</capitec-label>
							<capitec-label
								class="solution-content"
								type="default"
								halign="left"
								label="Transaction time">
							</capitec-label>
							<capitec-label
								class="solution-content"
								type="default"
								halign="left"
								label="Client preferred method of contact along with contact information">
							</capitec-label>
							<capitec-label
								class="solution-content"
								type="default"
								halign="left" 
								label="Masked Card number">
							</capitec-label>
						</capitec-group>
						
						<capitec-label
							class="solution-heading"
							type="subtitle"
							label="Background">
						</capitec-label>
						
						<capitec-group layout="vertical" gap="none" halign="left" valign="top">
							<capitec-label
								class="solution-content"
								type="default"
								label="This is when a Capitec Bank client/cardholder does a withdrawal at a foreign MasterCard (overseas) ATM and the cash either does not dispense at all or only part of the requested amount dispensed.">
							</capitec-label> 
						</capitec-group>

						<capitec-label
							class="solution-heading"
							type="subtitle"
							label="Steps">
						</capitec-label>
			
						<capitec-label
							class="solution-heading"
							type="subtitle"
							label="1.	STrack-info">
						</capitec-label>
						
						<capitec-group class="bullet-group" layout="vertical" gap="none" halign="left" valign="top">
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									label="Complete client savings account number in Client ID field.">
								</capitec-label>
							</li>
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Complete the details in the Incident Detail Tab">
								</capitec-label></li>
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Capture the minimum information and the reason for the cardholders dispute in the description box">
								</capitec-label>
							</li>
						</capitec-group>

						<capitec-label
							class="solution-heading"
							type="subtitle"
							label="2.	Hand Off">
						</capitec-label>
						
						<capitec-group class="bullet-group" layout="vertical" gap="none" halign="left" valign="top">
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Hand off the incident to Card disputes.">
								</capitec-label>
							</li>
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Inform the client that this enquiry can take up to 5 days to investigate.">
								</capitec-label>
							</li>
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Inform client that Card Disputes will contact client with feedback.">
								</capitec-label>
							</li>
							<li>
								<capitec-label
									class="strack-solution-content"
									type="default"
									halign="left"
									label="Provide the client with the Incident Number and end the call.">
								</capitec-label>
							</li>
						</capitec-group> -->
					</capitec-content-box>
					
					<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
						<capitec-button
							class="strack-button"
							type="primary"
							label="Launch STrack"
							@click="${() => this._onLaunchStrackClick()}">
						</capitec-button>
					</capitec-group>
			`;
		}
	}

	_renderNoResults() {
		 if (this.solutionDisplay) {
			return html``;
		}
		return html`
			<capitec-group class="find-need-image-group" layout="vertical" halign="center" valign="center" gap ="clear"  >
				<img
					src="/images/common/search.svg"
					class="search-icon" />
				<capitec-label
					class="find-need"
					label="Find other need"
					type="strong">
				</capitec-label>
				<capitec-label
					class="find-need-second"
					label="Search a client need not currently on Horizon"
					type="strong">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderFeedback() {
		if (this.renderMode === RENDER_MODE.FEEDBACK) {
			return html`<horizon-feedback></horizon-feedback>`;
		}
		return html``;
	}
 }
 
customElements.define(`search-other-need`, SearchOtherNeed);