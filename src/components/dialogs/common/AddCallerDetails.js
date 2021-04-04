import { Component, css, html } from 'platform/elements';
import { CallerInformation } from 'app/models/CallerInformation';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { InsureService } from 'app/services/InsureService';
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

		this.confirmedCaller = null;
		this.incomingCallDetails = null;
		this.addCallerDialog = null;
		this.renderMode = RENDER_MODE.ADD_CALLER;

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));

		this.isBusy = false;
		this.validationFailed = false;
		this.alertBannerMessage = ``;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller - Caller info for verified client.
	 * @property {Object} incomingCallDetails - Incoming call information
	 * @property {Object} incidentDetails Incident details
	 * @property {Object} addCallerDialog - model from addCallerDetails Channel service call for loading this dialog
	 *
	 * @readonly
	 * @static
	 * @memberof AddCallerDetails
	 */
	static get properties() {
		return {
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },
			addCallerDialog: { type: Object },

			isBusy: { attribute: false },
			renderMode: { attribute: false },
			validationFailed: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming addCallerDialog model
		this.ivrOption = this.addCallerDialog.ivrOption;

		this.incomingTelephoneNumber = this.addCallerDialog.incomingTelephoneNumber;

		this.nonClientInformation = this.addCallerDialog.nonClientInformation;
		this.firstNameTextField = this.nonClientInformation.firstNameTextField;
		this.surnameTextField = this.nonClientInformation.surnameTextField;
		this.cellPhoneTextField = this.nonClientInformation.cellPhoneTextField;
		this.nonClientRelationship = this.nonClientInformation.nonClientRelationship;
		this.nonClientRelationship.value = ``; // Initialise the value. The contract returns the label here.

		this.endCallSessionButton = this.addCallerDialog.endCallSessionButton;
		this.confirmButton = this.addCallerDialog.confirmButton;
		this.backButton = this.addCallerDialog.backButton;

		this.renderMode = RENDER_MODE.ADD_CALLER;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_keyPress(e) {
		if (e.detail.new !== ``) {
			this[e.currentTarget.id].errorMessage = ``;
		}
		this.validationFailed = false;
		this.requestUpdate();
	}

	_valueChanged(e) {
		if (typeof e.detail.new === `object`) {
			this[e.currentTarget.id].value = e.detail.new.value;
		} else {
			this[e.currentTarget.id].value = e.detail.new;
		}
		this.validationFailed = false;
	}

	_confirmClick() {
		if (!this._validateData()) {
			this.dispatchEvent(new CustomEvent(`confirm`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					callerInformation: new CallerInformation(
						this.confirmedCaller.cifNumber,
						this.confirmedCaller.birthdate,
						this.confirmedCaller.languagePreference,
						this.confirmedCaller.livesIn,
						this.confirmedCaller.name,
						this.confirmedCaller.southAfricanIDNumber,
						this.confirmedCaller.verifiedTelephoneNumber,
						this.firstNameTextField.value,
						this.surnameTextField.value,
						`${this.firstNameTextField.value} ${this.surnameTextField.value}`,
						this.cellPhoneTextField.value,
						``,
						this.nonClientRelationship.value,
						true,
						`unverified`,
						false,
						true,
						false,
						false, // presence of insurance products not yet determined
						false // availability of digital channels not yet determined
					)
				}
			}));
		}
	}

	_backClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {
			detail: {
				ivrOptionValue: this.ivrOption.value
			}
		}));
	};

	_endCall() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}
	
	_errorHandler(ex) {
		this.horizonStore.saveState({
			incomingCallDetails: this.incomingCallDetails
		});
		this.horizonRouter.navigateToSystemError();
	}

	_validateData() {
		for (const key in this.nonClientInformation) {
			if (Object.prototype.hasOwnProperty.call(this.nonClientInformation, key)) {
				const field = this.nonClientInformation[key];
				// When the field is required and it doesn't have any value - assigning error message
				if (field.required && !field.value) {
					this[key].errorMessage = field.inputValidationOption.validationFailedMessage;
					this.validationFailed = true;
					this.alertBannerMessage = ERROR_MESSAGE.REQUIRED_FIELDS_EMPTY;
				}
			}
		}

		if (!isNullorEmpty(this.cellPhoneTextField.value) &&
			!RegExp(REGEX_CELLPHONE.PATTERN, `g`).test(this.cellPhoneTextField.value)) {
			this.cellPhoneTextField.errorMessage = ERROR_MESSAGE.INVALID_CELLPHONE_NUMBER;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_CELLPHONE.ERR_MESSAGE;

		}

		if (!RegExp(REGEX_NAME.PATTERN, `g`).test(this.firstNameTextField.value)) {
			this.firstNameTextField.errorMessage = ERROR_MESSAGE.INVALID_FIRSTNAME;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_NAME.ERR_MESSAGE;
		};

		if (!RegExp(REGEX_SURNAME.PATTERN, `g`).test(this.surnameTextField.value)) {
			this.surnameTextField.errorMessage = ERROR_MESSAGE.INVALID_SURNAME;
			this.validationFailed = true;
			this.alertBannerMessage = REGEX_NAME.ERR_MESSAGE;
		};

		return this.validationFailed;
	}

	/*
	 * Temporary method to return error message
	 */
	_getErrorMessage(field) {
		return field && field.errorMessage ? field.errorMessage : ``;
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
						.headerLabel="${HEADER_LABEL}" 
						@on-end-call="${() => this._endCall()}">
							<div slot="body" class="main">
								${this._renderErrorMessage()}
								${this._renderAddCallerDetails()}
								${this._renderLoadingIndicator()}
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

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderErrorMessage() {
		if (this.validationFailed) {
			return html`
				<capitec-alert-banner
								type="error"
								label="${this.alertBannerMessage}">
				</capitec-alert-banner>`;
		}
		return html``;
	}

	_renderAddCallerDetails() {
		return html`
			<content-box class="body-group" layout="vertical" gap="none" halign="stretch" valign="top" noScroll>
				<capitec-label id="id-label-enter-details" type="title" label="Enter details below:"></capitec-label>
				<div class="group-field-row">
					<capitec-text-field label="Name"
										id="firstNameTextField"
										value="${this.firstNameTextField.value}"
										error="${this._getErrorMessage(this.firstNameTextField)}"
										tabindex="1"
										@value-changed="${(e) => this._valueChanged(e)}" 
										@key-input="${(e) => this._keyPress(e)}">
					</capitec-text-field>
				</div>
				<div class="group-field-row">
					<capitec-text-field label="Surname"
										id="surnameTextField"
										value="${this.surnameTextField.value}"
										error="${this._getErrorMessage(this.surnameTextField)}"
										tabindex="2"
										@value-changed="${(e) => this._valueChanged(e)}"
										@key-input="${(e) => this._keyPress(e)}">
					</capitec-text-field>
				</div>
				<div class="group-field-row">
					<capitec-text-field type="number"
										id="cellPhoneTextField"
										value="${this.cellPhoneTextField.value}"
										error="${this._getErrorMessage(this.cellPhoneTextField)}"
										label="Cellphone Number (Optional)"
										tabindex="3"
										@key-input="${(e) => this._keyPress(e)}"
										@value-changed="${(e) => this._valueChanged(e)}">
					</capitec-text-field><br>
				</div>
				<div class="group-field-row">
					<capitec-select id="nonClientRelationship"
                                    label="Choose relationship type (Optional)"
						            value="${this.nonClientRelationship.value}"
                                    .items="${this.nonClientRelationship.possibleValues}"
						            @value-changed="${(e) => this._valueChanged(e)}"
                                    tabindex="4"
						            id-field="key"
                                    display-field="value">
					</capitec-select>
				</div>
			</content-box>`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button id="id-back-button"
								type="clear"
								label="Cancel"
								tabindex="6"
								@click="${(e) => this._backClick()}">
				</capitec-button>
				<capitec-button id="id-confirm-button"
								type="primary"
								label="Confirm"
								tabindex="5"
								@click="${() => this._confirmClick()}">
				</capitec-button>
			</capitec-group>`;
	}

	_renderEndCallModal() {
		return html`<horizon-end-call-session 
						.incomingCallDetails = "${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						endCallContext="ConfirmClient"
						@cancel="${() => this.renderMode = RENDER_MODE.ADD_CALLER}">
					</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-add-caller-details`, AddCallerDetails);