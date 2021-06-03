import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';


export class TapToPayLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();

		this.showTapToPayAgreement = false;
		this.agreementResult = {};
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// ---------------
	// PROPERTIES
	// ---------------

	/**
	 *
	 * @property {Object} cards Object contains the list of client's card
	 *
	 * @readonly
	 * @static
	 * @memberof TapToPayLanding
	 */
	static get properties() {
		return {
			cards: { type: Object },
			showTapToPayAgreement: { attribute: false },
			getAgreements: { type: Object },
			updateAgreement: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();
		this.horizonStore.recoverState();
	
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
	}

	_updateCards() {
		const index = this.cards.findIndex(card => card.cardId === this.selectedCard.cardId);
		this.cards[index].isContactlessCard = this.selectedCard.isContactlessCard;
	}

	_handlingAgreementsFailure() {
		// send along with detail
		// dummy function for now
		alert(`Failed to call the service`);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	async _toggleTapToPayAgreement(event) {

		this.selectedCard = this.cards.find(card => card.cardId === event.currentTarget.card.cardId);
		this.selectedCard.isContactlessActivated = event.detail.new;
		this._updateCards();
		
		const request = {
			tapToPayStatus: event.detail.new ? `TapToPayActivated` : `TapToPayDeactivated`,
			cardDetails: {
				cardId: this.selectedCard.cardId,
				cardExpiryYear: this.selectedCard.cardExpiryYear,
				cardExpiryMonth: this.selectedCard.cardExpiryMonth,
				cardSequenceNumber: this.selectedCard.cardSequenceNumber
			}
		};
		const result = await this.getAgreements(request);

		if (result.succeeded) {
			this.agreementResult = result.result;
			this.showTapToPayAgreement = !this.UpdateshowTapToPayAgreement;
		} else {
		// error handling comes here
		// failure screen
		}
	}

	_cancel() {
		this.selectedCard.isContactlessActivated = !this.selectedCard.isContactlessActivated;
		
		this._updateCards();
		this.showTapToPayAgreement = !this.showTapToPayAgreement;
	}

	async _onAgreeClicked(event) {
		const state = this.horizonStore.getIncomingCallDetails();
		const callerInformation = this.horizonStore.getCallerInformation();

		const tapToPayStatus = this.selectedCard.isContactlessActivated;
		const request = {
				cardDetails: {
					cardId: this.agreementResult.cardAgreement.cardId,
					cardExpiryYear: this.selectedCard.cardExpiryYear,
					cardExpiryMonth: this.selectedCard.cardExpiryMonth,
					cardSequenceNumber: this.selectedCard.cardSequenceNumber
				  },
				  tapToPayStatus: tapToPayStatus ? `ON` : `OFF`,
				  customerId: callerInformation.cifNumber,
				  voiceRecordingReference: event.detail.voiceRecordingReference,
				  screenRecordingReference: ``,
				  agreementAccepted: event.detail.tapToPayAccepted,
				  agreementContent: {
					agreementContentData: this.agreementResult.cardAgreement.agreementContent.agreementContentData,
					documentId: this.agreementResult.cardAgreement.agreementContent.documentId,
					agreementContentType: this.agreementResult.cardAgreement.agreementContent.agreementContentType
				  },
				  scriptContent: {
					scriptContentData: this.agreementResult.cardAgreement.scriptContent.scriptContentData,
					documentId: this.agreementResult.cardAgreement.scriptContent.documentId,
					scriptContentType: `HTML`
				  }
				};

			const result = await this.updateAgreement(request);

			if (result.succeeded) {
				this.agreementResult = result.result;
				const cardMaskeNumber = this.selectedCard.maskedCardNumber,
				tapToPayDetails = {
					cardMaskeNumber,
					request
				};
				
				this.horizonStore.saveState(tapToPayDetails);
				this.horizonRouter.navigateToTapToPaySuccess();
			} else {
			// error handling comes here
			// failure screen
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
				width: 100%;
				height: 100%;
			}

			.alert-banner {
				--theme-alert-banner-height: 48px;
				width: 1032px;
				--theme-alert-banner-font-weight: 600;
				--theme-alert-banner-info-background-color: #DAF2F4;
				--theme-layout-gap-spacing: 18px;

			}

			capitec-alert-banner > label {
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
				--horizon-card-art-box-shadow:none!important;
			}

			.primary-cards {
				--theme-layout-gap-spacing: 24px;
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
						size="small"
						icon="system/back-action"
						@click="${() => this._back()}">
					</capitec-icon>
					<capitec-label class="title-label" label="Tap to Pay" type="title"></capitec-label>
				</capitec-title-bar>

				<capitec-content-box class="content-body">
					${this._renderTapToPayBody()}
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderTapToPayBody() {
		return html`
			<capitec-alert-banner
				class="alert-banner"
				type="info"
				label="Notify Client:">
					<p class="alert-banner-paragraph">
						After you switch tap to pay on, you first have to insert your card and PIN at a card machine or ATM to make it active on your card.
					</p>
			</capitec-alert-banner>

			${this._renderPrimaryCards()}
			${this._renderSupplementaryCards()}
		`;
	}

	_renderPrimaryCards() {

		const primaryCards = this.cards.filter(card => !card.isSupplementaryCard && card.isContactlessCard);

		return html`
			<capitec-label
				class="primary-card-label"
				type="title"
				label="Primary cards">
			</capitec-label>

			<capitec-group
				class="primary-cards"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				grow="horizontal">
					${primaryCards.map((item, itemIndex) => this._renderPrimaryCardArt(item, itemIndex))}
			</capitec-group>
		`;
	}

	_renderPrimaryCardArt(card, index) {
		return html`
			<horizon-card-art
				id="primaryCard-widget-${index}"
				.card="${card}"
				disable-hover="${true}"
				context="tap-to-pay"
				.tapToPayStatus="${card.isContactlessActivated}"
				@toggle-agreement="${(event) => this._toggleTapToPayAgreement(event)}">
			</horizon-card-art>
		`;
	}

	_renderSupplementaryCards() {
		const supplementaryCards = this.cards.filter(card => card.isSupplementaryCard && card.isContactlessCard);
		return html`
			<capitec-label
				class="supplementary-card-label"
				type="title"
				label="Supplementary cards">
			</capitec-label>

			<capitec-group
				class="supplementary-cards"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				grow="horizontal">
					${supplementaryCards.map((item, itemIndex) => this._renderSupplementaryCardArt(item, itemIndex))}
			</capitec-group>
		`;
	}

	_renderSupplementaryCardArt(card, index) {
		return html`
			<horizon-card-art
				id="supplementaryCard-widget-${index}"
				.card="${card}"
				disable-hover="${true}"
				context="tap-to-pay"
				.tapToPayStatus="${card.isContactlessActivated}"
				@toggle-agreement="${(event) => this._toggleTapToPayAgreement(event)}">
			</horizon-card-art>
		`;
	}

	_renderTapToPayAgreement() {
		return this.showTapToPayAgreement
			? html`
				<horizon-tap-to-pay-agreement
					.selectedCard="${this.selectedCard}"
					.agreementResult="${this.agreementResult}"
					@on-agree="${(e) => this._onAgreeClicked(e)}"
					@cancel="${() => this._cancel()}">
				</horizon-tap-to-pay-agreement>`
			: html``;
	}
}

window.customElements.define(`horizon-tap-to-pay-landing`, TapToPayLanding);