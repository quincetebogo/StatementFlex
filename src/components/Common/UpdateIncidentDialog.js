import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { Logger, Configuration } from 'platform/core';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';

import 'app/components/dialogs/common/Feedback';

/**
 *  This is a common dialog format in the Horizon Project.
 * 
 * @export
 * @class UpdateIncidentDialog
 * @extends {Component}
 */

const RENDER_MODE = {
	UPDATE_INCIDENT: 0,
	FEEDBACK: 1 
}

export class UpdateIncidentDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = {};

		this.alertBannerMessage = ``;
		this.headerLabel = ``;
		this.categories = null;
		this.specificNeeds = null;
		this.issueTypes = null;

		this.category = ``;
		this.need = ``;
		this.issue = ``;

		this.isBusy = false;
		this.showAlert = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.logger = Logger.getInstance();
		this._configuration = Configuration.getInstance();


	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {String} headerLabel - The label string for the dialog heading
	 * @property {Array} categories - An array of categories
	 * @property {Array} specificNeeds - An array of specific needs
	 * @property {Array} issueTypes - An array of issue types
	 * 
	 */


	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },
			headerLabel: { type: String },
			categories: { type: Array },
			specificNeeds: { type: Array },
			issueTypes: { type: Array },
			showAlert: { type: Boolean },

			category: { type: String },
			need: { type: String },
			issue: { type: String },
			alertBannerMessage: { type: String },

			isBusy: { attribute: false },
			renderMode: { attribute: false },

		}
	};

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const callerInformation = this.horizonStore.getCallerInformation() || {};
		this.feedbackOptions = FEEDBACK_OPTIONS;
		this.issues = this.issues.map(item => item.issue);

	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_keyPress() {
		// Clear the error string
		this.showAlert = false;
		this.alertBannerMessage = ``;
		this.needError = ``;
		this.issueError = ``;
	}

	async _incidentStatus(e) {
		const returnValue = await this.incidentManagementService.incidentStatus(e);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}

	async _getNeedActions() {
		const ivrActionMapping = await this._configuration.getSetting(`ivrActionMapping`);
		return ivrActionMapping;
	}

	_updateClick(category, need, issue) {
		this.dispatchEvent(new CustomEvent(`on-update`, { detail: {
			category: category,
			need: need,
			issue: issue
		} }));

		if (isNullorEmpty(need) || isNullorEmpty(issue)) {
			this.showAlert = true;
			this.alertBannerMessage = `You must complete all fields to update`;

			if (isNullorEmpty(need)) {
				this.needError = `Required field`;
			}
			if (isNullorEmpty(issue)) {
				this.issueError = `Required field`;
			}
		}

		// this.renderMode = RENDER_MODE.FEEDBACK;

	}

	async _done(event) {
		this._telemetry.logEvent(QuickTransactionEvents.SEARCH_OTHER_NEED_DONE, {
			"launch-strack-feedback": event.detail.selectedFeedback
		});

		const incidentDetails = this.horizonStore.getIncidentDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const selectedOption = FEEDBACK_OPTIONS.find(item => item.key === event.detail);
		const options = {
			clientNeed: null,
			endCallReason: selectedOption,
			causeCodeByContext: this.endCallCauseCode.getCauseCode(`LandingPage`, incomingCallDetails.ivrOptionCode, selectedOption.value)
		};

		const isSuccess = await super.closeIncident(options, () => this._toggleBusyFlag());
		console.log(isSuccess)
		
		if (isSuccess) {
			// Navigate to favourites landing page
			incidentDetails.needStatus = super.HORIZON_NEED_STATUS.CLOSED;
			incidentDetails.feedback = selectedOption.key;

			this.horizonStore.setIncidentDetails(incidentDetails);
			this._searchOtherNeedDone();
		} else {
			// this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;

			console.log("error")
		}
	}
	_searchOtherNeedDone() {
		this._refreshIncidentDetails();
	}

	// async _classifyIncident(e) {
		
	// 	const incidentCategorization = {
	// 		category: `${e.detail.category}`,
	// 		need: `${e.detail.need}`,
	// 		issue: `${e.detail.issue}`
	// 	};

	// 	const returnValue = await super.classifyIncident(() => this._toggleBusyFlag(), incidentCategorization);

	// 	console.log(returnValue)
	// }



	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_handleChannelServiceError() {
		// this.horizonRouter.navigateToSystemError();
		return true;
	}
	// ---------------
	// PUBLIC METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_catagoryChanged(e) {
		this.category = e.detail.new;

	}

	_subCatagoryChanged(e) {
		this.need = e.detail.new;
		this._getIssues(e);

	}
	_issueChanged(e) {
		this.issue = e.currentTarget.value.issue;
	}

	async _getIssues(e) {
		const returnValue = await this.incidentManagementService.otherNeedIssueType(`Client Care`, e.detail.category, e.detail.need);

		if (returnValue.succeeded && returnValue.result) {
			console.log(returnValue.result)
			this.issues = returnValue.result.issues;
		} else {
			this._logger.log(`error`, `Failed to retrieve Other Needs Issue Type`, `_searchSpecificNeed`, returnValue.result);
		}
		// this.requestUpdate();
	}
	// ---------------
	// PRIVATE METHODS
	// ---------------


	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			capitec-modal {
				height: auto;
				width: 568px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-header-border-radius: 4px 4px 0px 0px;
				--theme-modal-body-border-radius: 4px 4px 4px 4px;
				--theme-modal-header-background-color: #F9EBDD;
				--theme-modal-footer-padding: 0px;

			}
			.headerError {
				--theme-modal-header-background-color: rgba(165, 19, 42, 0.15);
			}
			div[slot="header"] {
				width: 520px;
				height: auto;
			}

			.headerLabel {
				color: #3A3A3A;
				font-size: 18px;
				line-height: 24px;
				font-weight: 600;
			}
			div[slot="body"] {
				width: 568px;
				height: 628px;
				padding: 0;
			}
			capitec-alert-banner {
				width: 536px;
				height: 48px;
				color: #4A4848;
				--theme-alert-banner-error-font-weight: 600px;
				margin-bottom: 26px;
				margin-left: 16px;

			}
			div[slot="footer"] {
				height: 64px;
				width: 557px;
				padding: 8px 16px 0px 0px;
				border-top: 1px solid #E1E1E1;
			}
			.status-icon {
				height: var(--theme-icon-size-default,24px);
				width: 24px;
				margin-right: 16px;
			}
			.status-icon-error {
				height: var(--theme-icon-size-default,24px);
				width: 24px;
				margin-right: 16px;
				display: none;
			}
			.fieldLabel {
				color: #3E4547;
				font-size: 18px;
				line-height: 24px;
				font-weight: 600;
				margin-left: 16px;
				margin-bottom: 16px;
			}
			.label {
				color: #3A3A3A;
				font-size: 16px;
				line-height: 24px;
				margin-left: 16px;
				margin-bottom: 20px;
				margin-top: 16px;
			}
			capitec-select {
				width: 536px;
				height: 48px;
				margin-bottom: 16px;
				margin-left: 16px;
				margin-right: 16px;
			}
			capitec-text-field {
				width: 536px;
				height: 48px;
				margin-bottom: 16px;
				margin-left: 16px;
				margin-right: 16px;
			}
			.buttonGroup {
				margin-right: 16px;
				width: 557px;
			}
			`
		]
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUpdateModal()}
			${this._renderFeedback()}
		`;
	}

	_renderUpdateModal() {
		return html`
			<capitec-modal class="updateIncident" type="free" header-align="left">
			<div slot="header">
						<capitec-group layout="horizontal"style="margin-top: -10px;">
							<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
							<!-- <img class="status-icon-error" src="/images/error.svg"/> -->
							<capitec-label class="headerLabel" label="Update Incident"></capitec-label>
						</capitec-group>
				</div>
			<div slot="body">
				${this._inputFields()}
			</div>
			<div slot="footer">
				${this._footer()}
			</div>
		</capitec-modal>`;
	}

	_renderAlert() {
		return this.showAlert ? html`
		<capitec-alert-banner type="unsuccessful-red" label="${this.alertBannerMessage}" closable @click="${() => this._keyPress()}"></capitec-alert-banner>
		`: html``;
	}

	_inputFields() {
		return html `
			<capitec-label
				type="title"
				class="label"
				label="You will need to complete all fields in order to update the incident.">
			</capitec-label>
			<capitec-label
				type="title"
				class="label"
				label="If you cancel now the incident will be left blank.">
			</capitec-label>
			<capitec-label
				type="title"
				class="fieldLabel"
				label="Complete all fields">
			</capitec-label>
			${this._renderAlert()}
			<capitec-text-field
				display-field="category"
				.value="${this.category}"
				data="${this.categories}"
				type="search"
				@value-changed="${(e) => this._catagoryChanged(e)}">
			</capitec-text-field>
			<!-- <capitec-select
				label="Search client need"
				display-field="category"
				.value="${this.category}"
				.items="${this.categories}"
				@value-changed="${(e) => this._catagoryChanged(e)}">
			</capitec-select> -->
			<capitec-select
				label="Choose specific need"
				display-field="value"
				.value="${this.need}"
				.items="${this.specificNeeds}"
				@value-changed="${(e) => this._subCatagoryChanged(e)}"
				.error="${this.needError}"
				searchable>
			</capitec-select>
			<capitec-select
				label="Choose issue type"
				display-field="value"
				.value="${this.issue}"
				.items="${this.issueTypes}"
				@value-changed="${(e) => this._issueChanged(e)}"
				.error="${this.issueError}"
				searchable>
			</capitec-select>
		`;
	}

	_footer() {
		return html `
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center" class="buttonBroup">
				<capitec-button
					data-automation-id="update-dialog-cancel"
					id="id-cancel-button"
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>

				<capitec-button
					data-automation-id="update-dialog-cancel"
					id="id-update-button"
					type="primary"
					label="Update"
					@click="${() => this._updateClick(this.category, this.need, this.issue)}">
				</capitec-button>
			</capitec-group>
		`;
	 }

	 _renderFeedback() {
		return this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<horizon-feedback 
					@done="${(event) => this._done(event)}">
				</horizon-feedback>`
			: html``;
	}
}

window.customElements.define(`horizon-update-incident-dialog`, UpdateIncidentDialog);