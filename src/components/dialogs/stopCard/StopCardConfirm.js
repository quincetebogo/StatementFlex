import { Component, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
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
		this._telemetry = HorizonTelemetry.instance;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incidentDetails Incident details
	 * @property {Object} incomingCallDetails Incoming call information
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
			incidentDetails: { type: Object },
			incomingCallDetails: { type: Object },
			cardsToStop: { type: Array },
			cifNumber: { type: String },
			title: { type: String },
			lastName: { type: String },

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

		const returnValue = await this.cardService.stopCards(this.cardsToStop, this.incomingCallDetails, this.incidentDetails, this.cifNumber, this.title, this.lastName);
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
		this.isBusy = this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.dialogSize {
				width: 452px;
				margin-bottom: 48px;
			}

			p{
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 16px;
				/*font-weight: 600;*/
				letter-spacing: 0;
				line-height: 24px;
			}

			.bold-text{
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}

			.first-line {
				margin-top: 8px;
				margin-left:24px;
				height: 20px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			  }

			.left-margin{
				margin-top:0px;
				margin-left:24px;
			}

			.top-margin{
				margin-top:8px;
			}

			.line{
				margin: 16px 16px 16px 16px;
				width: 420px;
				border-top:1px solid #dfdfdf;
			}

			capitec-modal {
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal
				data-automation-id="stop-card-confirm-dialog"
				type="free" 
				header="Stop Card" 
				header-align="left">
				<div slot="body">
					${this._renderConfirmStopCard()}
					${this._renderLoadingIndicator()}
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			`;
	}

	_renderConfirmStopCard() {
		this.firstLine = true;
		return html`
			<capitec-group class="dialogSize" layout="vertical" gap="none">
				<p data-automation-id="stop-card-confirm-card-message" class="first-line">Are you sure you want to stop:</p>
				${this.cardsToStop.map((line, index, cards) => this._renderLine(line, index, cards))}
			</capitec-group>
		`;
	}

	_renderLine(line, index, cards) {
		const classes = this.firstLine ? `top-margin left-margin` : `left-margin`;
		this.firstLine = false;

		return html`
		<p data-automation-id="stop-card-confirm-cards" class="${classes}">${line.cardDisplayName.split(`_`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)} <span class="bold-text">${line.maskedCardNumber}</span></p>
		<p data-automation-id="stop-card-confirm-stop-reason" class="left-margin">Reason: <span class="bold-text">${line.cardStopReason.value}</span></p>
		${this._renderGreyLine(index, cards)}
		`;
	}

	_renderGreyLine(index, cards) {
		if (index < cards.length - 1) {
			return html`<div class="line"></div>`;
		}
		return html``;
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