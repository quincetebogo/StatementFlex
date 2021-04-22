import { Component, css, html, live } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { Logger } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/Feedback';

const orgUnit = `Client Care`;

const RENDER_MODE = Object.freeze({
	FEEDBACK: 0
});

/**
 * Search Other Need component
 *
 * Events Raised
 * -------------
 * back
 * done
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

		// Create Instances
		this.logger = Logger.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		// Private properties
		this.isBusy = false;
		this.renderMode = -1;

		// Private Variables
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.solution = ``;
		this.categories = null;
		this.needs = null;
		this.issues = null;

		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), null);
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

			renderMode: { attribute: false },
			isBusy: { attribute: false },
			category: { attribute: false },
			need: { attribute: false },
			issue: { attribute: false },
			solution: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		this.incidentRecId = this.incidentDetails.incidentRecId;
		await this._getCategories();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to favourite transactions page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_done() {
		this.dispatchEvent(new CustomEvent(`done`, {}));
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _categoryChanged(e) {
		if (e.detail.new !== null) {
			this.category = e.detail.new;
			this.need = ``;
			this.issue = ``;
			this.solution = ``;

			await this._getSubCategories();
		}
	}

	async _subCategoryChanged(e) {
		if (e.detail.new !== null) {
			this.need = e.detail.new;
			this.issue = ``;
			this.solutionDisplay = false;

			await this._getIssues();
		}
	}

	_issueChanged(e) {
		this.issue = e.currentTarget.value;
		this.solution = this.issuesWithSolution.find(item => item.issue === this.issue).solution;
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
			this.horizonRouter.navigateToStrack(this.incidentRecId);
			this.renderMode = RENDER_MODE.FEEDBACK;
		} else {
			this.logger.log(`error`, `Unable to categorize incident on STrack`, `_onLaunchStrackClick`);
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _getCategories() {
		const returnValue = await this.incidentManagementService.otherNeedCategories(orgUnit);

		if (returnValue.succeeded && returnValue.result) {
			this.categories = returnValue.result.categories.map(item => item.category);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Categories`, `_getCategories`, returnValue.result);
		}
		this.requestUpdate();
	}

	async _getSubCategories() {
		const returnValue = await this.incidentManagementService.otherNeedSpecificNeed(orgUnit, this.category);

		if (returnValue.succeeded && returnValue.result) {
			this.needs = returnValue.result.needs.map(item => item.need);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
	}

	async _getIssues() {
		const returnValue = await this.incidentManagementService.otherNeedIssueType(orgUnit, this.category, this.need);

		if (returnValue.succeeded && returnValue.result) {
			this.issuesWithSolution = returnValue.result.issues;
			this.issues = returnValue.result.issues.map(item => item.issue);
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		this.requestUpdate();
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
				${this._renderTitleBar()}

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
				<capitec-label
					label="Other Need"
					type="title">
				</capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="otherneed-action-bar">
				<capitec-select
					label="Search client need"
					.items="${this.categories}"
					display-field="category"
					id-field="category"
					value="${live(this.category)}"
					?hidden="${false}"
					@value-changed="${(e) => this._categoryChanged(e)}"
					searchable>
				</capitec-select>

				<capitec-select
					label="Choose specific need"
					.items="${this.needs}"
					display-field="need"
					id-field="need"
					value="${live(this.need)}"
					?hidden="${isNullorEmpty(this.category)}"
					@value-changed="${(e) => this._subCategoryChanged(e)}"
					searchable>
				</capitec-select>
				
				<capitec-select
					label="Choose issue type"
					.items="${this.issues}"
					display-field="issue"
					id-field="issue"
					value="${live(this.issue)}"
					?hidden="${isNullorEmpty(this.need)}"
					@value-changed="${(e) => this._issueChanged(e)}"
					searchable>
				</capitec-select>
			</capitec-action-bar>
		`;
	}

	_renderSolution() {
		return !isNullorEmpty(this.solution) 
			? html`
				<capitec-title-bar
					type="default"
					label="Solution">
				</capitec-title-bar>

				<capitec-content-box>
					<capitec-label
						class="solution-heading"
						type="default"
						label="${this.solution}">
					</capitec-label>
				</capitec-content-box>
				
				<capitec-group layout="vertical" gap="line" halign="right" valign="bottom">
					<capitec-button
						class="strack-button"
						type="primary"
						label="Launch STrack"
						@click="${() => this._onLaunchStrackClick()}">
					</capitec-button>
				</capitec-group>`
			: html``;
	}

	_renderNoResults() {
		return isNullorEmpty(this.solution)
			? html`
				<capitec-group
					class="find-need-image-group"
					layout="vertical"
					halign="center"
					valign="center"
					gap="clear">
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
				</capitec-group>`
			: html``;
	}

	_renderFeedback() {
		return this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<horizon-feedback 
					@done="${() => this._done()}">
				</horizon-feedback>`
			: html``;
	}
}

customElements.define(`search-other-need`, SearchOtherNeed);