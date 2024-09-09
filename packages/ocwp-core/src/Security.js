import Keycloak from 'keycloak-js';
import { PublicClientApplication } from '@azure/msal-browser';
import Router from './Router.js';

/**
 * Simplify interaction with OAuth based services.
 * 
 * ```js 
 *  import { Security } from 'platform/core'; 
 * ```
 */
export class Security {

	/**
	 * @static
	 * @returns {Security} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new Security());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {

	}

	/**
	 * True if the user is authenticated.
	 *
	 * @readonly
	 * @returns {Boolean} User authentication state
	 */
	get isAuthenticated() {

		if (this._idp === `azure`) {
			return Boolean(this._azureAuthInfo);
		}
		return window.keycloak && window.keycloak.authenticated;
	}

	/**
	 * Returns the access token, else null.
	 *
	 * @readonly
	 * @returns {String|null} token or null
	 */
	get token() {

		if (!this.isAuthenticated) {
			return null;
		}

		if (this._idp === `azure`) {
			return this._azureAuthInfo.accessToken;
		}

		return window.keycloak.token;
	}

	/**
	* Name of the trusted IDP, e.g keycloak.
	* 
	* @type {String}
	* @readonly
	*/
	get idp() {
		return this._idp ? this._idp : null;
	}

	/**
	 * Gets a token value.
	 *
	 * @param {String} prop Token property to get.
	 * @ignore
	 * @returns {*} Token value or null
	 */
	getTokenValue(prop) {
		const decodedToken = this.decodeToken();
		return decodedToken && decodedToken.hasOwnProperty(prop) ? decodedToken[prop] : null;
	}

	/**
	 * Initializes authentication flow.
	 * 
	 * @param {String} idp Runtime IDP configuration.
	 * @param {String} env Name of environment
	 * @param {Object} idpConfig Runtime IDP configuration.
	 * @param {String} client Runtime IDP configuration.
	 * @param {String} aud Application's IDP audience name (Azure only)
	 *
	 * @ignore
	 * @returns {void}
	 */
	init(idp, env, idpConfig, client, aud) {

		this._idp = idp;
		this._environment = env === `LOCAL` ? `DEV` : env;
		this._idpConfig = idpConfig;
		if (typeof client === `string` || client instanceof String) {
			this._client = client;
		} else {
			this._client = client[env.toUpperCase()] || client.DEV;
		}
		this._aud = aud;

		if (idp === `keycloak`) {
			this._initKeycloak();
		} else if (idp === `azure`) {
			this._initAzure();
		}
	}


	_initAzure() {
		window.azure = window.azure ? window.azure : new PublicClientApplication({
			auth: {
				clientId: this._client,
				authority: this._idpConfig.azure[`auth-server-url`],
				redirectUri: window.location.origin,
				navigateToLoginRequestUrl: false
			},
			cache: {
				cacheLocation: `sessionStorage`,
				storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
			}
		});

		// Add here scopes for id token to be used at MS Identity Platform endpoints.
		const loginRequest = {
			scopes: [`api://${this._aud}-${this._environment}/default`]
		};

		window.addEventListener(`platform-approuter-load`, () => {

			const authRoute = window.sessionStorage.getItem(`platform-auth-route`);
			if (authRoute) {
				window.sessionStorage.removeItem(`platform-auth-route`);
				Router.navigateByPath(authRoute);
			}
		});

		// Register Callbacks for Redirect flow
		window.azure.handleRedirectPromise()
			.then((response) => {
				if (!response) {
					window.sessionStorage.setItem(`platform-auth-route`, `${document.location.pathname}${document.location.search}`);

					console.debug(`[Security] - login`);
					window.azure.loginRedirect(loginRequest);
					return;
				}

				console.debug(`[Security] - onAuthSuccess`);
				this._azureAuthInfo = response;

				if (this.onAuthSuccessCallback) {
					this.onAuthSuccessCallback();
				} else {
					console.warn(`Authentication success, no callback!`);
				}
			})
			.catch((er) => {
				console.error(er);
				console.debug(`[Security] - onAuthError`);

				if (this.onAuthErrorCallback) {
					this.onAuthErrorCallback();
				} else {
					console.warn(`Authentication error, no callback!`);
				}
			});
	}

	_initKeycloak() {
		window.keycloak = Keycloak({
			url: this._idpConfig.keycloak[`auth-server-url`],
			realm: this._idpConfig.keycloak.realm,
			clientId: this._client
		});

		window.keycloak.init({
			onLoad: `login-required`,
			enableLogging: true,
			checkLoginIframe: false
		});

		window.keycloak.onAuthSuccess = () => {

			console.debug(`[Security] - onAuthSuccess`);

			if (this.onAuthSuccessCallback) {
				this.onAuthSuccessCallback();
			} else {
				console.warn(`Authentication success, no callback!`);
			}
		};

		window.keycloak.onAuthError = () => {

			console.debug(`[Security] - onAuthError`);

			if (this.onAuthErrorCallback) {
				this.onAuthErrorCallback();
			} else {
				console.warn(`Authentication error, no callback!`);
			}
		};

		window.keycloak.onAuthLogout = () => {

			console.debug(`[Security] - onAuthLogout`);

			if (this.onAuthLogoutCallback) {
				this.onAuthLogoutCallback();
			} else {
				console.warn(`Authentication logout, no callback!`);
			}
		};

		window.keycloak.onTokenExpired = () => {
			console.debug(`[Security] - onTokenExpired`);
		};
	}

	/**
	 * Raised when the user is logged in.
	 *
	 * @ignore
	 * @static
	 * @param {Function} callback Remote handler.
	 * @returns {void}
	 */
	onAuthSuccess(callback) {
		this.onAuthSuccessCallback = callback;
	}

	/**
	 * Raised when the user's login attempt caused an error.
	 *
	 * @ignore
	 * @param {Function} callback Remote handler.
	 * @returns {void}
	 */
	onAuthError(callback) {
		this.onAuthErrorCallback = callback;
	}

	/**
	 * Raised when the user is logged out.
	 *
	 * @ignore
	 * @param {Function} callback Remote handler.
	 * @returns {void}
	 */
	onAuthLogout(callback) {
		this.onAuthLogoutCallback = callback;
	}

	/**
	 * Checks that the access token is still valid and
	 * renew it if its near expiration.
	 *
	 * @returns {Promise<Boolean>} True if the access token was refreshed / still valid.
	 */
	ensureValidToken() {
		if (this._idp === `azure`) {
			return this._validateAzureToken();
		}
		return window.keycloak.updateToken(30);
	}

	async _validateAzureToken() {

		try {
			const account = window.azure.getAllAccounts()[0];
			const acquired = await window.azure.acquireTokenSilent({
				scopes: [`api://${this._aud}-${this._environment}/default`],
				forceRefresh: false,
				account: account
			});
			this._azureAuthInfo = acquired;

		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	/**
	 * Returns a decoded version of the token else null.
	 *
	 * @ignore
	 * @returns {Object|null} Decoded version of token or null
	 */
	decodeToken() {

		if (!this.isAuthenticated) {
			return null;
		}

		if (this._idp === `azure`) {
			const decodedString = atob(this._azureAuthInfo.accessToken.split(`.`)[1]);
			const claims = JSON.parse(decodedString);
			return claims;
		}

		return window.keycloak.idTokenParsed;
	}
}

export default Security.getInstance();