import { Component, css, html } from 'platform/elements';
import { formatCurrency, isNullorEmpty, getMonthName, convertCentsToRand } from 'app/utils/channelServiceUtilities';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/dialogs/common/DiscardChanges';
import { mandateInfo } from '../../../mocks/DebiCheckMockData';

const MESSAGE = `Confirm the following information to approve the DebiCheck mandate.`;
const WARNING_MESSAGE = ` DebiCheck will not be approved and will result in expired mandates.`;

const ORANGE = "#D4781C";
const NO = 0;
const YES = 1;
const UNANSWERED = 2;
const QUESTIONS = [
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED },
    { color: "black", accepted: UNANSWERED }
];

export class ApproveDebiCheckMandate extends Component {

    // --------------
    // INITIALISATION
    // --------------

    constructor() {
        super();
        this.mandateId = ``; //mandateInfo.mandateReference
        this.referenceNumber = ``; //mandateInfo.contractReference
        this.fullName = ``;
        this.installmentAmount = 0; //mandateSummaryList.amount
        this.firstCollectionDate = new Date();//mandateInfo.firstCollectionDate  .substring(0, 10);
        this.collectionDateFrequency = ``;//mandateSummaryList.collectionDate.frequency
        this.accountNumber = ``;
        this.shortName = ``;
        this.today = new Date().toISOString().substr(0, 10);
        this.emailAddress = ``;
        this.alertType = `info`;
        this.approve = false;
        this.showDiscardChangesModal = false;

        this._telemetry = HorizonTelemetry.instance;
        this.horizonStore = HorizonStore.getInstance();

    }

    // ----------
    // PROPERTIES
    // ----------

	/**
	 * @property {String} mandateInfo - Info to be used when referencing the mandate.
	 *
	 * @readonly
	 * @static
	 * @memberof AcceptDebiCheckMandate
	 */
    static get properties() {
        return {
            mandateInfo: { type: Object },
            debiCheckDetails: { type: Object },
            showDiscardChangesModal: { type: Boolean, attribute: false }
        };
    }


    async _initialise() {

        this._clearAll();

        const state = this.horizonStore.recoverState();
        const callerInformation = this.horizonStore.getCallerInformation();
        const landingPageInfo = state.landingPageInfo;
        const screenDetails = this.horizonStore.getScreenDetails();

        this.mandateReference = this.debiCheckDetails.mandateReference;
        this.referenceNumber = this.debiCheckDetails.contractReference;
        this.fullName = this.titleCase(callerInformation.name);

        //TODO: Remove hardcoded data once endpoints are activated
        this.accountNumber = `164116973`; //: screenDetails.accountNumber;
        this.shortName = `Savings account`// placeholder is account name ?
        this.emailAddress = `ivanmakatini@email.com`;// : screenDetails.emailAddress; 

        this.installmentAmount = formatCurrency(convertCentsToRand(this.mandateInfo.amount));
        this.firstCollectionDate = isNullorEmpty(this.debiCheckDetails) ? new Date() : new Date(this.debiCheckDetails.firstCollectionDate).toISOString().substr(0, 10);
        this.collectionDateFrequency = this.mandateInfo.collectionDate.frequency
        this.today = new Date().toISOString().substr(0, 10);

    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();

        this._telemetry.startSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK
        });

        this._initialise();
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK_APPROVE_MANDATE, {
            "screen": TelemetryScreen.APPROVE_DEBICHECK
        });
    }

    // --------------
    // EVENT HANDLERS
    // --------------

    _cancelClick() {

        this.showDiscardChangesModal = QUESTIONS.some(question => { return question.accepted !== UNANSWERED });

        if (!this.showDiscardChangesModal) {
            this._clearAll();
            this.dispatchEvent(new CustomEvent(`cancel`));
        }       
    }

    _cancelDiscardModal() {
        this.showDiscardChangesModal = false;
        this._telemetry.logEvent(QuickTransactionEvents.DISCARD_CHANGES_CANCEL, {
            "screen": TelemetryScreen.DISCARD_CHANGES,
            "next-screen": TelemetryScreen.DEBICHECK
        });
    }

    _approveClick() {
        this.mandateId = this.mandateInfo.mandateId;
        this.dispatchEvent(new CustomEvent(`approve`, {
            detail: { mandateId: this.mandateId }
        }));
    }

    _checkAccepted() {
        for (let i = 0; i < QUESTIONS.length; i++) {
            if (QUESTIONS[i].accepted == UNANSWERED) {
                return true;
            } else if (QUESTIONS[i].accepted == NO) {
                return true;
            }
        }
        if (!this.approve) {
            return true;
        }
        return false;
    }

    _checkWarning() {
        let returnVal = false;
        QUESTIONS.forEach(key => {
            if (key.accepted == NO) {
                returnVal = true;
            }
        });
        return returnVal;
    }

    _collapseExpander() {
        for (var i = 0; i < 3; i++) {
            if (QUESTIONS[i].accepted !== YES) {
                return true;
            }
        }
        return false;
    }

    _agree(e, row, val) {
        if (!e.detail.new) {
            return;
        }
        this.alertType = 'info';
        if (val == YES) {
            QUESTIONS[row].color = "black";
            QUESTIONS[row].accepted = YES;
        } else if (val == NO) {
            QUESTIONS[row].color = ORANGE;
            QUESTIONS[row].accepted = NO;
        }
        this.requestUpdate();
    }

    _toggleAgreementsAccept(e) {
        this.approve = !this.approve;
        this.requestUpdate();
    }

    _clearAll() {
        QUESTIONS.forEach(question => {
            question.color = 'black';
            question.accepted = UNANSWERED;
        });
    }

    _getFullDate(shortDate) {
        if (shortDate) {
            const day = shortDate.substr(8, 3);
            const monthNum = parseInt(shortDate.substr(5, 2));
            const month = getMonthName(monthNum - 1);
            const year = shortDate.substr(0, 4);

            return `${day} of ${month} ${year}`;
        }

    }

    titleCase(str) {
        return str.split(' ')
            .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
            .join(' ');
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
					--theme-modal-footer-padding: 8px 16px 8px 0px;                    
                }

                .main-cb {
                    height: 754px;
                    border-bottom: 1px solid rgb(225, 225, 225);

                	--theme-container-padding-left: 16px;
                	--theme-container-padding-top: 16px;
                	--theme-container-padding-right: 16px;
                	--theme-container-padding-bottom: 0px;    
                }

				capitec-expander-group {
					width: 776px;

					--theme-expander-border: none;
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
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-expander-height: auto;
				}
                capitec-expander-group > capitec-expander[expanded] {
                    box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);

                    --theme-expander-border-radius: 5px;
                    --theme-expander-background-color: #F7F7F7;
                }

				capitec-expander-group > capitec-expander > capitec-content-box {
                    --theme-container-padding-right: 16px;
                    --theme-container-padding-top: 16px;
                    background-color: #FFFFFF;  
                    border-radius: 4px;
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
                    --theme-container-padding-left: 16px;
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
                    border-top: 1px solid #E1E1E1;            
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
                    border-top: 1px solid #E1E1E1;
			    	padding-bottom: 0px;
			    	color: #3A3A3A;
			    	font-family: "Hind Vadodara";
			    	font-size: 16px;
                    --theme-container-padding-left: 16px;
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
                div[slot="footer"]{
                    padding-right: 8px;
                    width: 808px;
                    margin-right: -12px;
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
						${this._renderDiscardChangesModal()}
					</capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
        `;
    }

    _renderAgreementsAlertBanner() {
        return html`
            <capitec-alert-banner type="${this._checkWarning() ? `warning` : this.alertType}" closable>
				<capitec-group layout="horizontal"  valign="top" gap="none" class="alert-banner">
					<capitec-label
                    label="Notify client: "
					type="default">                    
					</capitec-label>
					${this._checkWarning() ? WARNING_MESSAGE : MESSAGE}
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
                .expanded=${this._collapseExpander()}>
					<!--INSERT AGREEMENT TEXT CS CALL-->
                    ${this._renderAgreementContent()}
				</capitec-expander>

				<capitec-expander
				expandbuttonalignment="left"
				label="Declaration"
                .expanded=${!this._collapseExpander()}>
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
						<li style="color:${QUESTIONS[0].color};">Please take note that your instalment of <strong>${this.installmentAmount}</strong> will be deducted from your nominated bank account every <strong>${this.collectionDateFrequency.toLowerCase()}</strong>, starting on <strong>${this._getFullDate(this.firstCollectionDate)}</strong> and a last amount of <strong>${this.installmentAmount}</strong>. We could also collect on an earlier date, depending on when your salary or wages is paid. </br>
                            Do you understand and accept this? </br>
                            ${this._renderYesNo(0)}</li>
						<li style="color:${QUESTIONS[1].color};">The payments will be made by early debit order against your nominated account number <strong>${this.accountNumber}</strong> with Capitec Bank Limited, <strong>${this.shortName}</strong>. Do you agree with this?
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
						<li>Date: <strong>${this._getFullDate(this.today)}</strong> </li>
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
							@value-change="${(e) => this._agree(e, row, YES)}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-no"
							label="No"
							@value-change="${(e) => this._agree(e, row, NO)}">
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

    _renderDiscardChangesModal() {
        if (this.showDiscardChangesModal) {
            return html`
				<horizon-discard-changes
					@on-cancel="${() => this._cancelDiscardModal()}"
					@on-confirm="${() => this.dispatchEvent(new CustomEvent(`cancel`))}">
				</horizon-discard-changes>`
        }

        return html``;
    }
}

window.customElements.define(`horizon-approve-debicheck-mandate`, ApproveDebiCheckMandate);