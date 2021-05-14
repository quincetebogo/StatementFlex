import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

export class TapToPayAgreement extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.horizonRouter = HorizonRouter.getInstance();
		this.activate = true;
		this.isBusy = false;
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			activate: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`));
	}

	 _agree() {

		this.dispatchEvent(new CustomEvent(`agree`));
		this.horizonRouter.navigateToTapToPaySuccess();
	}

	_toggleAgreementsAccept(e) {
		this.activate = !this.activate;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}
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
					width: 808px;
					height: 856px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;
				}

				capitec-expander-group {
					width: 776px;
					
					--theme-expander-border: none;
					--theme-expander-group-container-margin-bottom: 8px;
					--theme-expander-header-height: 48px;
				}

				capitec-expander-group > capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;

					--theme-expander-indicator-width: 13px;
					--theme-expander-indicator-height: 7px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-height: auto;
				}

				capitec-expander-group > capitec-expander:last-child {
					margin-bottom: 0px;
				}

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}


				div[slot="body"] {
					width: auto;
					height: 728px;
				}

				.expander-cb {
					background-color: #FFFFFF;
					border-top: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 9px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-spacing: 18px;
				}

				.agreement-list {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
				}

				.agreement-list > ol {
					margin: 0px;
					padding-left: 20px;
				}

				.agreement-list > ol > li {
					padding-left: 10px;
				}

				.agreement-terms {
					justify-content: center;
					margin-top: 61px;
					margin-bottom: 16px;

					--theme-card-min-height: 48px;
				}

				.main {
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}


	_webTemplate() {
		return html`
		<capitec-modal type="free" header-align="left" header="${this.activate ? `Activate Tap To Pay` : `Deactivate Tap To Pay`}">
			<div slot="body">
				<capitec-content-box class="main">
					${this._renderAlertBanner()}
					${this._renderViewAgreement()}
					${this._renderLoadingIndicator()}
				</capitec-content-box>
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
	}

	_renderAlertBanner() {}

	_renderViewAgreement() {
		return html`
			<capitec-expander-group modeset="single">

				<capitec-expander expandbuttonalignment="left" label="View Agreement">

				</capitec-expander>

				<capitec-expander expandbuttonalignment="left" label="Tap To Pay">
					${this._renderTapToPayAgreement()}
				</capitec-expander>
			
			</capitec-expander-group>
		`;
	}
	
	_renderTapToPayAgreement() {
		return html`
			<capitec-content-box class="expander-cb">
				<div class="agreement-list">
					You acknowledge and agree that you understand and accept the terms and conditions of enabling Tap to Pay on your <strong>[Debit MasterCard and/or credit card]</strong>, as well as your rights as a client as confirmed on this call with you. 
				</div>
				<div class="agreement-list">
					<ol>
						<li>This call recording forms the agreement between us and you as to the amendment of your Tap to Pay Status and is effective at the date of concluding this call.</li>
						<li>You’re aware that you must keep your Tap to Pay enabled card safe and immediately report it if stolen, as you will remain liable for any transactions performed if your card gets lost, stolen or misused.</li>
						<li>You declare that you’re aware that the Tap to Pay functionality means your card can be used without a PIN, even when lost, stolen or misused.</li>
						<li>When you deactivated Tap to Pay, the card will function like a normal card and pin for all transactions, until such a time that you choose to reactivate the Tap to Pay functionality.</li>
						<li>You agree that you shall have no claim or right of action arising from any undertaking, representation or warranty not included, and agreed during this call.</li>
						<li>You declare that all the information you’ve given us on this call is true and correct, and that we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
					</ol>
				</div>
				<capitec-card class="agreement-terms">
					<capitec-check 
						label="Please confirm that you agree to these terms and conditions and that your are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
		? html`<capitec-loading-indicator></capitec-loading-indicator>`
		: html``;
	}
	
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					class="back-btn"
					type="clear" 
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>

				<capitec-button
					class="next-btn"
					type="primary" 
					label="Agree"
					@click="${() => this._agree()}">
				</capitec-button>

			</capitec-group>
		`;
	}


}

customElements.define(`horizon-tap-to-pay-agreement`, TapToPayAgreement);