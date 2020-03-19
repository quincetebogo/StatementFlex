import { Component, html, css } from 'platform/elements';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';
import StopcardHelper from '../../helpers/StopCardHelper';
import { StopCardService } from '../../services/StopCardService'

import '../EndCallSessionReason';
import './ConfirmCallerDetails';
import 'platform/components/popups/Modal';

import { EventAggregator } from 'platform/EventAggregator';

export class AddCallerDetailsComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		this.confirmedCaller = null;
		this.callerDetails = null;
		this.addCallerDetailsResponse = null;
		this.showEndCallModal = false;

		this.eventAggregator = EventAggregator.getInstance();

		this.isBusy = false;

		this.errorMessage = {
			errName: "",
			errSurname: ""
		};

		this.userDetails = {
			Name: "",
			Surname: ""
		};
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			errorMessage: { type: Object },
			confirmedCaller: { type: Object },
			callerDetails: { type: Object },
			isBusy: { type: Boolean },
			showEndCallModal: { type: Boolean },
			userDetails: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming data model
		this.voiceReferenceNumber = this.callerDetails.voiceReferenceNumber;
		this.ivrOption = this.callerDetails.ivrOption;
		this.incomingTelephoneNumber = this.callerDetails.incomingTelephoneNumber;
		this.endCallSessionButton = this.callerDetails.endCallSessionButton;
		this.firstNameTextField = this.callerDetails.nonClientInformation.firstNameTextField;
		this.nonClientRelationship = this.callerDetails.nonClientInformation.nonClientRelationship;


		// Continue to add field short cuts here.


	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onKeyPress(e) {
		if (e.detail.new != "") {
			this.errorMessage[`err${e.currentTarget.id}`] = "";
		}
		this.requestUpdate();
	}

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this.userDetails[e.currentTarget.id] = e.detail.new.text;
		}
		else {
			this.userDetails[e.currentTarget.id] = e.detail.new;
		}
	}

	onConfirmClick(e) {
		this.validateData()
	}



	// 	if (this.validateData()) {

	// 		let confirmedCaller = {
	// 			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
	// 			voiceReferenceNumber: this.voiceReferenceNumber.value,
	// 			ivrOption: this.ivrOption.value,
	// 			incidentReferenceNumber: this.incidentReferenceNumber,
	// 			agentTelephoneNumber: this.agentTelephoneNumber,
	// 			nonClientFullName: '', // TODO: Must be populated with the caller details added by this dialog
	// 			nonClientCellPhone: '',// TODO: Must be populated with the caller details added by this dialog
	// 			nonClientIDNumber: '',// TODO: Must be populated with the caller details added by this dialog
	// 			nonClientRelationship: ''// TODO: Must be populated with the caller details added by this dialog
	// 		}

	// 		this.raiseBackEvent(confirmedCaller);
	// 	}
	// }
	/*
	this.isBusy = true;

	let identifyCallerPromise = StopcardHelper.getInstance().identifyCaller(confirmedCaller);

	identifyCallerPromise.then((response) => {

		this.dispatchEvent(new CustomEvent('confirmed-caller', { detail: { confirmedCaller: response } }));
		this.isBusy = false;
	}, (error) => {

		console.log('Error in fetching Client Info.');
		this.isBusy = false;
	});
	this.requestUpdate();
	*/


	raiseBackEvent(confirmedCaller) {
		//TODO: Populate event with data to return to the confirm dialog.
		// it will then return to the landing page
		// The landing page will invoke IdentifyCaller and transition to the Client-Profie/Stopcard page
		this.dispatchEvent(new CustomEvent('on-back', {
			detail: {
				confirmedCaller: confirmedCaller
			}
		}));
	};


	validateData() {

		this.errorMessage.errName = this.userDetails.Name == "" ? "Required Field" : "";
		this.errorMessage.errSurname = this.userDetails.Surname == "" ? "Required Field" : "";

		this.requestUpdate();
		if (this.userDetails.Name != "" && this.userDetails.Surname != "") {
			return true;
		}
		return this.userDetails.Name;
	}

	onCallCancelled(reason) {
		let confirmedCaller = {
			voiceReferenceNumber: this.voiceReferenceNumber.value,
			ivrOption: this.ivrOption.value,
			incomingTelephoneNumber: this.incomingTelephoneNumber.value,
			callerFullName: this.callerFullName.value,
			southAfricanIDNumber: this.southAfricanIDNumber.value,
			verifiedTelephoneNumber: this.verifiedTelephoneNumber.value,
			livesIn: this.livesIn.value,
			languagePreference: this.languagePreference.value,
			birthdate: this.birthdate.value
		}

		this.eventAggregator.publish('call-end', {});
		//this.dispatchEvent(new CustomEvent('call-ended', { detail: { confirmedCaller: confirmedCaller, endCallReason: reason.detail.endCallReason } }));
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.grid-container{
				grid-row-gap: 0px;
				grid-column-gap: 0px;
				width:678px;
				margin:0px;
				padding:0px;
			}

			.populatedText{
				padding: 8px;
				height: 64px;
				width: 678px;
				border-bottom: 1px solid #dfdfdf;
			}

			.horizon-call{
				display: flex;
				flex-direction: row;
				margin: 0px;
			}

			.ref-call{
				text-align:left;
				padding-left: 24px;
				padding-top: 8px;
				padding-bottom: 8px;
				width:232px;
				height:64px;
				border: 0px;
				margin: 0px;
			}

			.footer-bar{
				width: 678px;
				height: 64px;
				margin: 0px;
				padding: 0px;
				border-top: : 1px solid #dfdfdf;
			}

			#label-value{
				color: #003652;
				font-family: "Hind Vadodara";
				font-size: 20px;
				font-weight: 600;
				line-height: 30px;
			}

			.ivr-option{
				width: 223px;
				height: 64px; 
				text-align:left;
				border: 0px;
				padding: 8px;
				border-left: 1px solid #dfdfdf;
				border-right: 0px;
				border-top: 0px;
				border-bottom: 0px;
				margin: 0px;
			}

			.incoming-call{
				width:232px;
				height:64px;
				text-align:left;
				padding-left: 24px;
				padding-top: 8px;
				padding-bottom: 8px;
				border-left: 1px solid #dfdfdf;
				border-right: 0px;
				border-top: 0px;
				border-bottom: 0px;
				margin: 0px;
			}

			`];

	}

	render() {
		if (this.showEndCallModal) {
			return html
				`<end-call-session 
					@on-cancel="${() => this.showEndCallModal = false}"
					@on-reason-set="${(reason) => this.onCallCancelled(reason)}">
				</end-call-session>`;
		}
		return html`
		${this.renderLoadingIndicator()}
				<capitec-modal type="free" header="Add Caller Details" header-align="left" >
					<div slot="body">
						${this.renderCallInformation()}
						${this.renderAddCallerDetails()}
					</div>
					${this.renderFooter()}
				</capitec-modal>
				
		`;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}
		else
			return html`
				<capitec-loading-indicator></capitec-loading-indicator>
		`;
	}

	renderCallInformation() {
		return html`
			<capitec-group layout="grid" class="grid-container"> 
				<capitec-action-bar class="populatedText">
					<div class="horizon-call"> 
						<div class="ref-call">
							<capitec-label label="Reference Number"></capitec-label>
							<capitec-label id="label-value"
										label="${this.voiceReferenceNumber.value}"
										tabindex="${getTabIndex(this.voiceReferenceNumber)}"
										?hidden=${isHidden(this.voiceReferenceNumber)}>
							</capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select id="label-value"
										label="IVR Option Selected"
										display-field="value"
										.value="${this.ivrOption.possibleValues[0]}"
										.items="${this.ivrOption.possibleValues}"
										tabindex="${getTabIndex(this.ivrOption)}"
										?hidden=${isHidden(this.ivrOption)}>
							</capitec-select>
						</div>
						<div class="incoming-call">
							<capitec-label label="Incoming Number"></capitec-label>
							<capitec-label id="label-value" 
										label="${this.incomingTelephoneNumber.value}"
										tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
										?hidden=${isHidden(this.incomingTelephoneNumber)}>
							</capitec-label>
						</div>
					</div>
				</capitec-action-bar>
			</capitec-group>
		`;
	}

	renderAddCallerDetails() {
		return html`
		<capitec-content-box style="width:98%;">
			<div>
				<capitec-text-field label="Name" id="Name" 
									error="${this.errorMessage.errName}" 
									@value-changed="${(e) => this._valueChanged(e)}" 
									@key-input="${(e) => this._onKeyPress(e)}">
				</capitec-text-field>
			</div>
			<div>
				<capitec-text-field label="Surname" id="Surname" 
									error="${this.errorMessage.errSurname}" 
									@value-changed="${(e) => this._valueChanged(e)}" 
									@key-input="${(e) => this._onKeyPress(e)}">
				</capitec-text-field>
			</div>
			<div>
				<capitec-text-field type="number" id="Cellphone" 
									label="Cellphone Number" 
									@value-changed="${(e) => this._valueChanged(e)}">
				</capitec-text-field><br>
			</div>
			<div style="margin:-20px 0px 0px 0px;">
				<capitec-select id="Relationship" 
									label="Choose relationship type (Optional)" 
									.items="${this.nonClientRelationship.possibleValues}" 
									display-field="text" 
									@value-changed="${(e) => this._valueChanged(e)}">
				</capitec-select>
			</div>
		</capitec-content-box>
		`;
	}

	// raiseBackEvent() {
	// 	console.log('raise event');
	// 	this.dispatchEvent(new CustomEvent('on-back', {
	// 		detail: {
	// 			message: 'Something important happened'
	// 		}
	// 	}));
	// }

	renderFooter() {
		return html`
			<capitec-action-bar slot="footer" class="footer-bar">
				<capitec-button 
					id="id-search-client-button" 
					type="clear" 
					label="Back"
					@click="${(e) => this.raiseBackEvent()}">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button 
					type="clear"
					label="End Call Session" 
					?hidden=${isHidden(this.endCallSessionButton)}
					.disabled="${isDisabled(this.endCallSessionButton)}"
					tabindex="${getTabIndex(this.endCallSessionButton)}"
					@click="${() => this.showEndCallModal = true}">
				</capitec-button>
				<capitec-button id="id-confirm-button" 
								type="primary" 
								label="Confirm" 
								@click="${(e) => this.onConfirmClick(e)}">
				</capitec-button>
			</capitec-action-bar>
		`;
	}
}

window.customElements.define(`horizon-add-caller`, AddCallerDetailsComponent);