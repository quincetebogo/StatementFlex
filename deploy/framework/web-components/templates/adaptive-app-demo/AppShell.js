import { Platform, Router } from 'platform/core';
import { Shell, css, html } from 'platform/elements';
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
		Platform.init({ security: false });

		// Platform Non-UI Components.
		this._appStore = AppStore.getInstance();
		this._router = Router.getInstance();

		// Setup Routing paths.
		this._menu = [
			this._router.addRoute({
				name: `view-login`,
				title: `Sign In`,
				icon: `material/home`,
				path: `/login`,
				load: () => import(`./views/ViewLogin`),
				isDefault: true,
				isFallback: true
			}),
			this._router.addRoute({
				name: `view-forgot-password`,
				title: `Forgot Password`,
				icon: `material/home`,
				path: `/forgot-password`,
				load: () => import(`./views/ViewForgotPassword`),
				isDefault: false,
				isFallback: true
			}),
			{
				title: `Help`,
				icon: `material/extension`,
				items: [
					this._router.addRoute({
						name: `view-about`,
						title: `About Capitec`,
						path: `/help/about`,
						load: () => import(`./views/help/ViewAbout`)
					}),
					this._router.addRoute({
						name: `view-settings`,
						title: `Settings`,
						path: `/help/settings`,
						load: () => import(`./views/help/ViewSettings`)
					})
				]
			}
		];

		// Property defaults.
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

		this.isBusy = false;

		// Subscribe to store.
		this._appStoreSub = this._appStore.stateChanged.subscribe(state => {

			if (!state) {
				return;
			}

			this.isBusy = state.isReady;
		});
	}

	disconnectedCallback() {

		// Unsubscribe from store.
		this._appStoreSub.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a


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

	// NOTE: Remove the below commented out code if *renderShell()* is sufficient to use.

	/**
	 * Rendering method for "desktop" application type only.
	 * 
	 * NOTE: Please ensure to also specify *_mobileTemplate()* method, 
	 * if required to support mobile device detection, 
	 * which is enabled by default.
	 * 
	 * @returns {html} "desktop" rendering template method.
	 */
	_webTemplate() {

		return html`
			${this.isBusy ? html`<capitec-loading-indicator></capitec-loading-indicator>` : html``}

			<capitec-content-box gap="none" anchor noPadding>
				<capitec-page-header label="Internet Banking" logoClickable @navigate-home="${() => this._router.navigateToDefaultPath()}"></capitec-page-header>
				<capitec-content-box layout="horizontal" gap="none" grow="both" noPadding>
					<capitec-menu hideFooter>
						${this._menu.map(menuItem => html`
							<capitec-menu-item
								label="${menuItem.title}"
								icon="${menuItem.icon}"
								href="${menuItem.path}"
								@click="${() => this._router.navigateByPath(menuItem.path)}">
								${menuItem.items && menuItem.items.map(subMenuItem => html`
									<capitec-menu-item
										label="${subMenuItem.title}"
										.icon="${subMenuItem.icon}"
										href="${subMenuItem.path}"
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

	/**
	 * Rendering method for "kiosk" application type only.
	 * 
	 * @returns {html} "kiosk" rendering template method.
	 */
	_kioskTemplate() {

		return html`Kiosk Template not Implemented`;
	}

	/**
	 * Rendering method for "mobile" application type only.
	 * 
	 * @returns {html} "mobile" rendering template method.
	 */
	_mobileTemplate() {

		return html`
			${this.isBusy ? html`<capitec-loading-indicator></capitec-loading-indicator>` : html``}

			<capitec-app-router grow="both"></capitec-app-router>
		`;
	}
}

// Creation of custom element, must be called "app-shell" by convention, as expected by the platform.
window.customElements.define(`app-shell`, AppShell);