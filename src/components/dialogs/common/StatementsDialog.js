import { ACCOUNT_INTCAT_ENUM, ERRORS, NOTIFICATION_MESSAGE, PERIOD_TYPE, RANGE_SELECTOR, RENDER_MODE, STATEMENTS_STEPS, TIME_PERIOD } from 'app/constants/Statements';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE } from 'app/constants/Common';
import { Component, css, html, unsafeCSS } from 'platform/elements';

import { calculateDays, formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'platform/components/popups/Modal';
import 'app/components/common/StepperModal';
import 'app/components/common/HorizonEmailInput';
import 'app/components/common/HorizonSelectIcon';
import 'app/components/statements/MonthPeriodSelector';

const ERROR_MESSAGE = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * View and email statements based on account selection and period.
 * This component will be called from the favourites screen statements option as well as related options component. (TODO)
 * Config to set period (date/month) to be done on constants/statements.js
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class StatementsDialog
 * @extends {Component}
 */

export class StatementsDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.CHOOSE_ACCOUNT;
		this.currentStep = 0;
		this.notifyClient = true;
		this._resetPeriodSelection();
		this.errorMessage = ``;
		this.email = ``;
		this.confirmEmail = ``;
		this._summary = {
			dateRangeLabel: ``,
			detail: ``
		};
		this.calendarErrorMessage = ``;
		this.encodedPDF = ``;
		this.today = new Date().toISOString();
		this.productSelected = {};
		this.clientProducts = [];
		this.accountType = ``;
		this.STEPPER_STEPS = [];
		this.emailLabel = `Enter email address`;
		this.confirmEmailLabel = `Confirm email`;
		this.periodType = PERIOD_TYPE.STATIC;
		this.selectedMonths = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Array} clientProducts Contains list of products that the client has.
	 * @property {string} type Contains the type of account
	 * @readonly
	 * @static
	 * @memberof StatementsDialog
	 */
	static get properties() {
		return {
			clientProducts: { type: Array },
			accountType: { type: String, attribute: `type` },
			viewStatement: { type: Object },
			sendStatement: { type: Object },

			alertBannerMessage: { state: true },
			currentStep: { state: true },
			renderMode: { state: true },
			notifyClient: { state: true },
			periodSelected: { state: true },
			fromDate: { state: true },
			toDate: { state: true },
			errorMessage: { state: true },
			periodType: { state: true }
		};
	}

	// ----------------
	// LIFECYLCE EVENTS
	// ----------------

	connectedCallback() {
		super.connectedCallback();

		this.STEPPER_STEPS = [...STATEMENTS_STEPS];
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_next() {
		const selectAccount = () => this._validateAccountSelection();
		const selectPeriod = () => this._validatePeriodSelection();
		const emailClient = () => this._validateEmailAddress();

		const validations = {
			[RENDER_MODE.CHOOSE_ACCOUNT]: selectAccount,
			[RENDER_MODE.CHOOSE_PERIOD]: selectPeriod,
			[RENDER_MODE.EMAIL]: emailClient
		};
		const result = validations[this.renderMode]();
		if (result && this.errorMessage === ``) {
			this.dispatchEvent(new CustomEvent(`next`, {
				detail: {
					'stepper': this.renderMode,
					'accountName': this.productSelected.accountName,
					'periodSelected': this.periodSelected,
					'fromDate': this.fromDate === `dd mm yyyy` ? `` : this.fromDate,
					'toDate': this.toDate === `dd mm yyyy` ? `` : this.toDate,
					'selectedMonths': this.selectedMonths
				}
			}));

			this.currentStep++;
			this.renderMode = this.STEPPER_STEPS[this.currentStep].renderMode;
		}
	}

	_close() {
		this.dispatchEvent(new CustomEvent(`close-pdf`, {}));
		this.renderMode = RENDER_MODE.EMAIL;
	}

	_back() {
		this.errorMessage = ``;
		this.currentStep--;
		this.renderMode = this.STEPPER_STEPS[this.currentStep].renderMode;

		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_choosePeriod(range) {
		this.periodSelected = TIME_PERIOD[range].value;
		this._summary.dateRangeLabel = `${TIME_PERIOD[range].label}`;
		this._summary.detail = `Last ${TIME_PERIOD[range].range} days`;

		this.periodType = PERIOD_TYPE.STATIC;
		this.errorMessage = ``;
		this.fromDate = `dd mm yyyy`;
		this.toDate = `dd mm yyyy`;
	}

	_customDateRangeSelected() {
		this.calendarErrorMessage = ``;
		this._resetPeriodSelection();
		this.periodType = PERIOD_TYPE.CUSTOM;
	}
	
	_calendarSelectionChange(e) {
		const fromDate = new Date(e.detail.new.startDate);
		const toDate = new Date(e.detail.new.endDate);
		const rangeDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
		
		if (rangeDiff > 90 || fromDate > toDate) {
			this.errorMessage = `Out of range, please select the correct range up to 90 days`;
			this.calendarErrorMessage = `Date range up to 90 days only`;
		} else {
			this.errorMessage = ``;
			this.calendarErrorMessage = ``;
			this.fromDate = e.detail.new.startDate.slice(0, 10);
			this.toDate = e.detail.new.endDate.slice(0, 10);
		}
	}

	_clearAlerts() {
		this.errorMessage = ``;
	}

	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.errorMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.errorMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	async _viewPDF(month) {
		const request = {
			"accountNumber": this.productSelected.accountNumber,
			"accountType": this.productSelected.type,
			"dateInterval": this.periodSelected,
			"startDate": this.fromDate === `dd mm yyyy` ? `` : this.fromDate,
			"endDate": this.toDate === `dd mm yyyy` ? `` : this.toDate,
			"month": month // This is specifically for month period
		};

		const encodedPDF = await this.viewStatement(request);

		if (encodedPDF) {
			this.renderMode = RENDER_MODE.PDF;
			// render the PDF
			this.encodedPDF = encodedPDF;
		} else {
			this.errorMessage = ERRORS.SYSTEM_ERROR;
		}
	}

	async _sendStatement() {
		const isValid = this._validateEmailAddress();

		if (!isValid) {
			return false;
		}

		const request = {
			"emailAddress": this.email,
			"accountNumber": this.productSelected.accountNumber,
			"accountName": this.productSelected.accountName,
			"accountType": this.productSelected.type,
			"dateInterval": this.periodSelected,
			"startDate": this.fromDate === `dd mm yyyy` ? `` : this.fromDate,
			"endDate": this.toDate === `dd mm yyyy` ? `` : this.toDate,
			"monthInterval": this.selectedMonths // This is specifically for month period
		};

		await this.sendStatement(request);
	}

	_valueChanged(e) {
		if (e.detail.new) {
			this.errorMessage = ``;
			this.productSelected = e.detail.new;
			
			this._resetPeriodSelection();
			this.dispatchEvent(new CustomEvent(`account-selected`, {
				detail: {
					name: this.productSelected.name,
					accountNumber: this.productSelected.accountNumber,
					account: this.productSelected.category,
					subCategory: this.productSelected.subCategory
				}
			}));
			this.requestUpdate();
		}
	}

	_monthPeriodSelected(event) {
		this.selectedMonths = event.detail.months;
		this.errorMessage = ``;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		if (this.accountType) {
			this.productSelected = this.clientProducts.find(product => product.category === this.accountType);
			// Removing first stepper at run time
			this.STEPPER_STEPS.shift();
			this.renderMode = this.STEPPER_STEPS[this.currentStep].renderMode;
		}
	}

	_validateAccountSelection() {
		if (Object.entries(this.productSelected).length === 0) {
			this.errorMessage = `Choose Account`;
			return false;
		}

		return true;
	}

	_validatePeriodSelection() {
		if (this.productSelected.choosePeriod === RANGE_SELECTOR.MONTH) {
			return this._validateMonthPeriod();
		}

		return this._validateDatePeriod();
	}

	_validateDatePeriod() {
		if (this.periodSelected === `` && this.periodType === PERIOD_TYPE.STATIC) {
			this.errorMessage = ERRORS.REQUIRED_PERIOD;
			this.calendarErrorMessage = `Required`;
			return false;
		} else if (this.periodType === PERIOD_TYPE.CUSTOM && (this.fromDate === `dd mm yyyy` || this.toDate === `dd mm yyyy`)) {
			this.errorMessage = ERRORS.REQUIRED_PERIOD;
			this.calendarErrorMessage = `Required`;
			return false;
		}

		this._getSummary();
		return true;
	}

	_validateMonthPeriod() {
		if (this.selectedMonths.length === 0) {
			this.errorMessage = ERRORS.REQUIRED_PERIOD;
			return false;
		}

		return true;
	}

	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.errorMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return isNullorEmpty(this.errorMessage);
	}

	_getSummary() {
		if (this.periodType === PERIOD_TYPE.CUSTOM) {
			const fromDate = new Date(this.fromDate);
			const toDate = new Date(this.toDate);

			this._summary.dateRangeLabel = `Choose a date range`;
			this._summary.detail = `${fromDate.getDate()} ${this._getFullMonthName(this.fromDate)} - 
									${toDate.getDate()} ${this._getFullMonthName(this.toDate)}
									(${calculateDays(fromDate, toDate)} days)`;
		} else {
			// do nothing
		}

	}

	_getFullMonthName(date) {
		const parsedDate = new Date(date);
		return parsedDate.toLocaleString(`default`, { month: `long` });
	}

	_getHeaderTitle() {
		return this.renderMode === RENDER_MODE.PDF ? `View Document` : `Statements`;
	}

	_getStepperVisibility() {
		return this.renderMode === RENDER_MODE.PDF;
	}

	/**
	 * Deprecated function
	 * @param {type} type Type of account (Savings/ savings plan)
	 * @returns {string} formatted balance
	 */
	_getAvailableBal(type) {
		const products = this.clientProducts.filter(item => item.category === type);

		let availableBalance = 0;
		let currentBalance = 0;
		let totalAmount = 0;

		// To get the all account types for particular category.
		const accountTypes = [...new Set(products.map(item => item.accountType))];
		
		accountTypes.forEach(acct => {
			if (acct !== ACCOUNT_TYPE.FIXED_TERM_SAVINGS_ACCOUNT) {
				availableBalance = products.filter(item => item.accountType === acct).reduce((sum = 0, item) => sum + (item.availableBalance || 0), 0);
			} else {
				currentBalance = products.filter(item => item.accountType === acct).reduce((sum = 0, item) => sum + (item.currentBalance || 0), 0);
			}
		});
	
		// Rounding off the decimal value
		totalAmount = Math.round((availableBalance + currentBalance) * 100) / 100;
		return formatCurrency(totalAmount);
	}

	_getDateRange(numberOfDays) {
		const dateToday = new Date();
		const accountOpenDate = new Date(this.productSelected.accountOpenDate);

		const daysDifference = (dateToday.getTime() - accountOpenDate.getTime()) / (1000 * 3600 * 24);
		return daysDifference < numberOfDays;
	}
	
	_getMinDate(accountOpenDate) {
		if (!accountOpenDate) {
			return new Date(2001, 3, 1);
		}

		const minDate = new Date(accountOpenDate);
		minDate.setDate(minDate.getDate() - 1);
		return minDate;
	}

	_resetPeriodSelection() {
		this.periodSelected = ``;
		this.fromDate = `dd mm yyyy`;
		this.toDate = `dd mm yyyy`;
	}

	_getDaysinMonth(month, year) {
		const daysInMonth = new Date(year, month - 1, 0).getDate();
		return daysInMonth;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				bb-stepper-modal {
					--theme-modal-header-height: 64px;
					--theme-modal-header-font-size: 18px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #FFFFFF;
					--theme-modal-header-background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					--theme-stepper-inner-step-container-width: 320px;
					--theme-stepper-step-title-font-style: Hind Vadodara SemiBold;
					--theme-stepper-step-title-font-size: 15px;
					--theme-stepper-step-title-max-width: 328px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-wizard-modal-max-width: 976px;
					--theme-wizard-modal-max-height: 960px;
					--theme-wizard-modal-xl-width:960px;
					--theme-wizard-modal-lg-max-width:960px;
					--theme-wizard-modal-header-padding: 18.5px 16px;
					--theme-modal-footer-padding: 0px;
					--theme-modal-body-box-shadow: none;
					border-bottom-left-radius: 0px;
					border-bottom-right-radius: 0px;
				}
				div[slot="step"] {
					height: 100%;
					max-height: var(--theme-wizard-modal-max-height, 960px);

					--theme-layout-gap-spacing: 0px;
				}
				.date-label {
					margin-top: var(--horizon-statement-generic-margin-top, 24px);
				}
				.main-cb {
					height: 100%;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}
				.main-cb > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-alert-banner-info-color: #05829B;
					--theme-alert-banner-unsuccessful-red-color: #C83B37;
					--theme-alert-banner-unsuccessful-red-background-color: #F7E2E1;
					--theme-layout-gap-spacing: 15px;
					width: 928px;
				}
				.main-cb > capitec-alert-banner[type="warning"] {
					--theme-alert-banner-warning-font-color: #3A3A3A;
				}
				.alert-banner-group {
					width: 842px;
				}
				.alert-banner-group > capitec-label[type="strong"] {
					--theme-label-default-font-size: 14px;
				}
				.alert-banner-group > capitec-label[type="strong"] {
					--theme-label-strong-font-size: 14px;
					--theme-label-strong-font-weight: 600;
				}
				capitec-hyperlink {
					--theme-hyperlink-font-size: 14px;
					--theme-font-weight: 600;

					text-decoration: underline;
				}

				.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}
				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-heading-margin-left: 6px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}
				horizon-product-tile[disabled] {
					--theme-product-tile-subtitle-color: #7C7C7C;
					--theme-product-tile-default-colour: #7C7C7C;
				}
				.main-cb > .product-transact {
					--theme-product-tile-hover-default-border: 1px solid #009DE0;
					--theme-product-tile-focus-default-border: 1px solid #009DE0;
				}
				.main-cb > .product-save {
					--theme-product-tile-hover-default-border: 1px solid #00486D;
					--theme-product-tile-focus-default-border: 1px solid #00486D;
				}
				.main-cb > .product-credit {
					--theme-product-tile-hover-default-border: 1px solid #C83B37;
					--theme-product-tile-focus-default-border: 1px solid #C83B37;
				}
				.choose-period > horizon-product-tile {
					width: 220px;

					--theme-layout-gap-spacing: 16px;
				}
				.main-cb > .choose-date-range {
					margin-bottom: 0px;
					--theme-product-tile-focus-shadow: 0px 0px 0px 0px;
					--theme-product-tile-focus-transact-border: 1px solid #E1E1E1;
					--theme-product-tile-border-radius: 4px 4px 0px 0px;
				}
				.custom-date-card {
					border-top: 0px;

					--theme-card-border-radius: 0px 0px 4px 4px;
					--theme-card-min-height: 80px;
				}
				.custom-date-card > capitec-content-box {
					--theme-container-padding-bottom: 8px;
				}
				.custom-date-card > capitec-content-box > capitec-group:first-child {
					--theme-layout-gap-spacing: 8px;
				}
				capitec-group > .calendar:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				.footer {
					width: var(--horizon-statements-modal-footer-width, 960px);
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
				}
				.footer > capitec-button {
					height: 48px;
				}
				.m-r-0 {
					margin-right: 0px;
				}
				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				.view-document > capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				.pdf-cb {
					height: inherit;
				}
				.pdf-viewer {
					height: 100%;
					width: 960px;
					background-color: #FFFFFF;
				}
				.seperator {
					width: 928px;
					border: 1px solid #E1E1E1;
					margin-bottom: 30px;
					margin-top: 30px;
				}
				capitec-date-time-picker.calendar {
					height: auto;
					margin-left: 16px;
					margin-bottom: 16px;
					margin-top:16px;
					--theme-date-time-picker-host-min-width:696px;
				}
				/* HEADER STYLES */
				.transact {
					--theme-modal-header-background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
				}
				.save {
					--theme-modal-header-background: linear-gradient(90deg, #003354 0%, #00486D 100%);
				}
				.lbb {
					--theme-modal-header-background: url('/images/liveBetter/live-better-background.png');
				}
				.credit {
					--theme-modal-header-background: linear-gradient(90deg, #C83C37 0%, #E61414 100%);
				}
				/* HEADER STYLES */

				horizon-select-icon {
					width: 344px;

					--theme-select-options-max-height: 304px;
					--theme-input-icon-margin-left: 16px;
					--theme-icon-size-small: 24px;
					--theme-input-padding-top: 8px;
					--theme-input-padding-bottom: 8px;
				}
			`
		];
	};

	_webTemplate() {
		return html`
			<bb-stepper-modal
				class="${this.productSelected?.category ?? ``} ${this.accountType}"
				data-automation-id="statements-dialog"
				.header="${this._getHeaderTitle()}"
				.steps="${this.STEPPER_STEPS}"
				current-active-step="${this.currentStep}"
				.hideStepper="${this._getStepperVisibility()}">
					<div slot="step">
						${this._renderContent()}
					</div>

					<div slot="footer">
						${this._renderFooter()}
					</div>
			</bb-stepper-modal>`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.PDF:
				return html`${this._renderPDFViewer()}`;
			default:
				return html`
					<capitec-content-box
						class="main-cb"
						layout="vertical"
						gap="clear"
						?noScroll="${false}">
							${this._renderAlertBanner()}
							${this._renderSelectAccount()}
							${this._renderChoosePeriod()}
							${this._renderEmailClient()}
					</capitec-content-box>
				`;
		}
	}

	_renderAlertBanner() {
		switch (true) {
			case this.errorMessage !== ``:
				return html`
					<capitec-alert-banner
						data-automation-id="statements-dialog-alert-message"
						type="unsuccessful-red">
							<p><b>Notify:</b> ${this.errorMessage}</p>
					</capitec-alert-banner>`;
			case this.productSelected.type === ACCOUNT_INTCAT_ENUM[ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN].type:
				return html`
					<capitec-alert-banner
						data-automation-id="statements-dialog-alert-message"
						type="warning">
							<p><b>Notify client:</b>${NOTIFICATION_MESSAGE.FLEXIBLE_SAVINGS_FEE}</p>
					</capitec-alert-banner>`;
			case this.productSelected.category === ACCOUNT_TYPES.CREDIT:
				return html`
					<capitec-alert-banner
						data-automation-id="statements-credit-alert-banner"
						type="warning">
						<capitec-group
							layout="horizontal"
							gap="none"
							class="alert-banner-group">
								<capitec-label type="strong" label="Notify client:"></capitec-label>
								<capitec-label type="default"
									label="${NOTIFICATION_MESSAGE.FEE}">
								</capitec-label>
								<capitec-spacer></capitec-spacer>
								<capitec-hyperlink 
									data-automation-id="statements-credit-view-fees"
									label="View fees"
									@click="${() => this.dispatchEvent(new CustomEvent(`view-fees`, {}))}">
								</capitec-hyperlink>
						</capitec-group>
					</capitec-alert-banner>`;
			case this.notifyClient && isNullorEmpty(this.errorMessage):
				return html`
					<capitec-alert-banner
						data-automation-id="statements-dialog-notify-message"
						type="info"
						@click="${() => this.notifyClient = false}"
						closable>
							<p><b>Notify client:</b>${NOTIFICATION_MESSAGE.APP}</p>
					</capitec-alert-banner>`;
			default:
				return html``;
		}
	}

	_renderSelectAccount() {
		if (this.renderMode === RENDER_MODE.CHOOSE_ACCOUNT) {
			return html`
				<capitec-label
					type="subtitle"
					label="Choose an Account">
				</capitec-label>

				<horizon-select-icon
					label="Choose account"
					.items="${this.clientProducts}"
					display-field="accountName"
					id-field="accountNumber"
					.value="${this.productSelected}"
					.displayRenderer="${(e) => this._renderOptions(e)}"
					@value-changed="${(e) => this._valueChanged(e)}"> 
				</horizon-select-icon>
			`;
		}
	}

	_renderOptions(e) {
		return html`
			<capitec-group style="padding: 0px" layout="horizontal">
				${this._renderOptionIcon(e)}
				<capitec-label label="${e.accountName}"></capitec-label>
			</capitec-group>
		`;
	}

	_renderOptionIcon(e) {
		const iconClass = `width: 24px; height: 24px; margin: 0px 8px 0px 0px; --theme-icon-size-small: 24px;`;

		return e.icon
			? html`
				<capitec-icon
					style="${unsafeCSS(iconClass).toString()}"
					size="medium"
					icon="${e.icon}">
				</capitec-icon>`
			: html`
				<capitec-image
					style="${unsafeCSS(iconClass).toString()}"
					src="${e.customIcon}">
				</capitec-image>`;
	}

	_renderChoosePeriod() {
		switch (true) {
			case this.productSelected.choosePeriod === RANGE_SELECTOR.MONTH && this.renderMode === RENDER_MODE.CHOOSE_PERIOD:
				return html`${this._renderChooseMonthPeriod()}`;
			case this.productSelected.choosePeriod === RANGE_SELECTOR.DATE && this.renderMode === RENDER_MODE.CHOOSE_PERIOD:
				return html`${this._renderChooseDatePeriod()}`;
			default:
				return html``;
				
		}
	}

	_renderChooseDatePeriod() {
		return html`
			<capitec-label
				type="subtitle"
				label="Choose Period">
			</capitec-label>

			<capitec-group
				class="choose-period"
				layout="horizontal">
					<horizon-product-tile
						data-automation-id="statements-dialog-one-month-period"
						type="radio-button"
						label="1 month"
						subtitle="Last 30 days"
						detail=""
						?disabled="${this._getDateRange(30)}"
						@click="${(e) => this._choosePeriod(`ONE_MONTH`)}"
						?selected="${this.periodSelected === TIME_PERIOD.ONE_MONTH.value}">
					</horizon-product-tile>
					<horizon-product-tile
						data-automation-id="statements-dialog-three-months-period"
						type="radio-button"
						label="3 months"
						subtitle="Last 90 days"
						detail=""
						?disabled="${this._getDateRange(90)}"
						@click="${(e) => this._choosePeriod(`THREE_MONHTS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.THREE_MONHTS.value}">
					</horizon-product-tile>
					<horizon-product-tile
						data-automation-id="statements-dialog-six-months-period"
						type="radio-button"
						label="6 months"
						subtitle="Last 180 days"
						detail=""
						?disabled="${this._getDateRange(180)}"
						@click="${(e) => this._choosePeriod(`SIX_MONTHS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.SIX_MONTHS.value}">
					</horizon-product-tile>
					<horizon-product-tile
						data-automation-id="statements-dialog-nine-months-period"
						type="radio-button"
						label="9 months"
						subtitle="Last 270 days"
						detail=""
						?disabled="${this._getDateRange(270)}"
						@click="${(e) => this._choosePeriod(`NINE_MONTHS`)}"
						?selected="${this.periodSelected === TIME_PERIOD.NINE_MONTHS.value}">
					</horizon-product-tile>
			</capitec-group>
			${this._renderCustomDateRange()}
		`;
	}

	_renderCustomDateRange() {
		return html`
			<capitec-label
				class="date-label"
				type="subtitle"
				label="Choose date range">
			</capitec-label>

			<horizon-product-tile
				data-automation-id="statements-dialog-choose-date-range"
				class="choose-date-range"
				type="radio-button"
				label="Choose date range"
				subtitle="Up to 90 days"
				detail=""
				?selected="${this.periodType === PERIOD_TYPE.CUSTOM}"
				@click="${() => this._customDateRangeSelected()}">
			</horizon-product-tile>
			${this._renderCalendarInput()}
		`;
	}

	_renderCalendarInput() {
		if (this.periodType === PERIOD_TYPE.CUSTOM) {
			return html`
				<capitec-card
					class="custom-date-card">
						<capitec-group
							layout="horizontal">
								${this._renderCalendar()}
						</capitec-group>
				</capitec-card>
			`;
		}
		return html``;
	}

	_renderCalendar() {
		return html`
			<capitec-date-time-picker
				data-automation-id="statements-dialog-calendar"
				class="calendar"
				type="range"
				mode="date"
				label="Choose from and to date"
				startDate = "${this.fromDate === `dd mm yyyy` ? `` : this.fromDate}"
				endDate = "${this.toDate === `dd mm yyyy` ? `` : this.toDate}"
				minDate = "${this._getMinDate(this.productSelected.accountOpenDate).toISOString()}"
				maxDate = "${this.today}"
				error = "${this.calendarErrorMessage}"
				inputType="calendar"
				outputType="string"
				@value-changed="${(e) => this._calendarSelectionChange(e)}">
			</capitec-date-time-picker>`;
	}

	_renderChooseMonthPeriod() {
		return html`
			<horizon-month-period-selector
				accountOpenDate="${this.productSelected.accountOpenDate}"
				.value="${this.selectedMonths}"
				@value-changed="${(event) => this._monthPeriodSelected(event)}">
			</horizon-month-period-selector>
		`;
	}

	_renderEmailClient() {
		return this.renderMode === RENDER_MODE.EMAIL
		? html`
			<horizon-email-input
				labelOne="${this.emailLabel}"
				labelTwo="${this.confirmEmailLabel}"
				email="${this.email}"
				confirmEmail="${this.confirmEmail}"
				?showRequiredError="${this.errorMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
				.callBack="${() => this._clearAlerts()}"
				@value-changed="${(e) => this._emailValueChanged(e)}">
			</horizon-email-input>

			<hr class="seperator">

			<capitec-label
				type="subtitle"
				label="View document">
			</capitec-label>
			${this._renderViewDocuments()}`
		: html``;
	}

	_renderViewDocuments() {
		switch (true) {
			case this.productSelected.choosePeriod === RANGE_SELECTOR.MONTH:
				return html`${this._renderSelectedMonthsView()}`;
			case this.productSelected.choosePeriod === RANGE_SELECTOR.DATE:
			default:
				return html`${this._renderSelectedDateView()}`;
		}
	}

	_renderSelectedDateView() {
		return html`
			<horizon-product-tile
				data-automation-id="statements-dialog-view-document"
				class="view-document"
				type="default"
				label="${this._summary.dateRangeLabel}"
				subtitle="${this._summary.detail}">
					${this._renderViewDocumnetLink()}
			</horizon-product-tile>
		`;
	}

	_renderSelectedMonthsView() {
		return this.selectedMonths.map(month => {
			const [first, second] = month.split(`/`); // first as month & second as year

			return html`
				<horizon-product-tile
					data-automation-id="statements-dialog-view-document"
					class="view-document"
					type="default"
					label="${formatDate(`${first}/01/${second}`, `MM yyyy`)}"
					subtitle="${this._getDaysinMonth(first, second)} days">
						${this._renderViewDocumnetLink(month)}
				</horizon-product-tile>`;
		});
	}

	_renderViewDocumnetLink(month = null) {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document"
				@click="${() => this._viewPDF(month)}">
			</capitec-label>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-content-box
				class="footer"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<capitec-button
						data-automation-id="statements-dialog-back"
						type="clear"
						label="Back"
						@click="${(e) => this._back()}"
						?hidden="${this.currentStep === 0 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-spacer></capitec-spacer>
					<capitec-button
						data-automation-id="statements-dialog-cancel"
						type="clear"
						label="Cancel"
						@click="${() => this._cancel()}"
						?hidden="${this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						class="m-r-0"
						data-automation-id="statements-dialog-next"
						type="primary"
						label="Next"
						@click="${() => this._next()}"
						?hidden="${this.currentStep === this.STEPPER_STEPS.length - 1}"
						?disabled="${Boolean(this.productSelected?.ccsStatus)}">
					</capitec-button>
					<capitec-button
						class="m-r-0"
						data-automation-id="statements-dialog-send"
						type="primary"
						label="Send"
						@click="${() => this._sendStatement()}"
						?hidden="${this.currentStep !== this.STEPPER_STEPS.length - 1 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						data-automation-id="statements-dialog-close"
						type="primary"
						label="Close"
						@click="${() => this._close()}"
						?hidden="${this.renderMode !== RENDER_MODE.PDF}">
					</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderPDFViewer() {
		return html`
			<capitec-content-box
				data-automation-id="statements-dialog-pdf-viewer"
				class="main-cb pdf-cb"
				layout="vertical"
				gap="clear"
				?noScroll="${false}">
					<object
						class="pdf-viewer"
						data="${this.encodedPDF}"
						type="application/pdf">
					</object>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`horizon-statements-dialog`, StatementsDialog);

/**
 * When Cancel button is clicked
 *
 * @example
 * <horizon-statements-dialog ... @cancel="${this._handler}"></horizon-statements-dialog>
 *
 * @event StatementsDialog#cancel
 * @type {Object} - N/A
 */