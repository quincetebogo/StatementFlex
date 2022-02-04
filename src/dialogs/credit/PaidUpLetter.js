import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/HorizonProductTile';
import 'app/components/common/HorizonPDFViewer';

const EMAIL_REG_EXP = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

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

		this.horizonStore = HorizonStore.getInstance();
		
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
		this.flag= false;
		this.currPage = 0;

		this.encodedPDF = ``;
	}
	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @param {object} callerInformation Identified caller information
	 * @param {Object} landingPageInfo Favourites landing page info
	 * @param {object} selectedAccounts which accounts require paid up letter
	 * @param {object} encodedPDFs  Paid up letter pdfs to be viewed
	 */
	static get properties() {
		return {
			callerInformation: { type: Object },
			landingPageInfo: { type: Object },
			selectedAccounts: { type: Object},
			encodedPDFs: { type: Object},
			navigatePDF: { type: Object },
			isBusy: { attribute: false },
			flag : {type: Boolean , attribute : false},
			alertBannerMessage: { attribute: false },
			emailText: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise ();
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

	_initialise() {
		
		this._toggleBusyFlag();
		//flow for selected accounts done here 
		
	}

	async _sendClick(e) {
		if (this._validateEmail(e)) 
		{
			// flow to success or unsuccessful 
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
				--theme-product-tile-subtitle-height: 20px;
				--theme-product-tile-subtitle-font-size: 16px;
				--theme-product-tile-heading-margin-left: 16px;
				--theme-product-tile-heading-margin-left: 6px;
				--theme-layout-gap-spacing: 8px;
				--theme-product-tile-title-font-weight: 600;
				--theme-radio-disabled-border-color: #E1E1E1;
				--theme-radio-disabled-background-color: #F7F7F7;
			}
			horizon-product-tile[disabled] {
				--theme-product-tile-subtitle-color: #7C7C7C;
				--theme-product-tile-default-colour: #7C7C7C;
			}
		.label-err-message{
				--theme-label-font-color:#C83C37;
			}

			capitec-alert-banner > capitec-label{
				margin: 16px 0px 16px 0px;
				--theme-label-font-size: 18px;
				--theme-label-font-family: Hind Vadodara;
			}

			.body-class {
				width: 531px;
				height: 400px;
				margin-left:16px;
				margin-right: 16px;
			}
			.err-body{
				width: 531px;
				height: 315px;
				margin-left:16px;
				margin-right: 16px;
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
			.confirm-search-label{
				height: 24px;
				width: 200px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-bottom: 16px;
			}

			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return this.flag ? this._viewPDF():
		html`
		<capitec-modal type="free" header-align="left" header="Paid Up Letter">
			<div slot="body" class="${this.alertBannerMessage ? `err-body` : `body-class`} ">
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
					<capitec-group layout="horizontal">
						<capitec-label
							type="subtitle"
							label="Notify: "
							class="label-err-message">
						</capitec-label>
						<capitec-label
							label="${this.alertBannerMessage}"
							class="label-err-message">
						</capitec-label>
					</capitec-group>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderEmailFields() {
		let datesSelected = this.selectedAccounts;
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
				<capitec-label class="confirm-search-label" label="Confirm email address"></capitec-label>
				<capitec-text-field 
					class="email-text" id="idConfirmEmailAddress" 
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

		<hr class="seperator">

		<capitec-label
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
			class="view-document"
			type="default"
			label="${item}"
			subtitle="123456789">
				${this._renderViewDocumnetLink(item)}
		</horizon-product-tile>`
		;
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

	_viewPDFViewer ()
	{
		this.flag = !this.flag;
	}

	_viewPDF() 
	{
		return html `
		<horizon-pdf-viewer
			header="Paid Up Letter: Credit Card"
			encodedPDF="${this.encodedPDF}"
			totalPages="${this.selectedAccounts.length}"
			currPage="${this.currPage}"
			@cancel="${()=>this._viewPDFViewer()}"
			@next="${() => this._navigate("next")}"
			@previous="${() => this._navigate("previous")}">
		</horizon-pdf-viewer>`
		;
	}

	async _navigate(step)
	{
        let datesSelected = this.selectedAccounts;
        if(step==="next"){
			this.currPage < datesSelected.length ? this.currPage++ : this.currPage;         
        	this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
        }else
		{
            this.currPage > 1 ? this.currPage-- : this.currPage;
            this.encodedPDF = await this.navigatePDF(datesSelected[this.currPage-1]);
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
customElements.define(`horizon-paid-up-letter-dialog`, PaidUpLetter);
