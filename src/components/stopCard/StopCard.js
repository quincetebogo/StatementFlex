import { Component, css, html } from 'platform/elements';
import { CARD_DISPLAY_TYPES } from 'app/constants/Common';
import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'platform/components';
import 'app/components/common/CardArt';
import 'app/components/dialogs/stopCard/StopCardConfirm';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	CARD_STOP_MODAL: 1
};

const STOPREASONS = [
	{
		key: `DAMAGED`,
		value: `Card Damaged`
	},
	{
		key: `LOST`,
		value: `Card Lost`
	},
	{
		key: `STOLEN`,
		value: `Card Stolen`
	},
	{
		key: `SUSPECTED_FRAUD`,
		value: `Suspected Fraud`
	},
	{
		key: `SUPPLEMENTARY_ACCESS_REVOKED`,
		value: `Supplementary Access Revoked`
	}
];

/**
 * The StopCard component is the main component of the Horizon Stop Card View.
 *
 * @export
 * @class StopCard
 * @extends {Component}
 */
export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();

		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.cards = null;
		this.cardsToStop = [];
		this.isBusy = false;
		this.hasCardsAvailable = false;

		// Recover state information
		this.callerInformation = this.horizonStore.getCallerInformation();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Array} cards - Client's card array
	 *
	 * @readonly
	 * @static
	 * @memberof StopCard
	 */
	static get properties() {
		return {
			cards: { type: Array },

			hasCardsAvailable: { type: Boolean, attribute: false },
			selectedCardCount: { type: Number, attribute: false },
			renderMode: { type: Number, attribute: false },
			cardsToStop: { type: Array, attribute: false },
			isBusy: { type: Boolean, attribute: false }
		};
	}

	get selectedCardCount() {
		return this.cards.filter(card => card.selected).length;
	}

	get checkBoxLbl() {
		return this.selectedCardCount > 0 ? `${this.selectedCardCount} card(s) selected` : `Select all`;
	}

	get stopCardBtnDisabled() {
		return this.selectedCardCount === 0 || this.cards.filter(card => card.selected).some(card => !card.cardStopReason);
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		/**
		* Add rowIndex, selected, stopReason fields to cards array. 
		* Logic to show/hide stop card reasons is based on rowIndex
		*/

		this.hasCardsAvailable = this.cards.length > 0;
		this._initialise();

		this._telemetry.startSpan(QuickTransactionEvents.STOP_CARD, {
			"screen": TelemetryScreen.STOP_CARD
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onClickReason(cardStopReason, card) {
		const index = this.cards.findIndex(item => item.cardNumber === card.cardNumber);

		// After mutating the this.cards array, request an update in order to trigger rendering.
		// Mutating fields in an object will not be noticed otherwise.
		this.cards[index].cardStopReason = cardStopReason;
		this.requestUpdate();
	}

	_onStopCards() {
		this.cardsToStop = this.cards.map(card => (
			{
				cardDisplayName: card.cardDisplayName,
				cardExpiryMonth: card.cardExpiryMonth,
				cardExpiryYear: card.cardExpiryYear,
				cardNumber: card.cardNumber,
				cardSequenceNumber: card.cardSequenceNumber,
				cardStopReason: card.selected ? card.cardStopReason : ``,
				maskedCardNumber: card.maskedCardNumber,
				supplementaryCard: card.supplementaryCard
			}
		)).filter(card => card.cardStopReason !== ``);
		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;

		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARDS_CLICK, {
			"screen": TelemetryScreen.STOP_CARD,
			"cards": this.cardsToStop.map(card => (
				{
					cardId: card.cardNumber,
					maskedCardNr: card.maskedCardNumber,
					reason: card.cardStopReason
				}
			))
		});
	}

	_confirmedStoppingCardsClick(event) {
		this.dispatchEvent(new CustomEvent(
			`cards-stopped`,
			{
				detail: {
					stoppedCards: event.detail.stoppedCards
				}
			}
		));
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleChannelServiceError() {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_cardSelected(evt, card) {
		const index = this.cards.findIndex(item => item.cardNumber === card.cardNumber);
		this.cards[index].selected = evt.detail.new;

		this.requestUpdate();
	}

	_selectAll() {
		this.cards = this.cards.map(item => {
			item.selected = true;
			return item;
		});

		this.primaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.PRIMARY_CARD);
		this.supplementaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD);
		this.virtualCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.VIRTUAL_CARD);

		this.requestUpdate();
	}

	_deselectAll() {
		this._initialise();
		this.performUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_back() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_initialise() {
		this.cards = this.cards.map(item => {
			item.selected = false;
			item.cardStopReason = ``;
			item.cardHoldName = item.cardholderName;
			item.primaryAccountId = item.primarySavingsAccountId || item.primaryCreditAccountId;

			return item;
		});

		this.primaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.PRIMARY_CARD);
		this.supplementaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD);
		this.virtualCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.VIRTUAL_CARD);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.stop-card{
					width: 1065px;
					height: 876px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
					--theme-label-title-font-weight: 600;
					--theme-label-title-font-size: 24px;
				}
				.stop-card > *:not(:last-child) {
					border-bottom: var(--theme-card-border);
				}
				.stop-card-box {
					--theme-layout-gap-spacing: 16px;
					--theme-container-padding-right: 0px;
				}
				horizon-alert-banner {
					width: 100%;
				}
				capitec-button{
					--theme-button-padding-top: 8px; 
					--theme-button-padding-bottom: 8px; 
					--theme-button-padding-left: 8px; 
					--theme-button-padding-right: 8px;
					width: 135px;
				}
				capitec-image {
					width: 252px;
					height: 182px;
				}
				.client-has-no-card {
					--theme-label-font-color: #3A3A3A;
				}
				capitec-label[type="strong"] {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
					line-height: var(--theme-label-strong-font-size);
					text-align: left;
				}
				horizon-card-art {
					--horizon-card-art-width: 328px;
					--horizon-card-art-height: 304px;
					width: var(--horizon-card-art-width);
					height: var(--horizon-card-art-height);
				}
				capitec-content-box[slot="cardAction"] {
					width: 326px;
					height: 246px;
					--theme-layout-gap-spacing: 10px;
				}
				horizon-label {
					--horizon-label-value-font-size: 15px;
					--horizon-label-text-align: left;
				}
				capitec-label[label="Choose reason"] {
					line-height: var(--theme-label-default-font-size);
				}
				capitec-radio {
					--theme-radio-width: 20px;
					--theme-radio-height: 20px;
				}
				.footer {
					height: auto;
					overflow: hidden;
				}
				.footer > capitec-check {
					--theme-label-font-weight: 500;
					--theme-check-label-spacing: 10px;
				}
				.cardArtBox {
					--theme-layout-gap-spacing: 24px;
					height: 305px;
				}
				.overflow {
					height: 328px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="stop-card" gap="line">
				${this._renderTitleBar()}
				<capitec-content-box class="stop-card-box"
					halign="${this.hasCardsAvailable ? `left` : `center`}"
					valign="${this.hasCardsAvailable ? `top` : `center`}">
					${this._renderStopCardContent()}
				</capitec-content-box>
				${this._renderFooter()}
			</capitec-card>

			${this._renderStopCardModal()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar label="Stop Card(s)" icon="system/arrow-left-action" @click-icon="${() => this._back()}">
			</capitec-title-bar>`;
	}

	_renderStopCardContent() {
		return this.hasCardsAvailable
			? html`
			${this._renderNotifyClient()}
			${this._renderPrimaryCards()}
			${this._renderSupplementaryCards()}
			${this._renderVirtualCards()}`
			: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" class="client-has-no-card" label="Client has no cards to fulfill this transaction"></capitec-label>
		`;
	}

	_renderNotifyClient() {
		return html`
			<horizon-alert-banner
				type="info"
				header="Notify client: "
				label="Once card has been stopped you will need to visit a branch for a new card. You can also order a new card on the app">
			</horizon-alert-banner>`;
	}

	_renderPrimaryCards() {
		return this.primaryCards.length > 0
			? html`
			<capitec-label type="strong" label="Primary card(s)"></capitec-label>
			<capitec-content-box class="cardArtBox" layout="horizontal" noPadding>
				${this.primaryCards.map(card => html`${this._renderCardArt(card)}`)}
			</capitec-content-box>`
			: html``;
	}

	_renderSupplementaryCards() {
		return this.supplementaryCards.length > 0
			? html`
			<capitec-label type="strong" label="Supplementary card(s)"></capitec-label>
			<capitec-content-box class="cardArtBox ${this.supplementaryCards.length > 3 ? `overflow` : ``}" layout="horizontal" noPadding>
				${this.supplementaryCards.map(card => html`${this._renderCardArt(card)}`)}
			</capitec-content-box>`
			: html``;
	}

	_renderVirtualCards() {
		return this.virtualCards.length > 0
			? html`
			<capitec-label type="strong" label="Virtual card"></capitec-label>
			<capitec-content-box class="cardArtBox" layout="horizontal" noPadding>
				${this.virtualCards.map(card => html`${this._renderCardArt(card)}`)}
			</capitec-content-box>`
			: html``;
	}

	_renderCardArt(card) {
		return html`
			<horizon-card-art
				.card="${card}"
				?disable-hover="${true}"
				context="stop-card"
				?selected="${card.selected}"
				@value-change="${(evt) => this._cardSelected(evt, card)}">
					${this._renderCardArtAction(card)}
			</horizon-card-art>`;
	}

	_renderCardArtAction(card) {
		return html`
			<capitec-content-box slot="cardAction" halign="left" valign="top" gap="clear">
				<horizon-label
					label="${card.cardDisplayName}"
					value="${card.maskedCardNumber}">
				</horizon-label>
				<capitec-label label="Choose reason"></capitec-label>
				<capitec-radio-group>
					${STOPREASONS.map(item => html`
						<capitec-radio
							label="${item.value}"
							@click="${(e) => this._onClickReason(item.key, card)}"
							?checked="${item.key === card.cardStopReason}">
						</capitec-radio>
					`)}
				</capitec-radio-group>
			</capitec-content-box>
		`;
	}

	_renderStopCardModal() {
		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {
			return html`
				<horizon-stop-card-confirm
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.cardsToStop="${this.cardsToStop}"
					.stopReasons="${STOPREASONS}"
					@on-confirm="${(event) => this._confirmedStoppingCardsClick(event)}"
					@on-cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-stop-card-confirm>
			`;
		}
	}

	_renderFooter() {
		return this.hasCardsAvailable
			? html`
			<capitec-content-box halign="left" gap="clear" layout="horizontal" class="footer">
				<capitec-check
					label="${this.checkBoxLbl}"
					?indeterminate="${this.selectedCardCount > 0}"
					?checked="${this.selectedCardCount > 0}"
					@value-change="${() => this._selectAll()}">
				</capitec-check>
				<capitec-button
					type="clear"
					label="Deselect All"
					@click="${() => this._deselectAll()}">
				</capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button 
					data-automation-id="stop-card-stop-cards"
					label="Stop Card(s)"
					type="primary"
					@click="${() => this._onStopCards()}"
					?disabled="${this.stopCardBtnDisabled}">
				</capitec-button>
			</capitec-content-box>`
			: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="stop-card-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}

customElements.define(`horizon-stop-card`, StopCard);