import { Component, css, html } from 'platform/elements';
import { CallerInformation } from 'app/models/CallerInformation';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'platform/components/popups/Modal';
import 'app/components/common/CallerInfoBar';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	ADD_CALLER: 0,
	END_CALL: 1
};

const HEADER_LABEL = `Add Caller Details`;

const ERROR_MESSAGE = {
	REQUIRED_FIELDS_EMPTY: `Please enter all required fields before you continue`,
	REQUIRED_FIELD_HINT: `This is a required field`,
	INVALID_CELLPHONE_NUMBER: `Cellphone number must be 10 digits`,
	INVALID_FIRSTNAME: `Only alpha characters and hyphen allowed`,
	INVALID_SURNAME: `Only alpha characters and hyphen allowed`
};
 
const REGEX_CELLPHONE = {
	PATTERN: /^[0-9]{10}$/,
	ERR_MESSAGE: `Incorrect cellphone number`
};

const REGEX_NAME = {
	PATTERN: /^[A-Za-z\s-]+$/,
	ERR_MESSAGE: `Name and surname must be completed`
};

const REGEX_SURNAME = {
	PATTERN: /^[A-Za-z\s-]+$/,
	ERR_MESSAGE: `Name and surname must be completed`
};

const POSSIBLE_RELATIONSHIPS = [ 
	{ key: 0, value: `Spouse` },
	{ key: 1, value: `Sibling` },
	{ key: 2, value: `Child` },
	{ key: 3, value: `Friend` },
	{ key: 4, value: `Other` }
];


/**
/**
 * Add Caller Details is used to record the information of a third-pary calling in 
 * with respect to a Capitec client.
 * This component is invoked from the Confirm Caller Details Dialog
 * 
 * Events Raised 
 * -------------
 * cancel
 * confirm
 *  
 * @export
 * @class AddCallerDetails
 * @extends {Component}
 */
export class AddCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		RegExp();

		this.incomingCallDetails = null;
		this.renderMode = RENDER_MODE.ADD_CALLER;
		this.surnameError = ``;
		this.cellphoneError = ``;
		this.validationFailed = false;
		this.alertBannerMessage = ``;
		this.firstNameError = ``;
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.nonClientRelationship = ``;

		this.ErrorMessageFields = {
			firstNameTextField: ``,
			surnameTextField: ``,
			cellPhoneTextField: ``
		};
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails - Incoming call information
	 * @property {Object} incidentDetails Incident details
	 * @property {Object} callerInformation - information on incoming caller
	 *
	 * @readonly
	 * @static
	 * @memberof AddCallerDetails
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },
			callerInformation: { type: Object },
			renderMode: { attribute: false },
			validationFailed: { attribute: false },
			nonClientRelationship: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.telemetry.startSpan(IDCallerEvents.ADD_CALLER, {
			"screen": TelemetryScreen.ADD_CALLER_DETAILS
		});

		// Short hand references for reaching into the incoming addCallerDialog model
		this.ivrOption = this.incomingCallDetails.ivrOption;

		this.firstNameTextField = this.callerInformation.nonClientFirstName;
		this.surnameTextField = this.callerInformation.nonClientSurName;
		this.cellPhoneTextField = this.callerInformation.nonClientCellPhone;
		this.nonClientRelationship = this.callerInformation.nonClientRelationship;

		this.renderMode = RENDER_MODE.ADD_CALLER;
	}

	disconnectedCallback() {
		this.telemetry.endSpan(IDCallerEvents.ADD_CALLER, {
			"screen": TelemetryScreen.ADD_CALLER_DETAILS
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_keyPress(e) {
		// Clear the error string
		if (e.detail.new !== ``) {
			e.currentTarget.error = ``;

			this.ErrorMessageFields[e.currentTarget.id] = ``;
		}
		this.validationFailed = false;
	}

	_confirmClick() {
		this.telemetry.logEvent(IDCallerEvents.ADD_CALLER_CONFIRM_CLICK, {
			"screen": TelemetryScreen.ADD_CALLER_DETAILS,
			"next-screen": null,
			"name": this.callerInformation.nonClientFirstName,
			"surname": this.callerInformation.nonClientSurName,
			"relation": this.callerInformation.nonClientRelationship,
			"telephone": this.callerInformation.nonClientCellPhone
		});

		if (!this._validateData()) {
			this.dispatchEvent(new CustomEvent(`confirm`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: new CallerInformation(
						this.callerInformation.cifNumber,
						this.callerInformation.birthdate,
						this.callerInformation.languagePreference,
						this.callerInformation.livesIn,
						this.callerInformation.name,
						this.callerInformation.title,
						this.callerInformation.southAfricanIDNumber,
						this.callerInformation.verifiedTelephoneNumber,
						this.firstNameTextField,
						this.surnameTextField,
						`${this.firstNameTextField} ${this.surnameTextField}`,
						this.cellPhoneTextField,
						``,
						this.nonClientRelationship,
						true,
						this.callerInformation.verificationStatus || `unverified`,
						false,
						true,
						false,
						false, // presence of insurance products not yet determined
						false, // availability of digital channels not yet determined
						{
							sqAttempts: 0,
							itaAttempts: 0
						}
					)
				}
			}));
		}
	}

	_backClick() {
		this.telemetry.logEvent(IDCallerEvents.ADD_CALLER_CANCEL_CLICK, {
			"screen": TelemetryScreen.ADD_CALLER_DETAILS,
			"next-screen": TelemetryScreen.CONFIRM_CALLER
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {
			detail: {
				ivrOptionValue: this.ivrOption.value
			}
		}));
	};

	_endCall() {
		this.telemetry.logEvent(IDCallerEvents.ADD_CALLER_END_CALL_CLICK, {
			"screen": TelemetryScreen.ADD_CALLER_DETAILS,
			"next-screen": TelemetryScreen.END_CALL
		});

		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateData() {
		if (isNullorEmpty(this.firstNameTextField)) {
			// When the field is required and it doesn't have any value - assigning error message
			this.validationFailed = true;
			this.firstNameError = ERROR_MESSAGE.REQUIRED_FIELD_HINT;
			this.alertBannerMessage = ERROR_MESSAGE.REQUIRED_FIELDS_EMPTY;
		} else if (!RegExp(REGEX_NAME.PATTERN, `g`).test(this.firstNameTextField)) {
			this.firstNameError = ERROR_MESSAGE.INVALID_FIRSTNAME;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_NAME.ERR_MESSAGE;
		};

		if (isNullorEmpty(this.surnameTextField)) {
			this.validationFailed = true;
			this.surnameError = ERROR_MESSAGE.REQUIRED_FIELD_HINT;
			this.alertBannerMessage = ERROR_MESSAGE.REQUIRED_FIELDS_EMPTY;
		} else if (!RegExp(REGEX_SURNAME.PATTERN, `g`).test(this.surnameTextField)) {
			this.surnameError = ERROR_MESSAGE.INVALID_SURNAME;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_NAME.ERR_MESSAGE;
		};

		if (!isNullorEmpty(this.cellPhoneTextField) && !RegExp(REGEX_CELLPHONE.PATTERN, `g`).test(this.cellPhoneTextField)) {
			this.cellphoneError = ERROR_MESSAGE.INVALID_CELLPHONE_NUMBER;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_CELLPHONE.ERR_MESSAGE;
		}

		return this.validationFailed;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				.main{
					height: 594px;
					width: 690px;
				}
				#id-label-enter-details{
					margin-left: 16px;
					margin-bottom: 20px;
					margin-top: 24px;
					
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
				}
				.group-field-row{
					margin-left:16px;
					height: 72px;
					width: 658px;
					margin-bottom:8px;
				}
				.body-group{
					margin-top:24px;
				}
				#id-back-button{
					margin-right: 10px;
					height: 48px;
					width: 86px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}
				#id-confirm-button{
					height: 48px;
					width: 105px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 14px 16px 0px 17px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.ADD_CALLER:
				return html`
					<horizon-caller-dialog
						.incomingCallDetails="${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						.isNeedSelectable=${false}
						headerLabel="${HEADER_LABEL}" 
						@on-end-call="${() => this._endCall()}">
							<div slot="body" class="main">
								${this._renderErrorMessage()}
								${this._renderAddCallerDetails()}
								${this._renderCallerDetails()}
							</div>
							<div slot="footer">
							${this._renderFooter()}
							</div>
					</horizon-caller-dialog>`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
			default:
		}
	}

	_renderErrorMessage() {
		if (this.validationFailed) {
			return html`
				<capitec-alert-banner
					data-automation-id="add-caller-details-alert-banner"
					label="${this.alertBannerMessage}"
					type="error">
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderAddCallerDetails() {
		return html`
			<content-box class="body-group" layout="vertical" gap="none" halign="stretch" valign="top" noScroll>
				<capitec-label 
					id="id-label-enter-details" 
					type="title" 
					label="Enter details below:">
				</capitec-label>
				<div class="group-field-row">
					<capitec-select
						id="nonClientRelationship"
						data-automation-id="add-caller-details-non-client-relationship"
						label="Choose relationship type (Optional)"
						value="${this.nonClientRelationship}"
						tabindex="1"
						.items="${POSSIBLE_RELATIONSHIPS}"
						id-field="key"
						display-field="value"
						@value-changed="${(e) => this.nonClientRelationship = e.detail.new.value}">
					</capitec-select>
				</div>
			</content-box>`;
	}

	_renderCallerDetails() {
		return html`
			<div class="group-field-row">
				<capitec-text-field 
					id="firstNameTextField"
					data-automation-id="add-caller-details-first-name"
					label="Name"
					value="${this.firstNameTextField}"
					tabindex="2"
					error="${this.firstNameError}"
					@value-changed="${(e) => this.firstNameTextField = e.detail.new}"
					@key-input="${(e) => this._keyPress(e)}">
				</capitec-text-field>
			</div>
			<div class="group-field-row">
				<capitec-text-field 
					id="surnameTextField"
					data-automation-id="add-caller-details-surname"
					label="Surname"
					value="${this.surnameTextField}"
					tabindex="3"
					error="${this.surnameError}"
					@value-changed="${(e) => this.surnameTextField = e.detail.new}"
					@key-input="${(e) => this._keyPress(e)}">
				</capitec-text-field>
			</div>
			<div class="group-field-row">
				<capitec-text-field 
					id="cellPhoneTextField"
					data-automation-id="add-caller-details-cellphone"
					type="numeric"
					label="Cellphone Number (Optional)"
					value="${this.cellPhoneTextField}"
					tabindex="4"
					error="${this.cellphoneError}"
					@value-changed="${(e) => this.cellPhoneTextField = e.detail.new}"
					@key-input="${(e) => this._keyPress(e)}">
				</capitec-text-field><br>
			</div>`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button 
					id="id-back-button"
					data-automation-id="add-caller-details-cancel"
					type="clear"
					label="Cancel"
					tabindex="6"
					@click="${(e) => this._backClick()}">
				</capitec-button>
				<capitec-button 
					id="id-confirm-button"
					data-automation-id="add-caller-details-confirm"
					type="primary"
					label="Confirm"
					tabindex="5"
					@click="${() => this._confirmClick()}">
				</capitec-button>
			</capitec-group>`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				.incomingCallDetails = "${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
				endCallContext="ConfirmClient"
				@cancel="${() => this.renderMode = RENDER_MODE.ADD_CALLER}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-add-caller-details`, AddCallerDetails);