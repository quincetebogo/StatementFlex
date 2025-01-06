import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { UNLOCK_FTSP_EVENTS } from 'app/constants/telemetry/events/SavingsPlan';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/SuccessScreen';

export class FixedTermSavingsPlanSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// --------------
	// PROPERTIES
	// --------------

	get incidentDescription() {
		const type = this.screenDetails.unlockType;
		const fromAccNumber = this.screenDetails.unlockAccountNumber;
		const unlockBalance = formatCurrency(this.screenDetails.unlockBalance);
		const unlockAmount = formatCurrency(this.screenDetails.unlockAmount);
		const penaltyFee = formatCurrency(this.screenDetails.penaltyFee);
		const balancePostUnlock = formatCurrency(this.screenDetails.balancePostUnlock);

		return `Type: ${type} unlock\nFTSP account number: ${fromAccNumber}\nValue of FTSP:${unlockBalance}\nUnlock amount: ` +
			`${unlockAmount}\nPenalty Fee: ${penaltyFee}\nBalance of FTSP:${balancePostUnlock}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();

		this._telemetry.startSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_SUCCESS, {
			"screen": TelemetryScreen.UNLOCK_FTSP_SUCCESS
		});

		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_SUCCESS_DONE, {
			"screen": TelemetryScreen.UNLOCK_FTSP_SUCCESS,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});

		this._telemetry.endSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP, {}, true, false, true);

		this.horizonStore.clearScreenDetails();
		this.horizonStore.clearReturnScreen();

		this.horizonRouter.navigateToSavingsPlan();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.setDescription(this.incidentDescription);
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
					height: auto;
				}

				horizon-success-screen {
					--horizon-button-group-margin-top: 28px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFixedTermSavingsPlanSuccess()}

			${super._webTemplate()}
		`;
	}

	_renderFixedTermSavingsPlanSuccess() {
		return html`
			<horizon-success-screen 
				data-automation-id="unlock-fixed-term-savings-plan-success-screen"
				header="${this.screenDetails.unlockType} Fixed-term unlocked"
				image="/images/savings/UnlockSavings.svg"
				right="Done"
				toast="Unlock complete"
				@right-click=${() => this._doneClick()}>
					<section id="id-success-msg" slot="detail">
						${this.screenDetails.unlockType === `Partial`
				? `Partial unlock transfer of ${formatCurrency(this.screenDetails.unlockAmount)} from ${this.screenDetails.unlockAccountName} Fixed-term Savings Account to Main Account was successful.`
				: `Fixed-term Savings Account for ${this.screenDetails.unlockAccountName} has been unlocked.`}
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-unlock-fixed-term-savings-plan-success`, FixedTermSavingsPlanSuccess);