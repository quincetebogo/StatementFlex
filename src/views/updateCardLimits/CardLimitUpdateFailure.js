import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

export class UnsuccessfulCardLimitUpdate extends ViewBase {

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
		this.endCallContext = `QuickTransactionsUnSuccess`;
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

		this._updateIncidentState();

		const screenDetails = this.horizonStore.getScreenDetails();
		const limitDetails = screenDetails.limitDetails;

		this.maskedCardNumber = limitDetails.cardMaskedNumber;
		this.limitType = limitDetails.limitType;
		this.cardCategory = limitDetails.cardCategory;
		this.limitExpiryDate = limitDetails.limitExpiryDate;
		this.istapToPayUnChanged = limitDetails.istapToPayUnChanged;
		this.tapToPayStatus = limitDetails.tapToPayStatus;
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

	_onHandoff() {
		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
	}

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
				.card {
					height: 112px;
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
			${this._renderCardLimitsUpdateFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderCardLimitsUpdateFailure() {
		return html`
			<horizon-error-screen 
				data-automation-id="card-limit-update-failure-screen"
				header="${this.limitType} card limits not updated" 
				left="Done"
				right="Assign"
				toast="${this.limitType} card limit updated."
				secondaryToast="${this.istapToPayUnChanged ? `` : `Tap to pay not updated`}"
				image="/images/updateCardsLimits/cards-unsuccesful-limit-update.svg"
				?hasSubDetails="${!this.istapToPayUnChanged}"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._onHandoff()}>
					<section
						slot="detail">
							The ${this.limitType.toLowerCase()} card limits for ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> was not updated.
					</section>

					${this._getSubTitle()}
			</horizon-error-screen>
		`;
	}

	_getSubTitle() {
		return html`
			<section slot="sub-detail">
				The tap to pay functionality on your ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> was not ${this.tapToPayStatus === `TapToPayActivated` ? `activated` : `deactivated`}.
			</section>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`card-limit-update-failure`, UnsuccessfulCardLimitUpdate);