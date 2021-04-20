import { View, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
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
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);
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

				.button-margin{
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
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
			<horizon-success-screen header="Permanent card limits updated" 
									image="/images/cards-successful-limit-update.svg"
									left="Done"
									right="Update Card Limits"
									toast="Permanent card limit updated."
									sub_detail="true"
									@left-click=${() => this._doneClick()}
									@right-click=${() => this._updateCardLimitsClick()}>
				<section 
					class="id-update-msg" 
					slot="detail">The permanent card limits for dual card <b>${this.card1}</b> have been updated.
				</section>

				<section 
					class="id-update-msg" 
					slot="sub-detail">The tap to pay functionality on your dual credit card <b>${this.card2}</b> has been activated and is now pending.
				</section>

				<section 
						id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin"
						label="Statements"
						icon="system/documents-action">
					</horizon-option-button>
				</section>
				<section 
						id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin" 
						label="Tap To Pay" 
						icon="system/contactless-action">
					</horizon-option-button>
				</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`permanent-card-limit-update-success`, SuccessfulCardLimitUpdate);