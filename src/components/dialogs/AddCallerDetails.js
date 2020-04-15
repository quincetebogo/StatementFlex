import { Component, html, css } from 'platform/elements';
import { isDisabled, isHidden, getTabIndex, getValue } from '../../utils/channelServiceUtilities';

import 'platform/components/popups/Modal';

const RENDER_MODE = {
	ADD_CALLER: 0,
	END_CALL: 1,
};

export class AddCallerDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		this.confirmedCaller = null;
		this.addCallerDialog = null;
		this.isBusy = false;
		this.renderMode = RENDER_MODE.ADD_CALLER;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			confirmedCaller: { type: Object },
			addCallerDialog: { type: Object },
			isBusy: { type: Boolean },
			renderMode: { type: Number }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming data model
		this.voiceReferenceNumber = this.confirmedCaller.voiceReferenceNumber;
		this.ivrOption = this.confirmedCaller.ivrOption;
		this.incomingTelephoneNumber = this.confirmedCaller.incomingTelephoneNumber;
		this.incidentReferenceNumber = this.confirmedCaller.incidentReferenceNumber;
		this.agentTelephoneNumber = this.confirmedCaller.agentTelephoneNumber;
		//Fields to be rendered
		this.nonClientInformation = this.addCallerDialog.nonClientInformation;
		this.firstNameTextField = this.nonClientInformation.firstNameTextField;
		this.surnameTextField = this.nonClientInformation.surnameTextField;
		this.cellPhoneTextField = this.nonClientInformation.cellPhoneTextField;
		this.nonClientRelationship = this.nonClientInformation.nonClientRelationship;
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
		this.requestUpdate();
	}

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this[e.currentTarget.id].value = e.detail.new.value;
		}
		else {
			this[e.currentTarget.id].value = e.detail.new;
		}
	}

	addCallerDetails() {

		if (this.validateData()) {
			this.dispatchEvent(new CustomEvent('caller-added', {
				detail: {
					nonClientCallerInfo: this.nonClientInformation
				}
			}));
		}
		else {
			this.requestUpdate();
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

	// n/a

	validateData() {
		let fieldsHasError = false;
		for (let key in this.nonClientInformation) {
			let field = this.nonClientInformation[key];
			//When the field is required and it doesn't have any value - assigning error message
			if (field.required && !field.value && key != "cellPhoneTextField") {
				this[key].errorMessage = field.inputValidationOption.validationFailedMessage;
				fieldsHasError = true;
			}
		}
		return !fieldsHasError;
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
					height: 464px;
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
					height: 72px;
					width: 642px;
				}
				#id-back-button{
					margin-right: 288px;
				}
				#id-confirm-button{
					margin-right: 12px;
				}
			`];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.ADD_CALLER:
				return html`
						${this.renderLoadingIndicator()}
						<capitec-modal type="free" header="Add Caller Details" header-align="left" >
							<div slot="body" class="main">
								${this.renderCallInformation()}
								${this.renderAddCallerDetails()}
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

	renderAddCallerDetails() {
		return html`
		<capitec-content-box class="addCaller-box" nopadding>
			<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" class="search-fields">
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
										label="Cellphone Number (Optional)"
										?hidden=${isHidden(this.cellPhoneTextField)}
										.disabled="${isDisabled(this.cellPhoneTextField)}"
										tabindex="${getTabIndex(this.cellPhoneTextField)}"
										@value-changed="${(e) => this._valueChanged(e)}">
					</capitec-text-field><br>
				</div>
				<div class="group-field-row">
					<capitec-select label="Choose relationship type (Optional)"
									id="nonClientRelationship"
									value="${getValue(this.nonClientRelationship)}"
									display-field="value"
									?hidden=${isHidden(this.nonClientRelationship)}
									.disabled="${isDisabled(this.nonClientRelationship)}"
									tabindex="${getTabIndex(this.nonClientRelationship)}"
									.items="${this.nonClientRelationship.possibleValues}"
									@value-changed="${(e) => this._valueChanged(e)}">
					</capitec-select>
				</div>
			</capitec-group>
		</capitec-content-box>`;
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
		return html`<end-call-session 
						@on-cancel="${() => this.renderMode = RENDER_MODE.ADD_CALLER}"
						@on-reason-set="${(reason) => this.onCallCancelled(reason)}">
					</end-call-session>`;
	}
}

window.customElements.define(`horizon-add-caller`, AddCallerDetails);