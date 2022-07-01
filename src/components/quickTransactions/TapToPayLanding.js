import { Component, css, html } from 'platform/elements';

import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';

const CARD_TYPE_MAPPING = {
	DEBIT_MASTERCARD: `Debit card`,
	MASTERCARD_CREDIT: `Credit card`
};

export class TapToPayLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();

		this.hasCardsAvailable = false;
		this.showTapToPayAgreement = false;
		this.agreementResult = {};
	}

	// ---------------
	// PROPERTIES
	// ---------------

	/**
	 *  @typedef {Object} getAgreementsResponse Agreements to display or null if there was an error
	 */

	/**
	 *  @typedef {Object} updateAgreementResponse updated agreement or null if there was an error
	 */
	
	
	/**
	 * @callback getAgreementsCallback
	 * @returns {getAgreementsResponse}
	 */

	/**
	 * @callback updateAgreementCallback
	 * @returns {updateAgreementResponse}
	 */


	/**
	 * @property {Object} cards Object contains the list of client's cards
	 * @property {string} cifNumber The client's CIF number
	 * @property {string} title client's title (Mr/ Mrs)
	 * @property {string} lastName client's last name
	 * @property {String} voiceRecordingReference The Avaya/Presence Voice Recording ID
	 * @property {getAgreementsCallback} getAgreements Callback function to load agreements for displaying
	 * @property {updateAgreementCallback} updateAgreement Callback function to update agreement
	 */
	static get properties() {
		return {
			// Input properties
			cards: { type: Object },
			cifNumber: { type: String },
			title: { 
				type: String,
				attribute:`client-title`
			},
			lastName: { type: String },
			voiceRecordingReference: { type: String },
			hasCardsAvailable: { type: Boolean },

			getAgreements: { type: Object, attribute: false },
			updateAgreement: { type: Object, attribute: false },

			// Private internal properties
			showTapToPayAgreement: { attribute: false }
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
			if (card.isSupplementaryCard) {
				card.cardDisplayName = `Supplementary ${CARD_TYPE_MAPPING[card.cardType].toLowerCase()}`;
			} 
			card.cardDisplayName = CARD_TYPE_MAPPING[card.cardType];
		});
	}

	_loading() {
		this.dispatchEvent(new CustomEvent(`loading`));
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	_updateCards() {
		const index = this.cards.findIndex(card => card.cardId === this.selectedCard.cardId);
		this.cards[index].isContactlessCard = this.selectedCard.isContactlessCard;
	}

	_result(success, tapToPayDetails, failureReason) {
		this.dispatchEvent(new CustomEvent(`result`, { detail: { success: success, tapToPayDetails: tapToPayDetails, failureReason: failureReason } }));
	}


	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	async _toggleTapToPayClick(event) {
		this.selectedCard = this.cards.find(card => card.cardId === event.currentTarget.card.cardId);
		this.selectedCard.isContactlessActivated = event.detail.new;
		this._updateCards();

		const request = {
			cifNumber: this.cifNumber,
			tapToPayStatus: event.detail.new ? `TapToPayActivated` : `TapToPayDeactivated`,
			cardDetails: {
				cardId: this.selectedCard.cardId,
				cardExpiryYear: this.selectedCard.cardExpiryYear,
				cardExpiryMonth: this.selectedCard.cardExpiryMonth,
				cardSequenceNumber: this.selectedCard.cardSequenceNumber,
				cardDisplayName: this.selectedCard.cardDisplayName
			}
		};

		const result = await this.getAgreements(request);

		if (result) {
			this.agreementResult = result;
			this.showTapToPayAgreement = !this.UpdateshowTapToPayAgreement;
		}
	}

	_cancelClick() {
		this.selectedCard.isContactlessActivated = !this.selectedCard.isContactlessActivated;
		
		this._updateCards();
		this.showTapToPayAgreement = !this.showTapToPayAgreement;
	}

	async _agreeClick(event) {
		const tapToPayStatus = this.selectedCard.isContactlessActivated ? `ON` : `OFF`;

		const request = {
			tapToPayUpdate: {
				cardDetails: {
					cardId: this.selectedCard.cardId,
					cardExpiryMonth: this.selectedCard.cardExpiryMonth,
					cardExpiryYear: this.selectedCard.cardExpiryYear,
					cardSequenceNumber: this.selectedCard.cardSequenceNumber,
					cardDisplayName: this.selectedCard.cardDisplayName
				},
				tapToPayStatus: tapToPayStatus,
				customerId: this.cifNumber,
				voiceRecordingReference: this.voiceRecordingReference,
				screenRecordingReference: ``,
				agreementAccepted: event.detail.tapToPayAccepted,
				agreementContent: {
					agreementContentType: this.agreementResult.cardAgreement.agreementContent.agreementContentType,
					agreementContentData: this.agreementResult.cardAgreement.agreementContent.agreementContentData,
					documentId: this.agreementResult.cardAgreement.agreementContent.documentId
				},
				scriptContent: {
					scriptContentData: this.agreementResult.cardAgreement.scriptContent.scriptContentData,
					documentId: this.agreementResult.cardAgreement.scriptContent.documentId,
					scriptContentType: `HTML`
				},
				title: this.title,
				lastName: this.lastName
			}
		};

		const result = await this.updateAgreement(request);

		if (result) {
			this._result(true, { tapToPayStatus: tapToPayStatus, cardMaskedNumber: this.selectedCard.maskedCardNumber,
							cardType: this.selectedCard.cardType }, null);
		} else {
			this._result(false, { tapToPayStatus: tapToPayStatus, cardMaskedNumber: this.selectedCard.maskedCardNumber,
							cardType: this.selectedCard.cardType }, `Failed to update agreement`);
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
				}

				.alert-banner {
					--theme-alert-banner-height: 48px;
					width: 1032px;
					--theme-alert-banner-font-weight: 600;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-layout-gap-spacing: 18px;

				}

				horizon-alert-banner > label {
					height: 20px;
					width: 81px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					--theme-alert-banner-font-size: 14px;
					--theme-alert-banner-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				
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

				.alert-banner-paragraph{
					display: inline-block;
					font-weight: 500;
				}

				.primary-card-label{
					height: fit-content;
					width: 300px;
					--theme-label-title-font-size: 18px;
					--theme-label-font-color: #3E4547;
					--theme-label-title-font-family: "Hind Vadodara";
					--theme-label-title-font-weight: 600;
					--theme-label-letter-spacing: 40;
					--theme-label-line-height: 24px;
					--theme-layout-gap-spacing: 18px;
					padding-left: 8px;
				}

				.supplementary-card-label{
					height: fit-content;
					font-size: 18px;
					width: 300px;
					--theme-label-font-color: #3E4547;
					--theme-label-title-font-family: "Hind Vadodara";
					--theme-label-title-font-weight: 600;
					--theme-label-letter-spacing: 0;
					--theme-label-line-height: 24px;
					--theme-layout-gap-spacing: 18px;
					padding-left: 8px;
				}

				capitec-title-bar {
					display: -webkit-inline-box;
				}

				horizon-card-art {
					margin-bottom: 24px;
					--horizon-card-art-box-shadow:none!important;
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
					--theme-icon-size-medium: 26px;
				}

				capitec-content-box > capitec-label[type="title"] {
					margin: 15px 0px 16px;
					text-align: center;

					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
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
			${this._renderTapToPayAgreement()}
		`;
	}

	_renderContainer() {
		return html`
			<capitec-card class="tap-to-pay-container">
				<capitec-title-bar>
					<capitec-icon 
						size="medium"
						icon="system/arrow-left-action"
						@click="${() => this._back()}"
						data-automation-id="tap-to-pay-landing-back">
					</capitec-icon>
					<capitec-label class="title-label" label="Tap to Pay" type="title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box class="content-body">
					${this._renderTapToPayContent()}
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderTapToPayContent() {
		return this.hasCardsAvailable
		? html`
			<horizon-alert-banner
				class="alert-banner"
				type="info"
				label="Notify Client:">
					<p class="alert-banner-paragraph">
						After you switch tap to pay on, you first have to insert your card and PIN at a card machine or ATM to make it active on your card.
					</p>
			</horizon-alert-banner>

			${this._renderPrimaryCards()}
			${this._renderSupplementaryCards()}`
		: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" label="Client has no cards to fulfill this transaction"></capitec-label>
		`;
	}

	_renderPrimaryCards() {

		const primaryCards = this.cards.filter(card => !card.isSupplementaryCard && card.isContactlessCard);
		return primaryCards.length > 0 
		? html`
			<capitec-label
				class="primary-card-label"
				type="title"
				label="Primary cards"
				data-automation-id="tap-to-pay-landing-primary-cards">
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
				data-automation-id="tap-to-pay-landing-${automationId}"
				.card="${card}"
				disable-hover="${true}"
				context="tap-to-pay"
				.tapToPayStatus="${card.isContactlessActivated}"
				@toggle-agreement="${(event) => this._toggleTapToPayClick(event)}">
			</horizon-card-art>
		`;
	}

	_renderSupplementaryCards() {
		const supplementaryCards = this.cards.filter(card => card.isSupplementaryCard && card.isContactlessCard);
		return !supplementaryCards 
		? html`
			<capitec-label
				class="supplementary-card-label"
				type="title"
				label="Supplementary cards"
				data-automation-id="tap-to-pay-landing-supplementary-cards">
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
				id="supplementaryCard-widget-${index}"
				data-automation-id="tap-to-pay-landing-${automationId}"
				.card="${card}"
				disable-hover="${true}"
				context="tap-to-pay"
				.tapToPayStatus="${card.isContactlessActivated}"
				@toggle-agreement="${(event) => this._toggleTapToPayClick(event)}">
			</horizon-card-art>
		`;
	}

	_renderTapToPayAgreement() {
		return this.showTapToPayAgreement
			? html`
				<horizon-tap-to-pay-agreement
					.selectedCard="${this.selectedCard}"
					.agreementResult="${this.agreementResult}"
					@on-agree="${(e) => this._agreeClick(e)}"
					@cancel="${() => this._cancelClick()}">
				</horizon-tap-to-pay-agreement>`
			: html``;
	}
}

window.customElements.define(`horizon-tap-to-pay-landing`, TapToPayLanding);