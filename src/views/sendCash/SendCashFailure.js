import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an failure screen indicating the selected voucher hasn't been placed on hold.
 *
 * @export
 * @class SendCashFailure
 * @extends {ViewBase}
 */
 export class SendCashFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.primaryToast = `Hold not placed on send cash`;
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

		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
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

	_assignClick() {
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.ASSIGNED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
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
				.error-msg {
					height: 24px;
					width: auto;
					color: #3A3A3A;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSendCashFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderSendCashFailure() {
		return html`
			<horizon-error-screen
				header="Send Cash Hold Unsuccessful" 
				image="/images/updateCardLimits/cards-unsuccesful-limit-update.svg"
				left="Done"
				right="Assign"
				toast="${this.primaryToast}"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
					${this._renderSendCashFailureMessage()}
			</horizon-error-screen>
		`;
	}

	_renderSendCashFailureMessage() {
		return html`
			<section
				class="error-msg"
				slot="detail">
					The selected voucher could not be placed on hold.
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure">
			</horizon-related-options>
		`;
	}

 }
 customElements.define(`horizon-send-cash-failure`, SendCashFailure);