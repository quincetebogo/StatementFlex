import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { CREDIT_TYPE } from 'app/constants/Credit';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation screen indicating the budget facility for the selected account was not successful.
 *
 * @export
 * @class BudgetFacilityFailure
 * @extends {ViewBase}
 */
 export class BudgetFacilityFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Hardcoded values needs to be remvoed when wiring up navigation.
		this.budgetName = `Shoprite Pelican Park Grassy Park ZA`;

		this.primaryToast = `Budget facility was not paid`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

			// TODO: To be removed when wiring up navigation.
			budgetName: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// TODO: Navigation to be wired up here.
	}

	_tryAgainClick() {
		// TODO: Navigation to be wired up here.
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css``
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFailureScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFailureScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="budget-facility-failure-screen"
				header="Budget facility was not paid"
				image="/images/credit/budget-facility.svg"
				left="Done"
				right="Try Again"
				toast="${this.primaryToast}"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgainClick()}>
					${this._renderDetail()}
			</horizon-error-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				slot="detail">
				Budget facility for <strong>${this.budgetName}</strong> was not paid.
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="budget-facility-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-budget-facility-failure`, BudgetFacilityFailure);