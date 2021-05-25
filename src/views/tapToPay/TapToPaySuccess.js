import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

export class TapToPaySuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.card1 = `5284 **** **** 1522`;
		this.card2 = `5238 **** **** 8907`;
		this.tapToPayStatus = ``;
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

		this.incidentDetails = this.horizonStore.getIncidentDetails();
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

	_tapToPayClick() {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.returnToOption = this.incidentDetails.currentNeed;
		
		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_tapToPayStatus() {

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
				#id-update-msg {
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
			${this._renderTapToPaySuccess()}

			${super._webTemplate()}
		`;
	}

	_renderTapToPaySuccess() {
		return html`
			<horizon-success-screen 
				header="Tap to pay activated" 
				image="src/images/cards-successful-tap-to-pay.svg"
				left="Done"
				right="Tap to Pay"
				toast="Tap to pay activated."
				sub_detail="true"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tapToPayClick()}>
					<section 
						id="id-update-msg" 
						slot="detail">
							The tap to pay functionality on your dual credit card <b>${this.card2}</b> has been activated and is now pending.
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-tap-to-pay-success`, TapToPaySuccess);