import { Component, css, html } from 'platform/elements';
import { formatCurrency, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';
import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/UpdateCardLimits';
import 'app/components/dialogs/common/DiscardChanges';
import 'app/components/dialogs/common/ConfirmSelection';
import 'app/components/common/MultiLineLabel';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	UPDATE_LIMITS: 1,
	DISCARD: 2
};

const CARD_DISPLAY_TYPES = {
	PRIMARY_CARD: `Primary_Card`,
	SUPPLEMENTARY_CARD: `Supplementary_Card`,
	VIRTUAL_CARD: `Virtual_Card`
};

const CARD_TYPE_MAPPING = {
	DEBIT_MASTERCARD: `Debit`,
	MASTERCARD_CREDIT: `Credit`,
	DEBIT_MASTERCARD_VIRTUAL: `Debit`
};

const CARD_TYPES = {
	DEBIT: `Debit`,
	CREDIT: `Credit`,
	DUAL: `Dual`
};

const LIMIT_TYPES = {
	PERMANENT: `Permanent`,
	TEMPORARY: `Temporary`
};

/**
 * This component implements the update card limits for Quick Transactions
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class CardLimitsLanding
 * @extends {Component}
 */
export class CardLimitsLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// private properites
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.showUpdateLimitsModal = false;
		this.showDiscardChangesModal = false;
		this.showConfirmSelectionModal = false;

		this.primaryCards = [];
		this.supplementaryCards = [];
		this.virtualCards = [];

		this.expanderSubtitle = [];
		this.expanderHeaders = [];
		this._telemetry = HorizonTelemetry.instance;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *  @typedef {Object} getCardLimitsAgreement Card limits agreements to display or null if there was an error
	 */

	/**
	 *  @typedef {Object} getPermanentLimits Get permanent limits to display or null if there was an error
	 */

	/**
	 *  @typedef {Object} getTemporaryLimits Get temporary limits to display or null if there was an error
	 */

	/**
	 *  @typedef {Object} updatePermanentLimits updated permanent limits & agreement or null if there was an error
	 */

	/**
	 *  @typedef {Object} updateTemporaryLimits updated temporary limits & agreement or null if there was an error
	 */

	/**
	 * @callback getCardLimitsAgreementsCallback
	 * @returns {getCardLimitsAgreement}
	 */

	/**
	 * @callback getPermanentLimitsCallback
	 * @returns {getPermanentLimits}
	 */

	/**
	 * @callback getTemporaryLimitsCallback
	 * @returns {getTemporaryLimits}
	 */

	/**
	 * @callback updatePermanentLimitsCallback
	 * @returns {updaterermanentLimits}
	 */

	/**
	 * @callback updateTemporaryLimitsCallback
	 * @returns {updateTemporaryLimits}
	 */

	/**
	 *
	 * @property {Object} cards Object contains the list of client's card
	 * @property {String} cifNumber The client's account/cifNumber
	 * @property {String} voiceRecordingReference The Avaya/Presence Voice Recording ID
	 * @property {getCardLimitsAgreementsCallback} getCardLimitsAgreement Callback function to load limits agreements for displaying
	 * @property {getPermanentLimitsCallback} getPermanentLimits Callback function to get permanent limits
	 * @property {getTemporaryLimitsCallback} getTemporaryLimits Callback function to get temporary limits
	 * @property {updatePermanentLimitsCallback} updatePermanentLimits Callback function to update permanent limits & agreements
	 * @property {updateTemporaryLimitsCallback} updateTemporaryLimits Callback function to update temporary limits & agreements
	 *
	 * @readonly
	 * @static
	 * @memberof CardLimitsLanding
	 */
	static get properties() {
		return {
			cards: { type: Object },
			cifNumber: { type: String },
			voiceRecordingReference: { type: String },

			getCardLimitsAgreement: { type: Object, attribute: false },
			getPermanentLimits: { type: Object, attribute: false },
			getTemporaryLimits: { type: Object, attribute: false },
			updatePermanentLimits: { type: Object, attribute: false },
			updateTemporaryLimits: { type: Object, attribute: false },

			getAgreement: { type: String },

			renderMode: { attribute: false },
			showUpdateLimitsModal: { attribute: false },
			showConfirmSelectionModal: { attribute: false },
			showDiscardChangesModal: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._telemetry.startSpan(QuickTransactionEvents.CARD_LIMITS, {
			"screen": TelemetryScreen.CARD_LIMITS_LANDING
		});

		this._initialise();
		this.primaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.PRIMARY_CARD);
		this.supplementaryCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD);
		this.virtualCards = this.cards.filter(card => card.cardDisplayType === CARD_DISPLAY_TYPES.VIRTUAL_CARD);
	}

	disconnectedCallback() {
		this._telemetry.endSpan(QuickTransactionEvents.CARD_LIMITS, {
			"screen": TelemetryScreen.CARD_LIMITS_LANDING
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	async _getLimitsAgreement(card, newLimits, tapToPayStatus) {
		const cardId = this._updateType === `Debit` && card.linkedCardLimits ? card.linkedCardId : card.cardId;
		const request = {
			cardDetails: {
				cardDetails: {
					cardId: cardId,
					accountId: card.primarySavingsAccountId || card.primaryCreditAccountId,
                    customerId: this.cifNumber,
					cardExpiryYear: card.cardExpiryYear,
					cardExpiryMonth: card.cardExpiryMonth,
					cardSequenceNumber: card.cardSequenceNumber
				},
				permanentCashAmountLimit: newLimits.permanentCashAmountLimit,
				permanentPurchaseAmountLimit: newLimits.permanentPurchaseAmountLimit,
				permanentCnpAmountLimit: newLimits.permanentCnpAmountLimit,
				tempCashAmountLimit: newLimits.tempCashAmountLimit,
				tempPurchaseAmountLimit: newLimits.tempPurchaseAmountLimit,
				tempCnpAmountLimit: newLimits.tempCnpAmountLimit
			},
			tapToPayStatusChange: tapToPayStatus
		};
		if (this._limitType === LIMIT_TYPES.PERMANENT) {
			request.cardDetails.tempCashAmountLimit = 0;
			request.cardDetails.tempCnpAmountLimit = 0;
			request.cardDetails.tempPurchaseAmountLimit = 0;
		}
		const result = await this.getCardLimitsAgreement(request);
		
		if (result) {
			 return result;
		}

		return null;
	}

	async _updateLimitsAgreement(event) {
		const cardDetails = event.detail.card;
		let tapToPayDetails = null;
		let updateResult = {};

		if (!event.detail.istapToPayUnChanged) {
			tapToPayDetails = {
				cardDetails: {
					cardId: cardDetails.linkedCardLimits && this._updateType === `Debit` ? cardDetails.linkedCardId : cardDetails.cardId,
					cardExpiryMonth: cardDetails.cardExpiryMonth,
					cardExpiryYear: cardDetails.cardExpiryYear,
					cardSequenceNumber: cardDetails.cardSequenceNumber
				},
				tapToPayStatus: event.detail.tapToPayStatus ? `ON` : `OFF`,
				customerId: this.cifNumber,
				voiceRecordingReference: this.voiceRecordingReference,
				screenRecordingReference: ``,
				agreementAccepted: event.detail.agreementAccepted,
				agreementContent: event.detail.agreements.tapToPayAgreement.agreementContent,
				scriptContent: event.detail.agreements.tapToPayAgreement.scriptContent
			};
		}

		const limits = cardDetails.linkedCardLimits && this._updateType === `Debit` ? {
			permanentCashAmountLimit: cardDetails.linkedCardLimits.permanentCashAmountLimit,
			permanentPurchaseAmountLimit: cardDetails.linkedCardLimits.permanentPurchaseAmountLimit,
			permanentCnpAmountLimit: cardDetails.linkedCardLimits.permanentCnpAmountLimit,
			tempCashAmountLimit: cardDetails.linkedCardLimits.tempCashAmountLimit,
			tempPurchaseAmountLimit: cardDetails.linkedCardLimits.tempPurchaseAmountLimit,
			tempCnpAmountLimit: cardDetails.linkedCardLimits.tempCnpAmountLimit
		} : {
				permanentCashAmountLimit: cardDetails.cardLimits.permanentCashAmountLimit,
				permanentPurchaseAmountLimit: cardDetails.cardLimits.permanentPurchaseAmountLimit,
				permanentCnpAmountLimit: cardDetails.cardLimits.permanentCnpAmountLimit,
				tempCashAmountLimit: cardDetails.cardLimits.tempCashAmountLimit,
				tempPurchaseAmountLimit: cardDetails.cardLimits.tempPurchaseAmountLimit,
				tempCnpAmountLimit: cardDetails.cardLimits.tempCnpAmountLimit
			};

		const request = this._buildUpdateLimitsRequest(cardDetails, limits, event, tapToPayDetails);

		if (this._limitType === LIMIT_TYPES.PERMANENT) {
			updateResult = await this.updatePermanentLimits(request);
		} else {
			updateResult = await this.updateTemporaryLimits(request);
		}
		
		if (updateResult) {
			this._result(true, {
				istapToPayUnChanged: event.detail.istapToPayUnChanged,
				cardMaskedNumber: cardDetails.maskedCardNumber,
				limitType: this._limitType,
				cardCategory: cardDetails.isVirtualCard ? `virtual` : this._updateType,
				limitExpiryDate: this._calculateLimitExpiry(),
				tapToPayStatus: request.tapToPayStatusChange
			}, null);

			return;
		} ;
		
		// updating limits failed
		this._result(false, {
			istapToPayUnChanged: event.detail.istapToPayUnChanged,
			cardMaskedNumber: cardDetails.maskedCardNumber,
			limitType: this._limitType,
			cardCategory: cardDetails.isVirtualCard ? `virtual` : this._updateType,
			tapToPayStatus: request.tapToPayStatusChange
		}, null);
	}
	
	_buildUpdateLimitsRequest(cardDetails, limits, event, tapToPayDetails) {
		const request = {
			voiceRecordingReference: this.voiceRecordingReference,
			screenRecordingReference: ``,
			cardLimits: {
				cardDetails: {
					cardId: cardDetails.linkedCardLimits && this._updateType === `Debit` ? cardDetails.linkedCardId : cardDetails.cardId,
					accountId: cardDetails.primarySavingsAccountId || cardDetails.primaryCreditAccountId,
					customerId: this.cifNumber,
					cardExpiryYear: cardDetails.cardExpiryYear,
					cardExpiryMonth: cardDetails.cardExpiryMonth,
					cardSequenceNumber: cardDetails.cardSequenceNumber
				},
				permanentCashAmountLimit: limits.permanentCashAmountLimit,
				permanentPurchaseAmountLimit: limits.permanentPurchaseAmountLimit,
				permanentCnpAmountLimit: limits.permanentCnpAmountLimit,

				tempCashAmountLimit: limits.tempCashAmountLimit,
				tempPurchaseAmountLimit: limits.tempPurchaseAmountLimit,
				tempCnpAmountLimit: limits.tempCnpAmountLimit,
				limitExpiryDate: this._calculateLimitExpiry(),

				agreementAccepted: event.detail.agreementAccepted,
				agreementContent: event.detail.agreements.cardLimitsAgreement.agreementContent,
				scriptContent: event.detail.agreements.cardLimitsAgreement.scriptContent
			},
			tapToPayStatusChange: event.detail.tapToPayStatusChange
		};

		// Don't send tapToPayDetails in the request body tap to pay details have not changed
		// The CS does not like it 
		if (tapToPayDetails) {
			request.tapToPayUpdate = tapToPayDetails;
		}

		return request;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.cards.forEach(card => {
			if (CARD_TYPE_MAPPING[card.cardType] === CARD_TYPES.CREDIT && card.linkedCardId !== null) {
				card.category = CARD_TYPES.DUAL;
			} else {
				card.category = CARD_TYPE_MAPPING[card.cardType];
			}
			card.isVirtualCard = card.cardDisplayType === CARD_DISPLAY_TYPES.VIRTUAL_CARD;
		});
	}

	async _updateLimits(card, limitType, updateType) {
		this._updateType = updateType;
		this._limitType = limitType;
		this._cardDetails = card;
		
		if (this._limitType === LIMIT_TYPES.TEMPORARY && card.isVirtualCard) {
			return;
		}

		const cardId = this._updateType === `Debit` && this._cardDetails.linkedCardLimits ? this._cardDetails.linkedCardId : this._cardDetails.cardId;
		const limitsReq = {
			"cardDetails": {
				"cardId": cardId,
				"accountId": this._cardDetails.primarySavingsAccountId || this._cardDetails.primaryCreditAccountId,
                "customerId": this.cifNumber,
				"cardExpiryYear": this._cardDetails.cardExpiryYear,
				"cardExpiryMonth": this._cardDetails.cardExpiryMonth,
				"cardSequenceNumber": this._cardDetails.cardSequenceNumber
			}
		};
		
		if (this._limitType === LIMIT_TYPES.PERMANENT) {
			await this._getPermanentLimits(limitsReq);
		} else {
			await this._getTemporaryLimits(limitsReq);
		}

		// update-type - credit/debit
		// limit-type - Permanent/Temporary
		// card-display-type - Primary, Supplementary or Virtual
		this._telemetry.logEvent(QuickTransactionEvents.CARD_LIMITS_SELECT_CARD, {
			"screen": TelemetryScreen.CARD_LIMITS_LANDING,
			"next-screen": TelemetryScreen.UPDATE_CARD_LIMITS,
			"update-type": this._updateType,
			"limit-type": this._limitType,
			"card-display-type": this._cardDetails.cardDisplayName
		});
		
		if (new Date(card.cardLimits.tempLimitExpiryDate).getYear() > 2 && this._limitType === LIMIT_TYPES.PERMANENT) {
			this.showConfirmSelectionModal = !this.showConfirmSelectionModal;
		} else {
			this.showUpdateLimitsModal = !this.showUpdateLimitsModal; 
		}
	}

	async _getPermanentLimits(request) {
		const requestValue = await this.getPermanentLimits(request);

		if (requestValue) {
			this._cardDetails.totalDailyLimitExposures = requestValue.totalDailyLimitExposures;
			this._cardDetails.isContactlessActivated = requestValue.isContactlessActivated;
		} 
	}

	async _getTemporaryLimits(request) {
		const requestValue = await this.getTemporaryLimits(request);

		if (requestValue) {
			this._cardDetails.totalDailyLimitExposures = requestValue.totalDailyLimitExposures;
			this._cardDetails.isContactlessActivated = requestValue.isContactlessActivated;
		} 
	}

	_cancelUpdateLimits() {
		this.showDiscardChangesModal = !this.showDiscardChangesModal;
		this.showUpdateLimitsModal = !this.showUpdateLimitsModal;
		this._telemetry.logEvent(QuickTransactionEvents.UPDATE_LIMITS_CANCEL, {
			"screen": TelemetryScreen.UPDATE_CARD_LIMITS,
			"next-screen": TelemetryScreen.UPDATE_CARD_LIMITS
		});
	}

	_cancelDiscardModal() {
		this.showDiscardChangesModal = !this.showDiscardChangesModal;
		this.showUpdateLimitsModal = !this.showUpdateLimitsModal;
		this._telemetry.logEvent(QuickTransactionEvents.DISCARD_CHANGES_CANCEL, {
			"screen": TelemetryScreen.DISCARD_CHANGES,
			"next-screen": TelemetryScreen.UPDATE_CARD_LIMITS
		});
	}

	_cancelModal() {
		this.showConfirmSelectionModal = !this.showConfirmSelectionModal;
	}

	_confirmModal() {
		this.showConfirmSelectionModal = !this.showConfirmSelectionModal;
		this.showUpdateLimitsModal = !this.showUpdateLimitsModal;
	}

	_calculateLimitExpiry() {
		const date = new Date();
		const expiryDate = new Date();

		expiryDate.setDate(date.getDate() + 2);

		return expiryDate.toISOString();
	}

	_result(success, limitDetails, failureReason) {
		this.dispatchEvent(new CustomEvent(`result`, { detail: { success: success, limitDetails: limitDetails, failureReason: failureReason } }));
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				.center-section {
					height: var(--horizon-panel-height, 888px);
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				capitec-title-bar {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-shadow: none;
					--theme-titlebar-border: 1px solid #E1E1E1;
				}
				capitec-title-bar > capitec-icon {
					cursor: pointer;
					margin-right: 15px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 45px;
					--theme-alert-banner-info-border: none;
					--theme-alert-banner-font-weight: 400;
					--theme-alert-banner-line-height: 20px;
					--theme-alert-banner-info-font-color: #08A6B5;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 7px;
				}
				.card-title {
					line-height: 24px;
					margin: 16px 16px 4px;
					--theme-label-strong-font-size: 18px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3E4547;
					--theme-layout-gap-spacing: 16px;
				}

				/* Hide / Show */
				.hide {
					display: none;
				}
				.show {
					display: block;
				}
				.headerGroup{
					height: 32px;
					margin-bottom:0px;
					background-color:#F7F7F7;
				}
                
				.headerGroup > capitec-label{
				  text-align:right;
				  justify-content: center;
				  padding:0px 16px;
				  height: 32px;
				  color: #3A3A3A;
				  font-family: "Hind Vadodara";
				  font-size: 14px;
				  font-weight: 600;
				  letter-spacing: 0;
				  line-height: 20px;
				  border-top: 0px;
				}
				.columnGroup{
					height: 48px;
					margin-bottom: 0px;
					cursor: pointer;
				}
				.columnGroup > bb-multi-line-label{
					padding: 6px 16px;
					height: 48px;
					--horizon-multi-line-label-font-weight: 600;
					cursor: pointer;
					border-top: 0px;
				}
				.columnGroup > bb-multi-line-label[value=""]{
					--horizon-multi-line-label-line-height: 32px;
				}
				.columnGroup > capitec-label{
					justify-content:center;
					padding:0px 16px;
					height: 48px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					cursor: pointer;
					border-top: 0px;
				}
                
				horizon-expander{
                    margin: 16px;
                    width: 1032px;
					height: auto;
					animation-timing-function: linear;
					--horizon-expander-header-padding-left: 23px;
                }
				.border-debit{
					--theme-expander-border-left: 4px solid #009DE0;
				}
				.border-credit{
					--theme-expander-border-left: 4px solid #E61414;
				}
				capitec-card > capitec-content-box{
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 16px;
				}
				.col1{
					width:222px;
				}
				.col2{
					width: 204px;
					border-right: 0px;
				}
				.col3{
					width:207px;
				}
				.col4{
					width:246px;
				}
				.col5{
					width:155px;
				}
				.limits-group{
					height: auto;
					--theme-layout-gap-spacing: 0px;
				}
				capitec-label[label="Update"] {
					text-align: end;
					color: #009DE0;
				}
				.header-icon{
					height: 40px;
					margin: 12px 23px 12px 0px;
				}
				.header-icon > img {
					height: 40px;
				}
				.vertical-line{
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
					margin-right: 16px;
				}
				.header-col1 {
					width: 146px;
				}
				horizon-label{
                    width: 182px;
					--theme-layout-gap-spacing: 0px;
                    --horizon-label-text-height: 20px;
                    --horizon-label-text-color: #3A3A3A;
                    --horizon-label-text-line-height: 20px;
                    
                    --horizon-label-value-height: 20px;
                    --horizon-label-value-color: #3A3A3A;
                    --horizon-label-value-font-size: 16px;
                    --horizon-label-value-line-height: 20px;
                }                
                horizon-label[label="Card expiry date"]{
                    width: 200px;
                }`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderUpdateLimitsModal()}
			${this._renderDiscardChangesModal()}
			${this._renderConfirmSelectionModal()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section">
				${this._renderTitleBar()}
				<capitec-content-box>
					<capitec-expander-group modeset="multiple">
						${this.primaryCards.length > 0 ? this._renderPrimaryCardGroup() : ``}
						${this.virtualCards.length > 0 ? this._renderVirtualCardGroup() : ``}
						${this.supplementaryCards.length > 0 ? this._renderSupplementaryCardGroup() : ``}
					</capitec-expander-group>
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="title-bar">
				<capitec-icon 
					data-automation-id="card-limits-landing-back"
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Update Card Limits" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderPrimaryCardGroup() {
		return html`
			<!-- Primary Card title -->
			<capitec-label label="Primary card(s)" type="strong" class="card-title">
			</capitec-label>
			${this._renderPrimaryCards()}

		`;
	}

	_renderPrimaryCards() {
		this.expanderHeaders = this.primaryCards.map(card => [`${CARD_TYPE_MAPPING[card.cardType]} card`, `Cardholder`, `Card expiry date`]);
		this.expanderSubtitle = this.primaryCards.map(card => [card.maskedCardNumber, card.cardHolderName, `30 ${getMonthName(card.cardExpiryMonth - 1)} 20${card.cardExpiryYear} at midnight`, card]);
		
		return this.expanderSubtitle.map((sub, index) => html`
			<horizon-expander
				class="${this.expanderHeaders[index][0] === `Debit MasterCard` ? `border-debit` : `border-credit`}"
				expandButtonAlignment="right"
				.expanded="${true}">
				${this._renderExpanderHeader(this.expanderHeaders[index], sub)}
			</horizon-expander>
		`);
	}

	_renderSupplementaryCardGroup() {
		return html`
			<!-- Supplementary Card title -->
			<capitec-label
				label="Supplementary card(s)"
				type="strong"
				class="card-title">
			</capitec-label>
			${this._renderSupplementaryCards()}
		`;
	}

	_renderSupplementaryCards() {
		this.expanderHeaders = this.supplementaryCards.map(card => [`${CARD_TYPE_MAPPING[card.cardType]} card`, `Cardholder`, `Card expiry date`]);
		this.expanderSubtitle = this.supplementaryCards.map(card => [card.maskedCardNumber, card.cardHolderName, `30 ${getMonthName(card.cardExpiryMonth - 1)} 20${card.cardExpiryYear} at midnight`, card]);
		
		return this.expanderSubtitle.map((sub, index) => html`
			<horizon-expander
				class="${this.expanderHeaders[index][0] === `Debit MasterCard` ? `border-debit` : `border-credit`}"
				expandButtonAlignment="right"
				.expanded="${true}">
				${this._renderExpanderHeader(this.expanderHeaders[index], sub)}
			</horizon-expander>
		`);
	}

	_renderVirtualCardGroup() {
		return html`
			<!-- Virtual Card title -->
			<capitec-label
				label="Virtual card(s)"
				type="strong"
				class="card-title">
			</capitec-label>
			${this._renderVirtualCards()}
		`;
	}

	_renderVirtualCards() {
		this.expanderHeaders = this.virtualCards.map(card => [`Virtual card`, `Cardholder`, `Card expiry date`]);
		this.expanderSubtitle = this.virtualCards.map(card => [card.maskedCardNumber, card.cardHolderName, `30 ${getMonthName(card.cardExpiryMonth - 1)} 20${card.cardExpiryYear} at midnight`, card]);
		
		return this.expanderSubtitle.map((sub, index) => html`
			<horizon-expander
				class="${this.expanderHeaders[index][0] === `Debit MasterCard` ? `border-debit` : `border-credit`}"
				expandButtonAlignment="right"
				.expanded="${true}">
				${this._renderExpanderHeader(this.expanderHeaders[index], sub)}
			</horizon-expander>
		`);
	}

	_renderExpanderHeader(expanderHeaders, expanderSubtitle) {
		return html`
			<capitec-group slot="custom-header" layout="horizontal" gap="clear" halign="left" valign="center">
				<div class="header-icon">
					<img src="/images/cardArt/black_front_${expanderHeaders[0] === `Debit MasterCard` ? `debit` : `credit`}_40px height.svg">
				</div> 
				${expanderHeaders.map((heading, index) => this._renderHeaderLabel(heading, index, expanderSubtitle))}
			</capitec-group>
			${this._renderLimits(expanderSubtitle[3])}
		`;
	}

	_renderHeaderLabel(headers, index, expanderSubtitle) {
		return index === 0 ? html`
			<horizon-label class="header-col1" label=${headers} value="${expanderSubtitle[index]}">
			</horizon-label>
			<div class="vertical-line"></div>
		` : html`
			<horizon-label label=${headers} value="${expanderSubtitle[index]}">
			</horizon-label>
		`;
	}

	_renderHeaders() {
		return html`
			<capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left"  style="margin-bottom:0px;">
				<capitec-label row="1" class="col1" column="1" colspan="1" rowspan="1" label="" size="4"></capitec-label>
				<capitec-label row="1" class="col2" column="2" colspan="1" rowspan="1" label="Cash Withdrawals" size="4"></capitec-label>
				<capitec-label row="1" class="col3" column="3" colspan="1" label="Card Machine Purchases" size="4"></capitec-label>
				<capitec-label row="1" class="col4" column="4" colspan="1" label="Online/Scan to Pay/Phone" size="4"></capitec-label>
				<capitec-label row="1" class="col5" column="5" colspan="1" label="Actions" size="4"></capitec-label>
			</capitec-group>
		`;
	}

	_renderLimits(card) {
		switch (card.category) {
			case CARD_TYPES.DEBIT:
				return html`
					<div slot="content" class="limits-group">
						${this._renderHeaders()}
						${this._renderDebitLimits(card)}
					</div>`;
			case CARD_TYPES.CREDIT:
				return html`
					<div slot="content" class="limits-group">
						${this._renderHeaders()}
						${this._renderCreditLimits(card)}
					</div>`;
			case CARD_TYPES.DUAL:
				return html`
					<div slot="content" class="limits-group">
						${this._renderHeaders()}
						${this._renderCreditLimits(card)}
						${this._renderDebitLimits(card)}
					</div>
				`;
			default:
				return html``;
		}
	}
  
	_renderCreditLimits(card) {
		return html`
			<capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
				<capitec-label class="col1 headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Credit limit" size="4"></capitec-label>
				<capitec-label class="col2" row="1" column="2" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col3" row="1" column="3" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col4" row="1" column="4" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col5" row="1" column="5" colspan="1" label="" size="1"></capitec-label>
			</capitec-group>
			${this._renderLimitsRow(card, `Credit`)}
		`;
	}

	_renderDebitLimits(card) {
		return html`
			<capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
				<capitec-label class="col1 headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Debit limit" size="4"></capitec-label>
				<capitec-label class="col2" row="1" column="2" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col3" row="1" column="3" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col4" row="1" column="4" colspan="1" label="" size="1"></capitec-label>
				<capitec-label class="col5" row="1" column="5" colspan="1" label="" size="1"></capitec-label>
			</capitec-group>
			${this._renderLimitsRow(card, `Debit`)}
		`;
	}
	
	_renderLimitsRow(card, updateType) {
		return html`
			${this._renderPermanentLimitsRow(card, updateType)}
			${this._renderTemporaryLimitsRow(card, updateType)}
		`;
	}

	_renderPermanentLimitsRow(card, updateType) {
		const limits = card && card.cardLimits;
		const linkedLimits = card.linkedCardLimits;
		
		return html`
			<capitec-group
				class="columnGroup"
				layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center"
				data-automation-id="card-limits-landing-permanent-limits"
				@click="${() => this._updateLimits(card, LIMIT_TYPES.PERMANENT, updateType)}">
					<capitec-label class="col1" row="1" column="1" colspan="1" label="Permanent limit" size="4"></capitec-label>
					<bb-multi-line-label
						class="col2"
						row="1" column="2" colspan="1" size="4" rowspan="1"
						label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.permanentCashAmountLimit : limits.permanentCashAmountLimit, card, `permCashLimit`)}"
						value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxPermanentCashAmountLimit : limits.maxPermanentCashAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.permanentCashAmountLimit : limits.permanentCashAmountLimit, card, `permCashLimit`)}">
					</bb-multi-line-label>
					<bb-multi-line-label
						class="col3"
						row="1" column="3" colspan="1" size="4" rowspan="1"
						label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.permanentPurchaseAmountLimit : limits.permanentPurchaseAmountLimit, card, `permPurchaseLimit`)}"
						value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxPermanentPurchaseAmountLimit : limits.maxPermanentPurchaseAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.permanentPurchaseAmountLimit : limits.permanentPurchaseAmountLimit, card, `permPurchaseLimit`)}">
					</bb-multi-line-label>
					<bb-multi-line-label
						class="col4"
						row="1" column="4" colspan="1" size="4" rowspan="1"
						label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.permanentCnpAmountLimit : limits.permanentCnpAmountLimit, card, `permOnlineLimit`)}"
						value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxPermanentCnpAmountLimit : limits.maxPermanentCnpAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.permanentCnpAmountLimit : limits.permanentCnpAmountLimit, card, `permOnlineLimit`)}">
					</bb-multi-line-label>
					${this._renderUpdateButton(LIMIT_TYPES.PERMANENT, card)}
			</capitec-group>
		`;
	}

	_renderTemporaryLimitsRow(card, updateType) {
		const limits = card && card.cardLimits;
		const linkedLimits = card.linkedCardLimits;
		
		return card.cardDisplayType !== CARD_DISPLAY_TYPES.VIRTUAL_CARD 
			? html`
				<capitec-group
					class="columnGroup"
					layout="grid" gap="line" halign="left" valign="center"
					columns="5" rows="1"
					data-automation-id="card-limits-landing-temporary-limits"
					@click="${() => this._updateLimits(card, LIMIT_TYPES.TEMPORARY, updateType)}">
						<capitec-label
							class="col1"
							row="1" column="1" colspan="1" size="4"
							label="Temporary limit">
						</capitec-label>
						<bb-multi-line-label
							class="col2"
							row="1" column="2" colspan="1" size="4" rowspan="1"
							label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.tempCashAmountLimit : limits.tempCashAmountLimit, card, `tempCashLimit`)}"
							value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxTemporaryCashAmountLimit : limits.maxTemporaryCashAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.tempCashAmountLimit : limits.tempCashAmountLimit, card, `tempCashLimit`)}">
						</bb-multi-line-label>
						<bb-multi-line-label
							class="col3"
							row="1" column="3" colspan="1" size="4" rowspan="1"
							label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.tempPurchaseAmountLimit : limits.tempPurchaseAmountLimit, card, `tempPurchaseLimit`)}"
							value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxTemporaryPurchaseAmountLimit : limits.maxTemporaryPurchaseAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.tempPurchaseAmountLimit : limits.tempPurchaseAmountLimit, card, `tempPurchaseLimit`)}">
						</bb-multi-line-label>
						<bb-multi-line-label
							class="col4"
							row="1" column="4" colspan="1" size="4" rowspan="1"
							label="${this._getLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.tempCnpAmountLimit : limits.tempCnpAmountLimit, card, `tempOnlineLimit`)}"
							value="${this._getMaxLimitValue(linkedLimits && updateType === `Debit` ? linkedLimits.maxTemporaryCnpAmountLimit : limits.maxTemporaryCnpAmountLimit, linkedLimits && updateType === `Debit` ? linkedLimits.tempCnpAmountLimit : limits.tempCnpAmountLimit, card, `tempOnlineLimit`)}">
						</bb-multi-line-label>
						${this._renderUpdateButton(LIMIT_TYPES.TEMPORARY, card)}
				</capitec-group>`
			: html``;
	}

	_getLimitValue(value, card, id) {
		const type = card.cardDisplayType;

		if (type === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD && (id === `permOnlineLimit` || id === `tempOnlineLimit`)) {
			return `N/A`;
		} else if (type === CARD_DISPLAY_TYPES.VIRTUAL_CARD && id !== `permOnlineLimit`) {
			return `N/A`;
		} else if ((id === `tempCashLimit` || id === `tempPurchaseLimit` || id === `tempOnlineLimit`) && isNullorEmpty(value)) {
			return `Not set`;
		}

		return formatCurrency(value);
	}

	_getMaxLimitValue(maxValue, value, card, id) {
		const type = card.cardDisplayType;

		if (type === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD && (id === `permOnlineLimit` || id === `tempOnlineLimit`)) {
			return ``;
		} else if (type === CARD_DISPLAY_TYPES.VIRTUAL_CARD && !(id === `permOnlineLimit`)) {
			return ``;
		} else if ((id === `tempCashLimit` || id === `tempPurchaseLimit` || id === `tempOnlineLimit`) && isNullorEmpty(value)) {
			return ``;
		}

		return `max ${formatCurrency(maxValue, 0)}`;
	}

	_renderUpdateButton(type, card) {
		const label = type === LIMIT_TYPES.TEMPORARY && card.isVirtualCard ? `` : `Update`;

		return html`
			<capitec-label
				class="col5"
				row="1" column="5" colspan="1" size="4"
				label="${label}">
			</capitec-label>
		`;
	}

	_renderUpdateLimitsModal() {
		return this.showUpdateLimitsModal
			? html`
				<horizon-update-card-limits
					.cardDetails="${this._cardDetails}"
					.limitType="${this._limitType}"
					.getTemporaryLimits="${(request) => this._getTemporaryLimits(request)}"
					.updateType="${this._updateType}"
					.getCardLimitsAgreement="${(card, newLimits, tapToPayStatus) => this._getLimitsAgreement(card, newLimits, tapToPayStatus)}"
					@cancel="${() => this._cancelUpdateLimits()}"
					@accepted="${(event) => this._updateLimitsAgreement(event)}">
				</horizon-update-card-limits>`
			: html``;
	}

	_renderDiscardChangesModal() {
		return this.showDiscardChangesModal
			? html`
				<horizon-discard-changes
					@on-cancel="${() => this._cancelDiscardModal()}"
					@on-confirm="${() => this.showDiscardChangesModal = !this.showDiscardChangesModal}">
				</horizon-discard-changes>`
			: html``;
	}

	_renderConfirmSelectionModal() {
		if (this.showConfirmSelectionModal) {
			return html`
				<horizon-confirm-selection
					@on-cancel="${() => this._cancelModal()}"
					@on-confirm="${() => this._confirmModal()}">
				</horizon-confirm-selection>`;
		}

		return html``;
	}
}

customElements.define(`horizon-card-limits-landing`, CardLimitsLanding);