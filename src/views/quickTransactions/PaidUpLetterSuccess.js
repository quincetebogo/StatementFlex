import { css, html } from 'platform/elements';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the paid up letter has been successfully sent.
 *
 * @export
 * @class PaidUpLetterSuccess
 * @extends {ViewBase}
 */
export class PaidUpLetterSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.emailAddress = ``;
		this.succeededAccounts = [];
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

		this._telemetry.startSpan(CreditEvents.CREDIT_PAID_UP_LETTER_SUCCESS, {});
		
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
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_SUCCESS_DONE, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER_SUCCESS,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this._telemetry.endSpan(CreditEvents.CREDIT_PAID_UP_LETTER_SUCCESS, {}, true, true, false);
	
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_SUCCESS_SEND_ANOTHER, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER_SUCCESS,
			"next-screen": TelemetryScreen.PAID_UP_LETTER_ACCOUNTS
		});
		
		this._telemetry.endSpan(CreditEvents.CREDIT_PAID_UP_LETTER_SUCCESS, {});
		
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
				#id-error-msg {
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
				data-automation-id="paid-up-letter-success-screen"
				header="Paid Up letter sent" 
				image="/images/statements/senddocuments.svg"
				left="Send Another"
				right="Done"
				toast="Paid Up letter sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section id="id-error-msg" slot="detail">
						Paid Up letter(s) for <b> ${this._formateAccountNames(this.succeededAccounts)}</b> was emailed to <b>${this.emailAddress}</b>
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-paid-up-letter-success`, PaidUpLetterSuccess);