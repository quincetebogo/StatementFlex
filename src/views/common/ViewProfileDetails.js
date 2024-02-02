import { css, html } from 'platform/elements';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { LANGUAGE_LIST } from 'app/constants/Common';
import { ViewBase } from 'app/views/common/ViewBase.js';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';

import 'app/components/dialogs/common/UpdateProfileDetails';

const DETAILS_TAB = {
	0: `Client Details`
};

const CLIENT_DETAILS = {
	PREFERENCES: `Preferences`,
	PERSONAL_DETAILS: `Personal details`,
	CONTACT_DETAILS: `Contact details`,
	ADDRESS: `Address`,
	EMPLOYMENT_DETAILS: `Employment details`,
	INCOME_DETAILS: `Income details`
};

const EMPLOYMENT_STATUS = {
	'MINOR_16': `Minor`, 
	'EMPLOYED': `Employed`,
	'SELF_EMPLOYED': `Self Employed`,
	'PENSIONER': `Pensioner`,
	'UNEMPLOYED': `Unemployed`
};

const INCOME_RANGE = [
	{ key: `NO_VALUE`, value: `< R1000` },
	{ key: `R1001_R6000`, value: `R1001 to R6000` },
	{ key: `R6001_R9000`, value: `R6001 to R9000` },
	{ key: `R9001_R15000`, value: `R9001 to R15000` },
	{ key: `R15000_R25000`, value: `R15001 to R25000` },
	{ key: `R25001_R35000`, value: `R25001 to R35000` },
	{ key: `R35001_R50000`, value: `R35001 to R50000` },
	{ key: `R50000`, value: `> R50000` }
];

const INCOME_FREQUENCY = [
	{ key: ` `, value: `None` },
	{ key: `A`, value: `Annually` },
	{ key: `B`, value: `Bi-Annually` },
	{ key: `Q`, value: `Quaterly` },
	{ key: `M`, value: `Monthly` },
	{ key: `F`, value: `Fortnightly` },
	{ key: `W`, value: `Weekly` }
];

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
		this.selectedTab = DETAILS_TAB[0];
		this.displayToast = false;
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.clientProfileService = new ClientProfileService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			showUpdatePreferenceModal: { state: true },
			displayToast: { state: true }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _updateProfileDetails() {
		await super._inicidentManager_(`update-language-preference`, () => this._toggleBusyFlag());
		this.showUpdatePreferenceModal = true;
	}
	
	_getSelectedTab(e) {
		this.selectedTab = DETAILS_TAB[e.detail.selectedIndex];
	}

	async _updateClientPreferences(preferredlanguage) {
		// CS call to update client preferences
		const isUpdateSuccess = await this._updatePreferences(preferredlanguage, this.callerInformation.cifNumber);
		
		this._showHideToast(isUpdateSuccess);
		this.showUpdatePreferenceModal = false;
		
		if (isUpdateSuccess) {
			this.callerInformation.languagePreference = preferredlanguage;
			this.horizonStore.setCallerInformation(this.callerInformation);
			this.clientDetails[CLIENT_DETAILS.PREFERENCES] = LANGUAGE_LIST.find((entry) => entry.key === preferredlanguage).value;
		}
		
	}

	_showHideToast(success) {
		if (success) {
			this.preferenceToastDetails = { type: `success`, header: `Success`, detail: `Preferred language updated.` };
		} else {
			this.preferenceToastDetails = { type: `error`, header: `Error`, detail: `Preferred language update failed.` };
		}

		this.displayToast = true;
		window.setTimeout(() => this._toggleToastDisplay(), 3000);
	}

	_toggleToastDisplay() {
		this.displayToast = false;
	}

	async _getEmployersList(searchValue) {
		// CS call to get Employer list to load dropdown on Update profile details modal 
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
			const details = returnValue.result;
			
			this.clientDetails = {
				[CLIENT_DETAILS.PREFERENCES]: {
					"Preferred Language": LANGUAGE_LIST.find((entry) => entry.key === this.callerInformation.languagePreference).value || this.callerInformation.languagePreference
				},
				[CLIENT_DETAILS.PERSONAL_DETAILS]: {
					"Title": this.callerInformation.title,
					"Name": formatStringAsPascalCase(this.callerInformation.firstName),
					"Surname": formatStringAsPascalCase(this.callerInformation.lastName),
					"Nickname": formatStringAsPascalCase(details.nickname),
					"Date of birth": this.callerInformation.birthdate,
					"Nationality": `SA`,
					"ID number / Passport Number": this.callerInformation.southAfricanIDNumber,
					"Cellphone number": this.callerInformation.verifiedTelephoneNumber // update the source value when service is ready
				},
				[CLIENT_DETAILS.CONTACT_DETAILS]: {
					"Home contact number": details.residentialPhoneNumber,
					"Work contact number": details.businessPhoneNumber,
					"Email address (unverified)": this.callerInformation.emailId
				},
				[CLIENT_DETAILS.ADDRESS]: {
					"Address line 1": details.residentialAddress.addressLine1,
					"Address line 2 (optional)": details.residentialAddress.addressLine2,
					"Suburb": details.residentialAddress.suburb,
					"City": details.residentialAddress.city,
					"Postal code": details.residentialAddress.postalCode
				},
				[CLIENT_DETAILS.EMPLOYMENT_DETAILS]: {
					"Employment status": EMPLOYMENT_STATUS[details.employmentStatus],
					"Employment type": formatStringAsPascalCase(details.employmentType, `_`),
					"Employer": details.employerName,
					"Industry": details.occupationCode
				},
				[CLIENT_DETAILS.INCOME_DETAILS]: {
					"Source funds": formatStringAsPascalCase(details.sourceOfFunds, `_`),
					"Expected income": INCOME_RANGE.find(range => details.incomeRange === range.key).value,
					"Income frequency": INCOME_FREQUENCY.find(freq => details.incomeFrequency === freq.key).value
				}
			};
		}
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
				${this._renderToast()}
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
				@update-preference="${(e) => this._updateClientPreferences(e.detail.preferredlanguage)}">
			</horizon-update-profile-details>`
		: html``;
	}
	
	_renderToast() {
		return this.displayToast
		? html`
			<capitec-toast 
				?hidden="${!this.displayToast}"
				type="${this.preferenceToastDetails.type}" 
				header="${this.preferenceToastDetails.header}" 
				detail="${this.preferenceToastDetails.detail}" 
				@click="${() => this.displayToast = false}"
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