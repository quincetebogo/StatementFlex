import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { Utilities } from 'platform/Utilities';

import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/ConfirmCardSettings';

const CARD_TYPE_MAPPING = {
	DEBIT_MASTERCARD: `Debit card`,
	MASTERCARD_CREDIT: `Credit card`
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
			showDeactivateConfirmationModal: { type: Boolean }
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
				card.cardDisplayName = `Supplementary ${CARD_TYPE_MAPPING[card.cardType].toLowerCase()}`;
			} 
			card.cardDisplayName = CARD_TYPE_MAPPING[card.cardType];
		});

		this.updatedCards = Utilities.deepCopy(this.cards);
	}

	_loading() {
		this.dispatchEvent(new CustomEvent(`loading`));
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_getUpdatedCardsList() {
		const updatedCardsList = this.updatedCards.filter(updatedcard => {
			const card = this.cards.find(item => item.cardId === updatedcard.cardId); 
			return updatedcard.ecommerce !== card.ecommerce || updatedcard.internationalTransactions !== card.internationalTransactions;
		});

		return updatedCardsList;
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

	_toggleOnline(event, cardId) {
		const index = this.cards.findIndex(item => item.cardId === cardId);
		this.updatedCards[index].ecommerce = event.detail.new;
	}

	_toggleInternational(event, cardId) {
		const index = this.cards.findIndex(item => item.cardId === cardId);
		this.updatedCards[index].internationalTransactions = event.detail.new;
	}

	_deactivateAllOnline(event) {
		if (event.detail.new) {
			this.updatedCards.forEach(card => card.ecommerce = false);
		} else {
			this.updatedCards.forEach(card => card.ecommerce = this.cards.find(item => item.cardId === card.cardId).ecommerce);
		}
		this.requestUpdate();
	}

	_decativateAllInternational(event) {
		if (event.detail.new) {
			this.updatedCards.forEach(card => card.internationalTransactions = false);
		} else {
			this.updatedCards.forEach(card => card.internationalTransactions = this.cards.find(item => item.cardId === card.cardId).internationalTransactions);
		}
		this.requestUpdate();
	}

	_deactivateSelectedCards() {
		this.showDeactivateConfirmationModal = !this.showDeactivateConfirmationModal;
	}

	_confirmDeactivation() {
		// CS call to deactivate
		const response = [
			{
				card: `5284 **** **** 1212`,
				ecommerce: true
			},
			{
				card: `5284 **** **** 1213`,
				ecommerce: true
			},
			{
				card: `5284 **** **** 1214`,
				ecommerce: true
			},
			{
				card: `5284 **** **** 1215`,
				ecommerce: true
			},
			{
				card: `5284 **** **** 1216`,
				ecommerce: true
			}
		];

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.cardSettingsDeactivationStatus = response;
		this.horizonStore.setScreenDetails(screenDetails);

		this.horizonRouter.navigateToCardSettingsOutcome();
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
					--horizon-card-art-height: 452px
				}

				horizon-card-art:nth-child(n+3) {
					--theme-layout-gap-spacing: 0px;
				}

				.primary-cards {
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

				<capitec-content-box class="content-body">
					${this._renderContent()}
				</capitec-content-box>

				${this._renderFooter()}
			</capitec-card>
		`;
	}

	_renderContent() {
		return this.hasCardsAvailable
		? html`
			${this._renderPrimaryCards()}
			${this._renderSupplementaryCards()}`
		: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" class="no-cards-available" label="Client has no cards to fulfill this transaction"></capitec-label>
		`;
	}

	_renderPrimaryCards() {
		const primaryCards = this.updatedCards.filter(card => !card.supplementaryCard);
		return primaryCards.length > 0 
		? html`
			<capitec-label
				class="primary-card-label"
				type="title"
				label="Primary cards"
				data-automation-id="update-card-settings-primary-cards">
			</capitec-label>

			<capitec-group
				class="primary-cards"
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
		return html`
			<horizon-card-art
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
		const supplementaryCards = this.updatedCards.filter(card => card.supplementaryCard);
		return supplementaryCards 
		? html`
			<capitec-label
				class="supplementary-card-label"
				type="title"
				label="Supplementary cards"
				data-automation-id="update-card-settings-supplementary-cards">
			</capitec-label>

			<capitec-group
				class="supplementary-cards"
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
		return html`
			<horizon-card-art
				id="supplementary-widget-${index}"
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
					label="Credit card"
					value="${card.maskedCardNumber}">
				</horizon-label>
				<horizon-label
					label="Friendly name"
					value="${card.cardFriendlyName}">
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
						@value-changed=${(event) => this._toggleOnline(event, card.cardId)}
						?disabled=${!this.cards.find(item => item.cardId === card.cardId).ecommerce}
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
						@value-changed=${(event) => this._toggleInternational(event, card.cardId)}
						?disabled=${!this.cards.find(item => item.cardId === card.cardId).internationalTransactions}
						?checked="${card.internationalTransactions}">
					</capitec-toggle>
			</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-button-bar
				?hidden="${!this.hasCardsAvailable}">
				<capitec-content-box
					layout="horizontal"
					halign="left" 
					valign="center"
					gap="clear">
						<capitec-check
							label="Deactivate all Online"
							@value-change="${(e) => this._deactivateAllOnline(e)}">
						</capitec-check>
						<capitec-check
							label="Deactivate all International"
							@value-change="${(e) => this._decativateAllInternational(e)}">
						</capitec-check>
						<capitec-hyperlink 
							label="Deselect All" 
							@click="${() => this._deselect()}">
						</capitec-hyperlink>
						<capitec-spacer></capitec-spacer>
						<capitec-button 
							type="primary"
							label="Deactivate"
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
		@on-cancel="${() => this.showDeactivateConfirmationModal = !this.showDeactivateConfirmationModal}"
		@on-confirm="${() => this._confirmDeactivation()}">
		</horizon-confirm-card-settings-dialog>
		`
		: html``;
	}
}

window.customElements.define(`horizon-update-card-settings`, UpdateCardSettings);