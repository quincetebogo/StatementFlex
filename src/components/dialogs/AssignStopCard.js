import { Component, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';

import 'platform/components/inputs/Select';

export class AssignStopCard extends Component {

	constructor() {
		super();
		this.teamItems = [
			{ id: 'T1', text: 'VR12345' },
			{ id: 'T2', text: 'VR23456' },
			{ id: 'T3', text: 'VR98765' },
			{ id: 'T4', text: 'VR56478' }
		];
		this.teamOwner = { id: 'I1', text: '516283574' };
		this.ownerItems = [
			this.teamOwner,
			{ id: 'I2', text: '515283573' }
		];
		this.cards = [];
	}

	_onAssignClick() {
		// this.cardStopResults = await this._stopCards(this.cardsToStop, this.callerInfo);

		this.dispatchEvent(new CustomEvent('horizon-handoff-button', event));
	}
	static get properties() {
		return {
			teamItems: { type: Array },
			ownerItems: { type: Array },
			teamOwner: { type: Object },
			cards: { type: Array }
		}
	}

	render() {
		return html`
			<capitec-modal type="alert" header="Assign Stop Card" header-align="left">
			<div slot="body">
				${this.renderBody()}
			</div>
			<div slot="footer">
				${this.renderFooter()}
			</div>
			</capitec-modal>
			
		`;
	}
	renderBody() {
		return html`
		<p> can not be stopped due to a system error</p>

		<capitec-select 
  			label="Choose a team" 
  			.items="${this.teamItems}" 
 			display-field="text"
 			mode="inline"
 			.displayRenderer="${(e) => html`<capitec-card label="${e.id}">${e.text}</capitec-card>`}"
  			searchable>
		</capitec-select>

		<capitec-select 
  			label="Assign owner" 
  			.items="${this.ownerItems}" 
 			display-field="text"
 			mode="inline"
 			hint="This is a hint"
 			.displayRenderer="${(e) => html`<capitec-card label="${e.id}">${e.text}</capitec-card>`}"
  			searchable>
		</capitec-select>
		`;

	}

	// cardsToStop() {
	// 	console.log(`cards to display `, this.cardsToStop);
	// 	if (cardCount > 1) {
	// 		return html`
	// 			<capitec-group>

	// 			</capitec-group>
	// 	`;
	// 	}
	// 	else if (cardCount == 1) {
	// 		return html`
	// 		<capitec-group>

	// 		</capitec-group>
	// 	`;
	// 	}
	//}

	renderFooter() {
		return html`
			<capitec-button-bar>
			<capitec-button
					type="clear"
					label="Cancel"
					@click="${() => { this._onCancelClick() }}">
				</capitec-button>
				<capitec-button
					type="clear"
					label="Assign"
					@click="${() => { this._onAssignClick() }}">
				</capitec-button>
			</capitec-button-bar>
		`;
	}
}
window.customElements.define(`horizon-assign-stop-card`, AssignStopCard);