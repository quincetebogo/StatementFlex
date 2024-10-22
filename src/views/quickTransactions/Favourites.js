import { ACCOUNT_STATUS, CREDIT_ACCOUNT_TYPE, CREDIT_TYPE, PRODUCTS, PRODUCT_TYPE } from 'app/constants/Credit';
import { QuickTransactionEvents, SETTLEMENT_QUOTE_EVENTS, STATEMENT_EVENTS } from 'app/constants/telemetry/events/QuickTransactions';
import { css, html } from 'platform/elements';
import { formatStringAsPascalCase, isNullorEmpty, isWellFormedSouthAfricanID } from 'app/utils/channelServiceUtilities';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { DateTime } from 'luxon';
import { FEEDBACK_OPTIONS } from 'app/constants/SearchOtherNeed';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { NavigationContext } from 'platform/core';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { alertBannerMixin } from 'app/views/common/AlertBannerMixin';
import { creditMixin } from 'app/views/credit/CreditMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { searchOtherNeedMixin } from 'app/views/common/SearchOtherNeedMixin';
import { tapToPayMixin } from 'app/views/tapToPay/TapToPayMixin';

import 'app/components/dialogs/common/WarningDialog';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/quickTransactions/TapToPayAgreement';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SendCashLanding';
import 'app/components/quickTransactions/PayShapLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/TapToPayLanding';
import 'app/components/dialogs/common/Feedback';
import 'app/components/dialogs/quickTransactions/PayshapUpdate';
import 'app/components/quickTransactions/SettlementQuote';
import 'app/components/quickTransactions/TaxCertificateLanding';
import 'app/components/quickTransactions/UpdateCardSettings';

import 'app/dialogs/credit/PaidUpAccounts';
import 'app/dialogs/credit/PaidUpLetter';
import 'app/dialogs/taxCertificates/TaxCertificates';
const SAVINGS_ACCOUNT_TYPE = 300;

const today = new Date();

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
		this.sendCashVouchers = [];
		this.updateStrackClick = false;
		this.hasTaxCertificate = false;
		this.taxCertificateDetails = null;
		this.ccsStatus = false;
		this.showCCSmodal = false;
		this.settlementQuoteEvents = SETTLEMENT_QUOTE_EVENTS;
		this.payShapDetails = {};

		this.navigationContext = NavigationContext.getInstance();

		this._telemetry = HorizonTelemetry.instance;

		this.returnToSub = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._performAction(e.option));
		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);

		Object.assign(Favourites.prototype, tapToPayMixin);
		Object.assign(Favourites.prototype, searchOtherNeedMixin);
		Object.assign(Favourites.prototype, creditMixin);
		Object.assign(Favourites.prototype, alertBannerMixin);
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isLoading: { state: true },
			verificationToastDisplayed: { state: true },
			hasTaxCertificate: { state: false },
			showCCSmodal: { type: Boolean },
			ccsStatus: { state: false },
			displayToast: { state: false },
			payShapDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.verificationToastDisplayed = this.callerInformation.verificationToastDisplayed;
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
			const sendCash = () => this._sendCash();
			const payShap = () => this._payShap();
			const cardSettings = () => this._updateCardSettings();
			
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
				'paid-up-accounts': paidUpAccounts,
				'send-cash': sendCash,
				'payshap': payShap,
				'card-settings': cardSettings
			};

			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
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
		this.stateChangeSub.unsubscribe();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_showConfirmPlaceHoldModal(event) {
		this.voucherNumber = event.detail;
		this.renderMode = RENDER_MODE.PLACE_HOLD_MODAL;
	}

	async _onConfirmPlaceHold(event) {
		const sendCashVoucherHoldRequest = {
			cifNumber: this.callerInformation.cifNumber,
			voucherNumber: this.voucherNumber,
			reason: event.detail.selectedReason.reason
		};

		this._saveToState(event.detail.selectedReason);

		this.horizonIncidentManager.setCurrentNeed(`send-cash-place-hold`);

		const returnValue = await this.sendCashService.putVoucherHold(sendCashVoucherHoldRequest);

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToSendCashSuccess();
			return;
		}

		this.horizonRouter.navigateToSendCashFailure();
	}

	async _showPayShapUpdateModal(e) {
		this.payShapModalDetails = e.detail;
		
		await this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD);
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP);

		this.renderMode = RENDER_MODE.PAYSHAP_MODAL;
	}

	_saveToState(selectedReason) {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.sendCashSelectedReason = selectedReason.value;
		this.horizonStore.setScreenDetails(screenDetails);
	}

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

		const isSuccess = await super.closeIncident(options, () => this._toggleBusyFlag(), () => this._errorHandler());
		
		if (isSuccess) {
			// Navigate to favourites landing page
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.CLOSED;
			this.horizonIncidentManager.setFeedback(selectedOption.key);
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

	_searchOtherNeedDone() {
	
		if (this.updateStrackClick) {
			this.postAction._refreshScreen();
			this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
			this.updateStrackClick = false;
			return true;
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _getPermanentLimits(request) {
		const returnValue = await this.cardService.getPermanentLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to retrieve permanent card limits`, `_getPermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();
		return null;
	}

	async _updatePermanentLimits(updateRequest) {
	
		updateRequest.cardLimits = this._limitsRandsToCents(updateRequest.cardLimits);

		const returnValue = await this.cardService.updatePermanentLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update permanent card limits`, `_updatePermanentLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _getTemporaryLimits(request) {
		const returnValue = await this.cardService.getTemporaryLimits(request, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Unable to get temporary card limits`, `_getTemporaryLimits`, returnValue.correlationId);
		this.horizonRouter.navigateToSystemError();

		return null;
	}

	async _updateTemporaryLimits(updateRequest) {
		
		updateRequest.cardLimits = this._limitsRandsToCents(updateRequest.cardLimits);

		const returnValue = await this.cardService.updateTemporaryLimits(updateRequest, () => true);

		if (returnValue.succeeded) {
			return true;
		}

		this.logger.log(`error`, `Unable to update temporary card limits`, `_updateTemporaryLimits`, returnValue.correlationId);

		return null;
	}

	async _getCardLimitsAgreement(agreementRequest) {

		agreementRequest.cardDetails = this._limitsRandsToCents(agreementRequest.cardDetails);

		const returnValue = await this.cardService.getCardLimitsAgreement(agreementRequest, () => this._createIncidentOnError());
		
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
		const currentIncident = this.horizonIncidentManager.currentIncident;
		if (!currentIncident) {
			await super.createAndClassifySubIncident();
		}
		
		this._updateNeedToState(event.detail.category);
		
		await this.getSubCategories(event);
	}

	async _getIssues(event) {
		this._updateNeedToState(`subCategory`, event.detail.need);
		await this.getIssues(event);
	}


	async _getIssues(event) {
		
		this._updateNeedToState(event.detail.category, event.detail.need);
		
		await this.getIssues(event);
	}

	_stateChanged(state) {
		if (state?.callerInformation) {
			this.callerInformation = state.callerInformation;
		}
	}

	async _showPayShapPOPModal(event) {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT, {
			"screen": TelemetryScreen.PAYSHAP_TRANSACTION_HISTORY,
			"next-screen": TelemetryScreen.PAY_SHAP_PROOF_OF_PAYMENT
		});

		this.proofOfPaymentDetails = event.detail;

		await super._inicidentManager_(`payshap-pop`, () => this._toggleBusyFlag());

		this.renderMode = RENDER_MODE.PAYSHAP_POP;

		await this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT);
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_ON_LOAD_POP);
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		if (this.callerInformation.verificationStatus !== `non-client` && this.callerInformation.verificationStatus !== `unverified`) {
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
				 * Develop better solution (CSCEH-7747)
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
			this._updateLeftBar();
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

		this._performReturnToScreen();
	}

	_updateLeftBar() {
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

		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.horizonIncidentManager.currentIncident);

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

		const currentIncident = this.horizonIncidentManager.currentIncident;

		const returnValue = await this.cardService.cardLimitsLanding(this.callerInformation.cifNumber, currentIncident);
			
		if (returnValue.succeeded) {
			this.cards = returnValue.result.cards;
			
			// Filter cards that has limits listed
			this.cards = this.cards.filter(card => !isNullorEmpty(card.cardLimits));

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

	async _taxCertificates() {

		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_TAX_CERTIFICATE, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});

		const returnValue = await this.quickTransactionService.getTaxCertificate(this.callerInformation.cifNumber, () => true);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get load tax certificates information`, `_taxCertificates`, returnValue.correlationId);
			this.horizonRouter.navigateToTaxCertificateServiceError();
			return;
		}

		this.taxCertificateDetails = returnValue.result;
		this.hasTaxCertificate = this.taxCertificateDetails.iT3BTaxCertificates.length + this.taxCertificateDetails.iT3STaxCertificates.length > 0;

		this.renderMode = this.hasTaxCertificate ? RENDER_MODE.TAX_CERTIFICATE : RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE;
	}

	async _getStatements() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_STATEMENTS, {
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		await super._getStatements();
	}

	_proofOfAccount() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_PROOF_OF_ACCOUNT, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT
		});
		
		this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
	}

	async _settlementQuote(customErrHandler = null) {
		// Implement permission check
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
					item.maxSettlementAmount = item.maxSettlementAmount ? formatCurrency(item.maxSettlementAmount) : formatCurrency(item.settlementAmount);
					item.isClosed = () => item.accountStatusDescription?.toLowerCase() === `marked closure`;
					return item;
				});

			if (this.settlementQuoteDetails.length > 0) {
				const { ccsStatus } = await this._checkCreditPermisions(`settlement-quote`, this.callerInformation.cifNumber, this.settlementQuoteDetails[0].accountNumber, this.settlementQuoteDetails[0].type);
				this.ccsStatus = ccsStatus;

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
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_PAID_UP_LETTER, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.PAID_UP_LETTER_ACCOUNTS
		});

		this._telemetry.startSpan(CreditEvents.CREDIT_PAID_UP_LETTER, {});
		
		const returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber, ACCOUNT_STATUS.PAID_UP);
		
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve client overview from credit service.`, `_initialise`, returnValue.correlationId);
			this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
			return;
		}
		
		if (returnValue.succeeded && returnValue.result) {
			
			this.creditAccountDetails = returnValue.result;
			this._formatCreditOverviewResponse();
			this.accountsInfo = [...this.creditAccountDetails.creditCardSummaryList, ...this.creditAccountDetails.accessFacilitySummaryList, ...this.creditAccountDetails.loanAccountSummaryList];
		
			if (this.accountsInfo.length > 0) {
				
				const { ccsStatus } = await this._checkCreditPermisions(`paid-up-letter`, this.callerInformation.cifNumber, this.accountsInfo[0].accountNumber, this.accountsInfo[0].type);
				this.ccsStatus = ccsStatus;

				if (this.ccsStatus) {
					this.showCCSmodal = true;
					return;
				}
			}

			this.renderMode = RENDER_MODE.PAID_UP_ACCOUNTS;
		}
	}

	async _sendCash() {
		this.sendCashVouchers = await this._getSendCashVouchers();

		await super.createAndClassifySubIncident(null, false);
		this.renderMode = RENDER_MODE.SEND_CASH;
	}

	async _payShap() {

		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_PAY_SHAP, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.PAY_SHAP_DETAILS
		});

		this.payShapDetails = await this._getPayShapDetails();
		
		await super.createAndClassifySubIncident(null, false);
		this.renderMode = RENDER_MODE.PAYSHAP;
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP);
	}

	async _getPayShapDetails() {
		const payShapDetailsRequest = {
			cifNumber: this.callerInformation.cifNumber,
			verifiedCellphoneNumber: this.callerInformation.verifiedTelephoneNumber
		};

		const returnValue = await this.payShapService.getDetails(payShapDetailsRequest);

		if (returnValue.succeeded) {
			return returnValue.result;
		}
	}

	async _getPayShapInstitutionsDetails() {
		const returnValue = await this.payShapService.getInstitutions();

		if (returnValue.succeeded) {
			return returnValue.result;
		}
	}

	async _getMoneyInTransactionHistory(request) {
		const returnValue = await this.payShapService.moneyIn(request);

		if (returnValue.succeeded) {
			return returnValue.result;
		}
	}

	async _getMoneyOutTransactionHistory(request) {
		const returnValue = await this.payShapService.moneyOut(request);

		if (returnValue.succeeded) {
			return returnValue.result;
		}
	}

	payshapDisplayToast() {
		this.displayToast = true;
		window.setTimeout(() => this._toggleToastDisplay(), 3000);
	}

	_toggleToastDisplay() {
		this.displayToast = false;
	}

	async _getSendCashVouchers(startDate, endDate) {

		const sendCashVouchersRequest = {
			cifNumber: this.callerInformation.cifNumber,
			fromDateTime: startDate || this.get30DaysBefore(today),
			toDateTime: endDate || today.toISOString(),
			offset: 0
		};

		const returnValue = await this.sendCashService.getVouchers(sendCashVouchersRequest);

		if (returnValue.succeeded) {
			return returnValue.result;
		}
	}

	
	get30DaysBefore(date) {
		const result = new Date(date);
		result.setDate(result.getDate() - 30);
		return result.toISOString();
	}

	_formatCreditOverviewResponse() {
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

		await super.createAndClassifySubIncident();

		this.endCallContext = `SearchOtherNeed`;
		this.renderMode = RENDER_MODE.SEARCH_OTHER_NEED;
		await this.getCategories();
	}

	_loadingOtherNeeds() {
		this._telemetryStartSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED);
	}

	async _unLoadingOtherNeeds() {
		this._telemetryEndSpan(QuickTransactionEvents.SEARCH_OTHER_NEED, TelemetryScreen.SEARCH_OTHER_NEED);

		const currentIncident = this.horizonIncidentManager.currentIncident;

		if (!currentIncident) {
			this.renderMode = RENDER_MODE.MAIN_PAGE;
			return true;
		}

		const screenDetails = this.horizonStore.getScreenDetails();
		const incidentInfo = await this.incidentStatus(currentIncident) || {};

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

		const currentIncident = this.horizonIncidentManager.currentIncident;
	
		this.horizonRouter.navigateToStrack(currentIncident);
		
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
		await super.createAndClassifySubIncident();
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

	async _onExitSendCash() {
		await super.classifyIncident(() => this._toggleBusyFlag());
		
		this._setIncidentDone();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_setIncidentDone() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}

	async _onUnloadingSendCash() {
		await super.classifyIncident(() => this._toggleBusyFlag());
		
		this._setIncidentDone();
	}

	_onExitPayShap() {
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP, null, true, false, true);
		this.renderMode = RENDER_MODE.MAIN_PAGE;
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

	async _setCapitecBankAsDefault() {
		await super._inicidentManager_(`set-capitec-as-default-bank`, () => this._toggleBusyFlag());
		const returnValue = await this.payShapService.enlistCapitec(this.callerInformation.verifiedTelephoneNumber, (exception) => true);

		if (returnValue.succeeded) {
			this.payShapDefaultToast = `success`;
			this._setIncidentDone();
		} else {
			this.payShapDefaultToast = `error`;
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		}

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_UPDATE_DETAILS_SAVE, {
			"Cell-phone-number": this.callerInformation.verifiedTelephoneNumber,
			"Default-institution": returnValue.succeeded ? `CAPITEC` : `Not Set`, 
			"next-screen": returnValue.succeeded ? `success` : `failed`
		});

		this.payshapDisplayToast();

		this.payShapDetails = await this._getPayShapDetails();
		
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP, null, true, true);
		this.renderMode = RENDER_MODE.PAYSHAP;
	}

	async _removeCapitecBankAsDefault() {
		await super._inicidentManager_(`remove-capitec-as-default-bank`, () => this._toggleBusyFlag());
		const returnValue = await this.payShapService.delistCapitec(this.callerInformation.verifiedTelephoneNumber, (exception) => true);

		if (returnValue.succeeded) {
			this.payShapDefaultToast = `success`;
			this._setIncidentDone();
		} else {
			this.payShapDefaultToast = `error`;
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
		}

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_UPDATE_DETAILS_SAVE, {
			"Cell-phone-number": this.callerInformation.verifiedTelephoneNumber,
			"Default-institution": returnValue.succeeded ? `Not Set` : `CAPITEC`, 
			"next-screen": returnValue.succeeded ? `success` : `failed`
		});

		this.payshapDisplayToast();
		

		this.payShapDetails = await this._getPayShapDetails();
		
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP, null, true, true);
		this.renderMode = RENDER_MODE.PAYSHAP;
	}

	async _updatePayShapDetails() {
		const payShapDetailsRequest = {
			cifNumber: this.callerInformation.cifNumber,
			verifiedCellphoneNumber: this.callerInformation.verifiedTelephoneNumber
		};

		const returnValue = await this.payShapService.getDetails(payShapDetailsRequest);

		if (returnValue.succeeded) {
			this.payShapDetails = returnValue.result;
		}
	}

	async _unloadingPayshap() {
		if (this.horizonIncidentManager.currentIncident === `payshap`) {
			await super.classifyIncident(() => this._toggleBusyFlag());
			this._setIncidentDone();
		}

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _sendPayshapPOP(event) {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_SEND_PROOF_OF_PAYMENT_CONFIRM, {
			"notification-type": event.detail.notificationType,
			"email-address": event.detail.emailAddress
		});
	
		const clientInfo = {
			"paymentUetr": this.proofOfPaymentDetails.uetr,
			"cifNumber": this.callerInformation.cifNumber,
			"notificationType": event.detail.notificationType,
			"emailAddress": event.detail.emailAddress,
			"verifiedCellphoneNumber": this.callerInformation.verifiedTelephoneNumber

		};
		const returnValue = await this.payShapService.payshapProofOfPayment(clientInfo, null, 1);

		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_ON_LOAD_POP, {
			"resend-success": returnValue.result.resendSuccess,
			"resend-failed": returnValue.result.resendFailed
		});

		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `payshap`);
	
		const screenDetails = { ...event.detail, ...this.proofOfPaymentDetails };
		screenDetails.outcome = returnValue.result;
		screenDetails.request = clientInfo;
		this.horizonStore.setScreenDetails(screenDetails);
		
		if (returnValue.succeeded) {
			this.horizonRouter.navigateToPayshapProofOfPaymentOutcome();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}
	
	async _cancelPayshapUpdateModal() {
		await this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_UPDATE_DETAILS_CANCEL);
		this.renderMode = RENDER_MODE.PAYSHAP;
		await this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP, null, true, true);
	}

	async _cancelPOPModal() {
		await super._inicidentManager_(`payshap`, () => this._toggleBusyFlag());
		await this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_SEND_PROOF_OF_PAYMENT_CANCEL);
		this.renderMode = RENDER_MODE.PAYSHAP;
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_PROOF_OF_PAYMENT_ON_LOAD_POP, null, true, true);
	}

	/** Update card settings */

	async _updateCardSettings() {
		// service call to get list of cards
		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.horizonIncidentManager.currentIncident);

		await super.createAndClassifySubIncident(null, false);

		if (returnValue.succeeded) {
			this.cardsList = returnValue.result.cards;
			this.renderMode = RENDER_MODE.UPDATE_CARD_SETTINGS;
			return;
		}
		this.horizonRouter.navigateToSystemError();
	}

	async _deactivateCardTransactions(event) {
		await super._inicidentManager_(`update-card-settings`, () => this._toggleBusyFlag());

		// service call to deactivate online purchases and International transactions
		const requestDetails = event.detail.cardsListToDeactivate?.map(card => {
			const updatedCard = {
				cardNumber: card.cardNumber,
				internationalTransactions: card.internationalTransactions ? null : false,
				ecommerce: card.ecommerce ? null : false
			};
			return updatedCard;
		});

		const returnValue = await this.cardService.updateCardsSettings(this.callerInformation.cifNumber, requestDetails);
		if (returnValue.succeeded) {
			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `card-settings`);

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.deactivatedCardsList = returnValue.result.cards;
			screenDetails.ecommerceUpdated = event.detail.ecommerceUpdated;
			screenDetails.internationalUpdated = event.detail.internationalUpdated;

			this.horizonStore.setScreenDetails(screenDetails);
			this.horizonRouter.navigateToCardSettingsOutcome();
			return;
		}
		this.horizonRouter.navigateToSystemError();
	}

	async _exitCardSettings() {
		await super.classifyIncident(() => this._toggleBusyFlag());
		
		this._setIncidentDone();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
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

				.error-msg {
					width: auto;
					height: 60px;
					font-family: "Hind Vadodara";
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					text-align: center;
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
			${this._renderTaxCertificateNotAvailable()}
			${this._renderPaidUpAccounts()}
			${this._renderSettlementQuote()}
			${this._renderSettlementQuoteDialog()}
			${this._renderCcsModal()}
			${this._renderSendCash()}
			${this._renderConfirmPlaceHoldModal()}
			${this._renderPayShap()}
			${this._renderPayShapUpdateModal()}
			${this._renderPayShapPOP()}
			${this._renderUpdateCardSettings()}

			${super._webTemplate()}
		`;
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
						?isCapitecConnectAgent="${this.roleManager.isCapitecConnectAgent}"
						.shouldDisableByRole="${need => this._shouldDisableByRole(need)}"
						.showTooltip="${need => this._showTooltip(need)}"
						.getTooltipMessage = "${(need) => this._getTooltipMessage(need)}"
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
		return html``; // Always return no HTML. Client should visit APP or branch to update limits. Button will be disabled with tooltip
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
					.shouldDisableByRole="${need => this._shouldDisableByRole(need)}"
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
					accountNumber="${this.landingPageInfo.accountNumber}"
					accountOpenedDate="${this.landingPageInfo.accountOpenedDate}"
					registeredEmailId="${this.callerInformation.emailId}"
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
				.taxCertificateDetails="${this.taxCertificateDetails}"
				.cifNumber="${this.callerInformation.cifNumber}"
				accountNumber="${this.landingPageInfo.accountNumber}"
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
			@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
		</horizon-paid-up-accounts>`
		: html``;
	}

	_renderSendCash() {
		return this.renderMode === RENDER_MODE.SEND_CASH || this.renderMode === RENDER_MODE.PLACE_HOLD_MODAL
			? html`
				<horizon-send-cash-landing
					.sendCashVouchers="${this.sendCashVouchers}"
					.getSendCashVouchers="${(startDate, endDate) => this._getSendCashVouchers(startDate, endDate)}"
					.disposeData="${() => this.sendCashVouchers = []}"
					.shouldDisableByRole="${need => this._shouldDisableByRole(need)}"
					.showTooltip="${need => this._showTooltip(need)}"
					.getTooltipMessage = "${(need) => this._getTooltipMessage(need)}"

					@on-place-hold="${(item) => this._showConfirmPlaceHoldModal(item)}"
					@back="${() => this._onExitSendCash()}"
					@unloading="${() => this._onUnloadingSendCash()}">
				</horizon-send-cash-landing>`
			: html``;
	}

	_renderConfirmPlaceHoldModal() {
		return this.renderMode === RENDER_MODE.PLACE_HOLD_MODAL
		? html`
			<horizon-confirm-place-hold
				@on-confirm="${(e) => this._onConfirmPlaceHold(e)}"
				@cancel="${() => this.renderMode = RENDER_MODE.SEND_CASH}">
			</horizon-confirm-place-hold>`
		: html``;
	}

	_renderPayShap() {
		return this.renderMode === RENDER_MODE.PAYSHAP || this.renderMode === RENDER_MODE.PAYSHAP_MODAL || this.renderMode === RENDER_MODE.PAYSHAP_POP
		? html`
			<horizon-payshap-landing
				.payShapLandingDetails="${this.payShapDetails}"
				.cifNumber="${this.callerInformation.cifNumber}"
				.verifiedCellphoneNumber="${this.callerInformation.verifiedTelephoneNumber}"
				.payShapDefaultToast="${this.payShapDefaultToast}"
				.displayToast="${this.displayToast}"
				.accountNumber="${this.landingPageInfo.accountNumber}"
				.getInstitutions="${() => this._getPayShapInstitutionsDetails()}"
				.getMoneyInTransactionHistory="${(request) => this._getMoneyInTransactionHistory(request)}"
				.getMoneyOutTransactionHistory="${(request) => this._getMoneyOutTransactionHistory(request)}"

				@on-update="${(e) => this._showPayShapUpdateModal(e)}"
				@payshap-pop="${(e) => this._showPayShapPOPModal(e)}"
				@back="${() => this._onExitPayShap()}"
				@unloading="${() => this._unloadingPayshap()}">
			</horizon-payshap-landing>`
		: html``;
	}

	_renderPayShapUpdateModal() {
		return this.renderMode === RENDER_MODE.PAYSHAP_MODAL
		? html`
			<horizon-pay-shap-update
						.payShapModalDetails="${this.payShapModalDetails}"
						@set-capitec-as-defult="${() => this._setCapitecBankAsDefault()}"
						@remove-capitec-as-default="${() => this._removeCapitecBankAsDefault()}"
						@on-cancel="${() => this._cancelPayshapUpdateModal()}">
			</horizon-pay-shap-update>`
		: html``;
	}

	_renderPayShapPOP() {
		return this.renderMode === RENDER_MODE.PAYSHAP_POP
		? html`
		<horizon-payshap-proof-of-payment
						@on-cancel="${() => this._cancelPOPModal()}"
						@on-send="${(e) => this._sendPayshapPOP(e)}">
		</horizon-payshap-proof-of-payment>`
		: html``;
	}

	_renderUpdateCardSettings() {
		return this.renderMode === RENDER_MODE.UPDATE_CARD_SETTINGS
		? html`
			<horizon-update-card-settings
					.cards = ${this.cardsList}
					@back="${() => this._exitCardSettings()}"
					@deactivate="${(event) => this._deactivateCardTransactions(event)}">
			</horizon-update-card-settings>`
		: html``;
	}
}

customElements.define(`horizon-favourites`, Favourites);