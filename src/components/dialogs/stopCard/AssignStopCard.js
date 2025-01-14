import { Component, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'platform/components/inputs/Select';
import 'platform/components/popups/AlertBanner';

/**
 * The Assign Stop Card dialog is used to assign a task to handle the failure
 * to stop a card to a team.

 * @export
 * @class AssignStopCard
 * @extends {Component}
 */
export class AssignStopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.cards = [];

		this.team = null;
		this.teamsResponse = null;

		this.errorAlert = false;
		this.errorMessage = ``; // "Please select a team to assign";

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._assignErrorHandler(ex));

		this.isBusy = false;
		this.success = true;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			cards: { type: Array },
			teamsResponse: { type: Object },
			isBusy: { type: Boolean },
			team: { type: Object },
			errorAlert: { type: Boolean },
			errorMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `Assign Stop Card Dialog`);
		this._telemetry.startSpan(QuickTransactionEvents.STOP_CARD_ASSIGN, {
			"screen": TelemetryScreen.ASSIGN_STOP_CARD
		});

		const cardsAndIncident = {
			cardIds: this.cards.map(card => card.cardNumber),
			incident: this.horizonIncidentManager.currentIncident
		};

		this.cardService.assignTeams(cardsAndIncident)
			.then((returnValue) => {
				if (returnValue.succeeded) {
					this.teamsResponse = returnValue.result;
					this.teamItems = this.teamsResponse.teams.possibleValues;
				}
			});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._telemetry.endSpan(QuickTransactionEvents.STOP_CARD_ASSIGN, {
			"screen": TelemetryScreen.ASSIGN_STOP_CARD
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onAssignClick(e) {
		if (!this.team) {
			this.errorAlert = true;
		} else {
			this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_ASSIGN_CONFIRM, {
				"screen": TelemetryScreen.ASSIGN_STOP_CARD,
				"next-screen": TelemetryScreen.FAVOURITES,
				"team": this.team
			});

			const assignRequest =
			{
				"cardIds": this.cards.map(card => card.cardNumber),
				"incident": this.horizonIncidentManager.currentIncident,
				"team": this.team.value
			};

			const returnValue = await this.cardService.assign(assignRequest);

			if (returnValue.succeeded) {
				this.horizonIncidentManager.incidentAssigned();
				this.dispatchEvent(new CustomEvent(`on-handoff`, {
					detail: {}
				}));
			};
		}
	}

	_onTeamSelected(e) {
		this.errorAlert = false;
		this.team = e.detail.new;
	}

	_onCancelClick() {
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_ASSIGN_CANCEL, {
			"screen": TelemetryScreen.ASSIGN_STOP_CARD
		});

		this.dispatchEvent(new CustomEvent(`on-cancel`));
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	// // ----------
	// PRIVATE METHODS
	// ----------

	_assignErrorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------
	/*
	dialog width 504px
	select components 472px with 16px margin
	*/
	static get styles() {
		return [
			super.styles,
			css`
				.modal-body{
					box-sizing: border-box;
					height: 422px;
					width: 504px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 2px 6px 0 rgba(0,0,0,0.15);
					z-index: 100;
					border-bottom-style:none
				}

				.team-options{
					margin-top:24px;
					height: 49px;
					width: 472px;
					margin-left: 16px;
				}

				.footer-buttons{
					height: 56px;
					width: 458px;
					// border-top-style:none
				}

				.assign-button{
					height: 40px;
					width: 94px;
					// align: right;
				}

				.cancel-button{
					margin-left: 261px;
					height: 40px;
					width: 95px;
				}

				.failed-cards{
					margin-left:16px;
					margin-bottom:0px;
					width: 472px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
				}

				.bold-text{
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					font-weight: 600;
				}
				
				#first-line{
					margin-left:16px;
					margin-bottom:0px;
					margin-top: 0px;
					width: 472px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
				}

				.alert-banner{
					height: 48px;
					width: 472px;
					padding-left: 16px;
					padding-right:16px;
					margin-top: 16px; 
					--theme-alert-banner-unsuccessful-red-border: none;
				}

				capitec-modal{
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		if (this.teamsResponse === null) {
			return html``;
		}

		return html`
			<capitec-modal 
				type="free" 
				header="Assign Stop Card" 
				header-align="left"
				data-automation-id="assign-stop-card-dialog">
					<div slot="body">
						${this.renderBody()}
					</div>
					<div slot="footer" class="footer-buttons">
						${this.renderFooter()}
					</div>
			</capitec-modal>
		`;
	}

	renderBody() {
		return html`
		<capitec-group  class="modal-body" layout="vertical" nopadding>
			${this.renderErrorAlertBanner()}
			${this.cards.map((line, index, cards) => this.renderLines(line, index, cards))}
			<p id="first-line">can not be stopped due to a system error.</p>
			
			<capitec-select 
				id="select-team"
				data-automation-id="assign-stop-card-select-team"
				class="team-options"
  				label="Choose a team (Required)"
				.items="${this.teamItems}" 
				error="${this.errorMessage}"
				id-field="key"
 				display-field="value"
				@value-change="${(e) => this._onTeamSelected(e)}"
				mode="basic"
  				searchable>
			</capitec-select>

			${this.renderLoadingIndicator()}
		</capitec-group>
		`;
	}

	renderLines(line, index, cards) {
		console.log(`failed cards to hand off`, cards);

		// if even number begining of line
		if (index / 2 === 0 && index + 1 < cards.length) {
			return html`<p 
							class="failed-cards"
							data-automation-id="assign-stop-card-failed-cards">
								${cards[index].cardDisplayName} <span class="bold-text">${cards[index].maskedCardNumber}</span> and ${cards[index + 1].cardDisplayName} <span class="bold-text">${cards[index + 1].maskedCardNumber}</span>
						</p>`;
		} else if (index / 2 === 0 && index + 1 >= cards.length) {
			// If odd number, second on line
			return html`<p 
							class="failed-cards"
							data-automation-id="assign-stop-card-failed-cards">
								${cards[index].cardDisplayName} <span class="bold-text">${cards[index].maskedCardNumber}</span>
						</p>`;
		}
	}

	renderErrorAlertBanner() {
		if (this.errorAlert) {
			return html`
				<horizon-alert-banner
					class="alert-banner"
					type="error"
					data-automation-id="assign-stop-card-error-banner"
					label="Select an team to Assign"
					closable
					style="width: 100%;">
				</horizon-alert-banner>
			`;
		}

		return html``;
	}

	renderFooter() {
		return html`
			<capitec-button class="cancel-button"
				data-automation-id="assign-stop-card-error-cancel"
				type = "clear"
				label = "Cancel"
				@click="${() => this._onCancelClick()}" >
			</capitec-button >
			<capitec-button class="assign-button"
				data-automation-id="assign-stop-card-error-assign"
				type="primary"
				label="Assign"
				@click="${(e) => this._onAssignClick(e)}" >
			</capitec-button >
			`;
	}

	renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="assing-stop-card-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);