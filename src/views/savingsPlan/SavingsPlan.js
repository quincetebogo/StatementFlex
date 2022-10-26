import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE, LANDING_PAGE_NEEDS } from 'app/constants/common';
import { Configuration, NavigationContext } from 'platform/core';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { SavingsPlanEvents, TRANSACTION_ENQUIRY_EVENTS, UNLOCK_FTSP_EVENTS } from 'app/constants/telemetry/events/SavingsPlan';
import { css, html, unsafeCSS } from 'platform/elements';
import { formatDate, formatDateTime, formatStringAsPascalCase, getMonthName } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { EventAggregator } from 'platform/EventAggregator';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { RoleManager } from 'app/shell/RoleManager';
import { SavingsService } from 'app/services/SavingsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { alertBannerMixin } from 'app/views/common/AlertBannerMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/dialogs/taxCertificates/TaxCertificates';
import 'app/dialogs/statements/Statements';
import 'app/components/common/TransactionHistory';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/quickTransactions/TaxCertificateLanding';
import 'app/productControls/SavingsPlan/UnlockFTSP';
import 'app/components/common/HorizonPDFViewer';

import 'app/views/savingsPlan/FlexibleSavingsPlan';
import 'app/views/savingsPlan/FixedTermSavingsPlan';

import 'app/views/savingsPlan/SavingsPlanServiceError';
import 'app/views/savingsPlan/SavingsPlanUnverifiedPage';

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

const TAX_TYPE = {
	IT3B: `iT3BTaxCertificates`,
	IT3S: `iT3STaxCertificates`
};

const NINETY_DAYS = 7777000000;

const ISO_8601_DATE_FORMAT = `yyyy-mm-dd`;

const TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

const UNLOCK_TYPE = {
	'Full unlock': `Full`,
	'Partial unlock': `Partial`
};


/**
 * Savings Plan View
 *
 * Events Raised
 * --------------
 * 
 * @export
 * @class SavingsPlan
 * @extends {ViewBase}
 * 
 */

export class SavingsPlan extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsPlanDetails = [];
		this.configuration = Configuration.getInstance();
		this.roleManager = RoleManager.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.selectedAccountNumber = ``;
		this.taxCertType = ``;
		this.taxCertificateDetails = null;
		this.transactionHistory = [];

		this.savingsService = new SavingsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.accountViewType = ``;
		
		this.eventAggregator = EventAggregator.getInstance();
		
		this.returnToScreen = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._optionClick(e.option, null, null, null, true));
	
		Object.assign(SavingsPlan.prototype, alertBannerMixin);
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = async (option, savePlanDetails, sendAnother = false) => {

			const statements = () => this._getStatements(savePlanDetails.accountNumber, sendAnother);
			const taxCertificates = () => this._taxCertificates(savePlanDetails.accountNumber, savePlanDetails.planName);
			const productEnquiry = () => this._productEnquiry();
			const interestRates = () => this._interestRates();
			const transactionHistory = () => this._transactionHistory(savePlanDetails);
			const unlockFtsp = () => this._unlockFtsp(savePlanDetails?.accountNumber || null);

			const actions = {
				'statements': statements,
				'tax-certificate': taxCertificates,
				'product-enquiry': productEnquiry,
				'interest-rates': interestRates,
				'transaction-history': transactionHistory,
				'unlock-ftsp': unlockFtsp
			};

			if (actions[option]) {
				await super._inicidentManager_(`${option}-save`, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}
		};
	}

	disconnectedCallback() {
		this.returnToScreen.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			landingPageInfo: { state: true },
			accountViewType: { state: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	_verifyNowClick() {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_VIEW_INFO, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});
		this._verifyClick();
	}
	
	async _clientVerified(event) {
		super._clientVerified(event);

		await this._initialise();
	}

	async _accountDetails(type, accNumber) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_NUMBER_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS
		});
		this.accountViewType = type;

		const flexibleSavePlan = () => this._getFlexibleSavePlan(accNumber);
		const fixedTermSavePlan = () => this._getFixedTermSavePlan(accNumber);

		const saveProducts = {
			'flexible-save-plan': flexibleSavePlan,
			'fixed-term-save-plan': fixedTermSavePlan
		};

		if (saveProducts[this.accountViewType]) {
			await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
			await super.createAndClassifySubsIncident();
			
			return saveProducts[this.accountViewType]();
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsService.savingsPlanLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);
			 
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to retrieve client Savings plan details from service.`, `_initialise`, returnValue.correlationId);
				this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
				return;
			}

			if (returnValue.succeeded && returnValue.result) {
                this.landingPageInfo = returnValue.result;
				this.savingsPlanDetails = returnValue.result.savingsPlans;
				this._formatSavingsPlanDetails();

				this._updateLeftBar();
				
				if (this.savingsPlanDetails.length === 0) {
					this.horizonRouter.navigateToProductInfo(`SavingsPlan`);
					return;
				}
				
				await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
				await super.createAndClassifySubsIncident(null, false);
			} 

			this._telemetry.startSpan(SavingsPlanEvents.SAVINGS_PLAN, {
				"screen": TelemetryScreen.SAVINGS_PLAN_LANDING
			});
		}

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.endCallContext = `LandingPage`;
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_formatSavingsPlanDetails() {
		const flexibleSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.feesLastMonth = item.feesLastMonth ? formatCurrency(item.feesLastMonth) : `-`;

			item.maturityDate = `-`;
			item.dateOpened = this._formatDate(item.dateOpened);
			item.lastUpdate = this._formatDate(item.lastUpdate);

			item.planName = formatStringAsPascalCase(item.planName);
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		const fixedSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.availableContributions = formatCurrency(item.availableContributions);
			item.contributionLimit = formatCurrency(item.contributionLimit);
			item.totalContributions = formatCurrency(item.totalContributions);

			item.maturityDate = this._formatDate(item.maturityDate);
			item.dateOpened = this._formatDate(item.dateOpened);
			item.dateFixed = this._formatDate(item.dateFixed);
			item.lastUpdate = this._formatDate(item.lastUpdate);
			
			item.planName = formatStringAsPascalCase(item.planName);
			item.depositeType = `${formatStringAsPascalCase(item.planType)} ${item.interestOption === `R` ? `- Reinvest` : ``}`;
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		this.savingsPlanDetails = [...flexibleSavingsPlanDetails, ...fixedSavingsPlanDetails];
	}

	_backFromAccountDetails() {
		// TO DO: This function to be used when clicked back from account details screen.
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_DETAILS_CLOSE, {
			"screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}
	
	_getStatements(accNumber, sendAnother) {
		if (sendAnother) {
			return true;
		}
		
		const accountDetails = this.savingsPlanDetails.find(savingsPlan => savingsPlan.accountNumber === accNumber);
	
		const productInfo = ACCOUNT_INTCAT_ENUM[accountDetails.accountType][accountDetails.interestCategory] || ACCOUNT_INTCAT_ENUM[accountDetails.accountType];
		const accName = accountDetails.planName.toLowerCase();

		this.clientProducts = [
			{
				'accountNumber': accountDetails.accountNumber,
				'accountName': `${accName.charAt(0).toUpperCase()}${accName.slice(1)} account`,
				'accountType': accountDetails.planType,
				'accountOpenDate': accountDetails.accountOpenDate,
				'type': productInfo.type,
				'category': productInfo.category,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order,
				'choosePeriod': productInfo.choosePeriod
			}
		];
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_STATEMENTS
		});
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_backToLandingPage() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _taxCertificates(accNumber, accountName) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_TAX_CERTIFICATE_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_TAX_CERTIFICATE
		});

		const returnValue = await this.quickTransactionService.getTaxCertificate(this.callerInformation.cifNumber, () => true);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get load tax certificates information`, `_taxCertificates`, returnValue.correlationId);
			this.horizonRouter.navigateToTaxCertificateServiceError();
			return;
		}

		this.taxCertificateDetails = returnValue.result;
		this.hasTaxCertificate = this.taxCertificateDetails.iT3BTaxCertificates.length + this.taxCertificateDetails.iT3STaxCertificates.length > 0;

		if (this.hasTaxCertificate) {
			this.taxCertType = accountName.toLowerCase().replaceAll(` `, ``).includes(`tax-free`) ? TAX_TYPE.IT3S : TAX_TYPE.IT3B;
			this.selectedAccountNumber = accNumber;
			this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
			return;
		}

		this.renderMode = RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/`);
	}

	async _interestRates() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/rates-and-fees/`);
	}

	async _transactionHistory(savePlanDetails) {
		await this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_TRANSACTION_HISTORY, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_TRANSACTION_HISTORY
		});

		// Updating current need to be specific to Save Type ie; Flexible or fixed term to classify an incident based on type.
		const need = savePlanDetails.accountType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN ? `flexible-save-transaction-history` : `fixed-save-transaction-history`;
		await super._inicidentManager_(need, () => this._toggleBusyFlag());
		this.savePlanDetails = savePlanDetails;

		await super.createAndClassifySubsIncident(null, false);
		await this._getTransactionHistory();
	}

	async _getTransactionHistory(startDate, endDate, startAtIndex) {

		const transactionHistoryRequest = {
			accountNumber: this.savePlanDetails.accountNumber,
			startDate: formatDate(startDate || TRANSACTION_HISTORY.START_DATE, ISO_8601_DATE_FORMAT),
			endDate: formatDate(endDate || TRANSACTION_HISTORY.END_DATE, ISO_8601_DATE_FORMAT),
			startAtIndex: startAtIndex || TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		const returnValue = await this.savingsService.savingsPlanTransactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
									.map((item) => {
										const date = new Date(Date.parse(item.transactionDate));
							
										item.description = item.statementDescription;
										item.tranDate = date;
										item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
										item.formatedAmount = formatCurrency(item.amount);
										item.formatedBalance = formatCurrency(item.balance);
							
										return item;
									});
			this.transactionHistory.push(...formattedTrans);

			this.accountDetails = {
				"Account number": this.savePlanDetails.accountNumber,
				"Balance": formatCurrency(this.savePlanDetails.currentBalance),
				"Available balance": formatCurrency(this.savePlanDetails.availableBalance),
				"Interest": `${this.savePlanDetails.interestRate}%`,
				"Status": this.savePlanDetails.accountStatus
			};
			this.endCallContext = `TransactionHistory`;
			this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
		}
	}

	async _statementsAccConfirmed(event) {
		// const need = `statements-${event.detail.account}`;

		// await super._inicidentManager_(need, () => this._toggleBusyFlag());
	}
	
	_getFlexibleSavePlan(accNumber) {
		// TO DO: "flexibleAccountDetails" details to be pulled and formated from services
		this.flexibleAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	_getFixedTermSavePlan(accNumber) {
		// TO DO: "fixedTermAccountDetails" details to be pulled and formated from services
		this.fixedTermAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _findBranch() {
		const branchLocatorUrl = await this.configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}

	_setIncidentDone() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _unloadTransactionHistory() {
		this.endCallContext = `LandingPage`;
		this.transactionHistory = [];
		
		await super.classifyIncident(() => this._toggleBusyFlag());

		this._setIncidentDone();
	}

	async _setTranHistoryDone() {
		await super.classifyIncident(() => this._toggleBusyFlag());
		
		this._setIncidentDone();
	}

	async _unlockFtsp(accountNumber) {
		await this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_FTSP_UNLOCK, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_UNLOCK_FTSP
		});

		// Try again functionality from failure screen to open unlock FTSP screen with previous account selection.
		const screenDetails = this.horizonStore.getScreenDetails();
		if (screenDetails?.unlockAccountNumber) {
			this.selectedUnlockAccNumber = screenDetails.unlockAccountNumber;
		} else {
			this.selectedUnlockAccNumber = accountNumber;
		}
		this.horizonStore.setScreenDetails({ unlockAccountNumber: this.selectedUnlockAccNumber });

		// Get list of fixed term savings plan accounts as "from accounts" for unlocking or transfering funds.
		this.unlockFromAccountsList = this._getUnlockFromAccounts();
		
		// Get primary savings account as "to account" for unclocking or transfering FTSP funds.
		this.unlockToAccountsList = await this._getUnlockToAccount();
		
		this.unlockOptions = await this._getUnlockOptions(this.unlockFromAccountsList);

		this.renderMode = RENDER_MODE.UNLOCK_FTSP;
	}

	_getUnlockFromAccounts() {
		const fromAccounts = this.savingsPlanDetails
								.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN)
								.map(item => {
										const productInfo = ACCOUNT_INTCAT_ENUM[item.accountType][item.interestCategory] || 
															ACCOUNT_INTCAT_ENUM[item.accountType];
										
										return {
											'accountNumber': item.accountNumber,
											'accountName': formatStringAsPascalCase(item.planName),
											'availableBalance': formatCurrency(item.currentBalance),
											'accountType': item.accountType,
											'icon': productInfo.icon,
											'order': productInfo.order
										};
									})
								.sort((x, y) => x.order - y.order);
		return fromAccounts;
	}

	async _getUnlockOptions() {
	
		const unlockOptionsAccountList = this.unlockFromAccountsList.map(account => ({
											'accountNumber': account.accountNumber 
											}));

		const request = {
			cifNumber: this.callerInformation.cifNumber,
			unlockOptionsAccountListModel: unlockOptionsAccountList
		};

		const returnValue = await this.savingsService.ftspUnlockOptions(request);

		if (returnValue.succeeded) {
			this._telemetry.startSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP, {
				"screen": TelemetryScreen.SAVINGS_PLAN_UNLOCK_FTSP
			});

			const unlockOptionsInCents = returnValue.result.unlockOptions;
			
			const unlockOptionsInRands = unlockOptionsInCents.map(item => {
				item.partialUnlockAmount /= 100; // Convert cents to rands
				return item;
			});

			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `unlock-ftsp`);

			return unlockOptionsInRands;
		}
		this.logger.log(`error`, `Failed to retrieve unlock options for FTSP from service.`, `_unlockFtsp`, returnValue.correlationId);

	}

    async _getUnlockToAccount() {
        const request = {
            cifNumber: this.callerInformation.cifNumber,
            status: `OPEN`
        };
        const returnValue = await this.savingsService.getClientProducts(request);

        if (returnValue.succeeded) {

            const [primarySavings] = returnValue.result.savingsProducts.filter(item => item.accountType === 300);
            const productInfo = ACCOUNT_INTCAT_ENUM[primarySavings.accountType];
            return [
                {
                    'accountNumber': primarySavings.accountNumber,
                    'accountName': formatStringAsPascalCase(primarySavings.accountName),
                    'accountType': primarySavings.accountType,
                    'availableBalance': formatCurrency(primarySavings.availableBalance),
                    'icon': productInfo.icon
                }
            ];
        }
        return [];
	}

	async _getUnlockQuote(unlockType, accNumber, partialUnlockAmount) {

		const request = {
				cifNumber: this.callerInformation.cifNumber,
				accountNumber: accNumber,
				partialUnlockAmount: Number(partialUnlockAmount * 100), // Convert rands to cents
				unlockType: UNLOCK_TYPE[unlockType],
				channel: `HORIZON`
			};

		const returnValue = await this.savingsService.ftspUnlockQuote(request);

		if (returnValue.succeeded && returnValue.result) {
			const quoteDetails = returnValue.result;

			// Convert cents to rands
			quoteDetails.unlockFee = Number(quoteDetails.unlockFee) / 100;
			return quoteDetails;
		} 

		this.logger.log(`error`, `Failed to retrieve unlock options quote for the selected FTSP from service.`, `_getUnlockQuote`, returnValue.correlationId);

	}

	async _getUnlockAgreement(event) {
		this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_ACCEPT_QUOTE);

		const request = {
			accountNumber: event.detail.selectedAccount.accountNumber,
			quoteReferenceNumber: event.detail.quoteRefNumber
		};

		const returnValue = await this.savingsService.ftspUnlockAgreement(request);
		
		if (returnValue.succeeded && returnValue.result) {
			this.encodedUnlockDocument = returnValue.result.agreementContent.data;
			this.unlockFromAccountName = event.detail.selectedAccount.accountName;
			return;
		} 
		
		this.logger.log(`error`, `Failed to view unlock quote agreement for the selected FTSP from service.`, `_getUnlockAgreement`, returnValue.correlationId);

	}

	_viewUnlockAgreement() {
		if (this.encodedUnlockDocument && this.unlockFromAccountName) {
			this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_VIEW_AGREEMENT);
			this.renderMode = RENDER_MODE.PDF;
		}
	}

	async _confirmUnlockFtsp(event) {
		this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_CONFIRM, {
			"screen": TelemetryScreen.SAVINGS_PLAN_CONFIRM_UNLOCK
		});

		const request = {
			"cifNumber": this.callerInformation.cifNumber,
			"accountNumber": event.detail.selectedFromAccount.accountNumber,
			"quoteReferenceNumber": event.detail.quoteRefNumber,
			"content":
			{
				"data": this.encodedUnlockDocument,
				"documentId": event.detail.quoteRefNumber,
				"contentType": `PDF`
			}
		};

		// Updating current need to be specific to unlock Type ie; Full or Partial unlock to classify an incident based on type.
		const need = UNLOCK_TYPE[event.detail.unlockType] === `Full` ? `full-ftsp-unlock` : `partial-ftsp-unlock`;
		await super._inicidentManager_(need, () => this._toggleBusyFlag());
			
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.unlockAccountName = event.detail.selectedFromAccount.accountName;
		screenDetails.unlockAccountNumber = event.detail.selectedFromAccount.accountNumber;
		screenDetails.unlockType = UNLOCK_TYPE[event.detail.unlockType];
		screenDetails.unlockAmount = event.detail.unlockAmount;

		this.horizonStore.setScreenDetails(screenDetails);

		const returnValue = await this.savingsService.ftspUnlock(request);

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToUnlockFTSPSuccess();
			return;
		}

		this.logger.log(`error`, `Failed to unlock the selected FTSP from service.`, `_confirmUnlockFtsp`, returnValue.correlationId);
		this.horizonRouter.navigateToUnlockFTSPFailure();
	}

	_chooseAccountTelemetry(event) {
		this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_CHOOSE_ACCOUNT, {
			"account-number": event.detail.accountNumber
		});
	}

	_chooseOptionsTelemetry(event) {
		this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_CHOOSE_OPTION, {
			"unlock-type": event.detail.unlockType
		});
	}

	_unlockAmountTelemetry(event) {
		this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_UNLOCK_AMOUNT, {
			"unlock-amount": event.detail.unlockAmount
		});
	}

	async _backFromUnlockFTSP() {
		await this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_CANCEL, {
			"screen": TelemetryScreen.SAVINGS_PLAN_UNLOCK_FTSP,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});

		this._telemetry.endSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP);
		this.horizonStore.clearScreenDetails();
		this._backToLandingPage();
	}

	async _selectTransferTelemetry() {
		await this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_SELECT_TRANSFER, {
			"screen": TelemetryScreen.SAVINGS_PLAN_UNLOCK_FTSP,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_CONFIRM_UNLOCK
		});

		this._telemetry.startSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER, {
			"screen": TelemetryScreen.SAVINGS_PLAN_CONFIRM_UNLOCK
		});
	}

	_cancelTransferTelemetry() {
		this._telemetry.endSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER);
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	 static get styles() {
		return [
			super.styles,
			css`
			.save-plan{
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			horizon-pdf-viewer {
				--theme-horizon-pdf-modal-header-width: auto;
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderLandingPage()}
			${this._renderSavingsPlanServiceError()}
			${this._renderFlexibleDetailsView()}
			${this._renderFixedTermDetailsView()}
			${this._renderStatements()}
			${this._renderTaxCertificate()}
			${this._renderTaxCertificateNotAvailable()}
			${this._renderTransactionHistory()}
			${this._renderUnlockFTSP()}
			${this._renderViewUnlockDocument()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE || 
				this.renderMode === RENDER_MODE.STATEMENTS ||
				this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				${this._renderSavingsPlanVerifiedLandingPage()}
				${this._renderSavingsPlanUnverifiedPage()}`
			: html``;
	}
	
	_renderSavingsPlanVerifiedLandingPage() {
		return this.verificationStatus === `verified` 
		? html`
			<capitec-pc-savings-plan
				.savingsPlanDetails="${this.savingsPlanDetails}"

				@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.planDetails)}"
				@view-info="${() => this._productEnquiry()}"
				@account-details="${(e) => this._accountDetails(e.detail.accountType, e.detail.accountNumber)}">
			</capitec-pc-savings-plan>`
		: html``;
	}

	_renderSavingsPlanUnverifiedPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-savings-plans-unverified-page
					class="save-plan"
					@verify-now= "${() => this._verifyClick()}"
					@product-enquiry="${() => this._productEnquiry()}">
				</horizon-savings-plans-unverified-page>`
			: html``;
	}

	_renderSavingsPlanServiceError() {
		return this.renderMode === RENDER_MODE.SERVICE_UNAVAILABLE
			? html`
				<horizon-savings-plans-service-error
					class="save-plan"
					@find-branch= "${() => this._findBranch()}">
				</horizon-savings-plans-service-error>`
			: html``;
	}

	_renderFlexibleDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FLEXIBLE
			? html`
				<capitec-flexible-savings-plan-details
					.flexibleAccountDetails="${this.flexibleAccountDetails}"

					@back="${() => this._setIncidentDone()}">
				</capitec-flexible-savings-plan-details>
			`
			: html``;
	}

	_renderFixedTermDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FIXED_TERM
			? html`
				<capitec-fixed-term-savings-plan-details
					.fixedTermAccountDetails="${this.fixedTermAccountDetails}"

					@back="${() => this._setIncidentDone()}">
				</capitec-fixed-term-savings-plan-details>`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.clientProducts="${this.clientProducts}"
					registeredEmailId="${this.callerInformation.emailId}"
					type="${ACCOUNT_TYPES.SAVINGS_PLAN}"
					@cancel="${() => this._backToLandingPage()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				<horizon-tax-certificate
					.taxCertificateDetails="${this.taxCertificateDetails}"
					cifNumber="${this.callerInformation.cifNumber}"
					accountNumber="${this.selectedAccountNumber}"
					type="${this.taxCertType}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-tax-certificate>
			`
			: html``;
	}

	_renderTaxCertificateNotAvailable() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE
		? html`
			<horizon-tax-certificate-landing
				@back="${() => this._backToLandingPage()}">
			</horizon-tax-certificate-landing>
			`
		: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY
			? html`
				<horizon-transaction-history
					.transactionHistory="${this.transactionHistory}"
					.accountDetails="${this.accountDetails}"
					type="${ACCOUNT_TYPES.SAVINGS_PLAN}"
					.renderTableColumns="${() => this._renderTransHistoryColumns()}"
					.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
					.getTransactionHistory="${(startDate, endDate, startAtIndex) => this._getTransactionHistory(startDate, endDate, startAtIndex)}"
					.disposeData="${() => this.transactionHistory = []}"

					@error-handler = "${() => this._errorHandler()}"
					@back="${() => this._setTranHistoryDone()}"
					@unloading="${() => this._unloadTransactionHistory()}">
				</horizon-transaction-history>`
			: html``;
	}

	_renderTransHistoryColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="transactionDate"
				.renderer="${(item, fieldName, value) => this._renderTransactionDateTime(value)}"
				size="156px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="410px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount (R)"
				field="formatedAmount"
				size="158px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Balance"
				field="formatedBalance"
				size="130px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderTransactionDateTime(value) {
		return html`
			<capitec-label
				label="${formatDateTime(value)}">
			</capitec-label>`;
	}

	_renderTransactionDetails(item) {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_INFO, {});

		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: ${item.description}"
				data-automation-id="transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${formatDate(item.postingDate, `dd mmm yyyy`)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${formatDate(item.processDate, `dd mmm yyyy`)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : `-`}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : `-`}"
					data-automation-id="transaction-history-item-card-auth-type">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : `-`}"
					data-automation-id="transaction-history-item-journal-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : `-`}"
					data-automation-id="transaction-history-item-terminalID">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Spend group"
					value = "${item.spendGroup ? item.spendGroup : `-`}"
					data-automation-id="transaction-history-item-spend-group">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : `-`}"
					data-automation-id="transaction-history-item-cashback">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : `-`}"
					data-automation-id="transaction-history-item-branch">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : `-`}"
					data-automation-id="transaction-history-item-teller">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderUnlockFTSP() {
		return this.renderMode === RENDER_MODE.UNLOCK_FTSP || this.renderMode === RENDER_MODE.PDF
		? html`
			<capitec-pc-unlock-ftsp
				selectedUnlockAccNumber="${this.selectedUnlockAccNumber}"
				.unlockOptions="${this.unlockOptions}"
				.unlockFromAccountsList="${this.unlockFromAccountsList}"
				.unlockToAccountsList="${this.unlockToAccountsList}"
				.savingsPlanDetails="${this.savingsPlanDetails}"

				verificationMethod="${this.callerInformation.verificationMethod}"
				?hasDigitalChannels="${this.callerInformation.hasDigitalChannels}"
				?isHelpDeskAgent="${this.roleManager.isHelpDeskAgent}"
				
				.getUnlockQuote="${(unlockType, accNumber, partialUnlockAmount) => this._getUnlockQuote(unlockType, accNumber, partialUnlockAmount)}"
				.shouldDisable="${need => this._shouldDisable(need)}"
				.renderAlertBanner="${() => this.renderAlertBanner()}"

				@back="${() => this._backFromUnlockFTSP()}"
				@get-agreement="${(event) => this._getUnlockAgreement(event)}"
				@view-agreement="${(event) => this._viewUnlockAgreement(event)}"
				@unlock="${(event) => this._confirmUnlockFtsp(event)}"
				@verify-now="${() => this._verifyClick()}"
				
				@choose-account-telemetry="${(event) => this._chooseAccountTelemetry(event)}"
				@choose-options-telemetry="${(event) => this._chooseOptionsTelemetry(event)}"
				@unlock-amount-telemetry="${(event) => this._unlockAmountTelemetry(event)}"
				@select-transfer-telemetry="${() => this._selectTransferTelemetry()}"
				@cancel-transfer-telemetry="${() => this._cancelTransferTelemetry()}">
			</capitec-pc-unlock-ftsp>`
		: html``;
	}

	_renderViewUnlockDocument() {
		return this.renderMode === RENDER_MODE.PDF
		? html`
			<horizon-pdf-viewer
				header="Agreement"
				encodedPDF="${this.encodedUnlockDocument}"
				@cancel="${() => this.renderMode = RENDER_MODE.UNLOCK_FTSP}">
			</horizon-pdf-viewer>`
		: html``;
	}
}

customElements.define(`horizon-savings-plan`, SavingsPlan);