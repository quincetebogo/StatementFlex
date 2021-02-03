import { Component,View, css, html } from 'platform/elements';
import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

export class SavingsAccountLandingPage extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.headerRecords = {
			columnOne: '1928247288',
			columnTwo: 'R20 916.00', 
			columnThree: 'R20 567.00', 
			columnFour: 'R349.00', 
			columnFive: '5.5%',
			columnSix: 'Active'};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			header: { type: String },
			left: { type: String },
			right: { type: String },
			toast: { type: String },
			displayToast: { type: Boolean },
			image: { type: String }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	
	// --------------
	// PUBLIC METHODS
	// --------------
	
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				.card {
					width: 100%;
					height: auto;
				}

				capitec-content-box {
					padding: 0px;
					width: auto;
					margin: 19px 16px 453px 16px;
					border: 1px;
					box-sizing: border-box;
					box-shadow: none;
					border: 1px solid;
					border-radius: 4px;
				}

				.actionbar-header {
                    height: auto;
					width: auto;
					margin: 0px;
                    border-bottom: 0px;
					padding-top: 12px;
					padding-bottom: 16px;
					padding-left: 0px
                }
 
                .actionbar-header > horizon-label[label="Account Number"] {
                    width: 174px;
                }
 
                .actionbar-header > horizon-label[label="Interest"] {
                    width: 120px;
                }
 
                .actionbar-header > horizon-label {
                    width: 156px;
                    height: 100%;
                    font-weight: 300;
                    justify-content: left;
                    padding: 0px 0px 0px 16px;
 
                    --horizon-label-text-height: 20px;
                    
                    --horizon-label-text-font-size: 14px;
                    --horizon-label-text-line-height: 20px;
                    
                    --horizon-label-value-height: 20px;
                    --horizon-label-value-font-size: 16px;
                    --horizon-label-value-line-height: 20px;
				}
				
				.related-options {
					height: 32px;
					width: 100%;
					background-color: #F4F4F4;
					border-top: 1px solid #dfdfdf;
					border-bottom: 1px solid #dfdfdf;
				}
				
				.related-options-text{
					margin: 0px 0px 0px 16px;
					padding: 0px 0px 0px 0px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}

				.options-group{
					height: 80px; 
					margin: 17px 0px 15px 0px;
					width: auto;
				}

				horizon-option-button {
					width: 204px;
					height: 80px;
				}

				.button-margin{
					height: 80px;
					width: 182px;
					margin-right: 16px;
					margin-left: 16px;
					padding: 0px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}

				.label-text {
					--horizon-option-btn-text-margin-top: 10px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">

				<capitec-title-bar type="primary">
					<capitec-icon size="default" icon="product/transact-white">
					</capitec-icon>
					<capitec-label label="Savings Account" type="Title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box>
					${this._renderAccountDetailsBar()}
					${this._renderOptions()}
				</capitec-content-box>

				${this._renderFooter()}

			</capitec-card>
		`;
	}
	
	_renderAccountDetailsBar() {
        return html`
            <capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
                    <horizon-label label="Account Number" value = "${this.headerRecords.columnOne}"></horizon-label>
                    <horizon-label label="Balance" value = "${this.headerRecords.columnTwo}"></horizon-label>
                    <horizon-label label="Available Balance" value = "${this.headerRecords.columnThree}"></horizon-label>
                    <horizon-label label="Pending amount" value = "${this.headerRecords.columnFour}"></horizon-label>
                    <horizon-label label="Interest" value = "${this.headerRecords.columnFive}"></horizon-label>
                    <horizon-label label="Status" value = "${this.headerRecords.columnSix}"></horizon-label>
            </capitec-group>
        `;
	}

	_renderOptions() {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">

				<div class="related-options">
					<p class="related-options-text">Related Options</p>
				</div>

				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">

					<horizon-option-button 
							class="button-margin" 
							label="Transaction History" 
							icon="system/time-action">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="DebiCheck" 
						icon="system/debit-order-action">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="Statements" 
						icon="system/documents-action">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="More" 
						icon="system/more-action">
					</horizon-option-button>

				</capitec-group>

			</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">

				<div class="related-options">
					<p class="related-options-text">Related Options</p>
				</div>

				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<horizon-option-button 
							class="button-margin" 
							label="Product enquiry / info" 
							icon="system/info-action">
					</horizon-option-button>

					<horizon-option-button 
						class="button-margin" 
						label="Add a Savings Plan" 
						icon="system/add-action">
					</horizon-option-button>
				</capitec-group>

			</capitec-group>
		`;
	}
}


// 				<capitec-label id="id-successful-header" label="${this.header}"></capitec-label>
// 				<capitec-group id="id-msg-group" layout="horizontal">
// 					<capitec-icon size="default" icon="status/success-trans"></capitec-icon>
// 					<slot name="detail"></slot>
// 				</capitec-group>
// 				<capitec-group id="id-button-group" layout="horizontal">
// 					${this.left
// 						? html`<capitec-button id="button-left" class="center-button" label="${this.left}" @click="${() => this._leftClick()}">
// 								</capitec-button>`
// 						: html``
// 					}
// 					${this.right
// 						? html`<capitec-button class="center-button" type="primary" label="${this.right}" @click="${() => this._rightClick()}">
// 								</capitec-button>`
// 						: html``
// 					}
// 				</capitec-group>
// 				<div class="related-options">
// 					<p class="related-options-text">Related Options</p>
// 				</div>
// 				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
// 					<slot name="option-button"></slot>
// 				</capitec-group>
// 			</capitec-card>
// 		`
// 	}
// }

customElements.define(`horizon-savings-account-landing`, SavingsAccountLandingPage);