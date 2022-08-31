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
import { EventAggregator } from 'platform/EventAggregator';
import { html } from 'platform/elements';

const LAYOUT_COMPONENT = {
	CALL_BAR: 0,
	WELCOME_MENU_BAR: 1,
	MARKETING_BAR: 2,
	ACCESS_BAR: 3,
	PROFILE_MENU_BAR: 4,
	AGENT_BAR: 5
};

/**
 * HORIZON_VIEW_SET
 * 
 * The Horizon View Set controls which components are displayed in the top, left and right areas of the Horizon screen.
 * The central screen component is controlled by the platform app router feature.
 * 
 * LANDING_PAGES    - This set is reserved for the call waiting landing page and the product pages that can be displayed
 *                    before a call has been accepted. As soon as a new call event is received, the Desktop Agent Service
 *                    will navigate away from product pages etc. to the call waiting landing page that will in turn process
 *                    the new call event.
 *
 * ERROR_PAGES      - Similarly to LANDING_PAGES, this set is reserved for any error pages that can be displayed while waiting
 *                    for a new call event.
 * 
 * VERIFIED_PAGES   - Pages belong to this set give full access to Horizon Features
 * 
 * UNVERIFIED_PAGES - Pages belonging to this set give restricted access to Horizon Features
 */
export const HORIZON_VIEW_SET = {
	LANDING_PAGES: new Set([LAYOUT_COMPONENT.AGENT_BAR, LAYOUT_COMPONENT.WELCOME_MENU_BAR, LAYOUT_COMPONENT.MARKETING_BAR]),
	ERROR_PAGES: new Set([LAYOUT_COMPONENT.AGENT_BAR, LAYOUT_COMPONENT.WELCOME_MENU_BAR, LAYOUT_COMPONENT.MARKETING_BAR]),
	VERIFIED_PAGES: new Set([LAYOUT_COMPONENT.CALL_BAR, LAYOUT_COMPONENT.PROFILE_MENU_BAR, LAYOUT_COMPONENT.ACCESS_BAR]),
	UNVERIFIED_PAGES: new Set([LAYOUT_COMPONENT.CALL_BAR, LAYOUT_COMPONENT.PROFILE_MENU_BAR, LAYOUT_COMPONENT.MARKETING_BAR])
};

export class HorizonViewManager {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonViewManager());
	}

	constructor() {
		this.currentView = HORIZON_VIEW_SET.LANDING_PAGES;
		this.eventAggregator = EventAggregator.getInstance();

		this.shellComponents = [
			{
				load: () => import(`../components/shell/ActionBar`)
			},
			{
				load: () => import(`../components/landingPage/WelcomeBar`)
			},
			{
				load: () => import(`../rightBar/RightBarLayout`)
			},
			{
				load: () => import(`../rightBar/RightBarLayout`)
			},
			{
				load: () => import(`../components/common/ProfileAndProductSummaryBar`)
			},
			{
				load: () => import(`../components/landingPage/TitleBar`)
			}
		];
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getCurrentView() {
		return this.currentView;
	}

	// Usually set from the OnPreNavigate event in the routing table
	transitionToView(nextView) {
		this.currentView = nextView;
		this._importComponents(this.currentView);
	}

	renderTopBar(viewSet) {
		if (viewSet.has(LAYOUT_COMPONENT.AGENT_BAR)) {
			return html`<horizon-title-bar></horizon-title-bar>`;
		} else if (viewSet.has(LAYOUT_COMPONENT.CALL_BAR)) {
			return html`<horizon-actionbar></horizon-actionbar>`;
		}

		return html``;
	}

	renderLeftBar(viewSet) {
		if (viewSet.has(LAYOUT_COMPONENT.WELCOME_MENU_BAR)) {
			return html`<horizon-welcome-bar></horizon-welcome-bar>`;
		} else if (viewSet.has(LAYOUT_COMPONENT.PROFILE_MENU_BAR)) {
			return html`<horizon-profile-and-product-summary-bar></horizon-profile-and-product-summary-bar>`;
		}

		return html``;
	}

	renderRightBar(viewSet) {
		let layout = `info-graphic`;

		if (viewSet.has(LAYOUT_COMPONENT.ACCESS_BAR)) {
			layout = `insights--and-access-channels`;
		}

		return html`<horizon-right-bar-layout layout=${layout}></horizon-right-bar-layout>`;
	}

	// Used from the Landing Page & Product Pages to update the toolbar and the 
	// welcome box on the left hand user interface. 
	UpdateLoggedInUser(userData) {
		if (this.currentView.has(LAYOUT_COMPONENT.AGENT_BAR)) {
			if (userData !== undefined && userData !== null) {

				// We may replace the event publishing mechanism below with a registered callback

				this.eventAggregator.publish(`horizon-update-title-bar`, {
					agentFullName: userData.agentFullName,
					employeeId: userData.employeeId
				});
			} else {

				// We may replace the event publishing mechanism below with a registered callback

				this.eventAggregator.publish(`horizon-update-title-bar`, { agentFullName: `unknown`, employeeId: `unknown` });
				this.fullname = `unknown`;
			}
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_importComponents(viewSet) {
		if (viewSet.has(LAYOUT_COMPONENT.WELCOME_MENU_BAR)) {
			this.shellComponents[1].load(); // Welcome Bar
		}

		if (viewSet.has(LAYOUT_COMPONENT.MARKETING_BAR)) {
			this.shellComponents[2].load(); // Marketing Bar
		}

		if (viewSet.has(LAYOUT_COMPONENT.CALL_BAR)) {
			this.shellComponents[0].load(); // Action Bar
		}

		if (viewSet.has(LAYOUT_COMPONENT.ACCESS_BAR)) {
			this.shellComponents[3].load(); // Access Component Bar
		}

		if (viewSet.has(LAYOUT_COMPONENT.PROFILE_MENU_BAR)) {
			this.shellComponents[4].load(); // Client Profile Details Bar
		}

		if (viewSet.has(LAYOUT_COMPONENT.AGENT_BAR)) {
			this.shellComponents[5].load(); // Agent/Title Bar
		}
	}
}