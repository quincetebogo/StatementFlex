import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the card disputes is successful.
 *
 * @export
 * @class DisputesSuccess
 * @extends {ViewBase}
 */
export class DisputesSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.tranDescription = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this.tranDescription = screenDetails.transDesc;
		this.disputed = screenDetails.disputed;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToSavingsAccount();
	}

	_disputeAnotherTran() {
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-success-screen {
					--horizon-button-group-margin-top: 24px;
					--horizon-success-screen-margin-top: 12px;
				}
				#id-error-msg {
					width: auto;
				}
				.button-margin {
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
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
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return this.disputed
		? html`${this._renderDisputed()}`
		: html`${this._renderCannotBeDisputed()}`;
	}

	_renderDisputed() {
		return html`
			<horizon-success-screen 
				header="Dispute successfully logged"
				image="platform/illustrations/cards.svg"
				left="Dispute Another Transaction"
				right="Done"
				toast="Dispute successfully logged"
				@left-click=${() => this._disputeAnotherTran()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">Dispute for ${this.tranDescription} was successfully logged.
					</section>
			</horizon-success-screen>`;
	}

	_renderCannotBeDisputed() {
		return html`
			<horizon-success-screen 
				type="warning"
				header="Transaction can't be disputed"
				image="platform/illustrations/cards.svg"
				left="Dispute Another Transaction"
				right="Done"
				toast="Transaction cannot be disputed"
				toast-type="warning"
				toast-header="Notice"
				@left-click=${() => this._disputeAnotherTran()}
				@right-click=${() => this._doneClick()}
				?subContent="${true}">
					<section 
						id="id-error-msg" 
						slot="detail">Transaction for ${this.tranDescription} was unable to be disputed.
					</section>
					<capitec-label slot="sub-content" label="You will need to contact the merchant directly"></capitec-label>
			</horizon-success-screen>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-disputes-success`, DisputesSuccess);