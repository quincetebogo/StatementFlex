import { Router } from 'platform/Router';
import { HorizonViewManager, HORIZON_VIEWS } from './HorizonViewManager';

const HORIZON_ROUTES = {
	LANDING_PAGE: `/landingPage`,
	SAVINGS_ACCOUNT_PRODUCT_PAGE: `/product/savings-account`,
	SAVINGS_PLAN_PRODUCT_PAGE: `/product/savings-plan`,
	SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE: `/product/savings-plan/flexible`,
	SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE: `/product/savings-plan/fixed-term`,
	SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE: `/product/savings-plan/tax-free`,
	PRODUCT_INSURE: `/product/insure`,
	PRODUCT_CREDIT: `/product/credit`,
	INSURE_NONCLIENT: `/insure/non-client`,
	CLIENT_PROFILE_PAGE: `/client/profile`,
	CARD_STOP_SUCCESS: `/client/profile/stoppedcards`,
	CARD_STOP_FAILURE: `/client/profile/stopcardfailed`,
};

let horizonRoutes = [];

export default horizonRoutes = [
	{
		name: `landing-page`,
		title: `LandingPageView`,
		icon: null,
		path: HORIZON_ROUTES.LANDING_PAGE,
		load: () => import(`../views/LandingPage`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
		isDefault: true,
		isFallback: true
	},
	{
		name: `product-savings-account`,
		title: `SavingsAccountProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_ACCOUNT_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsAccountProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-savings-plan`,
		title: `SavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/SavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-flexible-savings-plan`,
		title: `FlexibleSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FLEXIBLE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-fixed-term-savings-plan`,
		title: `FixedTermSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_FIXED_TERM_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/FixedTermSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-taxfree-savings-plan`,
		title: `TaxFreeSavingsPlanProductView`,
		icon: null,
		path: HORIZON_ROUTES.SAVINGS_PLAN_PRODUCT_TAX_FREE_PAGE,
		load: () => import(`../views/product/SavingsPlanProduct/TaxFreeSavingsProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-insure`,
		title: `InsureProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_INSURE,
		load: () => import(`../views/product/InsureProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-insure-non-client`,
		title: `InsureProductNonClientView`,
		icon: null,
		path: HORIZON_ROUTES.INSURE_NONCLIENT,
		load: () => import(`../views/insure/InsureProductNonClient`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `product-credit`,
		title: `CreditProductView`,
		icon: null,
		path: HORIZON_ROUTES.PRODUCT_CREDIT,
		load: () => import(`../views/product/CreditProduct`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.LANDING_PAGE)
		},
	},
	{
		name: `client-profile`,
		title: `ClientProfile`,
		icon: null,
		path: HORIZON_ROUTES.CLIENT_PROFILE_PAGE,
		load: () => import(`../views/stopCard/ClientProfile`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.CARD_STOP)
		}
	},
	{
		name: `horizon-summary-success`,
		title: `StopCard`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_SUCCESS,
		load: () => import(`../views/stopCard/StopCardSuccess`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.CARD_STOP)
		}
	},
	{
		name: `horizon-summary-failure`,
		title: `StopCardFail`,
		icon: null,
		path: HORIZON_ROUTES.CARD_STOP_FAILURE,
		load: () => import(`../views/stopCard/StopCardFailure`),
		onPreNavigate: () => {
			HorizonViewManager.getInstance().transitionToView(HORIZON_VIEWS.CARD_STOP)
		}
	}
]
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
		this.router.navigateByPath(HORIZON_ROUTES.CLIENT_PROFILE_PAGE);
	}

	navigateToStoppedCards() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_SUCCESS);
	}

	navigateToStopCardFailed() {
		this.router.navigateByPath(HORIZON_ROUTES.CARD_STOP_FAILURE);
	}

	navigateToInsureNonClient() {
		this.router.navigateByPath(HORIZON_ROUTES.INSURE_NONCLIENT);
	}
}