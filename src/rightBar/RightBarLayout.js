import { Component, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';

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
		this.callerInformation = {};

		this.horizonStore = HorizonStore.getInstance();

		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			layout: { type: String },
			callerInformation: { state: true }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// N/A

	// --------------
	// EVENT HANDLERS
	// --------------

	_stateChanged(state) {
		if (state?.callerInformation) {
			this.callerInformation = state.callerInformation;
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

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
					<horizon-insights
						cifNumber="${this.callerInformation?.cifNumber}">
					</horizon-insights>
					<horizon-access-channels></horizon-access-channels>
				</section>`}`;
	}
}

window.customElements.define(`horizon-right-bar-layout`, RightBarLayout);