import { View, css, html } from 'platform/elements';

import 'app/components/common/SuccessScreen';

export class TapToPaySuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.card1 = `5284 **** **** 1522`;
		this.card2 = `5238 **** **** 8907`;
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
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// TODO : Functionality to navigate to Fvourites screen
	}

	_tapToPayClick() {
		// TODO : Functionality to tap to pay
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
				#id-update-msg{
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