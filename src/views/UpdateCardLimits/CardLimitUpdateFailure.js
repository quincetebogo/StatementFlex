import { View, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';
import 'app/components/common/ErrorScreen';

export class UnsuccessfulCardLimitUpdate extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.card1 = `5284 **** **** 1522`;
        this.card2 = `5238 **** **** 8907`;

        this.horizonRouter = HorizonRouter.getInstance();
        this.incomingCallDetails = this.state.incomingCallDetails;
        this.incidentRecId = this.incomingCallDetails.incidentRecId;
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

				.id-update-msg{
					width: auto;
				}

				.button-margin{
					height: 80px;
					width: 186px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}

				.card {
					height: 112px;
					width: auto;
				}

				.related-options {
					height: 32px;
					width: 100%;
					background-color: #F4F4F4;
					border-top: 1px solid #dfdfdf;
					border-bottom: 1px solid #dfdfdf;
				}
				
				.related-options-text{
					margin: 0px 0px 0px 16px;
					padding: 0px 0px 0px 0px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}

				.options-group{
					height: 80px; 
					margin: 16px 0px 16px 16px;
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
					header="Permanent card limits not updated" 
					left="Done"
					right="Handoff"
					toast="Permanent card limit updated."
					image="/images/cards-unsuccesful-limit-update.svg"
					@left-click=${() => this._doneClick()}
					@right-click=${() => this._onHandoff()}>
					<section id="id-error-msg" slot="detail"><b>The permanent card limits for debit card 5284 **** **** 1522 was not updated.</b></section>
			</horizon--error-screen>

			<div class="related-options">
					<p class="related-options-text">Related Options</p>
			</div>
			<capitec-card class="card">
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
					<slot name="option-button">
					
						<horizon-option-button 
							class="button-margin"
							label="Statements"
							icon="system/documents-action">
						</horizon-option-button>

						<horizon-option-button 
							class="button-margin" 
							label="Tap To Pay" 
							icon="system/contactless-action">
						</horizon-option-button>
					</slot>
				</capitec-group>
			</capitec-card>
		`;
	}
}

customElements.define(`permanent-card-limit-update-failure`, UnsuccessfulCardLimitUpdate);