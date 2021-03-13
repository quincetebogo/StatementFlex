import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';

/**
 * This component implements the Favourites Landing Page for Quick Transactions
 *
 * Events Raised 
 * -------------
 * verify-click
 * option-click
 * 
 * @export
 * @class TransactionFavourites
 * @extends {Component}
 */
export class FavouriteTransactions extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.landingPageInfo = null;
		this.displayToast = false;
		this.isBusy = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} callerInformation Information on the current caller (mini-profile)
	 * @property {Object} incomingCallDetails Information on the incoming/current call
	 * @property {Object} landingPageInfo Data for the Favourites Landing Page display
	 * @property {string} verificationStatus Indicates if the client is verified, unverified, non-client etc.
	 * @property {Boolean} displayVerificationStatusToast If true, display a toast for the verification status
	 *
	 * @readonly
	 * @static
	 * @memberof FavouriteTransactions
	 */
	static get properties() {
		return {
			callerInformation: { type: Object },
			incomingCallDetails: { type: Object },
			landingPageInfo: { type: Object },
			verificationStatus: { type: String },
			displayVerificationStatusToast: { type: Boolean },

			isBusy: { attribute: false },
			displayToast: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		if (this.verificationStatus === `verified` && this.displayVerificationStatusToast) {
			this.displayVerificationStatusToast = false;
			this.displayToast = true;
			window.setTimeout(() => this._toggleToastDisplay(), 3000);
		}
		
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleToastDisplay() {
		this.displayToast = false;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyNowClick() {
		this.dispatchEvent(new CustomEvent(`verify-click`, {}));
	}

	_optionSelectedClick(selectedOption) {
		this.dispatchEvent(new CustomEvent(`option-click`, {
			detail: {
				option: selectedOption,
				stopPropagation: selectedOption !== `stop-card` && this.verificationStatus !== `verified`
			}
		}));
	};

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.card{
				width:100%;
				height:100%;
			}

			.favourites {
				height: 32px;
				width: 111px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 32px;
			}

			capitec-group > capitec-title-bar {
				--theme-titlebar-min-height: 32px;
				--theme-titlebar-padding: 0px 0px 0px 16px;
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 14px;
				--theme-label-title-font-weight: 600;
				width: 100%;
				border-top: 1px solid #E1E1E1;
				box-shadow: none!important;
			}

			.transact-title {
				border-top: none!important;
			}

			capitec-button-bar {
				height: 120px;
				width: 100%;
				--buttonbar-align: left;
				--theme-buttonbar-padding: 16px 0px 0px 16px;
				--theme-buttonbar-item-gap: 0px;
			}
		
			horizon-option-button {
				height: 80px;
				width: 188px;
				margin-right: 16px;
			}
			
			.toast {
				position: absolute;
				top : 70px;
				left: 790px;
				height: 64px;
				width: 428px;
				border-radius: 4px;
				color: #70AF00;
				z-index: 201;
				left: calc(50.8% - 200px);
				justify-content: center;
				align-items: center;
			}

			.banner {
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-icon-margin-left: 15px;
				--theme-alert-banner-icon-margin-right: 7px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-unsuccessful-red-border: none;
				width: 100%;
				padding: 16px;
			}

			#id-notify-banner-group {
				width: 962px;
			}

			#id-notify-client-warning {
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
				margin-right:3px;
			}

			#id-notify-client-warning-msg {
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				letter-spacing: 0;
				line-height: 20px;
			}
			
			#id-verify-now-warning-link {
				--theme-hyperlink-color: #D4781C;
				--theme-font-family: "Hind Vadodara";
				--theme-font-weight: 600;
				text-decoration: underline;
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderVerifiedToast()}
			${this._renderFavourites()}
		`;
	}

	_renderFavourites() {
		return html`
				<capitec-card class="card">
					<capitec-title-bar type="clear">
						<img src="/src/images/transactions/fav_icon.svg">
						<capitec-label class="favourites" label="Favourites" type="title"></capitec-label>
					</capitec-title-bar>
					<capitec-group layout="vertical" halign="left" valign="top" gap="none">
						${this._renderUnverifiedAlertBanner()}
						${this._renderFailedVerificationAlertBanner()}
						${this._renderTransactSection()}
						${this._renderCardsSection()}
						${this._renderDocumentsSections()}
					</capitec-group>
				</capitec-card>
			`;
	}

	_renderVerifiedToast() {
		if (this.displayToast) {
			return html`
				<capitec-toast class="toast" type="success" header="Successful" detail="Thank you, you have been verified." closable>
				</capitec-toast>`;
		}
		return html``;
	}

	_renderUnverifiedAlertBanner() {
		if (this.verificationStatus === `unverified`) {
			return html`
				<capitec-alert-banner class="banner" type="warning">
					<capitec-group id="id-notify-banner-group" layout="horizontal">
						<capitec-label id="id-notify-client-warning" label="Notify client: "></capitec-label>
						<capitec-label id="id-notify-client-warning-msg"
							label="We need to verify your details before doing any transactions on your account."></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-hyperlink id="id-verify-now-warning-link" label="Verify Now" @click="${() => this._verifyNowClick()}">
						</capitec-hyperlink>
					</capitec-group>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderFailedVerificationAlertBanner() {
		if (this.verificationStatus === `failed`) {
			return html`
				<capitec-alert-banner class="banner" type="unsuccessful-red"
					label="Notify client: I'm not able to access your account since you couldn't be verified. If it's an urgent matter please visit a branch, or you can call again after 24 hours.">
				</capitec-alert-banner>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderTransactSection() {
		return html`
				<capitec-title-bar class="transact-title" type="default" label="Transact" style="visibility: hidden;" ?hidden="${true}"></capitec-title-bar>
				<capitec-button-bar  style="visibility: hidden;" ?hidden="${true}">
					<horizon-option-button badgeText="${this.landingPageInfo && this.landingPageInfo.pendingMandateCount}"
						icon="system/debi-check-action" iconSize="default" label="DebiCheck"
						@click="${() => this._optionSelectedClick(`debi-check`)}"
						?disabled="${this.verificationStatus === `non-client`}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderCardsSection() {
		return html`
				<capitec-title-bar type="default" label="Cards"></capitec-title-bar>
				<capitec-button-bar>
					<horizon-option-button label="Stop Card" icon="system/stop-card-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`stop-card`)}"
						?disabled="${this.verificationStatus === `non-client`}">
					</horizon-option-button>
					<horizon-option-button label="Update Card Limits" icon="system/cards-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`update-card-limits`)}"
						?disabled="${this.verificationStatus === `non-client`}"
						style="visibility: hidden;"
						>
					</horizon-option-button>
					<horizon-option-button label="Tap to Pay" icon="system/contactless-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`tap-to-pay`)}"
						?disabled="${this.verificationStatus === `non-client`}"
						style="visibility: hidden;"
						>
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderDocumentsSections() {
		return html`
				<capitec-title-bar type="default" label="Document"></capitec-title-bar>
				<capitec-button-bar>
					<horizon-option-button label="Statements" icon="system/documents-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`statements`)}"
						?disabled="${this.verificationStatus === `non-client`}">
					</horizon-option-button>
					<horizon-option-button label="Tax Certificate" icon="system/sars-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`tax-certificate`)}"
						?disabled="${this.verificationStatus === `non-client`}">
					</horizon-option-button>
					<horizon-option-button label="Proof of Account" icon="system/documents-action" iconSize="default"
						@click="${() => this._optionSelectedClick(`proof-of-account`)}"
						?disabled="${this.verificationStatus === `non-client`}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`
		<capitec-loading-indicator></capitec-loading-indicator>
		`;
		}
		return html``;
	}
}

customElements.define(`horizon-favourite-transactions`, FavouriteTransactions);