import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

const CARD_TYPE_MAPPING = {
	DEBIT_MASTERCARD: `Debit MasterCard`,
	MASTERCARD_CREDIT: `Credit Card`,
	DEBIT_MASTERCARD_VIRTUAL: `Debit Card`
};

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
		this.alertBannerText = ``;
		this.selectedCard = {};

		this._telemetry = HorizonTelemetry.instance;
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			alertBannerText: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `Tap to pay Agreement Dialog`);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_UPDATE_CANCEL, {
			"screen": TelemetryScreen.TAP_TO_PAY_AGREEMENT,
			"next-screen": TelemetryScreen.TAP_TO_PAY
		});

		this.tapToPayInfo.acceptedTapToPay = false;
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_agreeClick(event) {

		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_UPDATE, {
			"screen": TelemetryScreen.TAP_TO_PAY_AGREEMENT,
			"next-screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"tnc-accepted": null
		});

		if (this._validateCheckBox()) {
			this.dispatchEvent(new CustomEvent(`on-agree`, {
				detail: {
					selectedCard: this.selectedCard,
				}
			}));
		}
	}

	_toggleAgreementsAccept(e) {
		this.alertBannerText = ``;
		this.tapToPayInfo[e.currentTarget.id] = e.detail.new;
	}

	_validateCheckBox() {
		this.alertBannerText = this.tapToPayInfo.acceptedTapToPay ? `` : `Please confirm agreement to the terms and conditions`;
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

					--theme-modal-free-max-width: 808px;
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
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-height: auto;
				}

				capitec-expander-group > capitec-expander:last-child {
					margin-bottom: 13px;
				}

				capitec-expander-group > capitec-expander[label="View Agreement"]{
					--theme-expander-height: 621px;
				}
				
				capitec-expander[expanded] {
					--theme-expander-background-color: #F7F7F7;
					box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);
				}

				capitec-check {
					padding-left: 16px;

					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}

				capitec-check[class="check-not-agreed"] {
					--theme-check-border-color: #C83B37;
				}

				horizon-alert-banner {
					width: 776px;

					--theme-layout-gap-spacing: 16px;
					--theme-toast-icon-margin: 0px 8px 0px 16px;
					--theme-alert-banner-font-weight: 600;
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
					--theme-layout-gap-spacing: 18px;
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
					margin-bottom: 13px;

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

				.scroll {
					height: 728px;
					width: 808px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 2px;
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
		<capitec-modal type="free" header-align="left" header="${this.selectedCard.isContactlessActivated ? `Activate Tap To Pay` : `Deactivate Tap To Pay`}">
			<div slot="body">
				<capitec-content-box class=${this.alertBannerText ? `scroll` : `main`}>
					${this._renderErrorAlertBanner()}
					${this._renderViewAgreement()}
				</capitec-content-box>
			</div>
			<div slot="footer">
				${this._renderFooter()}
			</div>
		</capitec-modal>
		`;
	}

	_renderErrorAlertBanner() {
		return this.alertBannerText
			? html`
					<horizon-alert-banner 
						type="error"
						label="${this.alertBannerText}"
						data-automation-id="tap-to-pay-agreement-alert-banner">
					</horizon-alert-banner>`
			: html``;
	}

	_renderViewAgreement() {
		return html`
			<capitec-expander-group modeset="single">

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
			<capitec-content-box 
					data-automation-id="tap-to-pay-agreement-pdf-viewer" 
					class="expander-cb" 
					halign="left" 
					valign="top" 
					gap="none">

				<object 
					class="agreement-viewer" 
					data="data:text/html;base64,${this.tapToPayAgreement}" 
					type="text/html">
				</object>
			</capitec-content-box>`;
	}

	_renderTapToPayAgreement() {
		return html`
			<capitec-content-box 
					class="expander-cb"
					data-automation-id="tap-to-pay-agreement-terms-and-conditions">

				<div class="terms-and-conditions">
					You acknowledge and agree that you understand and accept the terms and conditions of enabling Tap to Pay on your <strong>${CARD_TYPE_MAPPING[this.selectedCard.cardType]}</strong>, as well as your rights as a client as confirmed on this call with you. 
				</div>
				<div class="terms-and-conditions">
					<ol>
						<li>This call recording forms the agreement between us and you as to the amendment of your Tap to Pay Status and is effective at the date of concluding this call.</li>
						<li>You’re aware that you must keep your Tap to Pay enabled card safe and immediately report it if stolen, as you will remain liable for any transactions performed if your card gets lost, stolen or misused.</li>
						<li>You declare that you’re aware that the Tap to Pay functionality means your card can be used without a PIN, even when lost, stolen or misused.</li>
						${!this.selectedCard.isContactlessActivated ? html`<li>When you deactivated Tap to Pay, the card will function like a normal card and pin for all transactions, until such a time that you choose to reactivate the Tap to Pay functionality.</li>` : ``}
						<li>You agree that you shall have no claim or right of action arising from any undertaking, representation or warranty not included, and agreed during this call.</li>
						<li>You declare that all the information you’ve given us on this call is true and correct, and that we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
					</ol>
				</div>
				<capitec-card class="accept-terms-and-conditions">
					<capitec-check 
						id="acceptedTapToPay"
						data-automation-id="tap-to-pay-agreement-check"
						class=${this.alertBannerText ? `check-not-agreed` : ``}
						label="Please confirm that you agree to these terms and conditions and that you are bound by them?"
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
					data-automation-id="tap-to-pay-agreement-cancel"
					class="back-btn"
					type="clear" 
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>

				<capitec-button
					data-automation-id="tap-to-pay-agreement-agree"
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