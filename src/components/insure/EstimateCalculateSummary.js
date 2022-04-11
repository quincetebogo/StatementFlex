import { Component, css, html } from 'platform/elements';

class EstimateCalculateSummary extends Component {

	constructor() {
		super();

		this.lifeList = [{
			display: "Test Display",
			amount: "100"
		}];

		this.totalPremium = 999;
	}

	static get properties() {
		return {
			totalPremium: { type: String }
		};
	}

	/**
	 * Total premium change event
	 */
	_totalPremiumChanged(e) {
		console.log(e);
	}

	static get styles() {
		return [
			super.styles,
			css`
			.calc-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.calc-premium-total{
				font-size: 32px;
				font-weight: 600;
				color: #3A3A3A;
			}

			.calc-life-list{
				display: flex; 
				justify-content: space-between;
			}`
		];
	}

	_webTemplate() {
		return html`
			<div class="calc-summary-card">
				<div>
					<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="Total estimated monthly premium"></capitec-label>
					<capitec-label label="123" class="calc-premium-total">
					</capitec-label>
					<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
					<hr>
			
					${this.lifeList.map(life => html`
					<div class="calc-life-list">
						<capitec-label label="${life.display}"></capitec-label>
						<capitec-label label="${life.amount}"></capitec-label>
					</div>
					<hr>`)}
			
					<div class="calc-life-list">
						<capitec-label label="Total Premium Amount" class="stronger"></capitec-label>
						<capitec-label label="${this.totalPremium}" class="stronger"></capitec-label>
					</div>
				</div>
			
				<div>
					<capitec-label label="Specify a premium you are willing to pay" class="stronger"></capitec-label>
					<br>
					<capitec-text-field @value-change="${(e) => this._totalPremiumChanged(e)}" .value="${this.totalPremium}" label="Premium Amount"
						type="currency">
					</capitec-text-field>
				</div>
			</div>
		`;
	}
}
window.customElements.define(`horizon-insure-estimate-calc-summary`, EstimateCalculateSummary);