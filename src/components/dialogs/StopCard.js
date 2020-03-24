import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
import '../dialogs/CardStopSummary/CardStopSummarySuccess';


const OFFERED = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'accountNumber',
}

const RENDER_MODE = {
	CARD_STOP_MODAL: 0,
	ONCONFIRMED_CARD: 1,
	ONCANCEL_CARD: 2
};

export class StopCard extends Component {

	constructor() {
		super();

		// cards = null;
		// CARD_STOP_MODAL = 0;
		this.cardNumber = "284 **** **** 1522";
		this.cardType = "Debit Card";
		this.reason = "Card Lost";
		this.confirmedCaller = null;
		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;
	}

	static get properties() {
		return {
			isBusy: { type: Boolean },
			// cards: { type: Object },
			cardStopped: { type: Object },
			renderMode: { type: Number },
			cardNumber: { type: String },
			// cardType: { type: String },
			reason: { type: String },
			confirmedCaller: { type: Object }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.stop-card{
				height: 250px;
				padding: 0px;
			}
			p{
				text-align:left;
			}
			.footer{
				width: 460px;
				align: right;
			}
			`];
	}



	async connectedCallback() {
		super.connectedCallback();

		//  this.cards = this.confirmedStop.cards;

		// this.cards = this.onCardStopped();
	}

	render() {
		return html`
			<capitec-modal type="alert" header="Stop Card">
				<div slot="body">
				<div class="stop-card">
						<p>	Are you sure you want to stop:</p>
						<p class="card-reason"> <capitec-label type="strong" label="${this.cardType}"></capitec-label>
							<capitec-label type="strong" label="${this.cardNumber}"></capitec-label></p>
						<p> Reason: <capitec-label type="strong" label="${this.reason}"></capitec-label></p>
					</div>
				</div>
				<div slot="footer">
					<capitec-button-bar class="footer">
					<capitec-button type="clear" label="Cancel"></capitec-button>
					<capitec-button type="clear" label="Confirm"
						@click="${() => { this.renderMode = RENDER_MODE.ONCONFIRMED_CARD, console.log("about to render success screen", RENDER_MODE.ONCONFIRMED_CARD) }}"
					></capitec-button>
					</capitec-button-bar>
				</div>
				${this.onRenderStopCardSuccess()}
				${this.showCardStopSuccess()}
			</capitec-modal>
		`;
	}

	showCardStopSuccess() {

		let cardStopEvent = new CustomEvent('confirmed-stop', {
			detail: { message: 'Card stop confirmed.' }
		});
		this.dispatchEvent(cardStopEvent);


		this.renderMode = RENDER_MODE.ONCONFIRMED_CARD;
	}


	onRenderStopCardSuccess() {

		if (this.renderMode === RENDER_MODE.ONCONFIRMED_CARD) {

			return html`
				<horizon-stop-card-success
				
				></horizon-stop-card-success>
			`;
		}
	}

}
window.customElements.define(`horizon-stop-card`, StopCard);