import { View, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import 'app/components/quickTransactions/FavouriteTransactions';

/**
 * The Favourites view for a verified-client.
 *
 * @export
 * @class Favourites
 * @extends {View}
 */
export class Favourites extends View {

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.state = this.horizonStore.recoverState();
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), null);
	}

	static get properties() {
		return {
			isBusy: { type: Boolean }
		};
	}

	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	async _initialise() {
		const landingRequest = {
			cifNumber: this.state.callerInformation.cifNumber,
			nationalIDNumber: this.state.callerInformation.southAfricanIDNumber,
			isCallerVerified: this.state.callerInformation.verificationStatus === `verified`
		};
			
		const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest);

		if (returnValue.succeeded) {
			console.log(returnValue.result);
		}
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	static get styles() {
		return [
			super.styles,
			css`
			.favourites{
				width:100%;
				height:100%;
			}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`<horizon-favourites-transactions class="favourites"></horizon-favourites-transactions>
		${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);