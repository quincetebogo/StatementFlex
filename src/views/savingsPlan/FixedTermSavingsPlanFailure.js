import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

export class FixedTermSavingsPlanFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Remove the hardcoded values when wiring up the navigation.
		this.amount = formatCurrency(`7500`);
		this.partialUnlock = true;
		this.accountName = `My dream car`;

		this.endCallContext = `QuickTransactionsUnSuccess`;
	}

	// --------------
	// PROPERTIES
	// --------------

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
		// TODO: Navigation needs to be wired up.
	}

	_tryAgain() {
		// TODO: Navigation needs to be wired up.
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
			css`
				horizon-error-screen {
					--horizon-error-screen-height: 744px;
				}
				#id-error-msg {
					width: auto;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFixedTermFailureScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFixedTermFailureScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="fixed-term-savings-plan-failure-screen"
				image="/images/savings/UnlockSavings.svg"
				header="${this.partialUnlock ? `Partial` : `Full`} fixed-term unlock unsuccessful"
				left="Done"
				right="Try Again"
				toast="${this.partialUnlock ? `Partial` : `Full`} Fixed-term unlock unsuccessful"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgain()}>
					<section id="id-error-msg" slot="detail">
					${this.partialUnlock
							? `${this.amount} Partial transfer from ${this.accountName} to Main savings account was unsuccessful.`
							: `Fixed-term savings plan for ${this.accountName} has not been unlocked.`}
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="fixed-term-savings-plan-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-fixed-term-savings-plan-failure`, FixedTermSavingsPlanFailure);