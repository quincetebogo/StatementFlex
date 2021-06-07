import { Component, css, html } from 'platform/elements';

/**
 * The Horizon Tap to Pay Dialog implements the modal for the agreement of Tap to Pay
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class TapToPayAgreement
 * @extends {Component}
 */

export class TapToPayAgreement extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.tapToPayInfo = {};
		this.tapToPayAgreement = ``;
		this.agreementResult = {};
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			agreementResult: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.tapToPayAgreement = this.agreementResult.cardAgreement.agreementContent.agreementContentData;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		this.tapToPayInfo.acceptedTapToPay = false;
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_agreeClick(event) {
		if (this._validateCheckBox()) {
			this.dispatchEvent(new CustomEvent(`on-agree`, {
				detail: { 
					agreementResult: this.agreementResult,
					tapToPayAccepted: this.tapToPayInfo.acceptedTapToPay
				}
			}));
		}
	}

	_toggleAgreementsAccept(e) {
		this.tapToPayInfo[e.currentTarget.id] = e.detail.new;
	}

	_validateCheckBox() {
		return this.tapToPayInfo.acceptedTapToPay;
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
					--theme-expander-height: 621px;
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

				.expander-cb {
					background-color: #FFFFFF;
					border-top: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 13px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-spacing: 14px;
				}

				.terms-and-conditions {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
				}

				.expander-cb > .terms-and-conditions:nth-child(n+2) {
					--theme-layout-gap-spacing: 71px;
				}

				.terms-and-conditions > ol {
					margin: 0px;
					padding-left: 20px;
				}

				.terms-and-conditions > ol > li {
					padding-left: 10px;
				}

				.accept-terms-and-conditions {
					justify-content: center;

					--theme-card-min-height: 48px;
				}

				.main {
					height: 728px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}

				.agreement-viewer {
					width: 100%;
					height: 100%;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}


	_webTemplate() {
		return html`
		<capitec-modal type="free" header-align="left" header="Activate Tap To Pay">
			<div slot="body">
				<capitec-content-box class="main">
					${this._renderAlertBanner()}
					${this._renderViewAgreement()}
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

				<capitec-expander 
					expandbuttonalignment="left" 
					label="View Agreement">
						${this._renderViewContent()}
				</capitec-expander>

				<capitec-expander 
					expandbuttonalignment="left" 
					label="Tap To Pay"
					.expanded="${true}">
							${this._renderTapToPayAgreement()}
				</capitec-expander>
			
			</capitec-expander-group>
		`;
	}

	_renderViewContent() {
		return html`
			<capitec-content-box class="expander-cb" halign="left" valign="top" gap="none">
			<object class="agreement-viewer" data="data:text/html;base64,${this.tapToPayAgreement}" type="text/html">
			</object>
			</capitec-content-box>`;
	}

	_renderTapToPayAgreement() {
		return html`
			<capitec-content-box class="expander-cb">
				<div class="terms-and-conditions">
					You acknowledge and agree that you understand and accept the terms and conditions of enabling Tap to Pay on your <strong>[Debit MasterCard and/or credit card]</strong>, as well as your rights as a client as confirmed on this call with you. 
				</div>
				<div class="terms-and-conditions">
					<ol>
						<li>This call recording forms the agreement between us and you as to the amendment of your Tap to Pay Status and is effective at the date of concluding this call.</li>
						<li>You’re aware that you must keep your Tap to Pay enabled card safe and immediately report it if stolen, as you will remain liable for any transactions performed if your card gets lost, stolen or misused.</li>
						<li>You declare that you’re aware that the Tap to Pay functionality means your card can be used without a PIN, even when lost, stolen or misused.</li>
						<li>When you deactivated Tap to Pay, the card will function like a normal card and pin for all transactions, until such a time that you choose to reactivate the Tap to Pay functionality.</li>
						<li>You agree that you shall have no claim or right of action arising from any undertaking, representation or warranty not included, and agreed during this call.</li>
						<li>You declare that all the information you’ve given us on this call is true and correct, and that we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
					</ol>
				</div>
				<capitec-card class="accept-terms-and-conditions">
					<capitec-check 
						id="acceptedTapToPay"
						label="Please confirm that you agree to these terms and conditions and that your are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
	}

		
	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					class="back-btn"
					type="clear" 
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>

				<capitec-button
					class="next-btn"
					type="primary" 
					label="Agree"
					@click="${(event) => this._agreeClick(event)}">
				</capitec-button>

			</capitec-group>
		`;
	}
}

customElements.define(`horizon-tap-to-pay-agreement`, TapToPayAgreement);