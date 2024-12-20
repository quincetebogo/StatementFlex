import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

export class SuccessfulCardLimitUpdate extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.limitType = ``;
		this.cardCategory = ``;
		this.maskedCardNumber = ``;
		this.limitExpiryDate = ``;
		this.istapToPayUnChanged = false;
		this.tapToPayStatus = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		/* Removed during incident management refactor
		this._updateIncidentState();
		*/

		const screenDetails = this.horizonStore.getScreenDetails();
		const limitDetails = screenDetails.limitDetails;

		this.maskedCardNumber = limitDetails.cardMaskedNumber;
		this.limitType = limitDetails.limitType;
		this.cardCategory = limitDetails.cardCategory;
		this.limitExpiryDate = limitDetails.limitExpiryDate;
		this.istapToPayUnChanged = limitDetails.istapToPayUnChanged;
		this.tapToPayStatus = limitDetails.tapToPayStatus;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_updateCardLimitsClick() {
		this.horizonRouter.navigateToReturnPage();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/* Removed during incident management refactor
	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}
	*/

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.id-update-msg {
					width: auto;
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
			${this._renderCardLimitsUpdateSuccess()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderCardLimitsUpdateSuccess() {
		return html`
			<horizon-success-screen 
				data-automation-id="card-limit-update-success-screen"
				header="${this.limitType} card limits updated" 
				image="/images/updateCardLimits/cards-successful-limit-update.svg"
				left="Update Card Limits"
				right="Done"
				toast="${this.limitType} card limit updated."
				secondaryToast="${this.istapToPayUnChanged ? `` : `Tap to pay updated`}"
				?hasSubDetails="${!this.istapToPayUnChanged}"
				@left-click=${() => this._updateCardLimitsClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						class="id-update-msg" 
						slot="detail">
							The ${this.limitType.toLowerCase()} card limits for ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> was updated.
					</section>

					${this._renderTapToPayInfo()}
			</horizon-success-screen>
		`;
	}

	_renderTapToPayInfo() {
		// displayed only if hasSubDetails attribute is true on horizon-success-screen
		return html`
			<section 
				class="id-update-msg" 
				slot="sub-detail">
					The tap to pay functionality on your ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> ${this.tapToPayStatus === `TapToPayActivated`
				? html`is pending tap to pay activation. <br /> To complete activation, insert card into card machine or ATM`
				: `is deactivated`}.
			</section>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`card-limit-update-success`, SuccessfulCardLimitUpdate);