import { Component, css, html } from 'platform/elements';

class EstimateCalculatorResults extends Component {

	constructor() {
		super();
	}

	static get properties() {
		return {
			viewType: { type: String }
		};
	}

	_webTemplate() {
		return html`
			<div class="calc-summary-card">
				<!-- Top -->
				<div>
					<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="Total estimated monthly premium"></capitec-label>
					<capitec-label label="123" class="calc-premium-total">
					</capitec-label>
					<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
					<hr>
		
					<!-- Life List -->	
					<div class="calc-life-list">
						<capitec-label label="123"></capitec-label>
						<capitec-label label="123"></capitec-label>
					</div>
					<hr>
					<div class="calc-life-list">
						<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
						<capitec-label label="123" class="stronger"></capitec-label>
					</div>
				</div>
			
				<!-- Bottom -->
				<div>
					<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
					<br>
					<capitec-text-field label="Premium Amount" type="numeric-input">
					</capitec-text-field>
				</div>
			</div>
		`;
	}
}
window.customElements.define(`horizon-insure-estimate-calc-results`, EstimateCalculatorResults);