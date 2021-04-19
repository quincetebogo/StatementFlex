import { Component, css, html, live } from 'platform/elements';
import { Configuration, EventAggregator, Logger } from 'platform/core';
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
		this.logger = Logger.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), null);
		this.isBusy = false;
		this.chooseNeed = true;
		this.chooseIssue = true;
		this.orgUnit = `Client Care`;
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.solutionDisplay = false;
		this.searchObject = null;
		this.specificNeedObjects = null;
		this.issueTypeObjects = null;
		this.solutionObjects = null;

		this._configuration = Configuration.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} incidentDetails Incident details
	 * @property {Object} incomingCallDetails Incoming call details
	 *
	 * @readonly
	 * @static
	 * @memberof SearchOtherNeed
	 */
	static get properties() {
		return {
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },

			searchOtherNeed: { type: Object },
			chooseNeed: { type: Boolean },
			chooseIssue: { type: Boolean },
			solutionDisplay: { type: Boolean },
			searchObject: { type: Object },
			specificNeedObjects: { type: Object },
			issueTypeObjects: { type: Object },
			solutionObjects: { type: Object },
			renderMode: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		
		const orgUnit = `Client Care`;
		const returnValue = await this.incidentManagementService.otherNeedCategories(orgUnit);
		if (returnValue.succeeded && returnValue.result) {
			this.searchObject = returnValue.result.categories;
		} else {
			this.logger.log(`error`, `Failed to retrieve Other Needs Categories`, `otherNeedCategories`, returnValue.result);
		
		}
		this.strackURL = await this._configuration.getSetting(`otherSystemsURL.strack`);
		this.incidentRecId = this.incidentDetails.incidentRecId;
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
		this.need = ``;
		this.issue = ``;
		this.category = e.detail.new.category;
		
		this.chooseNeed = false;
			
			const returnValue = await this.incidentManagementService.otherNeedSpecificNeed(this.orgUnit, this.category);
			
			if (e.detail.old !== null) {
				if (e.detail.old.category !== e.detail.new.category) {
				this.chooseIssue = true;
				this.solutionDisplay = false;
			}
		}
			if (returnValue.succeeded && returnValue.result) {
				this.specificNeedObjects = returnValue.result.needs.map(item => item.need);
			} else {
				this.logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
			}
		this.requestUpdate();
		
	 }

	async _searchSpecificNeed(e) {
		this.issue = ``;
		this.solutionDisplay = false;
		this.need = e.currentTarget.value;
		
		if (this[e.currentTarget.value] = e.detail.new) {
			this.chooseIssue = false;
		
			const returnValue = await this.incidentManagementService.otherNeedIssueType(this.orgUnit, this.category, this.need);
		
				if (returnValue.succeeded && returnValue.result) {
				this.issueTypeObjects = returnValue.result.issues.map(item => item.issue);
			} else {
				this.logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
			}
		} else {
			this.solutionDisplay = false;
		}
		this.requestUpdate();
	 }

	async _chooseIssueType(e) {
		this.solutionDisplay = true;
		this.issue = e.currentTarget.value;
		const returnValue = await this.incidentManagementService.otherNeedIssueType(this.orgUnit, this.category, this.need);
		
		if (returnValue.succeeded && returnValue.result) {
			this.solutionObjects = returnValue.result.issues.map(item => item.solution);
		} else {
			
			this.logger.log(`error`, `Failed to retrieve Other Needs Solution`, `_chooseIssueType`, returnValue.result);
		}
	}

	async _onLaunchStrackClick() {
		const request = {
			incidentRecId: this.incidentRecId,
			ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
			needAction: `SEARCH_OTHER_NEED`,
			incidentCategorization: {
				category: `${this.category}`,
				need: `${this.need}`,
				issue: `${this.issue}`
			}
		};
		const result = await this.incidentManagementService.classifyIncident(request);
	
		if (result.succeeded) {
			this.strackURL = this.strackURL.replace(`$incidentRecId`, this.incidentRecId);
			window.open(this.strackURL);
			this.renderMode = RENDER_MODE.FEEDBACK;
		} else {
			this.logger.log(`error`, `Unable to categorize incident on STrack`, `_onLaunchStrackClick`);
		}
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
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
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
					margin-right: 15px;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 33px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					--theme-layout-gap-spacing: 0px;
					--theme-layout-gap-line-color: none;
				}
				capitec-content-box {
					height: 655px;
				}
				.otherneed-action-bar {
					height: 56px;
					--theme-actionbar-padding: 8px 16px 8px 16px;
					--theme-actionbar-min-height: 64px;
					--theme-actionbar-item-gap: 15px;
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
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-select 
					label="Search client need"
					.items="${this.searchObject}"
					display-field="category"
					id-field="category"
					value = "${this.category}"
					?hidden = "${false}"
					@value-changed="${(e) => this._searchOtherNeed(e)}"
					searchable>
				</capitec-select>
				<capitec-select 
					label="Choose specific need" 
					.items="${this.specificNeedObjects}"
					display-field="need"
					id-field="need"
					value="${live(this.need)}"
					?hidden = "${this.chooseNeed}"
					@value-changed="${(e) => this._searchSpecificNeed(e)}"
					searchable>
				</capitec-select>
				<capitec-select 
					label="Choose issue type" 
					.items="${this.issueTypeObjects}"
					display-field="issue"
					id-field="issues"
					value="${live(this.issue)}"
					?hidden = "${this.chooseIssue}"
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
							type="default"
							label="${this.solutionObjects}">
						</capitec-label>
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
			return html`
				<horizon-feedback
					@done="${() => this._back()}">
				</horizon-feedback>
			`;
		}
		return html``;
	}
 }
 
customElements.define(`search-other-need`, SearchOtherNeed);