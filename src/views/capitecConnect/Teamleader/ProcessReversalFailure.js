import { NavigationContext } from 'platform/core';
import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { CapitecConnectService } from 'app/services/CapitecConnectService';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';


const MAX_ATTEMPT = 2;

/**
 * Display an Failure screen indicating the reversal has not been processed successfully.
 *
 * @export
 * @class ProcessReversalFailure
 * @extends {ViewBase}
 */
export class ProcessReversalFailure extends ViewBase {

	constructor() {
		super();

		this.retry = 0;
		this._navigationContext = NavigationContext.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.capitecConnectService = new CapitecConnectService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			retry: { type: Number },

			hideTryAgain: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onTryAgain() {
		this._navigationContextUpdate();
		this.retry++;
		// Checking if max attempts exhausted, YES -> hide 'Try Again' button
		if (this.retry > MAX_ATTEMPT) {
			this.hideTryAgain = true;
			return;
		}

		console.info("currentTransactionReference", this._currentTransactionReference)
		var reversalDetails = await this.capitecConnectService.processReversal(this._currentTransactionReference, true);
		// var reversalDetails = await this.reversalActions("Unlock", this._currentTransactionReference);
		console.info("reversalDetails", reversalDetails)
		if(reversalDetails.succeeded){
			console.info("successsssss")
			this.horizonRouter.navigateToProcessReversalSuccess();
		} else {
			console.info("failllllll")
			// this._renderProcessReversalFailure()
		}
	}

	_onCancel() {
		this.horizonRouter.navigateToCapitecConnetProduct();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_navigationContextUpdate() {
		this._currentTransactionReference = this._navigationContext.current.pathParams.transactionReference;
		console.info("currentTransactionReference 1", this._currentTransactionReference)
		// const currentTransactionReference = this.navigationContext.transactionReference;
		// const type = currRoute.queryParams && currRoute.queryParams.type;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height:768px;
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
			${this._renderProcessReversalFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	//try again
	_renderProcessReversalFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="process-reversal-failure"
				id="id-error-toast"
				image="/images/liveBetter/automatic-savings-outcome.svg"
				header="Reversal unsuccessful" 
				left="${this.hideTryAgain ? `` : `Try Again`}"
				right="Cancel"
				toast="Transaction was not reversed"
				@left-click=${() => this._onTryAgain()}
				@right-click=${() => this._onCancel()}>
					<section slot="detail">
						${this._renderDetails()}
					</section>
			</horizon-error-screen>
		`;
	}

	_renderDetails() {
		return html`
			<span>Transaction has not been reversed</span>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="automatic-savings-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-process-reversal-failure`, ProcessReversalFailure);
