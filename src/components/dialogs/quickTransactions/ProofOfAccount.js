import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

export class ProofOfAccount extends Component {
    /*
     * INITIALIZATION
     */
    constructor() {
        super();
        // Variables
        this.horizonRouter = HorizonRouter.getInstance();
        this.horizonStore = HorizonStore.getInstance();

        this.id_emailAddress = ``;
        this.id_confirmEmail = ``;
        this.isBusy = false;
        this.alertBannerMessage = ``;
        this.emailText = `Email address`;
        this.errMessage = {
            id_emailAddress: ``,
            id_confirmEmail: ``
        };
        this.label_err = ``;
        this.accountType = "PRIMARY_SAVINGS";
        this.isBusy = false;

        this.savingAccInfo = {};
        this.landingPageInfo = {};

        this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
    }

    /*
     * PROPERTIES
     */
    static get properties() {
        return {
            isBusy: { attribute: false },
            callerInformation: { type: Object },
            incomingCallDetails: { type: Object },
            landingPageInfo: { type: Object },
            isBusy: { attribute: false },
            emailAddress: { attribute: false },
            alertBannerMessage: { attribute: false },
            emailText: { attribute: false },
            account_open_Date: { attribute: false },
            account_number: { attribute: false },
            account_type: { attribute: false }
        };
    }

    /*
     * LIFECYCLE OVERRIDES
     */
    connectedCallback() {
        super.connectedCallback();
        // holding values in your page
        this.emailAddress = null;
        this.account_open_Date = null;
        this.account_number = null;
        this.account_type = null;
    }

    /*
     * EVENT HANDLERS
     */

    _toggleBusyFlag() {
        this.isBusy = !this.isBusy;
    }

    async _sendClick(e) {
        if (this._validateEmail(e)) {
            // get account open date and number and save to state
            const state = {
                account_number: this.landingPageInfo.accountNumber,
                account_open_Date: this.landingPageInfo.accountOpenedDate
            };

            this.horizonStore.saveState(state);

            const clientInfo = {
                "cifNumber": this.callerInformation.cifNumber,
                "account_number": this.landingPageInfo.accountNumber,
                "account_open_Date": this._formatDate(this.landingPageInfo.accountOpenedDate),
                "emailAddress": this.id_emailAddress,
                "account_type": this.accountType
            };

            const returnValue = await this.quickTransactionService.sendProofOfAccount(clientInfo);

            if (returnValue.succeeded) {
				this.horizonStore.saveState({
					emailAddress:this.id_emailAddress,
					accountNumber:this.landingPageInfo.accountNumber
				});	
                this.horizonRouter.navigateToProofOfAccountSuccess();
            } else {
				this.horizonStore.saveState({
					emailAddress:this.id_emailAddress,
					accountNumber:this.landingPageInfo.accountNumber
				});
                //this.horizonRouter.navigateToProofOfAccountFailed();
				this.horizonRouter.navigateToProofOfAccountSuccess();
            }
        }

    }

    _formatDate(dateToFormat) {
        var stringToDate = new Date(dateToFormat);
        var tempdate = stringToDate.toISOString().slice(0, 10);
        return tempdate;
    }

    _cancelClick(e) {
        this.dispatchEvent(new CustomEvent(`cancel`, {}));
    }

    /*
     * PRIVATE METHODS
     */

    _validateEmail(e) {
        const emailAddress = this.id_emailAddress;
        const confirmEmailAddress = this.id_confirmEmail;

        var regCheck = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        //CORRECT
        if (!this._isNullorEmpty(emailAddress) && (emailAddress == confirmEmailAddress)) {
            if (regCheck.test(emailAddress)) {
                this.alertBannerMessage = ``;
                this.errMessage.id_emailAddress = ``;
                this.errMessage.id_confirmEmail = ``;
                return true;
            } else if (!emailAddress.includes("@")) {
                this.alertBannerMessage = `Email address is invalid`;
                this.errMessage.id_emailAddress = `An email must contain a single @`;
                return false;
            } else {
                this.alertBannerMessage = `Incorrect email address format ie. email@gmail.com`;
                this.errMessage.id_emailAddress = `Invalid email address`;
                this.errMessage.id_confirmEmail = `Invalid email address`;
                return false;
            }
        }//EMAIL EMPTY
        else if (this._isNullorEmpty(emailAddress)) {
            if (this._isNullorEmpty(confirmEmailAddress)) {
                this.errMessage.id_confirmEmail = `Enter a valid email address i.e. email@gmail.com`;
                this.emailText = `email@gmail.com`;
            }
            this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.id_emailAddress = `Enter a valid email address i.e. email@gmail.com`;
            this.emailText = `email@gmail.com`;
            return false;
        } else if (this._isNullorEmpty(confirmEmailAddress)) {
            this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.id_confirmEmail = `Enter a valid email address i.e. email@gmail.com`;
            this.emailText = `email@gmail.com`;
            return false;
        }//EMAILS DON'T MATCH 
        else if (emailAddress != confirmEmailAddress) {
            this.alertBannerMessage = `Email and Confirm email don't match`;
            this.errMessage.id_emailAddress = `Invalid email`;
            this.errMessage.id_confirmEmail = `Invalid email`;
            return false;
        }
    }

    _onKeyPress(e) {
        this._clearErrors(e);
    }


    _clearErrors(e) {
        this.errMessage.id_emailAddress = ``;
        this.errMessage.id_confirmEmail = ``;
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

    _errorHandler(ex) {

        return true;
    }

    /*
     * PUBLIC METHODS
     */

    /*
     * RENDERING
     */

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
					id="id_emailAddress" 
					focussed value="${this.id_emailAddress}"
					name="mailAddress" 
					@value-changed="${(e) => this._valueChanged(e)}"
					@key-input="${(e) => this._onKeyPress(e)}" 
					label="${this.emailText}" 
					error="${this.errMessage.id_emailAddress}">
				</capitec-text-field>
			</div>

			<div class="email-div">
				<capitec-label class="confirm-search-label" label="Confirm email address"></capitec-label>
				<capitec-text-field 
					class="email-text" id="id_confirmEmail" 
					.value="${this.id_confirmEmail}"
					@value-changed="${(e) => this._valueChanged(e)}" 
					@key-input="${(e) => this._onKeyPress(e)}"
					name="confirmMailAddress" label="${this.emailText}" 
					error="${this.errMessage.id_confirmEmail}">
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