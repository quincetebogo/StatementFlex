import { Component, css, html } from 'platform/elements';
import { EMAIL_DOMAINS, LANGUAGE_LIST } from 'app/constants/Common';
import { EMPLOYMENT_STATUS, EMPLOYMENT_TYPE, ERROR, FIELDS, INCOME_FREQUENCY, INCOME_RANGE, INDUSTRY_CODE, DETAILS_TYPE as MENU_ITEMS, SOURCE_FUNDS, getKey, getValue } from 'app/constants/ficaDetails';
import { Utilities } from 'platform/Utilities';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonSelectIcon';

const EMAIL_REGEX = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;
const EMAIL_REQUIRED = `Enter a valid email address i.e.email@gmail.com`;
const CONTACT_NUMBER = /^[0-9]{10}$/;
const NICKNAME = /^[A-Za-z0-9 ]{0,20}$/;

export class UpdateProfileDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.header = ``;
		this.selectedMenuItem = MENU_ITEMS.PREFERENCES;
		
		this.emailSuggestion = ``;
		this.emailError = ``;

		this.updatedClientDetails = {};
		this.ficaDetails = {};
		this.employerList = [];

		this.showAddEmployerModal = false;
		this.displayIndustryCode = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} header update profile details modal header .
	 * @property {Object} clientDetails client details
	 * @property {Object} getEmployersList Call back function to get employers list while searching
	 */

	static get properties() {
		return {
			header: { type: String },
			clientDetails: { type: Object },
			getEmployersList: { type: Object },

			updatedClientDetails: { attribute: false },
			preferredLanguage: { attribute: false },
			selectedMenuItem: { attribute: false },
			showAddEmployerModal: { attribute: false },

			email: { attribute: false },
			emailSuggestion: { attribute: false },
			emailError: { attribute: false },
			employerList: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.preferredLanguage = this.clientDetails[MENU_ITEMS.PREFERENCES][FIELDS.PREFERRED_LANGUAGE];
		this.email = this.clientDetails[MENU_ITEMS.CONTACT_DETAILS][FIELDS.EMAIL];

		this.updatedClientDetails = {
					nickname: this.clientDetails[MENU_ITEMS.PERSONAL_DETAILS][FIELDS.NICKNAME],
					residentialAddress: {
						address1: this.clientDetails[MENU_ITEMS.ADDRESS][FIELDS.LINE_1],
						address2: this.clientDetails[MENU_ITEMS.ADDRESS][FIELDS.LINE_2],
						suburb: this.clientDetails[MENU_ITEMS.ADDRESS][FIELDS.SUBURB],
						city: this.clientDetails[MENU_ITEMS.ADDRESS][FIELDS.CITY],
						postalCode: this.clientDetails[MENU_ITEMS.ADDRESS][FIELDS.POSTAL_CODE]
					},
					residentialPhoneNumber: this.clientDetails[MENU_ITEMS.CONTACT_DETAILS][FIELDS.RES_PHONE_NO],
					businessPhoneNumber: this.clientDetails[MENU_ITEMS.CONTACT_DETAILS][FIELDS.WORK_PHONE_NO],
					emailAddress: this.clientDetails[MENU_ITEMS.CONTACT_DETAILS][FIELDS.EMAIL],
					employmentStatus: getKey(EMPLOYMENT_STATUS, this.clientDetails[MENU_ITEMS.EMPLOYMENT_DETAILS][FIELDS.EMP_STATUS]),
					employmentType: getKey(Object.values(EMPLOYMENT_TYPE).flat(), this.clientDetails[MENU_ITEMS.EMPLOYMENT_DETAILS][FIELDS.EMP_TYPE]),
					employerName: this.clientDetails[MENU_ITEMS.EMPLOYMENT_DETAILS][FIELDS.EMPLOYER],
					industryCode: getKey(INDUSTRY_CODE, this.clientDetails[MENU_ITEMS.EMPLOYMENT_DETAILS][FIELDS.INDUSTRY]),
					sourceOfFunds: getKey(Object.values(SOURCE_FUNDS).flat(), this.clientDetails[MENU_ITEMS.INCOME_DETAILS][FIELDS.SOF]),
					incomeRange: getKey(INCOME_RANGE, this.clientDetails[MENU_ITEMS.INCOME_DETAILS][FIELDS.EXP_INCOME]),
					incomeFrequency: this.clientDetails[MENU_ITEMS.INCOME_DETAILS][FIELDS.INCOME_FREQUENCY]
			};
		// Deep Copying the values before they are update - used for comparing whether the value is changed while saving
		this.ficaDetails = Utilities.deepCopy(this.updatedClientDetails);
	}

	async updated(changedProperties) {
		await this.updateComplete;

		const emailChange = Boolean(changedProperties.get(`email`));

		if (emailChange) {
			this._showDomainSuggestions(this.email);
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_selectMenuitem(e) {
		this.selectedMenuItem = e.detail.label;
	}

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_saveChanges() {
		this.dispatchEvent(new CustomEvent(`update-details`, { detail: {
			preferredlanguage: this.clientDetails[MENU_ITEMS.PREFERENCES][FIELDS.PREFERRED_LANGUAGE] === this._getLanguageValue(this.preferredLanguage) ? null : this.preferredLanguage,
			ficaDetails: Object.keys(this._hasDetailsChanged()).length === 0 ? null : this._hasDetailsChanged()
		} }));
	}
	
	_selectPreferredLanguage(e) {
		if (e.detail.old === e.detail.new.key) {
			return;
		}
		this.preferredLanguage = e.detail.new.key;
	}

	_inputEmail(e) {
		if (e.detail) {
			this.emailError = ``;
			this.updatedClientDetails.emailAddress = this.email = e.detail.new;
			this._validateEmail();
		}
	}

	_keyDownTab(evt) {
		if (evt.keyCode === 9) {
			this.email = `${this.email}${this.emailSuggestion}`;
			this.emailSuggestion = ``;
			this._validateEmail();
			this.requestUpdate();
		}
	}

	_focusOutInput() {
		this.emailSuggestion = ``;
		if (!this.email) {
			// When value is empty, don't do any further checks
			return true;
		}
	}
	
	_detailsChange(field, value, subField) {
		if (subField) {
			this.updatedClientDetails[`${field}`][`${subField}`] = value;
		} else {
			this.updatedClientDetails[`${field}`] = value;
		}
		this.requestUpdate();
	}

	_empStatusChange(e) {
		this.updatedClientDetails.employmentStatus = e.detail.new.key;

		if (this.updatedClientDetails.employmentStatus !== `EMPLOYED` || this.updatedClientDetails.employmentStatus !== `SELF_EMPLOYED`) {
			this.updatedClientDetails.employerName = ``;
			this.updatedClientDetails.industryCode = `NONE`;
		}

		this._validateEmploymentDetails();
		// Emptying the below values as they are dependent on Employement status
		this.updatedClientDetails.employerName = ``;
		this.updatedClientDetails.employmentType = `NONE`;
		this.updatedClientDetails.industryCode = `NONE`;
		this.updatedClientDetails.sourceOfFunds = `NO_VALUE`;

		this.requestUpdate();
	}

	_employerChange(name) {
		this.updatedClientDetails.employerName = name;
		this.updatedClientDetails.industryCode = `NOT_SELECTED_YET`;

		this.requestUpdate();
	}

	_onAddEmpCancelClick() {
		this.showAddEmployerModal = false;
		const empSelect = this.shadowRoot.getElementById(`emp-select`);
		empSelect.removeAttribute(`data-popup`);
	}

	_saveEmpDetails() {
		this.updatedClientDetails.employerName = this.newEmployerName;
		this.updatedClientDetails.industryCode = this.newEmployerCode;
		this.displayIndustryCode = true;
	
		this.showAddEmployerModal = false;
		const empSelect = this.shadowRoot.getElementById(`emp-select`);
		empSelect.removeAttribute(`data-popup`);
	}

	async _getEmployersList(event) {
		const returnValue = await this.getEmployersList(event.detail.new);

		if (returnValue?.result) {
			this.employerList = returnValue.result.employerList.filter(emp => emp.employerNumber !== -1);
			const empSelect = this.shadowRoot.getElementById(`emp-select`);
			empSelect.setAttribute(`data-popup`, ``);
		}
		this.displayIndustryCode = false;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_getLanguageValue(languagePreference) {
		const result = LANGUAGE_LIST.find((entry) => entry.key === languagePreference);
		return result ? result.value : this.clientDetails[MENU_ITEMS.PREFERENCES][FIELDS.PREFERRED_LANGUAGE];
	}

	_isSaveDisabled() {
		const languageUnChanged = this.clientDetails[MENU_ITEMS.PREFERENCES][FIELDS.PREFERRED_LANGUAGE] === this._getLanguageValue(this.preferredLanguage);
		
		const detailsUnChanged = Object.keys(this._hasDetailsChanged()).length === 0;
		
		const validationErrors = Boolean(this.emailError) || 
								 Boolean(this._validateContactNumber(this.updatedClientDetails.residentialPhoneNumber)) || 
								 Boolean(this._validateContactNumber(this.updatedClientDetails.businessPhoneNumber)) ||
								 Boolean(this._validateEmploymentDetails()) ||
								 Boolean(this._validateEmploymentType()) ||
								 Boolean(this._validateNickname()) ||
								 this._validateRequiredFields();
		return (languageUnChanged && detailsUnChanged) || validationErrors;
	}

	_hasDetailsChanged () {
		const output = {};
		const address = {};

		const addressChange = Object.keys(this.updatedClientDetails.residentialAddress).map((key) => {
									if (this.updatedClientDetails.residentialAddress[key] !== this.ficaDetails.residentialAddress[key]) {
										return key;
									}
									return null;
								}).filter(Boolean);

		const detailsChange = Object.keys(this.updatedClientDetails).map((key) => {
									if (typeof this.updatedClientDetails[key] !== `object` && this.updatedClientDetails[key] !== this.ficaDetails[key]) {
										return key;
									}
									return null;
								}).filter(Boolean);

		addressChange.forEach(item => address[item] = this.updatedClientDetails.residentialAddress[item]);
		detailsChange.forEach(item => output[item] = this.updatedClientDetails[item]);

		if (Object.keys(address).length > 0) {
			// CS expects entire residentialAddress set for updating even a single item on the set. Only address2 is optional
			const obj = { ...output, residentialAddress: this.updatedClientDetails.residentialAddress };
			return obj;
		}
		return output;
	}

	_showDomainSuggestions(value) {
		if (value.indexOf(`@`) > -1) {
			const change = value.split(`@`);
			const suggestFor = change[1];

			if (suggestFor) {
				const inputReplica = this.shadowRoot.getElementById(`email-replica`);

				const textField = this.shadowRoot.getElementById(`email`);
				const textFieldStyles = getComputedStyle(textField);
				const paddingLeft = textFieldStyles?.getPropertyValue(`--theme-input-padding-left`);

				const suggestionElem = this.shadowRoot.getElementById(`email-suggestion`);
				suggestionElem.style.setProperty(`left`, `calc(${inputReplica.offsetWidth + 3}px + ${paddingLeft})`);

				const suggestionValue = EMAIL_DOMAINS.find(item => item.startsWith(suggestFor.toLowerCase()));
				this.emailSuggestion = suggestionValue?.substring(suggestFor.length) ?? ``;
			} 
			return;
		}
		this.emailSuggestion = ``;
	}
	
	_validateNickname() {
		if (!RegExp(NICKNAME).test(this.updatedClientDetails.nickname)) {
			return ERROR.NICK_NAME;
		}
		return ``;
	}

	_validateEmail() {
		const isValid = EMAIL_REGEX.test(this.email); 
	
		this.emailError = isValid ? `` : EMAIL_REQUIRED;
	}

	_validateContactNumber(value) {
		if (value && !RegExp(CONTACT_NUMBER).test(value)) {
			return ERROR.CONTACT_NUMBER;
		}
		return ``;
	}

	_validateEmploymentType() {
		if (this.updatedClientDetails?.employmentStatus !== `MINOR_16` && this.updatedClientDetails.employmentType === `NONE`) {
			return ERROR.EMP_TYPE;
		}
		return ``;
	}

	_validateEmploymentDetails() {
		if (this.updatedClientDetails.employmentStatus === `EMPLOYED` && isNullorEmpty(this.updatedClientDetails.employerName)) {
			return ERROR.EMP_NAME;
		}
		return ``;
	}

	_validateRequiredFields() {
		return isNullorEmpty(this.updatedClientDetails.residentialAddress.address1) ||
				isNullorEmpty(this.updatedClientDetails.residentialAddress.suburb) ||
				isNullorEmpty(this.updatedClientDetails.residentialAddress.city) ||
				isNullorEmpty(this.updatedClientDetails.residentialAddress.postalCode) ||
				isNullorEmpty(this.updatedClientDetails.incomeFrequency) || this.updatedClientDetails.incomeFrequency === `NONE` ||
				isNullorEmpty(this.updatedClientDetails.incomeRange) || this.updatedClientDetails.incomeRange === `NO_VALUE` ||
				isNullorEmpty(this.updatedClientDetails.sourceOfFunds) || this.updatedClientDetails.sourceOfFunds === `NO_VALUE`;
		
	}

	_getEmploymentStatusList() {
		const nonMinorList = EMPLOYMENT_STATUS.filter(item => item.key !== `MINOR_16`);
		const minorList = EMPLOYMENT_STATUS.filter(item => item.key === `MINOR_16`);
		
		return this._isMinorClient() ? minorList : nonMinorList;
	}

	_isMinorClient() {
		const clientDOB = this.clientDetails[MENU_ITEMS.PERSONAL_DETAILS][FIELDS.DOB];

		if (!clientDOB) {
			return false;
		}

		const today = new Date();
		const clientBirthDate = new Date(clientDOB);
	
		// Minimum age a client should meet for being a major ( > 16 years). 
		// ClientDOB after 'minMajorAge' are considered to be a minor client.
		const minMajorAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
	
		return minMajorAge < clientBirthDate;
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
				width: 694px;
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-header-padding-right: 16px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-footer-padding: 0px 16px 16px 0px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}

			.client-details {
				width: 856px;
				height: auto;
			}

			.add-employer {
				width: 600px;
				height: 600px;
			}

			.add-employer > capitec-content-box {
				padding: 16px 16px 80px 16px;
				height: inherit;
			}
			.add-employer capitec-text-field {
				margin-bottom: 8px;
				width: 568px;
			}

			.add-employer capitec-select {
				width: 568px;
				--theme-select-options-max-height: 400px;
			}

			.body-box {
				height: auto;
				margin: 0px 0px 0px 0px;
				--theme-container-padding-top : 13px;
				--theme-container-padding-bottom: 0px;
			}

			capitec-menu {
				height: 610px;
				--theme-menu-item-separator-padding-right: 0px;
				--theme-menu-item-separator-padding-left: 0px;
				--theme-menu-item-separator-padding-top: 0px;
				--theme-menu-item-separator-padding-bottom: 0px;
				--theme-menu-item-selected-indicator-height: 64px;
				--theme-menu-item-font-size: 16px;
    			--theme-menu-item-font-weight: 500;
				--theme-menu-item-selected-indicator-width: 2px;
				--theme-menu-item-selected-indicator-border-radius: 0px;
				--theme-menu-item-selected-background-color: #FFFFFF;
			}

			.details-group {
				width: auto;
				padding: 24px 16px;
				max-width: 600px;
				--theme-layout-gap-spacing: 16px;
			}

			capitec-text-field {
				width: 275px;
				margin-bottom: 28px;
				margin-top:8px;
				--theme-input-label-font-size: 12px;
				--theme-input-disabled-background-color: #F9F9F9;
			}

			.language-field {
				width: 568px;
			}

			capitec-select {
				width: 275px;
				margin-bottom: 28px;
				margin-top: 8px;
				--theme-input-label-font-size: 12px;
				--theme-input-disabled-background-color: #F9F9F9;
			}

			capitec-select[label="Income frequency"] {
				--theme-select-options-max-height: 300px;
			}

			#emp-select {
				position: absolute;
				width: 275px;
				margin-bottom: 28px;
				margin-top: 8px;
				--theme-input-label-font-size: 12px;
				--theme-input-padding-bottom: 8px;
				--theme-select-options-max-height: 286px;
				--theme-select-no-results-background-color: #FFFFFF;
			}

			#id-save-button {
				height: 48px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 24px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 24px;
				--theme-button-primary-border-width: 0px;
				--theme-button-line-height: 20px;
			}
			
			.domain-suggestion {
				display: block;
				box-sizing: content-box;
				font-family: var(--theme-input-font-family);
				font-size: var(--theme-input-font-size);
				font-weight: var(--theme-input-font-weight);
				line-height: normal;
				letter-spacing: 0px;
				top: var(--theme-input-email-top, -64px);
				position: relative;
				color: #a9a9a9;
				width: 100px;
				height: 12px;
			}
			.hint-height {
				--theme-input-email-top: -89px;
			}
			
			.hide-visibility {
				position: absolute;
				visibility: hidden;
			}
			.replica {
				--theme-label-default-font-size: val(--theme-input-font-size);
			}
			.label-no-results {
				--theme-label-default-font-size: 16px;
    			margin: 20px;
			}
			.add-emp-button {
				margin-bottom: 16px;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="${this.header}">
				<div slot="body" class="client-details">
					<capitec-content-box class="body-box" layout="horizontal" gap="none" halign="top" valign="left" noPadding>
					<capitec-menu hideFooter>
						${this._renderMenu()}
					</capitec-menu>
					${this._renderMenuDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			${this._renderAddEmployer()}
		`;
	}

	_renderAddEmployer() {
		return this.showAddEmployerModal
		? html`
			<capitec-modal type="free" header-align="left" header="Add Employer">
				<div slot="body" class="add-employer">
					<capitec-content-box class="body-box" layout="vertical" gap="clear" halign="top" valign="left">
						<capitec-text-field
							label="Employer name"
							@key-input="${(e) => this.newEmployerName = e.detail.new}">
						</capitec-text-field>

						<capitec-select 
							label="Industry"
							.items="${INDUSTRY_CODE.filter(code => !isNullorEmpty(code.value))}"
							display-field="value"
							id-field="key"
							@value-changed=${(e) => this.newEmployerCode = e.detail.new.key}>
						</capitec-select>
					</capitec-content-box>
				</div>
				<div slot="footer">
					<capitec-group layout="horizontal">
						<capitec-button
							label="Cancel"
							@click="${() => this._onAddEmpCancelClick()}">
						</capitec-button>

						<capitec-button
							id="id-save-button"
							type="primary"
							label="Save"
							@click="${() => this._saveEmpDetails()}">
						</capitec-button>
					</capitec-group>
				</div>
			</capitec-modal>`
		: html``;
	}

	_renderMenu() {
		return Object.keys(this.clientDetails).map(menuItem => html`
				<capitec-menu-item 
					label=${menuItem} 
					?selected=${this.selectedMenuItem === menuItem} 
					@click=${(e) => this._selectMenuitem(e)}>
				</capitec-menu-item>
				<capitec-menu-separator></capitec-menu-separator>
		`);
	}

	_renderMenuDetails() {
		return html`
		<capitec-group layout="horizontal"
						gap="clear"
						halign="top"
						valign="left"
						class="details-group"
						wrap>
						${this._renderPreferenceDetails()}
						${this._renderPersonalDetails()}
						${this._renderContactDetails()}
						${this._renderAddress()}
						${this._renderEmploymentDetails()}
						${this._renderIncomeDetails()}
		</capitec-group>`;
	}

	_renderPreferenceDetails() {
		return this.selectedMenuItem === MENU_ITEMS.PREFERENCES
		? html`
			<capitec-select
				data-automation-id="update-profile-language-preference"
				class="language-field"
				label="Preferred language"
				display-field="value"
				.items="${LANGUAGE_LIST}"
				@value-changed="${(e) => this._selectPreferredLanguage(e)}"
				tabindex=3
				id-field="value"
				.value="${this._getLanguageValue(this.preferredLanguage)}"
				select-mode="single">
			</capitec-select>
		`
		: html``;
	}

	_renderPersonalDetails() {
		const personalDetails = this.clientDetails[MENU_ITEMS.PERSONAL_DETAILS];

		return this.selectedMenuItem === MENU_ITEMS.PERSONAL_DETAILS
		? html`
			<capitec-text-field 
				label="Title" 
				value=${personalDetails[FIELDS.TITLE]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="Nickname" 
				value=${this.updatedClientDetails.nickname}
				type="alpha-numeric"
				keyboardMode="alpha-numeric"
				maxlength="40"
				error=${this._validateNickname()}
				@key-input=${(e) => this._detailsChange(`nickname`, e.detail.new)}>
			</capitec-text-field>

			<capitec-text-field 
				label="Name" 
				value=${personalDetails[FIELDS.NAME]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="Surname" 
				value=${personalDetails[FIELDS.SURNAME]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="Date of birth" 
				value=${personalDetails[FIELDS.DOB]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="Nationality" 
				value=${personalDetails[FIELDS.NATIONALITY]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="ID number / Passport Number" 
				value=${personalDetails[FIELDS.ID_NUMBER]}
				disabled>
			</capitec-text-field>

			<capitec-text-field 
				label="Cellphone number" 
				value=${personalDetails[FIELDS.CELL_NO]}
				type="numeric" 
				disabled>
			</capitec-text-field>`

		: html``;
	}

	_renderContactDetails() {
		return this.selectedMenuItem === MENU_ITEMS.CONTACT_DETAILS
		? html`
			<capitec-text-field 
				label="Home contact number" 
				value=${this.updatedClientDetails.residentialPhoneNumber}
				type="numeric"
				maxlength="10"
				error="${this._validateContactNumber(this.updatedClientDetails.residentialPhoneNumber)}"
				@input=${(e) => this._detailsChange(`residentialPhoneNumber`, e.detail.new)}>
			</capitec-text-field>

			<capitec-text-field 
				label="Work contact number" 
				value=${this.updatedClientDetails.businessPhoneNumber}
				type="numeric"
				maxlength="10"
				error="${this._validateContactNumber(this.updatedClientDetails.businessPhoneNumber)}"
				@input=${(e) => this._detailsChange(`businessPhoneNumber`, e.detail.new)}>
			</capitec-text-field>

			<capitec-group layout="vertical" halign="left" valign="center" gap="none" disabled>
				<capitec-label
						id="email-replica"
						class="replica hide-visibility"
						label="${this.email}">
				</capitec-label>
				<capitec-text-field 
					id="email"
					label="Email address"
					value=${this.email}
					type="alpha-numeric"
					error="${this.emailError}"
					@input="${(e) => this._inputEmail(e)}"
					@keydown="${(e) => this._keyDownTab(e)}"
					@focusout="${() => this._focusOutInput()}"
					disabled>
				</capitec-text-field>
				
				<span id="email-suggestion" class="domain-suggestion ${this.emailError ? `hint-height` : ``}">${this.emailSuggestion}</span>
			</capitec-group>
			`
		: html``;
	}

	_renderAddress() {
		return this.selectedMenuItem === MENU_ITEMS.ADDRESS
		? html`
			<capitec-text-field 
				label="Address line 1" 
				value=${this.updatedClientDetails.residentialAddress.address1}
				type="alpha-numeric"
				maxlength="40"
				error="${isNullorEmpty(this.updatedClientDetails.residentialAddress.address1) ? ERROR.ADDRESS1 : ``}"
				@key-input=${(e) => this._detailsChange(`residentialAddress`, e.detail.new, `address1`)}>
			</capitec-text-field>

			<capitec-text-field 
				label="Address line 2" 
				value=${this.updatedClientDetails.residentialAddress.address2}
				type="alpha-numeric"
				maxlength="40"
				@key-input=${(e) => this._detailsChange(`residentialAddress`, e.detail.new, `address2`)}>
			</capitec-text-field>

			<capitec-text-field 
				label="Suburb" 
				value=${this.updatedClientDetails.residentialAddress.suburb}
				type="alpha-numeric"
				maxlength="40"
				error="${isNullorEmpty(this.updatedClientDetails.residentialAddress.suburb) ? ERROR.SUBURB : ``}"
				@key-input=${(e) => this._detailsChange(`residentialAddress`, e.detail.new, `suburb`)}>
			</capitec-text-field>

			<capitec-text-field 
				label="City" 
				value=${this.updatedClientDetails.residentialAddress.city}
				type="alpha-numeric"
				maxlength="40"
				error="${isNullorEmpty(this.updatedClientDetails.residentialAddress.city) ? ERROR.CITY : ``}"
				@key-input=${(e) => this._detailsChange(`residentialAddress`, e.detail.new, `city`)}>
			</capitec-text-field>
			
			<capitec-text-field 
				label="Postal code" 
				value=${this.updatedClientDetails.residentialAddress.postalCode}
				type="numeric"
				maxlength="8"
				error="${isNullorEmpty(this.updatedClientDetails.residentialAddress.postalCode) ? ERROR.POSTAL_CODE : ``}"
				@key-input=${(e) => this._detailsChange(`residentialAddress`, e.detail.new, `postalCode`)}>
			</capitec-text-field>
			`
		: html``;
	}

	_renderEmploymentDetails() {
		return this.selectedMenuItem === MENU_ITEMS.EMPLOYMENT_DETAILS
		? html`
			<capitec-select 
				label="Employment status" 
				.value=${getValue(EMPLOYMENT_STATUS, this.updatedClientDetails.employmentStatus)}
				.items="${this._getEmploymentStatusList()}"
				display-field="value"
				id-field="key"
				@value-change=${(e) => this._empStatusChange(e)}>
			</capitec-select>
			
			<capitec-select 
				label="Employment type"
				.value=${getValue(Object.values(EMPLOYMENT_TYPE).flat(), this.updatedClientDetails.employmentType)}
				.items="${EMPLOYMENT_TYPE[getValue(EMPLOYMENT_STATUS, this.updatedClientDetails.employmentStatus)].filter(type => type.key !== `NONE`)}"
				display-field="value"
				id-field="key"
				error=${this._validateEmploymentType()}
				?disabled=${this.updatedClientDetails.employmentStatus === `MINOR_16`}
				@value-changed=${(e) => this._detailsChange(`employmentType`, e.detail.new.key)}>
			</capitec-select>
			
			<div>
				<horizon-select-icon 
					label=""
					id="emp-select"
					.value=${this.updatedClientDetails.employerName} 
					.items="${this.employerList}"
					display-field="employerName"
					id-field="employerNumber"
					@value-changed=${(e) => this._employerChange(e.detail.new.employerName)}
					?disabled=${this.updatedClientDetails.employmentStatus === `UNEMPLOYED` || this.updatedClientDetails.employmentStatus === `PENSIONER` || this.updatedClientDetails.employmentStatus === `MINOR_16`}
					customizeNoResults>
					<div slot="no-results">
						<capitec-label class="label-no-results" label="No matching results"></capitec-label> 
						<capitec-button class="add-emp-button" label="Add Employer" @click="${() => this.showAddEmployerModal = true}">
						</capitec-button>
					</div>
				</horizon-select-icon>
				<capitec-text-field 
					label="Employer"
					.value=${this.updatedClientDetails.employerName}
					@key-input=${(e) => this._getEmployersList(e)}
					error=${this._validateEmploymentDetails()}
					?disabled=${this.updatedClientDetails.employmentStatus === `UNEMPLOYED` || this.updatedClientDetails.employmentStatus === `PENSIONER` || this.updatedClientDetails.employmentStatus === `MINOR_16`}>
				</capitec-text-field>
			</div>

			<capitec-select 
				label="Industry"
				.value=${this.updatedClientDetails.industryCode} 
				.items="${INDUSTRY_CODE.filter(code => !isNullorEmpty(code.value))}"
				display-field="value"
				id-field="key"
				@value-changed=${(e) => this._detailsChange(`industryCode`, e.detail.new.key)}
				?hidden=${!this.displayIndustryCode}
				?disabled=${!this.displayIndustryCode}>
			</capitec-select>
			`
		: html``;
	}

	_renderIncomeDetails() {
		return this.selectedMenuItem === MENU_ITEMS.INCOME_DETAILS
		? html`
			<capitec-select 
				label="Source of funds" 
				.value=${getValue(Object.values(SOURCE_FUNDS).flat(), this.updatedClientDetails.sourceOfFunds)}
				.items="${SOURCE_FUNDS[getValue(EMPLOYMENT_STATUS, this.updatedClientDetails.employmentStatus)].filter(src => src.key !== `NO_VALUE`)}"
				display-field="value"
				id-field="key"
				error="${isNullorEmpty(this.updatedClientDetails.sourceOfFunds) || this.updatedClientDetails.sourceOfFunds === `NO_VALUE` ? ERROR.SOF : ``}"
				@value-changed=${(e) => this._detailsChange(`sourceOfFunds`, e.detail.new.key)}>
			</capitec-select>
			
			<capitec-select 
				label="Expected monthly income" 
				.value=${getValue(INCOME_RANGE, this.updatedClientDetails.incomeRange)}
				.items="${INCOME_RANGE.filter(range => range.key !== `NO_VALUE`)}"
				display-field="value"
				id-field="key"
				error="${isNullorEmpty(this.updatedClientDetails.incomeRange) || this.updatedClientDetails.incomeRange === `NO_VALUE` ? ERROR.INCOME_RANGE : ``}"
				@value-changed=${(e) => this._detailsChange(`incomeRange`, e.detail.new.key)}>
			</capitec-select>

			<capitec-select 
				label="Income frequency" 
				.value=${this.updatedClientDetails.incomeFrequency === `NONE` ? `` : this.updatedClientDetails.incomeFrequency}
				.items="${INCOME_FREQUENCY.filter(freq => freq.key !== `NONE`)}"
				display-field="value"
				id-field="key"
				error="${isNullorEmpty(this.updatedClientDetails.incomeFrequency) || this.updatedClientDetails.incomeFrequency === `NONE` ? ERROR.INCOME_FREQUENCY : ``}"
				@value-changed=${(e) => this._detailsChange(`incomeFrequency`, e.detail.new.value)}>
			</capitec-select>
			`
		: html``;
	}
	
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-save-button"
					type="primary"
					label="Save Changes"
					?disabled=${this._isSaveDisabled()}
					@click="${() => this._saveChanges()}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-update-profile-details`, UpdateProfileDetails);