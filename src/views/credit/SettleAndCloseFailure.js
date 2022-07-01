import { CREDIT_TYPE } from 'app/constants/Credit';
import { SETTLE_AND_CLOSE } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { html } from 'platform/elements';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the selected account was not settled and closed successfully.
 *
 * @export
 * @class SettleAndCloseFailure
 * @extends {ViewBase}
 */
 export class SettleAndCloseFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.creditCardNumber = ``;
		this.creditType = ``;
		this.accountName = ``;

		this.telemetryEvents = {};

		this.primaryToast = this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account was not settled and closed` : `Account was not settled`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
		this._telemetry.startSpan(this.telemetryEvents.FAILURE);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick(event) {
		this._telemetry.logEvent(event, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_FAILURE : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN_FAILURE,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(this.telemetryEvents.FAILURE, {}, true, true);
	
		this.horizonRouter.navigateToCreditAccount();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		const screenDetails = this.horizonStore.getScreenDetails();
		this.creditType = screenDetails.settleAndCloseCreditType;
		this.accountName = screenDetails.accountName;
		this.creditCardNumber = screenDetails.settleAndCloseAccountNumber;
		this.telemetryEvents = SETTLE_AND_CLOSE[this.creditType];
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFailureScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFailureScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="settle-and-close-failure-screen"
				header="${this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account was not settled and closed` : `Account was not settled`}"
				image="/images/credit/settle-and-close-account.svg"
				left="Done"
				right="Try Again"
				toast="${this.primaryToast}"
				@left-click=${() => this._doneClick(this.telemetryEvents.FAILURE_DONE)}
				@right-click=${() => this._doneClick(this.telemetryEvents.FAILURE_TRY_AGAIN)}>
					${this._renderDetail()}
			</horizon-error-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				slot="detail">
					Your ${this.accountName} account was not ${this.creditType === CREDIT_TYPE.FLEXIBLE ? `settled and closed.` : `settled`}
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="settle-and-close-failure-related-options"
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS}">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-settle-and-close-failure`, SettleAndCloseFailure);