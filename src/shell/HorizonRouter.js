import { HORIZON_VIEW_SET, HorizonViewManager } from './HorizonViewManager';
import { HorizonStore } from 'app/store/HorizonStore';
import { Router } from 'platform/Router';

/**
 * The Horizon URL Schema. 
 */
const HORIZON_ROUTES = Object.freeze({
	LANDING_PAGE: `/landingPage`,
	SAVINGS_ACCOUNT_PRODUCT_PAGE: `/product/savings-account`,
	SAVINGS_PLAN_PRODUCT_PAGE: `/product/savings-plan`,
	SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE: `/product/savings-plan/flexible`,
	SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE: `/product/savings-plan/fixed-term`,
	SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE: `/product/savings-plan/tax-free`,
	PRODUCT_INSURE: `/product/insure`,
	PRODUCT_CREDIT: `/product/credit`,
	CARD_STOP_VERIFIED_PAGE: `/card-stop/verified`,
	CARD_STOP_UNVERIFIED_PAGE: `/card-stop/unverified`,
	CARD_STOP_SUCCESS_PAGE: `/card-stop/success`,
	CARD_STOP_FAILURE_PAGE: `/card-stop/failed`,
	INSURE_PROSPECTIVE_CLIENT: `/insure/prospective`,
	INSURE_EXISTING_CLIENT: `/insure/existing-client`,
	TRANSACT_FAVOURITES: `/transact/favourites`,
	XDS_VERIFICATION_FAILED: `/error/xds-verification-failed`,
	ITA_VERIFICATION_FAILED: `/error/ita-verification-failed`,
	SYSTEM_ERROR: `/error/system-error`,
	INITIAL_SYSTEM_ERROR: `/error/initial-system-error`,
	DEBICHECK_SUCCESS: `/success/debicheck`,
	SAVINGS_ACCOUNT: `/transact/savings-account`,
	STATEMENTS_SUCCESSFUL: `/views/Statements/StatementsSuccess`,
	STATEMENTS_UNSUCCESSFUL: `/views/Statements/StatementsUnsuccess`
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
		this.verificationStatus = ``;
		this.callStatus = ``;
		this.stateSub = HorizonStore.getInstance().stateChanged.subscribe(state => this._updateState(state));
		this.router = Router.getInstance();
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

	_getCurrentRoute() {
		return this.router.currentRoute;
	}

	// --------------------
	// Navigation functions  
	// --------------------
	navigateToWaitingForCall() {
		this.router.navigateByPath(HORIZON_ROUTES.LANDING_PAGE);
	}

	navigateToSavingsAccountProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_ACCOUNT_PRODUCT_PAGE);
	}

	navigateToSavingsPlanProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_PAGE);
	}

	navigateToFlexibleSavingsPlanProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE);
	}

	navigateToFixedTermSavingsProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE);
	}

	navigateToTaxFreeSavingsProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE);
	}

	navigateToInsureProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_INSURE);
	}

	navigateToCreditProduct() {
		this.router.navigateByPath(HORIZON_ROUTES.PRODUCT_CREDIT);
	}

	navigateToStopCard() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_UNVERIFIED_PAGE);
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

	navigateToQuickTransactionFavourites() {
		this.router.navigateByPath(`${HORIZON_ROUTES.TRANSACT_FAVOURITES}`);
	}

	navigateToXdsVerificationFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.XDS_VERIFICATION_FAILED}`);
	}

	navigateToItaVerificationFailed() {
		this.router.navigateByPath(`${HORIZON_ROUTES.ITA_VERIFICATION_FAILED}`);
	}

	navigateToSystemError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SYSTEM_ERROR}`);
	}

	navigateToInitialSystemError() {
		this.router.navigateByPath(`${HORIZON_ROUTES.INITIAL_SYSTEM_ERROR}`);
	}

	navigateToDebiCheckSuccess() {
		this.router.navigateByPath(`${HORIZON_ROUTES.DEBICHECK_SUCCESS}`);
	}

	navigateToStatementSuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.STATEMENTS_SUCCESSFUL}`);
	}

	navigateToStatementUnsuccessful() {
		this.router.navigateByPath(`${HORIZON_ROUTES.STATEMENTS_UNSUCCESSFUL}`);
	}

	navigateToLandingPage(ivrOption, hasInsuranceProducts) {

		const stopCard = () => this.navigateToStopCard();
		const transact = () => this.navigateToQuickTransactionFavourites();
		const insure = hasInsuranceProducts ? () => this.navigateToInsureExistingClient() : () => this.navigateToInsureProspectiveClient();
		const savings = () => this.navigateToSavingsAccount();

		const landingPageFunc = {
			StopCard: stopCard,
			Transact: transact,
			Insure: insure,
			Savings: savings
		}[ivrOption]();
	};

	navigateToReturnPage(displayMode) {
		const horizonStore = HorizonStore.getInstance();
		const state = horizonStore.recoverState();
		state.returnTo.mode = displayMode;
		horizonStore.saveState(state);

		this.router.navigateByPath(state.returnTo.route);
	}

	navigateToSavingsAccount() {
		this.router.navigateByPath(`${HORIZON_ROUTES.SAVINGS_ACCOUNT}`);
	}

	_productLandingPagesActive() {
		return this.horizonViewManager.getCurrentView() === HORIZON_VIEW_SET.LANDING_PAGES && this.navigationContext.current !== undefined;
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

			if (isOnInitialPageSet && routingInfo.callStatus === `CALL-IN-PROGRESS`) {
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
	{
		name: `horizon-flexible-savings-plan-product`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-fixed-term-savings-product`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FixedTermSavingsProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
	{
		name: `horizon-tax-free-savings-product`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/TaxFreeSavingsProduct`),
		guard: () => HorizonRouter._guard(`productPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.LANDING_PAGES)
	},
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
		name: `horizon-stop-card-landing-page`,
		title: `ClientProfile`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_UNVERIFIED_PAGE,
		load: () => import(`../views/stopCard/StopCardLandingPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.UNVERIFIED_PAGES)
	},
	{
		name: `horizon-stop-card-success`,
		title: `StopCard`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_SUCCESS_PAGE,
		load: () => import(`../views/stopCard/StopCardSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-stop-card-failure`,
		title: `StopCardFail`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_FAILURE_PAGE,
		load: () => import(`../views/stopCard/StopCardFailure`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
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
	{
		name: `horizon-prospective-client`,
		title: `Insure`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_PROSPECTIVE_CLIENT,
		load: () => import(`../views/insure/ProspectiveClient`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layoutByVerifictionMode`)
	},
	{
		name: `horizon-favourites`,
		title: `Favourites`,
		icon: null,
		path: HORIZON_ROUTES.TRANSACT_FAVOURITES,
		load: () => import(`../views/quickTransactions/Favourites`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
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
		name: `horizon-debi-check-success`,
		title: `DebiCheck`,
		icon: null,
		path: HORIZON_ROUTES.DEBICHECK_SUCCESS,
		load: () => import(`../views/quickTransactions/DebiCheckSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-savings-account-landing-page`,
		title: `SavingsAccount`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_ACCOUNT,
		load: () => import(`../views/savingsAccount/SavingsAccountLandingPage`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-statements-success`,
		title: `StatementSuccessful`,
		icon: null,
		path: HORIZON_ROUTES.STATEMENTS_SUCCESSFUL,
		load: () => import(`../views/Statements/StatementsSuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	},
	{
		name: `horizon-statements-unsuccess`,
		title: `StatementUnsuccessful`,
		icon: null,
		path: HORIZON_ROUTES.STATEMENTS_UNSUCCESSFUL,
		load: () => import(`../views/Statements/StatementsUnsuccess`),
		onPreNavigate: () => HorizonRouter._preNavigate(`layout`, HORIZON_VIEW_SET.VERIFIED_PAGES)
	}
];