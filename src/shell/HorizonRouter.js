import { Router } from 'platform/Router';
import { HORIZON_ROUTES } from './HorizonRoutes'

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
}