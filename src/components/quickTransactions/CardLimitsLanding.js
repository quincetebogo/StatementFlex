import { Component, css, html } from 'platform/elements';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/common/HorizonExpander';
import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/UpdateCardLimits';
import 'app/components/dialogs/common/DiscardChanges';
import 'app/components/common/MultiLineLabel';
import { getMonthName } from 'app/utils/channelServiceUtilities';

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
        this.cardType = "Credit card";
        this._cardLimits = {};
        this._updateType = ``;
        this.renderMode = RENDER_MODE.MAIN_PAGE;

        this.primaryCards = [];
        this.supplementaryCards = [];
        this.virtualCards = [];
        this.cardLimits = {};


        this.expanderSubtitle = [];
        this.expanderHeaders = [this.cardType, 'Cardholder', 'Card expiry date'];

        //this.maxLimits = {
        //    0: ``,
        //    1: `max R150 000.00`,
        //    2: `max R500`,
        //    3: `max R1500`,
        //    4: `max R20 000`
        //};


        //this.records = [
        //    { 0: 'Credit limits', 1: false, 2: false, 3: false, 4: false },
        //    { 0: 'Permanent limits', 1: 'R1 000.00', 2: 'R8 000.00', 3: 'R10 000.00', 4: true },
        //    { 0: 'Temporary limits', 1: 'R5 000.00', 2: 'R1 000.00', 3: 'R8 000.00', 4: true },
        //    { 0: 'Debit limits', 1: '', 2: '', 3: '', 4: false },
        //    { 0: 'Permanent limits', 1: 'R1 000.00', 2: 'R8 000.00', 3: 'R10 000.00', 4: true },
        //    { 0: 'Temporary limits', 1: 'R5 000.00', 2: 'R1 000.00', 3: 'R8 000.00', 4: true }
        //];

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
            cardLimits: { type: Object },
            updateType: { type: String },
            renderMode: { attribute: false }
        };
    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();

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

    _updateLimits(limits, cardType) {
        this.dispatchEvent(new CustomEvent(`update-limits`, {
            detail: {
            cardType:  cardType,
			cardLimits: limits
            }
        }));
    }


    _toggleBusyFlag() {
        // TODO: Toggle busy indicator comes here
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
					margin: 16px 16px 0px;
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
                .vertical-line{
                    height: 40px;
                    width: 1px;
                    background-color: #E1E1E1;
                    margin-right: 16px;
                    margin-top:3px;
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
                  width:206px;
                  height: 33px;
                  color: #3A3A3A;
                  font-family: "Hind Vadodara";
                  font-size: 14px;
                  font-weight: 600;
                  letter-spacing: 0;
                  line-height: 20px;
                }
                .columnGroup{
                    height:48px;
                    margin-bottom:0px;
                }                
                .columnGroup > bb-multi-line-label{
                    padding:6px ;
                    width:206px;
                    height:49px;
                }
                .columnGroup > capitec-label{
                    justify-content:center;
                    padding:0px 16px;
                    width:206px;
                    height:49px;
                    color: #3A3A3A;
                    font-family: "Hind Vadodara";
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0;
                    line-height: 20px;
                }
                
                capitec-hyperlink{
                    text-align: right;
                    color: #3A3A3A;
                    font-family: "Hind Vadodara";
                    font-size: 16px;
                    font-weight: 500;
                    letter-spacing: 0;
                    line-height: 20px;
                    width:206px;
                }
                .primary-expander{
                    margin:16px;
                    width: 1032px;
                    border: 1px solid E1E1E1;
                    border-radius: 4px;
                    height: 365px;
                }                
                horizon-expander{
                    margin: 16px;
                    width: 1032px;
                    border: 1px solid E1E1E1;
                    border-radius: 4px;
                    height:235px;                               
                }                
                capitec-card > capitec-content-box{
                    padding: 0px;
                }
`
        ];
    }

    _mobileTemplate() {
        return this._webTemplate();
    }

    _webTemplate() {
        return html`
			${this._renderContent()}
		`;
    }

    _renderContent() {
        return html`
			<capitec-card class="center-section">               
				${this._renderTitleBar()}
                <capitec-content-box>
                    <capitec-expander-group modeset="multiple">
                        ${this._renderPrimaryCardGroup()}
                        ${this._renderSupplementaryCardGroup()}
                        ${this._renderVirtualCardGroup()}
                    </capitec-expander-group>
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
 
    _renderHeaders() {
        return html`
			<capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left"  style="margin-bottom:0px;">
	            <capitec-label row="1" column="1" colspan="1" rowspan="1" label="" size="4"></capitec-label>
	            <capitec-label row="1" column="2" colspan="1" rowspan="1" label="Cash Withdrawals" size="4"></capitec-label>
	            <capitec-label row="1" column="3" colspan="1" label="Card Machine Purchases" size="4"></capitec-label>
	            <capitec-label row="1" column="4" colspan="1" label="Online/scan to pay/phone" size="4"></capitec-label>
	            <capitec-label row="1" column="5" colspan="1" label="Actions" size="4"></capitec-label>			
			</capitec-group>
             `;      
    }
  
    _renderCreditLimits(limits, cardType) {
        return html`
            <capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label class="headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Credit limit" size="4"></capitec-label>
	            <capitec-label row="1" column="2" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="3" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="4" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="5" colspan="1" label="" size="1"></capitec-label>			
			</capitec-group>
            ${this._renderLimits(limits, cardType)}
        `;
    }
    _renderDebitLimits(limits, cardType) {
        return html`
             <capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label class="headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Debit limit" size="4"></capitec-label>
	            <capitec-label row="1" column="2" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="3" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="4" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="5" colspan="1" label="" size="1"></capitec-label>			
			</capitec-group>
            ${this._renderLimits(limits, cardType)}
        `;
    }
    _renderLimits(limits,cardType) {
        return html`
            <capitec-group class="columnGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label row="1" column="1" colspan="1" label="Permanent limit" size="4"></capitec-label>
                <bb-multi-line-label row="1" column="2" colspan="1" size="4" rowspan="1" label="${limits.permanentCashAmountLimit}" value="max ${limits.maxPermanentCashAmountLimit}"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="3" colspan="1" size="4" rowspan="1" label="${limits.permanentPurchaseAmountLimit}" value="max ${limits.maxPermanentPurchaseAmountLimit}"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="4" colspan="1" size="4" rowspan="1" label="${limits.permanentCnpAmountLimit}" value="max ${limits.maxPermanentCnpAmountLimit}"></bb-multi-line-label>
                <capitec-hyperlink @click="${()=>this._updateLimits(limits,cardType)}" row="1" column="5" colspan="1" size="4" rowspan="1" label="Update"></capitec-hyperlink></capitec-placeholder>                
			</capitec-group>

            <capitec-group class="columnGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label row="1" column="1" colspan="1" label="Temporary limit" size="4"></capitec-label>
                <bb-multi-line-label row="1" column="2" colspan="1" size="4" rowspan="1" label="${limits.tempCashAmountLimit}" value="max ${limits.maxTemporaryCashAmountLimit}"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="3" colspan="1" size="4" rowspan="1" label="${limits.tempPurchaseAmountLimit}" value="max ${limits.maxTemporaryPurchaseAmountLimit}"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="4" colspan="1" size="4" rowspan="1" label="${limits.tempCnpAmountLimit}" value="max ${limits.maxTemporaryCnpAmountLimit}"></bb-multi-line-label>
                <capitec-hyperlink @click="${() => this._updateLimits(limits,cardType)}" row="1" column="5" colspan="1" size="4" rowspan="1" label="Update"></capitec-hyperlink></capitec-placeholder>                
			</capitec-group>
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
        this.expanderSubtitle = this.primaryCards.map(card => [card.maskedCardNumber, card.cardHolderName, ("30 " + getMonthName(card.cardExpiryMonth - 1) + " 20" + card.cardExpiryYear + " at midnight"), card.cardDisplayName]);
		//this.limits= this.primaryCards.map(card => {cardLimits:card.cardLimits, cardType : card.cardType});

	   return this.expanderSubtitle.map((sub, index) =>  html`
            <horizon-expander class="primary-expander" expandButtonAlignment="right" icon="/images/cardArt/black_front_credit_40px height.svg" .headers="${this.expanderHeaders}" .subtitles="${this.expanderSubtitle[index]}">
					${this._renderHeaders()}
					${this.primaryCards.map(item => item.cardType === 0 ? this._renderDebitLimits(item.cardLimits, item.cardType) : this._renderCreditLimits(item.cardLimits, item.cardType) )}
            </horizon-expander>
`);
    }

    _renderSupplementaryCardGroup() {
        return html`
			<!-- Primary Card title -->
			<capitec-label label="Supplementary card(s)" type="strong" class="card-title">
			</capitec-label>
            ${this._renderSupplementaryCards()}

        `;
    }

    _renderSupplementaryCards() {
        this.expanderSubtitle = this.supplementaryCards.map(card => [card.maskedCardNumber, card.cardHolderName, ("30 " + getMonthName(card.cardExpiryMonth - 1) + " 20" + card.cardExpiryYear + " at midnight")]);
        return this.expanderSubtitle.map((sub, index) => html`
            <horizon-expander expandButtonAlignment="right" icon="/images/cardArt/black_front_debit_40px height.svg" color="#009DE0" .headers="${this.expanderHeaders}" .subtitles="${this.expanderSubtitle[index]}">
					${this._renderHeaders()}
					${this._renderDebitLimits()}
            </horizon-expander>
`);
    }

    _renderVirtualCardGroup() {
        return html`
			<!-- Primary Card title -->
			<capitec-label label="Virtual card(s)" type="strong" class="card-title">
			</capitec-label>
            ${this._renderVirtualCards()}

        `;
    }

    _renderVirtualCards() {
        this.expanderSubtitle = this.virtualCards.map(card => [card.maskedCardNumber, card.cardHolderName, ("30 " + getMonthName(card.cardExpiryMonth - 1) + " 20" + card.cardExpiryYear + " at midnight")]);
        return this.expanderSubtitle.map((sub, index) => html`

            <horizon-expander expandButtonAlignment="right" icon="/images/cardArt/black_front_debit_40px height.svg" color="#009DE0" .headers="${this.expanderHeaders}" .subtitles="${this.expanderSubtitle[index]}">
					${this._renderHeaders()}
					${this._renderDebitLimits()}
            </horizon-expander>
`);
    }

}

customElements.define(`horizon-card-limits-landing`, CardLimitsLanding);