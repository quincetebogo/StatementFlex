import { css, html } from 'platform/elements';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';
export class StatementsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.accNumber = ``;
		this.accName = ``;
		this.endCallContext = `QuickTransactionSuccess`;
		this.productName = ``;
		this.productType = ``;
		this.period = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	get incidentDescription() {
		let accountName = ``;

		if (this.productType === ACCOUNT_TYPES.SAVINGS_PLAN) {
			accountName = `Account Name: ${this.accName}\n`;
		}

		return `Type: ${this.productName}\n${accountName}Period: ${this.period}\nRecipient EmailID: ${this.mailId}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();

		this.mailId = screenDetails && screenDetails.emailAddress;
		this.accNumber = screenDetails && screenDetails.accountNumber;
		this.accName = screenDetails && screenDetails.accountName;
		this.telemetryEvent = screenDetails?.telemetryEvent ?? {};
		this.productName = screenDetails && screenDetails.productName;
		this.period = screenDetails && screenDetails.period;
		this.productType = screenDetails && screenDetails.productType;

		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS_SUCCESS);
		this._updateIncidentState();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_SUCCESS, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_SUCCESS_DONE, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME
		});
		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_SUCCESS, {}, true, true);

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
	}

	async _sendAnotherClick() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_SEND_ANOTHER, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME
		});
		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_SUCCESS);

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

			${super._webTemplate()}
			${this._renderRelatedOptions()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen 
				data-automation-id="statements-success"
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
							The statement for ${this.accName} <b>${this.accNumber}</b> was emailed to <b>${this.mailId}</b>
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

customElements.define(`horizon-statements-success`, StatementsSuccess);