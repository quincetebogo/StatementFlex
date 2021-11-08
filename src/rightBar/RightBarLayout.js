import { Component, html } from 'platform/elements';

import 'platform/components';
import 'app/rightBar/AccessChannels';
import 'app/rightBar/Insights';
import 'app/rightBar/InfoGraphic';

/**
 * Layout selector component for the right hand bar in the Horizon User Interface
 */
export class RightBarLayout extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.layout = `info-graphic`;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			layout: { type: String }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------


	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`${this.layout === `info-graphic`
			? html`
				<horizon-info-graphic>
				</horizon-info-graphic>`
			: html`
				<section>
					<horizon-insights></horizon-insights>
					<horizon-access-channels></horizon-access-channels>
				</section>`}`;
	}
}

window.customElements.define(`horizon-right-bar-layout`, RightBarLayout);