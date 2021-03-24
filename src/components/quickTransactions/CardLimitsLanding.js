import { Component, css, html } from 'platform/elements';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/UpdateCardLimits';
import 'app/components/dialogs/common/DiscardChanges';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	UPDATE_LIMITS: 1,
	DISCARD: 2
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
		this.isBusy = false;
		this._cardLimits = {};
		this._updateType = ``;
		this.renderMode = RENDER_MODE.MAIN_PAGE;

		this.primaryCards = [];
		this.supplementaryCards = [];
		this.virtualCards = [];

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @property {Object} cards Object contains the list of client's card
	 *
	 * @readonly
	 * @static
	 * @memberof CardLimitsLanding
	 */
	static get properties() {
		return {
			cards: { type: Object },

			renderMode: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		await super._inicidentManager_(`UpdateCardLimits`, () => this._toggleBusyFlag(), ex => this._errorHandler(ex));

		this.primaryCards = this.cards.filter(card => card.isSupplementaryCard === false);
		this.supplementaryCards = this.cards.filter(card => card.isSupplementaryCard === true && card.isContactlessCard === false);
		this.virtualCards = this.cards.filter(card => card.isSupplementaryCard === true && card.isContactlessCard === true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	async _updateLimits(type, cardDetails) {

		const returnValue = await this.quickTransactionService.getCardLimits(cardDetails);

		if (returnValue.succeeded) {
			this._updateType = type;
			this._cardLimits = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_LIMITS;
		}
	}

	_discardChanges() {
		this.renderMode = RENDER_MODE.DISCARD;
	}
	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_errorHandler() {
		// TODO: Error handler comes here
	}

	_toggleBusyFlag() {
		// TODO: Toggle busy indicator comes here
		this.isBusy = !this.isBusy;
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
					height: 888px;
					width: 1064px;
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
				.cards-cb-1 {
					height: 376px;

					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;
				}
				.cards-cb-2 {
					height: 376px;

					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;
				}
				.cards-cb-3 {
					height: 69px;
				}
				.card-title {
					line-height: 24px;
					margin-left: 8px;

					--theme-label-strong-font-size: 18px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3E4547;
					--theme-layout-gap-spacing: 16px;
				}
				capitec-group[class="card-group-horizontal"] {
					--theme-layout-gap-spacing: 24px;
				}
				horizon-card-art {
					--horizon-card-art-width: 328px;
					--horizon-card-art-height: 304px;

					background-color: #FFFFFF;
				}
				capitec-content-box[slot="cardAction"] {
					width: 325px;
					height: 302px;

					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;
				}
				.card-action-group {
					--theme-layout-gap-spacing: 34px;
				}
				.card-action-group > .card-info {
					height: auto;
					--theme-layout-gap-spacing: 0px;
				}
				.card-action-group > capitec-button {
					cursor: pointer;
					
					--theme-button-font-weight: 600;
					--theme-button-font-size: 16px;
					--theme-button-border-radius: 5px;
				}
				.card-action-group > capitec-button:first-of-type {
					margin-bottom: 8px;
					margin-top: 48px;
				}
				.card-info > capitec-group > capitec-label:first-child {
					line-height: 12px;
					letter-spacing: 0;

					--theme-layout-gap-spacing: 4px;
					--theme-label-default-font-weight: 500;
					--theme-label-font-color: #535D60;
				}
				.card-info > capitec-group > capitec-label:last-child {
					text-align: right;
					line-height: 20px;
					letter-spacing: 0;
					
					--theme-label-strong-font-size: 15px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
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
				
				/* Hide / Show */
				.hide {
					display: none;
				}
				.show {
					display: block;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
			${this._renderUpdateLimits()}
			${this._renderDiscard()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section">
				${this._renderTitleBar()}
			
				<capitec-content-box class="cards-cb-1">
						${this._renderPrimaryCardGroup()}
				</capitec-content-box>

				<capitec-content-box class="cards-cb-2">
					<capitec-group class="card-group-horizontal"
									layout="horizontal"
									halign="left"
									valign="top"
									gap="clear">
							${this._renderSupplementaryCardGroup()}
							${this._renderVirtualCardGroup()}
					</capitec-group>
				</capitec-content-box>

				<capitec-content-box class="cards-cb-3" noPadding>
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="title-bar">
				<capitec-icon 
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
			<capitec-label label="Primary card" type="strong" class="card-title">
			</capitec-label>
			<!-- Primary Card Group Rendering -->
			<capitec-group class="card-group-horizontal"
						   valign="top"
						   halign="left"
						   gap="clear"
						   layout="horizontal"
						   grow="horizontal">
				${this._renderPrimaryCards()}
			</capitec-group>
		`;
	}

	_renderPrimaryCards() {
		return this.primaryCards.map((card, index) => html`
				<horizon-card-art
					id="primaryCard-widget-${index}"
					.card="${card}"
					.disableHover=${false}>
						<capitec-content-box slot="cardAction">
							${this._renderCardAction(card)}
						</capitec-content-box>
				</horizon-card-art>
			`);
	}

	_renderSupplementaryCardGroup() {
		return html`
			<capitec-group class="card-group-horizontal"
						   layout="vertical"
						   halign="left"
						   valign="top"
						   gap="clear">
				<!-- Supplementary Card title -->
				<capitec-label label="Supplementary cards" type="strong" class="card-title"></capitec-label>
				
				<!-- Supplementary Card Group Rendering -->
				<capitec-group class="card-group"
							   layout="horizontal"
							   halign="left"
							   valign="top"
							   gap="clear"
							   grow="horizontal">
					${this._renderSupplementaryCards()}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderSupplementaryCards() {
		return this.supplementaryCards.map((card, index) => html`
				<horizon-card-art id="supplementaryCard-widget-${index}"
								  .card="${card}"
								  .disableHover=${false}>
					<capitec-content-box slot="cardAction">
						${this._renderCardAction(card)}
					</capitec-content-box>
				</horizon-card-art>
			`);
	}

	_renderVirtualCardGroup() {
		return html`
			<capitec-group class="virtual-cards-group"
						   layout="vertical"
						   halign="left"
						   valign="top"
						   gap="clear">
				<!-- Virtual Card title -->
				<capitec-label label="Virtual card" type="strong" class="card-title"></capitec-label>
				
				<!-- Virtual Card Group Rendering -->
				<capitec-group class="card-group-horizontal"
							   layout="horizontal"
							   halign="left"
							   valign="top"
							   gap="clear"
							   grow="horizontal">
					${this._renderVirtualCards()}
				</capitec-group>
			</capitec-group>
		`;
	}

	_renderVirtualCards() {
		return this.virtualCards.map((card, index) => html`
				<horizon-card-art id="virtualCard-widget-${index}"
								  .card="${card}"
								  .disableHover=${false}>
					<capitec-content-box slot="cardAction">
						${this._renderCardAction(card)}
					</capitec-content-box>
				</horizon-card-art>
			`);
	}

	_renderCardAction(card) {
		return html`
			<capitec-group class="card-action-group"
							layout="vertical"
							gap="clear"
							halign="stretch"
							valign="top">
				<capitec-group layout="horizontal" gap="none" halign="left" valign="top" class="card-info">
					${this._renderCardInfo(card)}
				</capitec-group>
		
				<capitec-button
					class="permanent-btn"
					label="Permanent Limits"
					@click="${() => this._updateLimits(`Permanent`, card)}">
				</capitec-button>
				<capitec-button
					label="Temporary Limits"
					@click="${() => this._updateLimits(`Temporary`, card)}">
				</capitec-button>
		
				<capitec-alert-banner type="info" label="Temporary limits expire after 3 days">
				</capitec-alert-banner>
			</capitec-group>
		`;
	}

	_renderCardInfo(card) {
		return html`
			<capitec-group layout="vertical" gap="clear" halign="left" valign="top">
				<capitec-label label="${card.cardDisplayName}"
								type="default">
				</capitec-label>
				<capitec-label label="${card.maskedCardNumber}"
								type="strong">
				</capitec-label>
			</capitec-group>
			
			<capitec-spacer></capitec-spacer>
			
			<capitec-group layout="vertical"
							gap="clear"
							halign="right"
							valign="top"
							class="${card.isContactlessActivated === null ? `hide` : `show`}">
				<capitec-label label="Tap to Pay"
								type="default">
				</capitec-label>
				<capitec-label label="${card.isContactlessActivated ? `On` : `Off`}"
								type="strong">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderUpdateLimits() {
		if (this.renderMode === RENDER_MODE.UPDATE_LIMITS) {
			return html`
				<horizon-update-card-limits
					.updateType="${this._updateType}"
					.cardLimits="${this._cardLimits}"
					@cancel="${() => this.renderMode = RENDER_MODE.DISCARD}">
				</horizon-update-card-limits>
			`;
		}

		return html``;
	}

	
	_renderDiscard() {
		if (this.renderMode === RENDER_MODE.DISCARD) {
			return html`
			<horizon-discard-changes
				@on-cancel="${() => this.renderMode = RENDER_MODE.UPDATE_LIMITS}"
				@click="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
			></horizon-discard-changes>`;
		}
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

}

customElements.define(`horizon-card-limits-landing`, CardLimitsLanding);