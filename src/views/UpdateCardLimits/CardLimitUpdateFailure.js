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

		this.displayToast = false;
		this.limitType = ``;
		this.cardCategory = ``;
		this.maskedCardNumber = ``;
		this.limitExpiryDate = ``;
		this.istapToPayUnChanged = false;
		this.incidentRecId = this.incidentDetails.incidentRecId;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			displayToast: { type: Boolean, attibute: false }
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

		this._toggleToastDisplay();
		window.setTimeout(() => this._toggleToastDisplay(), 3000);
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
		this.horizonRouter.navigateToStrack(this.incidentRecId);
	}

	_toggleToastDisplay() {
		this.displayToast = !this.displayToast;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(incidentDetails);
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
				#id-failure-toast {
					position: absolute;
					top : var(--toast-top, 130px);
					margin-left: var(--toast-margin-left, 382px);
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
			${this._renderTapToPayToast()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderTapToPayToast() {
		return !this.istapToPayUnChanged && this.displayToast
			? html`
				<capitec-toast 
					id="id-failure-toast"
					type="error"
					header="Unsuccessful"
					detail="Tap to pay not updated"
					closable
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
			: html``;
	}

	_renderCardLimitsUpdateFailure() {
		return html`
			<horizon--error-screen 
				header="${this.limitType} card limits not updated" 
				left="Done"
				right="Handoff"
				toast="${this.limitType} card limit updated."
				image="/images/cards-unsuccesful-limit-update.svg"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._onHandoff()}>
					<section
						id="id-error-msg"
						slot="detail">
							The ${this.limitType.toLowerCase()} card limits for ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> was not updated.
					</section>

					${this._renderTapToPayInfo()}
			</horizon--error-screen>
		`;
	}

	_renderTapToPayInfo() {
		return !this.istapToPayUnChanged
			? html`
				<section 
					class="id-update-msg" 
					slot="sub-detail">
						The tap to pay functionality on your ${this.cardCategory.toLowerCase()} card <b>${this.maskedCardNumber}</b> was not activated.
				</section>`
			: html``;
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