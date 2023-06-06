import { Component, css, html } from 'platform/elements';
import { DateTime } from 'luxon';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

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

const FIELDS = {
	permanentCashAmountLimit: `cash withdrawals`,
	tempCashAmountLimit: `cash withdrawals`,
	permanentPurchaseAmountLimit: `card machine purchases`,
	tempPurchaseAmountLimit: `card machine purchases`,
	permanentCnpAmountLimit: `online/scan to pay/phone`,
	tempCnpAmountLimit: `online/scan to pay/phone`
};

const CARD_DISPLAY_TYPES = {
	PRIMARY_CARD: `Primary_Card`,
	SUPPLEMENTARY_CARD: `Supplementary_Card`,
	VIRTUAL_CARD: `Virtual_Card`
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
		this.hasDigitalChannels = false;

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
		this.totalPrimaryPermanentLimits = 0;
		this.totalPrimaryTemporaryLimits = 0;
		this.totalSuplementaryPermanentLimits = 0;
		this.totalSuplementaryTemporaryLimits = 0;
		this.totalPermanentLimits = 0;
		this.totalTemporaryLimits = 0;
		this.errorField = ``;
		this.fieldFocused = ``;
		this.expiryDate = ``;
		this.tempError = {
			tempCnpAmountLimit: ``,
			tempCashAmountLimit: ``,
			tempPurchaseAmountLimit: ``,
			permanentPurchaseAmountLimit: ``,
			permanentCashAmountLimit: ``,
			permanentCnpAmountLimit: ``
		};

		this._telemetry = HorizonTelemetry.instance;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * 
	 * @property {Boolean} hasDigitalChannels Indicates if the client is registered for digital channels 
	 * @property {String} verificationMethod Indicated the type of verification (SQ/ita)
	 * @property {Object} cardDetails Object has the card details
	 * @property {string} limitType Flag to indicate Temporary/ Permanent
	 * @property {string} updateType Flag to indicate Debit/ Credit
	 *
	 * @readonly
	 * @static
	 * @memberof UpdateCardLimits
	 */
	static get properties() {
		return {
			hasDigitalChannels: { type: Boolean },
			verificationMethod: { type: String },
			cardDetails: { type: Object },
			limitType: { type: String },
			updateType: { type: String },
			getCardLimitsAgreement: { type: Object },

			getAgreement: { state: true },
			limitLabel: { state: true },
			limitsAgreementExpanded: { state: true },
			tapToPayAgreementExpanded: { state: true },
			alertBannerText: { state: true },
			renderMode: { state: true },
			isBusy: { state: true },
			_tapToPayStatus: { state: true },
			totalPrimaryPermanentLimits: { state: true },
			totalPrimaryTemporaryLimits: { state: true },
			totalSuplementaryPermanentLimits: { state: true },
			totalSuplementaryTemporaryLimits: { state: true },
			totalPermanentLimits: { state: true },
			totalTemporaryLimits: { state: true },
			fieldFocused: { state: true }
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
			: ``;

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

		this.alertBannerText = ``;
		this.tempError[e.currentTarget.id] = ``;

		const oldVal = e.detail.old;
		const newVal = e.detail.new;

		if (this.limitType === `Temporary`) {
			const newDate = DateTime.now().plus({ days: 2 });
			this.expiryDate = `Expires on ${this._getFullDate(newDate.toString())} at midnight`;
		}

		if (this.updateType === `Debit` && this.cardDetails.linkedCardLimits) {
			this.linkedCardLimits[e.currentTarget.id] = isNullorEmpty(newVal) ? null : parseInt(newVal, 10);
		} else {
			this.cardLimits[e.currentTarget.id] = isNullorEmpty(newVal) ? null : parseInt(newVal, 10);
		}

		const diff = this._getDifference(newVal, oldVal);

		if (this.cardDetails.cardDisplayType === `Primary_Card`) {
			if (this.limitType === `Permanent`) {
				this.totalPrimaryPermanentLimits += diff;
			} else {
				this.totalPrimaryTemporaryLimits += diff;
			}
		} else if (this.cardDetails.cardDisplayType === `Supplementary_Card`) {
			if (this.limitType === `Permanent`) {
				this.totalSuplementaryPermanentLimits += diff;
			} else {
				this.totalSuplementaryTemporaryLimits += diff;
			}
		}

		this.totalPermanentLimits = this.totalPrimaryPermanentLimits + this.totalSuplementaryPermanentLimits;
		this.totalTemporaryLimits = this.totalPrimaryTemporaryLimits + this.totalSuplementaryTemporaryLimits;
		if (this.limitType === `Temporary`) {
			const perm = e.currentTarget.id.replace(`temp`, `permanent`);
			if (this.updateType === `Debit` && this.cardDetails.linkedCardLimits) {
				this.tempError[e.currentTarget.id] = this.linkedCardLimits[e.currentTarget.id] === this.linkedCardLimits[perm] ? `Limit cannot be the same as permanent limit` : ``;
			} else {
				this.tempError[e.currentTarget.id] = this.cardLimits[e.currentTarget.id] === this.cardLimits[perm] ? `Limit cannot be the same as permanent limit` : ``;
			}
		}

		this.error[transactionType][e.currentTarget.id] = Number(newVal) > Number(maxLimit) ? maxLimit : ``;
		this.requestUpdate();
	}

	_randToInt(value) {
		if (value.startsWith(`R`)) {
			return parseInt(value.substring(1), 10);
		}
		return parseInt(value, 10);
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

	_next() {
		const tempErrors = Object.values(this.tempError).filter(item => item !== ``);

		if (tempErrors.length > 0) {
			return;
		}

		const compare = (obj, source) => Object.keys(source).every(key => Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === source[key]);
		
		const noChangeInLimits = (this.updateType === `Debit` && this.cardDetails.linkedCardLimits) 
								? compare(this.linkedCardLimits, this.cardDetails.linkedCardLimits)
								: compare(this.cardLimits, this.cardDetails.cardLimits);
								
		if (noChangeInLimits) {
			this._limitHasNotChanged();
		} else {
			this._limitHasChanged();
		}
	}

	_agree() {
		const _tapToPayStatusChange = this._getTapToPayStatus();
		const accepedToAgreement = _tapToPayStatusChange !== TAP_TO_PAY_STATUS.UNCHANGED
			? this.cardlimitsInfo.acceptedLimitsAgreement && this.cardlimitsInfo.acceptedTapToPayAgreement
			: this.cardlimitsInfo.acceptedLimitsAgreement;
		if (accepedToAgreement) {
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

		if (e.detail.new && this._getTapToPayStatus() !== TAP_TO_PAY_STATUS.UNCHANGED) {
			this.limitsAgreementExpanded = !this.limitsAgreementExpanded;
			this.tapToPayAgreementExpanded = !this.tapToPayAgreementExpanded;
		}
	}

	_textFieldFocused(e) {
		this.fieldFocused = e.currentTarget.id;
	}

	_verifyClick() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {}));
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

		this.limitLabel = `${this.updateType} Limits`;
		const expDate = this.updateType === `Debit` && this.cardDetails.linkedCardLimits ? this.cardDetails.linkedCardLimits.tempLimitExpiryDate : this.cardDetails.cardLimits.tempLimitExpiryDate;
		this.expiryDate = isNullorEmpty(expDate) || new Date(expDate).getFullYear() < 2 ? `` : `Expires on ${this._getFullDate(expDate)} at midnight`;


		this.totalPrimaryCardLimits = this.cardDetails.totalDailyLimitExposures.find(item => item.cardTypeName === `Primary card limits`);
		this.totalSupplementaryCardLimits = this.cardDetails.totalDailyLimitExposures.find(item => item.cardTypeName === `Supplementary card limits`);
		this.totalPrimaryPermanentLimits = this._randToInt(this.totalPrimaryCardLimits.permanentLimit);
		this.totalPrimaryTemporaryLimits = this._randToInt(this.totalPrimaryCardLimits.temporaryLimit);
		this.totalSuplementaryPermanentLimits = this._randToInt(this.totalSupplementaryCardLimits.permanentLimit);
		this.totalSuplementaryTemporaryLimits = this._randToInt(this.totalSupplementaryCardLimits.temporaryLimit);
		this.totalTemporaryLimits = this.totalPrimaryTemporaryLimits + this.totalSuplementaryTemporaryLimits;
		this.totalPermanentLimits = this.totalPrimaryPermanentLimits + this.totalSuplementaryPermanentLimits;

	}

	_getErrorsCount() {
		const debitErrors = Object.values(this.error.debit).filter(item => item !== ``);
		const creditErrors = Object.values(this.error.credit).filter(item => item !== ``);

		if (debitErrors.length + creditErrors.length === 1) {
			this.maxValue = debitErrors[0] || creditErrors[0];
			
			const errDetails = Object.entries(this.error[this.updateType.toLowerCase()]).find(item => !isNullorEmpty(item[1]));
			this.errorField = FIELDS[errDetails[0]];
		}

		return debitErrors.length + creditErrors.length;
	}

	_getAlertMessage() {

		if (this._getErrorsCount() > 1) {
			return `Maximum limits have been exceeded`;
		}
		return `Maximum limit for ${this.errorField} is ${formatCurrency(this.maxValue, 0)}`;
	}

	_getFieldError(value) { 
		return !value ? `` : `Max limit - ${formatCurrency(value, 0)}`;
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
	
	async _limitHasChanged() {
		if (this._getErrorsCount() > 0) {
			return;
		}

		this.alertBannerText = ``;
		const newLimits = this.updateType === `Debit` && this.cardDetails.linkedCardLimits ? this.linkedCardLimits : this.cardLimits;

		this.getAgreement = await this.getCardLimitsAgreement(this.cardDetails, newLimits, this._getTapToPayStatus());
		const tapToPayAgreement = this.getAgreement && this.getAgreement.tapToPayAgreement;

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

	_limitHasNotChanged() {
		this.alertBannerText = `Update limit(s) in order to continue.`;
	}

	_getFullDate(date) {
		const otherDate = DateTime.fromISO(date.substring(10, 0));
		return `${otherDate.day} ${otherDate.monthShort} ${otherDate.year}`;
	}
	
	_getTextFieldValue(id, value) {
		if (isNullorEmpty(value)) {
			return ``;
		}
		return this.fieldFocused === id ? value : parseInt(value, 10).toFixed(2);
	}

	_getTextFieldHint(value, isCNPLimit = false) {
		if (this.limitType === `Temporary`) {
			return isNullorEmpty(value) ? `Limit not set` : this.expiryDate;
		}
		return ``;
	}

	_getDifference(newVal, oldVal) {
		const newLimitValue = isNullorEmpty(newVal) ? 0 : parseInt(newVal, 10);
		const oldLimitValue = isNullorEmpty(oldVal) ? oldVal : parseInt(oldVal, 10);
		
		return newLimitValue - oldLimitValue;
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
				margin-left: 12px;
				margin-top: 12px;
				--theme-label-default-font-size: 16px;
			}
			.limitSubtitle {
				color: #3A3A3A;
				line-height: 12px;
				font-size: 12px;
				padding-bottom: 10px;
				margin-top: 2px;
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
				width: auto;
				margin: 0px 0px 16px 8px;
			}
			capitec-modal {
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3A3A3A;
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-footer-padding : 16px 0px 0px 0px;
			}
			capitec-stepper {
				--theme-stepper-step-title-font-color: #3A3A3A;
				--theme-font-weight: 600;
			}
			.main-cb {
				height: 661px;

				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 14px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
			}
			horizon-alert-banner {
				--theme-layout-gap-spacing: 16px;
				--theme-toast-icon-margin: 0px 8px 0px 16px;
				margin: 16px 16px 0px 16px;
			}
			horizon-alert-banner[type="warning"] {
				margin: 14px 8px 0px 8px;
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
				--theme-container-padding-top: 14px;
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
				height: 78px;
				--theme-input-label-font-size: 16px;
				--theme-input-hint-font-color: #7C7C7C;
				--theme-input-label-font-color: #3A3A3A;
			}
			capitec-label[type="title"] {
				--theme-label-title-font-size: 18px;
				--theme-label-title-font-weight: 600;
				padding-bottom: 16px;
				--theme-label-title-line-height: 24px;
				margin: 0px 8px ;
			}
			capitec-label[type="default"] {
				line-height: 20px;
				--theme-label-default-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}
			.limitLabel {
				--theme-label-strong-font-color: #3A3A3A;
				width: 400px;
			}
			.main-cb > capitec-card {
				--theme-layout-gap-spacing: 0px;
				--theme-card-min-height: 80px;
			}
			capitec-card > capitec-group {
				width: 100%;
				height: 268px;
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
				width: 812px;
				margin: 16px 0px 16px 0px; 
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
				box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);
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
			capitec-expander-group > capitec-expander[expanded] {
			--theme-expander-background-color: #F7F7F7;
			}
			.expander-cb {
				background-color: #FFFFFF;
				border-top: 1px solid #E1E1E1;

				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 9px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 16px;
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
			}
			.tapToPayTitle {
				height: 24px;
				width: 85px;
				font-size: 18px;
				margin: 0px 8px;
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
			.fieldHidden{
				margin-bottom:24px;
			}
			.zeroPaddingRight {
				--theme-container-padding-right: 0px;
			}
			capitec-hyperlink {
				--theme-font-weight: 600;
				--theme-hyperlink-color: #3A3A3A;
				--theme-hyperlink-font-size: 14px;
				text-decoration: underline;
			}
			capitec-label[type="strong"] {
				--theme-label-strong-font-size: 14px;
				--theme-label-strong-font-weight: 600;
				--theme-layout-gap-spacing: 2px;
				--theme-label-font-color: #3A3A3A;
			}
			#id-notify-banner-group > .alert-banner-text {
				--theme-label-default-font-weight: 400;
				--theme-label-font-color: #3A3A3A;
			}
			capitec-text-field[disabled] {
				--theme-input-font-color: #7C7C7C;
				--theme-input-hint-font-color: #7C7C7C;
				--theme-input-currency-symbol-color: #7C7C7C;
				--theme-input-disabled-background-color: #FFFFFF;
			}
			.alert-banner-group > capitec-label[type="default"] {
				--theme-label-default-font-weight: 500;
				margin-right: 50px;
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Update ${this.limitType} Limits" data-automation-id="update-card-limits-modal">
				<div slot="body">
				
					<capitec-stepper
						data-automation-id="update-card-limits-stepper"
						layout="horizontal"
						.steps="${UPDATE_LIMIT_STEPS}"
						active-step-number="${this.renderMode}">
					</capitec-stepper>

					${!this.hasDigitalChannels
							? this._renderNoDigitalHighRiskTransAlertBanner()
							: this._renderHighRiskTransAlertBanner()}

					<capitec-content-box class="main-cb">
						${this._renderAgreementsAlertBanner()}
						${this._renderSetLimits()}
						${this._renderAgreement()}
					</capitec-content-box>
				</div>

				<div style="border-top: 1px solid #e1e1e1" slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderNoDigitalHighRiskTransAlertBanner() {
		return this.verificationMethod === `SQ` && this.renderMode === RENDER_MODE.LIMITS
			? html`
				<horizon-alert-banner
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning"
					header="Notify client: "
					label="For added security get the App to update your Online limit, alternatively, visit your nearest branch.">
				</horizon-alert-banner>`
			: html``;
	}

	_renderHighRiskTransAlertBanner() {
		return this.verificationMethod === `SQ` && this.cardDetails.cardDisplayType !== CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD && this.renderMode === RENDER_MODE.LIMITS
			? html`
				<horizon-alert-banner
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="To update your Online limit, we will need to send you a push notification to proceed.">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-hyperlink
								data-automation-id="high-risk-transactions-verify"
								label="Verify Now"
								@click="${() => this._verifyClick()}">
							</capitec-hyperlink>
						</capitec-group>
				</horizon-alert-banner>`
			: html``;
	}

	_renderLimitsAlertBanner() {
		if (this._getErrorsCount() === 0) {
			return html``;
		}
		return html`
			<horizon-alert-banner
				type="error"
				header="Notify client: "
				label="${this._getAlertMessage()}">
			</horizon-alert-banner>
		`;
	}

	_renderAgreementsAlertBanner() {
		return this.alertBannerText
			? html`
				<horizon-alert-banner
					class="agreements-banner"
					type="error"
					data-automation-id="update-card-limits-agreements-unsuccessful-banner"
					label="${this.alertBannerText}">
				</horizon-alert-banner>`
			: html``;
	}

	_renderSetLimits() {
		return this.renderMode === RENDER_MODE.LIMITS
			? html`
				<capitec-label type="title" label="${this.cardDetails.isVirtualCard ? `Virtual Limits` : this.limitLabel}" class="limitLabel" data-automation-id="update-card-limits-virtual-cards"></capitec-label>
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
		<capitec-content-box class="card-img-cb" halign="center" valign="center">
			<horizon-card-art
				.card="${this.cardArtDetails}"
				disable-hover="${true}"
				context="cardArt">
			</horizon-card-art>
		</capitec-content-box>
		`;
	}

	_renderCreditLimits() {
		const primaryOrSup = this.cardDetails.cardDisplayType === `Supplementary_Card` ? `padding-bottom:24px` : ``;

		return html`
			<capitec-group style="${primaryOrSup}" layout="horizontal" halign="center" valign="top" gap="none">
				${this._renderCard()}
				<capitec-content-box class="limits-cb">
					${this._renderLimits(`credit`)}
				</capitec-content-box>
			</capitec-group>

				${this._renderAllLimits()}
		`;
	}

	_renderDebitLimits() {
		const primaryOrSup = this.cardDetails.cardDisplayType === `Supplementary_Card` ? `padding-bottom:24px` : ``;
		return html`
				<capitec-group style="${primaryOrSup}" layout="horizontal" halign="center" valign="top" gap="none">
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
					data-automation-id="update-card-limits-total-daily-limits-exposure"
					label="Total daily limit exposure"
					class="dailyExTitle">
				</capitec-label>
				<div class="dailyLimits" data-automation-id="update-card-limits-daily-limits-div">
					<div style="display: inline-block; width: 245px; height: 32px">
						<capitec-label label="Primary card limits" data-automation-id="update-card-limits-primary-card-limits-label"></capitec-label>
						<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalPrimaryPermanentLimits, 0)}</b> / Temporary <b>${formatCurrency(this.totalPrimaryTemporaryLimits, 0)}</b></p>
					</div>
						<div style="display: inline-block; width: 245px; height: 32px">
						<capitec-label label="Supplementary card limits" data-automation-id="update-card-limits-supplementary-card-limits-label"></capitec-label>
						<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalSuplementaryPermanentLimits, 0)}</b> / Temporary <b>${formatCurrency(this.totalSuplementaryTemporaryLimits, 0)}</b></p>
					</div>
					<div style="display: inline-block; width: 245px; height: 32px">
						<capitec-label label="Total limits" data-automation-id="update-card-limits-total-limits-label"></capitec-label>
						<p class="limitSubtitle">Permanent <b>${formatCurrency(this.totalPermanentLimits, 0)}</b> / Temporary <b>${formatCurrency(this.totalTemporaryLimits, 0)}</b></p>
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
				data-automation-id="update-card-limits-cash-amount"
				label="Cash withdrawal (max ${formatCurrency(limits.maxCashAmountLimit, 0)})"
				keyboardMode="numeric"
				type="${isNullorEmpty(limits.cashAmountLimit) ? `numeric` : `currency`}"
				value="${this._getTextFieldValue(cashAmountLimit, limits.cashAmountLimit)}"
				error="${this._getFieldError(this.error[transactionType][cashAmountLimit]) || this.tempError[cashAmountLimit]}"
				hint="${this._getTextFieldHint(limits.cashAmountLimit)}"
				@blur="${() => this.fieldFocused = ``}"
				@keyboard-input-focus="${(e) => this._textFieldFocused(e)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxCashAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="${purchaseAmountLimit}"
				data-automation-id="update-card-limits-purchase-amount"
				label="Card machine purchases (max ${formatCurrency(limits.maxPurchaseAmountLimit, 0)})"
				keyboardMode="numeric"
				type="${isNullorEmpty(limits.purchaseAmountLimit) ? `numeric` : `currency`}"
				value="${this._getTextFieldValue(purchaseAmountLimit, limits.purchaseAmountLimit)}"
				error="${this._getFieldError(this.error[transactionType][purchaseAmountLimit]) || this.tempError[purchaseAmountLimit]}"
				hint="${this._getTextFieldHint(limits.purchaseAmountLimit)}"
				@blur="${() => this.fieldFocused = ``}"
				@keyboard-input-focus="${(e) => this._textFieldFocused(e)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxPurchaseAmountLimit)}">
			</capitec-text-field>
			<capitec-text-field
				id="${cnpAmountLimit}"
				data-automation-id="update-card-limits-cnp-amount"
				label="Online/scan to pay/phone (max ${formatCurrency(limits.maxcnpAmountLimit, 0)})"
				keyboardMode="numeric"
				type="${isNullorEmpty(limits.cnpAmountLimit) ? `numeric` : `currency`}"
				value="${this._getTextFieldValue(cnpAmountLimit, limits.cnpAmountLimit)}"
				error="${this._getFieldError(this.error[transactionType][cnpAmountLimit]) || this.tempError[cnpAmountLimit]}"
				hint="${this._getTextFieldHint(limits.cnpAmountLimit, true)}"
				?disabled=${this.verificationMethod === `SQ`}
				?hidden="${this.cardDetails.cardDisplayType === CARD_DISPLAY_TYPES.SUPPLEMENTARY_CARD}"
				@blur="${() => this.fieldFocused = ``}"
				@keyboard-input-focus="${(e) => this._textFieldFocused(e)}"
				@value-changed="${(e) => this._limitChanged(e, transactionType, limits.maxcnpAmountLimit)}">
			</capitec-text-field>
		`;
	}

	_renderTapToPay() {
		if (this.cardDetails.isContactlessCard) {
			return html`
			<capitec-label 
				data-automation-id="update-card-limits-tap-to-pay-label"
				label="Tap to Pay"
				class="tapToPayTitle">
			</capitec-label>
			<capitec-label
				data-automation-id="update-card-limits-tap-to-pay-daily-limit-label"
				label="Total daily No-PIN limit R1 000"
				type="subtitle"
				class="tapToPaySub">
			</capitec-label>

			<capitec-card>
				<capitec-group layout="horizontal" class="toggleText" halign="left" valign="center" gap="none">
					<capitec-label
					data-automation-id="update-card-limits-update-tap-to-pay"
						label="Would you like to activate your Tap to Pay?"
						type="default">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label
						data-automation-id="update-card-limits-tap-to-pay-toggle-label"
						style="font-weight: 600"
						label="${this._tapToPayStatus ? `On: Pending` : `Off`}"
						type="default">
					</capitec-label>
					<capitec-toggle 
						label=""
						data-automation-id="update-card-limits-tap-to-pay-toggle"
						@value-change="${(e) => this._toggleTapToPay(e)}"
						?checked="${this._tapToPayStatus}">
					</capitec-toggle>
				</capitec-group>

				<capitec-title-bar type="clear" label="">
					<capitec-icon icon="status/info"></capitec-icon>
					<capitec-label
						data-automation-id="update-card-limits-update-tap-to-pay-banner"
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
		const _tapToPayStatusChange = this._getTapToPayStatus();

		if (this.renderMode === RENDER_MODE.AGREEMENT) {
			return html`
				<capitec-expander-group modeset="single">

					<capitec-expander
						data-automation-id="update-card-limits-view-agreement-expander"
						expandbuttonalignment="left"
						label="View Agreement">
							<capitec-content-box
								class="expander-cb zeroPaddingRight" halign="left" valign="top" gap="none">
									<object
										class="agreement-viewer"
										data="data:text/html;base64,${this.cardLimitsAgreement}"
										type="text/html">
									</object>
									${this._renderAgreementContent(this.tapToPayAgreementData)}
							</capitec-content-box>
					</capitec-expander>

					<capitec-expander
						data-automation-id="update-card-limits-limits-agreemnet-expander"
						expandbuttonalignment="left"
						label="Update Card Limits"
						.expanded="${this.limitsAgreementExpanded}">
							${this._renderTermsAndConditions(`LimitsAgreement`)}
					</capitec-expander>

					${_tapToPayStatusChange !== TAP_TO_PAY_STATUS.UNCHANGED ? html`
						<capitec-expander
							data-automation-id="update-card-limits-tap-to-pay-agreement-expander"
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
				${type === `LimitsAgreement` ? this._renderCardLimitsScript() : ``}
				${type === `TapToPayAgreement` ? this._renderTapToPayScript() : ``}
				<capitec-card class="agreement-terms">
					<capitec-check 
						data-automation-id="update-card-limits-accepted-agreement-expander"
						id="accepted${type}"
						label="Please confirm that you agree to these terms and conditions and that you are bound by them?"
						@value-change="${(e) => this._toggleAgreementsAccept(e)}">
					</capitec-check>
				</capitec-card>
			</capitec-content-box>
		`;
	}

	_renderCardLimitsScript() {
		return html`
			<div class="agreement-lb">
				You acknowledge and agree that you understand and accept the terms and conditions of updating your <br><strong>${this.cardToDisplay}</strong> and/or Card-Not-Present Functionality limits, as well as your rights as a client as confirmed on this call with you.
			</div>
			<div class="agreement-lb">
				<ol>
					<li>This call recording forms the agreement between us and you as to the amendment of your original <br><strong>${this.cardToDisplay}</strong> agreement in relation to your card limits and is effective at the date of concluding this call.</li>
					<li>You are aware that it's safer to transfer funds electronically than using your card or cash, and that the card remains your liability in the event of it being ${this.cardDetails.isVirtualCard ? `compromised` : `lost, stolen or misused`}.</li>
					<li>You agree that you shall have no claim or right of action arising from any undertaking, representation or warranty not included, and agreed during this call.</li>
					<li>You declare that all the information you've given us on this call is true and correct, and that way we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
				</ol>
			</div>
		`;
	}

	_renderTapToPayScript() {
		const _tapToPayStatusChange = this._getTapToPayStatus();

		return html`
			<div class="agreement-lb">
				You acknowledge and agree that you understand and accept the terms and conditions of enabling Tap to Pay on your <strong>${this.cardToDisplay}</strong>, as well as your rights as a client as confirmed on this call with you.
			</div>
			<div class="agreement-lb">
				<ol>
					<li>This call recording forms the agreement between us and you as to the amendment of your Tap to Pay Status and is effective at the date of concluding this call.</li>
					<li>You’re aware that you must keep your Tap to Pay enabled card safe and immediately report it if stolen, as you will remain liable for any transactions performed if your card gets lost, stolen or misused.</li>
					<li>You declare that you’re aware that the Tap to Pay functionality means your card can be used without a PIN, even when lost, stolen or misused.</li>
					${_tapToPayStatusChange === TAP_TO_PAY_STATUS.DEACTIVATED ? html`<li>When you deactivated Tap to Pay, the card will function like a normal card and pin for all transactions, until such a time that you choose to reactivate the Tap to Pay functionality.</li>` : ``}
					<li>You agree that you shall have no claim or right of action arising from any undertaking, representation or warranty not included, and agreed during this call.</li>
					<li>You declare that all the information you’ve given us on this call is true and correct, and that we may, in any legal proceedings, rely on this call recording as rebuttable evidence of your acceptance of all terms and stipulations during this call. You acknowledge that a copy of the full agreement can be emailed to you on request.</li>
				</ol>
			</div>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group 
			class="footer" 
			layout="horizontal"  
			style="width: 812px; padding-right: 16px; padding-left: 16px;">
				<capitec-button
					class="back-btn"
					type="clear" 
					label="Back"
					data-automation-id="update-card-limits-back"
					@click="${() => this._back()}"
					?hidden=${this.renderMode === RENDER_MODE.LIMITS}>
				</capitec-button>

				<capitec-spacer></capitec-spacer>
				
				<capitec-button
					data-automation-id="update-card-limits-cancel"
					class="cancel-btn"
					type="clear"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>
			
				<capitec-button
					data-automation-id="update-card-limits-next"
					class="next-btn"
					type="primary" 
					label="Next"
					@click="${() => this._next()}"
					?hidden=${this.renderMode === RENDER_MODE.AGREEMENT}>
				</capitec-button>

				<capitec-button
					data-automation-id="update-card-limits-agree"
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
			? html`<capitec-loading-indicator data-automation-id="update-card-limits-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
}

customElements.define(`horizon-update-card-limits`, UpdateCardLimits);