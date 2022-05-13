import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { CREDIT_TYPE } from 'app/constants/Credit';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the selected account was not settled and closed successfully.
 *
 * @export
 * @class SettleAndCloseFailure
 * @extends {ViewBase}
 */
 export class SettleAndCloseFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Hardcoded values needs to be remvoed when wiring up navigation.
		this.productType = `credit card`;
		this.creditType = CREDIT_TYPE.FLEXIBLE;

		this.primaryToast = this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account was not settled and closed` : `Account was not closed`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

			// TODO: To be removed when wiring up navigation.
			creditType: { type: String },
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
		this.horizonRouter.navigateToQuickTransactionFavourites();
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
				data-automation-id="settle-and-close-failure-screen"
				header="${this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account was not settled and closed` : `Account was not closed`}"
				image="/images/credit/settle-and-close-account.svg"
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
					Your ${this.productType} account was not ${this.creditType === CREDIT_TYPE.FLEXIBLE ? `settled and closed.` : `closed`}
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="settle-and-close-failure-related-options"
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS}">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-settle-and-close-failure`, SettleAndCloseFailure);