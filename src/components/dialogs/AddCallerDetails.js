/**
 * Add Caller Details is used to record the information of a non-Capitec client calling into the contact centre.
 * This component is currently shared between the Stop Card and Insure Needs.
 */

import { Component, css, html } from 'platform/elements';
import { getTabIndex, getValue, isDisabled, isHidden, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { CardService } from 'app/services/CardService';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonCallerInfoBar';
import 'app/components/common/HorizonCallerDialog';
import 'app/components/dialogs/EndCallSession';

const RENDER_MODE = {
	ADD_CALLER: 0,
	END_CALL: 1
};

const HEADER_LABEL = `Add Caller Details`;

const ERROR_MESSAGE = {
	REQUIRED_FIELDS_EMPTY: `Please enter all required fields before you continue`,
	INVALID_CELLPHONE_NUMBER: `Cellphone number must be 10 digits`
};

const REGEX_CELLPHONE = {
	PATTERN: /^[0-9]{10}$/,
	ERR_MESSAGE: `Incorrect cellphone number`
};

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

		this.cardService = new CardService(() => this._toggleBusyFlag(), null);

		this.isBusy = false;
		this.validationFailed = false;
		this.alertBannerMessage = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller - Caller info for verified client.
	 * @property {Object} incomingCallDetails - Incoming call information
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
			addCallerDialog: { type: Object },
			isBusy: { type: Boolean },
			renderMode: { type: Number },
			validationFailed: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming addCallerDialog model
		this.voiceReferenceNumber = this.addCallerDialog.voiceReferenceNumber;

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

		// confirmed Caller Model references
		this.southAfricanIDNumber = this.confirmedCaller.callerInformation.southAfricanIDNumber;

		// incomingCallDetails references
		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this.renderMode = RENDER_MODE.ADD_CALLER;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onKeyPress(e) {
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

	addCallerDetails() {

		if (!this.validateData()) {
			this.callerDetailsAdded();
		}
	}

	async callerDetailsAdded() {

		const confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOptionCode: this.incomingCallDetails.ivrOption.value,
			incidentReferenceNumber: this.incidentReferenceNumber,
			incidentRecId: this.incidentRecId,
			agentTelephoneNumber: this.agentTelephoneNumber,
			nonClientFullName: `${this.firstNameTextField.value} ${this.surnameTextField.value}`,
			nonClientCellPhone: this.cellPhoneTextField.value,
			nonClientIDNumber: ``,
			nonClientRelationship: this.nonClientRelationship.value
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller, null);
		const addedcallerdetails = returnValue.result;

		if (returnValue.succeeded) {
			this.dispatchEvent(new CustomEvent(`caller-added`, {
				detail: {
					clientProfileDetails: addedcallerdetails,
					incomingCallDetails: this.incomingCallDetails
				}
			}));
		} else {
			// TODO: Handle failure on call to identifyCaller
		}
	}

	_onBackButtonClick() {
		this.dispatchEvent(new CustomEvent(`on-back`, {
			detail: {
				ivrOptionValue: this.ivrOption.value
			}
		}));
	};

	onCallCancelled(reason) {
		this.dispatchEvent(new CustomEvent(`call-ended`, {
			detail: {
				confirmedCaller: {},
				endCallReason: reason.detail.endCallReason
			}
		}));
	}

	_onIvrOptionChanged(e) {
		this.addCallerDialog.ivrOption.value = e.detail.new;
		this.confirmedCaller.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOption.value = e.detail.new;
		this.incomingCallDetails.ivrOptionCode = e.detail.new;
	}

	_onEndCall() {
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

	validateData() {
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
		return this.validationFailed;
	}

	/*
	 * Temproary method to return error message
	 */
	getErrorMessage(field) {
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

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.ADD_CALLER:
				return html`
					<horizon-caller-dialog
								.incomingCallDetails="${this.incomingCallDetails}"
								.headerLabel="${HEADER_LABEL}"
								@on-end-call="${() => this._onEndCall()}"
								@on-need-changed="${(e) => this._onIvrOptionChanged(e)}">
						<div slot="body" class="main">
							${this.renderErrorMessage()}
							${this.renderAddCallerDetails()}
							${this.renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this.renderFooter()}
						</div>
					</horizon-caller-dialog>`;
			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;
			default:
		}
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderErrorMessage() {
		if (this.validationFailed) {
			return html`
				<capitec-alert-banner 
								type="error" 
								label="${this.alertBannerMessage}">
				</capitec-alert-banner>`;
		}
		return html``;
	}

	renderAddCallerDetails() {
		return html`
			<content-box class="body-group" layout="vertical" gap="none" halign="stretch" valign="top" noScroll>
			 	<capitec-label id="id-label-enter-details" type="title" label="Enter details below:"></capitec-label>
				<div class="group-field-row">
					<capitec-text-field label="Name"
										id="firstNameTextField"
										value="${getValue(this.firstNameTextField)}"
										error="${this.getErrorMessage(this.firstNameTextField)}"
										?hidden=${isHidden(this.firstNameTextField)}
										.disabled="${isDisabled(this.firstNameTextField)}"
										tabindex="${getTabIndex(this.firstNameTextField)}"
										@value-changed="${(e) => this._valueChanged(e)}" 
										@key-input="${(e) => this._onKeyPress(e)}">
					</capitec-text-field>
				</div>
				<div class="group-field-row">
					<capitec-text-field label="Surname"
										id="surnameTextField"
										value="${getValue(this.surnameTextField)}"
										error="${this.getErrorMessage(this.surnameTextField)}"
										?hidden=${isHidden(this.surnameTextField)}
										.disabled="${isDisabled(this.surnameTextField)}"
										tabindex="${getTabIndex(this.surnameTextField)}"
										@value-changed="${(e) => this._valueChanged(e)}"
										@key-input="${(e) => this._onKeyPress(e)}">
					</capitec-text-field>
				</div>
				<div class="group-field-row">
					<capitec-text-field type="number"
										id="cellPhoneTextField"
										value="${getValue(this.cellPhoneTextField)}"
										error="${this.getErrorMessage(this.cellPhoneTextField)}"
										label="Cellphone Number (Optional)"
										?hidden=${isHidden(this.cellPhoneTextField)}
										.disabled="${isDisabled(this.cellPhoneTextField)}"
										tabindex="${getTabIndex(this.cellPhoneTextField)}"
										@key-input="${(e) => this._onKeyPress(e)}"
										@value-changed="${(e) => this._valueChanged(e)}">
					</capitec-text-field><br>
				</div>
				<div class="group-field-row">
					<capitec-select id="nonClientRelationship"
									label="Choose relationship type (Optional)"
									value="${getValue(this.nonClientRelationship)}"
									.items="${this.nonClientRelationship.possibleValues}"
									@value-changed="${(e) => this._valueChanged(e)}"
									tabindex="${getTabIndex(this.nonClientRelationship)}"
									?hidden=${isHidden(this.nonClientRelationship)}
									.disabled="${isDisabled(this.nonClientRelationship)}"
									id-field="key"
									display-field="value">
					</capitec-select>
				</div>
			</content-box>`;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button id="id-back-button"
								type="clear"
								label="Cancel"
								?hidden=${isHidden(this.backButton)}
								.disabled="${isDisabled(this.backButton)}"
								tabindex="${getTabIndex(this.backButton)}"
								@click="${(e) => this._onBackButtonClick()}">
				</capitec-button>
				<capitec-button id="id-confirm-button"
								type="primary"
								label="Confirm"
								?hidden=${isHidden(this.confirmButton)}
								.disabled="${isDisabled(this.confirmButton)}"
								tabindex="${getTabIndex(this.confirmButton)}"
								@click="${() => this.addCallerDetails()}">
				</capitec-button>
			</capitec-group>`;
	}

	renderEndCallModal() {
		return html`<horizon-end-call-session 
						@on-cancel="${() => this.renderMode = RENDER_MODE.ADD_CALLER}"
						@on-reason-set="${(reason) => this.onCallCancelled(reason)}"
						.incomingCallDetails = "${this.incomingCallDetails}">
					</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-add-caller`, AddCallerDetails);