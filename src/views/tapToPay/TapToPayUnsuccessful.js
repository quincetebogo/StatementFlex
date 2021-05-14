import { css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * An error/failure screen that will be displayed when Tap To Pay is unsuccessfuil
 */
export class TapToPayUnsuccessful extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.card = `5284 **** **** 1522`;
		this.selectedCard = ``;
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			card: { type: String }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._updateIncidentState();

		const state = this.horizonStore.recoverState();

		if (state) {

			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();

			this.selectedCard = state.selectedCard;
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {

		const state = this.horizonStore.recoverState();
		const returnToScreen = state && state.returnToScreen;
		
		const transactLP = () => this.horizonRouter.navigateToQuickTransactionFavourites();
		
		const landingScreens = {
			'Favourites': transactLP
		};
		landingScreens[returnToScreen.name]();
	}
	
	_handoffClick() {

		// Incident must stay active until a team lead closes it, Save store & Launch STRACK

		const incidentRecId = this.incidentDetails.incidentRecId;
		this.horizonRouter.navigateToStrack(incidentRecId);
		this.horizonRouter.navigateToReturnPage(`handoff`);
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
			<horizon--error-screen 
				header="Tap to pay not activated" 
				image="src/images/tap-to-pay-error.svg"
				left="Done"
				right="Handoff"
				toast="Tap to pay not activated."
				sub_detail="true"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._handoffClick()}>
					<section
						id="id-error-msg" 
						slot="detail">
						Tap to Pay for debit card ${this.card} was not activated.
					</section>
			</horizon--error-screen >

			${this._renderRelatedOptions()}
		`;
	}

	_renderRelatedOptions() {
        return html`
            <horizon-related-options
				context="Failure">
            </horizon-related-options>
        `;
    }
}   
customElements.define(`horizon-tap-to-pay-unsuccessful`, TapToPayUnsuccessful);