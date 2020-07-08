/**
 * Add Caller Details is used to record the information of a non-Capitec client calling into the contact centre.
 * This component is currently shared between the Stop Card and Insure Needs.
 */

import { Component, html, css } from 'platform/elements';
import 'platform/components/popups/Modal';

import { CALLERINFOBAR_CSS } from '../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../css/HorizonModalHeader';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { isDisabled, isHidden, getTabIndex, getValue, isNullorEmpty } from '../../utils/channelServiceUtilities';

const RENDER_MODE = {
	ADD_CALLER: 0,
	END_CALL: 1,
};

const ERROR_MESSAGE = {
	REQUIRED_FIELDS_EMPTY: 'Please enter all required fields before you continue',
	INVALID_CELLPHONE_NUMBER: 'Cellphone number must be 10 digits'
}

const REGEX_CELLPHONE = {
	PATTERN: /^[0-9]{10}$/,
	ERR_MESSAGE: 'Incorrect cellphone number'
}

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

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);
		this.isBusy = false;
		this.validationFailed = false;
		this.alertBanner_Message = '';
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			confirmedCaller: { type: Object },
			incomingCallDetails: { type: Object },
			addCallerDialog: { type: Object },
			isBusy: { type: Boolean },
			renderMode: { type: Number },
			validationFailed: { type: Boolean }
		}
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
		this.nonClientRelationship.value = ''; // Initialise the value. The contract returns the label here.
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
		if (e.detail.new != "") {
			this[e.currentTarget.id].errorMessage = "";
		}
		this.validationFailed = false;
		this.requestUpdate();
	}

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this[e.currentTarget.id].value = e.detail.new.value;
		}
		else {
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

		let confirmedCaller = {
			idNumber: this.southAfricanIDNumber.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOptionCode: this._getIvrOptionKey(this.ivrOption),
			incidentReferenceNumber: this.incidentReferenceNumber,
			incidentRecId: this.incidentRecId,
			agentTelephoneNumber: this.agentTelephoneNumber,
			nonClientFullName: this.firstNameTextField.value + ' ' + this.surnameTextField.value,
			nonClientCellPhone: this.cellPhoneTextField.value,
			nonClientIDNumber: '',
			nonClientRelationship: this.nonClientRelationship.value
		}

		let addedcallerdetails = await this.serviceCallHelper.asyncCall(this.stopCardService.identifyCaller(confirmedCaller));
		if (addedcallerdetails) {
			this.dispatchEvent(new CustomEvent('caller-added', {
				detail: {
					clientProfileDetails: addedcallerdetails,
					incomingCallDetails: this.incomingCallDetails,
				},
			}));
		}
	}

	_onBackButtonClick() {
		this.dispatchEvent(new CustomEvent('on-back', {
			detail: {
				ivrOptionValue: this.ivrOption.value
			}
		}));
	};

	onCallCancelled(reason) {
		this.dispatchEvent(new CustomEvent('call-ended', {
			detail: {
				confirmedCaller: {},
				endCallReason: reason.detail.endCallReason
			}
		}));
	}

	_onIvrOptionChanged(e) {
		this.ivrOption.value = e.detail.new.value;
		this.incomingCallDetails.ivrOptionCode = e.detail.new.key;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	validateData() {
		for (let key in this.nonClientInformation) {
			let field = this.nonClientInformation[key];
			//When the field is required and it doesn't have any value - assigning error message
			if (field.required && !field.value) {
				this[key].errorMessage = field.inputValidationOption.validationFailedMessage;
				this.validationFailed = true;
				this.alertBanner_Message = ERROR_MESSAGE.REQUIRED_FIELDS_EMPTY;
			}
		}

		if (!isNullorEmpty(this.cellPhoneTextField.value)
			&& !RegExp(REGEX_CELLPHONE.PATTERN, 'g').test(this.cellPhoneTextField.value)) {
			this.cellPhoneTextField.errorMessage = ERROR_MESSAGE.INVALID_CELLPHONE_NUMBER;
			this.validationFailed = true;
			this.alertBanner_Message = REGEX_CELLPHONE.ERR_MESSAGE;

		}
		return this.validationFailed;
	}

	/**
	 * Temproary method to return error message
	 */
	getErrorMessage(field) {
		return field && field.errorMessage ? field.errorMessage : '';
	}

	_getIvrOptionKey(ivrOption) {
		let result = ivrOption.possibleValues.find((entry) => entry.value === ivrOption.value);
		return result.key;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${CALLERINFOBAR_CSS}
				${HORIZON_CALLER_DIALOG_HEADER_CSS}

				.main{
					height: 650px;
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
					margin-left: auto;
				}
				#id-confirm-button{
					margin-right: 16px;
				}
				capitec-modal {
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7.5px 0px 7.5px 0px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 14px 16px 0px 17px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));	
				}
			`];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.ADD_CALLER:
				return html`
						<capitec-modal type="free" header-align="left" class="header" >
							<capitec-group slot="header" layout="horizontal" halign="left" valign="center" gap="none" id="modalHeader">
								<capitec-label type="title" 
												label="Add Caller Details">
								</capitec-label>
								<capitec-spacer></capitec-spacer>
								<capitec-button label="End Call" 
												@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
									<img class="end-call-icon" src="../../images/hangup.svg"/>
								</capitec-button>
							</capitec-group>
							<div slot="body" class="main">
								${this.renderCallInformation()}
								${this.renderErrorMessage()}
								${this.renderAddCallerDetails()}
								${this.renderLoadingIndicator()}
							</div>
							<div slot="footer">
								${this.renderFooter()}
							</div>
						</capitec-modal>`;
			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;
		}
	}

	renderLoadingIndicator() {
		if (!this.isBusy)
			return html``;
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label
					label="Reference Number" 
					value = "${this.voiceReferenceNumber.value}"
					tabindex="${getTabIndex(this.voiceReferenceNumber)}"
					?hidden=${isHidden(this.voiceReferenceNumber)}>
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.ivrOption.possibleValues}"
					.value="${this.ivrOption.value}"
					tabindex="${getTabIndex(this.ivrOption)}"
					?hidden=${isHidden(this.ivrOption)}
					@value-changed="${(e) => this._onIvrOptionChanged(e)}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber.value}"
					tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
					?hidden=${isHidden(this.incomingTelephoneNumber)}>
				</horizon-label>
			</div>`;
	}

	renderErrorMessage() {
		if (this.validationFailed) {
			return html`
				<capitec-alert-banner 
								type="error" 
								label="${this.alertBanner_Message}">
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
				<capitec-button	id="id-confirm-button"
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
		return html`<end-call-session 
						@on-cancel="${() => this.renderMode = RENDER_MODE.ADD_CALLER}"
						@on-reason-set="${(reason) => this.onCallCancelled(reason)}">
					</end-call-session>`;
	}
}

window.customElements.define(`horizon-add-caller`, AddCallerDetails);