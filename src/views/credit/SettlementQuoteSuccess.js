import { css, html } from 'platform/elements';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { SETTLEMENT_QUOTE_EVENTS as SettlementQuoteCreditEvents } from 'app/constants/telemetry/events/Credit';
import { SETTLEMENT_QUOTE_EVENTS as SettlementQuoteFavouritesEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
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

		this.succeededAccounts = [];
		this.emailAddress = ``;
		this.telemetryEvents = {};
		this.returnToScreen = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	// N/A

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.returnToScreen = this.horizonStore.getReturnToScreen().route.title;
		this.telemetryEvents = this.returnToScreen === `Favourites` ? SettlementQuoteFavouritesEvents : SettlementQuoteCreditEvents;

		this._telemetry.startSpan(this.telemetryEvents.SETTLEMENT_QUOTE_SUCCESS);

		this.screenDetails = this.horizonStore.getScreenDetails();

		this.succeededAccounts = this.screenDetails?.emailStatus.filter(account => account.sentStatus).map(item => item.productTypeDescription);
		this.emailAddress = this.screenDetails?.emailAddress;
		
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(this.telemetryEvents.SETTLEMENT_QUOTE_SUCCESS_DONE, {
			"screen": TelemetryScreen.SETTLEMENT_QUOTE_SUCCESS,
			"next-screen": this.returnToScreen === `Favourites` ? TelemetryScreen.FAVOURITES : TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(this.telemetryEvents.SETTLEMENT_QUOTE_SUCCESS, {}, true, true);
		this._telemetry.endSpan(QuickTransactionEvents.SETTLEMENT_QUOTE, {});

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	_sendAnotherClick() {
		this._telemetry.logEvent(this.telemetryEvents.SETTLEMENT_QUOTE_SUCCESS_SEND_ANOTHER, {
			"screen": TelemetryScreen.SETTLEMENT_QUOTE_SUCCESS,
			"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_VIEW
		});

		this._telemetry.endSpan(this.telemetryEvents.SETTLEMENT_QUOTE_SUCCESS);
		this._telemetry.endSpan(QuickTransactionEvents.SETTLEMENT_QUOTE, {});

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
				#id-success-msg {
					width: auto;
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
			<horizon-success-screen
				data-automation-id="settlement-quote-success-screen"
				header="Settlement quote${this.succeededAccounts.length > 1 ? `s` : ``} sent" 
				image="/images/statements/send-documents.svg"
				left="Send Another"
				right="Done"
				toast="Settlement quote${this.succeededAccounts.length === 1 ? ` for ${this.succeededAccounts[0].toLowerCase()}` : `s`} was sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section id="id-success-msg" slot="detail">
						Settlement quote for <b> ${this._formateAccountNames(this.succeededAccounts)}</b> was emailed to <b>${this.emailAddress}</b>.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-settlement-quote-success`, SettlementQuoteSuccess);