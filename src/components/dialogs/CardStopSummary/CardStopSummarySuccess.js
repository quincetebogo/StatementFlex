import { Component, html, css } from 'platform/elements';


export class CardStopSummarySuccess extends Component {


	render() {
		return html`
			<capitec-card>
			<capitec-title-bar label="Stop Card"></capitec-title-bar>
			<capitec-group class="" layout="absolute">
						<div></div>
						<div>
							
						</div>
					</capitec-group>
			</capitec-card>
		`;
	}
}
window.customElements.define(`horizon-stop-card-success`, StopCard);