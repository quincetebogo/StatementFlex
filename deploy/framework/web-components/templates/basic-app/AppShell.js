import { ExecutionContext, NavigationContext, Platform, Router, Security, SecurityContext } from 'platform/core';
import { Shell, css, html, ifDefined, until } from 'platform/elements';
import { AppStore } from 'app/stores/AppStore';
import 'platform/components';

/**
 * Entry-point of the application, based on a platform-provided base class.
 * 
 * For a more info, please follow this tutorial:
 * https://confluence.capitecbank.co.za:8443/x/tQLDCw
 * 
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
		Platform.onUserLoginSuccess(() => this._userLoginSuccess());

		// Callback for user authentication error.
		Platform.onUserLoginError(() => this._userLoginError());

		// Callback for user authentication logout.
		Platform.onUserLoggedOut(() => this._userLoggedOut());

		// Variables
		this._router = Router.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this._security = Security.getInstance();
		this._securityContext = SecurityContext.getInstance();
		this._executionContext = ExecutionContext.getInstance();
		this._appStore = AppStore.getInstance();
		this._menu = [
			this._router.addRoute({
				name: `view-home`,
				title: `Home`,
				icon: `material/home`,
				path: `/home`,
				load: () => import(`./views/ViewHome`),
				isDefault: true,
				isFallback: true
			}),
			{
				title: `Group`,
				icon: `material/extension`,
				items: [
					this._router.addRoute({
						name: `view-one`,
						title: `One`,
						path: `/group/one`,
						load: () => import(`./views/group/ViewOne`)
					}),
					this._router.addRoute({
						name: `view-two`,
						title: `Two`,
						path: `/group/two`,
						load: () => import(`./views/group/ViewTwo`)
					})
				]
			}
		];

		// Properties (defaults)
		this.isBusy = true;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		super.connectedCallback();

		// Subscribe to store.
		this._appStoreSub = this._appStore.stateChanged.subscribe(state => {

			if (!state) {
				return;
			}

			this.isBusy = state.isBusy;
		});
	}

	disconnectedCallback() {

		// Unsubscribe from store.
		this._appStoreSub.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_userLoginSuccess() {

		// Put your logic here to execute post login success,
		// for example loading application data.

		this._appStore.setState({ isBusy: false }, `USER_LOGGED_IN`);
	}

	_userLoginError() {

		// Put your logic here to execute post login error,
		// for example showing a login failure screen / dialog.
	}

	_userLoggedOut() {

		// Put your logic here to execute post logout, 
		// for example showing a logout screen / dialog
		// explaining to the user that he /she is now logged out
		// and that the application will now reload.
	}

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

			`
		];
	}

	/**
	 * Default, generic rendering method, which is application type agnostic. 
	 * 
	 * If explicit rendering is required for an application type, please refer to the below 
	 * application type-based rendering methods (uncomment as required):
	 *  - "desktop": *_webTemplate()*
	 *  - "kiosk": *_kioskTemplate()*
	 *  - "mobile": *_mobileTemplate()*
	 * 
	 * NOTE: If this method is declared, as well as any of the application type-based rendering methods,
	 * this method will **take precedence**, i.e. the others **will be ignored**. 
	 * Remove this method if any of the application type-based rendering methods are declared.
	 *
	 * @returns {html} Generic rendering template method.
	 */
	renderShell() {
		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
		`;
	}

	// NOTE: Remove the below commented out code if *renderShell()* is sufficient to use.

	// /**
	//  * Rendering method for "desktop" application type only.
	//  * 
	//  * NOTE: Please ensure to also specify *_mobileTemplate()* method, 
	//  * if required to support mobile device detection, 
	//  * which is enabled by default.
	//  * 
	//  * @returns {html} "desktop" rendering template method.
	//  */
	// _webTemplate() {
	//     return html``;
	// }

	// /**
	//  * Rendering method for "kiosk" application type only.
	//  * 
	//  * @returns {html} "kiosk" rendering template method.
	//  */
	// _kioskTemplate() {
	//     return html``;
	// }

	// /**
	//  * Rendering method for "mobile" application type only.
	//  * 
	//  * @returns {html} "mobile" rendering template method.
	//  */
	// _mobileTemplate() {
	//     return html``;
	// }

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}

		return html`
			<capitec-loading-indicator></capitec-loading-indicator>
		`;
	}

	_renderContent() {

		if (this.isBusy && !this._security.isAuthenticated) {
			return html``;
		}

		return html`
			<capitec-content-box gap="none" anchor noPadding>
				<capitec-page-header label="${until(this._executionContext.applicationName)}" logoClickable
					@navigate-home="${() => this._router.navigateToDefaultPath()}">
					<capitec-group layout="vertical" valign="center" halign="right" gap="none">
						<capitec-label type="subtitle" label="${this._securityContext.fullName || ``}"></capitec-label>
						<capitec-label type="strong" label="${this._securityContext.username || ``}"></capitec-label>
					</capitec-group>
				</capitec-page-header>
				<capitec-content-box layout="horizontal" gap="none" grow="both" noPadding>
					<capitec-menu hideFooter>
						${this._menu.map(menuItem => html`
						<capitec-menu-item label="${ifDefined(menuItem.title)}" icon="${ifDefined(menuItem.icon)}"
							href="${menuItem.path}" @click="${() => this._router.navigateByPath(menuItem.path)}">
							${menuItem.items && menuItem.items.map(subMenuItem => html`
							<capitec-menu-item label="${subMenuItem.title}" .icon="${subMenuItem.icon}" href="${subMenuItem.path}"
								@click="${() => this._router.navigateByPath(subMenuItem.path)}">
							</capitec-menu-item>
							`)}
						</capitec-menu-item>
						`)}
					</capitec-menu>
					<capitec-app-router grow="both"></capitec-app-router>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}
}

// Creation of custom element, must be called "app-shell" by convention, as expected by the platform.
window.customElements.define(`app-shell`, AppShell);