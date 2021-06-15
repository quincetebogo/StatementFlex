import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { formatCurrency } from 'app/utils/channelServiceUtilities';

import 'app/components/common/CardArt';

const RENDER_MODE = {
    LIMITS: 1,
    AGREEMENT: 2
};

const UPDATE_LIMIT_STEPS = [
    {
        title: `Update Limits`
    },
    {
        title: `Agreement`
    }
];

const TAP_TO_PAY_STATUS = {
    ACTIVATED: `TapToPayActivated`,
    DEACTIVATED: `TapToPayDeactivated`,
    UNCHANGED: `Unchanged`
};

/**
 * This component implements the modal for update card limits
 *
 * Events Raised 
 * -------------
 * cancel
 * 
 * @export
 * @class UpdateCardLimits
 * @extends {Component}
 */
export class UpdateCardLimits extends Component {

    // --------------
    // INITIALISATION
    // --------------

    constructor() {
        super();

        // private properites
        this.isBusy = false;
        this.renderMode = RENDER_MODE.LIMITS;
        this.cardlimitsInfo = {};
        this.getAgreement = {};

        this.error = {
            credit: {
                cashAmountLimit: ``,
                purchaseAmountLimit: ``,
                cnpAmountLimit: ``
            },
            debit: {
                cashAmountLimit: ``,
                purchaseAmountLimit: ``,
                cnpAmountLimit: ``
            }
        };

        this.maxValue = ``;
        this.limitLabel = ``;
        this.limitsAgreementExpanded = true;
        this.tapToPayAgreementExpanded = false;
        this.alertBannerText = ``;
        this.cardLimits = {};
        this._tapToPayStatus = false;
		this.cardToDisplay = ``;

        this._telemetry = HorizonTelemetry.instance;
    }

    // ----------
    // PROPERTIES
    // ----------

	/**
	 * 
	 * @property {string} limitType Flag to indicate Temporary/ Permanent
	 * @property {Object} cardDetails Object has the card details
	 * @property {string} updateType Flag to indicate Debit/ Credit
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
    static get properties() {
        return {
            limitType: { type: String },
            cardDetails: { type: Object },
            updateType: { type: String },
            getAgreement: { type: String },
            displayCard: { type: String },
            getCardLimitsAgreement: { type: Object, attribute: false },

			limitLabel: { type: String },
			limitsAgreementExpanded: { type: Boolean },
			tapToPayAgreementExpanded: { type: Boolean },
			alertBannerText: { type: String },

            renderMode: { type: Boolean, attribute: false },
            isBusy: { type: Boolean, attribute: false },
            _tapToPayStatus: { type: Boolean, attribute: false }
        };
    }

    // -------------------
    // LIFECYCLE OVERRIDES
    // -------------------

    connectedCallback() {
        super.connectedCallback();

		this.cardLimits = {
			maxPermanentCashAmountLimit: this.cardDetails.cardLimits.maxPermanentCashAmountLimit,
			maxPermanentCnpAmountLimit: this.cardDetails.cardLimits.maxPermanentCnpAmountLimit,
			maxPermanentPurchaseAmountLimit: this.cardDetails.cardLimits.maxPermanentPurchaseAmountLimit,
			maxTemporaryCashAmountLimit: this.cardDetails.cardLimits.maxTemporaryCashAmountLimit,
			maxTemporaryCnpAmountLimit: this.cardDetails.cardLimits.maxTemporaryCnpAmountLimit,
			maxTemporaryPurchaseAmountLimit: this.cardDetails.cardLimits.maxTemporaryPurchaseAmountLimit,
			permanentCashAmountLimit: this.cardDetails.cardLimits.permanentCashAmountLimit,
			permanentCnpAmountLimit: this.cardDetails.cardLimits.permanentCnpAmountLimit,
			permanentPurchaseAmountLimit: this.cardDetails.cardLimits.permanentPurchaseAmountLimit,
			tempCashAmountLimit: this.cardDetails.cardLimits.tempCashAmountLimit,
			tempCnpAmountLimit: this.cardDetails.cardLimits.tempCnpAmountLimit,
			tempLimitExpiryDate: this.cardDetails.cardLimits.tempLimitExpiryDate,
			tempPurchaseAmountLimit: this.cardDetails.cardLimits.tempPurchaseAmountLimit
		};

		this.linkedCardLimits = this.cardDetails.linkedCardLimits 
			? {
				maxPermanentCashAmountLimit: this.cardDetails.linkedCardLimits.maxPermanentCashAmountLimit,
				maxPermanentCnpAmountLimit: this.cardDetails.linkedCardLimits.maxPermanentCnpAmountLimit,
				maxPermanentPurchaseAmountLimit: this.cardDetails.linkedCardLimits.maxPermanentPurchaseAmountLimit,
				maxTemporaryCashAmountLimit: this.cardDetails.linkedCardLimits.maxTemporaryCashAmountLimit,
				maxTemporaryCnpAmountLimit: this.cardDetails.linkedCardLimits.maxTemporaryCnpAmountLimit,
				maxTemporaryPurchaseAmountLimit: this.cardDetails.linkedCardLimits.maxTemporaryPurchaseAmountLimit,
				permanentCashAmountLimit: this.cardDetails.linkedCardLimits.permanentCashAmountLimit,
				permanentCnpAmountLimit: this.cardDetails.linkedCardLimits.permanentCnpAmountLimit,
				permanentPurchaseAmountLimit: this.cardDetails.linkedCardLimits.permanentPurchaseAmountLimit,
				tempCashAmountLimit: this.cardDetails.linkedCardLimits.tempCashAmountLimit,
				tempCnpAmountLimit: this.cardDetails.linkedCardLimits.tempCnpAmountLimit,
				tempLimitExpiryDate: this.cardDetails.linkedCardLimits.tempLimitExpiryDate,
				tempPurchaseAmountLimit: this.cardDetails.linkedCardLimits.tempPurchaseAmountLimit
			}
			: '';

		this.cardToDisplay = this._getCardName();
		this._tapToPayStatus = this.cardDetails.isContactlessActivated;
        this.cardArtDetails = {
            cardArt: this.cardDetails.cardArt,
            cardHoldName: this.cardDetails.cardHolderName,
            primaryAccountId: this.cardDetails.primaryAccountId || this.cardDetails.primaryCreditAccountId
        };

        this._telemetry.startSpan(QuickTransactionEvents.UPDATE_LIMITS, {
            "screen": TelemetryScreen.UPDATE_CARD_LIMITS
        });

        this._initialise();
    }

    disconnectedCallback() {
        this._telemetry.endSpan(QuickTransactionEvents.UPDATE_LIMITS, {
            "screen": TelemetryScreen.UPDATE_CARD_LIMITS
        });
    }

    // --------------
    // EVENT HANDLERS
    // --------------

    _limitChanged(e, transactionType, maxLimit) {

        if (e.detail.new) {
            if (this.updateType === `Debit` && this.cardDetails.linkedCardLimits) {
                this.linkedCardLimits[e.currentTarget.id] = parseFloat(e.detail.new);
            } else {
                this.cardLimits[e.currentTarget.id] = parseFloat(e.detail.new);
            }

			this.error[transactionType][e.currentTarget.id] = (Number(e.detail.new) > Number(maxLimit)) ? maxLimit : ``;
            this.requestUpdate();
        }
    }

    _back() {
        this.cardlimitsInfo.acceptedLimitsAgreement = false;
        this.cardlimitsInfo.acceptedTapToPayAgreement = false;
        this.renderMode = RENDER_MODE.LIMITS;

        this._telemetry.logEvent(QuickTransactionEvents.UPDATE_LIMITS_BACK, {
            "screen": TelemetryScreen.LIMITS_AGREEMENT,
            "next-screen": TelemetryScreen.UPDATE_CARD_LIMITS
        });
    }

    _cancel() {
        this.dispatchEvent(new CustomEvent(`cancel`, {}));
    }

    async _next() {
        if (this._getErrorsCount() > 0) {
            return;
        }

        this.alertBannerText = ``;

        this.getAgreement = await this.getCardLimitsAgreement(this.cardDetails, this._getTapToPayStatus());
		const tapToPayAgreement = this.getAgreement.tapToPayAgreement;

        if (this.getAgreement) {
            this.cardLimitsAgreement = this.getAgreement.cardLimitsAgreement && this.getAgreement.cardLimitsAgreement.agreementContent.agreementContentData;

			if (tapToPayAgreement) {
				this.tapToPayAgreementData = tapToPayAgreement.agreementContent.agreementContentData;
				// Set the script type as it is null at this stage and must be set
				tapToPayAgreement.scriptContent.scriptContentType = `HTML`;
			}
			
            this.renderMode = RENDER_MODE.AGREEMENT;

            const limits = this.linkedCardLimits && this.updateType === `Debit` ? {
                cashAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentCashAmountLimit : this.linkedCardLimits.tempCashAmountLimit,
                purchaseAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentPurchaseAmountLimit : this.linkedCardLimits.tempPurchaseAmountLimit,
                cnpAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentCnpAmountLimit : this.linkedCardLimits.tempCnpAmountLimit
            } : {
                    cashAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentCashAmountLimit : this.cardLimits.tempCashAmountLimit,
                    purchaseAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentPurchaseAmountLimit : this.cardLimits.tempPurchaseAmountLimit,
                    cnpAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentCnpAmountLimit : this.cardLimits.tempCnpAmountLimit
                };


            this._telemetry.logEvent(QuickTransactionEvents.UPDATE_LIMITS_NEXT, {
                "screen": TelemetryScreen.UPDATE_CARD_LIMITS,
                "next-screen": TelemetryScreen.LIMITS_AGREEMENT,
                "update-type": this.updateType,
                "limit-type": this.limitType,
                "cash-amount-limit": limits.cashAmountLimit,
                "purchase-amount-limit": limits.purchaseAmountLimit,
                "cnp-amount-limit": limits.cnpAmountLimit
            });
        } else {
            this.alertBannerText = `System error. Please try again.`;
        }
    }

    _agree() {
        const accepedToAgreement = this._tapToPayStatus
            ? this.cardlimitsInfo.acceptedLimitsAgreement && this.cardlimitsInfo.acceptedTapToPayAgreement
            : this.cardlimitsInfo.acceptedLimitsAgreement;
        if (accepedToAgreement) {
            const _tapToPayStatusChange = this._getTapToPayStatus();
			this.cardDetails.cardLimits = this.cardLimits;
            this.cardDetails.linkedCardLimits = this.linkedCardLimits;
            this.dispatchEvent(new CustomEvent(`accepted`, {
                detail: {
                    agreements: this.getAgreement,
                    agreementAccepted: accepedToAgreement,
                    card: this.cardDetails,
                    istapToPayUnChanged: _tapToPayStatusChange === TAP_TO_PAY_STATUS.UNCHANGED,
                    tapToPayStatusChange: _tapToPayStatusChange,
                    tapToPayStatus: this._tapToPayStatus
                }
            }));

            this._telemetry.logEvent(QuickTransactionEvents.UPDATE_LIMITS_AGREE, {
                "screen": TelemetryScreen.LIMITS_AGREEMENT,
                "next-screen": TelemetryScreen.UPDATE_LIMITS_OUTCOME,
                "tap-to-pay-enabled": accepedToAgreement
            });
        } else {
            this.alertBannerText = `Please confirm to agree terms and conditions`;
        }
    }

    _toggleTapToPay(e) {
        this._tapToPayStatus = e.detail.new;
    }

    _toggleAgreementsAccept(e) {
        this.cardlimitsInfo[e.currentTarget.id] = e.detail.new;
        this.alertBannerText = ``;

        if (e.detail.new && this._tapToPayStatus) {
            this.limitsAgreementExpanded = !this.limitsAgreementExpanded;
            this.tapToPayAgreementExpanded = !this.tapToPayAgreementExpanded;
        }
    }

    // --------------
    // PUBLIC METHODS
    // --------------

    // N/A

    // ---------------
    // PRIVATE METHODS
    // ---------------

    _initialise() {
        this.cardlimitsInfo = {
            tapToPayEnabled: false,
            acceptedLimitsAgreement: false,
            acceptedTapToPayAgreement: false
        };

        // TO DO : limitLabel to be loaded dynamically depending on update type once we get proper value in Update type
        this.limitLabel = `${this.updateType} Limits`;

		this.totalPrimaryCardLimits = this.cardDetails.totalDailyLimitExposures.find(item => item.cardTypeName === `Primary card limits`);
		this.totalSupplementaryCardLimits = this.cardDetails.totalDailyLimitExposures.find(item => item.cardTypeName === `Supplementary card limits`);
		this.totalCardLimits = this.cardDetails.totalDailyLimitExposures.find(item => item.cardTypeName === `Total limits`);
    }

    _getErrorsCount() {
        const debitErrors = Object.values(this.error.debit).filter(item => item !== ``);
        const creditErrors = Object.values(this.error.credit).filter(item => item !== ``);

        if (debitErrors.length + creditErrors.length === 1) {
            this.maxValue = debitErrors[0] || creditErrors[0];
        }

        return debitErrors.length + creditErrors.length;
    }

    _getAlertMessage() {

        if (this._getErrorsCount() > 1) {
            return html`
				<capitec-label
					label="Maximum limits have been exceeded"
					type="strong">
				</capitec-label>`;
        }
        return html`
			<div>
				Maximum limit for cash withdrawl is <strong>${formatCurrency(this.maxValue)}</strong>
			</div>
		`;
    }

    _getFieldError(value) {
        return !value ? `` : `Max limit - ${formatCurrency(value)}`;
    }
    
    _getTapToPayStatus() {
        if (this._tapToPayStatus === this.cardDetails.isContactlessActivated) {
            return TAP_TO_PAY_STATUS.UNCHANGED;
        }
        return this._tapToPayStatus ? TAP_TO_PAY_STATUS.ACTIVATED : TAP_TO_PAY_STATUS.DEACTIVATED;
    }

	_toggleBusyFlag() {
        this.isBusy = !this.isBusy;
    }

	_getCardName() {
        if (this.cardDetails.cardDisplayType === `Virtual_Card`) {
            return this.linkedCardLimits ? `Virtual Credit Card` : `Virtual Debit MasterCard`;
        }
        return this.linkedCardLimits ? `Plastic Credit Card` : `Plastic Debit MasterCard`;
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
			.cardArt {
				width: var(--horizon-card-art-width, 328px);
				height: var(--horizon-card-art-height, 304px);
				box-sizing: border-box;
				--theme-card-box-shadow: none;
				--theme-card-border: 1px solid #E1E1E1;
				--theme-card-border-radius: 4px;
			}
			.dailyLimitsEx {
				height: auto;
				--theme-titlebar-padding: 0px;
				--theme-type-clear-background: rgba(0,157,224,0.1)
			}
			.dailyExTitle {
				--theme-label-font-color: #3A3A3A;
				margin-left: 12px;
				margin-top: 12px;
				--theme-label-font-size: 16px;
				line-height: 20px;
			}
			.limitTitle {
				--theme-label-font-color: #3A3A3A;
				--theme-label-font-size: 14px;
				height: 20px;
			}
			.limitSubtitle {
				color: #3A3A3A;
				font-size: 12px;
				padding-bottom: 10px;
				margin-top: 7px;
			}
			.dailyLimits {
				height: 34px; 
				width: 755px; 
				margin-left: 12px; 
				margin-top: 12px; 
				margin-bottom: 16px;
			}
			.tapToPaySub {
				--theme-label-subtitle-line-height: 12px;
				--theme-label-subtitle-font-size: 12px;
				width: 150px;
				margin-bottom: 14px;
			}
			capitec-modal {
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3A3A3A;
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-footer-padding: 15px 15px 16px 24px;
			}
			capitec-stepper {
				--theme-stepper-step-title-font-color: #3A3A3A;
				--theme-font-weight: 600;
			}
			.main-cb {
				height: 657px;

				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
			}
			capitec-alert-banner {
				--theme-alert-banner-height: 48px;
				--theme-layout-gap-spacing: 16px;
				--theme-alert-banner-icon-margin-left: 16px;
				--theme-alert-banner-icon-margin-right: 8px;
				margin: 16px 16px 0px 16px;
			}
			.agreements-banner {
				margin: 0px 0px 16px 0px;
			}
			.alert-banner > capitec-label {
				--theme-label-default-font-size: 14px;
				--theme-label-font-color: #AC282F;
			}
			.alert-banner > capitec-label[type="default"] {
				--theme-label-default-font-weight: 600;
				--theme-label-font-color: #AC282F;
			}
			.main-cb > capitec-group {
				--theme-layout-gap-spacing: 32px;
			}
			capitec-group > capitec-card {
				width: 780px;
				--theme-layout-gap-spacing: 24px;
			}
			.limits-cb {
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 32px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-layout-gap-spacing: 8px;
				width: 380px;
				float: right;
			}
			.limits-cb > capitec-label {
				--theme-label-strong-font-size: 16px;
				--theme-label-strong-font-weight: 600;
				--theme-label-strong-font-color: #3A3A3A;
				--theme-layout-gap-spacing: 16px;
			}
			.limits-cb > capitec-text-field {
				height: 72px;

				--theme-input-hint-font-color: #3A3A3A;
				--theme-input-label-font-color: #7C7C7C;
			}
			capitec-label[type="title"] {
				--theme-label-title-font-size: 18px;
				--theme-label-title-font-weight: 600;
				--theme-label-strong-font-color: #3A3A3A;
				padding-bottom: 16px;
				--theme-label-title-line-height: 24px;
				margin-bottom: 0px;
			}
			capitec-label[type="default"] {
				--theme-label-default-font-size: 15px;
				--theme-label-default-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}
			.main-cb > capitec-card {
				--theme-layout-gap-spacing: 0px;
				--theme-card-min-height: 80px;
			}
			capitec-card > capitec-group {
				width: 100%;
				padding: 0px 16px 0px 16px;
			}
			capitec-toggle {
				margin-left: 8px;
			}
			capitec-title-bar {
				height: 32px;
				order: 5;
				border-top: 1px solid #E1E1E1;
				margin-bottom: 0px;

				--theme-type-clear-background: #F7F7F7;
				--theme-titlebar-min-height: 32px;
				--theme-label-font-color: #08A6B5;
				--theme-titlebar-padding: 10px;
				--theme-titlebar-item-gap: 0px;
				--theme-titlebar-shadow: none;
			}
			capitec-title-bar > capitec-icon {
				margin-right: 7.5px;

				--theme-icon-size-default: 14px;
			}
			capitec-title-bar > capitec-label[type="subtitle"] {
				--theme-label-subtitle-font-size: 12px;
				--theme-label-subtitle-font-weight: normal;
				--theme-label-font-color: #3A3A3A;
			}
			.label-bold {
				--theme-label-strong-font-weight: 600;
			}
			div[slot="footer"] > capitec-group {
				--theme-layout-gap-spacing: 7px;
			}
			.back-btn {
				width: 65px;
			}
			.cancel-btn {
				width: 80px;
			}
			.next-btn {
				width: 90px;
			}
			capitec-expander-group {
				width: 776px;
				
				--theme-expander-border: none;
				--theme-expander-group-container-margin-bottom: 8px;
				--theme-expander-header-height: 48px;
			}
			capitec-expander-group > capitec-expander {
				border: 1px solid #E1E1E1;
				border-radius: 4px;

				--theme-expander-indicator-width: 12px;
				--theme-expander-indicator-height: 7px;
				--theme-expander-header-font-size: 16px;
				--theme-expander-header-font-weight: 600;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-expander-height: 525px;
			}
			capitec-expander-group > capitec-expander:last-child {
				margin-bottom: 0px;
			}
			.expander-cb {
				background-color: #FFFFFF;
				border-top: 1px solid #E1E1E1;

				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 9px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-layout-gap-spacing: 18px;
			}
			.agreement-lb {
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 16px;
			}
			.agreement-lb > ol {
				margin: 0px;
				padding-left: 20px;
			}
			.agreement-lb > ol > li {
				padding-left: 10px;
			}
			.agreement-terms {
				justify-content: center;
				margin-top: 17px;

				--theme-card-min-height: 48px;
			}
			capitec-check {
				padding-left: 16px;

				--theme-label-font-size: 15px;
				--theme-label-font-weight: 500;
				--theme-label-font-color: #3A3A3A;
			}
			.card-img {
				height: 202px;
				width: 126px;
				margin-left: 110px;
			}
			.card-img-cb {
				width: 356px;
				padding-top: 31px;
			}
			.tapToPayTitle {
				height: 24px;
				width: 85px;
				font-size: 18px;
				margin: 0px;
			}
			.toggleText {
				height: 48px;
			}
			.toggleText > capitec-label {
				height: 20px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				line-height: 20px;
			}
				.agreement-viewer {
					width: 100%;
					height: 100%;
				}
			`
        ];
    }

    _mobileTemplate() {
        return this._webTemplate();
    }

    _webTemplate() {
        return html`
			<capitec-modal type="free" header-align="left" header="Update ${this.limitType} ${this.updateType} Limits">
				<div slot="body">
				
					<capitec-stepper
						layout="horizontal"
						.steps="${UPDATE_LIMIT_STEPS}"
						active-step-number="${this.renderMode}">
 					</capitec-stepper>

					 <capitec-content-box class="main-cb">
						${this._renderAgreementsAlertBanner()}
						${this._renderSetLimits()}
						${this._renderAgreement()}
					 </capitec-content-box>
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			${this._renderLoadingIndicator()}
		`;
    }

    _renderLimitsAlertBanner() {
        if (this._getErrorsCount() === 0) {
            return html``;
        }
        return html`
			<capitec-alert-banner type="unsuccessful-red">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="none" class="alert-banner">
					<capitec-label
						label="Notify client: "
						type="default">
					</capitec-label>
					${this._getAlertMessage()}
				</capitec-group>
			</capitec-alert-banner>
		`;
    }

    _renderAgreementsAlertBanner() {
        return this.alertBannerText
            ? html`
				<capitec-alert-banner class="agreements-banner" type="unsuccessful-red">
					<capitec-group layout="horizontal" halign="left" valign="top" gap="none" class="alert-banner">
						<capitec-label
							label="${this.alertBannerText}"
							type="default">
						</capitec-label>
					</capitec-group>
				</capitec-alert-banner>`
            : html``;
    }

    _renderSetLimits() {
        return this.renderMode === RENDER_MODE.LIMITS
            ? html`
				<capitec-label type="title" label="${this.limitLabel}"></capitec-label>
				<capitec-group class="renderLimits" layout="horizontal" halign="left" valign="top" gap="clear">
					<capitec-card style="display: inline">
						${this._renderLimitsAlertBanner()}
						${this.updateType === `Credit`
                    ? this._renderCreditLimits()
                    : this._renderDebitLimits()
                }
					</capitec-card>
				</capitec-group>
				${this._renderTapToPay()}`
            : html``;
    }

    _renderCard() {
        return html`
		<capitec-content-box class="card-img-cb" halign="center" valign="Center">
			<horizon-card-art
				.card="${this.cardArtDetails}"
				disable-hover="${true}"
				context="cardArt">
			</horizon-card-art>
		</capitec-content-box>
		`;
    }

    _renderCreditLimits() {
        return html`
			<capitec-group layout="horizontal" halign="center" valign="top" gap="none">
				${this._renderCard()}
				<capitec-content-box class="limits-cb">
					${this._renderLimits(`credit`)}
				</capitec-content-box>
			</capitec-group>

				${this._renderAllLimits()}
		`;
    }

    _renderDebitLimits() {
        return html`
				<capitec-group layout="horizontal" halign="center" valign="top" gap="none">
					${this._renderCard()}
					<capitec-content-box class="limits-cb">
						${this._renderLimits(`debit`)}
					</capitec-content-box>
				</capitec-group>
				
				${this._renderAllLimits()}
		`;
    }

    _renderAllLimits() {
        return html`
				<capitec-title-bar type="clear" label="" class="dailyLimitsEx">
					<capitec-label
						label="Total daily limit exposure"
						class="dailyExTitle">
					</capitec-label>
					<div class="dailyLimits">
						<div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Primary card limits" class="limitTitle"></capitec-label>
							<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalPrimaryCardLimits.permanentLimit, 0)}</b>/Temporary <b>${formatCurrency(this.totalPrimaryCardLimits.temporaryLimit, 0)}</b></p>
						</div>
						 <div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Supplementary card limits" class="limitTitle"></capitec-label>
							<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalSupplementaryCardLimits.permanentLimit, 0)}</b>/Temporary <b>${formatCurrency(this.totalSupplementaryCardLimits.temporaryLimit, 0)}</b></p>
						</div>
						<div style="display: inline-block; width: 245px; height: 32px">
							<capitec-label label="Total limits" class="limitTitle"></capitec-label>
							<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalCardLimits.permanentLimit, 0)}</b>/Temporary <b>${formatCurrency(this.totalCardLimits.temporaryLimit, 0)}</b></p>
						</div>
					</div>
				</capitec-title-bar>
		`;
    }

    _renderLimits(transactionType) {
        const limits = this.linkedCardLimits && this.updateType === `Debit` ? {
            cashAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentCashAmountLimit : this.linkedCardLimits.tempCashAmountLimit,
            purchaseAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentPurchaseAmountLimit : this.linkedCardLimits.tempPurchaseAmountLimit,
            cnpAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.permanentCnpAmountLimit : this.linkedCardLimits.tempCnpAmountLimit,
            maxCashAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.maxPermanentCashAmountLimit : this.linkedCardLimits.maxTemporaryCashAmountLimit,
            maxPurchaseAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.maxPermanentPurchaseAmountLimit : this.linkedCardLimits.maxTemporaryPurchaseAmountLimit,
            maxcnpAmountLimit: this.limitType === `Permanent` ? this.linkedCardLimits.maxPermanentCnpAmountLimit : this.linkedCardLimits.maxTemporaryCnpAmountLimit
        } : {
                cashAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentCashAmountLimit : this.cardLimits.tempCashAmountLimit,
                purchaseAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentPurchaseAmountLimit : this.cardLimits.tempPurchaseAmountLimit,
                cnpAmountLimit: this.limitType === `Permanent` ? this.cardLimits.permanentCnpAmountLimit : this.cardLimits.tempCnpAmountLimit,
                maxCashAmountLimit: this.limitType === `Permanent` ? this.cardLimits.maxPermanentCashAmountLimit : this.cardLimits.maxTemporaryCashAmountLimit,
                maxPurchaseAmountLimit: this.limitType === `Permanent` ? this.cardLimits.maxPermanentPurchaseAmountLimit : this.cardLimits.maxTemporaryPurchaseAmountLimit,
                maxcnpAmountLimit: this.limitType === `Permanent` ? this.cardLimits.maxPermanentCnpAmountLimit : this.cardLimits.maxTemporaryCnpAmountLimit
            };

        const cashAmountLimit = this.limitType === `Permanent` ? `permanentCashAmountLimit` : `tempCashAmountLimit`;
        const purchaseAmountLimit = this.limitType === `Permanent` ? `permanentPurchaseAmountLimit` : `tempPurchaseAmountLimit`;
        const cnpAmountLimit = this.limitType === `Permanent` ? `permanentCnpAmountLimit` : `tempCnpAmountLimit`;

        return html`
			<capitec-text-field
				id="${cashAmountLimit}"
				label="Cash withdrawal (max ${formatCurrency(limits.maxCashAmountLimit, 0)})"
				keyboardMode="numeric"
				type="currency"
				value="${limits.cashAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].cashAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxCashAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="${purchaseAmountLimit}"
				label="Card machine purchases (max ${formatCurrency(limits.maxPurchaseAmountLimit, 0)})"
				keyboardMode="numeric"
				type="currency"
				value="${limits.purchaseAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].purchaseAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxPurchaseAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="${cnpAmountLimit}"
				label="Online/telephone/mail purchases (max ${formatCurrency(limits.maxcnpAmountLimit, 0)})"
				keyboardMode="numeric"
				type="currency"
				value="${limits.cnpAmountLimit}"
				error="${this._getFieldError(this.error[transactionType].cnpAmountLimit)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxcnpAmountLimit)}">
			</capitec-text-field>
		`;
    }

    _renderTapToPay() {
        if (this.cardDetails.isContactlessCard) {
            return html`
			<capitec-label
				label="Tap to Pay"
				class="tapToPayTitle">
			</capitec-label>
			<capitec-label
				label="Total daily No-PIN limit R500"
				type="subtitle"
				class="tapToPaySub">
			</capitec-label>

			<capitec-card>
				<capitec-group layout="horizontal" class="toggleText" halign="left" valign="center" gap="none">
					<capitec-label
						label="Would you like to activate your Tap to Pay"
						type="default">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label
						label="${this._tapToPayStatus ? `On: Pending` : `Off`}"
						type="default">
					</capitec-label>
					<capitec-toggle 
						label=""
						@value-change="${(e) => this._toggleTapToPay(e)}"
						?checked="${this._tapToPayStatus}">
					</capitec-toggle>
				</capitec-group>

				<capitec-title-bar type="clear" label="">
					<capitec-icon icon="status/info"></capitec-icon>
					<capitec-label
						label="Notify client: "
						type="strong"
						class="label-bold"
						style="color: #3A3A3A">
					</capitec-label>
					<capitec-label
						label="Upon activating tap to pay you will need to place the physical card inside a card machine or atm."
						type="subtitle"
						style="color: #3A3A3A">
					</capitec-label>
				</capitec-title-bar>
			</capitec-card>
		`;
        }
        return html``;
    }

    _renderAgreement() {
        if (this.renderMode === RENDER_MODE.AGREEMENT) {
            return html`
				<capitec-expander-group modeset="single">

					<capitec-expander
						expandbuttonalignment="left"
						label="View Agreement">
							<capitec-content-box
								class="expander-cb" halign="left" valign="top" gap="none">
									<object
										class="agreement-viewer"
										data="data:text/html;base64,${this.cardLimitsAgreement}"
										type="text/html">
									</object>
									${this._renderAgreementContent(this.tapToPayAgreementData)}
							</capitec-content-box>
					</capitec-expander>

					<capitec-expander
						expandbuttonalignment="left"
						label="Update Card Limits"
						.expanded="${this.limitsAgreementExpanded}">
							${this._renderTermsAndConditions(`LimitsAgreement`)}
					</capitec-expander>

					${this._tapToPayStatus ? html`
						<capitec-expander
							expandbuttonalignment="left"
							label="Tap To Pay"
							.expanded="${this.tapToPayAgreementExpanded}">
								${this._renderTermsAndConditions(`TapToPayAgreement`)}
						</capitec-expander>` : html``}
				</capitec-expander-group>
			`;
        }
        return html``;
    }

    _renderAgreementContent(agreement) {
        return agreement
            ? html`
				<object
					class="agreement-viewer"
					data="data:text/html;base64,${agreement}"
					type="text/html">
				</object>`
            : html``;
    }

    _renderTermsAndConditions(type) {
        return html`
			<capitec-content-box class="expander-cb">
				<div class="agreement-lb">
					You acknowledge and agree that you understand and accept the terms and conditions of updating your <br><strong>${this.cardToDisplay}</strong> and/or Card-Not-Present Functionality limits, as well as your rights as a client as confirmed on this call with you.
				</div>
				<div class="agreement-lb">
					<ol>
						<li>This call recording forms the agreement between us and you as to the amendment of your original <br><strong>${this.cardToDisplay}</strong> agreement in relation to your card limits and is effective at the date of concluding this call.</li>
						<li>You are aware that it's safer to transfer funds electrically than using your card or cash, and that the card remains your liability in the event of it being[Virtual Card: compromised][Plastic Card: lost, stolen or misused].</li>
						<li>You agree that you shall have no claim or right of action arising fromany undertaking, representation or warranty not included, and agreed during this call.</li>
						<li>You declare that all the information you've given us on this call is true and correct, and that way we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
					</ol>
				</div>
				<capitec-card class="agreement-terms">
					<capitec-check 
						id="accepted${type}"
						label="Please confirm that you agree to these terms and conditions and that your are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
    }

    _renderFooter() {
        return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" style="width: 776px;">
				<capitec-button
					class="back-btn"
					type="clear" 
					label="Back"
					@click="${() => this._back()}"
					?hidden=${this.renderMode === RENDER_MODE.LIMITS}>
				</capitec-button>

				<capitec-spacer></capitec-spacer>
				
				<capitec-button
					class="cancel-btn"
					type="clear"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>
			
				<capitec-button
					class="next-btn"
					type="primary" 
					label="Next"
					@click="${() => this._next()}"
					?hidden=${this.renderMode === RENDER_MODE.AGREEMENT}>
				</capitec-button>

				<capitec-button
					class="next-btn"
					type="primary" 
					label="Agree"
					@click="${() => this._agree()}"
					?hidden=${this.renderMode === RENDER_MODE.LIMITS}>
				</capitec-button>
			</capitec-group>
		`;
    }

    _renderLoadingIndicator() {
        return this.isBusy
            ? html`<capitec-loading-indicator></capitec-loading-indicator>`
            : html``;
    }
}

customElements.define(`horizon-update-card-limits`, UpdateCardLimits);