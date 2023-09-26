import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { EMAIL_ADDRESS_ERROR_MESSAGES } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/dialogs/insure/AgreementDialog';
import 'app/components/insure/InsureAccountSelect';

const STEPS = {
	ARREARS_DETAILS: 1,
	AGREEMENT: 2
};


/**
 * Life pay arrears dialog
 * 
 * Events Raised 
 * -------------
 * close-dialog
 *  
 * @export
 * @class LifePayArrearsDialog
 * @extends {Component}
 */
class LifePayArrearsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = STEPS.ARREARS_DETAILS;
		this.lifePayArrearsAgreementDetails = {};
		this.showAgreementDialog = false;
		this.email = ``;
		this.confirmEmail = ``;
		this.emailAlertBannerMessage = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			policy: { type: Object, state: true },
			lifePayArrearsAgreementDetails: { type: Object, state: true },
			generatePayArrearsDocument: { type: Object, state: true },
			showAgreementDialog: { type: Boolean, state: true },

			currentStep: { type: Number, state: true },
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			emailAlertBannerMessage: { type: String, state: true }
		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
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
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	//  #endregion EVENT HANDLERS

	//  #region PRIVATE METHODS

	/**
	 * agree event from dialog footer button, closes modal and navigates to success page
	 * 
	 * @returns {void} 
	 */
	// _agreeClick() {
	// 	const isEmailInputValid = this._validateEmailAddress();
	// 	if (!isEmailInputValid) {
	// 		return;
	// 	}
	// 	this.dispatchEvent(new CustomEvent(`agree`, { detail: { emailAddress: this.email, documentDetails: this.lifePayArrearsAgreementDetails } }));
	// }

	// HERE
	// _arrearsCheckedChange(e, outstanding) {
	// 	if (e.detail.new === true) {
	// 		this.payArrears.arrears.push({
	// 			dueDate: selected.dueDate,
	// 			amount: selected.amount,
	// 			objectID: selected.objectID
	// 		});

	// 		this.amount += outstanding.amount;
	// 		this.checked += 1;

	// 		this.errorMessage = ``;
	// 	} else if (e.detail.new === false) {
	// 		const index = this.payArrears.arrears.map(object => object.objectID).indexOf(selected.objectID);
	// 		this.payArrears.arrears.splice(index, 1);

	// 		this.insufficient = false;
	// 		this.optionSelected = true;
	// 		this.amount -= outstanding.amount;
	// 		this.checked -= 1;
	// 	}

	// 	this.requestUpdate();

	// }


	_checkEvent(selected, e) {

	}

	/**
	 * Back event from dialog footer button, takes you back to previous step
	 * 
	 * @returns {void}
	 */
	_backClick() {
		this.currentStep = STEPS.REASON;
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
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_MISMATCH;
		}
	}

	/**
	 * Clear alert banner message 
	 * 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.emailAlertBannerMessage = ``;
	}

	/**
	 * validation checks for email address
	 * 
	 * @returns {boolean} boolean for whether the alert banner message is empty or not
	 */
	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.emailAlertBannerMessage);
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

				.pay-arrears-dialog{
					--theme-modal-alert-m-l-xl-width: 520px;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
					--theme-modal-header-color: black; 
					--theme-modal-free-m-l-xl-width: 642px;
					--theme-modal-alert-m-l-xl-width: 840px;
					--theme-modal-body-padding: 0;
					z-index: 99;
				}

				.view-document {
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

				.arrears-form-body{
					padding: 0px; 
					margin: 0px 15px 0px 15px;
					min-height: 400px;
				}

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.alert{
					--theme-toast-width: 100%;
					margin-bottom: 20px;
				}

				.alert-banner{
					margin-top: 0px;
					width: 100%;
				}
				
				.email-title-label{
					margin: 10px 20px;
				}
				
				.checkbox{
					border: 1px solid #e1e1e1;
					border-radius: 5px;
					padding: 10px;
					margin-bottom: 10px;
				}

				#arrears-title-label{
					margin-bottom: 20px;
					margin-top: 10px;
				}

				#arrears-transaction-preview{
					display: flex; 
					justify-content: space-between; 
					margin-top: 10px;
					margin-bottom:10px;
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
				<capitec-modal type="free" header="${this.policy?.contractReference} - Life Cover Arrears">
					<div slot="body" style="width: 520px;">
						${this._renderDialogBody()}
					</div>
					<div slot="footer">
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
			<capitec-stepper
				layout="horizontal"
				.steps="${[{ title: `Details` }, { title: `Agreement` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			${this.currentStep === STEPS.ARREARS_DETAILS ? html`
				<capitec-content-box>
					<div class="alert-banner">
						<horizon-alert-banner
							type="info"
							header="Notify client:"
							label="The arrears payment amount is R???.??"
							layout="vertical">
						</horizon-alert-banner>
					</div>
				</capitec-content-box>
				<div class="arrears-form-body">
					<capitec-label type="title" label="Settle from account" id="arrears-title-label"></capitec-label>
					<capitec-label type="subtitle" label="Choose an account"></capitec-label>
					<insure-account-select 
						class="account-selectbox"
						@option-selected="${(e) => null}"
						.accountDetails = "${null}" .insufficient = "${null}" .label= "${`Please select`}">
					</insure-account-select>
					<div id="arrears-transaction-preview">
						<capitec-label type="subtitle" label="Arrears amount payable"></capitec-label>
						<capitec-label type="subtitle" label="Total arrears amount: ${formatCurrency(0)}"></capitec-label>
					</div>
					<capitec-check-group>
						${this.policy?.arrears?.map((outstanding, index) => html`
							${index === 0 ? html`
								<capitec-check class="checkbox" label="${formatDate(outstanding.arrearsPaymentDueDate, `MM yyyy`)} | ${formatCurrency(outstanding.arrearsPaymentDueAmount)}"
									@value-change="${(e) => this._arrearsCheckedChange(outstanding, index, e)}">
								</capitec-check>
							` : html`
								<capitec-check class="checkbox" label="${formatDate(outstanding.arrearsPaymentDueDate, `MM yyyy`)} | ${formatCurrency(outstanding.arrearsPaymentDueAmount)}"
									@value-change="${(e) => this._arrearsCheckedChange(outstanding, index, e)}">
								</capitec-check>
								`}
						`)}
					</capitec-check-group>
				</div>
			`
				: html`
				<capitec-content-box>
					<horizon-product-tile class="view-document" type="default" label="Cancellation Agreement" subtitle="Life Policy" detail="" icon="" @click="${() => this.showAgreementDialog = true}">
						<capitec-label slot="detail" type="strong" label="View Document" >
						</capitec-label>
					</horizon-product-tile>

					<capitec-label type="title" label="Email cancellation agreement" class="email-title-label"></capitec-label>

					${this._renderEmailAlertBanner()}

					<horizon-email-input
						labelOne="Enter email address"
						labelTwo="Confirm email"
						email="${this.email}"
						confirmEmail="${this.confirmEmail}"
						?showRequiredError="${this.emailAlertBannerMessage === EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED}"
						@value-changed="${(e) => this._emailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>
				</capitec-content-box>
			`}
		`;
	}

	/**
	 * Render modal footer section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`

				${this.currentStep === STEPS.AGREEMENT ? html`
						<capitec-button class="button" slot="footer" type="secondary" label="Back"
							@click="${() => this._backClick()}">
						</capitec-button>
						<capitec-button class="button" slot="footer" type="primary" label="Agree"
							@click="${() => this._agreeClick()}">
						</capitec-button>
					`
				: html`
						<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
							@click="${() => this._cancelClick()}">
						</capitec-button>
						<capitec-button class="button" slot="footer" type="primary" label="Settle"
							@click="${() => this._settleArrears()}">
						</capitec-button>
					`}
				
		`;
	}

	/**
	 * Render the alert banner
	 * 
	 * @returns {html} html content 
	 */
	_renderEmailAlertBanner() {
		return this.emailAlertBannerMessage
			? html`
			<capitec-alert-banner type="unsuccessful-red" class= "alert">
				<capitec-group layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Notify:">
					</capitec-label>
					<capitec-label
						label="${this.emailAlertBannerMessage}">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>`
			: html``;
	}

	/**
	 * Render the agreement dialog
	 * 
	 * @returns {html} html content 
	 */
	_renderAgreementDialog() {
		return this.showAgreementDialog === false
			? html``
			: html`
				<horizon-insure-agreement-dialog
				.agreementContent="${this.lifePayArrearsAgreementDetails?.documentContent.value}"
				@back-click="${() => this.showAgreementDialog = false}">
				</horizon-insure-agreement-dialog>
			`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-pay-arrears-dialog`, LifePayArrearsDialog);

/**
 * send close modal event to the consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-life-pay-arrears-dialog ... @close-modal="${this._handler}"></horizon-insure-life-pay-arrears-dialog
 *
 * @event LifePayArrearsDialog#close-modal
 * @type {Object} - N/A
 */
