import { Configuration, EventAggregator, SecurityContext } from 'platform/core';
import { HORIZON_VIEW_SET, HorizonViewManager } from 'app/shell/HorizonViewManager';
import { HorizonStore } from 'app/store/HorizonStore';
import { Instana } from 'app/services/instana';
import { RoleManager } from 'app/shell/RoleManager';
import { Router } from 'platform/Router';


/**
 * The Horizon URL Schema. 
 */
const HORIZON_ROUTES = Object.freeze({
	LANDING_PAGE: `/landingPage`,
	PRODUCT_INFO: `/product/info`,
	SAVINGS_ACCOUNT_PRODUCT_PAGE: `/product/savings-account`,
	SAVINGS_PLAN_PRODUCT_PAGE: `/product/savings-plan`,
	// SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE: `/product/savings-plan/flexible`,
	// SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE: `/product/savings-plan/fixed-term`,
	// SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE: `/product/savings-plan/tax-free`,
	PRODUCT_INSURE: `/product/insure`,
	PRODUCT_CREDIT: `/product/credit`,
	PRODUCT_LIVE_BETTER: `/product/live-better`,
	PRODUCT_CAPITEC_CONNECT: `/product/capitec-connect`,
	CARD_STOP_PAGE: `/card-stop`,
	CARD_STOP_SUCCESS_PAGE: `/card-stop/success`,
	CARD_STOP_FAILURE_PAGE: `/card-stop/failed`,
	INSURE_PROSPECTIVE_CLIENT: `/insure/prospective`,
	INSURE_EXISTING_CLIENT: `/insure/existing-client`,
	INSURE_UNVERIFIED_CLIENT: `/insure/unverified-client`,
	TRANSACT_FAVOURITES: `/transact/favourites`,
	SAVINGS_ACCOUNT: `/transact/savings-account`,
	KBA_VERIFICATION_FAILED: `/error/kba-verification`,
	XDS_VERIFICATION_FAILED: `/error/xds-verification`,
	ITA_VERIFICATION_FAILED: `/error/ita-verification`,
	SYSTEM_ERROR: `/error/system-error`,
	INITIAL_SYSTEM_ERROR: `/error/initial-system-error`,
	DEBICHECK_SUCCESS: `/success/debicheck`,
	DEBICHECK_FAILED: `/error/debicheck`,
	DEBICHECK_SERVICE_ERROR: `/error/debicheck-service-error`,
	STATEMENTS_SUCCESSFUL: `/views/statements/StatementsSuccess`,
	STATEMENTS_UNSUCCESSFUL: `/views/statements/StatementsUnsuccess`,
	CARDS_LIMIT_UPDATE_SUCCESS: `/success/card-limit-update`,
	CARDS_LIMIT_UPDATE_FAILED: `/error/card-limit-update`,
	PROOF_OF_ACCOUNT_SUCCESS: `/success/proof-of-account`,
	PROOF_OF_ACCOUNT_FAILED: `/error/proof-of-account`,
	PAYSHAP_PROOF_OF_PAYMENT_OUTCOME: `/success/payshap-proof-of-payment`,
	TAP_TO_PAY_SUCCESSFUL: `/success/tap-to-pay`,
	TAP_TO_PAY_UNSUCCESSFUL: `/error/tap-to-pay`,
	TAX_CERTIFICATE_SUCCESSFUL: `/success/tax-certificate`,
	TAX_CERTIFICATE_FAILURE: `/error/tax-certificate`,
	TAX_CERTIFICATE_SERVICE_ERROR: `/error/tax-certificate-service-error`,
	AUTOMATIC_SAVINGS_SUCCESS: `/success/automatic-savings`,
	AUTOMATIC_SAVINGS_FAILED: `/error/automatic-savings`,
	LIVE_BETTER: `/liveBetter`,
	LIVE_BETTER_SYSTEM_ERROR: `/error/live-better`,
	CREDIT_ACCOUNT: `/transact/credit`,
	CREDIT_STATEMENTS_SUCCESS: `/success/credit-statements`,
	CREDIT_STATEMENTS_FAILURE: `/error/credit-statements`,
	SETTLEMENT_QUOTE_SUCCESS: `/success/settlement-quote`,
	SETTLEMENT_QUOTE_FAILURE: `/error/settlement-quote`,
	SETTLEMENT_QUOTE_OUTCOME: `/outcome/settlement-quote`,
	EMAIL_CONFIRMATION_OUTCOME: `/outcome/email-confirmation`,
	SETTLE_AND_CLOSE_SUCCESS: `/success/settle-and-close`,
	SETTLE_AND_CLOSE_FAILURE: `/error/settle-and-close`,
	SAVINGS_PLAN: `/transact/savings-plan`,
	BUDGET_FACILITY_SUCCESS: `/success/budget-facility`,
	BUDGET_FACILITY_FAILURE: `/error/budget-facility`,
	PROOF_OF_PAYMENT_SUCCESS: `/success/proof-of-payment`,
	PROOF_OF_PAYMENT_FAILURE: `/error/proof-of-payment`,
	PAID_UP_LETTER_SUCCESS: `/success/paid-up-letter`,
	PAID_UP_LETTER_FAILURE: `/error/paid-up-letter`,
	UNLOCK_FTSP_SUCCESS: `/success/unlock-fixed-term-savings-plan`,
	UNLOCK_FTSP_FAILURE: `/error/unlock-fixed-term-savings-plan`,
	SEND_CASH_SUCCESS: `/success/send-cash`,
	SEND_CASH_FAILURE: `/error/send-cash`,
	CREATE_INCIDENT_ERROR: `/error/create-incident`,
	WIDGET_HOST: `/widget`,
	WIDGET_HOST_UNAVAILABLE: `/widget/unavailable`,
	WIDGET_HOST_NOTFOUND: `/widget/notfound`,
	VIEW_PROFILE: `/view-profile`,
	VIEW_AVAILABLE_FOR_ROLE: `/error/unavailable-for-role`,
	ACCESS_CHANNELS_OUTCOME: `/access-channels/outcome`
});


/**
 * The HorizonRouter class provides a series of functions for navigating to pages.
 * These functions simply wrap the platforms navigateByPath method.
 * 
 * The class also provides access to state information for the guard functions in
 * the routing table. Information from state may be used by the guard functions to 
 * prevent browsing to a URL unless required pre-conditions are met.
 */
export class HorizonRouter {

	constructor() {
		this.router = Router.getInstance();
		this._configuration = Configuration.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		
		// instana properties
		this._InstanaKey = this._configuration.getSetting(`InstanaKey`);
		this._InstanaHelper = Instana.getInstance();
		this._InstanaHelper._instanaScript();
		this._securityContext = SecurityContext.getInstance();
		// this._InstanaKey = ``;
		this.roleManager = RoleManager.getInstance();

		this.stateSub = HorizonStore.getInstance().stateChanged.subscribe(state => this._updateState(state));

		this._initialiseSTrackConfig();

		this.verificationStatus = ``;
		this.callStatus = ``;
		this._performPostNavigateFunc = null;
	}


	async _initialiseSTrackConfig() {
		this.strackURL = await this._configuration.getSetting(`otherSystemsURL.strack`);
		this._InstanaKey = await this._configuration.getSetting(`InstanaKey`);
	}

	static getInstance() {
		return this.instance || (this.instance = new HorizonRouter());
	}

	_updateState(state) {
		// On an F5/refresh, this function fires before state has been restored and does not fire
		// again until after the guard functions in the routing table have fired. 
		// If the guard functions rely on information from state, they then do not work properly
		if (!state) {
			state = HorizonStore.getInstance().recoverState();
		}

		// Now obtain information used by guard functions in the routing table from state
		if (state && state.callerInformation && state.callerInformation.verificationStatus) {
			// Some pages have different left/right layouts based on the verification status
			// of the incoming caller.
			this.verificationStatus = state.callerInformation.verificationStatus;
		}

		this.callStatus = state && state.callStatus ? state.callStatus : ``;
		
		this._InstanaHelper._instanaScripts(this._securityContext, this._InstanaKey);
	}

	/**
	 * Extracts information from state used by guard functions in the routing table
	 *
	 * @returns {Object} An object containing information recovered from state for the guard functions in the routing table.
	 * @memberof HorizonRouter
	 */
	getRoutingInfo() {
		return {
			verificationStatus: this.verificationStatus,
			callStatus: this.callStatus
		};
	}

	getCurrentRoute() {
		return this.router.currentRoute;
	}

	// --------------------
	// Navigation functions  
	// --------------------
	navigateToWaitingForCall(postNavigateAction = null) {
		// This is specifically for master incident creation failed scenario
		this._performPostNavigateFunc = postNavigateAction;

		this.router.navigateByPath(HORIZON_ROUTES.LANDING_PAGE);
	}

	navigateToSavingsAccountProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_ACCOUNT_PRODUCT_PAGE);
	}

	navigateToSavingsPlanProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_PAGE);
	}

	/*
	navigateToFlexibleSavingsPlanProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE);
	}
	*/

	/*
	navigateToFixedTermSavingsProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE);
	}
	*/

	/*
	navigateToTaxFreeSavingsProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE);
	}
	*/

	navigateToInsureProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_INSURE);
	}

	navigateToCreditProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_CREDIT);
	}

	navigateToLiveBetterProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_LIVE_BETTER);
	}

	navigateToCapitecConnetProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_CAPITEC_CONNECT);
	}

	navigateToStopCard() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_PAGE);
	}

	navigateToStoppedCards() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_SUCCESS_PAGE);
	}

	navigateToStopCardFailed() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_FAILURE_PAGE);
	}

	navigateToInsureProspectiveClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_PROSPECTIVE_CLIENT);
	}

	navigateToInsureExistingClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_EXISTING_CLIENT);
	}

	navigateToInsureUnverifiedClient() {
		this.router.navigateByPath(`${HORIZON_ROUTES.INSURE_UNVERIFIED_CLIENT}`);
	}

	navigateToQuickTransactionFavourites() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TRANSACT_FAVOURITES}`);
	}

	navigateToXdsVerificationFailed() {
		// TODO: This doesn't work when verify dialog is called from the XDS Verification failure screen
		if (this.router.currentRoute.title === `XdsVerificationFailed`) {
			this.router.updateNavigation(`${HORIZON_ROUTES.ITA_VERIFICATION_FAILED}`, true);
		} else {
			this.router.navigateByPath(`${HORIZON_ROUTES.XDS_VERIFICATION_FAILED}`);
		}
	}

	navigateToItaVerificationFailed() {
		// TODO: This doesn't work when verify dialog is called called from the ITA Verification failure screen
		// if (this.router.currentRoute.title === `ItaVerificationFailed`) {
		// this.router.updateNavigation(`${HORIZON_ROUTES.ITA_VERIFICATION_FAILED}`);
		// }
		this.router.navigateByPath(`${HORIZON_ROUTES.ITA_VERIFICATION_FAILED}`);
	}

	navigateToSystemError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SYSTEM_ERROR}`);
	}

	navigateToInitialSystemError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.INITIAL_SYSTEM_ERROR}`);
	}

	navigateToTaxCertificateServiceError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TAX_CERTIFICATE_SERVICE_ERROR}`);
	}

	navigateToliveBetterSystemError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.LIVE_BETTER_SYSTEM_ERROR}`);
	}

	navigateToDebiCheckSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.DEBICHECK_SUCCESS}`);
	}

	navigateToDebiCheckFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.DEBICHECK_FAILED}`);
	}

	navigateToDebiCheckServiceError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.DEBICHECK_SERVICE_ERROR}`);
	}

	navigateToCardLimitUpdateSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CARDS_LIMIT_UPDATE_SUCCESS}`);
	}

	navigateToCardLimitUpdateFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CARDS_LIMIT_UPDATE_FAILED}`);
	}

	navigateToStatementSuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.STATEMENTS_SUCCESSFUL}`);
	}

	navigateToStatementUnsuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.STATEMENTS_UNSUCCESSFUL}`);
	}

	navigateToTaxCertificateSuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TAX_CERTIFICATE_SUCCESSFUL}`);
	}

	navigateToTaxCertificateFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TAX_CERTIFICATE_FAILURE}`);
	}

	navigateToLandingPage(ivrOption, hasInsuranceProducts) {
		const stopCard = () => this.navigateToStopCard();
		const transact = () => this.navigateToQuickTransactionFavourites();
		const insure = () => this.navigateToInsureLanding();
		const savings = () => this.navigateToSavingsAccount();
		const credit = () => this.navigateToCreditAccount();
		const savingsPlan = () => this.navigateToSavingsPlan();
		const liveBetterSavings = () => this.navigateToLiveBetter();
		const capitecConnect = () => this.navigateToCapitecConnetProduct();
		const productEnquiry = () => this.navigateToProductInfo(`SavingsAccount`); 

		const landingPageFunc = {
			StopCard: stopCard,
			Transact: transact,
			Insure: insure,
			SavingsAccount: savings,
			Credit: credit,
			SavingsPlan: savingsPlan,
			LiveBetter: liveBetterSavings,
			ProductEnquiry: productEnquiry,
			CapitecConnect: capitecConnect
		}[ivrOption]();
	};

	navigateToInsureLanding() {
		// TODO: Navigation to the correct insure page
		if (this.roleManager.isInsureAgent) {
			this.navigateToInsureUnverifiedClient();
			return;
		}
		this.navigateToInsureExistingClient();

		// this.navigateToProductInfo(`Insure`);
	}

	navigateToReturnPage() {
		const horizonStore = HorizonStore.getInstance();
		const returnToPath = horizonStore.getReturnToScreen().route.path;
		this.router.navigateByPath(returnToPath);
	}

	navigateToSavingsAccount() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SAVINGS_ACCOUNT}`);
	}

	navigateToStrack(incident) {
		// Clone the strackURL and update that. Don't modify the original this.strackURL as 
		// this will break the incidentRecId replacement logic and cause the same incident
		// to be opened every time.
		let newUrl = this.strackURL.slice();
		newUrl = newUrl.replace(`$incidentRecId`, incident.incidentId);
		window.open(newUrl);
	}

	navigateToProofOfAccountSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PROOF_OF_ACCOUNT_SUCCESS}`);
	}

	navigateToProofOfAccountFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PROOF_OF_ACCOUNT_FAILED}`);
	}

    navigateToPayshapProofOfPaymentOutcome() {
        this.router.navigateByPath(`${HORIZON_ROUTES.PAYSHAP_PROOF_OF_PAYMENT_OUTCOME}`);
	}

	_navigateToTapToPayUnsuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TAP_TO_PAY_UNSUCCESSFUL}`);
	}

	navigateToTapToPaySuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TAP_TO_PAY_SUCCESSFUL}`);
	}

	navigateToCreditAccount() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CREDIT_ACCOUNT}`);
	}

	navigateToCreditStatementSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CREDIT_STATEMENTS_SUCCESS}`);
	}

	navigateToCreditStatementUnsuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CREDIT_STATEMENTS_FAILURE}`);
	}

	navigateToLiveBetter() {
		this.router.navigateByPath(`${HORIZON_ROUTES.LIVE_BETTER}`);
	}

	navigateToSavingsPlan() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SAVINGS_PLAN}`);
	}

	_productLandingPagesActive() {
		return this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES && this.navigationContext.current !== undefined;
	}

	navigateToAutomaticSavingsSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.AUTOMATIC_SAVINGS_SUCCESS}`);
	}

	navigateToAutomaticSavingsFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.AUTOMATIC_SAVINGS_FAILED}`);
	}

	navigateToSettlementQuoteSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SETTLEMENT_QUOTE_SUCCESS}`);
	}

	navigateToSettlementQuoteFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SETTLEMENT_QUOTE_FAILURE}`);
	}

	navigateToSettlementQuoteOutcome() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SETTLEMENT_QUOTE_OUTCOME}`);
	}

	navigateToEmailConfirmationOutcome() {
		this.router.navigateByPath(`${HORIZON_ROUTES.EMAIL_CONFIRMATION_OUTCOME}`);
	}

	navigateToSettleAndCloseSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SETTLE_AND_CLOSE_SUCCESS}`);
	}

	navigateToSettleAndCloseFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SETTLE_AND_CLOSE_FAILURE}`);
	}

	navigateToBudgetFacilitySuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.BUDGET_FACILITY_SUCCESS}`);
	}

	navigateToBudgetFacilityFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.BUDGET_FACILITY_FAILURE}`);
	}

	navigateProofOfPaymentSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PROOF_OF_PAYMENT_SUCCESS}`);
	}

	navigateProofOfPaymentFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PROOF_OF_PAYMENT_FAILURE}`);
	}

	navigatePaidUpLetterSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PAID_UP_LETTER_SUCCESS}`);
	}

	navigatePaidUpLetterFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.PAID_UP_LETTER_FAILURE}`);
	}

	navigateToUnlockFTSPSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.UNLOCK_FTSP_SUCCESS}`);
	}

	navigateToUnlockFTSPFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.UNLOCK_FTSP_FAILURE}`);
	}

	navigateToSendCashSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SEND_CASH_SUCCESS}`);
	}

	navigateToSendCashFailure() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SEND_CASH_FAILURE}`);
	}

	navigateToWidget(widgetName) {
		this.router.navigateByPath(`${HORIZON_ROUTES.WIDGET_HOST}/${widgetName}`);
	}

	navigateToWidgetUnavailable() {
		this.router.navigateByPath(`${HORIZON_ROUTES.WIDGET_HOST_UNAVAILABLE}`);
	}

	navigateToWidgetNotFound() {
		this.router.navigateByPath(`${HORIZON_ROUTES.WIDGET_HOST_NOTFOUND}`);
	}

	navigateToWidget(widgetId) {
		this.router.navigateByPath(`${HORIZON_ROUTES.WIDGET_HOST}/${widgetId}`);
	}

	/**
	 * Navigates to the indicated Product Info Page
	 *
	 * @param {String} type SavingsAccount | SavingsPlan | Insure | Credit
	 * @memberof HorizonRouter
	 * @returns { undefined }
	 */
	navigateToProductInfo(type) {
		this.router.navigateByPath(`${HORIZON_ROUTES.PRODUCT_INFO}?type=${type}`);
	}

	navigateToKBAVerificationFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.KBA_VERIFICATION_FAILED}`);
	}

	navigateToCreateIncidentError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.CREATE_INCIDENT_ERROR}`);
	}

	navigateToViewProfileDetails() {
		this.router.navigateByPath(`${HORIZON_ROUTES.VIEW_PROFILE}`);
	}

	navigateToUnavaliableForRole() {
		this.router.navigateByPath(`${HORIZON_ROUTES.VIEW_AVAILABLE_FOR_ROLE}`);
	}

	navigateToAccessChannelsOutcome() {
		this.router.navigateByPath(`${HORIZON_ROUTES.ACCESS_CHANNELS_OUTCOME}`);
	}

	/**
	 * Guard functions to prevent navigation to pages which the correct conditions are not met
	 *
	 * @static
	 * @param {string} funcName The name of the guard function to invoke
	 * @returns {Boolean} true if browsing to the requested page is allowed
	 * @memberof HorizonRouter
	 */
	static _guard(funcName) {
		const viewManager = HorizonViewManager.getInstance();
		const horizonRouter = HorizonRouter.getInstance();
		const horizonStore = HorizonStore.getInstance();


		const guardInitalLandingPages = () => {
			const routingInfo = horizonRouter.getRoutingInfo();
			const isOnInitialPageSet = viewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES;

			if (isOnInitialPageSet && routingInfo.callStatus === `CALL-IN-PROGRESS` && !isProductPage) {
				// If the user browsers to the initial landing page, trigger ending the call/clearing state
				// Manually browsing to the landing page is not supported and failing to clear state can leave
				// information from a previous client behind that can get mixed up with information from the next call
				// that arrives.
				const state = { callStatus: `CALL-ENDED` };
				routingInfo.callStatus = state.callStatus;
				horizonStore.saveState(state);
			}

			// Don't allow browsing back to the landing page from another page unless the call has been ended
			return routingInfo.callStatus === `` || routingInfo.callStatus === `WAITING-FOR-CALL` || routingInfo.callStatus === `CALL-ENDED`;
		};

		return {
			callWaitingPage: guardInitalLandingPages,
			productPage: guardInitalLandingPages
		}[funcName]();
	};

	static _guardNonInsureProductPagesForInsureRole(isInsureLandingPage) {
		const roleManager = RoleManager.getInstance();

		if (!isInsureLandingPage && roleManager.isInsureAgent) {
			return true;
		}

		return true;
	}


	/**
	 * Pre-Navigation functions used for setting the application frame/layout 
	 *
	 * @static
	 * @param {string} prenavFunc Pre-navigation function used for setting the application layout
	 * @param {Set} layout A set that indicates the application frame components to display
	 * @returns {undefined}
	 * @memberof HorizonRouter
	 */
	static _preNavigate(prenavFunc, layout) {
		const viewManager = HorizonViewManager.getInstance();
		const horizonRouter = HorizonRouter.getInstance();

		let shellLayout = layout;

		const setShellLayout = () => {
			viewManager.transitionToView(shellLayout);
		};

		const setShellLayoutByVerificationMode = () => {
			const routingInfo = horizonRouter.getRoutingInfo();
			switch (routingInfo.verificationStatus) {

				case `verified`: shellLayout = HORIZON_VIEW_SET.VERIFIED_PAGES;
					break;
				case `unverified`: shellLayout = HORIZON_VIEW_SET.UNVERIFIED_PAGES;
					break;
				case `3rdparty`:
				default:
					shellLayout = HORIZON_VIEW_SET.UNVERIFIED_PAGES;
					break;
			}
			setShellLayout(shellLayout);
		};

		return {
			layout: setShellLayout,
			layoutByVerifictionMode: setShellLayoutByVerificationMode
		}[prenavFunc]();
	}

	static _postNavigate() {
		const horizonRouter = HorizonRouter.getInstance();

		if (!horizonRouter._performPostNavigateFunc) {
			return;
		}

		horizonRouter._performPostNavigateFunc(); // Runtime object
	}
}

// -------------------------
// The Horizon Routing Table
// -------------------------

let horizonRoutes = [];

export default horizonRoutes = [
	{
		name: `horizon-landing-page`,
		title: `LandingPageView`,
		icon: null,
		path: HORIZON_ROUTES.LANDING_PAGE,
		load: () => import(`../views/waitingForCall/LandingPage`),
		guard: () => HorizonRouter._guard(`callWaitingPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES),
		onPostNavigate: () => HorizonRouter._postNavigate(),
		isDefault: true,
		isFallback: true
	},
	{
		name: `horizon-savings-account-product`,
		title: `SavingsAccountProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_ACCOUNT_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsAccountProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-savings-plan-product`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/SavingsPlanProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},

	/*
	{
		name: `horizon-flexible-savings-plan-product`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	*/

	/*
	{
		name: `horizon-fixed-term-savings-product`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FixedTermSavingsProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	*/

	/*
	{
		name: `horizon-tax-free-savings-product`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/TaxFreeSavingsProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	*/

	{
		name: `horizon-insure-product`,
		title: `InsureProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_INSURE,
		load: () => import(`../views/product/InsureProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-credit-product`,
		title: `CreditProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_CREDIT,
		load: () => import(`../views/product/CreditProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-live-better-product`,
		title: `LiveBetterProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_LIVE_BETTER,
		load: () => import(`../views/product/LiveBetterProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-capitec-connect-product`,
		title: `CapitecConnectProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_CAPITEC_CONNECT,
		load: () => import(`../views/product/CapitecConnectProduct`),
		// guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-stop-card-landing-page`,
		title: `Favourites`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_PAGE,
		load: () => import(`../views/stopCard/StopCardLandingPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-stop-card-success`,
		title: `StopCardSuccess`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_SUCCESS_PAGE,
		load: () => import(`../views/stopCard/StopCardSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-stop-card-failure`,
		title: `StopCardFail`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_FAILURE_PAGE,
		load: () => import(`../views/stopCard/StopCardFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-existing-client`,
		title: `Insure`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_EXISTING_CLIENT,
		load: () => import(`../views/insure/ExistingClient`),
		guard: () => true,

		/*
		const routingInfo = HorizonRouter.getInstance().getRoutingInfo();
		switch (routingInfo.verificationStatus) {
			case `verified`:
			case `unverified`:
			case `3rdparty`:
					return true;
			default:
				return false;
		*/
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	// {
	// name: `horizon-prospective-client`,
	// title: `Insure`,
	// icon: null,
	// path: HORIZON_ROUTES.INSURE_PROSPECTIVE_CLIENT,
	// load: () => import(`../views/insure/ProspectiveClient`),
	// onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	// },
	{
		name: `horizon-insure-unverified-client`,
		title: `Insure`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_UNVERIFIED_CLIENT,
		load: () => import(`../views/insure/InsureUnverifiedClient`),
		guard: () => true,
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-favourites`,
		title: `Favourites`,
		icon: null,
		path: HORIZON_ROUTES.TRANSACT_FAVOURITES,
		load: () => import(`../views/quickTransactions/Favourites`),
		guard: () => HorizonRouter._guardNonInsureProductPagesForInsureRole(),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-xds-verification-failed`,
		title: `XdsVerificationFailed`,
		icon: null,
		path: HORIZON_ROUTES.XDS_VERIFICATION_FAILED,
		load: () => import(`../views/common/XdsVerificationFailed`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-kba-verification-failed`,
		title: `KbaVerificationFailed`,
		icon: null,
		path: HORIZON_ROUTES.KBA_VERIFICATION_FAILED,
		load: () => import(`../views/common/KBAVerificationFailed`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-ita-verification-failed`,
		title: `ItaVerificationFailed`,
		icon: null,
		path: HORIZON_ROUTES.ITA_VERIFICATION_FAILED,
		load: () => import(`../views/common/ItaVerificationFailed`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-system-error`,
		title: `SystemError`,
		icon: null,
		path: HORIZON_ROUTES.SYSTEM_ERROR,
		load: () => import(`../views/common/SystemError`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-initial-system-error`,
		title: `InitialPageSystemError`,
		icon: null,
		path: HORIZON_ROUTES.INITIAL_SYSTEM_ERROR,
		load: () => import(`../views/common/InitialSystemError`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.ERROR_PAGES)
	},
	{
		name: `horizon-tax-certificate-service-error`,
		title: `TaxCertificateServiceError`,
		icon: null,
		path: HORIZON_ROUTES.TAX_CERTIFICATE_SERVICE_ERROR,
		load: () => import(`../views/taxCertificate/TaxCertificateServiceError`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-debi-check-success`,
		title: `DebiCheckSuccess`,
		icon: null,
		path: HORIZON_ROUTES.DEBICHECK_SUCCESS,
		load: () => import(`../views/quickTransactions/DebiCheckSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-debi-check-failure`,
		title: `DebiCheckFailed`,
		icon: null,
		path: HORIZON_ROUTES.DEBICHECK_FAILED,
		load: () => import(`../views/quickTransactions/DebiCheckFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-debi-check-service-error`,
		title: `DebiCheckServiceError`,
		icon: null,
		path: HORIZON_ROUTES.DEBICHECK_SERVICE_ERROR,
		load: () => import(`../views/quickTransactions/DebiCheckServiceError`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-savings-account-landing-page`,
		title: `SavingsAccount`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_ACCOUNT,
		load: () => import(`../views/savingsAccount/SavingsAccountLandingPage`),
		guard: () => HorizonRouter._guardNonInsureProductPagesForInsureRole(),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `card-limit-update-success`,
		title: `CardLimitUpdateSuccess`,
		icon: null,
		path: HORIZON_ROUTES.CARDS_LIMIT_UPDATE_SUCCESS,
		load: () => import(`../views/updateCardLimits/CardLimitUpdateSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `card-limit-update-failure`,
		title: `CardLimitUpdateFailed`,
		icon: null,
		path: HORIZON_ROUTES.CARDS_LIMIT_UPDATE_FAILED,
		load: () => import(`../views/updateCardLimits/CardLimitUpdateFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-proof-of-account-success`,
		title: `ProofOfAccountSuccess`,
		icon: null,
		path: HORIZON_ROUTES.PROOF_OF_ACCOUNT_SUCCESS,
		load: () => import(`../views/quickTransactions/ProofOfAccountSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-proof-of-account-failure`,
		title: `ProofOfAccountFailed`,
		icon: null,
		path: HORIZON_ROUTES.PROOF_OF_ACCOUNT_FAILED,
		load: () => import(`../views/quickTransactions/ProofOfAccountFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-product-information`,
		title: `ProductInfo`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_INFO,
		load: () => import(`../views/product/ProductInformation`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-statements-success`,
		title: `StatementSuccessful`,
		icon: null,
		path: HORIZON_ROUTES.STATEMENTS_SUCCESSFUL,
		load: () => import(`../views/statements/StatementsSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-statements-failure`,
		title: `StatementUnsuccessful`,
		icon: null,
		path: HORIZON_ROUTES.STATEMENTS_UNSUCCESSFUL,
		load: () => import(`../views/statements/StatementsFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-tap-to-pay-success`,
		title: `TapToPaySuccessful`,
		icon: null,
		path: HORIZON_ROUTES.TAP_TO_PAY_SUCCESSFUL,
		load: () => import(`../views/tapToPay/TapToPaySuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-tap-to-pay-unsuccessful`,
		title: `TapToPayUnsuccessful`,
		icon: null,
		path: HORIZON_ROUTES.TAP_TO_PAY_UNSUCCESSFUL,
		load: () => import(`../views/tapToPay/TapToPayUnsuccessful`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-tax-certificate-failure`,
		title: `TaxCertificateFailure`,
		icon: null,
		path: HORIZON_ROUTES.TAX_CERTIFICATE_FAILURE,
		load: () => import(`../views/taxCertificate/TaxCertificateFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-tax-certificate-success`,
		title: `TaxCertificateSuccess`,
		icon: null,
		path: HORIZON_ROUTES.TAX_CERTIFICATE_SUCCESSFUL,
		load: () => import(`../views/taxCertificate/TaxCertificateSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-automatic-savings-failure`,
		title: `AutomaticSavingsFailed`,
		icon: null,
		path: HORIZON_ROUTES.AUTOMATIC_SAVINGS_FAILED,
		load: () => import(`../views/liveBetter/AutomaticSavingsFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-automatic-savings-success`,
		title: `AutomaticSavingsSuccessful`,
		icon: null,
		path: HORIZON_ROUTES.AUTOMATIC_SAVINGS_SUCCESS,
		load: () => import(`../views/liveBetter/AutomaticSavingsSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-live-better`,
		title: `LiveBetter`,
		icon: null,
		path: HORIZON_ROUTES.LIVE_BETTER,
		load: () => import(`../views/liveBetter/LiveBetter`),
		guard: () => HorizonRouter._guardNonInsureProductPagesForInsureRole(),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-lbb-service-unavailable`,
		title: `LBBServiceUnavailable`,
		icon: null,
		path: HORIZON_ROUTES.LIVE_BETTER_SYSTEM_ERROR,
		load: () => import(`../views/liveBetter/LBBServiceUnavailable`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-credit-account`,
		title: `CreditAccount`,
		icon: null,
		path: HORIZON_ROUTES.CREDIT_ACCOUNT,
		load: () => import(`../views/credit/CreditAccount`),
		guard: () => HorizonRouter._guardNonInsureProductPagesForInsureRole(),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-credit-statements-success`,
		title: `CreditStatementsSuccess`,
		icon: null,
		path: HORIZON_ROUTES.CREDIT_STATEMENTS_SUCCESS,
		load: () => import(`../views/statements/CreditStatementSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-credit-statements-unsuccess`,
		title: `CreditStatementsUnsuccess`,
		icon: null,
		path: HORIZON_ROUTES.CREDIT_STATEMENTS_FAILURE,
		load: () => import(`../views/statements/CreditStatementUnsuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-settlement-quote-success`,
		title: `SettlementQuoteSuccess`,
		icon: null,
		path: HORIZON_ROUTES.SETTLEMENT_QUOTE_SUCCESS,
		load: () => import(`../views/credit/SettlementQuoteSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-settlement-quote-failure`,
		title: `SettlementQuoteFailure`,
		icon: null,
		path: HORIZON_ROUTES.SETTLEMENT_QUOTE_FAILURE,
		load: () => import(`../views/credit/SettlementQuoteFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-settlement-quote-outcome`,
		title: `SettlementQuoteOutcome`,
		icon: null,
		path: HORIZON_ROUTES.SETTLEMENT_QUOTE_OUTCOME,
		load: () => import(`../views/credit/SettlementQuoteOutcome`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	}, ,
	{
		name: `horizon-email-confirmation-outcome`,
		title: `EmailConfirmationOutcome`,
		icon: null,
		path: HORIZON_ROUTES.EMAIL_CONFIRMATION_OUTCOME,
		load: () => import(`../views/credit/EmailConfirmationOutcome`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-settle-and-close-success`,
		title: `SettleAndCloseSuccess`,
		icon: null,
		path: HORIZON_ROUTES.SETTLE_AND_CLOSE_SUCCESS,
		load: () => import(`../views/credit/SettleAndCloseSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-settle-and-close-failure`,
		title: `SettleAndCloseFailure`,
		icon: null,
		path: HORIZON_ROUTES.SETTLE_AND_CLOSE_FAILURE,
		load: () => import(`../views/credit/SettleAndCloseFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-savings-plan`,
		title: `SavingsPlan`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN,
		load: () => import(`../views/savingsPlan/SavingsPlan`),
		guard: () => HorizonRouter._guardNonInsureProductPagesForInsureRole(),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-budget-facility-success`,
		title: `BudgetFacilitySuccess`,
		icon: null,
		path: HORIZON_ROUTES.BUDGET_FACILITY_SUCCESS,
		load: () => import(`../views/credit/BudgetFacilitySuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-budget-facility-failure`,
		title: `BudgetFacilityFailure`,
		icon: null,
		path: HORIZON_ROUTES.BUDGET_FACILITY_FAILURE,
		load: () => import(`../views/credit/BudgetFacilityFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-proof-of-payment-success`,
		title: `ProofOfPaymentSuccess`,
		icon: null,
		path: HORIZON_ROUTES.PROOF_OF_PAYMENT_SUCCESS,
		load: () => import(`../views/credit/ProofOfPaymentSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-proof-of-payment-failure`,
		title: `ProofOfPaymentFailure`,
		icon: null,
		path: HORIZON_ROUTES.PROOF_OF_PAYMENT_FAILURE,
		load: () => import(`../views/credit/ProofOfPaymentFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-payshap-proof-of-payment-outcome`,
		title: `PayshapProofOfPaymentOutcome`,
		icon: null,
		path: HORIZON_ROUTES.PAYSHAP_PROOF_OF_PAYMENT_OUTCOME,
		load: () => import(`../views/quickTransactions/PayshapProofOfPaymentOutcome`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-paid-up-letter-success`,
		title: `PaidUpLetterSuccess`,
		icon: null,
		path: HORIZON_ROUTES.PAID_UP_LETTER_SUCCESS,
		load: () => import(`../views/quickTransactions/PaidUpLetterSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-paid-up-letter-failure`,
		title: `PaidUpLetterFailure`,
		icon: null,
		path: HORIZON_ROUTES.PAID_UP_LETTER_FAILURE,
		load: () => import(`../views/quickTransactions/PaidUpLetterFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-unlock-fixed-term-savings-plan-success`,
		title: `FixedTermSavingsPlanSuccess`,
		icon: null,
		path: HORIZON_ROUTES.UNLOCK_FTSP_SUCCESS,
		load: () => import(`../views/savingsPlan/UnlockFixedTermSavingsPlanSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-unlock-fixed-term-savings-plan-failure`,
		title: `FixedTermSavingsPlanFailure`,
		icon: null,
		path: HORIZON_ROUTES.UNLOCK_FTSP_FAILURE,
		load: () => import(`../views/savingsPlan/UnlockFixedTermSavingsPlanFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-create-incident-error`,
		title: `CreateIncidentError`,
		icon: null,
		path: HORIZON_ROUTES.CREATE_INCIDENT_ERROR,
		load: () => import(`../views/waitingForCall/CreateIncidentError`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.ERROR_PAGES)
	},
	{
		name: `horizon-widget-host`,
		title: `HorizonWidgetHost`,
		icon: null,
		path: `${HORIZON_ROUTES.WIDGET_HOST}/:widgetId`,
		load: () => import(`../views/common/HorizonWidgetHost`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-widget-service-unavailable`,
		title: `WidgetServiceUnavailable`,
		icon: null,
		path: `${HORIZON_ROUTES.WIDGET_HOST_UNAVAILABLE}`,
		load: () => import(`../views/common/WidgetServiceUnavailable`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-widget-not-found`,
		title: `WidgetNotFoundPage`,
		icon: null,
		path: HORIZON_ROUTES.WIDGET_HOST_NOTFOUND,
		load: () => import(`../views/common/WidgetNotFound`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-view-profile-details`,
		title: `ProfileDetails`,
		icon: null,
		path: HORIZON_ROUTES.VIEW_PROFILE,
		load: () => import(`../views/common/ViewProfileDetails`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-send-cash-success`,
		title: `SendCashSuccess`,
		icon: null,
		path: HORIZON_ROUTES.SEND_CASH_SUCCESS,
		load: () => import(`../views/sendCash/SendCashSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-send-cash-failure`,
		title: `SendCashFailure`,
		icon: null,
		path: HORIZON_ROUTES.SEND_CASH_FAILURE,
		load: () => import(`../views/sendCash/SendCashFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-view-unavailable-for-role`,
		title: `UnableAvailableForRole`,
		icon: null,
		path: HORIZON_ROUTES.VIEW_AVAILABLE_FOR_ROLE,
		load: () => import(`../views/common/UnableAvailableForRole`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-access-channels-outcome`,
		title: `HorizonAccessChannelsOutcome`,
		icon: null,
		path: HORIZON_ROUTES.ACCESS_CHANNELS_OUTCOME,
		load: () => import(`../views/stopCard/AccessChannelsOutcome`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	}
];
