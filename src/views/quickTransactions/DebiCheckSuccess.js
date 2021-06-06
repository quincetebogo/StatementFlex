import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the selected debicheck mandate have been successfully declined.
 *
 * @export
 * @class DebiCheckSuccess
 * @extends {ViewBase}
 */
export class DebiCheckSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mandateId = ``;
	}


	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		// Telemetry 
		HorizonTelemetry.instance.debiCheckOutcome({
			screen: TelemetryScreen.DEBICHECK_OUTCOME
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// Telemetry
		HorizonTelemetry.instance.debiCheckOutcomeDone({
			nextScreen: TelemetryScreen.FAVOURITES
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_debiCheckMandatesClick() {
		// Telemetry
		HorizonTelemetry.instance.debiCheckOutcomeBackToMandates({
			nextScreen: TelemetryScreen.DEBICHECK
		});

		this.horizonRouter.navigateToReturnPage();
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
				.button-margin {
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
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
				header="DebiCheck mandate approved"
				image="/images/transactions/debiCheckMandate.svg"
				secondaryImage="/images/transactions/debiCheckLogo.svg"
				left="Done"
				right="DebiCheck Mandates"
				toast="DebiCheck mandate declined."
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._debiCheckMandatesClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been declined.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-debi-check-success`, DebiCheckSuccess);