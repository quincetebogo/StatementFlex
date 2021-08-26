import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the automatic savings  has been updated successfully.
 *
 * @export
 * @class AutomaticSavingsSuccess
 * @extends {ViewBase}
 */
export class AutomaticSavingsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.isRoundupOff = false;
		this.roundUpAmountChange = true;
		this.roundUpAccountChange =true;
	}


	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();

		
		this._updateIncidentState();
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

	_manageAutomaticSavingsClick() {
		
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-success-screen{
					--theme-slot-detail-width: auto;
				}
				.bullet-label{
					padding:
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
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="automatic-savings-success-screen"
				header="Automatic savings updated" 
				image="/images/liveBetterSavings/automatic-savings.svg"
				left="Manage Automatic Savings"
				right="Done"
				toast="Automatic savings successfully updated"
				subContent=${true}
				@left-click=${() => this._manageAutomaticSavingsClick()}
				@right-click=${() => this.__doneClick()}>
					
					${this._renderSubContent()}
					${this._renderDetails()}
					${this._renderRoundUpOff()}

			</horizon-success-screen>
		`;
	}

	_renderSubContent(){
		return this.roundUpAccountChange ? 
				html`
					<section slot="sub-content">
						Updated on the following accounts:
						<li class="bullet-label"><b>Main Savings account</b></li>
                    	<li class="bullet-label"><b>Credit card</b></li>
					</section>
					`
					: html``;
	}

	_renderDetails(){
		return this.isRoundupOff ?
				 html`
					<section slot="detail">
						Round-up successfully switched off.
					</section>
					`
					: html``;
	}
	
	_renderRoundUpOff() {
		return this.roundUpAmountChange ?
		html`
			<section slot="detail">
				Round-up successfully updated to <b>R10</b>
			</section>
			`
			: html``;
	}
}

customElements.define(`horizon-automatic-savings-success`, AutomaticSavingsSuccess);