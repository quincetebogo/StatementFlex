import { Component, css, html } from 'platform/elements';
import { INSURE_CALLER_PAGE} from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatDateToInsure, isValidRSAIdNumber, getDobFromIDNumber } from 'app/utils/insureUtils';
import 'app/components/dialogs/insure/AgreementDialog';

import 'app/components/dialogs/insure/InsureEmailDialog';

// Lookups


/**
 * update id/dob dialog 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree
 *  
 * @export
 * @class UpdateIdDobDialog
 * @extends {Component}
 */
class UpdateIdDobDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.showAgreement = false;
		this.nextClicked = false;
		this.idErrorMessage = ``;
		this.detailsChanged = false;
		this.lifeUpdated = false;
		this.showEmailDialog = false;
		this.emailOnPolicy = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * 
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			selectedLife: { type: Object, state: true },
			lifeSelected: { type: Boolean, state: true },
			nextClicked: { type: Boolean, state: true },
			idErrorMessage: { type: String, state: true },
			detailsChanged : { type: Boolean, state: true },
			lifeUpdated : { type: Boolean, state: true },
			executeUpdateIdDoB : { type: Object, state: true },
			showAgreement : { type: Boolean, state: true },
			documentDetails : { type: Object, state: true },
			showEmailDialog : { type: Boolean, state: true },
			sendUpdateIdDobEmail : { type: Object, state: true },
			emailOnPolicy: { type: String, state: true }
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * 
	 * @returns {void} 
	 */
	_cancelClick() {
		
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}


	/**
	 * next event from dialog footer button, toggles to next view
	 */
	_nextClick() {
		this.nextClicked = true;
	}

	/**
	 * back event from dialog footer button, toggles to previous view
	 */
	_backClick() {
		this.nextClicked = false;
		this.lifeSelected = false;
	}

	/**
	 * email event from dialog footer button, opens email dialog
	 */
	_emailClick() {
		let mainlife = this.policy.roleplayers.find(life => life.relationship === 'MainLife');
		this.emailOnPolicy = mainlife.email;
		this.showEmailDialog = true;
	}

	/**
	 * confirm event from dialog footer button, kicks off the update process and switches view if successful
	 */
	async _confirmClick(){
		const response = await this.executeUpdateIdDoB(this.policy, this.selectedLife);

		if (response !== false) {
			this.lifeUpdated = true;
		}

		this.documentDetails = response

		this.requestUpdate();
		// this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}


	/**
	 * Shows agreement dialog
	 */
	_showAgreementDialog() {
		this.showAgreement = true;
	}

	/**
	 * closes agreement dialog
	 */
	_closeAgreementDialog() {
		this.showAgreement = false;
	}


	/**
	 * determines if the updated ID is valid and updates the the DoB accordingly
	 * @param {event} e 
	 */
	_idChange(e) {

		if (e.detail.new.length === 13) {
			const isValid = isValidRSAIdNumber(e.detail.new);
			
			if (isValid) {
				this.selectedLife.idNumber = e.detail.new;
				this.selectedLife.dateOfBirth = getDobFromIDNumber(this.selectedLife.idNumber)
				this.idErrorMessage = ``;
				this.detailsChanged = true;
			} else {
				this.idErrorMessage = `ID number is Invalid`;
			}
			
		}
		this.requestUpdate()
	}

	/**
	 * Sets newly entered date of birth
	 * @param {event} e 
	 */
	_dobChange(e) {

		this.selectedLife.dateOfBirth = e.detail.new.date;
		this.selectedLife.idNumber = ``;
		this.detailsChanged = true;

		this.requestUpdate();

	}


	async _sendEmail(emailAddress) {
		let emailPayload = {
			detail: {
				emailId: emailAddress,
				callerPage: INSURE_CALLER_PAGE.FUNERAL_UPDATE_ID_DOB_DIALOG,
				contractRef: this.policy.contractReference,
				productCode: this.policy.productCode
			}
		}
		
	await this.sendUpdateIdDobEmail(emailPayload);


	}


	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS


	_selectLife(life, e) {

		if (e.detail.new) {
			this.selectedLife = life;
			this.lifeSelected = true;
		}
	}

	//  #endregion PRIVATE METHODS

	//  #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				
				${INSURE_CSS}

				.select{
					margin-bottom: 20px;
					width: 60%;
				}

				.button {
					width: 140px;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				.cancel-pdf-viewer{
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					width: 800px;
				}

				.life-assured-card{
					padding: 10px; min-height: inherit; width: 100%;
				}

				.life-assured-list{
					max-height: 300px;
				}

				view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				.view-document > capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderAgreementDialog()}
			${this._renderEmailDialog()}
			<capitec-modal type="alert" header="Update ID/DoB (${this.policy.contractReference})" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 500px;">
				<div slot="body" >
					${this._renderDialogBody()}
				</div>
				<div slot="footer" >
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			${this.lifeUpdated === false ? html`
				${this.nextClicked === false ? html`
					<capitec-content-box class="life-assured-list">
						<capitec-radio-group>
								${this.policy.roleplayers.map((life) => html`
									${life.lifeAssured === false || life.relationship === 'MainLife'? html``
									: html`
										<capitec-card class="life-assured-card">
											<capitec-radio label="${life.firstName} ${life.surname}"
												@value-changed= "${(e) => this._selectLife(life, e)}">
											</capitec-radio>
										</capitec-card>
									`}
								`)}
						</capitec-radio-group>
					</capitec-content-box>
				` 
				: html`
					<capitec-text-field label="ID" style="padding-bottom: 15px" 
						value="${this.selectedLife?.idNumber}"
						type="numeric"
						maxlength="13"
						error="${this.idErrorMessage}"
						@value-change="${(e) => this._idChange(e)}">
					</capitec-text-field>

					<capitec-date-time-picker
						type="single"
						mode="date"
						inputType="calendar"
						minDate="1901-01-01"
						maxDate="${new Date()}"
						date="${this.selectedLife?.dateOfBirth}"
						outputType="string"
						@value-change="${(e) => this._dobChange(e)}">
					</capitec-date-time-picker>
				`}
			` 
			: html`
				<capitec-label style="padding-top: 15px" type="subtitle" label="Would you like to email the client a copy of the agreement?"> 
				</capitec-label>

				<capitec-content-box>
					<horizon-product-tile class="view-document" type="default" label="Agreement" subtitle="Funeral Cover Plan" detail="" icon="" @click="${() => this._showAgreementDialog()}">
							<capitec-label slot="detail" type="strong" label="View Document" >
							</capitec-label>
					</horizon-product-tile>
				</capitec-content-box>
			`}
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				
			${this.lifeUpdated === false ? html`
				${this.nextClicked === false ? html`
					<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
						@click="${() => this._cancelClick()}">
					</capitec-button>

					<capitec-button class="button" slot="footer" type="primary" label="Next"
						@click="${() => this._nextClick()}"
						.disabled="${!this.lifeSelected}">
					</capitec-button>
				`: html`
					<capitec-button class="button" slot="footer" type="secondary" label="Back"
						@click="${() => this._backClick()}">
					</capitec-button>

					<capitec-button class="button" slot="footer" type="primary" label="Confirm"
						@click="${() => this._confirmClick()}"
						.disabled="${!this.detailsChanged}">
					</capitec-button>
				`}
			` 
			: html`
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>

				<capitec-button class="button" slot="footer" type="primary" label="Email"
					@click="${() => this._emailClick()}">
				</capitec-button>

			`}
				
				
		`;
	}

	_renderAgreementDialog() {
		return this.showAgreement === false ? html`` 
		: html` 
			<horizon-insure-agreement-dialog
				.agreementContent="${this.documentDetails.documentContent.value}"
				@back-click="${() => this._closeAgreementDialog()}">
			</horizon-insure-agreement-dialog>
		`
	}

	_renderEmailDialog() { 
		return this.showEmailDialog === false ? html`` 
		: html`
			<horizon-insure-email-dialog 
				.contractReference = "${this.policy.contractReference}" 
				.titleMessage = "${"Email Agreement"}"
				.email= "${this.emailOnPolicy}"
				@send-email = "${(emailAddress) => this._sendEmail(emailAddress)}"
				@close-modal="${() => this.showEmailDialog = false}"
			</horizon-insure-email-dialog>
		`
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-update-id-dob-dialog`, UpdateIdDobDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-update-id-dob-dialog ... @close-modal="${this._handler}"></horizon-insure-update-id-dob-dialog>
 *
 * @event UpdateIdDobDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <horizon-insure-update-id-dob-dialog ... @agree="${this._handler}"></horizon-insure-update-id-dob-dialog>
 *
 * @event CancelPolicyDialog#agree
 * @type {Object} - N/A
 */