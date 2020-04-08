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

		// dispatch event - the caller of the dialog does the transitioning to the success/failure screens
		this.dispatchEvent(new CustomEvent('confirmed-stop', { /* success/failure information goes here */ }));
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
			`];
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

	render() {
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

	renderConfirmStopCard() {
		return html`
			<div class="stop-card">
				<p>Are you sure you want to stop:</p>
				${this.cardsToStop.map(line => { return this.renderLine(line) })}
			</div>
		`;
	}

	renderLine(line) {
		return html`
		<p>${line.cardType} <span>${line.accountNumber}</span></p>
		<p>Reason: <span>${line.reason}</span></p>
		`;
	}

	renderFooter() {
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