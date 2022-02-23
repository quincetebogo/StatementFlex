import { Component, css, html } from 'platform/elements';
import 'app/components/common/HorizonProductTile';
import 'app/components/common/HorizonPDFViewer';


const EMAIL_REG_EXP = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

/**
 * Settlement quote dialog is used to settlement quotes for the credit accounts
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class SettlementQuote
 * @extends {Component}
 */
export class SendSettlementQuote extends Component {
	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		
		// private properites
		this.isBusy = true;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
		this.selectedAccounts = [];
		// private variables
		this.idEmailAddress = ``;
		this.idConfirmEmailAddress = ``;
		this.errMessage = {
			idEmailAddress: ``,
			idConfirmEmail: ``
		};
		this.flag = false;
		this.currPage = 0;
		this.encodedPDF = ``;
	}
	// --------------
	// PROPERTIES
	// --------------
	/**
	 * @param {object} selectedAccounts which accounts to send quote
	 * @param {object} encodedPDFs  Settlement quote pdfs to be viewed
	 */

	static get properties() {
		return {
			selectedAccounts: { type: Object },
			encodedPDFs: { type: Object },
			navigatePDF: { type: Object },
			// private properties
			isBusy: { state: true },
			flag: { state: true },
			alertBannerMessage: { state: true },
			emailText: { state: true }
		};
	}
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();
		this._toggleBusyFlag();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_sendClick(e) {
		if (this._validateEmail(e)) {

			this.dispatchEvent(new CustomEvent(`send`, { detail: { selectedAccounts: this.selectedAccounts, emailAddress: this.idEmailAddress } }));
		}
	}

	_cancelClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateEmail(e) {
		// CORRECT
		if (!this._isNullorEmpty(this.idEmailAddress) && this.idEmailAddress === this.idConfirmEmailAddress) {
			if (EMAIL_REG_EXP.test(this.idEmailAddress)) {
				this.alertBannerMessage = ``;
				this.errMessage.idEmailAddress = ``;
				this.errMessage.idConfirmEmail = ``;
				return true;
			} else if (!this.idEmailAddress.includes(`@`)) {
				this.alertBannerMessage = `Email address is invalid`;
				this.errMessage.idEmailAddress = `An email must contain a single @`;
				return false;
			}
				this.alertBannerMessage = `Incorrect email address format ie. email@gmail.com`;
			this.errMessage.idEmailAddress = `Invalid email address`;
			this.errMessage.idConfirmEmail = `Invalid email address`;
			return false;
		} else if (this._isNullorEmpty(this.idEmailAddress)) {
			// EMAIL EMPTY
			if (this._isNullorEmpty(this.idConfirmEmailAddress)) {
				this.errMessage.idConfirmEmail = `Enter a valid email address i.e. email@gmail.com`;
				this.emailText = `email@gmail.com`;
			}
			this.alertBannerMessage = `Complete all fields to continue`;
			this.errMessage.idEmailAddress = `Enter a valid email address i.e. email@gmail.com`;
			this.emailText = `email@gmail.com`;
			return false;
		} else if (this._isNullorEmpty(this.idConfirmEmailAddress)) {
			this.alertBannerMessage = `Complete all fields to continue`;
			this.errMessage.idConfirmEmail = `Enter a valid email address i.e. email@gmail.com`;
			this.emailText = `email@gmail.com`;
			return false;
		} else if (this.idEmailAddress !== this.idConfirmEmailAddress) {
			// EMAILS DON'T MATCH 
			this.alertBannerMessage = `Email and Confirm email don't match`;
			this.errMessage.idEmailAddress = `Invalid email`;
			this.errMessage.idConfirmEmail = `Invalid email`;
			return false;
		}
	}

	_onKeyPress(e) {
		this._clearErrors(e);
	}

	_clearErrors(e) {
		this.errMessage.idEmailAddress = ``;
		this.errMessage.idConfirmEmail = ``;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors(e);
		this.emailText = `Email address`;
	}

	_isNullorEmpty(fieldValue) {
		return fieldValue === `` || fieldValue === null || fieldValue === undefined;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles, 
			css`
			capitec-modal {
				width: 900px;
				height: 900px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-header-color: #3A3A3A;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
			}
			capitec-alert-banner{
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
				--theme-alert-banner-icon-margin-left: 15px;
				--theme-alert-banner-icon-margin-right: 15px;
				margin: 16px 0px 0px 0px;
			
			}
			horizon-product-tile {
				--theme-product-tile--height: 64px;
				--theme-product-tile-title-height: 20px;
				--theme-product-tile-title-font-size: 16px;
				--theme-product-tile-heading-margin-left: 16px;
				--theme-layout-gap-spacing: 8px;
				--theme-product-tile-title-font-weight: 600;
			}
			capitec-alert-banner > capitec-label{
				margin: 16px 0px 16px 0px;
				--theme-label-font-size: 18px;
				--theme-label-font-family: Hind Vadodara;
			}
			.seperator {
				width: 531px;
				border-bottom: 1px solid #E1E1E1;
				margin-bottom: 20px;
				margin-top: 16px;
			}
			.body-class {
				width: 531px;
				height: 490px;
				margin-left:16px;
				margin-right: 16px;
			}
			.view-document {
				--theme-product-tile-heading-margin-left: 16px;
				--theme-product-tile-detail-top: 20px;
				--theme-product-tile-detail-right: 16px;
			}
			capitec-label[type="strong"] {
				line-height: 20px;
				cursor: pointer;

				--theme-label-font-color: #009DE0;
				--theme-label-strong-font-size: 16px;
				--theme-label-strong-font-weight: 600;

			}
			.search-label{
				height: 24px;
				width: 200px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-top: 16px;
				margin-bottom: 16px;
			}
			.email-div {
				margin-bottom: 16px;
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
		<capitec-modal type="free" header-align="left" header="Settlement Quote">
			<div slot="body" class="body-class">
				${this._renderAlertBanner()}
				${this._renderEmailFields()}
				${this._renderLoadingIndicator()}
			</div>
			<div slot="footer" class="footer-class">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		if (!this._isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<capitec-alert-banner type="unsuccessful-red">
					<p><b>Notify:</b> ${this.alertBannerMessage}</p>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderEmailFields() {
		const datesSelected = this.selectedAccounts;
		return html`
		<capitec-group layout="vertical" gap="none" halign="stretch" valign="top">
			<div class="email-div">
				<capitec-label class="search-label" label="Enter email address" type="title"> </capitec-label>
				<capitec-text-field 
					class="email-text" 
					id="idEmailAddress" 
					oncopy="return false"
					onpaste="return false"
					oncut="return false"
					.value="${this.idEmailAddress}"
					name="mailAddress" 
					@value-changed="${(e) => this._valueChanged(e)}"
					@key-input="${(e) => this._onKeyPress(e)}" 
					label="${this.emailText}" 
					error="${this.errMessage.idEmailAddress}">
				</capitec-text-field>
			</div>
			<div class="email-div">
				<capitec-label class="search-label" label="Confirm email address"></capitec-label>
				<capitec-text-field 
					class="email-text" 
					id="idConfirmEmailAddress" 
					oncopy="return false"
					onpaste="return false"
					oncut="return false"
					.value="${this.idConfirmEmailAddress}"
					@value-changed="${(e) => this._valueChanged(e)}" 
					@key-input="${(e) => this._onKeyPress(e)}"
					name="confirmMailAddress" label="${this.emailText}" 
					error="${this.errMessage.idConfirmEmail}">
				</capitec-text-field>
			</div>
		</capitec-group>
		<div class="seperator"></div>
		<capitec-label
			type="subtitle"
			class="search-label"
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
			class="view-document"
			type="default"
			label="${item.accountName}"
			subtitle="${item.accountNumber}">
				${this._renderViewDocumnetLink(item)}
		</horizon-product-tile>`;
	}

	_renderViewDocumnetLink(item) {
		this.currPage = this.selectedAccounts.indexOf(item);
		return html`
			<capitec-label 
				slot="detail"
				type="strong"
				label="View Document"
				class="viewDocumentLink"
				@click="${() => this.flag = !this.flag}">
			</capitec-label>
		`;
	}

	_viewPDF() {
		return html`
		<horizon-pdf-viewer
			header="Settlement Quote"
			encodedPDF="${this.encodedPDF}"
			totalPages="${this.selectedAccounts.length}"
			currPage="${this.currPage}"
			@cancel="${() => this.flag = !this.flag}"
			@next="${() => this._navigate(`next`)}"
			@previous="${() => this._navigate(`previous`)}">
		</horizon-pdf-viewer>`;
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
	
	_renderFooter() {
		return html`
		<capitec-group layout="horizontal">
			<capitec-button
				id="id-cancel-button" 
				type="clear" 
				label="Cancel" 
				@click="${(e) => this._cancelClick(e)}">
			</capitec-button>
			<capitec-button
				id="id-send-button" 
				type="primary" 
				label="Send" 
				@click="${(e) => this._sendClick(e)}">
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
customElements.define(`horizon-settlement-quote-dialog`, SendSettlementQuote);