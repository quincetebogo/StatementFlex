import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Email sent failure Screen that can be displayed when channel service calls fail to send them. 
 *
 * @export
 * @class CreditEmailOutcomeFailure
 * @extends {ViewBase}
 */

 export class CreditEmailOutcomeFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedAccounts = [];
		this.emailAddress = ``;
		this.header = ``;
		this.outcomeMessage = `Proof of Payment for Settling and Closing Credit Card`;
		this.endCallContext = `QuickTransactionsUnSuccess`;
	}

	
	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @param {String} outcomeMessage outcome message to display
	 * @param {String} header  page header to display
	 */

	 static get properties() {
		return {
			header: { type: String },
			outcomeMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();

		this.selectedAccounts = this.screenDetails && this.screenDetails.selectedAccounts;
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;

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
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	_tryAgain() {
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height: 744px;
				}
				#id-error-msg {
					width: auto;
                    font-weight:500;
                    color:#3A3A3A;
                    margin-bottom:35px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderEmailSentFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderEmailSentFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="email-sent-failure-screen"
				image="/images/statements/senddocuments.svg"
				header="${this.header} not sent" 
				left="Done"
				right="Try Again"
				toast="${this.header} not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgain()}>
				<section id="id-error-msg" slot="detail">
					${this.outcomeMessage} was not emailed to <b>${this.emailAddress}</b>.
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="email-sent-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-credit-email-outcome-failure`, CreditEmailOutcomeFailure);