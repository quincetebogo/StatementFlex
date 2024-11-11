import { Constants } from './internals/Constants.js';
import { HttpClient } from './HttpClient.js';
import { Mutex } from 'async-mutex';
import { Utilities } from './Utilities.js';

/**
 * Helper class to facilitate configuration retrieval. 
 * 
 * ```js 
 * import { Configuration } from 'platform/core'; 
 * ```
 * 
 * All configuration retrieved remotely gets cached in memory for quick access.
 */
export class Configuration {

	/**
	 * @static
	 * @returns {Configuration} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new Configuration());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {

		this.config = null;

		// Prepare the mutex object used for "locking" collections.
		this._mutex = new Mutex();
	}

	/**
	 * Initializes configuration cache.
	 *
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	init() {

		// Many different platform tasks need to wait for the config to be loaded asynchronously, so here we cache the promise and point them to this single instance that they can await.
		if (!this._configLoaded) {
			this._configLoaded = this._loadConfig();
		}

		return this._configLoaded;
	}

	/**
	 * Load the platform configuration.
	 *
	 * @ignore
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	_loadConfig() {

		return new Promise((resolve, reject) => {

			// Lock the mutex to handle concurrency.
			this._mutex
				.acquire()
				.then(async (release) => {
					try {

						if (this.isInitialized) {
							resolve();
							return;
						}

						const response = await Promise.all([
							HttpClient.getInstance().get(`/config.json`),
							HttpClient.getInstance().get(`/platform.json`),
							HttpClient.getInstance().get(`/runtime.json`)
						]);

						// Initialise config using application's config.
						const configJson = response[0];

						// Append platform's config.
						configJson.platform = response[1];

						// Set the platform rendering type.
						const sessionType = window.sessionStorage.getItem(`platform.type`);

						if (sessionType) {

							// If a session preference exists, then use that value, e.g. The app has a toggle to allow the user to choose their rendering mode.
							configJson.platform.type = sessionType;

						} else if (configJson.platform.type === `omni-channel`) {

							// If the configured mode is omni-channel, then try to detect the render mode based on the user agent type.
							if (window.isMobile) {
								configJson.platform.type = `mobile`;
							} else {
								configJson.platform.type = `desktop`;
							}
						}


						// Append runtime config.
						configJson.runtime = response[2];

						// Set the IDP that is being utilised, either by an explicit setting with the application, or a default one set by the platform.
						configJson.idp = configJson.platform.application.idp.provider ? configJson.platform.application.idp.provider : configJson.runtime.idp.default;

						if (configJson.platform.app === `widget`) {
							configJson.widgetManifest = await HttpClient.getInstance().get(`/widget.json`);
						}

						if (!window.platform) {
							window.platform = {};
						}

						if (configJson.platform.application.disableDeviceDetection) {
							console.error(`Property "disableDeviceDetection" in platform.json has been deprecated use type:"desktop|kiosk|mobile" to force a rendering type, or type: "omni-channel" to enable responsive rendering`);
						}

						if (configJson.runtime.environment) {
							window.platform.environment = configJson.runtime.environment;

							// Disable non-error console logging in PROD environment
							if (window.platform.environment === `PROD`) {
								console.log = () => { };
								console.warn = () => { };
								console.debug = () => { };
							}
						}

						if (configJson.platform.application.permissions && configJson.platform.application.permissions.length > 0) {
							const defaultPerms = (configJson.runtime.permissions || []).filter(dp => configJson.platform.application.permissions.filter(p => p.name === dp.name).length === 0);
							// eslint-disable-next-line require-atomic-updates
							configJson.runtime.permissions = [...defaultPerms, ...configJson.platform.application.permissions];
						}

						// Sets the loaded configuration.
						this.config = configJson;

						// Load the platform rendering type specific stylesheet.
						this.changeRenderingMode(configJson.platform.type);

						// Notify any listeners that the configuration has finished loading.
						window.dispatchEvent(new CustomEvent(`platform-configuration-load`, {
							detail: {},
							bubbles: true,
							composed: true
						}));

						// Mark the initialisation as complete.
						this.isInitialized = true;

						resolve();

					} catch (err) {

						reject(err);

					} finally {

						release();
					}
				});
		});
	}

	/**
	 * Gets a settings from the memory cache if available, else retrieves it via the channel service (security must be enabled).
	 *
	 * @param {String} key Name of the settings to retrieve.
	 * @returns {Promise<*>} Promise for the setting value.
	 */
	async getSetting(key) {

		// Force initialisation if not done.
		if (!this.isInitialized) {
			await this.init();
		}

		// Try to retrieve & return value locally from cache.
		if (Utilities.getValue(this.config, key) !== undefined) {
			return Utilities.getValue(this.config, key);
		}

		// Only retrieve if security is enabled.
		if (!window.platform.security) {
			throw Error(`Security disabled, could not retrieve setting with key: ${key}`);
		}

		// Try to retrieve & return value remotely via hosting channel service.
		const setting = await HttpClient
			.getInstance()
			.get(`/platform/config/v1/config/${key.replace(`.`, `:`)}`);

		if (!setting) {
			throw Error(`Could not find setting with key: ${key}`);
		}

		this.config[key] = setting;

		return setting;
	}

	/**
	 * Changes the rendering mode of the application from what was loaded in the configuration initialisation.
	 * 
	 * @param {string} mode - The mode to render in, e.g. mobile, kiosk or desktop.
	 * @param {boolean} [persist=false] - Whether to persist the setting across browser sessions.
	 * 
	 * @returns {void}
	 */
	changeRenderingMode(mode, persist = false) {

		// Ensure the configuration settings have been initialised.
		if (!this.config) {
			throw new Error(`Unable to set rendering mode, platform configuration not initialised yet.`);
		}

		// Update the configuration setting for the
		this.config.platform.type = mode;

		// Update isMobile check when manually changing the render mode
		window.isMobile = mode === `mobile`;

		// Cache the setting across browser sessions if requested.
		if (persist) {
			window.sessionStorage.setItem(`platform.type`, mode);
		}

		// Replace the application stylesheet with the styles for the new mode.
		try {

			const links = document.getElementsByTagName(`link`);

			for (let index = 0; index < links.length; index++) {

				const link = links[index];

				let match = null;

				if (link.href.endsWith(`web-app-omni-channel.css`)) {
					match = `omni-channel`;
				} else if (link.href.endsWith(`web-app-mobile.css`)) {
					match = `mobile`;
				} else if (link.href.endsWith(`web-app-desktop.css`)) {
					match = `desktop`;
				} else if (link.href.endsWith(`web-app-kiosk.css`)) {
					match = `kiosk`;
				}

				if (match) {
					link.href = link.href.replace(`web-app-${match}`, `web-app-${mode}`);
					break;
				}
			}

		} catch (error) {

			console.warn(`Unable to update styles for: ${mode}.\t\n${error}`);
		}
	}
}

export default Configuration.getInstance();