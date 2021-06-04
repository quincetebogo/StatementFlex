import { css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/views/common/ViewBase';
import 'app/components/common/SuccessScreen';

export class TapToPaySuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.selecetedCard = ``;
		this.tapToPayStatus = ``;
		this.maskedCardNumber = ``;
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			maskedCardNumber: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		this.tapToPayStatus = state.request.tapToPayStatus;
		this.cardMaskedNumber = state.cardMaskeNumber;
			
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
		this._updateIncidentState();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// Functionality to navigate to Favourites screen
		this.horizonStore.saveState({ tapToPayStatus: this.tapToPayStatus });
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_tapToPayClick() {
		// Functionality to tap to pay
		const state = this.horizonStore.recoverState();
		state.returnToScreen.option = this.incidentDetails.currentNeed;
		
		this.horizonStore.saveState({ tapToPayStatus: this.tapToPayStatus, returnToScreen: state.returnToScreen });
		
		this.horizonRouter.navigateToQuickTransactionFavourites();
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
			<horizon-success-screen 
				header="Tap to pay ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`}" 
				image="src/images/cards-successful-tap-to-pay.svg"
				left="Done"
				right="Tap to Pay"
				toast="Tap to pay ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`}"
				sub_detail="true"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tapToPayClick()}>
					<section 
						id="id-update-msg" 
						slot="detail">
							The tap to pay functionality on your dual credit card <b>${this.cardMaskedNumber}</b> has been ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`} and is now pending.
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-tap-to-pay-success`, TapToPaySuccess);