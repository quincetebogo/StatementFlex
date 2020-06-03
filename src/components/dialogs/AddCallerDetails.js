import { Component, html, css } from 'platform/elements';
import 'platform/components/popups/Modal';

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

		// Short hand references for reaching into the incoming data model
		this.voiceReferenceNumber = this.addCallerDialog.voiceReferenceNumber;
		this.ivrOption = this.addCallerDialog.ivrOption;
		this.incomingTelephoneNumber = this.addCallerDialog.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.confirmedCaller.incidentReferenceNumber;
		this.agentTelephoneNumber = this.confirmedCaller.agentTelephoneNumber;
		this.southAfricanIDNumber = this.confirmedCaller.callerInformation.southAfricanIDNumber;

		//Fields to be rendered
		this.nonClientInformation = this.addCallerDialog.nonClientInformation;

		this.firstNameTextField = this.nonClientInformation.firstNameTextField;
		this.surnameTextField = this.nonClientInformation.surnameTextField;
		this.cellPhoneTextField = this.nonClientInformation.cellPhoneTextField;
		this.nonClientRelationship = this.nonClientInformation.nonClientRelationship;
		this.nonClientRelationship.value = ''; // Initialise the value. The contract returns the label here.

		//Buttons on footer to be rendered
		this.endCallSessionButton = this.addCallerDialog.endCallSessionButton;
		this.confirmButton = this.addCallerDialog.confirmButton;
		this.backButton = this.addCallerDialog.backButton;

		this.renderMode = RENDER_MODE.ADD_CALLER;

		// Continue to add field short cuts here.
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
			ivrOptionCode: 'StopCard',
			incidentReferenceNumber: this.incidentReferenceNumber,
			agentTelephoneNumber: this.agentTelephoneNumber,
			nonClientFullName: this.firstNameTextField.value + ' ' + this.surnameTextField.value,
			nonClientCellPhone: this.cellPhoneTextField.value,
			nonClientIDNumber: '',
			//TODO: Check if this is still true
			// nonClientRelationship needs to chosen; default value of nonClientRelationship doesnt give any response in service call
			nonClientRelationship: this.nonClientRelationship.value
		}

		let addedcallerdetails = await this.serviceCallHelper.asyncCall(this.stopCardService.identifyCaller(confirmedCaller));
		if (addedcallerdetails) {
			this.dispatchEvent(new CustomEvent('caller-added', {
				detail: {
					incomingCallDetails: {
						voiceReferenceNumber: this.voiceReferenceNumber.value,
						incomingTelephoneNumber: this.incomingTelephoneNumber.value,
						ivrOptionCode: 'StopCard',
						incidentReferenceNumber: this.incidentReferenceNumber,
						agentTelephoneNumber: this.agentTelephoneNumber
					},
					clientProfileDetails: addedcallerdetails
				}
			}));
		}
	}


	raiseBackEvent() {
		//TODO: Populate event with data to return to the confirm dialog.
		// it will then return to the landing page
		// The landing page will invoke IdentifyCaller and transition to the Client-Profie/Stopcard page
		this.dispatchEvent(new CustomEvent('on-back', {}));
	};

	onCallCancelled(reason) {
		this.dispatchEvent(new CustomEvent('call-ended', {
			detail: {
				confirmedCaller: {},
				endCallReason: reason.detail.endCallReason
			}
		}));
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

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.main{
					box-sizing: border-box;
					height: 546px;
					width: 690px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 2px 6px 0 rgba(0,0,0,0.15);
				}
				.call-details-bar{
					display: flex;
					flex-direction: row;
					height:64px;
					margin: 0px;
					border-bottom: 1px solid #dfdfdf;
				}
				.call-label{
					width:208px;
					margin-left:24px;
					margin-top:8px;
					margin-bottom:8px;
				}
				.ivr-option{
					width: 228px;
				}
				.left-border{
					border-left: 1px solid #dfdfdf;
				}
				#label-ivr{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
					width: 180px;
					margin-top: 8px;
					margin-left: 24px;
				}
				.addCaller-box{
					width: 642px;
					height: 300px;
					margin: auto;
					margin-top: 23px;
					margin-bottom: 27px;
					align: center;
				}
				.group-field-row{
					margin-left:24px;
					height: 72px;
					width: 642px;
					margin-bottom:8px;
				}
				.header{
					height: 30px;
					width: 159px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 20px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}
				.body-group{
					margin-top:24px;
				}
				#id-back-button{
					margin-right: 288px;
				}
				#id-confirm-button{
					margin-right: 16px;
				}
				capitec-modal {
					--theme-modal-header-padding-top: 31px;
					--theme-modal-header-padding-bottom: 31px;
					--theme-modal-footer-padding: 7.5px 0px 7.5px 0px;
					--theme-modal-header-background-color: #4A4848;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 14px 16px 0px 17px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
					
				}
				div[slot="header"]{
					width: 693px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -670px;
					top: -25px;
				}
				div[slot="header"] > span{
					height: 24px;
					width: 190px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 17px;
					margin-right: 355px;
				}
				div[slot="header"] > capitec-button{
					width: 130px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-left: 16px;
					--theme-button-default-background-color: #FF2B25;
					--theme-button-default-border-color: #FF2B25;
					--theme-button-default-font-color: rgb(255, 255, 255);
					--theme-button-default-background-tapped-color: #FF2B25;
				}
				.end-call-icon{
					margin: 0px;
					margin-left: 14px;
					margin-top: -5px;
				}
			`];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.ADD_CALLER:
				return html`
						<capitec-modal type="free" header-align="left" class="header" >
							<div slot="header">
							<span>Add Caller Details</span>
								<capitec-button label="End Call">
									<capitec-icon class="end-call-icon" size="small" icon="system/phone-escalation"></capitec-icon>
								</capitec-button>
							</div>
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
					class="call-label"
					label="Reference Number" 
					value = "${this.voiceReferenceNumber.value}"
					tabindex="${getTabIndex(this.voiceReferenceNumber)}"
					?hidden=${isHidden(this.voiceReferenceNumber)}>
				</horizon-label>
				<div class="ivr-option left-border">
					<horizon-select
						id="label-ivr"
						label="IVR Option Selected"
						display-field="value"
						.items="${this.ivrOption.possibleValues}"
						.value="${this.ivrOption.possibleValues[0].value}"
						tabindex="${getTabIndex(this.ivrOption)}"
						?hidden=${isHidden(this.ivrOption)}>
					</horizon-select>
				</div>
				<div class="left-border">
					<horizon-label
						class="call-label"
						label="Incoming Number"
						value="${this.incomingTelephoneNumber.value}"
						tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
						?hidden=${isHidden(this.incomingTelephoneNumber)}>
					</horizon-label>
				<div>
			</div>`;
	}

	renderErrorMessage() {
		if (this.validationFailed) {
			return html`
				<capitec-alert-banner 
								type="error" 
								label="${this.alertBanner_Message}"
								closable>
				</capitec-alert-banner>`;
		}
		return html``;
	}

	renderAddCallerDetails() {
		return html`
			<capitec-group class="body-group" layout="vertical" gap="none" halign="stretch" valign="top" class="search-fields">
				<div class="group-field-row">
					<capitec-text-field label="First name"
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
									display-field="value">
					</capitec-select>
				</div>

			</capitec-group>`;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-button id="id-back-button"
								type="clear"
								label="Back"
								?hidden=${isHidden(this.backButton)}
								.disabled="${isDisabled(this.backButton)}"
								tabindex="${getTabIndex(this.backButton)}"
								@click="${(e) => this.raiseBackEvent()}">
				</capitec-button>
				<capitec-sapacer></capitec-sapacer>
				<capitec-button type="clear"
								label="End Call Session"
								?hidden=${isHidden(this.endCallSessionButton)}
								.disabled="${isDisabled(this.endCallSessionButton)}"
								tabindex="${getTabIndex(this.endCallSessionButton)}"
								@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
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