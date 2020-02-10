import { Shell, css, html } from 'platform/elements';
import { ExecutionContext } from 'platform/ExecutionContext';
import { Logger } from 'platform/Logger';
import { Platform } from 'platform/Platform';
import { SecurityContext } from 'platform/SecurityContext';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';
import { EventAggregator } from 'platform/EventAggregator';


// Import all UI Components. 
import 'platform/components';
import 'platform/components/navigation/AppRouter';

//import utils to tranform user role
import './utils/TransformAgentRole';
/**
 * Physical entry-point of the application, based on a platform-provided base class.
 */
export class AppShell extends Shell {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		// The below method call serves two functions:
		//   1. Initialise the runtime configuration.
		//   2. Initialise the authentication flow, which includes obtaining an identity token from one of the trusted IDPs. 
		// 
		// NOTE: This method call is only required once within the context of the application, but as early as possible.
		Platform.init();

		// Callback for user authentication success.
		Platform.onUserLoginSuccess(() => this._onUserLoginSuccess());

		// Callback for user authentication error.
		Platform.onUserLoginError(() => this._onUserLoginError());

		// Callback for user authentication logout.
		Platform.onUserLoggedOut(() => this._onUserLoggedOut());

		// Platform Non-UI Components.
		this.securityContext = SecurityContext.getInstance();
		this.executionContext = ExecutionContext.getInstance();
		this.logger = Logger.getInstance();
		this.router = Router.getInstance();

		// URL Routing Table
		this.router.addRoute({
			name: `landing-page`,
			title: `LandingPageView`,
			icon: null,
			path: `/landingpage`,
			load: () => import(`./views/LandingPage/LandingPage`),
			isDefault: true,
			isFallback: true,
		});

		this.router.addRoute({
			name: `product-savings-account`,
			title: `SavingsAccountProductView`,
			icon: null,
			path: `/product/savings-account`,
			load: () => import(`./views/LandingPage/SavingsAccountProduct`),
		})

		this.router.addRoute({
			name: `product-savings-plan`,
			title: `SavingsPlanProductView`,
			icon: null,
			path: `/product/savings-plan`,
			load: () => import(`./views/LandingPage/SavingsPlanProduct/SavingsPlanProduct`),
		})

		this.router.addRoute({
			name: `product-flexible-savings-plan`,
			title: `FlexibleSavingsPlanProductView`,
			icon: null,
			path: `/product/savings-plan/flexible`,
			load: () => import(`./views/LandingPage/SavingsPlanProduct/FlexibleSavingsPlanProduct`),
		})

		this.router.addRoute({
			name: `product-fixed-term-savings-plan`,
			title: `FixedTermSavingsPlanProductView`,
			icon: null,
			path: `/product/savings-plan/fixed-term`,
			load: () => import(`./views/LandingPage/SavingsPlanProduct/FixedTermSavingsProduct`),
		})

		this.router.addRoute({
			name: `product-taxfree-savings-plan`,
			title: `TaxFreeSavingsPlanProductView`,
			icon: null,
			path: `/product/savings-plan/tax-free`,
			load: () => import(`./views/LandingPage/SavingsPlanProduct/TaxFreeSavingsProduct`),
		})

		this.router.addRoute({
			name: `product-insure`,
			title: `InsureProductView`,
			icon: null,
			path: `/product/insure/`,
			//load: () => import(`./views/InsureProduct`),
		})

		this.router.addRoute({
			name: `product-credit`,
			title: `CreditProductView`,
			icon: null,
			path: `/product/credit`,
			load: () => import(`./views/LandingPage/CreditProduct`),
		})

		this.router.addRoute({
			name: `confirm-caller-details`,
			title: `ConfirmCallerDetailsView`,
			icon: null,
			path: `/confirm-caller-details/`,
			//load: () => import(`./views/ConfirmCallerDetails`),
		})



		//Event Aggregator
		EventAggregator
			.getInstance()
			.subscribe(`platform-navigation-context-updated`, () => this.onNavigationContextUpdated());

		// Property defaults.
		this.isBusy = true;
		this.isSuccess = false;
		this.isError = false;
		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
		this.platformVersion = null;
		this.applicationName = null;
		this.applicationVersion = null;
		this.landingPageView = true;
		this.callWaitingView = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			isError: { type: Boolean },
			isSuccess: { type: Boolean },
			securityContext: { type: SecurityContext },
			roles: { type: Array },
			platformVersion: { type: String },
			applicationName: { type: String },
			applicationVersion: { type: String },
			landingPageView: { type: String },

		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onUserLoginSuccess() {

		// Put your logic here to handle allow the

		this.isBusy = false;
		this.roles = this.securityContext.roles != null && Array.isArray(this.securityContext.roles) ? this.securityContext.roles.join(`, `) : 'n/a';
		this.platformVersion = await this.executionContext.platformVersion;
		this.applicationName = await this.executionContext.applicationName;
		this.applicationVersion = await this.executionContext.applicationVersion;
		this.clientIp = this.executionContext.clientIp;
	}

	_onUserLoginError() {
		// Put your logic here to handle a login error.
	}

	_onUserLoggedOut() {
		// Put your logic here, e.g. to inform the user that he / she
		// is now logged out and that the application will now perform a hard reload.
	}

	_openCatalogue() {
		window.open(`https://web-component-catalogue.int.capinet`, `_blank`);
	}

	_openConfluenceDocs() {
		window.open(`https://confluence.int.capinet:8443/display/CPT/Omni-channel+Web+Platform`, `_blank`);
	}

	_openShellDocs() {
		window.open(`https://platform/elements.polymer-project.org/guide`, `_blank`);
	}

	async _logViaChannelService() {

		try {
			this.isBusy = true;
			await this.logger.info(`Hello from [${this.applicationName}]`, `AppShell._logViaChannelService`);
			this._toggleSuccess();
		} catch (error) {
			this._toggleError();
		} finally {
			this.isBusy = false;
		}
	}

	_toggleSuccess() {
		this.isSuccess = !this.isSuccess;
	}

	_toggleError() {
		this.isError = !this.isError;
	}

	navigate(path) {
		this.router.navigateByPath(`/${path}`);
	}

	onNavigationContextUpdated() {
		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};
	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------	

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				.content{
					width:1913px;
					height:936.5px;
				}
				.branding-logo-white{
					height: 32px;
					width: 193px;
				}

				.title-bar{
					height: 72px;
					width: 1913px;
					// background-color: #009DE0;
					// background: linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%), linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%);
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2);
					grid-template-columns: 1fr;
					grid-row-gap: 8px;
				}
			
				.status-bar{
					height: 60px;
					width: 1913px;
				}

				capitec-content-box{
					background: gainsboro;
					width:1913px;
					height:760px;
				}
				.userrole{
					color: #003652;
				}

			`
		];
	}

	/**
	 * Core rendering method as expected by the platform for a Shell instance.
	 *
	 * @returns {html} HTML content for the component.
	 */
	renderShell() {
		return html`
            ${this.renderLoadingIndicator()}
            ${this.renderContent()}
            ${this.renderSuccessModel()}
            ${this.renderErrorModal()}
        `;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}

		return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	renderContent() {

		if (this.isBusy) {
			return html``;
		}

		return html`
         
                <capitec-card class="content">

					<capitec-title-bar class="title-bar" type="clear">
						<capitec-icon class="branding-logo-white" size="medium" icon="capitec-logo"></capitec-icon>
						<capitec-spacer></capitec-spacer>
						<div class="userrole">
							<capitec-label label="${this.securityContext.fullName}"></capitec-label>
							<capitec-label label="${TransformAgentRole(this.roles)}"></capitec-label>
						</div>
					</capitec-title-bar>

                    <capitec-content-box >
						<capitec-app-router></capitec-app-router>
                    </capitec-content-box>
	
					<capitec-status-bar class="status-bar" status="success" label=""></capitec-status-bar>

                </capitec-card>
        `;
	}

	renderSuccessModel() {

		if (!this.isSuccess) {
			return html``;
		}

		return html`
            <capitec-modal type="result" result="success" header="Success">
				<capitec-label slot="body" label="Logged via channel service."></capitec-label>
                <capitec-button slot="footer" type="clear" label="Ok" @click="${this._toggleSuccess}"></capitec-button>
            </capitec-modal>
        `;
	}

	renderErrorModal() {

		if (!this.isError) {
			return html``;
		}

		return html`
            <capitec-modal type="result" result="error" header="Error">
				<capitec-label slot="body" label="Unable to log via channel service."></capitec-label>
                <capitec-button slot="footer" type="clear" label="Ok" @click="${this._toggleError}"></capitec-button>
            </capitec-modal>
        `;
	}
}

// Creation of custom element, must be called "app-shell" by convention, as expected by the platform.
window.customElements.define(`app-shell`, AppShell);