/**
 * The Assign Stop Card dialog is used to assign a task to handle the failure
 * to stop a card to a team.
 */
import { Component, html, css } from 'platform/elements';

import 'platform/components/inputs/Select';
import 'platform/components/popups/AlertBanner';
import { EventAggregator } from 'platform/EventAggregator';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';

import '../../views/stopCard/StopCardFailure';
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
		this.errorMessage = ``;  // "Please select a team to assign";


		this.eventAggregator = EventAggregator.getInstance();

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.isBusy = false;
		this.success = true;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			callerInfo: { type: Object },
			cards: { type: Array },
			teamsResponse: { type: Object },
			isBusy: { type: Boolean },
			team: { type: Object },
			errorAlert: { type: Boolean },
			errorMessage: { type: String }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		let cardsAndIncident = {
			cardIds: this.cards.map(card => card.cardId),
			incidentRecId: this.callerInfo.incidentRecId
		}

		this.serviceCallHelper.call(
			this.stopCardService.assignTeams(cardsAndIncident),
			(teams) => {
				this.teamsResponse = teams;
				this.teamItems = this.teamsResponse.teams.possibleValues;
			});
	}


	// --------------
	// EVENT HANDLERS
	// --------------	

	async _onAssignClick(e) {
		if (!this.team) {
			this.errorAlert = true;
		}
		else {

			let assignRequest =
			{
				"cardIds": this.cards.map(card => card.cardId),
				"incidentRecId": this.callerInfo.incidentRecId,
				"team": this.team.value
			};

			this.success = true;
			await this.serviceCallHelper.asyncCall(this.stopCardService.assign(assignRequest), (ex) => this._assignErrorHandler(ex));

			if (this.success) {
				this.dispatchEvent(new CustomEvent('on-handoff', {
					detail: {}
				}));
			}
		}
	}

	_onTeamSelected(e) {
		this.errorAlert = false;
		this.team = e.detail.new;
	}

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent('on-cancel'));
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	// // ----------
	// PRIVATE METHODS
	// ----------

	_assignErrorHandler(exception) {
		try {
			this.error = 'Failed to assign card';

			if (exception instanceof TypeError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `assign: ${exception.message}`
				}
				this.error = exception.message;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else if (exception instanceof HttpStatusError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `assign: ${exception.status} - ${exception.message}`
				}
				this.error = `${exception.status}: ${exception.message}`;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `assign: UNEXPECTED ERROR - ${exception.message}`
				}
				this.error = exception.message;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		}
		finally {
			this.success = false;
		}

		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
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
			`];
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
				header-align="left">
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
				class="team-options"
  				label="Choose a team (Required)"
				.items="${this.teamItems}" 
				error="${this.errorMessage}"
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
			return html`<p class="failed-cards">${cards[index].cardType} <span class="bold-text">${cards[index].encryptedCardId}</span> and ${cards[index + 1].cardType} <span class="bold-text">${cards[index + 1].encryptedCardId}</span></p>`;
		}
		else if (index / 2 == 0 && index + 1 >= cards.length) {
			// If odd number, second on line
			return html`<p class="failed-cards">${cards[index].cardType} <span class="bold-text">${cards[index].encryptedCardId}</span></p>`;
		}
	}

	renderErrorAlertBanner() {
		if (this.errorAlert) {
			return html`
				<capitec-alert-banner class="alert-banner" type = "unsuccessful-red"
					label = "Select an team to Assign"
					closable
					style = "width: 100%;">
				</capitec-alert-banner>
			`;
		}
		else {
			return html``;
		}
	}

	renderFooter() {
		return html`
			<capitec-button class="cancel-button"
				type = "clear"
				label = "Cancel"
				@click="${() => this._onCancelClick()}" >
			</capitec-button >
			<capitec-button class="assign-button"
				type="primary"
				label="Assign"
				@click="${async (e) => this._onAssignClick(e)}" >
			</capitec-button >
			`;
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}
}

window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);