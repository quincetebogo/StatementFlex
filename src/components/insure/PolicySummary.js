import { Component, css, html } from 'platform/elements';

class PolicySummary extends Component {
	constructor() {
		super();
	}

	static get properties() {
		return {

		};
	}

	/**
	 * Main render point for component
	 * @returns {html}
	 */
	_webTemplate() {
		return html`
asd
			`;
	}
}
window.customElements.define(`horizon-insure-policy-summary`, PolicySummary);