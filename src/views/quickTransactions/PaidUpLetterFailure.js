import { css, html } from 'platform/elements';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Paid Up Letter send failure Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class PaidUpLetterFailure
 * @extends {ViewBase}
 */

export class PaidUpLetterFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.failedAccounts = [];
		this.emailaddress = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this._telemetry = HorizonTelemetry.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			emailAddress: { type: String }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(CreditEvents.CREDIT_PAID_UP_LETTER_FAILURE, {});

		this.screenDetails = this.horizonStore.getScreenDetails();

		this.failedAccounts = this.screenDetails?.emailStatus.filter(account => !account.sentStatus).map(item => item.productTypeDescription);
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;

		/* Removed duing incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		*/
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(CreditEvents.CREDIT_PAID_UP_LETTER_FAILURE, {}, true, true, false);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_FAILURE_DONE, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER_FAILURE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_tryAgainClick() {

		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_FAILURE_ASSIGN, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER_FAILURE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		/* Removed during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.ASSIGNED;
		*/

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
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
					--horizon-error-screen-height:768px;
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
			${this._renderPaidUpLetterFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderPaidUpLetterFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="paid-up-letter-failure-screen"
				image="/images/insure/assign-pay-arrears.svg"
				header="Paid Up letter not sent" 
				left="Done"
				right="Try Again"
				toast="Paid Up letter not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgainClick()}>
				<section id="id-error-msg" slot="detail">
					Paid Up letter(s) for <b> ${this._formateAccountNames(this.failedAccounts)}</b> was not emailed to <b>${this.emailAddress}</b>.
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="paid-up-letter-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-paid-up-letter-failure`, PaidUpLetterFailure);