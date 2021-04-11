import { View, css, html } from 'platform/elements';

import 'app/components/common/SuccessScreen';

export class SuccessfulCardLimitUpdate extends View {

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

		this._updateIncidentState();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// TODO : Functionality to navigate after card limit successfully updated
	}

	_updateCardLimitsClick() {
		// TODO : Functionality to update card limits
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const state = this.horizonStore.recoverState();
		state.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;

		this.horizonStore.saveState(state);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.id-update-msg{
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
				header="Permanent card limits updated" 
				image="/images/cards-successful-limit-update.svg"
				left="Done"
				right="Update Card Limits"
				toast="Permanent card limit updated."
				sub_detail="true"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._updateCardLimitsClick()}>
					<section 
						class="id-update-msg" 
						slot="detail">
							The permanent card limits for dual card <b>${this.card1}</b> have been updated.
					</section>

					<section 
						class="id-update-msg" 
						slot="sub-detail">
							The tap to pay functionality on your dual credit card <b>${this.card2}</b> has been activated and is now pending.
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`permanent-card-limit-update-success`, SuccessfulCardLimitUpdate);