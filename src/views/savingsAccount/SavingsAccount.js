import { Component,View, css, html } from 'platform/elements';
import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

export class SavingsAccount extends View {
	
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
				capitec-title-bar {
					--theme-type-primary-background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-content-box {
					width: auto;
					height: 666px;
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 19px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				capitec-content-box > capitec-card {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 3px 6px 0.25px rgba(0,0,0,0.08);

					--theme-card-min-height: 64px;
				}
				.account-details-bar {
					display: flex;
					position: relative;
				}
				.account-details-bar > capitec-expander {
					position: absolute;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-height: 210px;
				}
				.account-details-bar > capitec-group {
					z-index: 10;
				}

				.actionbar-header {
                    height: auto;
					width: auto;
					margin: 0px;
                    border-bottom: 0px;
					padding-top: 12px;
					padding-bottom: 12px;
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
					<capitec-card>
						${this._renderAccountDetailsBar()}
					</capitec-card>
				</capitec-content-box>

				${this._renderFooter()}

			</capitec-card>
		`;
	}
	
	_renderAccountDetailsBar() {
		return html`
			<div class="account-details-bar">
				<capitec-expander label="">
					${this._renderOptions()}
				</capitec-expander>
				<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center">
					<horizon-label label="Account Number" value = "${this.headerRecords.columnOne}"></horizon-label>
					<horizon-label label="Balance" value = "${this.headerRecords.columnTwo}"></horizon-label>
					<horizon-label label="Available Balance" value = "${this.headerRecords.columnThree}"></horizon-label>
					<horizon-label label="Pending amount" value = "${this.headerRecords.columnFour}"></horizon-label>
					<horizon-label label="Interest" value = "${this.headerRecords.columnFive}"></horizon-label>
					<horizon-label label="Status" value = "${this.headerRecords.columnSix}"></horizon-label>
				</capitec-group>
			</div>
		`;
	}

	_renderOptions() {
		return html`
			<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">

				<div class="related-options">
					<p class="related-options-text">Choose an Option</p>
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
customElements.define(`horizon-savings-account`, SavingsAccount);