import { Component, html, css } from 'platform/elements';
import 'platform/elements';

export class StopCard extends Component {

	constructor() {
		super();

		this.cardsToStop = {};
	}

	static get properties() {
		return {
			cardsToStop: { type: Object }
		}
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
			`];
	}


	render() {
		return html`
			<capitec-modal type="alert" header="Stop Card">
				<div slot="body" class="stop-card">
					<p>Are you sure you want to stop:</p>
					<p>Credit card <b>5284 **** **** 1522 </b></p>
					<br>
					<p>Reason: <b>Card Lost</b></p>
				</div>	
				<div slot="footer" >
				<div class="footer">
					<capitec-button type="clear" label="Cancel"></capitec-button>
					<capitec-button  type="clear" label="Confirm"></capitec-button>
				</div>
				</div>
			</capitec-modal>
		`;
	}
}
window.customElements.define(`horizon-stop-card`, StopCard);