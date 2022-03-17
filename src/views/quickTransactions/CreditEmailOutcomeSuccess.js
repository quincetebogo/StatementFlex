import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the email has been successfully sent.
 *
 * @export
 * @class CreditEmailOutcomeSuccess
 * @extends {ViewBase}
 */
export class CreditEmailOutcomeSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// this.selectedAccounts = [];
		this.emailAddress = ``;
		this.header = ``;
		this.outcomeMessage = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	// N/A

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.screenDetails = this.horizonStore.getScreenDetails();

		// this.selectedAccounts = this.screenDetails && this.screenDetails.selectedAccounts;
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;
		
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	_sendAnotherClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
		this.horizonStore.clearScreenDetails();
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
				#id-error-msg {
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
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="email-sent-success-screen"
				header="${this.header} sent" 
				image="/images/statements/senddocuments.svg"
				left="Pay Another"
				right="Done"
				toast="${this.header} sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section id="id-error-msg" slot="detail">
						${this.outcomeMessage} was emailed to <b>${this.emailAddress}</b>.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-credit-email-outcome-success`, CreditEmailOutcomeSuccess);