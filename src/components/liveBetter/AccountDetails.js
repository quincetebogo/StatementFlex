import { Component, css, html } from 'platform/elements';
import 'app/components/common/HorizonLabel';

/**
 * Savings Account View REMEMBER TO UPDATE
 *
 * Events Raised
 * -------------
 * 
 * option-click
 * 
 * @export
 * @class SavingsAccount
 * @extends {Component}
 */

 export class AccountDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.accountDetails = null;
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

	/**
	 *
	 * @property {Object} accountDetails Data for the Savings Account Landing Page display
	 *
	 * @readonly
	 * @static
	 * @memberof AccountDetails
	 */
	static get properties() {
		return {
			accountDetails: { type: Object }
		};
	}

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
				capitec-modal {
					height: 581px;
					--theme-modal-free-max-width: 572px;
					--theme-modal-body-box-shadow: 0px;

					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-background-color: #009de0;

					--theme-modal-footer-padding: 0px 0px 0px 0px;
				}

				/* Styles to display background color of header as a gradient*/
				.header-gradient {
					width: 572px;
					border-radius: 4px 4px 0px 0px;
					position: absolute;
					left: -551px;
					top: -44px;					
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					--theme-label-title-font-size: 18px;
					--theme-titlebar-padding: 20px 16px;
					--theme-label-font-family: 'Hind Vadodara semibold';
				}

				.header-gradient > capitec-label {
					line-height: 64px;
					padding-left: 16px;
					--theme-label-default-font-size: 18px;
					--theme-label-font-color: #ffffff;
					letter-spacing: 0;
					--theme-label-font-family: 'Hind Vadodara SemiBold';
				}

				/* Transaction details Styles */
				.details-vertical {
					width: 572px;
					height: 453px; 
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 8px;
					--theme-layout-gap-spacing: 0px;
				}

				.details-horizontal {
					--theme-layout-gap-spacing: 9px;
				}

				horizon-label {
					height: 56px;
					padding: 12px 16px 10px;

					--horizon-label-text-height: 12px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 12px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-color: #3A3A3A;

					--horizon-label-value-margin-top: 2px;
				}

				.col-1 {
					width: 185px;
				}

				.col-2 {
					width: 134px;
				}

				/* Footer */
				div[slot="footer"] {
					width: 572px;
					border-top: 1px solid #E1E1E1;
					padding: 7px 16px 8px 0px;
				}

				capitec-button {
					height: 48px;
					width: 87px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">

				<capitec-title-bar type="primary">
					<img
					src="/images/insure/left-arrow.svg"
					@click="${() => this._back()}"
					data-automation-id="" />
					<horizon-label 
						label="Account Details"
						value="1633824509">
					</horizon-label>
				</capitec-title-bar>

				<capitec-content-box>
					<capitec-card>
						${this._renderAccountDetails()}
						${this._renderAutomaticSavings()}
					</capitec-card>
				</capitec-content-box>

				${this._renderFooter()}

			</capitec-card>
		`;
	}

	_renderAccountDetails(){
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
			<capitec-title-bar class="transaction-history-title" type="transact">
				<capitec-icon size="default" icon=""></capitec-icon>
				<capitec-label 
					label="Account Details"
					type="title">
				</capitec-label>
			</capitec-title-bar>
				<capitec-group 
				class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Account Number" 
							value="1633824509">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Available Balance" 
							value="R150.00">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Interest Rate" 
							value="3.25%">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Interest earned in June" 
							value="R12.50">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Interest earned in May" 
							value="R15.50">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Interest tax year" 
							value="R340.00">
						</horizon-label>	
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Date opened" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							label="Status" 
							value="Active">
						</horizon-label>			
				</capitec-group>				
		</capitec-content-box>
		`;
	}

	_renderAutomaticSavings(){
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
			<capitec-title-bar class="transaction-history-title" type="transact">
				<capitec-icon size="default" icon=""></capitec-icon>
				<capitec-label 
					label="Automatic Savings"
					type="title">
				</capitec-label>
			</capitec-title-bar>
				<capitec-group 
				class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<horizon-label
							data-automation-id=""
							class="col-1" 
							label="Round-up"
							value="R5.00">
						</horizon-label>
						<capitec-toggle></capitec-toggle>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Last update" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Round-up account(s)" 
							value="Savings Account">
						</horizon-label>						
				</capitec-group>

				<capitec-group 
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Interest Sweep" 
							value="On">
						</horizon-label>	
						<horizon-label 
							data-automation-id=""
							class="col-1" 
							label="Last update" 
							value="12 May 2021">
						</horizon-label>			
				</capitec-group>				
		</capitec-content-box>
		`;
	}
 }
