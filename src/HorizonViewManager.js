export const HORIZON_VIEWS = {
	LANDING_PAGE: 'LANDING PAGE',
	CARD_STOP: `CARD STOP`
};

export class HorizonViewManager {

	static getInstance() {
		return this.instance || (this.instance = new HorizonViewManager());
	}

	constructor() {
		this.transitionTo = HORIZON_VIEWS.LANDING_PAGE;
	}

	getNextView() {
		return this.transitionTo;
	}

	transitionToView(nextView) {
		this.transitionTo = nextView;
	}
}
