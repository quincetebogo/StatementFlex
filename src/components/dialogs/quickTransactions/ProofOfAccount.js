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

        this.callerInformation = this.state.callerInformation;
        this.incomingCallDetails = this.state.incomingCallDetails;
        this.savingAccInfo = {};

    }

    /*
     * PROPERTIES
     */
    static get properties() {
        return {
            isBusy: { type: Boolean },
            emailAddress: { type: String },
            alertBannerMessage: { type: String },
            account_open_Date: { type: date },
            account_number: {type: String}
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
            this.errMessage.id_emailAddress = ``;

            //TODO
            //get account open date and number and save to state
            //this.horizonStrone.recoverState();
            //this.savingsAccInfo = recovered state info.
            //const state = {
            //    account_open_Date: this.account_open_Date,
            //    account_number: this.account_number
            //};

            //this.horizonStore.saveState(state);

            //add service call
            //if(this._serviceCall()){
            //navigate to success}
            //else {
            //navigate to unsuccess}

  

        } else {
            this.errMessage.id_emailAddress = `Invalid email address`;
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
        } else if (emailAddress != confirmEmailAddress) {
            //ask Jeff
            this.alertBannerMessage = `Email addresses do not match`;
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
			.textEnterEmail{
				margin-top:20px;
				margin-bottom:20px;								
			}
			.textConfirmEmail{
				margin-top:20px;
				margin-bottom:20px;	
			}
			.bannerInvalidEmail{
				margin-top:0px;
				margin-bottom:0px;
			}
			.textInvalidEmail{
				
				margin-bottom:20px;
			}
			.search-label{
				height: 24px;
				width: 100%;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				margin-top: 0px;
				margin-bottom: 18px;
			}
			.search-field-row{
				height: 72px;
				margin-top: 8px;
			}

			div[slot="body"] {
				width: 100%;
				height: 300px;
			}
			.reset-margin-bottom{
				margin-bottom : 0px;
			}
			.email-text{
				margin-bottom:20px;
				
			}
			#id-error-banner{
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
				margin-right:3px;
			}
			#id-error-banner-message{
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				letter-spacing: 0;
				line-height: 20px;
			}
			`
        ];
    }

    _webTemplate() {
        console.log("render");
        return html`
		<capitec-modal type="form" header-align="left" header="Proof Of Account">
			<div slot="body">
				<capitec-content-box>
					${this._renderAlertBanner()}
					${this._renderEmailFields()}
				</capitec-content-box>
				${this._renderLoadingIndicator()}
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
    }

    _renderAlertBanner() {
        if (!this._isNullorEmpty(this.alertBannerMessage)) {
            return html`
		<capitec-alert-banner type="unsuccessful-red">
			<capitec-group id="id-notify-banner-group" layout="horizontal">
				<capitec-label label="Notify: " id="id-error-banner"></capitec-label>
				<capitec-label label="${this.alertBannerMessage}" id="id-error-banner-message"></capitec-label>
			</capitec-group>
		
		</capitec-alert-banner>
		 	`;
        }
        return html`<capitec-label class="search-label" label="Enter email address" tabindex="-1" }>
</capitec-label>`;
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
	<div class="search-field-row">
		<capitec-text-field id="id_emailAddress" focussed value="${this.id_emailAddress}" name="mailAddress"
			@value-changed="${(e) => this._valueChanged(e)}" @key-input="${(e) => this._onKeyPress(e)}"
			label="Email address" class="email-text" error="${this.errMessage.id_emailAddress}">
		</capitec-text-field>
		<br>

		<capitec-label class="search-label" label="Confirm email address" type="title"></capitec-label>
		<capitec-text-field id="id_confirmEmail" .value="${this.id_confirmEmail}"
			@value-changed="${(e) => this._valueChanged(e)}" @key-input="${(e) => this._onKeyPress(e)}"
			name="confirmMailAddress" label="Email address" class="email-text">
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