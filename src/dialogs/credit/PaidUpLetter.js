import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonEmailInput';
import 'app/components/common/HorizonProductTile';
import 'app/components/common/HorizonPDFViewer';

const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * Paid up letter dialog is used to send paid up letter for the credit accounts
 * This component is invoked from the Favourites landing screen
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class PaidUpLetter
 * @extends {Component}
 */
export class PaidUpLetter extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.isBusy = true;
		this.alertBannerMessage = ``;
		this.selectedAccounts = [];

		// private variables
		this.flag = false;
		this.currPage = 0;
		this.encodedPDFs = ``;
		this.email = ``;
		this.confirmEmail = ``;
		this.emailLabel = `Enter email address`;
		this.confirmEmailLabel = `Confirm email`;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @param {object} selectedAccounts which accounts require paid up letter
	 * @param {object} encodedPDFs  Paid up letter pdfs to be viewed
	 * @param {string} registeredEmailId Client's registered email ID
	 */

	static get properties() {
		return {
			selectedAccounts: { type: Object },
			encodedPDFs: { type: Object },
			registeredEmailId: { type: String },

			// private properties
			isBusy: { state: true },
			flag: { state: true },
			alertBannerMessage: { state: true }
		};
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._onUnloading();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_initialise() {
		this._toggleBusyFlag();
	}
  
	_viewPDFViewer (item) {
		this.flag = !this.flag;

		if (!this.flag) {
			return;
		}
		this.dispatchEvent(new CustomEvent(`view-pdf`, { 
				detail: { accountNumber: item.accountNumber, accountType: item.type }
		}));
		
	}
  
	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	} 

	_cancelClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_sendClick() {
		const isValid = this._validateEmailAddress();

		if (!isValid) {
			return false;
		}

		this.dispatchEvent(new CustomEvent(`send`, {
			detail: {
				emailAddress: this.confirmEmail
			}
		}));
	}

	_onUnloading() {
		this.dispatchEvent(new CustomEvent(`on-unloading`, {}));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return isNullorEmpty(this.alertBannerMessage);
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles, 
			css`
				capitec-modal {
					width: 900px;
					height: auto;

					--theme-modal-free-max-height: 657px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
				}

				horizon-alert-banner {
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
				}

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-product-tile-detail-top: 22px;
				}

				horizon-alert-banner > capitec-group > capitec-label {
					margin: 16px 0px 16px 0px;

					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 14px;
					--theme-label-font-family: Hind Vadodara;
				}

				horizon-alert-banner > capitec-group > capitec-label[type="subtitle"] {
					margin-right: 5px;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;
				}

				div[slot="body"] {
					width: 531px;
					height: 486px;
					border-bottom: 1px solid #E1E1E1;
				}

				.seperator {
					width: 100%;
					border: 1px solid #E1E1E1;
					margin: 16px 0px 30px 0px;
				}

				.document-label[type="subtitle"] {
					line-height: 24px;
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
				}

				capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}

				horizon-email-input {
					--theme-layout-gap-spacing: 0px;
				}

				horizon-pdf-viewer{
					--theme-horizon-pdf-modal-header-width: auto;
				}

			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return this.flag ? this._viewPDF()
		: html`
			<capitec-modal type="free" header-align="left" header="Paid Up Letter">
				<div slot="body">
					<capitec-content-box>
						${this._renderAlertBanner()}
						${this._renderEmailFields()}
						${this._renderLoadingIndicator()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		return this.alertBannerMessage 
		? html`
			<horizon-alert-banner
				type="error"
				header="Notify: "
				label="${this.alertBannerMessage}">
			</horizon-alert-banner>`
		: html``;
	}

	_renderEmailFields() {
		const datesSelected = this.selectedAccounts;
		return html`
			<horizon-email-input
				labelOne="${this.emailLabel}"
				labelTwo="${this.confirmEmailLabel}"
				email="${this.email}"
				confirmEmail="${this.confirmEmail}"
				registeredEmailId="${this.registeredEmailId}"
				?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
				.callBack="${() => this._clearAlerts()}"
				@value-changed="${(e) => this._emailValueChanged(e)}">
			</horizon-email-input>

			<hr class="seperator">

			<capitec-label
				class="document-label"
				type="subtitle"
				label="View document(s)">
			</capitec-label>

			<capitec-group layout="vertical" gap="clear" halign="stretch" valign="top">
				${datesSelected.map(item => this._renderViewDocument(item))}
			</capitec-group>
		`;
	}

	_renderViewDocument(item) {
		return html`
			<horizon-product-tile 
				type="default"
				label="${item.productTypeDescription}"
				subtitle="${item.accountNumber}">
					${this._renderViewDocumnetLink(item)}
			</horizon-product-tile>
		`;
	}

	_renderViewDocumnetLink(item) {
		return html`
			<capitec-label 
				slot="detail"
				type="strong"
				label="View Document"
				class="viewDocumentLink"
				@click="${() => this._viewPDFViewer(item)}">
			</capitec-label>
		`;
	}

	_viewPDF() {
		return html`
			<horizon-pdf-viewer
				header="Paid Up Letter"
				encodedPDF="${this.encodedPDFs}"
				@cancel="${() => this._viewPDFViewer(null)}">
			</horizon-pdf-viewer>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button" 
					label="Cancel" 
					@click="${(e) => this._cancelClick(e)}">
				</capitec-button>
				<capitec-button
					id="id-send-button" 
					type="primary" 
					label="Send" 
					@click="${() => this._sendClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="paid-up-letter-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}
customElements.define(`horizon-paid-up-letter-dialog`, PaidUpLetter);