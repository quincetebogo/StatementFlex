import { Component, css, html } from 'platform/elements';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/common/CardArt';
import 'app/components/dialogs/quickTransactions/UpdateCardLimits';
import 'app/components/dialogs/common/DiscardChanges';
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

    _updateLimits(type, cardDetails) {
        this.dispatchEvent(new CustomEvent(`update-limits`, {
            detail: {
                type: type,
                cardDetail: cardDetails
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
				//capitec-content-box[slot="cardAction"] {
				//	width: 325px;
				//	height: 302px;

				//	--theme-container-padding-top: 16px;
				//	--theme-container-padding-right: 16px;
				//	--theme-container-padding-bottom: 16px;
				//	--theme-container-padding-left: 16px;
				//}
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
                .vertical-line{
                    height: 40px;
                    width: 1px;
                    background-color: #E1E1E1;
                    margin-right: 16px;
                    margin-top:3px;
                }


                .account-details-bar {
					display: flex;
					position: relative;
				}
                .account-details-bar > capitec-expander {
                    position: absolute;
                    --theme-container-padding-left: 0px;
                    --theme-container-padding-top: 0px;
                    --theme-container-padding-right: 0px;
                    --theme-container-padding-bottom: 0px;
                    height:382px;
                }
                .actionbar-header{
                    height:54px;
                    border-radius:4px 0px 0px 4px;
                }
                .account-details-bar > capitec-group {
					width: 984px;
					z-index: 10;
					//padding-top: 12px;
					//padding-bottom: 12px;
					//border-right: 1px solid #dfdfdf;
				}
                .actionbar-header > horizon-label{
                    width: 182px;
                    margin-left:8px;
                }
                .actionbar-header > horizon-label[label="Card expiry date"]{
                    width: 200px;
                    margin-left:8px;
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
                  width:204px;
                  height: 32px;
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
                    padding:0px;
                    width:204px;
                    height:48px;
                }
                .columnGroup > capitec-label{
                    justify-content:center;
                    padding:0px 16px;
                    width:204px;
                    height:48px;
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
                    width:204px;
                }
                .content{
                    padding: 16px;
                    height: 415px;
                    width:1055px;
                }
                capitec-expander{
                    height:355px;
                    border: 1px solid #E1E1E1;
                    border-radius: 4px;
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
                <capitec-group layout = "grid" gap="none" row="auto" columns="uniform" style= "width:100%;">
				    ${this._renderTitleBar()}	
                <capitec-group style="">
				        ${this._renderPrimaryCardGroup()}
				        ${this._renderSupplementaryCardGroup()}
</capitec-group>
                    <capitec-content-box class="content" style="height: 382px;">
				        ${this._renderVirtualCardGroup()}
                    </capitec-content-box>
                </capitec-group>
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
			<capitec-label label="Primary card(s)" type="strong" class="card-title">
			</capitec-label>

            ${this._renderPrimaryCards()}

        `;
    }
    _renderHeaders() {
        //debugger
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
  
    _renderCreditLimits() {
        return html`
            <capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label class="headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Credit limit" size="4"></capitec-label>
	            <capitec-label row="1" column="2" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="3" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="4" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="5" colspan="1" label="" size="1"></capitec-label>			
			</capitec-group>
            ${this._renderLimits()}
        `;
    }
    _renderDebitLimits() {
        return html`
             <capitec-group class="headerGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label class="headerRow" style="text-align:left;" row="1" column="1" colspan="1" label="Debit limit" size="4"></capitec-label>
	            <capitec-label row="1" column="2" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="3" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="4" colspan="1" label="" size="1"></capitec-label>
	            <capitec-label row="1" column="5" colspan="1" label="" size="1"></capitec-label>			
			</capitec-group>
            ${this._renderLimits()}
        `;
    }
    _renderLimits() {
        return html`
            <capitec-group class="columnGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label row="1" column="1" colspan="1" label="Permanent limit" size="4"></capitec-label>
                <bb-multi-line-label row="1" column="2" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="3" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="4" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <capitec-hyperlink row="1" column="5" colspan="1" size="4" rowspan="1" href="" label="Update"></capitec-hyperlink></capitec-placeholder>                
			</capitec-group>

            <capitec-group class="columnGroup" layout="grid" gap="line" columns="5" rows="1" halign="left" valign="center">
	            <capitec-label row="1" column="1" colspan="1" label="Temporary limit" size="4"></capitec-label>
                <bb-multi-line-label row="1" column="2" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="3" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <bb-multi-line-label row="1" column="4" colspan="1" size="4" rowspan="1" label="R10 000.00" value="max R10 000"></bb-multi-line-label>
                <capitec-hyperlink row="1" column="5" colspan="1" size="4" rowspan="1" href="" label="Update"></capitec-hyperlink></capitec-placeholder>                
			</capitec-group>
`;

    }


    _renderPrimaryCards() {
        this.expanderSubtitle = this.primaryCards.map(card => [card.maskedCardNumber, card.cardHoldName, ("30 " + getMonthName(card.cardExpiryMonth-1) + " 20" + card.cardExpiryYear + " at midnight")]);
        return this.expanderSubtitle.map((sub, index) => html`
			<div class="account-details-bar">

            <capitec-expander label="">
					${this._renderHeaders()}
					${this._renderCreditLimits()}
					${this._renderDebitLimits()}
            </capitec-expander>
            <capitec-group class="actionbar-header" layout="horizontal" gap="none" halign="left" valign="center" style="border-left: 4px solid #E61414; ">
                <capitec-icon size="medium" icon="product/credit-grey"></capitec-icon>
					<horizon-label
						label="Credit Card"
						value="${sub[0]}">
					</horizon-label>
                <div class="vertical-line"></div>
					<horizon-label
						label="Cardholder"
						value="${sub[1]}">
					</horizon-label>

					<horizon-label
						label="Card expiry date"
						value="${sub[2]}">
					</horizon-label>
            </capitec-group>

</div>
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
        this.expanderSubtitle = this.supplementaryCards.map(card => [card.maskedCardNumber, card.cardHoldName, ("30 " + getMonthName(card.cardExpiryMonth - 1) + " 20" + card.cardExpiryYear + " at midnight")]);
        return this.expanderSubtitle.map((sub, index) => html`
			<div class="account-details-bar">

<capitec-expander label="">
					${this._renderHeaders()}
					${this._renderDebitLimits()}
</capitec-expander>
<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center" style="border-left: 4px solid #009DE0;">
<capitec-image alt="card" src="/app/images/cardArt/New-DebitCard"></capitec-image>
                    <horizon-label
						label="Credit Card"
						value="${sub[0]}">
					</horizon-label>
<div class="vertical-line"></div>
					<horizon-label
						label="Cardholder"
						value="${sub[1]}">
					</horizon-label>

					<horizon-label
						label="Card expiry date"
						value="${sub[2]}">
					</horizon-label>
</capitec-group>

</div>
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
        this.expanderSubtitle = this.virtualCards.map(card => [card.maskedCardNumber, card.cardHoldName, card.cardExpiryMonth.concat("/" + card.cardExpiryYear)]);
        return this.expanderSubtitle.map((sub, index) => html`
			<div class="account-details-bar">

<capitec-expander label="">
					${this._renderHeaders()}
					${this._renderDebitLimits()}
</capitec-expander>
<capitec-group class= "actionbar-header" layout="horizontal" gap="none" halign="left" valign="center" style="border-left: 4px solid #009DE0;">
<capitec-icon size="medium" icon="product/credit-grey"></capitec-icon>
					<horizon-label
						label="Credit Card"
						value="${sub[0]}">
					</horizon-label>
<div class="vertical-line"></div>
					<horizon-label
						label="Cardholder"
						value="${sub[1]}">
					</horizon-label>

					<horizon-label
						label="Card expiry date"
						value="${sub[2]}">
					</horizon-label>
</capitec-group>

</div>
`);
    }

}

customElements.define(`horizon-card-limits-landing`, CardLimitsLanding);