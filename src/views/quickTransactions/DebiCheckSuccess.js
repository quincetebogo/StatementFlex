import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the selected debicheck mandate have been successfully declined/approved.
 *
 * @export
 * @class DebiCheckSuccess
 * @extends {ViewBase}
 */
export class DebiCheckSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.isApproved = ``;
		this.mandateId = ``;
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
		this.isApproved = screenDetails.isApproved;
		this.mandateId = screenDetails.mandateId;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_debiCheckMandatesClick() {
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
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

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		if (this.isApproved) {
			return html`
			<horizon-success-screen 
				header="DebiCheck mandate approved"
				image="/images/debi-check/debi-check-mandate.svg"
				secondaryImage="/images/debi-check/debi-check-logo.svg"
				left="DebiCheck Mandates"
				right="Done"
				toast="DebiCheck mandate approved."
				@left-click=${() => this._debiCheckMandatesClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been approved.
					</section>
			</horizon-success-screen>
		`;
		};

		return html`
			<horizon-success-screen 
				header="DebiCheck mandate declined"
				image="/images/debi-check/debi-check-mandate.svg"
				secondaryImage="/images/debi-check/debi-check-logo.svg"
				left="DebiCheck Mandates"
				right="Done"
				toast="DebiCheck mandate declined."
				@left-click=${() => this._debiCheckMandatesClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been declined.
					</section>
			</horizon-success-screen>`;
	}
}

customElements.define(`horizon-debi-check-success`, DebiCheckSuccess);