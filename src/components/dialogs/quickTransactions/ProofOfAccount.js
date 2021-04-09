import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

const ACCOUNT_TYPE = `PRIMARY_SAVINGS`;
const EMAIL_REG_EXP = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

/**
/**
 * Proof of Account dialog is used to capture the client's email and validate it before sending.
 * This component is invoked from the Favourites landing screen
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class ProofOfAccount
 * @extends {Component}
 */
export class ProofOfAccount extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		// private properites
		this.isBusy = false;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
		
		// private variables
		this.idEmailAddress = ``;
		this.idConfirmEmailAddress = ``;
		this.errMessage = {
			idEmailAddress: ``,
			idConfirmEmail: ``
		};

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			callerInformation: { type: Object },
			landingPageInfo: { type: Object },
			
			isBusy: { attribute: false },
			alertBannerMessage: { attribute: false },
			emailText: { attribute: false },
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
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

	async _sendClick(e) {
		if (this._validateEmail(e)) {

			const clientInfo = {
				"cifNumber": this.callerInformation.cifNumber,
				"accountNumber": this.landingPageInfo.accountNumber,
				"accountOpenDate": this._formatDate(this.landingPageInfo.accountOpenedDate),
				"emailAddress": this.idEmailAddress,
				"accountType": ACCOUNT_TYPE
			};

			const returnValue = await this.quickTransactionService.sendProofOfAccount(clientInfo);

			if (returnValue.succeeded) {
				this.horizonRouter.navigateToProofOfAccountSuccess();
			} else {
				this.horizonRouter.navigateToProofOfAccountFailed();
			}
			// saving 'emailAddress' and 'accountNumber' in state.
			this.horizonStore.saveState({
				emailAddress: this.idEmailAddress,
				accountNumber: this.landingPageInfo.accountNumber
			});
		}

	}

	_formatDate(dateToFormat) {
        const stringToDate = new Date(dateToFormat);
        const tempdate = stringToDate.toISOString().slice(0, 10);
		return tempdate;
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
				width: 531px;
				height: 721px;
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
		.label-err-message{
				--theme-label-font-color:#C83C37;
			}

			capitec-label{
				margin: 16px 0px 16px 0px;
				--theme-label-font-size: 18px;
				--theme-label-font-family: Hind Vadodara;
			}

			.body-class {
				width: 531px;
				height: 280px;
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
		return html`
		<capitec-modal type="free" header-align="left" header="Proof Of Account">
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
				<capitec-label type="subtitle" label="Notify: " class="label-err-message"></capitec-label>
				<capitec-label label="${this.alertBannerMessage}" class="label-err-message"></capitec-label>
			</capitec-group>
		
		</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderEmailFields() {
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
		`;
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
customElements.define(`horizon-proof-of-account`, ProofOfAccount);