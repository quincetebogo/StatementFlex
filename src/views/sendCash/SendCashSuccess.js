import { css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { NavigationContext } from 'platform/core';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the selected voucher has successfully placed on hold.
 *
 * @export
 * @class SendCashSuccess
 * @extends {ViewBase}
 */
export class SendCashSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.primaryToast = `Hold placed on send cash`;
		this.endCallContext = `QuickTransactionSuccess`;
		this.selectedReason = ``;

		this.horizonStore = HorizonStore.getInstance();
		this.navigationContext = NavigationContext.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.selectedReason = screenDetails.sendCashSelectedReason;

		/* Removed during incident management refactor
		this._updateIncidentState();
		*/
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `send-cash`);
		this.horizonRouter.navigateToQuickTransactionFavourites();
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
				.success-msg {
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
			${this._renderSuccessScreen()}
			${super._webTemplate()}
			${this._renderRelatedOptions()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				header="Send Cash Hold Successful" 
				image="/images/statements/send-documents.svg"
				right="Done"
				toast="${this.primaryToast}"
				@right-click=${() => this._doneClick()}>
					${this._renderSendCashSuccessMessage()}
			</horizon-success-screen>
		`;
	}

	_renderSendCashSuccessMessage() {
		return html`
			<section
				slot="detail"
				class="success-msg">
				Due to <strong>${this.selectedReason}</strong>, the voucher number will be placed on hold and won't be redeemable.
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-send-cash-success`, SendCashSuccess);