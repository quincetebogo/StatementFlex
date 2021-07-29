import { Component, css, html } from 'platform/elements';
import { formatCurrency, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'platform/components/popups/Modal';
import { DateTime } from 'luxon';

const MESSAGE = `Confirm the following information to approve the DebiCheck mandate.`;
const ERROR_MESSAGE = `Make a selection to confirm the following information to approve the DebiCheck mandate.`;
const QUESTIONS = {
    0: {color: "black", accepted: 2},
    1: {color: "black", accepted: 2},
    2: {color: "black", accepted: 2},
    3: {color: "black", accepted: 2}
};

export class ApproveDebiCheckMandate extends Component {

    // --------------
    // INITIALISATION
    // --------------

    //collectionDateFrequency
    //YEAR: Yearly
    //MNTH: Monthly
    //WEEK: Weekly
    //QURT: Quarterly
    //MIAN: Half Yearly
    //ADHO: Monthly by Rule
    //FRTN: Fortnightly

    constructor() {
        super();
        this.mandateId = `112233445566`; //mandateInfo.mandateReference
        this.referenceNumber = `998877665544`; //mandateInfo.contractReference
        this.fullName = `Mr Ivan Makatini`;
        this.installmentAmount = 0; //mandateSummaryList.amount
        this.firstCollectionDate = new Date().toISOString().substr(0, 10);//mandateInfo.firstCollectionDate  .substring(0, 10);
        this.collectionDateFrequency = ``;//mandateSummaryList.collectionDate.frequency
        this.accountNumber = `1164116973`;
        this.shortName = `Mr I. Makatini`;
        this.today = new Date().toISOString().substr(0, 10);
        this.emailAddress = `ivanmakatini@email.com`; //QUESTION location? state?
        this.error = false;
        this.alertType = `info`;
        this.alertMessage = MESSAGE;
        this.approve = false;
    }

    // ----------
    // PROPERTIES
    // ----------

	/**
	 * @property {String} mandateId - ID to be used when referencing the mandate.
	 *
	 * @readonly
	 * @static
	 * @memberof AcceptDebiCheckMandate
	 */
    static get properties() {
        return {
            mandateInfo: { type: Object },
            debiCheckDetails: { type: Object },
            alertMessage: { type: String, attribute: false }
        };
    }


    async _initialise() {
        

        for (const key in QUESTIONS) {
            QUESTIONS[key].accepted = 2;
        }

        this.mandateId = this.debiCheckDetails.mandateReference;
        this.referenceNumber = this.debiCheckDetails.contractReference;

        //this.fullName = `Mr Ivan Makatini`; state.callerInformation.name
        //this.accountNumber = `1164116973`; this.landingPageInfo.accountNumber
        //this.shortName = `Mr I. Makatini`; 
        //this.emailAddress = `ivanmakatini@email.com`;

        this.installmentAmount = formatCurrency(this.mandateInfo.amount);
        this.firstCollectionDate = isNullorEmpty(this.mandateInfo) ? new Date() :  this.mandateInfo.firstCollectionDate.toISOString().substr(0, 10);
        this.collectionDateFrequency = this.mandateInfo.collectionDate.frequency
        this.today = new Date().toISOString().substr(0, 10);

    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();
        this._initialise();
    }

    // --------------
    // EVENT HANDLERS
    // --------------

    _cancelClick() {
        this.dispatchEvent(new CustomEvent(`cancel`));
    }

    _approveClick() {
        if (this._validateAccepted()) {
            this.dispatchEvent(new CustomEvent(`approve`, {
                detail: { mandateId: this.mandateId }
            }));
        }        
    }

    _checkAccepted() {
        for (const key in QUESTIONS) {
            if (QUESTIONS[key].accepted == 0) {
                this.alertMessage = ` DebiCheck will not be approved and will result in expired mandates.`;
                return true;
            }
        }
        return false;
    }

    _validateAccepted() {
        let returnVal = true;
        for (const key in QUESTIONS) {
            if (QUESTIONS[key].accepted == 2) {
                QUESTIONS[key].color = "red";
                this.alertMessage = ERROR_MESSAGE;
                this.alertType = 'unsuccessful-red';
                this.requestUpdate();
                returnVal = false;
            }
        }
        if (!this.approve) {
            this.alertMessage = ERROR_MESSAGE;
            this.alertType = 'unsuccessful-red';
            this.requestUpdate();
            return false;
        }
        return returnVal;
    }

    _agree(e, row, val) {
        if (e.detail.new) {
        this._clearErrors(row);
            if (val == 1) {
                QUESTIONS[row].color = "black";
                QUESTIONS[row].accepted = 1;
                this.requestUpdate();
            } else if(val== 0){
                QUESTIONS[row].color = "#D4781C";
                QUESTIONS[row].accepted = 0;
                this.requestUpdate();
            }
        }

    }

    _toggleAgreementsAccept(e) {
        this.approve = !this.approve;
        this._clearErrors(5);
    }

    _clearErrors(row) {
        this.alertMessage = MESSAGE;
        this.alertType = 'info';
        if (row < 5) {
         QUESTIONS[row].color = "black";
        }
        this.requestUpdate();
    }

    static get styles() {
        return [
            super.styles,
            css`
                capitec-modal {
					width: 808px;
					height: 882px;

					--theme-modal-free-max-width: 808px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					//--theme-modal-footer-padding: 8px 16px 8px 0px;                    
                }

                .main-cb {
                    height: 754px;
                    
                	--theme-container-padding-left: 16px;
                	--theme-container-padding-top: 16px;
                	--theme-container-padding-right: 16px;
                	--theme-container-padding-bottom: 0px;    
                }

				capitec-expander-group {
					width: 776px;

					--theme-expander-border: none;
					//--theme-expander-group-container-margin-bottom: 8px;
					--theme-expander-header-height: 48px;
				}

				capitec-expander-group > capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
                    margin-bottom: 8px;

					--theme-expander-indicator-width: 13px;			
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-expander-height: auto;
				}

				capitec-expander-group > capitec-expander > capitec-content-box {
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-right: 16px;
                }

                capitec-label{
                    height: 20px;
                    width: 81px;
                    color: #3A3A3A;
                    font-family: "Hind Vadodara";
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0;
                    line-height: 20px;
                }
                capitec-alert-banner{
                    font-family: "Hind Vadodara";
                    letter-spacing: 0;
                    line-height: 20px;
                
                    --theme-alert-banner-height: 48px;
                    --theme-alert-banner-font-size: 14px;
	                --theme-alert-banner-info-font-color: #3A3A3A;
	                --theme-alert-banner-warning-font-color: #3A3A3A;
	                --theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
                }

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}
				capitec-card {
					justify-content: center;
					margin-bottom: 13px;

					--theme-card-min-height: 48px;
				}
			    .agreement-content {
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
			    }
			    .agreement-content > ol {
			    	margin: 0px;
			    	padding-left: 20px;
                    margin-bottom: 40px;
			    }
			    .agreement-content > ol > li {
			    	padding-left: 15px;
                    margin-bottom: 14px; 
			    }
                .declaration-content{
			    	padding-bottom: 0px;
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
			    }
			    .declaration-content > ol {
			    	margin: 0px;
			    	padding-left: 20px;
                    margin-bottom: 40px;
			    }
                .declaration-content > ol > li {
			    	padding-left: 10px;
                    margin-bottom: 14px; 
                    margin-top: 8px;
			    }
                .cb-yesno{
                    margin-top:14px;
                }                    
                `
        ];
    }

    _mobileTemplate() {
        _webTemplate();
    }

    _webTemplate() {
        return html`
            <capitec-modal type="free" header-align="left" header="Approve DebiCheck Mandate">
				<div slot="body">				
					<capitec-content-box class="main-cb">
						${this._renderAgreementsAlertBanner()}
						${this._renderAgreement()}
					</capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
        `;
    }

    _renderAgreementsAlertBanner() {
        //alertType = unsucessful-red, info, warning
        return html`
            <capitec-alert-banner type="${this._checkAccepted() ? `warning` : this.alertType }" closable>
				<capitec-group layout="horizontal"  valign="top" gap="none" class="alert-banner">
					<capitec-label
                    label="Notify client: "
					type="default">                    
					</capitec-label>
					${this.alertMessage}
				</capitec-group>
			</capitec-alert-banner>
        `;
    }

    _renderAgreement() {
        return html`
            <capitec-expander-group modeset="single">
				<capitec-expander
				expandbuttonalignment="left"
				label="Agreement"
                .expanded=${true}>
					<!--INSERT AGREEMENT TEXT CS CALL-->
                    ${this._renderAgreementContent()}
				</capitec-expander>

				<capitec-expander
				expandbuttonalignment="left"
				label="Declaration">
					<!--INSERT DECLARATION TEXT CS CALL-->	
                    ${this._renderDeclarationContent()}
				</capitec-expander>


			</capitec-expander-group>
        `;
    }

    _renderAgreementContent() {
        return html`
			<capitec-content-box class="agreement-content">
                    <strong>Thank you, ${this.fullName}. We confirm that you agree to the following:</strong>
					<ol>
						<li>This call is to confirm your DebiCheck mandate and the payments you must make under the credit agreement, contract reference number <strong>${this.referenceNumber}</strong> </li>
						<li style="color:${QUESTIONS[0].color};">Please take note that your instalment of <strong>${this.installmentAmount}</strong> will be deducted from your nominated bank account every <strong>${this.collectionDateFrequency}</strong>, starting on <strong>${this.firstCollectionDate}</strong> and a last amount of <strong>${this.installmentAmount}</strong>. We could also collect on an earlier date, depending on when your salary or wages is paid. </br>
                            Do you understand and accept this? </br>
                            ${this._renderYesNo(0)}</li>
						<li style="color:${QUESTIONS[1].color};">The payments will be made by early debit order against your nominated account number <strong>${this.accountNumber}</strong> with Capitec Bank Limited, <strong>${this.shortName}</strong>.</br>
                            Do you agree with this?
                            ${this._renderYesNo(1)}</li>
						<li style="color:${QUESTIONS[2].color};">The permission for the bank to collect instalments in the credit agreement will also apply to the agreement we now make. Do you understand and accept what I have read to you?
                            ${this._renderYesNo(2)}</li>
					</ol>

			</capitec-content-box>            
        `;
    }

    _renderDeclarationContent() {
        return html`
			<capitec-content-box  class="declaration-content">
                   <strong> Thank you, ${this.fullName}. We confirm and acknowledge that:</strong>
					<ol>
						<li style="color:${QUESTIONS[3].color};">Do you hereby authorise the bank to debit your account? </br>
                            ${this._renderYesNo(3)}</li>
						<li>Please note that if we're unable to collect any instalment(s) from your account in accordance with what we have agreed to on this call, then such payment(s) may be subject to a tracking process, whereby we will attempt to collect the instalment(s) from your account over a tracking period. </li>
						<li>If you have an issue with any debit order made against your account, you may dispute it in line with the rules of the Payments Association of South Africa. </li>
						<li>You confirm that all the details you have provided on this call are correct. </li>
						<li>Written confirmation of what we agreed today will be emailed to: <strong>${this.emailAddress}</strong> </li>
						<li>Please note that the Mandate Reference Number is <strong>${this.mandateReference}</strong> </li>
						<li>Date: <strong>${this.today}</strong> </li>
					</ol>

				<capitec-card>
					<capitec-check
						label="Please confirm that you agree to these terms and conditions and that you are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>            
        `;
    }

    _renderYesNo(row) {
        return html`
			<div class="cb-yesno">            
            	<capitec-radio-group>
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-radio
							class="radio-btn-yes"
							label="Yes"
							@value-change="${(e) => this._agree(e, row, 1)}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-no"
							label="No"
							@value-change="${(e) => this._agree(e, row, 0)}">
						</capitec-radio>
					</capitec-group>
				</capitec-radio-group>
			</div>            
        `;
    }


    _renderFooter() {
        return html`
            <capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
					@click="${(e) => this._cancelClick(e)}"
					label="Cancel">
				</capitec-button>
				<capitec-button
					type="primary"
					@click="${(e) => this._approveClick(e)}"
					label="Approve"
                    .disabled="${this._checkAccepted()}">
				</capitec-button>

			</capitec-group>
        `;
    }
}

window.customElements.define(`horizon-approve-debicheck-mandate`, ApproveDebiCheckMandate);