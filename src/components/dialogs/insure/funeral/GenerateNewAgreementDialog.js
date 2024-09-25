import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { INSURE_CALLER_PAGE } from 'app/constants/InsureCommon';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import {formatDateToInsure} from "app/utils/insureUtils"
import 'app/components/dialogs/insure/AgreementDialog';


/**
 * 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * go-to-confirm
 *  
 * @export
 * @class RequestCallback
 * @extends {Component}
 */

// #region CONSTANTS
const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Please confirm email`
};
// #endregion CONSTANTS

class GenerateNewAgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		
		this.policy = {};
		
		this.showNewAgreement = false;
		this.DocumentDetails = {};

		this.agreementAccepted = false;
		this.alertBannerMessage = ``


	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} policy - contains selected policy information
	 * @property {Boolean} showNewAgreement - show policy pause agreement dialog
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			documentDetails: { type: Object, state: true },
			fetchPolicyRescheduleDocumentDetails: { type: Object, state: true },
			sendEmail: { type: Object, state: true },
			showNewAgreement: { type: Boolean, state: true },
			agreementAccepted: { type: Boolean, state: true },
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			alertBannerMessage: { type: String, state: true },

		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}


	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	async _initialise() {
		console.log(this.policy)
		this.documentDetails = await this.fetchPolicyRescheduleDocumentDetails(this.policy, false);
		console.log(this.documentDetails)
	
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	async _confirmClick() {

		let resp = await this.fetchPolicyRescheduleDocumentDetails(this.policy, true);

		if (isNullorEmpty(resp)) {
			return
		}

		this.agreementAccepted = true;
		
	}

	/**
	 * dispatch cancel click event
	 * @returns {void}
	 */
	_cancelClick() {
		console.log(`in close`)
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	 _showAgreement() {
		this.showNewAgreement = true;
		
	}

	/**
	 * change event for email address
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	/**
	 * Clear alert banner message 
	 * 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	async _sendEmailClick() {
		const isEmailInputValid = this._validateEmailAddress();

		if (isEmailInputValid) {

			let emailPayload = {
				detail: {
					emailId: {detail: {emailAddress: this.email}},
					callerPage: INSURE_CALLER_PAGE.FUNERAL_NEW_AGREEMENT_GENERATION,
					contractRef: this.policy.contractReference,
					productCode: this.policy.productCode
				}
			}

			await this.sendEmail(emailPayload)
		}
	}

	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.alertBannerMessage);
	}


	
	// #endregion EVENT HANDLERS

	// #region RENDERING

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

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				horizon-product-tile {
					width: 100%;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.view-document {
					padding-top: 30px;
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
			<capitec-modal header="Generate Agreement" style="--theme-modal-alert-m-l-xl-width: 500px; --theme-modal-header-color: black;"> 
				<div slot="body" style="padding-bottom: 0px" >
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
			${this.agreementAccepted === false ? html`
				<div>
					<horizon-product-tile class="view-document" type="default" label="Policy Agreement" subtitle="Funeral plan" detail="" icon="" @click="${() => this._showAgreement()}">
						<capitec-label slot="detail" type="strong" label="View Document" >
						</capitec-label>
					</horizon-product-tile>
				</div>
				` 
				: html`

					${this._renderAlertBanner()}
					<!-- success and email -->
					<p>The Agreement has been successfully saved to CDS.</p> <p>Please enter and confirm clients email address if you would like to email a copy of the agreement.</p>

					<horizon-email-input
						labelOne="Enter email address"
						labelTwo="Confirm email"
						email="${this.email}"
						confirmEmail="${this.confirmEmail}"
						?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
						@value-changed="${(e) => this._emailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>
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
			
			<capitec-button slot="footer" type="secondary" label="${this.agreementAccepted ? "Done" : "Cancel" }" class="capitec-button-small"
				@click="${() => this._cancelClick()}">
			</capitec-button>
			
			${this.agreementAccepted === false ? html`
				<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
					@click="${() => this._confirmClick()}">
				</capitec-button>
			` : html`
				<capitec-button slot="footer" type="primary" label="Send" class="capitec-button-small"
					@click="${() => this._sendEmailClick()}">
				</capitec-button>
			`}
			

		`;
	}

	/**
	 * render agreement dialog
	 * @returns {html} html
	 */
	_renderAgreementDialog() {
		return this.showNewAgreement === false ? html``
			: html`
			<horizon-insure-agreement-dialog
			.agreementContent="${this.documentDetails.documentContent.value}"
			@back-click="${() => this.showNewAgreement = false}">
			</horizon-insure-agreement-dialog>
		`;
	}

		/**
	 * render the alert banner
	 * 
	 * @returns {html} html content 
	 */
		_renderAlertBanner() {
			return this.alertBannerMessage 
			? html`
				<capitec-alert-banner type="unsuccessful-red" class= "alert">
					<capitec-group layout="horizontal">
						<capitec-label
							type="subtitle"
							label="Notify:">
						</capitec-label>
						<capitec-label
							label="${this.alertBannerMessage}">
						</capitec-label>
					</capitec-group>
				</capitec-alert-banner>`
			: html``;
		}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-funeral-generate-new-agreement-dialog`, GenerateNewAgreementDialog);
