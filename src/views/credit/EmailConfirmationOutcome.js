import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/RelatedOptions';

/**
 * Display an outcome screen indicating the email has been successfully sent or not.
 *
 * @export
 * @class EmailConfirmationOutcome
 * @extends {ViewBase}
 */
export class EmailConfirmationOutcome extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedAccounts = [];
		this.emailAddress = ``;
		this.emailStatus = [];
		this.failedAccounts = [];
		this.succeededAccounts = [];
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
	* @memberof EmailConfirmationOutcome
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

		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;
		this.emailStatus = this.screenDetails && this.screenDetails.emailStatus;
		this.failedAccounts = this.emailStatus.filter(account => !account.sentStatus).map(item => item.productTypeDescription);
		this.succeededAccounts = this.emailStatus.filter(account => account.sentStatus).map(item => item.productTypeDescription);

		this._getOutcomeDetails();

		/* Removed during incident management refactor
		this._updateIncidentState();
		*/


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

	_sendAnotherClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
		this.horizonStore.clearScreenDetails();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/* Removed during incident management refactor
	_updateIncidentState() {
		const completeFailure = this.failedAccounts.length === this.emailStatus.length;
		this.horizonIncidentManager.incidentState = completeFailure ? super.HORIZON_NEED_STATUS.FAILED : super.HORIZON_NEED_STATUS.COMPLETED;
	}
	*/

	_getOutcomeDetails() {
		if (this.failedAccounts.length === this.emailStatus.length) {
			this.header = `${this.screenDetails.header} not sent`;
			this.secondaryToast = `${this.screenDetails.header} ${this._formateToastDetails(this.failedAccounts)} was not sent`;
			this.failureDetails = html`${this.screenDetails.header} for <b>${this._formateAccountNames(this.failedAccounts)}</b> was not emailed to <b>${this.emailAddress}</b>`;
			return;
		}
		if (this.failedAccounts.length > 0) {
			this.header = `${this.screenDetails.header} did not send`;
			this.toast = `${this.screenDetails.header} ${this._formateToastDetails(this.succeededAccounts)} was sent`;
			this.secondaryToast = `${this.screenDetails.header} ${this._formateToastDetails(this.failedAccounts)} was not sent`;
			this.successDetail = html`${this.screenDetails.header} for<b>${this._formateAccountNames(this.succeededAccounts)}</b> was emailed to <b>${this.emailAddress}</b>`;
			this.failureDetails = html`${this.screenDetails.header} for<b>${this._formateAccountNames(this.failedAccounts)}</b> was not emailed to <b>${this.emailAddress}</b>`;
			return;
		}
		this.header = `${this.screenDetails.header} sent`;
		this.toast = `${this.screenDetails.header} ${this._formateToastDetails(this.succeededAccounts)} was sent`;
		this.successDetail = html`${this.screenDetails.header} for <b> ${this._formateAccountNames(this.succeededAccounts)}</b> was emailed to <b>${this.emailAddress}</b>`;
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
				
			:host{
				width: 100%;
				height: 100%;
			}
			.card {
				width: 100%;
			}
			.card > capitec-group[layout="vertical"] {
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
			.subdetail-group{
				margin-top: 12px;
			}
			.only-group {
				margin-bottom: 20px;
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
					class="${this.toast ? `secondary-toast` : ``}"
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
		<capitec-group class="${this.failureDetails ? `` : `only-group`}" layout="horizontal" halign="center">
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
			<capitec-group class="subdetail-group ${this.successDetail ? `` : `only-group`}" layout="horizontal" halign="center">
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
					label="Pay Another"
					?hidden="${this.succeededAccounts.length !== this.emailStatus.length}"
					@click="${() => this._sendAnotherClick()}">
				</capitec-button>
			
				<capitec-button
					type="${this.succeededAccounts.length === this.emailStatus.length ? `primary` : ``}"
					class="button-left"
					label="Done"
					@click="${() => this._doneClick()}">
				</capitec-button>

				<capitec-button
					type="primary"
					label="Try Again"
					?hidden="${this.succeededAccounts.length === this.emailStatus.length}"
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

customElements.define(`horizon-email-confirmation-outcome`, EmailConfirmationOutcome);