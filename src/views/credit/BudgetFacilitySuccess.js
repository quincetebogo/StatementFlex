import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { CREDIT_TYPE } from 'app/constants/Credit';

import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the budget facility for the selected account has been paid successfully.
 *
 * @export
 * @class BudgetFacilitySuccess
 * @extends {ViewBase}
 */
 export class BudgetFacilitySuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Hardcoded values needs to be remvoed when wiring up navigation.
		this.accountName = `Shoprite Pelican Park Grassy Park ZA`
		this.productType = `credit card`;
		this.creditCardNumber = `4000********0063`;
		this.creditType = CREDIT_TYPE.FIXED;

		this.primaryToast = `Budget facility paid`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

			// TODO: To be removed when wiring up navigation.
			accountName: { type: String },
			creditType: { type: String },
			productType: { type: String }
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

	_sendEmailConfirmationClick() {
		// TODO: Navigation to Send email confirmation modal should come here
	}

	_doneClick() {
		this.horizonRouter.navigateToCreditAccount();
	}

	_payAnotherClick() {

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
				horizon-success-screen {
					--theme-slot-detail-width: auto;
				}
				.success-msg {
					width: auto;
				}
				span {
					cursor: pointer;
					color: #009DE0;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSuccessScreen()}
			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="budget-facility-success-screen"
				header="Budget facility paid"
				image="/images/credit/budget-facility.svg"
				left="Pay Another"
				right="Done"
				toast="${this.primaryToast}"
				?subContent=${true}
				@left-click=${() => this._payAnotherClick()}
				@right-click=${() => this._doneClick()}>
					${this._renderDetail()}
					${this._renderSubContent()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="detail">
					Budget facility for <strong>${this.accountName}</strong> has been paid.
			</section>
		`;
	}

	_renderSubContent() {
		return html`
			<section slot="sub-content">
				Would you like proof of payment? 
				<span @click="${() => this._sendEmailConfirmationClick()}">Send Email Confirmation</span>
			</section>
		`;
	}

}
customElements.define(`horizon-budget-facility-success`, BudgetFacilitySuccess);