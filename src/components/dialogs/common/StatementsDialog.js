import { calculateDays, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { Component, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'platform/components/popups/Modal';
import 'app/components/Common/StepperModal';

const RENDER_MODE = Object.freeze({
	EMAIL: 0,
	PDF: 1
});

const STATEMENTS_STEPS = [
	{
		title: `Choose Account`
	},
	{
		title: `Choose Period` 
	},
	{
		title: `Specify Email and View Documents`
	}
];

const ACCOUNT_TYPES = {
	SAVINGS_ACCOUNT: `SavingsAccount`,
	SAVINGS_PLAN: `SavingsPlans`,
	CREDIT: `Credit`
};

const TIME_PERIOD = {
	ONE_MONTH: {
		value: 1,
		label: `1 month`,
		range: 30
	},
	THREE_MONHTS: {
		value: 3,
		label: `3 months`,
		range: 90
	},
	SIX_MONTHS: {
		value: 6,
		label: `6 months`,
		range: 180
	},
	NINE_MONTHS: {
		value: 9,
		label: `9 months`,
		range: 270
	}
};

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * View and email statements based on account selection and date range.
 * This component will be called from the favourites screen statements option as well as related options component. (TODO)
 * 
 * Events Raised 
 * -------------
 * date range selction
 * cancel
 * send
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

        this.renderMode = RENDER_MODE.EMAIL;
        this.header = this.renderMode === RENDER_MODE.PDF ? `View Document` : `Statements`;
        this.currentStep = 0;
        this.notifyClient = true;
        this.accType = ``;
        this.savingsPlanAccType = ``;
        this.savingsPlans = [];
        this.periodSelected = -1;
        this.showCalendar = false;
        this._customDateRange = false;
        this.fromDate = `dd mm yyyy`;
        this.toDate = `dd mm yyyy`;
        this.errorMessage = ``;
        this.email = ``;
        this.confirmEmail = ``;
        this._summary = {
            dateRangeLabel: ``,
            detail: ``
        };
        this.calendarErrorMessage = ``;
        this.mailClientError = {
            email: ``,
            confirmEmail: ``
        };
        this.encodedPDF = ``;
        this.today = new Date();

        //Static list, has to be pulled from service
        this.savingsPlans = [
            {
                value: 1,
                name: `Future savings`,
                amount: `R 546844.25`
            },
            {
                value: 2,
                name: `Education`,
                amount: `R 504.25`
            }
        ];
        //this._populateAccountInfo();
        this.horizonStore = HorizonStore.getInstance();
        this.navigationContext = NavigationContext.getInstance();
        this.eventAggregator = EventAggregator.getInstance();
        this.horizonRouter = HorizonRouter.getInstance();
        this.landingPageInfo = {};

        this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
    }

    // ----------
    // PROPERTIES
    // ----------

    static get properties() {
        return {
            landingPageInfo: { type: Object },

            currentStep: { attribute: false },
            renderMode: { attribute: false },
            notifyClient: { attribute: false },
            accType: { attribute: false },
            savingsPlanAccType: { attribute: false },
            periodSelected: { attribute: false },
            showCalendar: { attribute: false },
            fromDate: { attribute: false },
            toDate: { attribute: false },
            _customDateRange: { attribute: false },
            errorMessage: { attribute: false }
        };
    }

    // ----------------
    // LIFECYLCE EVENTS
    // ----------------

    connectedCallback() {
        super.connectedCallback();

        this.state = this.horizonStore.recoverState();
        this.callerInformation = this.state.callerInformation;
        //this.landingPageInfo = this.state.landingPageInfo;
        this.accountInformation = this.state.leftBarButtonConfig.detail;
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
            0: selectAccount,
            1: selectPeriod,
            2: emailClient
        };
        const result = validations[this.currentStep]();
        if (result && this.errorMessage===``) {
            this.currentStep++;
        }
    }

    _back() {
        this.errorMessage = ``;
        this.currentStep--;
    }

    _selectAccount(type) {
        this.accType = type;
        this.savingsPlanAccType = ``;
        this.errorMessage = ``;
    };

    _selectPlan(savingsPlan) {
        this.savingsPlanAccType = savingsPlan;
        this.errorMessage = ``;
    }

    _choosePeriod(range) {
        this.periodSelected = TIME_PERIOD[range].value;
        this._summary.dateRangeLabel = `${TIME_PERIOD[range].label} (${TIME_PERIOD[range].range} days)`;
        this._summary.detail = `Last ${TIME_PERIOD[range].range} days`;

        this.toDate = new Date();
        this.fromDate = new Date();
        this.fromDate.setDate(this.toDate.getDate() - TIME_PERIOD[range].range);

        this._customDateRange = false;
        this.errorMessage = ``;
    }

    _customDateRangeSelected() {
        this.showCalendar = true;
        this.periodSelected = -1;
        this.calendarErrorMessage = ``;
        this.fromDate = `dd mm yyyy`;
        this.toDate = `dd mm yyyy`;
        this._customDateRange = !this._customDateRange;
    }

    _showCalendar() {
        this.showCalendar = !this.showCalendar;
    }

    _startDateChanged(e) {
        if (e.detail.new.date) {
            this.fromDate = this._formatDate(e.detail.new.date);
            if (this._validateRangeSelected()) {
                this.showCalendar = this.toDate === `dd mm yyyy`;
                this.errorMessage = ``;
            }
        }
    }

    _endDateChanged(e) {
        if (e.detail.new.date) {
            this.toDate = this._formatDate(e.detail.new.date);
            if (this._validateRangeSelected()) {
                this.showCalendar = this.fromDate === `dd mm yyyy`;
                this._summary.dateRangeLabel = `Choose date range`;
                this.errorMessage = ``;
            }

        }
    }
    
    _calendarSelectionChange(e) {
        this.fromDate = new Date(e.detail.new.startDate);
        this.toDate = new Date(e.detail.new.endDate);
        var rangeDiff = Math.floor((this.toDate.getTime() - this.fromDate.getTime()) / (1000 * 3600 * 24));

        if (rangeDiff > 90) {
            this.errorMessage = `Out of range, please select the correct range up to 90 days`;
            this.calendarErrorMessage = `Date range up to 90 days only`;
        } else {
            console.log("in range");
            this.errorMessage = ``;
            this.calendarErrorMessage = ``;
        }
    }

    _emailFormatCheck(e) {
        
        this[e.currentTarget.id] = e.detail.new;

        if (e.detail.new.length > 0) {
            if (!EMAIL_REGEX.test(e.detail.new)) {
                this.errorMessage = `Invalid email format`;
                this.mailClientError[e.currentTarget.id] = `Invalid email format`;
            } else {
                this.errorMessage = ``;
                this.mailClientError[e.currentTarget.id] = ``;
            }
        }
        if (!this._confirmEmailMatch()) {
            this.errorMessage = `Emails don't match`;
            this.mailClientError[e.currentTarget.id] = `Emails don't match`;
        }
        this.requestUpdate();
    }

    _confirmEmailMatch() {

        if (!isNullorEmpty(this.email) && !isNullorEmpty(this.confirmEmail)) {
            return this.email === this.confirmEmail;
        }
        return true;
    }

    _inputEmail(e) {
        this.mailClientError[e.currentTarget.id] = ``;
        this.errorMessage = ``;
    }

    async _viewPDF() {
        console.log("landingpageinfo  " + this.landingPageInfo.accountNumber + "  from and to date " + this.fromDate + "  " + this.toDate);
        this.renderMode = RENDER_MODE.PDF;
        var test = `PRIMARY_SAVINGS`;

        const statement = {
            "cifNumber": this.callerInformation.cifNumber,
            "accountNumber": this.landingPageInfo.accountNumber,
            "accountType": accountType,
            "statementDateRange": {
                "dateRange": {
                    "startDate": new Date(this.fromDate).toISOString().slice(0, 10),
                    "endDate": new Date(this.toDate).toISOString().slice(0, 10)
                },
                "presetInterval": ""
            }
        };

        const returnValue = await this.quickTransactionService.viewStatement(statement);
        if (returnValue.succeeded) {
            console.log("result  " + returnValue.result.statementData);
            // render the PDF
            this.encodedPDF = returnValue.result.statementData;
        } else {
            console.log(`can't view cs call failed`);
            // render an error
        }
    }

    async _sendStatement() {

        if (!this._validateEmailAddress()) {
            return false;
        }

        const state = {
            // still to fill these in
        };

        this.horizonStore.saveState(state);

        const statement = {
            "emailAddress": this.email,
            "cifNumber": this.callerInformation.cifNumber,
            "accountNumber": this.landingPageInfo.accountNumber,
            "accountType": this.accountSelected,
            "statementDateRange": {
                "dateRange": {
                    "startDate": new Date(this.fromDate).toISOString().slice(0, 10),
                    "endDate": new Date(this.toDate).toISOString().slice(0, 10)
                },
                "presetInterval": ``
            }
        };

        const returnValue = await this.quickTransactionService.sendStatement(statement);

            if (returnValue.succeeded) {
			this.horizonStore.saveState({
				email: this.email,
				account_number: this.landingPageInfo.account_number
			});
                //TODO: Ramesh to add navigation to successfull page
               this.horizonRouter.navigateToStatementSuccessful();

            } else {
                //TODO: Unsuccessful page nav
				this.horizonStore.saveState({
					email: this.email,
					account_number: this.landingPageInfo.account_number
				});
               //this.horizonRouter.navigateToStatementUnsuccessful();
			   this.horizonRouter.navigateToStatementSuccessful();
            }
        }
    

    _toggleBusyFlag() {
        this.isBusy = !this.isBusy;
    }

    //async _populateAccountInfo() {
    //     const accountInfo = {            
    //         "cifNumber": this.callerInformation.cifNumber,
    //         "accountNumber": this.landingPageInfo.account_number,
    //         "accountType": this.accountSelected,

    //     };

    //     const returnValue = await this.quickTransactionService.getAccountInfo(accountInfo);

    //     if (returnValue.succeeded) {
    //         this.savingsPlans = returnValue.result;
    //     }               
    // }

    _validateAccountSelection() {
        if (isNullorEmpty(this.accType)) {
            this.errorMessage = `Select an account`;
            return false;
        } else if (this.accType === ACCOUNT_TYPES.SAVINGS_PLAN && isNullorEmpty(this.savingsPlanAccType)) {
            this.errorMessage = `Select an account`;
            return false;
        }
        return true;
    }

    _validatePeriodSelection() {
        if (this.periodSelected === -1 && !this._customDateRange) {
            this.errorMessage = `Please choose a from and to date`;
            this.calendarErrorMessage = `Required`;
            return false;
        } else if (this._customDateRange && (this.fromDate === `dd mm yyyy` || this.toDate === `dd mm yyyy`)) {
            this.errorMessage = `Please choose a from and to date`;
            this.calendarErrorMessage = `Required`;
            return false;
        }else{
			this._getSummary();
		}
		return true;
	}

	_validateEmailAddress() {
		this.mailClientError.email = isNullorEmpty(this.email) ? `Please enter email` : ``;
		this.mailClientError.confirmEmail = isNullorEmpty(this.confirmEmail) ? `Please enter email` : ``;

		this.errorMessage = this.mailClientError.email || this.mailClientError.confirmEmail ? `Complete all fields.` : ``;
		return this.errorMessage === ``;
    }

    _validateRangeSelected() {
        console.log("validating");
        if (this._customDateRange) {
            var rangeDiff = Math.floor((new Date(this.toDate).getTime() - new Date(this.fromDate).getTime()) / (1000 * 3600 * 24));
            if (rangeDiff > 90) {
                this.errorMessage = `Out of range, please select the correct range up to 90 days`;
                return false;
            }
        }
        return true;
    }

	_getSummary() {

		if (this._customDateRange) {
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

    _formatDate(date) {
        var myDate = new Date(date);
		return `${myDate.getDate()} ${getMonthName(myDate.getMonth())} ${myDate.getFullYear()}`;
	}

	_getFullMonthName(date) {
		const parsedDate = new Date(date);
		return parsedDate.toLocaleString(`default`, { month: `long` });
	}

	_errorHandler(exception) {
		return true;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
            css`

			bb-stepper-modal  {              
				--theme-modal-header-height: 64px;
				--theme-modal-header-font-size: 18px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-header-color: #3A3A3A;
				--theme-modal-header-background-color: #F7F7F7;
                //--theme-stepper-inner-step-container-height: 56px;
                --theme-stepper-inner-step-container-width: 324px;
                --theme-stepper-step-title-font-style: Hind Vadodara SemiBold;
                --theme-stepper-step-title-font-size: 15px;
                --theme-stepper-step-title-max-width: 328px;
              //  --theme-stepper-step-content-container-padding-left: 16px;
                --theme-container-padding-left: 0px;
                --theme-container-padding-right: 0px;
                --theme-container-padding-top: 0px;
                --theme-container-padding-bottom: 0px;
                --theme-wizard-modal-max-width: 976px;
                --theme-wizard-modal-max-height: 930px;
                --theme-wizard-modal-lg-max-width:976px;
			} 
				.margin-top {
					margin-top: var(--horizon-statement-generic-margin-top, 24px);
				}
				
				//div[slot="step"] {
				//	--theme-layout-gap-spacing: 0px;
				//}
				capitec-modal {
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 0px;
				}
				.main-cb {
					height: 730px;

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
				}
				.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 16px;
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
				.date-selector {
					--theme-layout-gap-spacing: 16px;
				}
				.date-selector > capitec-label[type="default"] {
					line-height: 20px;

					--theme-layout-gap-spacing: 4px;
					--theme-label-default-font-size: 14px;
					--theme-label-default-font-weight: 600;
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
				.datePicker-btn {
					width: 386px;
					height: 48px;

					--theme-button-white-border-color: #E1E1E1;
					--theme-button-padding-top: 6px;
					--theme-button-padding-bottom: 6px;
					--theme-button-padding-left: 16px;
					--theme-button-padding-right: 16px;
				}
				.datePicker-btn:hover {
					box-shadow: none;
				}
				.calendar-label {
					font-weight: normal;
					color: #3A3A3A;
				}
				capitec-icon {
					width: 26px;
					height: 26px;
					margin-bottom: 3px;
					margin-top: 3px;

					--theme-icon-size-small: 26px;
				}
				capitec-group > .calendar:first-child {
					--theme-layout-gap-spacing: 0px;
				}
				.footer {
					width: var(--horizon-statements-modal-footer-width, 975px);
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 16px;
				}
				.footer > capitec-button {
					height: 48px;
				}
				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}
				capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;

				}
				.pdf-viewer {
					height: 693px;
					width: 975px;
					background-color: #FFFFFF;
				}
				.seperator {
					width: 928px;
					border: 1px solid #E1E1E1;
					margin-bottom: 30px;
					margin-top: 30px;
				}
            capitec-date-time-picker.calendar{
				height: auto;
				margin-left: 16px;
				margin-bottom: 16px;
                margin-top:16px;
                --theme-date-time-picker-host-min-width:696px;
            }

.chooseText{
padding-top:8px;
}
			`
		];
	};

    _webTemplate() {
		return html`
			<bb-stepper-modal 
				.steps="${STATEMENTS_STEPS}"
				current-active-step="${this.currentStep}"
				header="${this.header}">
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
			case RENDER_MODE.EMAIL:
			default:
				return html`
					<capitec-content-box
						class="main-cb"
						layout="vertical"
						gap="clear"
						noScroll =  ${false}>
							${this._renderAlertBanner()}
							${this._renderAccountSelection()}
							${this._renderChoosePeriod()}
							${this._renderEmailClient()}
					</capitec-content-box>
				`;
		}
	}

	_renderAlertBanner() {
		if (this.errorMessage) {
			return html`
				<capitec-alert-banner
					type="unsuccessful-red">
						<p><b>Notify:</b> ${this.errorMessage}</p>
				</capitec-alert-banner>`;
		}

		if (this.notifyClient && isNullorEmpty(this.errorMessage)) {
			return html`
				<capitec-alert-banner
					type="info"
					@click="${() => this.notifyClient = false}"
					closable>
						<p><b>Notify client:</b> A fee will be charged for email statements</p>
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderAccountSelection() {
		if (this.currentStep === 0) {
			return html`
				<capitec-label
					type="subtitle"
					label="Choose an Account">
				</capitec-label>

				<horizon-product-tile
					class="product-transact"
					type="default"
					label="Savings Account"
					subtitle="Available balance R5 670.40"
					detail=""
					icon="product/transact"
					@click="${(e) => this._selectAccount(`SavingsAccount`)}"
					?selected="${this.accType === `SavingsAccount`}">
				</horizon-product-tile>
				<horizon-product-tile
					class="product-save"
					type="default"
					label="Savings Plans"
					subtitle="Available balance R16 800.00"
					detail=""
					icon="product/save"
					@click="${(e) => this._selectAccount(`SavingsPlans`)}"
					?selected="${this.accType === `SavingsPlans`}">
				</horizon-product-tile>
				<!--<horizon-product-tile
					class="product-credit"
					type="default"
					label="Credit Card"
					subtitle="Available balance R22 400.00"
					detail=""
					icon="product/credit"
					@click="${(e) => this._selectAccount(`Credit`)}"
					?selected="${this.accType === `Credit`}">
				</horizon-product-tile>-->

				${this._renderSavingsPlanSelection()}
			`;
		}
	}

	_renderSavingsPlanSelection() {
		if (this.accType === ACCOUNT_TYPES.SAVINGS_PLAN) {
			return html`
				<capitec-label
					class="margin-top"
					type="subtitle"
					label="Choose a Savings Plan">
				</capitec-label>

				<capitec-radio-group>
					${this.savingsPlans.map(item => html`
						<horizon-product-tile 
							type="radio-button"
							label="${item.name}""
							subtitle="Available balance: ${item.amount}"
							detail=""
							icon="product/transact"
							@click="${(e) => this._selectPlan(item.name)}"
							?selected="${this.savingsPlanAccType === item.name}">
						</horizon-product-tile>
					`)}
				</capitec-radio-group>
			`;
		}
		return html``;
	}

	_renderChoosePeriod() {
		if (this.currentStep === 1) {
			return html`
				<capitec-label
					type="subtitle"
					label="Choose Period">
				</capitec-label>

				<capitec-group
					class="choose-period"
					layout="horizontal">
						<horizon-product-tile
							type="radio-button"
							label="1 month"
							subtitle="Last 30 days"
							detail=""
							@click="${(e) => this._choosePeriod(`ONE_MONTH`)}"
							?selected="${this.periodSelected === TIME_PERIOD.ONE_MONTH.value}">
						</horizon-product-tile>
						<horizon-product-tile
							type="radio-button"
							label="3 months"
							subtitle="Last 90 days"
							detail=""
							@click="${(e) => this._choosePeriod(`THREE_MONHTS`)}"
							?selected="${this.periodSelected === TIME_PERIOD.THREE_MONHTS.value}">
						</horizon-product-tile>
						<horizon-product-tile
							type="radio-button"
							label="6 months"
							subtitle="Last 180 days"
							detail=""
							@click="${(e) => this._choosePeriod(`SIX_MONTHS`)}"
							?selected="${this.periodSelected === TIME_PERIOD.SIX_MONTHS.value}">
						</horizon-product-tile>
						<horizon-product-tile
							type="radio-button"
							label="9 months"
							subtitle="Last 270 days"
							detail=""
							@click="${(e) => this._choosePeriod(`NINE_MONTHS`)}"
							?selected="${this.periodSelected === TIME_PERIOD.NINE_MONTHS.value}">
						</horizon-product-tile>
				</capitec-group>
				${this._renderPeriodSelected()}
			`;
		}
	}

	_renderPeriodSelected() {
		return html`
			<capitec-label
				class="margin-top"
				type="subtitle"
				label="Choose date range">
			</capitec-label>

			<horizon-product-tile
				class="choose-date-range"
				type="radio-button"
				label="Choose date range"
				subtitle="Up to 90 days"
				detail=""
				?selected="${this._customDateRange}"
				@click="${() => this._customDateRangeSelected()}">
			</horizon-product-tile>
								${this._renderCustomDateRange()}
		`;
	}

	_renderCustomDateRange() {
        if (this._customDateRange) {
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
		if (this.showCalendar) {
            return html`
							<capitec-date-time-picker
									class="calendar"
									type="range"
									mode="date"
                                    label="Choose from and to date"
                                    startDate = "${this.fromDate == `dd mm yyyy` ? `` : this.fromDate}"
                                    endDate = "${this.toDate == `dd mm yyyy` ? `` : this.toDate}"
                                    maxDate = "${this.today}"									
                                    error = "${this.calendarErrorMessage}"
									inputType="calendar"
									outputType="string"
									@value-changed="${(e) => this._calendarSelectionChange(e)}">
							</capitec-date-time-picker>
			`;
		}
		return html``;
	}

	_renderEmailClient() {
		if (this.currentStep === 2 && this.renderMode === RENDER_MODE.EMAIL) {
			return html`
				<capitec-label
					type="subtitle"
					label="Enter email address">
				</capitec-label>

				<capitec-text-field
					id="email"
					label="Email address"
					value="${this.email}"
					error="${this.mailClientError.email}"
					@value-changed="${(e) => this._emailFormatCheck(e)}"
					@input="${(e) => this._inputEmail(e)}">
				</capitec-text-field>
		
				<capitec-label
					class="chooseText"
					type="subtitle"
					label="Confirm email address">
				</capitec-label>

				<capitec-text-field
					id="confirmEmail"
					label="Email address"
					value="${this.confirmEmail}"
					error="${this.mailClientError.confirmEmail}"
					@value-changed="${(e) => this._emailFormatCheck(e)}"
					@input="${(e) => this._inputEmail(e)}">
				</capitec-text-field>

				<hr class="seperator">

				<capitec-label
					type="subtitle"
					label="View document">
				</capitec-label>

				<horizon-product-tile
					class="view-document"
					type="default"
					label="${this._summary.dateRangeLabel}"
					subtitle="${this._summary.detail}">
						${this._renderViewDocumnetLink()}
				</horizon-product-tile>
			`;
		}
	}

	_renderViewDocumnetLink() {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document"
				@click="${() => this._viewPDF()}">
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
						type="clear"
						label="Back"
						@click="${(e) => this._back()}"
						?hidden="${this.currentStep === 0 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-spacer></capitec-spacer>
					<capitec-button
						type="clear"
						label="Cancel"
						@click="${() => this._cancel()}"
						?hidden="${this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Next"
						@click="${() => this._next()}"
						?hidden="${this.currentStep === 2 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Send"
						@click="${() => this._sendStatement()}"
						?hidden="${this.currentStep !== 2 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
					<capitec-button
						type="primary"
						label="Close"
						@click="${() => this.renderMode = RENDER_MODE.EMAIL}"
						?hidden="${this.renderMode !== RENDER_MODE.PDF}">
					</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderPDFViewer() {
		if (this.renderMode === RENDER_MODE.PDF) {
            return html`
				<capitec-content-box
						class="main-cb"
						layout="vertical"
						gap="clear"
						noScroll = ${false}>
				<object class="pdf-viewer" data="data:application/pdf;base64,${this.encodedPDF}" type="application/pdf">
				</object>
				</capitec-content-box>
			`;
		}
		return html``;
	}
}

window.customElements.define(`horizon-statements-dialog`, StatementsDialog);