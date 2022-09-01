import { QuickTransactionEvents, SETTLEMENT_QUOTE_EVENTS as SettlementQuoteFavouritesEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { css, html } from 'platform/elements';
import { SETTLEMENT_QUOTE_EVENTS as SettlementQuoteCreditEvents } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Settlement quote failure Screen that can be displayed when channel service calls fail to send them. 
 *
 * @export
 * @class SettlementQuoteFailure
 * @extends {ViewBase}
 */

export class SettlementQuoteFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.failedAccounts = [];
		this.emailAddress = ``;
		this.telemetryEvents = {};
		this.returnToScreen = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
	}

	
	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.returnToScreen = this.horizonStore.getReturnToScreen().route.title;
		this.telemetryEvents = this.returnToScreen === `Favourites` ? SettlementQuoteFavouritesEvents : SettlementQuoteCreditEvents;

		this._telemetry.startSpan(this.telemetryEvents.SETTLEMENT_QUOTE_FAILURE);

		this.screenDetails = this.horizonStore.getScreenDetails();

		this.failedAccounts = this.screenDetails?.emailStatus.filter(account => !account.sentStatus).map(item => item.productTypeDescription);
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;

		this.horizonIncidentManager.setIncidentState(super.HORIZON_NEED_STATUS.FAILED);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(this.telemetryEvents.SETTLEMENT_QUOTE_FAILURE_DONE, {
			"screen": TelemetryScreen.SETTLEMENT_QUOTE_FAILURE,
			"next-screen": this.returnToScreen === `Favourites` ? TelemetryScreen.FAVOURITES : TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(this.telemetryEvents.SETTLEMENT_QUOTE_FAILURE, {}, true, true);
		this._telemetry.endSpan(QuickTransactionEvents.SETTLEMENT_QUOTE, {});

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	_tryAgain() {
		this._telemetry.logEvent(this.telemetryEvents.SETTLEMENT_QUOTE_FAILURE_TRY_AGAIN, {
			"screen": TelemetryScreen.SETTLEMENT_QUOTE_FAILURE,
			"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG
		});

		this._telemetry.endSpan(this.telemetryEvents.SETTLEMENT_QUOTE_FAILURE);
		this._telemetry.endSpan(QuickTransactionEvents.SETTLEMENT_QUOTE, {});

		this.horizonRouter.navigateToReturnPage();
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
				horizon-error-screen {
					--horizon-error-screen-height: 744px;
				}
				#id-error-msg {
					width: auto;
					font-weight:500;
					color:#3A3A3A;
					margin-bottom:35px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFailureScreenContent()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFailureScreenContent() {
		return html`
			<horizon-error-screen
				data-automation-id="settlement-quote-failure-screen"
				image="/images/statements/send-documents.svg"
				header="Settlement quote${this.failedAccounts.length > 1 ? `s` : ``} not sent" 
				left="Done"
				right="Try Again"
				toast="Settlement quote${this.failedAccounts.length === 1 ? ` for ${this.failedAccounts[0].toLowerCase()}` : `s`} was not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgain()}>
				<section id="id-error-msg" slot="detail">
					Settlement quote for <b> ${this._formateAccountNames(this.failedAccounts)}</b> was not emailed to <b>${this.emailAddress}</b>.
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="settlement-quote-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-settlement-quote-failure`, SettlementQuoteFailure);