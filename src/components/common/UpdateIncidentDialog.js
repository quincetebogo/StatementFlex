import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { Logger } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { searchOtherNeedMixin } from 'app/views/common/SearchOtherNeedMixin';


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
};

export class UpdateIncidentDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.alertBannerMessage = ``;
		this.categories = [];
		this.specificNeeds = [];
		this.issueTypes = [];

		this.category = ``;
		this.need = ``;
		this.issue = ``;

		this.errorColor = ``;
		this.iconSource = `/images/statusIcons/horizon-warning-trans.svg`;

		this.isBusy = false;
		this.showAlert = false;

		this.horizonStore = HorizonStore.getInstance();
		this._logger = Logger.getInstance();

		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		Object.assign(UpdateIncidentDialog.prototype, searchOtherNeedMixin);

	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			showAlert: { type: Boolean, attribute: false },
			category: { type: String, attribute: false },
			need: { type: String, attribute: false },
			issue: { type: String, attribute: false },
			alertBannerMessage: { type: String, attribute: false },
			errorColor: { type: String, attribute: false },
			isBusy: { attribute: false },
			renderMode: { attribute: false }
		};
	};

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._prePopulateNeed();
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
		this.errorColor = ``;
		this.iconSource = `/images/statusIcons/horizon-warning-trans.svg`;
	}

	async _categoryChanged(e) {
		this._keyPress();
		if (e.detail.new !== null) {
			this.category = e.detail.new;
			this.need = ``;
			this.issue = ``;
			this.alertBannerMessage = ``;
			
			await this.getSubCategories({ detail: { category: this.category } });
		}
	}

	async _subCategoryChanged(e) {
		this._keyPress();
		if (e.detail.new !== null) {
			this.need = e.detail.new;
			this.issue = ``;
			this.alertBannerMessage = ``;

			await this.getIssues({ detail: { category: this.category, need: this.need } });
		}
	}

	_issueChanged(e) {
		this._keyPress();
		this.issue = e.currentTarget.value.issue;
		this.alertBannerMessage = ``;
	}

	_updateClick(e) {
		if (isNullorEmpty(this.need) || isNullorEmpty(this.issue)) {
			this.showAlert = true;
			this.alertBannerMessage = `You must complete all fields to update`;
			this.errorColor = `headerError`;
			this.iconSource = `/images/common/error-stroke.svg`;

			if (isNullorEmpty(this.need)) {
				this.needError = `Required field`;
			} 
			if (isNullorEmpty(this.issue)) {
				this.issueError = `Required field`;
			}
		} else {
			this._keyPress();
			this.dispatchEvent(new CustomEvent(`on-update`, { detail: { category: this.category, need: this.need, issue: this.issue } }));
		}
	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_handleChannelServiceError() {
		return true;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _prePopulateNeed() {
		const screenDetails = this.horizonStore.getScreenDetails() || {};
		
		this.category = screenDetails.category || ``;
		this.need = screenDetails.subCategory || ``;
		this.issue = screenDetails.issue || ``;

		await this.getCategories();

		if (!isNullorEmpty(this.category)) {
			await this.getSubCategories({ detail: { category: this.category } });
		}

		if (!isNullorEmpty(this.need)) {
			await this.getIssues({ detail: { category: this.category, need: this.need } });
		}
	}

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
				--theme-modal-header-background-color: #F7E2E1;
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
			horizon-alert-banner {
				width: 536px;
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
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUpdateModal()}
		`;
	}

	_renderUpdateModal() {
		return html`
			<capitec-modal class="updateIncident ${this.errorColor}" type="free" header-align="left">
			<div slot="header">
				<capitec-group 
					layout="horizontal"
					style="margin-top: -10px;">
					<img class="status-icon" src="${this.iconSource}"/>
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
		return this.showAlert
			? html`
				<horizon-alert-banner
					type="error"
					label="${this.alertBannerMessage}"
					@click="${() => this._keyPress()}"
					closable>
				</horizon-alert-banner>`
			: html``;
	}

	_inputFields() {
		return html`
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

			<capitec-select
				label="Search client need"
				display-field="category"
				id-field="category"
				.value="${this.category}"
				.items="${this.categories}"
				@value-changed="${(e) => this._categoryChanged(e)}"
				searchable>
			</capitec-select>
			<capitec-select
				label="Choose specific need"
				display-field="need"
				id-field="need"
				.value="${this.need}"
				.items="${this.needs}"
				@value-changed="${(e) => this._subCategoryChanged(e)}"
				.error="${this.needError}"
				labelAsPlaceholder
				searchable>
			</capitec-select>
			<capitec-select
				label="Choose issue type"
				display-field="issue"
				id-field="issue"
				.value="${this.issue}"
				.items="${this.issues}"
				@value-changed="${(e) => this._issueChanged(e)}"
				.error="${this.issueError}"
				labelAsPlaceholder
				searchable>
			</capitec-select>
		`;
	}

	_footer() {
		return html`
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
					@click="${(e) => this._updateClick(e)}">
				</capitec-button>
			</capitec-group>
		`;
	 }
}

window.customElements.define(`horizon-update-incident-dialog`, UpdateIncidentDialog);