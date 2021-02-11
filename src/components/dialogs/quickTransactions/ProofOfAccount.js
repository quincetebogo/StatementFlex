import { View, css, html } from 'platform/elements';

export class ProofOfAccount extends View {
    /*
     * INITIALIZATION
     */
    constructor() {
        super();
        // Variables
        this.id_emailAddress = ``;
        this.id_confirmEmail = ``;
        this.isBusy = false;
        this.alertBannerMessage = ``;
        this.errMessage = {
            id_emailAddress: ``
        };
        this.label_err = ``;

        this.savingAccInfo = {};
        this.landingPageInfo = {};
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
			
            emailAddress: { type: String },
            alertBannerMessage: { type: String },
            account_open_Date: { type: Date },
            account_number: {type: String }
        };
    }

    /*
     * LIFECYCLE OVERRIDES
     */
    connectedCallback() {
        super.connectedCallback();
        //holding values in your page
        this.emailAddress = null;
        //TODO: add values used in screen such as acc number and open date
    }

    /*
     * EVENT HANDLERS
     */


    _sendClick() {
        if (this._validateEmail()) {
            //get account open date and number and save to state
            const state = {
                account_number: this.landingPageInfo.account_number,
                account_open_Date: this.landingPageInfo.account_open_Date
            };

            this.horizonStore.saveState(state);

            //add service call
            //if(this._serviceCall()){
            //navigate to success}
            //else {
            //navigate to unsuccess}
        }

    }

    _cancelClick() {
        this.dispatchEvent(new CustomEvent(`cancel`));
    }

    /*
     * PRIVATE METHODS
     */

    _serviceCall() {
        //TODO
       // /clientcare/documents / v1 / client / send - proof - of - account 

        //fetch('url')
        //.then(response => { return response.json(); })
        //.then(user=>{console.log(user);})
    }

    _validateEmail() {
        var emailAddress = this.id_emailAddress;
        var confirmEmailAddress = this.id_confirmEmail;
        if (emailAddress != null && emailAddress.includes("@") && (emailAddress == confirmEmailAddress)) {
            this.alertBannerMessage = ``;
            return true;
        } else if (emailAddress == '' || confirmEmailAddress == '') {
            this.alertBannerMessage = `Please complete all fields`;
            return false;
        } else if (emailAddress != confirmEmailAddress) {
            this.alertBannerMessage = `Email addresses do not match.`;
            return false;
        } else {
            this.alertBannerMessage = `Incorrect email address format ie. email@gmail.com`;
            return false;
        }
    }

    _onKeyPress(e) {
        this._clearErrors(e);
    }


    _clearErrors(e) {
        this.errMessage.id_emailAddress = ``;
        this.alertBannerMessage = ``;

    }

    _valueChanged(e) {
        this[e.currentTarget.id] = e.detail.new;
        this._clearErrors(e);
    }

    _isNullorEmpty(fieldValue) {
        return fieldValue === `` || fieldValue === null || fieldValue === undefined;
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
			.body-class {
				width: 531px;
				height: 280px;
				margin-left:16px;
				margin-right: 16px;			
			}
			div[slot="footer"]{
				margin-right:4px;
			}

			.err-body{
				width: 531px;
				height: 315px;
				margin-left:16px;
				margin-right: 16px;
			}
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
			.alert-banner{
				margin-top:16px;
				height:48px;
			}
			capitec-modal {
				width: 531px;
				height: 721px;
				--theme-modal-header-padding-left: 16px;
				
			}
			`
        ];
    }


    _mobileTemplate() {
        _webTemplate();
    }


    _webTemplate() {
        console.log("render");
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
		<capitec-text-field class="email-text" id="id_emailAddress" focussed value="${this.id_emailAddress}"
			name="mailAddress" @value-changed="${(e) => this._valueChanged(e)}"
			@key-input="${(e) => this._onKeyPress(e)}" label="Email address" error="${this.errMessage.id_emailAddress}">
		</capitec-text-field>
	</div>

	<div class="email-div">
		<capitec-label class="confirm-search-label" label="Confirm email address" type="title"></capitec-label>
		<capitec-text-field class="email-text" id="id_confirmEmail" .value="${this.id_confirmEmail}"
			@value-changed="${(e) => this._valueChanged(e)}" @key-input="${(e) => this._onKeyPress(e)}"
			name="confirmMailAddress" label="Email address" error="${this.errMessage.id_confirmEmail}">
		</capitec-text-field>
	</div>
</capitec-group>
		`;
    }

    _renderFooter() {
        return html`
		<capitec-group layout="horizontal">
			<capitec-button id="id-cancel-button" type="clear" label="Cancel" @click="${(e) => this._cancelClick(e)}">
			</capitec-button>
			<capitec-button id="id-send-button" type="primary" label="Send" @click="${(e) => this._sendClick(e)}">
			</capitec-button>
		</capitec-group>
		`;
    }


}
customElements.define(`horizon-proof-of-account`, ProofOfAccount);