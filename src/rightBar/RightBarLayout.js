import { Component, html } from 'platform/elements';
import { HORIZON_VIEW_SET, HorizonViewManager } from 'app/shell/HorizonViewManager';
import { HorizonStore } from 'app/store/HorizonStore';

import 'platform/components';
import 'app/rightBar/AccessChannels';
import 'app/rightBar/Insights';
import 'app/rightBar/InfoGraphic';
import 'app/rightBar/InfoGraphicShort';

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
		this.horizonViewManager = HorizonViewManager.getInstance();

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

	disconnectedCallback() {
		// Unsubscribe from store.
		this.stateChangeSub.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_stateChanged(state) {
		if (state?.callerInformation) {
			this.callerInformation = state.callerInformation;
		} else {
			this.callerInformation = null;
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
		return this.layout === `info-graphic`
			? html`
				${this._renderInfoGraphic()}`
			: html`
				<section>
					<horizon-insights
						cifNumber="${this.callerInformation?.cifNumber}">
					</horizon-insights>
					<horizon-access-channels></horizon-access-channels>
				</section>`;
	}

	_renderInfoGraphic() {
		return this.callerInformation?.verificationStatus === `unverified` && this.horizonViewManager.getCurrentView() !== HORIZON_VIEW_SET.LANDING_PAGES
		 ? html`
			<section>
				<horizon-info-graphic-short></horizon-info-graphic-short>
				<horizon-access-channels></horizon-access-channels>
			</section>`
		 : html`
		 	<horizon-info-graphic>
			</horizon-info-graphic>`;
	}
}

window.customElements.define(`horizon-right-bar-layout`, RightBarLayout);