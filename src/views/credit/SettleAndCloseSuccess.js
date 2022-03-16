import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { CREDIT_TYPE } from 'app/constants/Credit';

import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the selected account has been settle and closed successfully.
 *
 * @export
 * @class SettleAndCloseSuccess
 * @extends {ViewBase}
 */
 export class SettleAndCloseSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Hardcoded values needs to be remvoed when wiring up navigation.
		this.productType = `credit card`;
		this.creditCardNumber = `4000********0063`;
		this.creditType = CREDIT_TYPE.FIXED;

		this.primaryToast = this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account settled and closed` : `Account Closed`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

			// TODO: To be removed when wiring up navigation.
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
				data-automation-id="settle-and-close-success"
				header="${this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account has been settled and closed` : `Account has been settled`}"
				image="/images/credit/settle-and-close-account.svg"
				right="Done"
				toast="${this.primaryToast}"
				?hasSubDetails=${this.creditType === CREDIT_TYPE.FLEXIBLE}
				?subContent=${this.creditType === CREDIT_TYPE.FLEXIBLE}
				@right-click=${() => this._doneClick()}>
					${this._renderDetail()}
					${this._renderSubDetail()}
					${this._renderSubContent()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="detail">
					Your ${this.productType} account has been ${this.creditType === CREDIT_TYPE.FLEXIBLE ? `settled and closed.` : `closed.`}
			</section>
		`;
	}

	_renderSubDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="sub-detail">
					${this.productType} <strong>${this.creditCardNumber}</strong> was stopped successfully.
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
customElements.define(`horizon-settle-and-close-success`, SettleAndCloseSuccess);