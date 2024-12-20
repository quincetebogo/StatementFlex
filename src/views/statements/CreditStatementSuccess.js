import { css, html } from 'platform/elements';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { STATEMENT_EVENTS } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

export class CreditStatementsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
		this.accountName = ``;
		this.endCallContext = `QuickTransactionSuccess`;
		this.productName = ``;
		this.productType = ``;
		this.monthRange = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			mailId: { state: false, attribute: false },
			acNumber: { state: false, attribute: false },
			accountName: { state: false, attribute: false }
		};
	}

	get incidentDescription() {
		let accountName = ``;

		if (this.productType === ACCOUNT_TYPES.CREDIT) {
			accountName = `Account Name: ${this.accountName}\n`;
		}

		return `Type: ${this.productName}\n${accountName}Period: ${this.monthRange}\nRecipient EmailID: ${this.mailId}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._telemetry.startSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"outcome": `Success`
		});

		const screenDetails = this.horizonStore.getScreenDetails();

		this.mailId = screenDetails && screenDetails.emailAddress;
		this.acNumber = screenDetails && screenDetails.accountNumber;
		this.accountName = screenDetails && screenDetails.accountName;
		this.productName = screenDetails && screenDetails.productName;
		this.productType = screenDetails && screenDetails.productType;
		this.monthRange = screenDetails && screenDetails.monthRange;

		this._updateIncidentState();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(STATEMENT_EVENTS.STATEMENTS_SUCCESS_DONE, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"nextScreen": TelemetryScreen.CREDIT_LANDING
		});
		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {}, true, true);

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToCreditAccount();
	}

	async _sendAnotherClick() {
		await this._telemetry.logEvent(STATEMENT_EVENTS.STATEMENTS_SEND_ANOTHER, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"nextScreen": TelemetryScreen.CREDIT_STATEMENTS
		});
		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS);

		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		/* Removed during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		*/
		this.horizonIncidentManager.setDescription(this.incidentDescription);
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
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen 
				data-automation-id="credit-statements-success"
				header="Statement sent" 
				image="/images/statements/send-documents.svg"
				left="Send Another"
				right="Done"
				toast="Statement sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							The statement for <b>${this.accountName}</b> account <b>${this.acNumber}</b> was emailed to <b>${this.mailId}</b>
					</section>
			</horizon-success-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-credit-statements-success`, CreditStatementsSuccess);