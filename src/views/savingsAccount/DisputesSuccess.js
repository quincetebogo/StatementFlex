import { css, html } from 'platform/elements';
import { END_CALL_REASON } from 'app/constants/EndCallReasons';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';
import { TRANSACTION_ENQUIRY_EVENTS } from 'app/constants/telemetry/events/SavingsAccount';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the card disputes is successful.
 *
 * @export
 * @class DisputesSuccess
 * @extends {ViewBase}
 */
export class DisputesSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.endCallContext = `QuickTransactionSuccess`;
		this.displayToast = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Boolean} displayToast Show or hide toast
	 * 
	 */
	static get properties() {
		return {
			displayToast: { state: true }
		};
	}

	get description() {
		return `parent incident closed, secondary incident handed off to Chargeback Operations to investigate`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.clientAnswerWording = screenDetails.clientAnswerWording;
		this.agentAnswerWording = screenDetails.agentAnswerWording;

		await this._telemetry.startSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_SUCCESS);
		this._updateIncidentState();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_SUCCESS, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_SUCCESS_DONE);
		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY, {}, true, false, true);

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.returningFromScreen = `card-disputes-success-done`;
		this.horizonStore.setScreenDetails(screenDetails);

		this.horizonRouter.navigateToReturnPage();
	}

	async _disputeAnotherTran() {
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_SUCCESS_REPEAT);
		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_SUCCESS, {}, true, true);

		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _updateIncidentState() {
		this.horizonIncidentManager.setDescription(this.description);

		const options = {
			clientNeed: null,
			endCallReason: END_CALL_REASON.NEED_FULFILLED,
			manualClassification: null
		};

		await this.horizonIncidentManager.closeIncident(options, () => this._toggleBusyFlag());
	}

	_copyContent() {
		navigator.clipboard.writeText(`${this.clientAnswerWording}`);

		this.displayToast = true;
		window.setTimeout(() => this.displayToast = false, 3000);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.middle {
					height: 744px;
				}
				capitec-content-box {
					--theme-layout-gap-spacing: 24px;
				}
				capitec-image {
					width: 252px;
					height: 182px;
					order: 1;
				}
				capitec-toast {
					--theme-toast-info-background-color: #FFFFFF;
					--theme-toast-box-shadow: none;
					--theme-toast-max-width: 820px;
					--theme-toast-title-font-size: 15px;
					--theme-toast-z-index: 1101;
					order: 2;
					border: 2px solid #DAF2F4;
					border-radius: 4px;
				}
				
				.copy-toast {
					width: 406px;
					position: absolute;
					top : 56px;
					margin-left: 382px;
				}

				.content {
					order: 3;
					height: auto;
					width: 820px;
					background-color: #DAF2F4;
					padding: 16px;
					--theme-layout-gap-spacing: 12px;
				}
				.content > capitec-group {
					--theme-layout-gap-spacing: 12px;
				}
				capitec-icon {
					--theme-icon-size-small: 25px;
				}
				capitec-label {
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-label-subtitle-font-size: 15px;
					--theme-label-subtitle-font-weight: 400;
					text-align: center;
				}
				.copy-icon {
					margin: 8px;
				}
				#id-button-group {
					order: 4;
				}
				.center-button {
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-padding-left: 22px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-right: 22px;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderDisputeOutcome()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderDisputeOutcome() {
		return html`
			<capitec-card class="middle" valign="center">
				${this._renderCopyToast()}
				<capitec-content-box layout="vertical" halign="center" valign="center">
					<capitec-image src="platform/illustrations/beneficiaries.svg"></capitec-image>

					<capitec-toast
						type="info"
						header="Agent info:"
						detail="${this.agentAnswerWording}"
						layout="vertical">
					</capitec-toast>
					
					<capitec-group layout="vertical" class="content" halign="center" valign="top">
						<capitec-group layout="horizontal" halign="center" valign="center">
							<capitec-icon size="small" icon="status/info-trans"></capitec-icon>
							<capitec-label label="Notify the client" type="title"></capitec-label>
						</capitec-group>
						
						<capitec-label label="${this.clientAnswerWording}" type="subtitle"></capitec-label>
					</capitec-group>

					<capitec-group id="id-button-group" layout="horizontal" halign="center">
						<capitec-tooltip message="Copy client notification content" position="left">
							<capitec-icon class="copy-icon" size="medium" icon="system/notes-action" @click="${() => this._copyContent()}"></capitec-icon>
						</capitec-tooltip>

						<capitec-button
							class="center-button"
							label="Dispute Another Transaction"
							@click="${() => this._disputeAnotherTran()}">
						</capitec-button>

						<capitec-button
							class="center-button"
							type="primary"
							label="Done"
							@click="${() => this._doneClick()}">
						</capitec-button>
					</capitec-group>
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}

	_renderCopyToast() {
		return this.displayToast
			? html`
			<capitec-toast 
				class="copy-toast"
				type="success"
				header="Successful"
				detail="Successfully copied client notification content." 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>`
			: html``;
	}
}

customElements.define(`horizon-disputes-success`, DisputesSuccess);