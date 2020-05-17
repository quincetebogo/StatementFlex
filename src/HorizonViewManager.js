/*
	Horizon View Manager
	
	RESPONSIBILITY: 
	
	The Horizon Display has some areas into which different shell components may 
	be loaded depending on the current view.

	These areas are the Left Display Bar area, the Right Display Bar area and 
	an optional additional action bar/menu bar area.
	
	The View is the central area of the Horizon display. The View is switched
	using the the platform provided AppRouter.

	This class switches Shell Components based on the current view. It is not
	always necessary to switch Shell Components as different views may employ
	the same set of Shell Components.

	A View is one to one with an URL/Route Switchable shell components are not. 
	A shell component may be employed across a number of views.

	The onPreNavigate event in the routing table is used to set the current 
	view. The AppShell component uses the View Manager to conditionally render
	shell components based on the view set in the OnPreNavigate event.
	
*/
import { html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

export const HORIZON_VIEWS = {
	LANDING_PAGE: 'LANDING PAGE',
	CARD_STOP: `CARD STOP`,
};

export class HorizonViewManager {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonViewManager());
	}

	constructor() {
		this.currentView = HORIZON_VIEWS.LANDING_PAGE;
		this.eventAggregator = EventAggregator.getInstance();
		this.state = null;

		this.shellComponents = [
			{
				load: () => import(`./components/shell/HorizonActionBar`),
			},
			{
				load: () => import(`./components/landingPage/LandingPageWelcome`),
			},
			{
				load: () => import(`./components/landingPage/LandingPageMarketing`),
			},
			{
				load: () => import(`./views/ClientProfile/AccessComponent`),
			},
			{
				load: () => import(`./views/ClientProfile/ClientProfileDetails`),
			},
		];
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getCurrentView() {
		return this.currentView;
	}

	/// Usually set from the OnPreNavigate event in the routing table
	transitionToView(nextView) {
		this.currentView = nextView;
		this._importComponents(this.currentView);
	}

	switchArea(viewSet, areaHtml) {
		if (viewSet !== this.currentView) {
			console.log('viewSet', viewSet);
			console.log('current view: ', this.currentView);
			return html``;
		}

		// this._importComponents(viewSet);

		switch (viewSet) {
			case HORIZON_VIEWS.LANDING_PAGE:
				console.log(areaHtml);
				return areaHtml;
			case HORIZON_VIEWS.CARD_STOP:
				console.log(areaHtml);
				return areaHtml;
		}
	}

	renderAdditionalTopBar(viewSet) {
		// this._importComponents(viewSet);
		return html`<horizon-actionbar></horizon-actionbar>`;
	}

	renderRightBar(viewSet) {
		// this._importComponents(viewSet);

		switch (viewSet) {
			case HORIZON_VIEWS.LANDING_PAGE:
				return html`<landingpage-marketing></landingpage-marketing>`;
			case HORIZON_VIEWS.CARD_STOP:
				return html`<access-component></access-component>`;
			default:
				return html``;
		}
	}

	/// Used from the Landing Page & Product Pages to update the toolbar and the 
	/// welcome box on the left hand user interface. 
	UpdateLoggedInUser(userData) {
		if (this.currentView === HORIZON_VIEWS.LANDING_PAGE) {
			if (userData != undefined && userData != null) {

				// We may replace the event publishing mechanism below with a registered callback

				this.eventAggregator.publish('horizon-top-bar-data', {
					agentFullName: userData.agentFullName,
					employeeId: userData.employeeId
				})
			}
			else {

				// We may replace the event publishing mechanism below with a registered callback

				this.eventAggregator.publish('horizon-top-bar-data', { agentFullName: `unknown`, employeeId: `unknown` });
				this.fullname = `unknown`;
			}
		}
	}

	// Before navigating to another view, save any state information the next view may require 
	// by calling this method (replace with Redux or something later)
	saveState(stateToSave) {
		this.state = stateToSave;
	}

	// Recover state information saved by the previous view.
	// Recovering clears the saved state. If the new view wishes to 
	// save state it must do so explicity.
	recoverState() {
		// let tmpState = this.state;
		// this.state = null;
		return this.state;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_importComponents(viewSet) {
		switch (viewSet) {
			case HORIZON_VIEWS.LANDING_PAGE:
				this.shellComponents[1].load(); // Welcome Bar
				this.shellComponents[2].load(); // Marketing Bar
				break;
			case HORIZON_VIEWS.CARD_STOP:
				this.shellComponents[0].load(); // Action Bar
				this.shellComponents[3].load(); // Access Component Bar
				this.shellComponents[4].load(); // Client Profile Details Bar
				break;
			default:
				break;
		}
	}
}
