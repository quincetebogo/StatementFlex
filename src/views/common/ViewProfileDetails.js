import { DETAILS_TYPE, EMPLOYMENT_STATUS, EMPLOYMENT_TYPE, INCOME_FREQUENCY, INCOME_RANGE, INDUSTRY_CODE, SOURCE_FUNDS, getValue } from 'app/constants/ficaDetails';
import { css, html } from 'platform/elements';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { LANGUAGE_LIST } from 'app/constants/Common';
import { ViewBase } from 'app/views/common/ViewBase.js';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/UpdateProfileDetails';

const DETAILS_TAB = {
	0: `Client Details`
};

const TOAST = {
	success: {
		language: `Preferred language updated.`,
		fica: `Client details updated`
	},
	error: {
		language: `Preferred language update failed.`,
		fica: `Client details update failed.`
	}
};

/**
 * View to display and update Client profile details
 * 
 * @export 
 * @class ViewProfileDetails
 * @extends {View}
 */
export class ViewProfileDetails extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.showUpdatePreferenceModal = false;
		this.clientDetails = {};
		this.clientFICADetails = {};
		this.selectedTab = DETAILS_TAB[0];
		this.displaylanguageToast = false;
		this.displayficaToast = false;
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.horizonRouter = HorizonRouter.getInstance();
		this.clientProfileService = new ClientProfileService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	async disconnectedCallback() {
		if (this.horizonIncidentManager.incidentDetails.currentNeed === `fica-details-enquiry`) {
			await super.classifyIncident(() => this._toggleBusyFlag());
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		}

		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			showUpdatePreferenceModal: { state: true },
			displaylanguageToast: { state: true },
			displayficaToast: { state: true },
			clientDetails: { attribute: false }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_updateProfileDetails() {
		this.showUpdatePreferenceModal = true;
	}
	
	_getSelectedTab(e) {
		this.selectedTab = DETAILS_TAB[e.detail.selectedIndex];
	}

	async _updateClientDetails(details) {
		const serviceCalls = [];
		const ficaRequest = {
			"correlationId": this.clientFICADetails.correlationId,
			...details.ficaDetails
		};

		if (details.preferredlanguage && details.ficaDetails) {
			// When trying to update Preferred language and FICA details
			await super._inicidentManager_(`update-language-preference`, () => this._toggleBusyFlag());
		
			serviceCalls.push(this._updatePreferences(details.preferredlanguage, this.callerInformation.cifNumber));
			serviceCalls.push(this.clientProfileService.updateFICADetails(ficaRequest, this.callerInformation.cifNumber));

			const returnValues = await Promise.allSettled(serviceCalls);

			const isLanguageUpdated = returnValues[0].status === `fulfilled` && returnValues[0].value;
			await this._updateClientPreferences(details.preferredlanguage, isLanguageUpdated);

			const isDetailsUpdated = returnValues[1].status === `fulfilled` && returnValues[1].value.succeeded;
			this._updateClientFICADetails(details.ficaDetails, isDetailsUpdated);

		} else if (details.preferredlanguage) {
			// When trying to update only Preferred language
			await super._inicidentManager_(`update-language-preference`, () => this._toggleBusyFlag());
			
			const isLanguageUpdated = await this._updatePreferences(details.preferredlanguage, this.callerInformation.cifNumber);
			this._updateClientPreferences(details.preferredlanguage, isLanguageUpdated);
		} else if (details.ficaDetails) {
			// When trying to update only FICA details
			const isDetailsUpdated = await this.clientProfileService.updateFICADetails(ficaRequest, this.callerInformation.cifNumber);
			this._updateClientFICADetails(details.ficaDetails, isDetailsUpdated.succeeded);
		}
	}

	async _updateClientFICADetails(updatedDetails, isUpdateSuccess) {
		await this._createClassifyAndUpdateIncident(`update-fica-details`, isUpdateSuccess);
		
		this._showHideToast(isUpdateSuccess, `fica`);
		this.showUpdatePreferenceModal = false;
		
		if (isUpdateSuccess) {
			Object.keys(updatedDetails).map(key => this.clientFICADetails[key] = updatedDetails[key]);
			this._formatProfileData();
		}
	}

	_updateClientPreferences(preferredlanguage, isUpdateSuccess) {
		this._showHideToast(isUpdateSuccess, `language`);
		this.showUpdatePreferenceModal = false;
		
		if (isUpdateSuccess) {
			this.callerInformation.languagePreference = preferredlanguage;
			this.horizonStore.setCallerInformation(this.callerInformation);
			this.clientDetails[DETAILS_TYPE.PREFERENCES][`Preferred Language`] = getValue(LANGUAGE_LIST, preferredlanguage);
		}
	}

	async _createClassifyAndUpdateIncident(need, succeeded) {
		await super._inicidentManager_(need, () => this._toggleBusyFlag());
		await super.createAndClassifySubIncident(null);

		this.horizonIncidentManager.incidentState = succeeded 
													? super.HORIZON_NEED_STATUS.COMPLETED 
													: super.HORIZON_NEED_STATUS.FAILED;
	}

	_showHideToast(success, toastType) {
		if (success) {
			this[`${toastType}ToastDetails`] = { type: `success`, header: `Success`, detail: TOAST.success[toastType] };
		} else {
			this[`${toastType}ToastDetails`] = { type: `error`, header: `Error`, detail: TOAST.error[toastType] };
		}

		this[`display${toastType}Toast`] = true;
		window.setTimeout(() => this._toggleToastDisplay(), 3000);
	}

	_toggleToastDisplay() {
		this.displaylanguageToast = false;
		this.displayficaToast = false;
	}

	async _getEmployersList(searchValue) {
		const returnValue = await this.clientProfileService.getEmployer(searchValue);
		if (returnValue.succeeded) {
			return returnValue; // return employer list
		} 
			return null;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		const returnValue = await this.clientProfileService.getClientDetails(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.clientFICADetails = returnValue.result;
			this._formatProfileData();

			await super._inicidentManager_(`fica-details-enquiry`, () => this._toggleBusyFlag());
			await super.createAndClassifySubIncident(null, false);
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	_formatProfileData() {
		const details = this.clientFICADetails;

		this.clientDetails = {
			[DETAILS_TYPE.PREFERENCES]: {
				"Preferred Language": getValue(LANGUAGE_LIST, this.callerInformation.languagePreference) || this.callerInformation.languagePreference
			},
			[DETAILS_TYPE.PERSONAL_DETAILS]: {
				"Title": this.callerInformation.title,
				"Name": formatStringAsPascalCase(this.callerInformation.firstName),
				"Surname": formatStringAsPascalCase(this.callerInformation.lastName),
				"Nickname": formatStringAsPascalCase(details.nickname),
				"Date of birth": this.callerInformation.birthdate,
				"Nationality": details.nationalityCode,
				"ID number / Passport Number": this.callerInformation.southAfricanIDNumber,
				"Cellphone number": this.callerInformation.verifiedTelephoneNumber
			},
			[DETAILS_TYPE.CONTACT_DETAILS]: {
				"Home contact number": details.residentialPhoneNumber,
				"Work contact number": details.businessPhoneNumber,
				"Email address": this.callerInformation.emailId
			},
			[DETAILS_TYPE.ADDRESS]: {
				"Address line 1": formatStringAsPascalCase(details.residentialAddress.address1),
				"Address line 2 (optional)": formatStringAsPascalCase(details.residentialAddress.address2),
				"Suburb": formatStringAsPascalCase(details.residentialAddress.suburb),
				"City": formatStringAsPascalCase(details.residentialAddress.city),
				"Postal code": details.residentialAddress.postalCode
			},
			[DETAILS_TYPE.EMPLOYMENT_DETAILS]: {
				"Employment status": getValue(EMPLOYMENT_STATUS, details.employmentStatus),
				"Employment type": getValue(Object.values(EMPLOYMENT_TYPE).flat(), details.employmentType),
				"Employer": details.employerName,
				"Industry": getValue(INDUSTRY_CODE, details.industryCode)
			},
			[DETAILS_TYPE.INCOME_DETAILS]: {
				"Source of funds": getValue(Object.values(SOURCE_FUNDS).flat(), details.sourceOfFunds),
				"Expected monthly income": getValue(INCOME_RANGE, details.incomeRange.toString()),
				"Income frequency": getValue(INCOME_FREQUENCY, details.incomeFrequency)
			}
		};
	}

	_errorHandler(ex) {
		return true;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					width: 100%;
					height: 888px;
				}

				/* Title Bar styles */
				capitec-title-bar {
					--theme-titlebar-padding: 12px 16px;
					margin-bottom: 0px;
					border-bottom-width: 0px;
					--theme-titlebar-item-gap: 0px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 22px;
					--theme-label-title-font-weight: 600;
					margin-left: 16px;
				}
				capitec-title-bar > capitec-icon {
					--theme-icon-size-medium: 24px;
				}

				/* Main view styles */
				capitec-tab-group {
					height: 760px;
					--theme-tab-hover-background-color: transparent;
					--theme-tab-indicator-border-radius: 0px;
					--theme-tab-border-bottom: 0px;
					--theme-tab-font-weight: 500;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-top: 0px;
					--theme-tab-bar-height: 64px;
					--theme-tab-label-padding-left-right: 16px;
				}
				.other-options {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;

					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
				}
				horizon-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px 0px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				capitec-button-bar {
					--theme-buttonbar-padding: 6px 16px 6px 24px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-button {
					height: 48px;
					margin-left: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
				capitec-toast {
					width: 406px;
					position: absolute;
					top: var(--toast-top, 56px);
					--theme-toast-padding: 12px;
					--theme-toast-close-size: 24px;
					margin-left: var(--toast-margin-left, 382px);
				}
				.secondary-toast {
					--toast-top: 130px;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {

		return html`
			${this._renderViewProfileDetails()}
			${this._renderUpdateProfileDetailsModal()}
			${this._renderLoadingIndicator()}
			${super._webTemplate()}
		`;
	}

	_renderViewProfileDetails() {
		return html`
		<capitec-card 
			data-automation-id="view-profile-details-screen"
			class="card">
				${this._renderToast(this.displaylanguageToast, this.languageToastDetails)}
				${this._renderToast(this.displayficaToast, this.ficaToastDetails)}
				<capitec-title-bar 
					data-automation-id="view-profile-details-title"
					type="default">
						<capitec-icon
							size="medium"
							icon="system/profile-action">
						</capitec-icon>
						<capitec-label label="View Profile" type="Title"></capitec-label>
				</capitec-title-bar>
				${this._renderDetailsTab()}
				${this._renderFooter()}
		</capitec-card>`;
	}

	_renderDetailsTab() {
		return html`
			<capitec-tab-group class="tabs" @tab-select="${(e) => this._getSelectedTab(e)}">
				${this._renderClientDetails()}
			</capitec-tab-group>`;
	}

	_renderClientDetails() {
		return html`
			<capitec-tab
					data-automation-id="view-profile-client-details-tab"
					label="Client Details">
					${Object.entries(this.clientDetails).map(detail => {
						const [header, fields] = detail;
					
						return html`<capitec-title-bar
								type="default"
								label=${header}
								class="other-options">
							</capitec-title-bar>
							<capitec-group
								layout="horizontal"
								gap="none"
								halign="left"
								valign="top"
								wrap>
									${this._renderFields(fields)}
							</capitec-group>`;
					})}
						
			</capitec-tab>
		`;
	}

	_renderFields(fields) {
		return Object.entries(fields).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					label="${label}"
					value="${value || `-`}"
					data-automation-id="view-profile-details-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>
				<capitec-button 
					data-automation-id="view-profile-details-update-button"
					type="primary"
					label="Update"
					@click="${() => this._updateProfileDetails()}">
				</capitec-button>
			</capitec-button-bar>`;
	}

	_renderUpdateProfileDetailsModal() {
		return this.showUpdatePreferenceModal
		? html`
			<horizon-update-profile-details
				header="${this.selectedTab}"
				.clientDetails="${this.clientDetails}"
				.getEmployersList="${(value) => this._getEmployersList(value)}"
				@cancel="${() => this.showUpdatePreferenceModal = false}"
				@update-details="${(e) => this._updateClientDetails(e.detail)}">
			</horizon-update-profile-details>`
		: html``;
	}
	
	_renderToast(displayToast, details) {
		return displayToast
		? html`
			<capitec-toast 
				class="${details.detail === TOAST.success.fica || details.detail === TOAST.error.fica ? `secondary-toast` : ``}"
				?hidden="${!displayToast}"
				type="${details.type}" 
				header="${details.header}" 
				detail="${details.detail}" 
				@click="${() => displayToast = false}"
				closable >
			</capitec-toast>`
		: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="view-base-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}

customElements.define(`horizon-view-profile-details`, ViewProfileDetails);