import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the settlement quote has been successfully sent.
 *
 * @export
 * @class SettlementQuoteSuccess
 * @extends {ViewBase}
 */
export class SettlementQuoteSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedAccounts = [];
		this.emailAddress = ``;
		this.emailStatus = [];
		this.displayToast = true;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	/**
	* @property {String} [displayToast=true] Enables/Disables the toast message
	* @readonly
	* @static
	* @memberof SettlementQuoteSuccess
	*/
	static get properties() {
		return {
			displayToast: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.screenDetails = this.horizonStore.getScreenDetails();

		this.emailAddress = this.screenDetails && this.screenDetails.settlementQuoteOutcomeDetails.emailAddress;
		this.emailStatus = this.screenDetails && this.screenDetails.settlementQuoteOutcomeDetails.emailStatus;
		this._getOutcomeDetails();

		window.setTimeout(() => this.displayToast = false, 3000);
		// this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	_sendAnotherClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
		this.horizonStore.clearScreenDetails();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	_getOutcomeDetails() {
		const failedAccounts = this.emailStatus.filter(account => !account.sentStatus);
		const succeededAccounts = this.emailStatus.filter(account => account.sentStatus);
		
		if (failedAccounts.length === this.emailStatus.length) {
			this.header = `Settlement quote not sent`;
			this.toast = `Settlement quote for ${this._formateAccountNames(failedAccounts)} not sent`;
		}
		if (failedAccounts.length > 0) {
			this.header = `Some settlement quote/s did not send`;
			this.toast = `Settlement quote for ${this._formateAccountNames(succeededAccounts)} was sent`;
			this.secondaryToast = `Settlement quote for ${this._formateAccountNames(failedAccounts)} not sent`;
	
		}
		this.header = `Settlement quote sent`;
		this.toast = `Settlement quote for ${this._formateAccountNames(succeededAccounts)} was sent`;
	
	}

	_formateAccountNames(accounts) {
		if (accounts.length === 1) {
			return `${accounts}`;
		}

		if (accounts.length === 2) {
			return `${accounts.join(` and `)}`;
		}

		if (accounts.length > 2) {
			const lastAccount = accounts.pop();
			return `${accounts.join(`, `)} and ${lastAccount}`;
		}

		return ``;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				
			:host{
				width: 100%;
				height: 100%;
			}

			.card {
				width: 100%;
			}
			
			.card > capitec-group[layout="vertical"] {
				height: 744px;
			}

			#id-successful-img {
				width: auto;
			}
			#id-successful-header {
				margin-top:33px;
				margin-bottom:23px;
				height: 32px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 36px;
				text-align: center;
			}

			#id-msg-group{
				justify-content: center;
			}

			#id-sub-detail {
				justify-content: center;
			}
			
			#id-button-group {
				justify-content: center;
				margin-top: 64px;
			}

			.button-left {
				margin-right: 16px;
			}

			capitec-button {
				--theme-button-font-size: 16px;
				--theme-button-font-weight: 600;
				--theme-button-padding-left: 22px;
				--theme-button-padding-top: 12.5px;
				--theme-button-padding-bottom: 12.5px;
				--theme-button-padding-right: 22px;
			}
			#id-success-toast {
				width: 406px;
				position: absolute;
				top : 56px;
				margin-left: 382px;
			}
			.secondary-toast {
				width: 406px;
				position: absolute;
				top : 130px;
				margin-left: 382px;
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSuccessScreen()}

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<capitec-card class="card">
				${this._renderToast()}
				${this._renderSecondaryToast()}

				<capitec-group
					layout="vertical"
					gap="none"
					halign="center"
					valign="center">
						${this._renderContent()}
				</capitec-group>
			</capitec-card>
			
			${this._renderRelatedOptions()}
		`;
	}

	_renderToast() {
		return html`
			<capitec-toast 
				?hidden="${!this.displayToast}" 
				id="id-success-toast"
				type="success"
				header="Successful"
				detail="${this.toast}" 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>
		`;
	}

	_renderSecondaryToast() {
		return this.secondaryToast
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="secondary-toast"
					type="error" 
					header="Unsuccessful" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderContent() {
		return html`
			<img
				id="id-successful-img"
				src="/images/statements/senddocuments.svg"/>

			<capitec-label
				id="id-successful-header"
				label="${this.header}">
			</capitec-label>

			${this._renderDetails()}
			${this._returnSubDetails()}
			${this._renderButtonGroup()}
		`;
	}

	_renderDetails() {
		return html`
		<capitec-group id="id-msg-group" layout="horizontal">
			<capitec-icon
				size="default"
				icon="status/success-trans">
			</capitec-icon>
			${this.detail}
		</capitec-group>`;
	}

	_returnSubDetails() {
		return Boolean(this.subDetail)
		? html`
			<capitec-group layout="horizontal">
				<capitec-icon
					size="default"
					icon="status/error-trans">
				</capitec-icon>
				${this.subDetail}
			</capitec-group>`
		: html``;
	}

	_renderButtonGroup() {
		return html`
			<capitec-group id="id-button-group" layout="horizontal">
				<capitec-button
					class="button-left"
					label="Done"
					@click="${() => this._doneClick()}">
				</capitec-button>
				
				<capitec-button
					type="primary"
					label="Send Another"
					@click="${() => this._sendAnotherClick()}">
				</capitec-button>
			</capitec-group>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-settlement-quote-success`, SettlementQuoteSuccess);