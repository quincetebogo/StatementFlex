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
		this.encodedPDF = ``;
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
	 */

	static get properties() {
		return {
			selectedAccounts: { type: Object },
			encodedPDFs: { type: Object },
			navigatePDF: { type: Object },

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
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_initialise() {
		this._toggleBusyFlag();
		//TODO: flow for selected accounts to be done here
	}

	_viewPDFViewer () {
		this.flag = !this.flag;
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

	_sendClick() {
		const isValid = this._validateEmailAddress();

		if (!isValid) {
			return false;
		}
		//TODO: Navigation to be added once the CS is ready.
	}

	_cancelClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	async _navigate(step) {
		const datesSelected = this.selectedAccounts;
		if (step === `next`) {
			this.currPage += this.currPage < datesSelected.length ? 1 : 0;
			this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage - 1]);
		} else {
			this.currPage -= this.currPage ? 1 : 0;
			this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage - 1]);
		}
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

				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
				}

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
				}

				capitec-alert-banner > capitec-group > capitec-label {
					margin: 16px 0px 16px 0px;

					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 14px;
					--theme-label-font-family: Hind Vadodara;
				}

				capitec-alert-banner > capitec-group > capitec-label[type="subtitle"] {
					margin-right: 5px;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;
				}

				div[slot="body"] {
					width: 531px;
					border-bottom: 1px solid #E1E1E1;
				}

				.seperator {
					width: 100%;
					border: 1px solid #E1E1E1;
					margin-bottom: 30px;
					margin-top: 10px;
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
		return this.alertBannerMessage ?
		html`
			<capitec-alert-banner type="unsuccessful-red">
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

	_renderEmailFields() {
		const datesSelected = this.selectedAccounts;
		return html`
			<horizon-email-input
				labelOne="${this.emailLabel}"
				labelTwo="${this.confirmEmailLabel}"
				email="${this.email}"
				confirmEmail="${this.confirmEmail}"
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
				label="${item}"
				subtitle="123456789">
					${this._renderViewDocumnetLink(item)}
			</horizon-product-tile>
		`;
	}

	_renderViewDocumnetLink(item) {
		this.currPage = this.selectedAccounts.indexOf(item);
		return html`
			<capitec-label 
				slot="detail"
				type="strong"
				label="View Document"
				class="viewDocumentLink"
				@click="${() => this._viewPDFViewer()}">
			</capitec-label>
		`;
	}

	_viewPDF() {
		return html`
			<horizon-pdf-viewer
				header="Paid Up Letter: Credit Card"
				encodedPDF="${this.encodedPDF}"
				totalPages="${this.selectedAccounts.length}"
				currPage="${this.currPage}"
				@cancel="${() => this._viewPDFViewer()}"
				@next="${() => this._navigate(`next`)}"
				@previous="${() => this._navigate(`previous`)}">
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
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

}
customElements.define(`horizon-paid-up-letter-dialog`, PaidUpLetter);