import { Component, html, css } from 'platform/elements';
import 'platform/components/data/Table';

export class CardStopSummarySuccess extends Component {


	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.card-stopped{
				width: 100%;
				height: 823px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
			}
			`];
	}


	render() {
		return html`
			<capitec-card>
				<capitec-title-bar label="Stop Card"></capitec-title-bar>
				<capitec-group class="card-stopped" layout="absolute">
						<div></div>
						<div>
							<capitec-label type="subtitle" label="Card Stopped"></capitec-label>
						</div>
						<div>
						<p>	Debit card <capitec-label type="default" label="5284 **** **** 1522"></capitec-label> was stopped successfully.
							Remind the client that they will need to visit a branch for a new card.
						</p>
						</div>
						<div>
			
						</div>
				</capitec-group>
			</capitec-card>
		`;
	}
}
window.customElements.define(`horizon-stop-card-success`, CardStopSummarySuccess);