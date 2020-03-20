import { Component, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/elements';
import { StopCardService } from '../../services/StopCardService';


export class StopCard extends Component {

	constructor() {
		super();
	}

	render() {
		return html`
			<capitec-modal type="alert" header="Stop Card">
				<div slot="body">
					<p>Are you sure you want to stop:</p>
					<p>Credit card <b>5284 **** **** 1522 </b></p>
					<p>Debit card <b>5284 **** **** 1522 </b></p>
					<br/>
					<p>Reason: 
						<b>
							<capitec-label label="Card Lost"></capitec-label>
						</b></p>
					</div>
				<hr>
				<div slot="footer">
					<capitec-button-bar>
					<capitec-button type="clear" label="Cancel"></capitec-button>
					<capitec-button  type="clear" label="Confirm"></capitec-button>
					</capitec-button-bar>
				</div>
			</capitec-modal>
		`;
	}
}
window.customElements.define(`horizon-stop-card`, StopCard);