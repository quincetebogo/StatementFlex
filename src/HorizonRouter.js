import { Router } from 'platform/Router';

export class HorizonRouter {

	constructor() {
		this.router = Router.getInstance();
	}

	static getInstance() {
		return this.instance || (this.instance = new AppRouter());
	}

	configureRouting(routeConfigs) {
		for (const route of routeConfigs) {
			this.router.addRoute(route);
		}
	}

	navigateToLandingPage() {
		this.router.navigateByPath(`/landingPage`);
	}

	navigateToCreditProduct() {
		this.router.navigateByPath(`/product/credit`);
	}

	navigateToCallWait(docType, id) {
		this.router.navigateByPath(`/callWaiting`);
	}
	navigateToCardStopSummarySuccess() {
		this.router.navigateByPath(`/stop/card`);
	}
}