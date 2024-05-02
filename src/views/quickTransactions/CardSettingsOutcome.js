import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/RelatedOptions';

/**
 * Display an outcome screen indicating the Online purchase and International transactions deactivation status.
 *
 * @export
 * @class CardSettingsOutcome
 * @extends {ViewBase}
 */
export class CardSettingsOutcome extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.failedCards = [];
		this.succeededCards = [];
		this.displayToast = true;
		this.endCallContext = `QuickTransactionSuccess`;
		this.header = ``;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	/**
	* @property {String} [displayToast=true] Enables/Disables the toast message
	* @readonly
	* @static
	* @memberof CardSettingsOutcome
	*/
	static get properties() {
		return {
			displayToast: { state: false }
		};
	}

	get incidentDescription() {
		return `Type: Settlement Quote\nSucceeded: ${this._formateAccountNames(this.succeededCards)}\nFailed: ${this._formateAccountNames(this.failedCards)}
				Receipient EmailID: ${this.emailAddress}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.screenDetails = this.horizonStore.getScreenDetails();


		this.failedCards = this.screenDetails.cardSettingsDeactivationStatus.filter(card => !card.ecommerce);
		this.succeededCards = this.screenDetails.cardSettingsDeactivationStatus.filter(card => card.ecommerce);

		this._getOutcomeDetails();
		this._updateIncidentState();

		window.setTimeout(() => this.displayToast = false, 3000);
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

	_tryAgain() {
		this.horizonRouter.navigateToReturnPage();
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonIncidentManager.setDescription(this.incidentDescription);
	}

	_getOutcomeDetails() {
			this.header = ``;
			this.toast = `Settlement quote${this._formateToastDetails(this.succeededCards)} was sent`;
			this.secondaryToast = `Settlement quote${this._formateToastDetails(this.failedCards)} was not sent`;
			this.successDetail = html`Settlement quote for<b>${this._formateAccountNames(this.succeededCards)}</b> was emailed to <b>${this.emailAddress}</b>`;
			this.failureDetails = html`Settlement quote for<b>${this._formateAccountNames(this.failedCards)}</b> was not emailed to <b>${this.emailAddress}</b>`;
		}

	_formateToastDetails(accounts) {
		if (accounts.length === 1) {
			return ` for ${accounts[0].toLowerCase()}`;
		}
		return `s`;
	}

	_formateAccountNames(accounts) {
		if (accounts.length === 1) {
			return `${accounts[0].toLowerCase()}`;
		}

		if (accounts.length === 2) {
			return `${accounts.join(` and `).toLowerCase()}`;
		}

		if (accounts.length > 2) {
			const lastAccount = accounts.slice(-1)[0];
			return `${accounts.slice(0, -1).join(`, `).toLowerCase()} and ${lastAccount.toLowerCase()}`;
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
				:host {
					width: 100%;
					height: 100%;
				}
				capitec-card {
					width: 100%;
				}
				capitec-card > capitec-group[layout="vertical"] {
					height: 744px;
					padding-top: 42px
				}
				.header {
					margin: 33px 0px 23px 0px;
					height: 32px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 24px;
					--theme-label-default-font-weight: 600;
				}
				.subdetail-group {
					margin-top: 12px;
				}
				b {
					margin: 0px 4px;
					color: #3A3A3A;
				}
				.button-group {
					margin-top: 38px;
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
				capitec-toast {
					width: 406px;
					position: absolute;
					top : 56px;
					margin-left: 382px;
				}
				.secondary-toast {
					top : 130px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderOutcomeScreen()}

			${super._webTemplate()}
		`;
	}

	_renderOutcomeScreen() {
		return html`
			<capitec-card class="card">
				${this._renderSuccessToast()}
				${this._renderFailureToast()}

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

	_renderSuccessToast() {
		return this.toast 
		? html`
			<capitec-toast 
				?hidden="${!this.displayToast}"
				type="success"
				header="Successful"
				detail="${this.toast}" 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>`
		: html``;
	}

	_renderFailureToast() {
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
			<img src="/images/statements/send-documents.svg"/>

			<capitec-label
				class="header"
				label="${this.header}">
			</capitec-label>

			${this._renderSuccessDetails()}
			${this._returnFailureDetails()}
			${this._renderButtonGroup()}
		`;
	}

	_renderSuccessDetails() {
		return this.successDetail 
		? html`
		<capitec-group layout="horizontal" halign="center">
			<capitec-icon
				size="default"
				icon="status/success-trans">
			</capitec-icon>
			${this.successDetail}
		</capitec-group>`
		: html``;
	}

	_returnFailureDetails() {
		return this.failureDetails
		? html`
			<capitec-group class="subdetail-group" layout="horizontal" halign="center">
				<capitec-icon
					size="default"
					icon="status/error-trans">
				</capitec-icon>
				${this.failureDetails}
			</capitec-group>`
		: html``;
	}

	_renderButtonGroup() {
		return html`
			<capitec-group class="button-group" layout="horizontal" halign="center">
				<capitec-button
					class="button-left"
					label="Done"
					@click="${() => this._doneClick()}">
				</capitec-button>

				<capitec-button
					type="primary"
					label="Try Again"
					@click="${() => this._tryAgain()}">
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

customElements.define(`horizon-update-card-settings-outcome`, CardSettingsOutcome);