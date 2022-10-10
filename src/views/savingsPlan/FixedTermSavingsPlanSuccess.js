import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/SuccessScreen';

export class FixedTermSavingsPlanSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Remove the hardcoded values when wiring up the navigation.
		this.amount = formatCurrency(`7500`);
		this.partialUnlock = false;
		this.accountName = `My dream car`;

		this.endCallContext = `QuickTransactionSuccess`;
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
				#id-success-msg {
					width: auto;
					height: auto;
				}

				horizon-success-screen {
					--horizon-button-group-margin-top: 28px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFixedTermSavingsPlanSuccess()}

			${super._webTemplate()}
		`;
	}

	_renderFixedTermSavingsPlanSuccess() {
		return html`
			<horizon-success-screen 
				data-automation-id="fixed-term-savings-plan-success-screen"
				header="${this.partialUnlock ? `Partial` : `Full`} Fixed-term unlocked"
				image="/images/savings/UnlockSavings.svg"
				right="Done"
				toast="${this.partialUnlock ? `Partial` : `Full`} Fixed-term unlocked"
				@right-click=${() => this._doneClick()}>
					<section id="id-success-msg" slot="detail">
						${this.partialUnlock
							? `${this.amount} Partial transfer from ${this.accountName} has been transfered to Main savings account.`
							: `Fixed-term savings plan for ${this.accountName} has been unlocked.`}
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-fixed-term-savings-plan-success`, FixedTermSavingsPlanSuccess);