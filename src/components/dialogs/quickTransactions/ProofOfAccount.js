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
        this.errMessage = {
            id_emailAddress: ``,
			id_confirmEmail: ``
        };
        this.label_err = ``;

        this.savingAccInfo = {};
        this.landingPageInfo = {};


        this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
    }

    /*
     * PROPERTIES
     */
    static get properties() {
        return {
			callerInformation: { type: Object },
			incomingCallDetails: { type: Object },
			landingPageInfo: { type: Object },
            isBusy: { attribute: false },
            emailAddress: { attribute: false },
            alertBannerMessage: { attribute: false },
            account_open_Date: { attribute: false },
            account_number: { attribute: false },
            account_type: {attribute: false }
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


   async _sendClick(e) {
        if (this._validateEmail(e)) {
            // get account open date and number and save to state
            const state = {
                account_number: this.landingPageInfo.account_number,
                account_open_Date: this.landingPageInfo.account_open_Date
            };

            this.horizonStore.saveState(state);

            const clientInfo = {
                "cifNumber": this.callerInformation.cifNumber,
                "account_number": this.landingPageInfo.account_number,
                "account_open_Date": this._formatDate(this.landingPageInfo.account_open_Date),
                "emailAddress": this.emailAddress,
                "account_type": this.landingPageInfo.account_type
            };
            
            const returnValue = await this.quickTransactionService.sendProofOfAccount(clientInfo);

            if (returnValue.succeeded) {
                this.horizonRouter.navigateToProofOfAccountSuccess();
            } else {
                this.horizonRouter.navigateToProofOfAccountFailed();                
            }
        }

    }

    _formatDate(dateToFormat) {
        var stringToDate = new Date(dateToFormat);
        var tempdate = stringToDate.toISOString().slice(0, 10);
        return tempdate;
    }

    _cancelClick() {
        this.dispatchEvent(new CustomEvent(`cancel`));
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
            }
            this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.id_emailAddress = `Enter a valid email address i.e. email@gmail.com`;
            return false;
        } else if (this._isNullorEmpty(confirmEmailAddress)) {
            this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.id_confirmEmail = `Enter a valid email address i.e. email@gmail.com`;
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

    }

    _valueChanged(e) {
        this[e.currentTarget.id] = e.detail.new;
        this._clearErrors(e);
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

capitec-alert-banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;

					margin: 0px 0px 16px 0px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
}
			.body-class {
				width: 531px;
				height: 280px;
				margin-left:16px;
				margin-right: 16px;			
			}
			div[slot="footer"]{
				margin-right:4px;
			}

			//.err-body{
			//	width: 531px;
			//	height: 315px;
			//	margin-left:16px;
			//	margin-right: 16px;
			//}
			.label-err-message{
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			}
			.email-div{
				margin-top: 16px;
				height: 104px;
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
				margin-top: 0px;
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
			.email-text{
				height: 72px;
			}
			//.alert-banner{
			//	margin-top:16px;
			//	height:48px;
			//}
			capitec-modal {
				width: 531px;
				height: 721px;
				--theme-modal-header-padding-left: 16px;
				
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
		<capitec-alert-banner type="unsuccessful-red" class="alert-banner">
			<capitec-group layout="horizontal">
				<capitec-label label="Notify: " class="label-err-message"></capitec-label>
				<capitec-label label="${this.alertBannerMessage}" class="label-err-message"></capitec-label>
			</capitec-group>
		
		</capitec-alert-banner>
		 	`;
        }
        return html``;
    }

    _renderLoadingIndicator() {
        if (!this.isBusy) {
            return html``;
        }

        return html`<capitec-loading-indicator></capitec-loading-indicator>`;
    }

    _renderEmailFields() {
        return html`
		<capitec-group layout="vertical" gap="none" halign="stretch" valign="top">
			<div class="email-div">
				<capitec-label class="search-label" label="Enter email address" tabindex="-1"> </capitec-label>
				<capitec-text-field 
					class="email-text" 
					id="id_emailAddress" 
					focussed value="${this.id_emailAddress}"
					name="mailAddress" 
					@value-changed="${(e) => this._valueChanged(e)}"
					@key-input="${(e) => this._onKeyPress(e)}" 
					label="Email address" 
					error="${this.errMessage.id_emailAddress}">
				</capitec-text-field>
			</div>

			<div class="email-div">
				<capitec-label class="confirm-search-label" label="Confirm email address" type="title"></capitec-label>
				<capitec-text-field 
					class="email-text" id="id_confirmEmail" 
					.value="${this.id_confirmEmail}"
					@value-changed="${(e) => this._valueChanged(e)}" 
					@key-input="${(e) => this._onKeyPress(e)}"
					name="confirmMailAddress" label="Email address" 
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


}
customElements.define(`horizon-proof-of-account`, ProofOfAccount);