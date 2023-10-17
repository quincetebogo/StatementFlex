import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonStore } from 'app/store/HorizonStore';

/**
 * StopCard Details View
 *
 * Events Raised
 * -------------
 * back
 * 
 * @export
 * @class CardHistory
 * @extends {Component}
 */
	const CARD_STOP_REASON = {
				LOST: `Lost`,
				STOLEN: `Stolen`,
				DAMAGED: `Damaged`,
				ACCOUNT_CLOSED: `Account closed`,
				EXPIRED: `Expired`,
				SUSPECTED_FRAUD: `Suspected fraud`,
				RESTRICTED: `Restricted`,
				SARB_INSTRUCTION: `Sarb instruction`,
				FOREX_CONTRAVENTION: `Forex contravention`,
				CARD_NOT_REQUIRED_BY_CLIENT: `Card not required by client`
	};

	const FILTERCARD_BY = {
		CARD_TYPE: `CARD_TYPE`,
		TEXT: `TEXT`
	};

	const RENDERCARD_CHIPS = {
		CARD_TYPE: `All`,
		TEXT: ``
	};
	

export class CardHistory extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.callerInformation = this.horizonStore.getCallerInformation(); // To get the client name
		
		this.cardHistoryDetails = null;
		this.supCardLists = [];
		this.primaryCardLists = [];
		this.virtualCardLists = [];
		this.stopCardHistoryLists = [];
		this.filterStopCards = [];
		this.flag = false;
		this.labelAll = ``;
		this.labelPrimary = ``;
		this.labelSuplmn = ``;
		this.labelVirtual = ``;
		this.searchTextlabel = `Search card number or date`;
		this.searchFilterflag = false;
	}
	

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] = `All`;
		RENDERCARD_CHIPS[FILTERCARD_BY.TEXT] = ``;

		this.hasStopCardsAvailable = this.cardHistoryDetails.cards.length > 0;
		this._collectionStopCards();
	}
	
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {cardHistory} cardHistory Stopped card details
	 *
	 */
	static get properties() {
		return {
			cardHistoryDetails: { type: Object }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		// initate back to stopCard landing page (on back arrow)
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_filterCardDetails(e) {
		const label = e.target.label.split(` `);
		RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] = label[0];
		this._displayStopCardDetails(RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE]);
	}

	_searchTextChange(event) {
		RENDERCARD_CHIPS[FILTERCARD_BY.TEXT] = event.detail.new;
		this._refineSearch();
	}

	_searchTextBlur(e) {
		if (isNullorEmpty(RENDERCARD_CHIPS[FILTERCARD_BY.TEXT])) {
			this.searchTextLabel = `Search card number or date`;
			return true;
		}

		this.searchTextLabel = ``;
	}

	_closeChip(type) {
		this._clearFilter(type);
		this._refineSearch();
	}

	_clearFilter(type) {
		const text = () => this._clearTextFilter();

		const resetForfilters = {
			'TEXT': text
		};

		RENDERCARD_CHIPS[type] = ``;
		if (resetForfilters[type]) {
			resetForfilters[type]();
		}
	}

	_clearTextFilter() {
		this.searchTextLabel = `Search card number or date`;

		const searchTextField = this.shadowRoot.getElementById(`text-filter`);
		searchTextField.clearVisible = false;
	}

	_refineSearch() {
		// Assigning the raw data before performing the filter
		this.filterStopCards = this.cardHistoryDetails.cards;

		if (RENDERCARD_CHIPS[FILTERCARD_BY.TEXT]) {
			const searchText = RENDERCARD_CHIPS[FILTERCARD_BY.TEXT];
			
			const searchTextResult = this.filterStopCards.filter(item => item.maskedCardNumber.toString().indexOf(searchText) !== -1 || item.cardStopDateTime.toLowerCase().includes(searchText.toLowerCase()));
				
			this.filterStopCards = Array.from(new Set([...searchTextResult.flat()]));
			this.searchFilterflag = true;
		}
		this._collectionStopCards();
		this.requestUpdate();
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	_collectionStopCards() {

		if (this.filterStopCards.length === 0 && this.searchFilterflag === false) {
			this.filterStopCards = this.cardHistoryDetails.cards;
		}
		this.filterStopCards.sort((a, b) => new Date(b.cardStopDate) - new Date(a.cardStopDate));
		this.primaryCardLists = [];
		this.supCardLists = [];
		this.virtualCardLists = [];
		
		for (let i = 0; i < this.filterStopCards.length; i++) {
			const cardDisplayName = this.filterStopCards[i].cardDisplayName.toLowerCase();

			const cardStopDate = new Date(this.filterStopCards[i].cardStopDate);
			const stopDate = `${formatDate(cardStopDate, `dd mmm yyy, hh:mm:ss`)}`;
			Object.assign(this.filterStopCards[i], { [`cardStopDateTime`]: stopDate });

			if (cardDisplayName.includes(`virtual`)) {
				Object.assign(this.filterStopCards[i], { [`cardName`]: `Virtual Card` });
				} else if (cardDisplayName.includes(`debit`)) {
						Object.assign(this.filterStopCards[i], { [`cardName`]: `Debit Card` });
					} else {
						Object.assign(this.filterStopCards[i], { [`cardName`]: `Credit Card` });
					}
				
				if (this.filterStopCards[i].supplementaryCard === true) {

					this.supCardLists.push(this.filterStopCards[i]);
				} else if (cardDisplayName.includes(`virtual`)) {

					this.virtualCardLists.push(this.filterStopCards[i]);
				} else {
					this.primaryCardLists.push(this.filterStopCards[i]);
				}
		}
		
	
	this.labelAll = `All (${this.filterStopCards.length})`;
	this.labelPrimary = `Primary (${this.primaryCardLists.length})`;
	this.labelSuplmn = `Supplementary (${this.supCardLists.length})`;
	this.labelVirtual = `Virtual (${this.virtualCardLists.length})`;


}
	
_displayStopCardDetails(cardType) {

	this.flag = false;
	let cardsOfArray = [];
	this.stopCardHistoryLists = [];

	if (this.filterStopCards.length === 0) {
		this.flag = true;
	} else if (cardType === `All`) {

			this.stopCardHistoryLists = [];
			if (this.primaryCardLists.length !== 0) {
				Object.assign(this.primaryCardLists, { [`labelCard`]: `Primary card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(this.primaryCardLists));
			}
			if (this.supCardLists.length !== 0) {
				Object.assign(this.supCardLists, { [`labelCard`]: `Supplementary card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(this.supCardLists));
			}
			if (this.virtualCardLists.length !== 0) {
				Object.assign(this.virtualCardLists, { [`labelCard`]: `Virtual card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(this.virtualCardLists));
			}

		} else if (cardType === `Primary`) {
			this.stopCardHistoryLists = [];
			if (this.primaryCardLists.length !== 0) {
				cardsOfArray = this.primaryCardLists;
				Object.assign(cardsOfArray, { [`labelCard`]: `Primary card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(cardsOfArray));
			} else {
				this.flag = true;
			}
		} else if (cardType === `Supplementary`) {
			this.stopCardHistoryLists = [];
			if (this.supCardLists.length !== 0) {
				cardsOfArray = this.supCardLists;
				Object.assign(cardsOfArray, { [`labelCard`]: `Supplementary card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(cardsOfArray));
			} else {
				this.flag = true;
			}
		} else {
			this.stopCardHistoryLists = [];
			if (this.virtualCardLists.length !== 0) {
				cardsOfArray = this.virtualCardLists;
				Object.assign(cardsOfArray, { [`labelCard`]: `Virtual card(s)` });
				this.stopCardHistoryLists.push(this._cardDetails(cardsOfArray));
			} else {
				this.flag = true;
			}
		} 
	this.requestUpdate();
	return this.stopCardHistoryLists;
}

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
				.card {
					width: 1066px;
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
					
				.card > capitec-group {
					height: 865px;
				}

				.stopCard-action-bar {
					height: 64px;
					width: var(--horizon-center-panel-width, 1064px);
					border-bottom: 1px solid #E1E1E1;
				}

				.stopCard-action-bar > capitec-text-field {
					height: 47px;
					width: 388px;
					padding-left: 8px;
				
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 16px;
					--theme-layout-gap-spacing: 8px; 
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
				}

				.stopCard-action-bar > capitec-chip{
					margin: 0px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
					--theme-chip-font-weight: 650;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 200;
					--theme-chip-padding: 15px;
				}
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
					--theme-chip-padding: 15px;
					
				}
				capitec-title-bar {
					height: 40px;
					width: 1060px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 15px 24px 6px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				.titlebar {
					height: 60px;
					width: 33%;
					padding: 10px 1px 12px 16px;

					--horizon-label-text-height: 40px;
					--horizon-label-text-line-height: 35px;
					--horizon-label-text-font-size: 25px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-weight: 600;
				}

				.heading {
					height: 40px;
					width: 33%;
					padding: 10px 1px 0px 25px;
					--horizon-label-text-height: 40px;
					--horizon-label-text-line-height: 35px;
					--horizon-label-text-font-size: 20px;
					--horizon-label-text-font-weight: 610;
					--horizon-label-text-color: #3A3A3A;
				}

				.left-arrow {
					cursor: pointer;
					margin-bottom: 5px;
				}
				
				.cardHistory-Details > horizon-label {
					width: 200px;
					height: 100%;
					font-weight: 300;
					justify-content: left;
					padding: 12px 0px 12px 16px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}

				.cardHistory-Details > horizon-label[label="Cardholder"] {
					width: 230px;
				}

				.cardHistory-Details > horizon-label[label="Date and Time Stopped"] {
					width: 230px;
				}

				.vertical-line{
					height: 48px;
					width: 1px;
					background-color: #E1E1E1;
				}
				.cardHistoryContain {
					width: auto;
					height: auto;
					
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				
				.noCardHistory {
					width: 800px;
					height: 64px;
					
					--theme-container-padding-left: 300px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}

				.cardHistoryContain > capitec-card.border-debit{
					border-left: 4px solid #009DE0;
				}
				.cardHistoryContain > capitec-card.border-credit{
					border-left: 4px solid #E61414;
				}
				
				.no-Cardresults {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.no-Cardresult-group {
					width: 1060px;
					margin-top: 130px;
				}

				/* Chip Bar Styles */
				.filter-bar {
					width: 1062px;
					--theme-actionbar-min-height: 48px;
					--theme-actionbar-padding: 8px 0px 8px 16px;
				}
				.filter-bar > capitec-label {
					height: 20px;
					width: auto;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}
				.filter-bar > capitec-button {
					height: 40px;
					margin: 0px;

					--theme-button-font-size : 14px;
					--theme-button-line-height: 10px;
					--theme-button-font-weight: 600;
				}
				.client-has-no-card {
					margin: 15px 0px 16px;
					--theme-label-font-color: #3A3A3A;
				}
				.cardHistoryContain > capitec-card {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
					width: 1030px;
					margin-left: 15px;
					min-height: 80px;
					text-align: left;
				}

			`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
		<capitec-card 
			data-automation-id="fixed-term-savings-details"
			class="card">
			<capitec-group layout="Horizontal" gap="line">
				<capitec-title-bar 
						type="clear" 
						row="1" 
						column="1">
							<img 
								data-automation-id="stop-card-back"
								src="/images/insure/blue-left-arrow.svg" class="left-arrow"
								@click="${() => this._back()}"/>
							<horizon-label class = "titlebar"
								label="Stop Card History" 
								type="title">
							</horizon-label>
				</capitec-title-bar>
				${this._renderActionBar()}
				${this._renderFilterBar()}
			
				<capitec-content-box class="${this.hasStopCardsAvailable ? `cardHistoryContain` : `noCardHistory`}">
					${this._renderStopCardHistoryContent()}
				</capitec-content-box>
			</capitec-group>
		</capitec-card>
	`;
	}

	_renderStopCardHistoryContent() {
		return this.hasStopCardsAvailable
		? html`
				${this._collectionStopCards()}
				${this._displayStopCardDetails(RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE])}
				${this._renderNoResults()}`
		: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" class="client-has-no-card" label="Client has no cards to fulfill this transaction"></capitec-label>`;
	}

	_renderActionBar() {
		return html`
		<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="stopCard-action-bar">
			<capitec-text-field id="text-filter" data-automation-id="stopCard-history-text-filter" 
			label="${this.searchTextlabel}" 
			type="search"
			keyboardMode="alpha-numeric"
			@key-input="${(e) => this._searchTextChange(e)}"
			@value-change="${(e) => this._searchTextChange(e)}"
			@focus="${(e) => this.searchTextLabel = ``}"
			@blur="${(e) => this._searchTextBlur(e)}"
			value="${RENDERCARD_CHIPS[FILTERCARD_BY.TEXT]}">
			</capitec-text-field>
			
			<capitec-chip 
					label="${this.labelAll}" class="${RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] === `All` ? `type-selected` : `type-normal`}"
					@click="${(e) => this._filterCardDetails(e)}" >
			</capitec-chip>
			<capitec-chip 
					label="${this.labelPrimary}" class="${RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] === `Primary` ? `type-selected` : `type-normal`}"
					@click="${(e) => this._filterCardDetails(e)}" >
			</capitec-chip>
			<capitec-chip 
					label="${this.labelSuplmn}" class="${RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] === `Supplementary` ? `type-selected` : `type-normal`}"
					@click="${(e) => this._filterCardDetails(e)}" >
			</capitec-chip>
			<capitec-chip 
					label="${this.labelVirtual}" class="${RENDERCARD_CHIPS[FILTERCARD_BY.CARD_TYPE] === `Virtual` ? `type-selected` : `type-normal`}"
					@click="${(e) => this._filterCardDetails(e)}" >
			</capitec-chip>
		</capitec-group>
		`;
	}


	_cardDetails(lists) {
		return html`
		<horizon-label class = "heading" label=${lists.labelCard} type="title">
		</horizon-label>
		${lists.map((card) => html`
		<capitec-card class="${card.cardName === `Credit Card` ? `border-credit` : `border-debit`}">
		<capitec-group class="cardHistory-Details" layout="horizontal" halign="left" valign="center" gap="none">
		
						
						<horizon-label
							label=${card.cardName}
							value=${card.maskedCardNumber}>
						</horizon-label>

						<div class="vertical-line"></div>

						<horizon-label
							label="Cardholder"
							value=${this.callerInformation.name}>
						</horizon-label>
						<horizon-label
							label="Date and Time Stopped"
							value=${card.cardStopDateTime}>
						</horizon-label>
						<horizon-label
							label="Reason"
							value=${CARD_STOP_REASON[card.cardStopReason] || card.cardStopReason}>
						</horizon-label>
						
		</capitec-group>
		</capitec-card>`)}
		`;
	}

	_renderFilterBar() {
		return RENDERCARD_CHIPS[FILTERCARD_BY.TEXT] !== `` 
			? html`
				<capitec-action-bar
					id="active-filters"
					class="filter-bar"
					data-automation-id="transaction-history-active-filters">
						<capitec-label label = "Active filters:"></capitec-label>
						${this._renderTextChip()}
					</capitec-action-bar>`
				: html``;
	}

	_renderTextChip() {
		return !isNullorEmpty(RENDERCARD_CHIPS[FILTERCARD_BY.TEXT])
			? html`
				<capitec-chip
					id="${FILTERCARD_BY.TEXT}"
					label="${RENDERCARD_CHIPS[FILTERCARD_BY.TEXT]}"
					@remove="${() => this._closeChip(FILTERCARD_BY.TEXT)}"
					closable>
				</capitec-chip>`
			: html``;
	}

	_renderNoResults() {
		return this.flag === true
		? html`
			<capitec-group
				class="no-Cardresult-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"
						class="document-icon"/>
					<capitec-label
						class="no-Cardresults"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>`
			: html``;
	}
}


customElements.define(`horizon-card-history`, CardHistory);

/**
* When left arrow on the title bar is clicked to go back to the Stop card landing screen
*
* @example
* <horizon-card-history ... @back="${this._handler}"></horizon-card-history>
*
* @event CardHistory#back
* @type {Object} - N/A
*/