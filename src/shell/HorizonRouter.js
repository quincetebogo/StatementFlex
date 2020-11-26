import { HORIZON_VIEW_SET, HorizonViewManager } from './HorizonViewManager';
import { HorizonStore } from 'app/store/HorizonStore';
import { Router } from 'platform/Router';

/**
 * The Horizon URL Schema. 
 */
const HORIZON_ROUTES = {
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
	SYSTEM_ERROR: `/error/system-error`
};


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
	}

	/**
	 * Extracts information from state used by guard functions in the routing table
	 *
	 * @returns {Object} An object containing information recovered from state for the guard functions in the routing table.
	 * @memberof HorizonRouter
	 */
	getRoutingInfo() {
		return {
			verificationStatus: this.verificationStatus
		};
	}

	// --------------------
	// Navigation functions  
	// --------------------
	navigateToLandingPage() {
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
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		},
		isDefault: true,
		isFallback: true
	},
	{
		name: `horizon-savings-account-product`,
		title: `SavingsAccountProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_ACCOUNT_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsAccountProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-savings-plan-product`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/SavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-flexible-savings-plan-product`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-fixed-term-savings-product`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FixedTermSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-tax-free-savings-product`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/TaxFreeSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-insure-product`,
		title: `InsureProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_INSURE,
		load: () => import(`../views/product/InsureProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `horizon-credit-product`,
		title: `CreditProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_CREDIT,
		load: () => import(`../views/product/CreditProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
		}
	},
	{
		name: `client-profile`,
		title: `ClientProfile`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_UNVERIFIED_PAGE,
		load: () => import(`../views/stopCard/ClientProfile`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `horizon-stop-card-success`,
		title: `StopCard`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_SUCCESS_PAGE,
		load: () => import(`../views/stopCard/StopCardSuccess`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
		}
	},
	{
		name: `horizon-stop-card-failure`,
		title: `StopCardFail`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_FAILURE_PAGE,
		load: () => import(`../views/stopCard/StopCardFailure`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
		}
	},
	{
		name: `horizon-existing-client`,
		title: `InsureVerifiedExistingClientView`,
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
		
		onPreNavigate: () => {
			const routingInfo = HorizonRouter.getInstance().getRoutingInfo();
			switch (routingInfo.verificationStatus) {
				case `verified`:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
					break;
				case `unverified`:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
					break;
				case `3rdparty`:
				default:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
					break;
			}
		}
	},
	{
		name: `horizon-prospective-client`,
		title: `InsureProductVerifiedProspective`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_PROSPECTIVE_CLIENT,
		load: () => import(`../views/insure/ProspectiveClient`),
		onPreNavigate: () => {
			const routingInfo = HorizonRouter.getInstance().getRoutingInfo();
			switch (routingInfo.verificationStatus) {
				case `verified`:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
					break;
				case `unverified`:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
					break;
				case `non-client`:
				default:
					HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
					break;
			}
		}
	},
	{
		name: `horizon-favourites`,
		title: `Favourites`,
		icon: null,
		path: HORIZON_ROUTES.TRANSACT_FAVOURITES,
		load: () => import(`../views/quickTransactions/Favourites`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
		}
	},
	{
		name: `horizon-xds-verification-failed`,
		title: `XdsVerificationFailed`,
		icon: null,
		path: HORIZON_ROUTES.XDS_VERIFICATION_FAILED,
		load: () => import(`../views/common/XdsVerificationFailed`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `horizon-ita-verification-failed`,
		title: `ItaVerificationFailed`,
		icon: null,
		path: HORIZON_ROUTES.ITA_VERIFICATION_FAILED,
		load: () => import(`../views/common/ItaVerificationFailed`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `horizon-system-error`,
		title: `SystemError`,
		icon: null,
		path: HORIZON_ROUTES.SYSTEM_ERROR,
		load: () => import(`../views/common/SystemError`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	}

];