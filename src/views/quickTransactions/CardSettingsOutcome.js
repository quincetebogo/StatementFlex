import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/RelatedOptions';

/**
 * Display an outcome screen indicating the Online purchase and International transactions deactivation status.
 *
 * @export
 * @class CardSettingsOutcome
 * @extends {ViewBase}
 */
export class CardSettingsOutcome extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.failedCards = [];
		this.succeededCards = [];
		this.displayToast = true;
		this.endCallContext = `QuickTransactionSuccess`;
		this.header = ``;
		this.displayImage = ``;
		this.expandOtherCards = false;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	/**
	* @property {String} [displayToast=true] Enables/Disables the toast message
	* @readonly
	* @static
	* @memberof CardSettingsOutcome
	*/
	static get properties() {
		return {
			displayToast: { state: false },
			expandOtherCards: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.screenDetails = this.horizonStore.getScreenDetails();

		this.ecommerceUpdated = this.screenDetails?.ecommerceUpdated;
		this.internationalUpdated = this.screenDetails?.internationalUpdated;

		this.failedCards = this.screenDetails.deactivatedCardsList.filter(card => card.ecommerceUpdated === `ERROR` || card.internationalTransactionsUpdated === `ERROR`);
		this.succeededCards = this.screenDetails.deactivatedCardsList.filter(card => (card.ecommerceUpdated === `SUCCESS` || card.internationalTransactionsUpdated === `SUCCESS`) && 
																					!(this.failedCards.indexOf(card) > 0));

		this._getOutcomeDetails();
		this._updateIncidentState();

		window.setTimeout(() => this.displayToast = false, 300000);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearScreenDetails();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_returnToCardList() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = this.failedCards.length === 0 ? super.HORIZON_NEED_STATUS.COMPLETED : super.HORIZON_NEED_STATUS.FAILED;
	}

	_getOutcomeDetails() {
			this.header = this._getHeaderDetails();
			this.toast = this._getToast();
			this.secondaryToast = this._getSecondaryToast();
			this.displayImage = this.succeededCards.length > 0 && this.failedCards.length > 0 
									? `/images/cardSettings/CardSettingsPartialSuccess.svg`
									: `/images/cardSettings/CardSettingsSuccess.svg`;
	}

	_getHeaderDetails() {
		if (this.failedCards.length > 0 && this.succeededCards.length > 0) {
			return `${this.ecommerceUpdated ? `Online purchases` : ``} ${this.ecommerceUpdated && this.internationalUpdated ? `&` : ``} ${this.internationalUpdated ? `International transactions` : ``} partially updated`;
		} else if (this.succeededCards.length > 0) {
			return `${this.ecommerceUpdated ? `Online purchases` : ``} ${this.ecommerceUpdated && this.internationalUpdated ? `&` : ``} ${this.internationalUpdated ? `International transactions` : ``} have been turned off successfully`;
		}
		return `${this.ecommerceUpdated ? `Online purchases` : ``} ${this.ecommerceUpdated && this.internationalUpdated ? `&` : ``} ${this.internationalUpdated ? `International transactions` : ``} update failed`;
	}

	_getToast() {
		if (this.succeededCards.length > 0) {
			// Check if all online or all International are success or only a partial success
			const ecommerceUpdated = this.succeededCards.filter(card => card.ecommerceUpdated === `SUCCESS`).length > 0;
			const internationalUpdated = this.succeededCards.filter(card => card.internationalTransactionsUpdated === `SUCCESS`).length > 0;
			return `${ecommerceUpdated ? `Online purchases` : ``} ${ecommerceUpdated && internationalUpdated ? `&` : ``} ${internationalUpdated ? `International transactions` : ``} updated`;
		}
		return null;
	}

	_getSecondaryToast() {
		if (this.failedCards.length > 0) {
			// Check if all online or all International are failure or only a partial failure
			const ecommerceFailed = this.failedCards.filter(card => card.ecommerceUpdated === `ERROR`).length > 0;
			const internationalFailed = this.failedCards.filter(card => card.internationalTransactionsUpdated === `ERROR`).length > 0;

			return `${ecommerceFailed ? `Online purchases` : ``} ${ecommerceFailed && internationalFailed ? `&` : ``} ${internationalFailed ? `International transactions` : ``} could not be updated`;
		}
		return null;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host {
					width: 100%;
					height: 100%;
				}
				capitec-card {
					width: 100%;
				}
				capitec-card > capitec-group[layout="vertical"] {
					height: 744px;
					padding-top: 42px
				}
				.header {
					margin: 33px 0px 23px 0px;
					height: 32px;
					--theme-label-default-font-color: #3A3A3A;
					--theme-label-default-font-size: 24px;
					--theme-label-default-font-weight: 600;
				}
				.subdetail-group {
					margin-top: 12px;
				}
				b {
					margin: 0px 4px;
					color: #3A3A3A;
				}
				.button-group {
					margin-top: 38px;
				}
				.button-left {
					margin-right: 16px;
				}
				capitec-button {
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-padding-left: 22px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-right: 22px;
				}
				capitec-toast {
					width: 406px;
					position: absolute;
					top : 56px;
					margin-left: 382px;
				}
				.secondary-toast {
					top : 130px;
				}
				p {
					margin: 0px;
				}
				.label-info {
					--theme-label-default-font-size: 16px;
					--theme-label-default-font-weight: 600;
					margin-top: 32px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderOutcomeScreen()}

			${super._webTemplate()}
		`;
	}

	_renderOutcomeScreen() {
		return html`
			<capitec-card class="card">
				${this._renderSuccessToast()}
				${this._renderFailureToast()}

				<capitec-group
					layout="vertical"
					gap="none"
					halign="center"
					valign="center">
						${this._renderContent()}
				</capitec-group>
			</capitec-card>
			
			${this._renderRelatedOptions()}
		`;
	}

	_renderSuccessToast() {
		return this.toast 
		? html`
			<capitec-toast 
				?hidden="${!this.displayToast}"
				type="success"
				header="Successful"
				detail="${this.toast}" 
				closable
				@click="${() => this.displayToast = false}">
			</capitec-toast>`
		: html``;
	}

	_renderFailureToast() {
		return this.secondaryToast
			? html`
				<capitec-toast 
					?hidden="${!this.displayToast}"
					class="${this.toast ? `secondary-toast` : ``}"
					type="error" 
					header="Unsuccessful" 
					detail="${this.secondaryToast}"
					closable 
					@click="${() => this.displayToast = false}">
				</capitec-toast>`
		: html``;
	}

	_renderContent() {
		return html`
			<img src="${this.displayImage}"/>

			<capitec-label class="header" label="${this.header}"></capitec-label>

			<capitec-group layout="vertical" halign="left">
				${this._renderSuccessDetails()}
				${this._returnFailureDetails()}
			</capitec-group>

			<capitec-label class="label-info" label="Please use the APP to reactivate online & international transactions"></capitec-label>

			${this._renderButtonGroup()}
		`;
	}

	_renderSuccessDetails() {
		return this.succeededCards.length > 0 
		? html`
		<capitec-group layout="horizontal" halign="center">
			<capitec-icon
				size="default"
				icon="status/success-trans">
			</capitec-icon>
			<p>
				${this.succeededCards.map((card, index) => this._renderCardsStatus(card, index, true))}
			</p>
		</capitec-group>`
		: html``;
	}

	_returnFailureDetails() {
		return this.failedCards.length > 0
		? html`
			<capitec-group class="subdetail-group" layout="horizontal" halign="center">
				<capitec-icon
					size="default"
					icon="status/error-trans">
				</capitec-icon>
				<p>
					${this.failedCards.map((card, index) => this._renderCardsStatus(card, index, false))}
				</p>
			</capitec-group>`
		: html``;
	}

	_renderCardsStatus(card, index, succeeded) {
		switch (index) {
			case 0:
				return html`
					Card <b>${card.cardNumber}</b> ${succeeded ? `updated successfully` : `not updated`}`;
			case 1:
				return html`
					, <br/> Card <b>${card.cardNumber}</b> ${succeeded ? `updated successfully` : `not updated`}`;
			case 2:
				return html`
					${this._renderOtherCards(succeeded)}`;
			default:
				return html``;
		}
	}

	_renderOtherCards(succeeded) {
		const [, , ...otherCards] = succeeded ? this.succeededCards : this.failedCards;
		return this.expandOtherCards
		? html`
		${otherCards.map(card => html`
			, <br/> Card <b>${card.cardNumber}</b> ${succeeded ? `updated successfully` : `not updated`}`)}`
		: html`
			, <br/> and <capitec-hyperlink label="${otherCards.length} other(s)" size="small" @click="${() => this.expandOtherCards = !this.expandOtherCards}"></capitec-hyperlink>
		`;
	}

	_renderButtonGroup() {
		return html`
			<capitec-group class="button-group" layout="horizontal" halign="center">
				<capitec-button
					class="button-left"
					label="Return to Card list"
					@click="${() => this._returnToCardList()}">
				</capitec-button>

				<capitec-button
					type="primary"
					label="Done"
					@click="${() => this._doneClick()}">
				</capitec-button>
			</capitec-group>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-update-card-settings-outcome`, CardSettingsOutcome);