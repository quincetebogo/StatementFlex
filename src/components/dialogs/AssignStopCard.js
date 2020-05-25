import { Component, html, css } from 'platform/elements';

import 'platform/components/inputs/Select';
import 'platform/components/popups/AlertBanner';
import '../../views/ClientProfile/StopCardFailure';
export class AssignStopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.team = {};
		this.teamItems = [
			this.team,
			{ id: 'T2', text: 'VR23456' },
			{ id: 'T3', text: 'VR98765' },
			{ id: 'T4', text: 'VR56478' }
		];
		this.cards = [];
		this.errorAlert = false;
		this.errorMessage = "Please select a team to assign";
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			team: { type: Object },
			teamItems: { type: Array },
			ownerItems: { type: Array },
			teamOwner: { type: Object },
			cards: { type: Array },
			errorAlert: { type: Boolean },
			errorMessage: { type: String }
		}
	}



	// --------------
	// EVENT HANDLERS
	// --------------	

	_onAssignClick(e) {
		this.dispatchEvent(new CustomEvent('on-handoff', event));
		if (!this.inputValidation()) {
			console.log("Call service for error handling");

			let assignTask = {
				//To do: call stop card service for error handling
			};

		}
	}
	_onTeamSelected(e) {
		this.team = e.detail.new;
	}
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent('on-cancel'));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	_showErrorAlert(teamItems, errorAlert) {
		if (!teamItems) {
			errorAlert = true;
		}
	}
	// // ----------
	// PRIVATE METHODS
	// ----------


	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				p{
					height: 88px;
					width: 100%;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 24px;
					padding-right: 29px;
					padding-bottom: 0px;
					padding-top: 12px;
				}
				.modal-body{
					box-sizing: border-box;
					height: 422px;
					width: 100%;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 2px 6px 0 rgba(0,0,0,0.15);
					z-index: 100;
					border-bottom-style:none
				}

				.select-group{
					height: 200px;
					width: 100%;
					padding-top: 24px;
					padding-left: 24px;
					padding-right:24px;
				}
				#select-team{
					height: 58px;
					width: 472px;
					padding-bottom: 18px;
				}
				#select-owner{
					height: 58px;
					width: 472px;
					padding-top: 8px;
					padding-bottom: 18px;
				}
				.team-options{
					height: 23px;
					width: 96px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 23px;
					text-align: justify;

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
					padding: 0px 0px 0px 0px;
					width: 100%;
					line-height: 30px;
					margin: 0px 0px 0px 0px;
					height: 30px;
					margin-left: 24px;
					margin-top: 24px;
				}
				#first-line{
					width: 100%;
					margin: 0px 0px 0px 24px;
					padding: 0px 0px 0px 0px;
				}
				p{
					height: 48px;
				}
				.alert-banner{
					height: 48px;
					width: 472px;
					padding-left: 16px;
					padding-right:16px;
					margin-top: 16px; 
				}
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
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
				<!-- show the banner  here -->
				${this.renderErrorAlertBanner()}
				${this.cards.map((line, index, cards) => this.renderLines(line, index, cards))}
				<p id="first-line">can not be stopped due to a system error.</p>
			<div class="select-group">
			
			<capitec-select 
				id="select-team"
				class="team-options"
  				label="Choose a team (Required)"
				.items="${this.teamItems}" 
				error="${this.errorMessage}"
 				display-field="text"
				@value-change="${(e) => this._onTeamSelected(e)}"
				mode="basic"
  				searchable>
			</capitec-select>
			</div>
		</capitec-group>
		`;
	}

	renderLines(line, index, cards) {
		console.log(`failed cards to hand off`, cards);

		// if even number begining of line
		if (index / 2 === 0 && index + 1 < cards.length) {
			return html`<p class="failed-cards">${cards[index].cardType} ${cards[index].encryptedCardId} and ${cards[index + 1].cardType} ${cards[index + 1].encryptedCardId} </p>`;
		}
		else if (index / 2 == 0 && index + 1 >= cards.length) {
			// If odd number, second on line
			return html`<p calss="failed-cards">${cards[index].cardType} ${cards[index].encryptedCardId} </p>`;
		}
	}
	renderErrorAlertBanner() {
		if (this.team == {}) {
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
				@click="${() => { this._onCancelClick() }}" >
			</capitec-button >
			<capitec-button class="assign-button"
				type="primary"
				label="Assign"
				@click="${(e) => { this._onAssignClick(e), this._showErrorAlert() }}" >
			</capitec-button >
			`;
	}
}
window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);