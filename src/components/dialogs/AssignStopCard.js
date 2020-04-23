import { Component, html, css } from 'platform/elements';

import 'platform/components/inputs/Select';

export class AssignStopCard extends Component {

	constructor() {
		super();

		this.team = { id: 'T1', text: 'VR12345' };
		this.teamItems = [
			this.team,
			{ id: 'T2', text: 'VR23456' },
			{ id: 'T3', text: 'VR98765' },
			{ id: 'T4', text: 'VR56478' }
		];
		this.teamOwner = { id: 'I1', text: '516283574' };
		this.ownerItems = [
			this.teamOwner
		];
		this.cards = [];
	}

	_onAssignClick() {
		// this.cardStopResults = await this._stopCards(this.cardsToStop, this.callerInfo);

		this.dispatchEvent(new CustomEvent('horizon-handoff-button', event));
	}


	static get properties() {
		return {
			team: { type: Object },
			teamItems: { type: Array },
			ownerItems: { type: Array },
			teamOwner: { type: Object },
			cards: { type: Array }
		}
	}
	static get styles() {
		return [
			super.styles,
			css`
				p{
					height: 72px;
					width: 405px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 24px;
					padding-right: 29px;
					padding-bottom: 24px;
					padding-top: 12px;
				}
				.modal-body{
					box-sizing: border-box;
					height: 320px;
					width: 458px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 2px 6px 0 rgba(0,0,0,0.15);
				}

				.select-group{
					height: 124px;
					width: 410px;
					padding-top: 24px;
					padding-left: 24px;
					padding-right:24px;
				}
				#select-team{
					height: 58px;
					width: 410px;
					padding-bottom: 18px;
				}
				#select-owner{
					height: 58px;
					width: 410px;
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
					margin-bottom: 0px;
					padding-top: 8px;
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
				.line{
					width:100%;
					margin-top:0px;
					border-top:1px solid #dfdfdf;"
				}
 
			`];
	}


	render() {
		return html`
			<capitec-modal 
				type="free" 
				header="Assign Stop Card" 
				header-align="left">
			<div slot="body">
				${this.renderBody()}
				<div class="line"></div>
				<div slot="footer" class="footer-buttons">
					${this.renderFooter()}
				</div>
			</div>
			
			</capitec-modal>
			
		`;
	}
	renderBody() {
		return html`
		<capitec-group  class="modal-body" layout="vertical" nopadding>
			<p> Credit card 5284 **** **** 1522 and <br>
				debit card 5284 **** **** 1522 can not be stopped <br>
				due to a system error. </p>

			<div class="select-group">
			
			<capitec-select 
				id="select-team"
				class="team-options"
  				label="Choose a team"
  				.items="${this.teamItems}" 
 				display-field="text"
				mode="basic"
  				searchable>
			</capitec-select>

			<capitec-select 
				id="select-owner"
  				label="Assign owner" 
  				.items="${this.ownerItems}" 
 				display-field="text"
 				mode="basic"
  				searchable>
			</capitec-select>
			</div>
		</capitec-group>
		`;

	}

	renderFooter() {
		return html`
			<capitec-button class="cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => { this._onCancelClick() }}">
				</capitec-button>
				<capitec-button class="assign-button"
					type="clear"
					label="Assign"
					@click="${() => { this._onAssignClick() }}">
				</capitec-button>
		`;
	}
}
window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);