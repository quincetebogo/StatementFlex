import { ACCOUNT_STATUS, CREDIT_ACCOUNT_TYPE, CREDIT_TYPE, PRODUCTS, PRODUCT_TYPE } from 'app/constants/Credit';
import { QuickTransactionEvents, SETTLEMENT_QUOTE_EVENTS, STATEMENT_EVENTS } from 'app/constants/telemetry/events/QuickTransactions';
import { css, html } from 'platform/elements';
import { formatStringAsPascalCase, isNullorEmpty, isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { creditMixin } from 'app/views/credit/CreditMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { searchOtherNeedMixin } from 'app/views/common/SearchOtherNeedMixin';
import { tapToPayMixin } from 'app/views/tapToPay/TapToPayMixin';

import 'app/components/dialogs/common/CCSstatus';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';
import 'app/components/dialogs/quickTransactions/DeclineDebiCheckMandate';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/TapToPayLanding';
import 'app/components/dialogs/common/Feedback';
import 'app/components/quickTransactions/SettlementQuote';

import 'app/dialogs/credit/PaidUpAccounts';
import 'app/dialogs/credit/PaidUpLetter';
import 'app/dialogs/taxCertificates/TaxCertificates';


const SAVINGS_ACCOUNT_TYPE = 300;

const ERROR_LIST = {
	SYSTEM_ERROR: `System error. Please try again`
};

/**
 * The Quick Transactions Favourites Landing Page View
 *
 * @export
 * @class Favourites
 * @extends {SavingsAccountBase}
 */
export class Favourites extends SavingsAccountBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.agreementResult = ``;
		// private properites
		this.verificationToastDisplayed = this.callerInformation.verificationToastDisplayed;

		this.isLoading = true;

		// private variables
		this.alertBannerMessage = ``;
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.landingPageInfo = {};
		this.curOptionEvent = null;
		this.cards = [];
		this.accountsInfo = [];
		this.selectedFeedback = [];
		this.feedbackOptions = [];
		this.updateStrackClick = false;
		// TODO: get ccs status for client
		this.ccsStatus = false;
		this.showCCSmodal = false;
		this.settlementQuoteEvents = SETTLEMENT_QUOTE_EVENTS;

		this._telemetry = HorizonTelemetry.instance;

		this.returnToSub = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._performAction(e.option));

		Object.assign(Favourites.prototype, tapToPayMixin);
		Object.assign(Favourites.prototype, searchOtherNeedMixin);
		Object.assign(Favourites.prototype, creditMixin);
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isLoading: { state: true },
			verificationToastDisplayed: { state: true },
			showCCSmodal: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.incidentRecId = this.incidentDetails.incidentRecId;
		this.feedbackOptions = FEEDBACK_OPTIONS;
		

		this._telemetry.startSpan(QuickTransactionEvents.FULFILL_NEED, {
			"screen": TelemetryScreen.FAVOURITES
		});

		this._initialise();
		this._performAction = async (option) => {

			const stopCard = () => this._stopCard();
			const debiCheck = () => this._debiCheck();
			const updateCardLimits = () => this._updateCardLimits();
			const tapToPay = () => this._tapToPay();
			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const proofOfAccount = () => this._proofOfAccount();
			const searchOtherNeed = () => this._searchOtherNeed();
			const settlementQuote = () => this._settlementQuote();
			const paidUpAccounts = () => this._paidUpAccounts();
			
			const actions = {
				'stop-card': stopCard,
				'debi-check-viewInfo': debiCheck,
				'update-card-limits': updateCardLimits,
				'tap-to-pay': tapToPay,
				'statements': statements,
				'tax-certificate': taxCertificates,
				'proof-of-account': proofOfAccount,
				'search-other-need': searchOtherNeed,
				'settlement-quote': settlementQuote,
				'paid-up-accounts': paidUpAccounts
			};

			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
		};
	}

	disconnectedCallback() {
		this.returnToSub.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleChannelServiceError() {
		this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
	}

	async _done(event) {
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const selectedOption = FEEDBACK_OPTIONS.find(item => item.key === event.detail);

		this._telemetry.logEvent(QuickTransactionEvents.SEARCH_OTHER_NEED_DONE, {
			"launch-strack-feedback": selectedOption
		});

		const options = {
			clientNeed: null,
			endCallReason: selectedOption
		};

		const isSuccess = await super.closeIncident(options, () => this._toggleBusyFlag());
		
		if (isSuccess) {
			// Navigate to favourites landing page
			const incidentDetails = this.horizonStore.getIncidentDetails();
		
			incidentDetails.needStatus = super.HORIZON_NEED_STATUS.CLOSED;
			incidentDetails.feedback = selectedOption.key;
			this.horizonStore.setIncidentDetails(incidentDetails);
			this._updateNeedToState();
			this._searchOtherNeedDone();
		} else {
			this.alertBannerMessage = ERROR_LIST.SYSTEM_ERROR;
		}
	}

	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		
		if (this.callerInformation.verificationStatus === `verified`) {
			await this._initialise();
		}
	}

	async _onFavouritesOptionClick(e) {
		// Getting hold of event to perform continue action if client decides to do verification
		this.curOptionEvent = e;

		if (e.detail.stopPropagation) {
			this._unavailableOption();
		} else {
			await this._performAction(e.detail.option);
		}
	}

	_debiCheckToMainPage() {

		/**
		 * This is supposed to happen in debicheck success screen
		 * TODO: This should be to success screen when decline or approve is ready
		 */
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_searchOtherNeedDone() {
		this._refreshIncidentDetails();
	
		if (this.updateStrackClick) {
			this.postAction._refreshScreen();
			this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
			this.updateStrackClick = false;
			return true;
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _getPermanentLimits(request) {
		const returnValue = await this.quickTransactionService.getPermanentLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to retrieve permanent card limits`, `_getPermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();
		return null;
	}

	async _updatePermanentLimits(updateRequest) {
	
		updateRequest.cardLimits = this._limitsRandsToCents(updateRequest.cardLimits);

		const returnValue = await this.quickTransactionService.updatePermanentLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update permanent card limits`, `_updatePermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _getTemporaryLimits(request) {
		const returnValue = await this.quickTransactionService.getTemporaryLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to get temporary card limits`, `_getTemporaryLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _updateTemporaryLimits(updateRequest) {
		
		updateRequest.cardLimits = this._limitsRandsToCents(updateRequest.cardLimits);

		const returnValue = await this.quickTransactionService.updateTemporaryLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update temporary card limits`, `_updateTemporaryLimits`, returnValue.correlationId);

		return null;
	}

	async _getCardLimitsAgreement(agreementRequest) {

		agreementRequest.cardDetails = this._limitsRandsToCents(agreementRequest.cardDetails);

		const returnValue = await this.quickTransactionService.getCardLimitsAgreement(agreementRequest, () => this._createIncidentOnError());
		
		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to get card limits agreement`, `_getCardLimitsAgreement`, returnValue.correlationId);

		return null;
	}

	_updateLimitsResult(eventData) {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.limitDetails = eventData.detail.limitDetails;
		this.horizonStore.setScreenDetails(screenDetails);
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `update-card-limits`);

		if (eventData.detail.success) {
			this.horizonRouter.navigateToCardLimitUpdateSuccess();
		} else {
			this.logger.log(`error`, eventData.detail.failureReason);
			this.horizonRouter.navigateToCardLimitUpdateFailed();
		}
	}

	async _getSubCategories(event) {
		this._updateNeedToState(`category`, event.detail.category);
		await this.getSubCategories(event);
	}

	async _getIssues(event) {
		this._updateNeedToState(`subCategory`, event.detail.need);
		await this.getIssues(event);
	}

	async _getSubCategories(event) {
		
		if (this.incidentDetails.incidentRecId === `0`) {
			await super.createAndClassifySubsIncident();
		}
		
		this._updateNeedToState(event.detail.category);
		
		await this.getSubCategories(event);
	}

	async _getIssues(event) {
		
		this._updateNeedToState(event.detail.category, event.detail.need);
		
		await this.getIssues(event);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		if (this.callerInformation.verificationStatus !== `non-client`) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				isCallerVerified: this.callerInformation.verificationStatus === `verified`
			};

			const returnValues = await Promise.allSettled([this.quickTransactionService.favouritesLanding(landingRequest), this.creditService.creditBalance(this.callerInformation.cifNumber, () => true)]);

			if (returnValues[0].status === `fulfilled` && returnValues[0].value.succeeded) {
				this.isLoading = false;

				this.landingPageInfo = returnValues[0].value.result;
				
				/* 
				 * NOTE: This is a work around as the favourites landing does not return credit information. 
				 * NOTE: This implementation will not include credit information in the favourites landing call fails.
				 * TODO: Develop better solution
				 */
				if (returnValues[1].status === `fulfilled` && returnValues[1].value.succeeded && returnValues[1].value.result.availableBalance !== null) {
					if (this.callerInformation.verificationStatus === `verified`) {
						this.landingPageInfo.creditProductDescription = `Available balance`;
						this.landingPageInfo.creditProductAmount = formatCurrency(returnValues[1].value.result.availableBalance);
					} else {
						this.landingPageInfo.creditProductDescription = `Active`;
						this.landingPageInfo.creditProductAmount = ``;
					}
				}
			}
		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = {
				savingsAccountProductDescription: ``,
				savingsPlanProductDescription: ``,
				liveBetterProductDescription: ``,
				insureProductDescription: ``,
				creditProductDescription: ``,
				savingsAccountProductAmount: ``,
				savingsPlanProductAmount: ``,
				liveBetterProductAmount: ``,
				insureProductAmount: ``,
				creditProductAmount: ``,
				pendingMandateCount: 0,
				accountNumber: ``,
				accountOpenedDate: ``
			};
		}

		this.verificationStatus = this.callerInformation.verificationStatus;
		// Now we can update the information on the product buttons
		this._updateLeftBar();
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);

		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	_shouldToastDisplay() {
		if (this.verificationToastDisplayed) {
			return false;
		}

		this.callerInformation.verificationToastDisplayed = true;
		this.horizonStore.setCallerInformation(this.callerInformation);

		this.verificationToastDisplayed = true;
		return true;
	}

	async _stopCard() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_STOP_CARD, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.STOP_CARD
		});

		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.incomingCallDetails, this.incidentDetails);

		if (returnValue.succeeded) {

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;
			this.horizonStore.setScreenDetails(screenDetails);

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);

			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _updateCardLimits() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_UPDATE_CARD_LIMITS, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.CARD_LIMITS_LANDING
		});

		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber, this.incidentDetails.incidentRecId);
			
		if (returnValue.succeeded) {
			this.cards = returnValue.result.cards;
			
			// Convert all vaules on card limits into Rands
			this.cards.forEach(card => {
				Object.keys(card.cardLimits).forEach(key => {
					if (!(isNullorEmpty(card.cardLimits[key]) || key === `tempLimitExpiryDate`)) {
						card.cardLimits[key] /= 100;
					}
				});

				if (card.linkedCardLimits) {
					Object.keys(card.linkedCardLimits).forEach(key => {
						if (!(isNullorEmpty(card.linkedCardLimits[key]) || key === `tempLimitExpiryDate`)) {
							card.linkedCardLimits[key] /= 100;
						}
					});
				}
			});

			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
	}

	_taxCertificates() {
		// TODO: Functionality to generate tax certificate comes here
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_TAX_CERTIFICATE, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});

		this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
	}

	async _getStatements() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_STATEMENTS, {
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		await super._getStatements();
	}

	async _proofOfAccount() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_PROOF_OF_ACCOUNT, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT
		});
		
		// Temporary fix to get the account number using statements CS call as the account number field 
		// for Favourites landing page(landingPageInfo) is returned as null which is required on Proof of Account screen.
		// TODO : The function _getClientProducts() and filtering should be removed once the Account Number on landingPageInfo is received Properly.
		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			const primarySavingsProduct = clientProductDetails.find(item => item.accountType === SAVINGS_ACCOUNT_TYPE);

			this.landingPageInfo.accountNumber = primarySavingsProduct.accountNumber;
			this.landingPageInfo.accountOpenedDate = primarySavingsProduct.accountOpenDate;
			this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
		}
	}

	async _settlementQuote(customErrHandler = null) {
		// TODO: Implement permission check
		await this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_SELECT, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_VIEW
		});

		const returnValue = await this.creditService.settlementQuoteLanding({ "cifNumber": this.callerInformation.cifNumber }, customErrHandler);

		if (returnValue.succeeded) {
			this.settlementQuoteDetails = returnValue.result.settlementInfoList;

			this.settlementQuoteDetails = this.settlementQuoteDetails.map(item => {
				item.type = PRODUCT_TYPE[item.productTypeCode];
				item.category = CREDIT_ACCOUNT_TYPE[item.productTypeCode];
				item.productTypeDescription = `${item.productTypeDescription.toLowerCase().charAt(0).toUpperCase()}${item.productTypeDescription.toLowerCase().slice(1)}`;
				item.creditLimit = formatCurrency(item.creditLimit);
				item.repayAmount = item.repayAmount ? formatCurrency(item.repayAmount) : null;
				item.nextRepayment = item.nextRepayment ? formatCurrency(item.nextRepayment) : null;
				item.currentBalance = formatCurrency(item.currentBalance);
				item.settlementAmount = formatCurrency(item.currentSettlementAmount);

				return item;
			});

			if (this.settlementQuoteDetails.length > 0) {
				this.ccsStatus = await this._checkCreditPermisions(`settlement-quote`, this.callerInformation.cifNumber, this.settlementQuoteDetails[0].accountNumber, this.settlementQuoteDetails[0].type);
			
				if (this.ccsStatus) {
					this.showCCSmodal = true;
					this.requestUpdate();
					return;
				}
			}

			this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_VIEW;
		}

		this.logger.log(`error`, `Unable to load settlement quote accounts view`, `_settlementQuote`, returnValue.correlationId);
	}
	
	_showSettlementQuoteDialog(selectedAccounts) {
		this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_SEND, {
			"list-of-accounts": selectedAccounts,
			"account-numbers": selectedAccounts.map(account => account.accountNumber)
		});

		this._settlementQuoteDialog(selectedAccounts);
	}

	async _paidUpAccounts() {
		// TODO: CS call to get info
		if (this.ccsStatus) {
			this.showCCSmodal = true;
			return;
		}

		const returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber, ACCOUNT_STATUS.PAID_UP);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve client overview from credit service.`, `_initialise`, returnValue.correlationId);
			this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
			return;
		}
		
		if (returnValue.succeeded && returnValue.result) {

			// this.accountsInfo = [`Term loan (32 Months)`, `Credit`, `Access Facility`];
			this.creditAccountDetails = returnValue.result;
			this._formatCreditOverviewResponse();
			this.accountsInfo = [...this.creditAccountDetails.creditCardSummaryList, ...this.creditAccountDetails.accessFacilitySummaryList, ...this.creditAccountDetails.loanAccountSummaryList];

			if (this.accountsInfo.length === 0) {
				this.horizonRouter.navigateToProductInfo(`Credit`);
				return;
			}

			this.renderMode = RENDER_MODE.PAID_UP_ACCOUNTS;
		}
	}

	_formatCreditOverviewResponse() {
		// TODO: Improve the formatting
		this.creditAccountDetails.creditCardSummaryList.map(item => {
			item.type = PRODUCTS.CREDIT_CARD;
			item.category = CREDIT_TYPE.FLEXIBLE;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.creditAccountDetails.accessFacilitySummaryList.map(item => {
			item.type = PRODUCTS.ACCESS_FACILITY;
			item.category = CREDIT_TYPE.FLEXIBLE;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.creditAccountDetails.loanAccountSummaryList.map(item => {
			item.type = PRODUCTS.TERM_LOAN;
			item.category = CREDIT_TYPE.FIXED;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.repayAmount = formatCurrency(item.repayAmount);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.budgetAccountsSummary = {
			"totalBudgetBalance": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetBalance),
			"totalBudgetInstallmentAmount": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetInstallmentAmount)
		};
	}

	_unavailableOption() {
		this.renderMode = RENDER_MODE.ALERT_MODAL;
	}

	async _searchOtherNeed() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_SEARCH_OTHER_NEED, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.SEARCH_OTHER_NEED
		});

		await super.createAndClassifySubsIncident();

		this.endCallContext = `SearchOtherNeed`;
		this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
		await this.getCategories();
	}

	_loadingOtherNeeds() {
		this._telemetryStartSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED);
	}

	async _unLoadingOtherNeeds() {
		this._telemetryEndSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED);

		const incidentDetails = this.horizonStore.getIncidentDetails() || {};

		if (isNullorEmpty(incidentDetails.incidentRecId) || incidentDetails.incidentRecId === `0`) {
			this.renderMode = RENDER_MODE.MAIN_PAGE;
			return true;
		}

		const screenDetails = this.horizonStore.getScreenDetails();
		const incidentInfo = await this.incidentStatus(this.incidentDetails.incidentRecId) || {};

		// Determining if its already classified
		const isClassified = !isNullorEmpty(incidentInfo.category) && !isNullorEmpty(incidentInfo.subCategory) && !isNullorEmpty(incidentInfo.issue);
		const isClosed = incidentInfo.status === `Closed`;
		
		// Determining at least we know categorization to classify
		const classificationEmpty = isNullorEmpty(screenDetails.category) && isNullorEmpty(screenDetails.subCategory) && isNullorEmpty(screenDetails.issue);

		if (isClassified && !isClosed && !classificationEmpty) {
			this.renderMode = RENDER_MODE.UPDATE_INCIDENT_FEEDBACK;
			return true;
		}

		if (!isClassified && !isClosed && !classificationEmpty) {
			this.renderMode = RENDER_MODE.UPDATE_INCIDENT;
			return true;
		}

		this.endCallContext = `LandingPage`;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _onUpdateStrackClick(event) {

		this.updateStrackClick = true;
		await this._classifyIncident(event);
		
		this.postAction = event.detail.postAction;
		this.renderMode = RENDER_MODE.FEEDBACK;

	}

	async _onLaunchStrackClick(event) {
		this._telemetry.logEvent(QuickTransactionEvents.SEARCH_OTHER_NEED_LAUNCH_STRACK, {
			"screen": TelemetryScreen.SEARCH_OTHER_NEED,
			"next-screen": TelemetryScreen.FAVOURITES,
			"client-need": event.detail.category,
			"specific-need": event.detail.need,
			"issue-type": event.detail.issue
		});
		await this._classifyIncident(event);
	
		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
		this.renderMode = RENDER_MODE.FEEDBACK;
	}

	async _onUpdateincidentConfirm(e) {
		// should close the incident with captured details on Update incident modal
		// Temporary switch : to close an incident on Confirm click from Update Incident modal
	
		await this._classifyIncident(e);
		
		this.renderMode = RENDER_MODE.UPDATE_INCIDENT_FEEDBACK;
	}

	async _classifyIncident(event) {
		
		const incidentCategorization = {
			category: `${event.detail.category}`,
			need: `${event.detail.need}`,
			issue: `${event.detail.issue}`
		};

		await super.classifyIncident(() => this._toggleBusyFlag(), incidentCategorization);
	}

	async _createIncidentOnError() {
		await super.createAndClassifySubsIncident();
		return true;
	}

	_updateNeedToState(category, need, issue) {
		// Updating state with the latest values
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.category = category;
		screenDetails.subCategory = need;
		screenDetails.issue = issue;

		this.horizonStore.setScreenDetails(screenDetails);
	}

	async _exitSearchOtherNeed(e) {
		const screenDetails = this.horizonStore.getScreenDetails();

		if (!isNullorEmpty(screenDetails.category) && !isNullorEmpty(screenDetails.subCategory) && !isNullorEmpty(screenDetails.issue)) {
			await this._classifyIncident(e);
		}

		this._backToLandingPage();
	}

	_limitsRandsToCents(cardDetails) {
 
		// Converting limits from rands to cents before updating
		if (cardDetails.permanentCashAmountLimit) {
			cardDetails.permanentCashAmountLimit *= 100;
		}
		if (cardDetails.permanentPurchaseAmountLimit) {
			cardDetails.permanentPurchaseAmountLimit *= 100;
		}
		if (cardDetails.permanentCnpAmountLimit) {
			cardDetails.permanentCnpAmountLimit *= 100;
		}
		if (cardDetails.tempCashAmountLimit) {
			cardDetails.tempCashAmountLimit *= 100;
		}
		if (cardDetails.tempPurchaseAmountLimit) {
			cardDetails.tempPurchaseAmountLimit *= 100;
		}
		if (cardDetails.tempCnpAmountLimit) {
			cardDetails.tempCnpAmountLimit *= 100;
		}
		
		return cardDetails;
	}

	_cancelStatements() {
		this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS);
		super._backToLandingPage();
	}

	async _exitSettlementQuoteDialog() {
		await this._telemetry.endSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG, {});

		this.horizonStore.clearScreenDetails();
		this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_VIEW;
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
				.favourites{
					width: 100%;
					height: 100%;
				}

				capitec-content-box {
					width: 100%;
					height: var(--horizon-panel-height, 888px);
				}
			`
		];
	}

	_webTemplate() {
		return html`
			${this._renderFavouritesLandingPage()}
			${this._renderUpdateCardLimits()}

			${this._renderAlertModal()}
			${this._renderTapToPay()}
			${this._renderSearchOtherNeed()}
			${this._renderProofOfAccount()}
			${this._renderFeedback()}
			${this._renderUpdateIncidentModal()}
			${this._renderTaxCertificate()}
			${this._renderPaidUpAccounts()}
			${this._renderSettlementQuote()}
			${this._renderSettlementQuoteDialog()}
			${this._renderCcsModal()}

			${super._webTemplate()}
		`;
	}

	renderAlertBanner() {
		const unverified = () => this._renderUnverifiedAlertBanner();
		const failed = () => this._renderFailedAlertBanner();
		const verified = () => this._renderVerifiedAlertBanner();

		const verificationStatuses = {
			'unverified': unverified,
			'failed': failed,
			'verified': verified
		};

		if (verificationStatuses[this.verificationStatus]) {
			return verificationStatuses[this.verificationStatus]();
		}
	}

	_renderUnverifiedAlertBanner() {
		return html`
			<capitec-alert-banner
				class="verificatoin-status"
				data-automation-id="favourite-transactions-unverified-alert-banner"
				type="warning">
				<capitec-group layout="horizontal" class="alert-banner-group">
					<capitec-label type="strong" label="Notify client:"></capitec-label>
					<capitec-label type="default"
						label="For added security we will need to go through verification to proceed with additional transactions.">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink 
						data-automation-id="favourite-transactions-verify"
						label="Verify Now"
						@click="${() => super._verifyClick()}">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>`;
	}

	_renderFailedAlertBanner() {
		return html`
			<capitec-alert-banner
				class="verificatoin-status"
				data-automation-id="favourite-transactions-failed-verification-alert-banner"
				type="unsuccessful-red"
				label="Notify client: I'm not able to access your account since you couldn't be verified. Can we guide you on the App? Alternatively please visit your nearest branch.">
			</capitec-alert-banner>`;
	}

	_renderVerifiedAlertBanner() {
		return !this.callerInformation.hasDigitalChannels
			? this._renderNoDigitalHighRiskTransAlertBanner()
			: this._renderHighRiskTransAlertBanner();
	}

	_renderNoDigitalHighRiskTransAlertBanner() {
		return this.callerInformation.verificationMethod === `SQ`
			? html`
				<capitec-alert-banner
					class="verificatoin-status"
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security get the remote banking App to perform additional transactions, alternatively, visit your nearest branch.">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
						</capitec-group>
				</capitec-alert-banner>`
			: html``;
	}

	_renderHighRiskTransAlertBanner() {
		return this.callerInformation.verificationMethod === `SQ`
			? html`
				<capitec-alert-banner
					class="verificatoin-status"
					data-automation-id="favourite-transactions-high-risk-trans-alert-banner"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security, we will be sending a push notification to access additional transactions.">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-hyperlink
								data-automation-id="high-risk-transactions-verify"
								label="Verify Now"
								@click="${() => super._verifyClick()}">
							</capitec-hyperlink>
						</capitec-group>
				</capitec-alert-banner>`
			: html``;
	}

	_renderFavouritesLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.TAX_CERTIFICATE:
			case RENDER_MODE.PROOF_OF_ACCOUNT:
			case RENDER_MODE.STATEMENTS:
			case RENDER_MODE.VERIFY_NOW:
			case RENDER_MODE.END_CALL:
			case RENDER_MODE.ALERT_MODAL:
			case RENDER_MODE.UPDATE_INCIDENT:
			case RENDER_MODE.UPDATE_INCIDENT_FEEDBACK:
				return html`
					<horizon-favourite-transactions 
						class="favourites"
						.landingPageInfo="${this.landingPageInfo}"
						.verificationStatus="${this.callerInformation.verificationStatus}"
						?displayVerificationStatusToast="${this._shouldToastDisplay()}"
						.shouldDisable="${need => this._shouldDisable(need)}"
						.renderAlertBanner="${() => this.renderAlertBanner()}"
						@option-click="${(e) => this._onFavouritesOptionClick(e)}">
					</horizon-favourite-transactions>`;
			default:
				return html``;
		}
	}

	_renderAlertModal() {
		if (this.renderMode === RENDER_MODE.ALERT_MODAL) {
			return html`
				<horizon-client-not-verified
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@verify-now="${() => super._verifyClick()}">
				</horizon-client-not-verified>
			`;
		}
	}

	_renderUpdateCardLimits() {
		return this.renderMode === RENDER_MODE.UPDATE_CARD_LIMITS
			? html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					voiceRecordingReference=${this.incomingCallDetails.voiceReferenceNumber}
					verificationMethod="${this.callerInformation.verificationMethod}"
					?hasDigitalChannels="${this.callerInformation.hasDigitalChannels}"
					?showVerifyCallerDialog="${this.showVerifyCallerDialog}"
					.getCardLimitsAgreement ="${renderRequest => this._getCardLimitsAgreement(renderRequest)}"
					.getPermanentLimits="${request => this._getPermanentLimits(request)}"
					.getTemporaryLimits="${request => this._getTemporaryLimits(request)}"
					.updatePermanentLimits ="${renderRequest => this._updatePermanentLimits(renderRequest)}"
					.updateTemporaryLimits ="${renderRequest => this._updateTemporaryLimits(renderRequest)}"
					.renderAlertBanner="${() => this.renderAlertBanner()}"
					@verify-now="${() => super._verifyClick()}"
					@back="${() => this._backToLandingPage()}"
					@result=${eventData => this._updateLimitsResult(eventData)}>
				</horizon-card-limits-landing>`
			: html``;
	}

	_renderProofOfAccount() {
		return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
			? html`
				<horizon-proof-of-account
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.landingPageInfo="${this.landingPageInfo}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-proof-of-account>`
			: html``;
	}

	_renderSearchOtherNeed() {
		return this.renderMode === RENDER_MODE.SEARCH_OTHER_NEED || this.renderMode === RENDER_MODE.FEEDBACK
			? html`
				<horizon-search-other-need
					.categories="${this.categories || []}"
					.needs="${this.needs || []}"
					.issues="${this.issues || []}"
					@loading="${() => this._telemetryStartSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED)}"
					@unloading="${() => this._unLoadingOtherNeeds()}"
					@launch-strack="${(event) => this._onLaunchStrackClick(event)}"
					@update-strack="${(event) => this._onUpdateStrackClick(event)}"
					@get-sub-categories="${(event) => this._getSubCategories(event)}"
					@get-issues="${(event) => this._getIssues(event)}"
					@issue-changed="${(event) => this._updateNeedToState(event.detail.category, event.detail.need, event.detail.issue)}"
					@back="${(e) => this._exitSearchOtherNeed(e)}"
					@done="${() => this._searchOtherNeedDone()}">
				</horizon-search-other-need>`
			: html``;
	}

	_renderFeedback() {
		return this.renderMode === RENDER_MODE.FEEDBACK || this.renderMode === RENDER_MODE.UPDATE_INCIDENT_FEEDBACK
			? html`
				<horizon-feedback 
					@done="${(event) => this._done(event)}">
				</horizon-feedback>`
			: html``;
	}

	_renderUpdateIncidentModal() {
		return this.renderMode === RENDER_MODE.UPDATE_INCIDENT
		? html`
			<horizon-update-incident-dialog
				@on-cancel = "${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
				@on-update="${(e) => this._onUpdateincidentConfirm(e)}">
			</horizon-update-incident-dialog>`
		: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
		? html`
			<horizon-tax-certificate
				.cifNumber="${this.callerInformation.cifNumber}"
				accountNumber="${this.landingPageInfo.accountNumber}"
				@cancel="${() => this._backToLandingPage()}">
			</horizon-tax-certificate>
		`
		: html``;
	}
	
	_renderSettlementQuote() {
		return this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_VIEW ||
				this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_DIALOG 
		? html`
			<horizon-settlement-quote
				.settlementQuoteDetails="${this.settlementQuoteDetails}"
				@back="${() => this._backToLandingPage()}"
				@send-quote="${(e) => this._showSettlementQuoteDialog(e.detail.selectedAccounts)}">
			</horizon-settlement-quote>`
		: html``;
	}

	_renderPaidUpAccounts () {
		return this.renderMode === RENDER_MODE.PAID_UP_ACCOUNTS
		? html`
		<horizon-paid-up-accounts
			.accountsInfo="${this.accountsInfo}"
			@back="${() => this._backToLandingPage()}">
		</horizon-paid-up-accounts>`
		: html``;
	}
}

customElements.define(`horizon-favourites`, Favourites);