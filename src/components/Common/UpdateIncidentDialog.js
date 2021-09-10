import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { Logger, Configuration } from 'platform/core';

/**
 *  This is a common dialog format in the Horizon Project.
 * 
 * @export
 * @class UpdateIncidentDialog
 * @extends {Component}
 */

export class UpdateIncident extends Component {

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

			category: { type: String },
			need: { type: String },
			issue: { type: String },

			isBusy: { attribute: false }
		}
	};

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const callerInformation = this.horizonStore.getCallerInformation() || {};
		console.log(callerInformation)
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_keyPress() {
		// Clear the error string
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

	/*async*/ _updateClick() {

			this.dispatchEvent(new CustomEvent(`update-strack`, { detail: { category: this.category, need: this.need, issue: this.issue, postAction : this } }));
		
		// const incidentDetails = this.horizonStore.getIncidentDetails();
		// const strackIncidentInfo = await this._incidentStatus(incidentDetails.incidentRecId) || {};
		// const ivrActionMapping = await this._getNeedActions();
		// const needAction = ivrActionMapping[incidentDetails.currentNeed]
		// console.log("incidentDetails", incidentDetails);
		// console.log("sTrackIncidentDetails", strackIncidentInfo);
		// // console.log("IVR", ivrActionMapping);
		// // console.log("needAction", needAction);

		// const request = {
		// 	incidentRecId: incidentDetails.incidentRecId,
		// 	ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
		// 	needAction: needAction,
		// 	incidentCategorization: null
		// }

		// const returnValue = await this.incidentManagementService.classifyIncident(request);

		// console.log(returnValue)
	}

	_cancelClick() {
		console.log("cancel")
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
		if (!isNullorEmpty(e.detail.new)) {
			this.category = e.detail.new;
			
			this.dispatchEvent(new CustomEvent(`get-sub-categories`, { detail: { category: this.category } }));
		}
	}

	_subCatagoryChanged(e) {
		if (!isNullorEmpty(e.detail.new)) {
			this.need = e.detail.new;

			this.dispatchEvent(new CustomEvent(`get-issues`, { detail: { category: this.category, need: this.need } }));
		}
	}
	_issueChanged(e) {
		this.issue = e.currentTarget.value.issue;
		this.solution = this.issues.find(item => item.issue === this.issue).solution;
		this.dispatchEvent(new CustomEvent(`issue-changed`, { detail: { category: this.category, need: this.need, issue: this.issue } }));
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
				--theme-modal-header-padding-top: 21px;
				--theme-modal-header-padding-bottom: 21px;
				--theme-modal-header-padding-left: 40px;
				--theme-modal-header-border-radius: 4px 4px 0px 0px;
				--theme-modal-body-border-radius: 4px 4px 4px 4px;
				--theme-modal-header-background-color: rgba(212,120,28,0.15);
				--theme-modal-footer-padding: 0px;

				--theme-modal-header-color: #3A3A3A;
				font-size: 18px;
				line-height: 24px;
				font-weight: 600;
			}
			div[slot="body"] {
				width: 568px;
				height: 628px;
				padding: 0;
			}
			div[slot="header"] {
				height: 64px;
				width: 568px;
				align-content: left;
			}
			div[slot="footer"] {
				height: 64px;
				width: 568px;
				padding: 8px 0px 0px 0px;
				border-top: 1px solid #E1E1E1;
			}
			capitec-icon > .modalIcon {
				padding-left: 16px;
				padding-right: 10px;
				--theme-icon-size-small: 24px;
				
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
			.buttonGroup {
				margin-right: 16px;
			}
			`
		]
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal class="updateIncident" type="free" header-align="left" header="${this.headerLabel}">
				<capitec-icon slot="header" class="modalIcon" size="default" icon="status/warning-trans"></capitec-icon>
			<div slot="body">
				${this._inputFields()}
			</div>
			<div slot="footer">
				${this._footer()}
			</div>
			</capitec-modal>
		`;
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
			<capitec-select
				label="Search client need"
				display-field="category"
				.value="${this.category}"
				.items="${this.categories}"
				@value-changed="${(e) => this._catagoryChanged(e)}">
			</capitec-select>
			<capitec-select
				label="Choose specific need"
				display-field="value"
				.value="${this.need}"
				.items="${this.specificNeeds}"
				@value-changed="${(e) => this._subCatagoryChanged(e)}"
				searchable>
			</capitec-select>
			<capitec-select
				label="Choose issue type"
				display-field="value"
				.value="${this.issue}"
				.items="${this.issueTypes}"
				@value-changed="${(e) => this._issueChanged(e)}"
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
					@click="${() => this._updateClick()}">
				</capitec-button>
			</capitec-group>
		`;
	 }
}

window.customElements.define(`horizon-update-incident`, UpdateIncident);