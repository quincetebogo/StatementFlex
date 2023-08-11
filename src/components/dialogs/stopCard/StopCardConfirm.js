import { Component, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

/**
 * Displays the list of cards that will be stopped and prompts for confirmation.
 *
 * @export
 * @class StopCardConfirm
 * @extends {Component}
 */
export class StopCardConfirm extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.cardsToStop = [];
		this.isBusy = false;

		this.horizonRouter = HorizonRouter.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} cardsToStop List of cards to stop
	 * @property {string} cifNumber The client's CIF number
	 * @property {string} title client's title (Mr/ Mrs)
	 * @property {string} lastName client's last name
	 * 
	 * @readonly
	 * @static
	 * @memberof StopCardConfirm
	 */
	static get properties() {
		return {
			cardsToStop: { type: Array },
			cifNumber: { type: String },
			lastName: { type: String },
			title: { 
				type: String,
				attribute: `client-title`
			},
			stopReasons: { type: Array },

			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();

		this.cardService = new CardService(
			() => this._toggleBusyFlag(),
			(ex) => this._stopCardErrorHandler(ex)
		);
	}


	// --------------
	// EVENT HANDLERS
	// --------------

	async _onConfirmClick() {
		this._telemetry.logEvent(QuickTransactionEvents.CONFIRM_STOP_CARD, {
			"screen": TelemetryScreen.STOP_CARD
		});

		await this.horizonIncidentManager.createAndClassifySubIncident(this._toggleBusyFlag);
		const currentIncident = this.horizonIncidentManager.currentIncident;
		const returnValue = await this.cardService.stopCards(this.cardsToStop, currentIncident, this.cifNumber, this.title, this.lastName);
		const cardStopResults = returnValue.result;

		if (returnValue.succeeded) {
			this.dispatchEvent(new CustomEvent(`on-confirm`, { detail: { stoppedCards: cardStopResults } }));
		}
	}

	_onCancelClick() {
		this._telemetry.logEvent(QuickTransactionEvents.CANCEL_STOP_CARD, {
			"screen": TelemetryScreen.STOP_CARD
		});

		this.dispatchEvent(new CustomEvent(`on-cancel`));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_stopCardErrorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
				}
				capitec-title-bar {
					position: absolute;
					top: -30px;
					left: -434px;
					width: 455px;
					--theme-type-default-background: rgb(249, 235, 221);
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-label-title-font-size: 18px;
					--theme-titlebar-title-margin-left: 12px;
				}
				capitec-content-box[slot="body"] {
					width: 456px;
					height: 302px;
					border-bottom: var(--theme-divider);
				}
				capitec-card {
					--theme-card-min-height: 64px;
					--theme-product-tile-hover-credit-border: 4px solid #E61414;
					padding: 14px;
					border-left: var(--theme-product-tile-hover-credit-border);
				}
				capitec-card:last-child {
					margin-bottom: 10px;
				}
				capitec-label[type="strong"] {
					--theme-label-strong-font-weight: 600;
				}
				p, ul {
					margin: 0px;
					font-family: var(--theme-label-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-label-strong-font-size, 12px);
				}
				horizon-label {
					--horizon-label-text-font-size: 13px;
					--horizon-label-text-line-height: 13px;
					--horizon-label-text-height: 14px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-height: 16px;
					--horizon-label-value-line-height: 15px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-margin-top: 4px;
				}
				capitec-button {
					--theme-button-padding-top: 10px;
					--theme-button-padding-bottom: 10px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal
				data-automation-id="stop-card-confirm-dialog"
				type="free"
				header-align="left">
					<capitec-title-bar label="Stop card(s)" icon="status/warning-trans" slot="header">
					</capitec-title-bar>
					<capitec-content-box slot="body">
						${this._renderContent()}
						${this._renderLoadingIndicator()}
					</capitec-content-box>
					<div slot="footer">
						${this._renderFooter()}
					</div>
			</capitec-modal>
			`;
	}

	_renderContent() {
		return html`
			<capitec-label type="strong" label="Are you sure you want to stop the following cards?">
			</capitec-label>
			${this._renderConfirmStopCard()}
			${this._renderDisclaimer()}
		`;
	}

	_renderConfirmStopCard() {
		return this.cardsToStop.map(card => html`
			<capitec-card>
				<capitec-group layout="grid" rows="uniform" columns="uniform">
					<horizon-label row="1" column="1"
						label="${card.cardDisplayName}"
						value="${card.maskedCardNumber}">
					</horizon-label>
					<horizon-label row="1" column="2"
						label="Reason"
						value="${this.stopReasons.find(item => item.key === card.cardStopReason).value}">
					</horizon-label>
				</capitec-group>
			</capitec-card>`);
	}

	_renderDisclaimer() {
		return html`
			<p>
				<span>
					<b>In the case of fraud or theft, probe the incident to be better equipped to take the correct actions.</b>
					If the situation requires it:
				</span>
			</p>

			<ul>
				<li>
					<capitec-label label="Stop the client's access channels"></capitec-label>
				</li>
				<li>
					<capitec-label label="Transfer the call to the Fraud Engagement Centre for the agent to recover funds"></capitec-label>
				</li>
			</ul>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
					data-automation-id="stop-card-confirm-cancel"
					type="clear" 
					label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>
			
				<capitec-button 
					data-automation-id="stop-card-confirm-confirm"
					id="id-confirm-button" 
					type="primary" 
					label="Confirm"
					@click="${() => this._onConfirmClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator data-automation-id="stop-card-confirm-loading-indicator"></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-stop-card-confirm`, StopCardConfirm);