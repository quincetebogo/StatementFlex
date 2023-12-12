import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { NavigationContext } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the reversal has been processed successfully.
 *
 * @export
 * @class ProcessReversalSuccess
 * @extends {ViewBase}
 */
export class ProcessReversalSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._navigationContext = NavigationContext.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	_onDone() {
		this.horizonRouter.navigateToCapitecConnetProduct();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_navigationContextUpdate() {
		this._currentAccountNumber = this._navigationContext.current.pathParams.accountNumber;
		console.info("_currentAccountNumber", this._currentAccountNumber)
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
					padding-left: 16px;
				}
				section[slot="detail"] {
					height: auto;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProcessReversalSuccess()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderProcessReversalSuccess() {
		this._navigationContextUpdate();
		return html`
			<horizon-success-screen
				data-automation-id="process-reversal-success"
				header="Reversal successful" 
				image="/images/liveBetter/automatic-savings-outcome.svg"
				left="Reverse Another"
				right="Done"
				toast="Reversal successful"
				@left-click=${() => this._onDone()}
				@right-click=${() => this._onDone()}>
					<section slot="detail">
						${this._renderDetails()}
					</section>
			</horizon-success-screen>`;
	}

	//add savings account
	_renderDetails() {
		return html`
			<span>Transaction has been reversed to savings account <strong>${this._currentAccountNumber}</strong></span>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-process-reversal-success`, ProcessReversalSuccess);
