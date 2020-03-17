import { Component, html, css } from 'platform/elements';


export class StopCard extends Component {


	render() {
		return html`
			<capitec-modal type="result" result="info" header="Stop Card">
				<div slot="body">
					<p>Are you sure you want to stop:</p>
					<p>Credit card <b>5284 **** **** 1522 </b></p>
					<p>Debit card <b>5284 **** **** 1522 </b></p>
					<br/>
					<p>Reason: <b>Card lost</b></p>
					</div>
			
			</capitec-modal>
		`;
	}
}
window.customElements.define(`horizon-stop-card`, StopCard);