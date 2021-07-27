import { Component, css, html } from 'platform/elements';

const MESSAGE = `Confirm the following information to approve the DebiCheck mandate.`;

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
        this.installmentAmount = 5656.00; //mandateSummaryList.amount
        this.firstCollectionDate = new Date();//mandateInfo.firstCollectionDate  .substring(0, 10);
        this.collectionDateFrequency = `month`;//mandateSummaryList.collectionDate.frequency
        this.accountNumber = `1164116973`;
        this.shortName = `Mr I. Makatini`;
        this.today = new Date();
        this.emailAddress = `ivanmakatini@email.com`; //QUESTION location? state?
        this.alertMessage = MESSAGE;
        this.error = false;
        this.alertType = `info`;
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
            mandateId: { type: String }
        };
    }


    //async _initialise() {
    
    //}

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();
       // this._initialise();
    }

    // --------------
    // EVENT HANDLERS
    // --------------

    _cancelClick() {
        this.dispatchEvent(new CustomEvent(`cancel`));
    }

    _approveClick() {
        this.dispatchEvent(new CustomEvent(`approve`, {
            detail: { mandateId: this.mandateId }
        }));
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

					--theme-expander-indicator-width: 13px;
					//--theme-expander-indicator-height: 7px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-height: auto;
				}

				capitec-expander-group > capitec-expander > capitec-content-box {
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 13px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
				--theme-layout-gap-spacing: 18px
                }

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}

			.agreement-content {
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 16px;
			}
			.agreement-content > ol {
				margin: 0px;
				padding-left: 20px;
			}
			.agreement-content > ol > li {
				padding-left: 10px;
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
            <capitec-alert-banner type="${this.alertType}" closable>
				<capitec-group layout="horizontal" halign="left" valign="top" gap="none" class="alert-banner">
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
				label="View Agreement"
                .expanded="true">
					<!--INSERT AGREEMENT TEXT CS CALL-->
                    ${this._renderAgreementContent()}
				</capitec-expander>

				<capitec-expander
				expandbuttonalignment="left"
				label="Update Card Limits">
					<!--INSERT DECLARATION TEXT CS CALL-->	
                    ${this._renderDeclarationContent()}
				</capitec-expander>


			</capitec-expander-group>
        `;
    }

    _renderAgreementContent() {
        return html`
			<capitec-content-box>
				<div class="agreement-content">
                    Thank you, ${this.fullName}. We confirm that you agree to the following:
				</div>
				<div class="agreement-content">
					<ol>
						<li>This call is to confirm your DebiCheck mandate and the payments you must make under the credit agreement, contract reference number ${this.referenceNumber} </li>
						<li>Please take note that your instalment of ${this.installmentAmount} will be deducted from your nominated bank account every ${this.collectionDateFrequency}, starting on ${this.firstCollectionDate} and a last amount of ${this.installmentAmount}. We could also collect on an earlier date, depending on when your salary or wages is paid. </br>
                            Do you understand and accept this? </br>
                            ${this._renderYesNo(1)}</li>
						<li>The payments will be made by early debit order against your nominated account number ${this.accountNumber} with Capitec Bank Limited, ${this.shortName}.</br>
                            Do you agree with this?
                            ${this._renderYesNo(2)}</li>
						<li>The permission for the bank to collect instalments in the credit agreement will also apply to the agreement we now make. Do you understand and accept what I have read to you?
                            ${this._renderYesNo(3)}</li>
					</ol>
				</div>
			</capitec-content-box>            
        `;
    }

    _renderDeclarationContent() {
        return html`
			<capitec-content-box>
				<div class="agreement-content">
                    Thank you, ${this.fullName}. We confirm and acknowledge that:
				</div>
				<div class="agreement-content">
					<ol>
						<li>Do you hereby authorise the bank to debit your account? </br>
                            ${this._renderYesNo(4)}</li>
						<li>Please note that if we're unable to collect any instalment(s) from your account in accordance with what we have agreed to on this call, then such payment(s) may be subject to a tracking process, whereby we will attempt to collect the instalment(s) from your account over a tracking period. </li>
						<li>If you have an issue with any debit order made against your account, you may dispute it in line with the rules of the Payments Association of South Africa. </li>
						<li>You confirm that all the details you have provided on this call are correct. </li>
						<li>Written confirmation of what we agreed today will be emailed to: ${this.emailAddress} </li>
						<li>Please note that the Mandate Reference Number is ${this.mandateId} </li>
						<li>Date: ${this.today} </li>
					</ol>
				</div>

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
            	<capitec-radio-group>
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-radio
							class="radio-btn-yes"
							label="Yes"
							@value-change="${(e) => this._YesorNo(e, row)}">
						</capitec-radio>
						<capitec-radio
							class="radio-btn-no"
							label="No"
							@value-change="${(e) => this._YesorNo(e, row)}">
						</capitec-radio>
					</capitec-group>
				</capitec-radio-group>
        `;
    }


    _renderFooter() {
        return html`
            <capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
					@click="${(e) => this._cancelClick(e)}"
					label="Search Client">
				</capitec-button>
				<capitec-button
					type="primary"
					@click="${(e) => this._approveClick(e)}"
					label="Approve">
				</capitec-button>
			</capitec-group>
        `;
    }
}

window.customElements.define(`horizon-approve-debicheck-mandate`, ApproveDebiCheckMandate);