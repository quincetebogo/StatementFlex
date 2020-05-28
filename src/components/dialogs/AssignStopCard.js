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

		this.team = null;
		this.teamItems = [
			{ id: 'T2', text: 'VR23456' },
			{ id: 'T3', text: 'VR98765' },
			{ id: 'T4', text: 'VR56478' }
		];
		this.cards = [];
		this.errorAlert = false;
		this.errorMessage = ``;  // "Please select a team to assign";
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

		if (!this.team) {
			this.errorAlert = true;
		}
		else {
			this.dispatchEvent(new CustomEvent('on-handoff', {
				detail: {}
			}));
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
			${this.renderErrorAlertBanner()}		
			${this.cards.map((line, index, cards) => this.renderLines(line, index, cards))}
			<p id="first-line">can not be stopped due to a system error.</p>
			
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
				@click="${(e) => this._onAssignClick(e)}" >
			</capitec-button >
			`;
	}
}

window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);