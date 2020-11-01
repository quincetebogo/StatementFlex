import { HORIZON_VIEW_SET, HorizonViewManager } from './HorizonViewManager';
import { Router } from 'platform/Router';

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
	INSURE_NONCLIENT: `/insure/non-client`,
	INSURE_VERIFIED_PROSPECTIVE: `/insure/prospective-verified`,
	INSURE_UNVERIFIED_PROSPECTIVE: `/insure/prospective-unverified`,
	INSURE_VERIFIED_EXISTING_CLIENT: `/insure/existing-client-verified`,
	INSURE_UNVERIFIED_EXISTING_CLIENT: `/insure/existing-client-unverified`,
	INSURE_THIRD_PARTY_CLIENT: `/insure/third-party`,
	TRANSACT_FAVOURITES_VERIFIED_PAGE: `/transact/favourites-verified`,
	TRANSACT_FAVOURITES_UNVERIFIED_PAGE: `/transact/favourites-unverified`
};

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
		name: `horizon-product-insure-non-client`,
		title: `InsureProductNonClientView`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_NONCLIENT,
		load: () => import(`../views/insure/InsureProductNonClient`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `horizon-insure-unverified-prospective`,
		title: `InsureProductUnverifiedProspective`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_UNVERIFIED_PROSPECTIVE,
		load: () => import(`../views/insure/UnverifiedProspective`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `horizon-insure-verified-prospective`,
		title: `InsureProductVerifiedProspective`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_VERIFIED_PROSPECTIVE,
		load: () => import(`../views/insure/VerifiedProspective`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
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
		name: `insure-verified-existing-client`,
		title: `InsureVerifiedExistingClientView`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_VERIFIED_EXISTING_CLIENT,
		load: () => import(`../views/insure/VerifiedExistingClient`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
		}
	},
	{
		name: `insure-unverified-existing-client`,
		title: `InsureUnverifiedExistingClientView`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_UNVERIFIED_EXISTING_CLIENT,
		load: () => import(`../views/insure/UnverifiedExistingClient`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	},
	{
		name: `insure-third-party-client`,
		title: `InsureThirdPartyClientView`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_THIRD_PARTY_CLIENT,
		load: () => import(`../views/insure/ThirdPartyBeneficiaryClient`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEW_SET.UNVERIFIED_PAGES);
		}
	}
];

export class HorizonRouter {

	constructor() {
		this.router = Router.getInstance();
	}

	static getInstance() {
		return this.instance || (this.instance = new HorizonRouter());
	}

	configureRouting(routeConfigs) {
		for (const route of routeConfigs) {
			this.router.addRoute(route);
		}
	}

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

	navigateToInsureNonClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_NONCLIENT);
	}

	navigateToInsureVerifiedExistingClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_VERIFIED_EXISTING_CLIENT);
	}

	navigateToInsureUnverifiedExistingClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_UNVERIFIED_EXISTING_CLIENT);
	}

	navigateToInsureThirdPartyClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_THIRD_PARTY_CLIENT);
	}
}