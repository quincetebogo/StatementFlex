import { Router } from 'platform/Router';

export class AppRouter {

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

	navigateToCallWait(docType, id) {
		this.router.navigateByPath(`/callWaiting`);
	}
}