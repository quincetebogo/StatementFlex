import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
import '../dialogs/CardStopSummary/CardStopSummarySuccess';
import StopCardHelper from '../../helpers/StopCardHelper';
import '../../views/ClientProfile/StopCardSuccess';
import '../../../mocks/IdentifyCallerResponseMock';

const OFFERED = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'accountNumber',
}

const RENDER_MODE = {
	CONFIRM_CARD: 0,
	ONCANCEL_CARD: 1
};

export class StopCard extends Component {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		// cards = null;
		// CARD_STOP_MODAL = 0;
		this.cardNumber = "284 **** **** 1522";
		this.cardType = "Debit Card";
		this.reason = "Card Lost";
		this.cardStopped = null;
		this.renderMode = RENDER_MODE.CONFIRM_CARD;
	}

	static get properties() {
		return {
			isBusy: { type: Boolean },
			cards: { type: Object },
			cardStopped: { type: Object },
			renderMode: { type: Number },
			cardNumber: { type: String },
			// cardType: { type: String },
			reason: { type: String },
			confirmedCaller: { type: Object },
			toggleSummarySuccessScreen: { type: Boolean }
		}
	}

	//
	//EVENT HANDLERS
	//
	onValueChanged(e) {
		if (e.detail.new) {
			this.cards = e.detail.selected
		};
	}
	onCardelected() {
		this.dispatchEvent(new CustomEvent('on-card-stop', { detail: { cards: this.cards } }));
	}
	static get styles() {
		return [
			super.styles,
			css`
			.stop-card{
				height: 160px;
				width: 396px;
				padding:0px 0px 0px 0px;
			 }
			 .footer{
				 height: 64px;
				 width: 468px;
				 padding:0px 0px 0px 0px;
				 border-top: solid 1px #dfdfdf;
			 }		
			p{
				text-align:left;
			}
			`];
	}



	async connectedCallback() {
		super.connectedCallback();
		document.addEventListener('confirmed-stop', this.handleChange);
		// Short hand references for reaching into the incoming data model
		// this.cardNumber = this.cardStopped.${"this.cardNumber"};
		// this.cardType = this.cardStopped.this.cardType;
		// this.reason = this.cardStopped.this.reason;
		//  this.cards = this.confirmedStop.cards;

		// this.cards = this.onCardStopped();
	}

	renderConfirmStopCard() {
		return html`
				<div class="stop-card">
						<p>	Are you sure you want to stop:</p>
						<p class="card-reason"> 
						<capitec-label type="strong"
						label="${this.cardType}">
						</capitec-label>
							<capitec-label type="strong" label="${this.cardNumber}"></capitec-label></p>
						<p> Reason: <capitec-label type="strong" label="${this.reason}"></capitec-label></p>
					</div>
				</div>
		`;
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.CONFIRM_CARD:
				return html`
				<capitec-modal
						type="alert"
						header="Stop Card"
						header-align="left">
					<div slot="body">
						${this.renderConfirmStopCard()} 
					</div>
					<div slot="footer">
						${this.renderFooter()}
					<div> 
				</capitec-modal>
			`;

		}
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					type="clear"
					label="Cancel"
					@click="${() => this.renderMode = RENDER_MODE.ONCANCEL_CARD}">
				</capitec-button>

				<capitec-button
					id="id-confirm-button"
					type="clear"
					label="Confirm"
					@click="${(e) => { this.onConfirmClick(); console.log(this.selectedCardCount.toString(), 'card') }}">
				</capitec-button>
			</capitec-group>			
			`;
	}

	onConfirmClick(e) {
		this.renderMode = RENDER_MODE.ONCONFIRMED_CARD;

		let cardStopped = {
			cardNumber: this.cardNumber,
			cardType: this.cardType,
			reason: this.reason
		};

		let identifyStopCardPromise =
			this.dispatchEvent(new CustomEvent('confirmed-stop', this.handleChange));

	}
	handleChange() {
		console.log('rendering stop card screen');
		return html`
		<!-- <horizon-stop-card-success ></horizon-stop-card-success> -->
		<horizon-summary-success></horizon-summary-success>
		`;
	}

}
window.customElements.define(`horizon-stop-card`, StopCard);