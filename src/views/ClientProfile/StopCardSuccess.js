import { View, html, css } from 'platform/elements';
import { HorizonViewManager } from '../../HorizonViewManager';

export class StopCardSuccess extends View {

	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
	}


	render() {
		return html`Hello world!`;
	}
}

customElements.define(`horizon-summary-success`, StopCardSuccess);
