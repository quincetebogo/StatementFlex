/*
	Horizon View Manager
	
	RESPONSIBILITY: 
	
	Switching of non-central display UI components and the facilitation of communication between
	the central view component and other UI components on the current view.
	

	REMARKS:

	The Horizon UI consists of a number of toolbars, a left display component,
	a right display component, a central (main) display and a status bar.

	The central display is switched by the Platform Router. The left, right and additional toolbar 
	also need to be switched from time to time.

	There is a one to one mapping between the central display and a URL route.
	There is a many to one mapping between an URL and the left, right, and toolbar components.

	This view manager handles that many to one mapping. The OnPreNavigate event in the routing
	table is used to set a view state in this class. Multiple routes can share a common view state.

	This class uses the view state to guide the switching of UI components that map to the given
	state.
*/
export const HORIZON_VIEWS = {
	LANDING_PAGE: 'LANDING PAGE',
	CARD_STOP: `CARD STOP`
};

export class HorizonViewManager {

	/// There can be only one!
	static getInstance() {
		return this.instance || (this.instance = new HorizonViewManager());
	}

	constructor() {
		this.transitionTo = HORIZON_VIEWS.LANDING_PAGE;
	}

	/// TODO: At the moment this is called, the view is actually current so perhaps the name needs to change
	getNextView() {
		return this.transitionTo;
	}

	/// Usually set fron the OnPreNavigate event in the routing table
	transitionToView(nextView) {
		console.log('transitioning to view', nextView);
		this.transitionTo = nextView;
	}

	/// TODO: Move rendering functions and import of non-central components into this class.
}
