import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

export class UnsuccessfulCardLimitUpdate extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.card1 = `5284 **** **** 1522`;
		this.card2 = `5238 **** **** 8907`;

		this.incidentRecId = this.incidentDetails.incidentRecId;
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

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// TODO : Functionality to navigate after card limit successfully updated
	}

	_onHandoff() {
		this.horizonRouter.navigateToStrack(this.incidentRecId);
		// TODO : Functionality to update card limits
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

				.id-update-msg {
					width: auto;
				}

				.card {
					height: 112px;
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
			${this._renderCardLimitsUpdateFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderCardLimitsUpdateFailure() {
		return html`
			<horizon--error-screen 
					header="Permanent card limits not updated" 
					left="Done"
					right="Handoff"
					toast="Permanent card limit updated."
					image="/images/cards-unsuccesful-limit-update.svg"
					@left-click=${() => this._doneClick()}
					@right-click=${() => this._onHandoff()}>
					<section id="id-error-msg" slot="detail"><b>The permanent card limits for debit card 5284 **** **** 1522 was not updated.</b></section>
			</horizon--error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`permanent-card-limit-update-failure`, UnsuccessfulCardLimitUpdate);