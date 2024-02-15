import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
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
	 *  @typedef {Object} renderAlertBanner Display alter banner based on verification status
	 */

	/**
	 * @callback renderAlterBannerCallback
	 * @returns {html}
	 */

	/**
	 *
	 * @property {Object} landingPageInfo Data for the Favourites Landing Page display
	 * @property {string} verificationStatus Indicates if the client is verified, unverified, non-client etc.
	 * @property {Boolean} displayVerificationStatusToast If true, display a toast for the verification status
	 * @property {Object} shouldDisableByRole Callback function, returns true or false to disable need button
	 * @property {Object} showTooltip Callback function, returns true or false to display tooltip
	 * @property {renderAlterBannerCallback} renderAlertBanner Callback function to render alter banner based on verification status & method
	 *
	 * @readonly
	 * @static
	 * @memberof FavouriteTransactions
	 */
	static get properties() {
		return {
			landingPageInfo: { type: Object },
			verificationStatus: { type: String },
			displayVerificationStatusToast: { type: Boolean },
			isCapitecConnectAgent: { type: Boolean },
			shouldDisableByRole: { type: Object },
			showTooltip: { type: Object },
			renderAlertBanner: { type: Object, attribute: false },
			tooltipMessage: { type: String },
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

	_optionSelectedClick(selectedOption) {
		this.dispatchEvent(new CustomEvent(`option-click`, {
			detail: {
				option: selectedOption,
				stopPropagation: selectedOption !== `stop-card` && selectedOption !== `search-other-need` && this.verificationStatus !== `verified`
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
				${ALERTBANNER_CSS}
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
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderVerifiedToast()}
			${this._renderContent()}
		`;
	}

	_renderContent() {

		return html`
			<capitec-card 
				data-automation-id="favourite-transactions"
				class="card">
					<capitec-title-bar type="clear">
						<img src="/images/transactions/fav-icon.svg">
						<capitec-label class="favourites" label="Favourites" type="title"></capitec-label>
					</capitec-title-bar>
					<capitec-group layout="vertical" halign="left" valign="top" gap="none">
						${this._renderSections()}
					</capitec-group>
			</capitec-card>`;
	}

	_renderSections() {
		switch (this.verificationStatus) {
			case `non-client`:
				return html`${this._renderSearchOtherNeed()}`;
			default:
				return html`
					${this.renderAlertBanner()}
					${this._renderTransactSection()}
					${this._renderCardsSection()}
					${this._renderDocumentsSections()}
					${this._renderSearchOtherNeed()}
				`;
		}
	}

	_renderVerifiedToast() {
		if (this.displayToast) {
			return html`
				<capitec-toast
					data-automation-id="favourite-transactions-verified-toast"
					class="toast"
					type="success"
					header="Successful"
					detail="Thank you, you have been verified."
					closable>
				</capitec-toast>`;
		}
		return html``;
	}

	_renderTransactSection() {
		const pendingMandates = this.landingPageInfo?.pendingMandateCount ?? ``;
		return html`
				<capitec-title-bar
					class="transact-title"
					type="default"
					label="Transact">
				</capitec-title-bar>
				<capitec-button-bar>

					<!-- Debicheck -->
					<horizon-option-button
						data-automation-id="favourite-transactions-debi-check"
						badgeText="${pendingMandates}"
						?showTooltip="${this.showTooltip(`debi-check`)}"
						.tooltipMessage="${this.tooltipMessage}"
						icon="system/debi-check-action" iconSize="default"
						label="DebiCheck"
						@click="${() => this._optionSelectedClick(`debi-check-viewInfo`)}"
						?disabled="${this.shouldDisableByRole(`debi-check`)}">
					</horizon-option-button>

					<!-- Send Cash -->
					<horizon-option-button
						data-automation-id="favourites-transaction-send-cash"
						icon="system/send-cash-action"
						?disabled="${this.shouldDisableByRole(`send-cash`)}"
						label="Send Cash"
						?showTooltip="${this.showTooltip(`send-cash`)}"
						.tooltipMessage="${this.tooltipMessage}"
						@click="${() => this._optionSelectedClick(`send-cash`)}">
					</horizon-option-button>

					<!-- PayShap -->
					<horizon-option-button
						data-automation-id="favourites-transaction-payshap"
						icon=""
						img-src="/images/common/pay-shap-icon.svg"
						label="PayShap"
						?showTooltip="${this.showTooltip(`payshap`)}"
						.tooltipMessage="${this.tooltipMessage}"
						@click="${() => this._optionSelectedClick(`payshap`)}"
						?disabled="${this.shouldDisableByRole(`payshap`)}">
					</horizon-option-button>
				</capitec-button-bar>
		`;
	}

	_renderCardsSection() {
		return html`
			<capitec-title-bar type="default" label="Cards"></capitec-title-bar>
			<capitec-button-bar>
				
				<!-- Stop Card -->
				<horizon-option-button
					data-automation-id="favourite-transactions-stop-card"
					label="Stop Card" 
					icon="system/stop-card-action"
					iconSize="default"
					?showTooltip="${this.showTooltip(`stop-card`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`stop-card`)}"
					?disabled="${this.shouldDisableByRole(`stop-card`)}">
				</horizon-option-button>

				<!-- Update Card Limits -->
				<horizon-option-button
					data-automation-id="favourite-transactions-update-card-limits"
					label="Update Card Limits" 
					icon="system/cards-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`update-card-limits`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`update-card-limits`)}"
					?disabled="${this.shouldDisableByRole(`update-card-limits`)}">
				</horizon-option-button>
				</capitec-tooltip>

				<!-- Tap to Pay -->
				<horizon-option-button
					data-automation-id="favourite-transactions-tap-to-pay"
					label="Tap to Pay"
					icon="system/contactless-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`tap-to-pay`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`tap-to-pay`)}"
					?disabled="${this.shouldDisableByRole(`tap-to-pay`)}">
				</horizon-option-button>
			</capitec-button-bar>
		`;
	}

	_renderDocumentsSections() {
		return html`
			<capitec-title-bar type="default" label="Document" style="visibility: visible;"></capitec-title-bar>
			<capitec-button-bar  style="visibility: visible;">

				<!-- Statements -->
				<horizon-option-button
					data-automation-id="favourite-transactions-statements"
					label="Statements" 
					icon="system/documents-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`statements`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`statements`)}"
					?disabled="${this.shouldDisableByRole(`statements`)}">
				</horizon-option-button>

				<!-- Tax Certificate -->
				<horizon-option-button
					id="tax-certificate"
					data-automation-id="favourite-transactions-tax-certificate"
					label="Tax Certificate" 
					icon="system/sars-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`tax-certificate`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`tax-certificate`)}"
					?disabled="${this.shouldDisableByRole(`tax-certificate`)}">
				</horizon-option-button>

				<!-- Proof of Account -->
				<horizon-option-button
					data-automation-id="favourite-transactions-proof-of-account"
					label="Proof of Account" 
					icon="system/documents-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`proof-of-account`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`proof-of-account`)}"
					?disabled="${this.shouldDisableByRole(`proof-of-account`)}">
				</horizon-option-button>

				<!-- Settlement Quote -->
				<horizon-option-button
					data-automation-id="favourite-transactions-settlement-quote"
					label="Settlement Quote" 
					icon="system/documents-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`settlement-quote`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`settlement-quote`)}"
					?disabled="${this.shouldDisableByRole(`settlement-quote`)}">
				</horizon-option-button>

				<!-- Paid Up Letter -->
				<horizon-option-button
					label="Paid Up Letter" 
					icon="system/documents-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`paid-up-accounts`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`paid-up-accounts`)}"
					?disabled="${this.shouldDisableByRole(`paid-up-accounts`)}">
				</horizon-option-button>
				</capitec-tooltip>

			</capitec-button-bar>
		`;
	}

	_renderSearchOtherNeed() {
		return html`
			<capitec-title-bar type="default" label="Search other need (not on Horizon)"></capitec-title-bar>
			<capitec-button-bar>
				
				<!-- Search Other Need -->
				<horizon-option-button
					data-automation-id="favourite-transactions-search-other-need"
					label="Search Other Need" 
					icon="system/search-action" 
					iconSize="default"
					?showTooltip="${this.showTooltip(`search-other-need`)}"
					.tooltipMessage="${this.tooltipMessage}"
					@click="${() => this._optionSelectedClick(`search-other-need`)}"
					?disabled="${this.shouldDisableByRole(`search-other-need`)}">
				</horizon-option-button>
			</capitec-button-bar>
		`;
	}
}

customElements.define(`horizon-favourite-transactions`, FavouriteTransactions);