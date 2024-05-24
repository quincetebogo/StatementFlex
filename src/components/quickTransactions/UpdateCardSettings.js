import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { Utilities } from 'platform/Utilities';

import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/ConfirmCardSettings';

const CARD_TYPE_LIST = [
	{ key: `ALL`, value: `All` },
	{ key: `Primary_Card`, value: `Primary Cards` },
	{ key: `Supplementary_Card`, value: `Supplementary Cards` },
	{ key: `Virtual_Card`, value: `Virtual Cards` }
];

const FILTER_BY = {
	All: `All`,
	DEBIT: `Debit Card`,
	CREDIT: `Credit Card` 
};

export class UpdateCardSettings extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();

		this.hasCardsAvailable = false;
		this.showDeactivateConfirmationModal = false;
		this.updatedCards = [];
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.ecommerceUpdated = false;
		this.internationalUpdated = false;
		this.filteredCards = [];
		this.filterBy = `ALL`;
		this.filterByType = `ALL`;
	}

	// ---------------
	// PROPERTIES
	// ---------------

	/**
	 * @property {Object} cards Object contains the list of client's cards
	 */
	static get properties() {
		return {
			// Input properties
			cards: { type: Object },
			hasCardsAvailable: { type: Boolean },
			updatedCards: { type: Array },
			showDeactivateConfirmationModal: { state: false },
			filteredCards: { state: false },
			filterBy: { state: false },
			filterByType: { state: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._loading();
		this._initialise();
	}

	disconnectedCallback() {
		this._unloading();
		super.disconnectedCallback();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.hasCardsAvailable = this.cards.length > 0;

		this.cards.forEach(card => {
			if (card.supplementaryCard) {
				card.cardDisplayName = `Supplementary ${card.cardArt.split(`_`).includes(`DEBIT`) ? FILTER_BY.DEBIT : FILTER_BY.CREDIT}`;
			} 
			card.cardDisplayName = card.cardArt.split(`_`).includes(`DEBIT`) ? FILTER_BY.DEBIT : FILTER_BY.CREDIT;
			card.cardHoldName = card.cardholderName;
		});
		
		this._deepCopyCardDetails();
	}

	_loading() {
		this.dispatchEvent(new CustomEvent(`loading`));
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_getUpdatedCardsList() {
		const updatedCardsList = this.updatedCards.filter(updatedcard => {
			const card = this.cards.find(item => item.cardNumber === updatedcard.cardNumber); 
			return updatedcard.ecommerce !== card.ecommerce || updatedcard.internationalTransactions !== card.internationalTransactions;
		});

		return updatedCardsList;
	}

	_deepCopyCardDetails() {
		this.updatedCards = Utilities.deepCopy(this.cards);
		this.filteredCards = Utilities.deepCopy(this.cards);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_cancelClick() {
		this.showDeactivateConfirmationModal = !this.showDeactivateConfirmationModal;
	}

	_toggleOnline(event, cardNumber) {
		
		this._updateSingleCardSettings(this.updatedCards, cardNumber, `ecommerce`, event.detail.new);
		this._updateSingleCardSettings(this.filteredCards, cardNumber, `ecommerce`, event.detail.new);
		
	    this.requestUpdate();
	}

	_toggleInternational(event, cardNumber) {
		this._updateSingleCardSettings(this.updatedCards, cardNumber, `internationalTransactions`, event.detail.new);
		this._updateSingleCardSettings(this.filteredCards, cardNumber, `internationalTransactions`, event.detail.new);
		
		// const index = this.cards.findIndex(item => item.cardNumber === cardNumber);
		// this.updatedCards[index].internationalTransactions = event.detail.new;
		this.requestUpdate();
	}

	_updateSingleCardSettings(cardsList, cardNumber, type, value) {
		if (cardsList) {
			cardsList.forEach(item => {
				if (item.cardNumber === cardNumber) {
					item[type] = value;
				}
			});
		}
	}

	_deactivateAllOnline(event) {
		this.filteredCards.forEach(card => {
			const cardToUpdate = this.updatedCards.find(item => item.cardNumber === card.cardNumber);
			if (event.detail.new && cardToUpdate) {
				card.ecommerce = false;
				cardToUpdate.ecommerce = false;
			} else {
				cardToUpdate.ecommerce = card.ecommerce = this.cards.find(originalCard => originalCard.cardNumber === card.cardNumber).ecommerce;
			}
		});
			
		this.requestUpdate();
	}

	_decativateAllInternational(event) {
		this.filteredCards.forEach(card => {
			const cardToUpdate = this.updatedCards.find(item => item.cardNumber === card.cardNumber);
			if (event.detail.new && cardToUpdate) {
				card.internationalTransactions = false;
				cardToUpdate.internationalTransactions = false;
			} else {
				cardToUpdate.internationalTransactions = card.internationalTransactions = this.cards.find(originalCard => originalCard.cardNumber === card.cardNumber).internationalTransactions;
			}
		});
		this.requestUpdate();
	}

	_deactivateSelectedCards() {
		this.ecommerceUpdated = this.updatedCards.filter(updatedcard => {
															const card = this.cards.find(item => item.cardNumber === updatedcard.cardNumber); 
															return updatedcard.ecommerce !== card.ecommerce;
														})?.length > 0;
	
		this.internationalUpdated = this.updatedCards.filter(updatedcard => {
																const card = this.cards.find(item => item.cardNumber === updatedcard.cardNumber); 
																return updatedcard.internationalTransactions !== card.internationalTransactions;
															})?.length > 0;

		this.showDeactivateConfirmationModal = !this.showDeactivateConfirmationModal;
	}
	
	_confirmDeactivation() {

		this.dispatchEvent(new CustomEvent(`deactivate`, {
			detail: {
				cardsListToDeactivate: this._getUpdatedCardsList(),
				ecommerceUpdated: this.ecommerceUpdated,
				internationalUpdated: this.internationalUpdated
			}
		}));
	}

	_deselectAll() {

		this.filteredCards.forEach(card => {
			const filteredCard = this.cards.find(item => item.cardNumber === card.cardNumber);
			const updatedCard = this.updatedCards.find(item => item.cardNumber === card.cardNumber);

			card.ecommerce = updatedCard.ecommerce = filteredCard.ecommerce;
			card.internationalTransactions = updatedCard.internationalTransactions = filteredCard.internationalTransactions;
		});
		this.shadowRoot.querySelectorAll(`#deactivation-check-box`).forEach(box => box.removeAttribute(`checked`));
		this.requestUpdate();
	}
	
	_filterCards(type) {
		this.filterBy = type;
		this._refineSearch();
	}

	_filterCardsByType(event) {
		this.filterByType = event.detail.new.key;
		this._refineSearch();
	} 

	_refineSearch() {
		this.filteredCards = Utilities.deepCopy(this.cards);
		this.filteredCards.forEach(card => {
			const cardToUpdate = this.updatedCards.find(item => item.cardNumber === card.cardNumber);
			if (cardToUpdate) {
				card.ecommerce = cardToUpdate.ecommerce;
				card.internationalTransactions = cardToUpdate.internationalTransactions;
			}
		});

		if (this.filterBy && this.filterBy !== `ALL`) {
			this.filteredCards = this.filteredCards.filter(card => card.cardDisplayName === FILTER_BY[this.filterBy]);
		}

		if (this.filterByType && this.filterByType !== `ALL`) {
			this.filteredCards = this.filteredCards.filter(card => card.cardDisplayType === this.filterByType);
		}
	}

	// ---------
	// RENDERING
	// ---------
	
	static get styles() {
		return [
			super.styles,
			css`
				capitec-card {
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}

				.content-body {
					width: 1064px;
					height: 100%;

					--theme-container-padding-right: 0px;
				}

				.title-label{
					margin: 0px 0px 8px 8px;
					height: 32px;
					--theme-layout-gap-spacing: 8px;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-family: "Hind Vadodara";
					--theme-label-height: 32px;
					--theme-label-width: 200px;
					--theme-label-font-color: #3E4547;
					--theme-label-title-font-weight: 600;
					--theme-label-letter-spacing: 0;
					--theme-label-line-height: 32px;
					
				}

				.primary-card-label{
					height: fit-content;
					width: 300px;
					margin: 6px 0px;
					--theme-label-title-font-size: 18px;
					--theme-label-font-color: #3E4547;
					--theme-label-title-font-family: "Hind Vadodara";
					--theme-label-title-font-weight: 600;
					--theme-label-letter-spacing: 40;
					--theme-label-line-height: 24px;
					--theme-layout-gap-spacing: 18px;
				}

				.supplementary-card-label{
					height: fit-content;
					font-size: 18px;
					width: 300px;
					margin: 6px 0px;
					--theme-label-font-color: #3E4547;
					--theme-label-title-font-family: "Hind Vadodara";
					--theme-label-title-font-weight: 600;
					--theme-label-letter-spacing: 0;
					--theme-label-line-height: 24px;
					--theme-layout-gap-spacing: 18px;
				}

				capitec-title-bar {
					display: -webkit-inline-box;
				}

				horizon-card-art {
					--horizon-card-art-box-shadow:none!important;
					--horizon-card-art-info-group-height: 200px;
					--horizon-card-art-height: 452px;
					margin-bottom: 32px;
				}
				.no-friendly-name {
					--horizon-card-art-height: 400px;
				}

				horizon-card-art:nth-child(n+3) {
					--theme-layout-gap-spacing: 0px;
				}

				.card-group {
					--theme-layout-gap-spacing: 24px;
				}

				capitec-image {
					margin: 109px 406px 0px 406px;
					width: 252px;
					height: 182px;
				}

				capitec-icon {
					cursor: pointer;
				}

				.no-cards-available {
					margin: 15px 0px 16px;
					text-align: center;

					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-content-box[slot="cardInfo"] {
					width: 326px;
					height: 216px;
					border-top: 1px solid #E1E1E1;
					--theme-layout-gap-spacing: 0px;
					padding-right: 16px;
				}

				capitec-content-box[slot="cardInfo"] > horizon-label { 
					--horizon-label-text-font-size: 12px;
					--horizon-label-value-font-size: 15px;
				}
				.toggle-label {
					margin-right: 10px;
					height: 100%;
					width: 21px;
					font-size: 15px;
					color: #3A3A3A;
					font-weight: 501;
					--theme-label-line-height: 20px;
					--theme-label-default-font-family: "Hind Vadodara";
				}
 				hr {
					width: 100%;
					border-top: 1px solid #E1E1E1;
					border-bottom: 0px;
				}
				.label-status {
					--theme-label-default-font-size: 12px;
				}

				.toggle-group {
					display: -webkit-inline-box;
				}

				.toggle-group > capitec-label {
					--theme-label-default-font-size: 15px;
    				--theme-label-default-font-weight: 500;
				}
				capitec-toggle {
					margin: 3px 0px 0px 8px;
					width: 32px;
				}
				.online-spacer {
					width: 114px;
				}
				.international-spacer {
					width: 66px;
				}
				/* Footer styles */
				capitec-button-bar {
					width: 100%;
					--theme-buttonbar-item-gap: 0px;
					--theme-buttonbar-padding: 0;
				}
				capitec-button-bar > capitec-content-box {
					--theme-container-padding-left: 24px;
					--theme-container-padding-top: 6px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 6px;
					--theme-layout-gap-spacing: 16px;
				}
				capitec-button-bar > capitec-check {
					--theme-check-label-spacing: 8px;
					--theme-label-font-weight: 500;
					--theme-label-font-size: 16px;
					--theme-label-font-color: #3a3a3a;
				}
				capitec-hyperlink {
					--theme-hyperlink-color: #009DE0;
				}
				.blur-card {
					--horizon-card-art-opacity: 20%;
				}

				/* Filter bar */
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				capitec-chip{
					width: 104px;
					margin: 0px 8px;
					--theme-chip-font-size: 12px;
					--theme-chip-label-padding-left: 15px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 20px;
					--theme-chip-font-weight: 500;
				}
				capitec-chip[label="All Cards"] {
					--theme-chip-label-padding-left: 24px;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 600;
				}
				.hide {
					display: none;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContainer()}
			${this._renderConfirmatioModal()}
		`;
	}

	_renderContainer() {
		return html`
			<capitec-card>
				<capitec-title-bar>
					<capitec-icon 
						size="medium"
						icon="system/arrow-left-action"
						@click="${() => this._back()}"
						data-automation-id="update-card-settings-landing-back">
					</capitec-icon>
					<capitec-label class="title-label" label="Update Card Settings" type="title"></capitec-label>
				</capitec-title-bar>

				${this._renderActionBar()}

				<capitec-content-box class="content-body">
					${this._renderContent()}
				</capitec-content-box>

				${this._renderFooter()}
			</capitec-card>
		`;
	}

	_renderActionBar() {
		return html`
			<capitec-action-bar class="card-settings-action-bar">
			<capitec-select
				data-automation-id="card-settings-card-type"
				label="Choose an option"
				.items=${Object.values(CARD_TYPE_LIST)}
				id-field="key"
				display-field="value"
				@value-changed="${(e) => this._filterCardsByType(e)}"
				tabindex=3
				select-mode="single">
			</capitec-select>
				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<capitec-chip 
							label="All Cards" 
							class="${this.filterBy === `ALL` ? `type-selected` : `type-normal`}" 
							@click="${() => this._filterCards(`ALL`)}">
						</capitec-chip>
						<capitec-chip 
							label="Debit Cards" 
							class="${this.filterBy === `DEBIT` ? `type-selected` : `type-normal`}" 
							@click="${() => this._filterCards(`DEBIT`)}">
						</capitec-chip>
						<capitec-chip 
							label="Credit Cards" 
							class="${this.filterBy === `CREDIT` ? `type-selected` : `type-normal`}" 
							@click="${() => this._filterCards(`CREDIT`)}">
						</capitec-chip>
					</capitec-group>
			</capitec-action-bar>
		`;
	}

	_renderContent() {
		return this.filteredCards.length > 0
		? html`
			${this._renderPrimaryCards()}
			${this._renderSupplementaryCards()}
			${this._renderVirtualCards()}`
		: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" class="no-cards-available" label="Client has no cards to display"></capitec-label>
		`;
	}

	_renderPrimaryCards() {
		const primaryCards = this.filteredCards.filter(card => card.cardDisplayType === `Primary_Card`);
		return primaryCards.length > 0 
		? html`
			<capitec-label
				class="primary-card-label"
				type="title"
				label="Primary cards"
				data-automation-id="update-card-settings-primary-cards">
			</capitec-label>

			<capitec-group
				class="card-group"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				wrap>
					${primaryCards.map((item, itemIndex) => this._renderPrimaryCardArt(item, itemIndex, `primary-card-art`))}
			</capitec-group>`
		: html``;
	}

	_renderPrimaryCardArt(card, index, automationId) {
		const originalEcommerceStatus = this.cards.find(item => item.cardNumber === card.cardNumber).ecommerce;
		const originalInternationalStatus = this.cards.find(item => item.cardNumber === card.cardNumber).internationalTransactions;

		return html`
			<horizon-card-art
				class="no-friendly-name ${originalEcommerceStatus || originalInternationalStatus ? `` : `blur-card`}"
				id="primaryCard-widget-${index}"
				data-automation-id="update-card-settings-${automationId}"
				.card="${card}"
				?disable-hover="${true}"
				context="cardSettings">
				${this._renderInforGroup(card)}
			</horizon-card-art>
		`;
	}

	_renderSupplementaryCards() {
		const supplementaryCards = this.filteredCards.filter(card => card.cardDisplayType === `Supplementary_Card`);
		return supplementaryCards.length > 0 
		? html`
			<capitec-label
				class="supplementary-card-label"
				type="title"
				label="Supplementary cards"
				data-automation-id="update-card-settings-supplementary-cards">
			</capitec-label>

			<capitec-group
				class="card-group"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				wrap>
					${supplementaryCards.map((item, itemIndex) => this._renderSupplementaryCardArt(item, itemIndex, `supplementary-card-art`))}
			</capitec-group>`
		: html``;
	}

	_renderSupplementaryCardArt(card, index, automationId) {
		const originalEcommerceStatus = this.cards.find(item => item.cardNumber === card.cardNumber).ecommerce;
		const originalInternationalStatus = this.cards.find(item => item.cardNumber === card.cardNumber).internationalTransactions;

		return html`
			<horizon-card-art
				class="no-friendly-name ${originalEcommerceStatus || originalInternationalStatus ? `` : `blur-card`}"
				id="supplementary-widget-${index}"
				data-automation-id="update-card-settings-${automationId}"
				.card="${card}"
				?disable-hover="${true}"
				context="cardSettings">
				${this._renderInforGroup(card)}
			</horizon-card-art>
		`;
	}

	_renderVirtualCards() {
		const virtualCards = this.filteredCards.filter(card => card.cardDisplayType === `Virtual_Card`);
		return virtualCards.length > 0 
		? html`
			<capitec-label
				class="primary-card-label"
				type="title"
				label="Virtual cards"
				data-automation-id="update-card-settings-virtual-cards">
			</capitec-label>

			<capitec-group
				class="card-group"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				wrap>
					${virtualCards.map((item, itemIndex) => this._renderVirtualCardArt(item, itemIndex, `virtual-card-art`))}
			</capitec-group>`
		: html``;
	}

	_renderVirtualCardArt(card, index, automationId) {
		const originalEcommerceStatus = this.cards.find(item => item.cardNumber === card.cardNumber).ecommerce;
		const originalInternationalStatus = this.cards.find(item => item.cardNumber === card.cardNumber).internationalTransactions;

		return html`
			<horizon-card-art
				class="${originalEcommerceStatus || originalInternationalStatus ? `` : `blur-card`}"
				id="virtual-widget-${index}"
				data-automation-id="update-card-settings-${automationId}"
				.card="${card}"
				?disable-hover="${true}"
				context="cardSettings">
				${this._renderInforGroup(card)}
			</horizon-card-art>
		`;
	}

	_renderInforGroup(card) {
		return html`
			<capitec-content-box slot="cardInfo" halign="left" valign="top" gap="clear">
				<horizon-label
					label="${card.cardDisplayName}"
					value="${card.maskedCardNumber}">
				</horizon-label>
				<horizon-label
					class="${card.cardDisplayType !== `Virtual_Card` ? `hide` : ``}"
					label="Friendly name"
					value="${card.cardFriendlyName || `-`}">
				</horizon-label>
				<hr/>
				<capitec-label class="label-status" label="Status"></capitec-label>
				${this._renderOnlineToggleGroup(card)}
				${this._renderInternationalToggleGroup(card)}
			</capitec-content-box>
		`;
	}

	_renderOnlineToggleGroup(card) {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="top" class="toggle-group">
					<capitec-label label="Online purchase(s)"></capitec-label>
					<capitec-spacer class="online-spacer"></capitec-spacer>
					<capitec-label label="${card.ecommerce ? `On` : `Off`}"></capitec-label>
					<capitec-toggle
						size="small"
						@value-changed=${(event) => this._toggleOnline(event, card.cardNumber)}
						?disabled=${!this.cards.find(item => item.cardNumber === card.cardNumber).ecommerce}
						?checked="${card.ecommerce}">
					</capitec-toggle>
			</capitec-group>
		`;
	}

	_renderInternationalToggleGroup(card) {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="top" class="toggle-group">
					<capitec-label label="International transactions"></capitec-label>
					<capitec-spacer class="international-spacer"></capitec-spacer>
					<capitec-label label="${card.internationalTransactions ? `On` : `Off`}"></capitec-label>
					<capitec-toggle
						size="small"
						@value-changed=${(event) => this._toggleInternational(event, card.cardNumber)}
						?disabled=${!this.cards.find(item => item.cardNumber === card.cardNumber).internationalTransactions}
						?checked="${card.internationalTransactions}">
					</capitec-toggle>
			</capitec-group>
		`;
	}

	_checkboxStatus(deactivationType) {
		const activeCards = this.cards.filter(card => card[deactivationType]);
		const filteredCards = this.filteredCards.filter(card => activeCards.find(item => item.cardNumber === card.cardNumber));
		const checkBoxValue = filteredCards?.every(item => item[deactivationType] === false);
		return checkBoxValue;
	}

	_isIndeterminate(deactivationType) {
		return this.filteredCards.every(card => !this.cards.find(item => item.cardNumber === card.cardNumber)[deactivationType]);
	}

	_renderFooter() {
		return html`
			<capitec-button-bar
				?hidden="${this.filteredCards.length === 0}">
				<capitec-content-box
					layout="horizontal"
					halign="left" 
					valign="center"
					gap="clear">
						<capitec-check
							id="deactivation-check-box"
							label="Deactivate all Online"
							?indeterminate = "${this._isIndeterminate(`ecommerce`)}"
							?checked=${this._checkboxStatus(`ecommerce`)}
							@value-change="${(e) => this._deactivateAllOnline(e)}">
						</capitec-check>
						<capitec-check
							id="deactivation-check-box"
							label="Deactivate all International"
							?indeterminate = "${this._isIndeterminate(`internationalTransactions`)}"
							?checked=${this._checkboxStatus(`internationalTransactions`)}
							@value-change="${(e) => this._decativateAllInternational(e)}">
						</capitec-check>
						<capitec-hyperlink 
							label="Deselect All" 
							@click="${() => this._deselectAll()}">
						</capitec-hyperlink>
						<capitec-spacer></capitec-spacer>
						<capitec-button 
							type="primary"
							label="Apply"
							?disabled="${this._getUpdatedCardsList().length === 0}"
							@click="${() => this._deactivateSelectedCards()}">
						</capitec-button>
				</capitec-content-box>
			</capitec-button-bar>`;
	}

	_renderConfirmatioModal() {
		return this.showDeactivateConfirmationModal
		? html`
		<horizon-confirm-card-settings-dialog
			.deactivateCardsList = "${this._getUpdatedCardsList()}"
			?ecommerceUpdated = "${this.ecommerceUpdated}"
			?internationalUpdated = "${this.internationalUpdated}"
			@on-cancel="${() => this.showDeactivateConfirmationModal = !this.showDeactivateConfirmationModal}"
			@on-confirm="${() => this._confirmDeactivation()}">
		</horizon-confirm-card-settings-dialog>
		`
		: html``;
	}
}

window.customElements.define(`horizon-update-card-settings`, UpdateCardSettings);