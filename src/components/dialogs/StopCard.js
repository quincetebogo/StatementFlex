import { Component, html, css } from 'platform/elements';

import 'platform/elements';

export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.cardsToStop = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			cardsToStop: { type: Array },
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	connectedCallback() {
		super.connectedCallback();

		console.log('cards to stop', this.cardsToStop);
	}


	// --------------
	// EVENT HANDLERS
	// --------------	
	_onConfirmClick() {
		console.log(`cards to stop`, this.cardsToStop);

		/* card stop web service calls go here */

		// TODO: Replace this.cardsToStop with list of stopped cards
		this.dispatchEvent(new CustomEvent('confirmed-stop', { detail: { stoppedCards: this.cardsToStop } }));
	}

	_onCancelClick() {

		this.dispatchEvent(new CustomEvent('confirmed-cancel'));
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			/*
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
			 */

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

			.left-margin{
				margin-left:24px;
			}

			.top-margin{
				margin-top:0px;
			}

			.line{
				width:100%;
				margin-top:30px;
				border-top:1px solid #dfdfdf;"
			}

			`];
	}

	render() {
		return html`
			<capitec-modal
				type="free"
				header="Stop Card"
				header-align="left">
				<div slot="body">
					${this.renderConfirmStopCard()} 
					<div class="line"></div>
				</div>
				<div slot="footer">
					${this.renderFooter()}
				<div> 
			</capitec-modal>
			`;
	}

	renderConfirmStopCard() {
		this.firstLine = true;
		return html`
		<capitec-group style="width:396px;" layout="vertical" gap="none">		
				<p class="left-margin">Are you sure you want to stop:</p>
				${this.cardsToStop.map(line => { return this.renderLine(line) })}
		<apitec-group>
		`;
	}

	renderLine(line) {
		let classes = this.firstLine ? 'top-margin left-margin' : 'left-margin'
		this.firstLine = false;

		return html`
		<p class="${classes}">${line.cardType} <span class="bold-text">${line.accountNumber}</span></p>
		<p class="left-margin">Reason: <span class="bold-text">${line.reason}</span></p>
		`;
	}

	renderFooter(event) {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					type="clear"
					label="Cancel"
					@click="${() => { this._onCancelClick() }}">
				</capitec-button>

				<capitec-button
					id="id-confirm-button"
					type="clear"
					label="Confirm"
					@click="${() => { this._onConfirmClick() }}">
				</capitec-button>
			</capitec-group>			
			`;
	}
}

window.customElements.define(`horizon-stop-card`, StopCard);