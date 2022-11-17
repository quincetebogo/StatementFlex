import { css, html } from 'platform/elements';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the selected debicheck mandate have been successfully declined/approved.
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
		this.isApproved = ``;
		this.mandateId = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}


	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		const screenDetails = this.horizonStore.getScreenDetails();
		this.isApproved = screenDetails.isApproved;
		this.mandateId = screenDetails.mandateId;

		await this._telemetry.startSpan(QuickTransactionEvents.DEBICHECK_SUCCESS);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {

		await this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_SUCCESS_DONE, {
			"screen": TelemetryScreen.DEBICHECK_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		await this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK_SUCCESS, {}, true, true);

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	async _debiCheckMandatesClick() {

		await this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_SEND_ANOTHER, {
			"screen": TelemetryScreen.DEBICHECK_OUTCOME,
			"next-screen": TelemetryScreen.DEBICHECK
		});

		await this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK_SUCCESS, {}, true, false);

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
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		if (this.isApproved) {
			return html`
			<horizon-success-screen 
				header="DebiCheck mandate approved"
				image="/images/debi-check/debi-check-mandate.svg"
				secondaryImage="/images/debi-check/debi-check-logo.svg"
				left="DebiCheck Mandates"
				right="Done"
				toast="DebiCheck mandate approved."
				@left-click=${() => this._debiCheckMandatesClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been approved.
					</section>
			</horizon-success-screen>
		`;
		};

		
		return html`
			<horizon-success-screen 
				header="DebiCheck mandate declined"
				image="/images/debi-check/debi-check-mandate.svg"
				secondaryImage="/images/debi-check/debi-check-logo.svg"
				left="DebiCheck Mandates"
				right="Done"
				toast="DebiCheck mandate declined."
				@left-click=${() => this._debiCheckMandatesClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been declined.
					</section>
			</horizon-success-screen>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-debi-check-success`, DebiCheckSuccess);