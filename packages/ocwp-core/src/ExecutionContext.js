import Configuration from './Configuration.js';
import Helpers from './internals/Helpers.js';
import Security from './Security.js';
import { UAParser } from 'ua-parser-js';

// Lazy-load the mobile SDK. Note: this helps us with webpack to not package libraries like Capacitor into the bundle of non-mobile projects.
if (window.Capacitor) {
	import(`@capacitor/core`);
}

/**
 * Exposes runtime execution information.
 *
 * ```js
 *  import { ExecutionContext } from 'platform/core';
 *
 *  let context = ExecutionContext.getInstance();
 *  console.log(context.clientIp);
 *  console.log(context.getDeviceInfo());
 * ```
 */
export class ExecutionContext {

	/**
	 * @static
	 * @returns {ExecutionContext} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new ExecutionContext());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {

		this._userAgentData = new UAParser().getResult();
		this._plugins = [];

		return Helpers.getProxy(this);
	}

	/**
	 * Returns the local IP address.
	 *
	 * @readonly
	 * @returns {String | null} Client IP or null.
	 */
	get clientIp() {

		if (Security && Security.token) {
			const claims = Security.decodeToken();
			return claims.client_ip ? claims.client_ip : claims.ipaddr;
		}

		return null;
	}

	/**
	 * Returns the user's browser name and version, e.g. Chrome 74.
	 *
	 * @readonly
	 * @returns {String} Browser.
	 */
	get browser() {

		if (!this._userAgentData.browser) {
			return null;
		}

		return `${this._userAgentData.browser.name} ${this._userAgentData.browser.version}`;
	}

	/**
	 * Returns the user's rendering engine name and version, e.g. Blink 74.
	 *
	 * @readonly
	 * @returns {String} Rendering Engine.
	 */
	get engine() {

		if (!this._userAgentData.engine) {
			return null;
		}

		return `${this._userAgentData.engine.name} ${this._userAgentData.engine.version}`;
	}

	/**
	 * Returns the local OS platform, e.g. Windows 10.
	 *
	 * @readonly
	 * @returns {string} OS Platform.
	 */
	get osPlatform() {

		if (!this._userAgentData.os) {
			return null;
		}

		return `${this._userAgentData.os.name} ${this._userAgentData.os.version}`;
	}

	/**
	 * Returns the local CPU architecture, e.g. arm64.
	 *
	 * @readonly
	 * @returns {string} CPU Architecture.
	 */
	get cpuArchitecture() {

		if (!this._userAgentData.cpu) {
			return null;
		}

		return this._userAgentData.cpu.architecture;
	}

	/**
	 * Returns the device vendor, e.g. Samsung.
	 *
	 * @readonly
	 * @returns {string} Device Vendor.
	 */
	get deviceVendor() {

		if (!this._userAgentData.device) {
			return null;
		}

		return this._userAgentData.device.vendor;
	}

	/**
	 * Returns the device model, e.g. S10 mini.
	 *
	 * @readonly
	 * @returns {string} Device Model.
	 */
	get deviceModel() {

		if (!this._userAgentData.device) {
			return null;
		}

		return this._userAgentData.device.model;
	}

	/**
	 * Returns the device type, e.g. mobile, tablet, etc.
	 *
	 * @readonly
	 * @returns {string} Device Type.
	 */
	get deviceType() {

		if (!this._userAgentData.device) {
			return null;
		}

		return this._userAgentData.device.type;
	}

	/**
	 * Returns the name of the application.
	 *
	 * @readonly
	 * @returns {Promise<String>} Promise for the application name.
	 */
	get applicationName() {
		return Configuration.getSetting(`platform.application.name`);
	}

	/**
	 * Returns the version of the application.
	 *
	 * @readonly
	 * @returns {Promise<String>} Promise for the application version.
	 */
	get applicationVersion() {
		return Configuration.getSetting(`platform.application.version`);
	}

	/**
	 * Returns the version of the platform this application is currently targeting.
	 *
	 * @readonly
	 * @returns {Promise<String>} Promise for the platform version.
	 */
	get platformVersion() {
		return Configuration.getSetting(`platform.version`);
	}

	/**
	 * Returns the type of shell the application is running in.
	 *
	 * @readonly
	 *
	 * @returns {String} The shell type, i.e. web, capacitor or cordova.
	 */
	get shellType() {

		if (`Capacitor` in window && window.Capacitor.isNativePlatform()) {
			return `capacitor`;
		} else if (`cordova` in window) {
			return `cordova`;
		}

		return `web`;
	}

	// --------------------------------
	// SHELL CAPABILITIES - DEVICE INFO
	// --------------------------------

	/**
	 * Gets a summary of the device the app is running on.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Object} The device info data.
	 */
	getDeviceInfo() {

		if (this.shellType === `capacitor`) {
			return this._getDeviceInfoCapacitor();
		}

		if (this.shellType === `cordova`) {
			return this._getDeviceInfoCordova();
		}

		return this._getDeviceInfoWeb();
	}

	/**
	 * Gets a summary of the device the app is running on using, the Capacitor shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The device info data.
	 */
	async _getDeviceInfoCapacitor() {

		// Get device information from the Capacitor API.
		const Device = this._getCapacitorPlugin(`Device`);

		const capacitorDeviceUUID = await Device.getId() || {};
		const capacitorInfo = await Device.getInfo() || {};
		const languageCode = await Device.getLanguageCode() || {};

		// Try to get additional information from the browser API.
		const browserInfo = await this._getDeviceInfoWeb() || {};

		return {
			shell: `capacitor`,
			name: capacitorInfo.name,
			model: capacitorInfo.model,
			platform: capacitorInfo.platform,
			uuid: capacitorDeviceUUID.uuid,
			osName: capacitorInfo.operatingSystem,
			osVersion: capacitorInfo.osVersion,
			manufacturer: capacitorInfo.manufacturer,
			isVirtual: capacitorInfo.isVirtual,
			memUsed: capacitorInfo.memUsed,
			diskFree: capacitorInfo.diskFree,
			diskTotal: capacitorInfo.diskTotal,
			serial: undefined,

			memory: browserInfo.memory,
			language: languageCode.value || browserInfo.language,
			online: browserInfo.online,
			userAgent: browserInfo.userAgent,
			vendor: browserInfo.vendor
		};
	}

	/**
	 * Gets a summary of the device the app is running on, using the Cordova shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Object} The device info data.
	 */
	async _getDeviceInfoCordova() {

		// Ensure the device API is available.
		if (!(`device` in window)) {
			throw new Error(`Cordova: Device API not installed or supported on this platform.`);
		}

		// Try to get additional information from the browser API.
		const browserInfo = await this._getDeviceInfoWeb() || {};

		return {
			shell: `cordova`,
			name: undefined,
			model: window.device.model,
			platform: window.device.platform,
			uuid: window.device.uuid,
			osName: undefined,
			osVersion: window.device.version,
			manufacturer: window.device.manufacturer,
			isVirtual: window.device.isVirtual,
			memUsed: undefined,
			diskFree: undefined,
			diskTotal: undefined,
			serial: window.device.serial,

			memory: browserInfo.memory,
			language: browserInfo.language,
			online: browserInfo.online,
			userAgent: browserInfo.userAgent,
			vendor: browserInfo.vendor
		};
	}

	/**
	 * Gets a summary of the device the app is running on, using the browser shell.
	 *
	 * @async
	 *
	 * @returns {Object} The device info data.
	 */
	_getDeviceInfoWeb() {

		return new Promise((resolve, reject) => {

			resolve({
				shell: `pwa`,
				name: undefined,
				model: undefined,
				platform: `web`,
				uuid: undefined,
				osName: undefined,
				osVersion: undefined,
				manufacturer: undefined,
				isVirtual: undefined,
				memUsed: undefined,
				diskFree: undefined,
				diskTotal: undefined,
				serial: undefined,

				memory: navigator.deviceMemory,
				language: navigator.language,
				online: navigator.onLine,
				userAgent: navigator.userAgent,
				vendor: navigator.vendor
			});
		});
	}

	// ---------------------------------
	// SHELL CAPABILITIES - BATTERY INFO
	// ---------------------------------

	/**
	 * Gets a summary of the battery status of the device the app is running on.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The battery info data.
	 */
	getBatteryInfo() {

		if (this.shellType === `capacitor`) {
			return this._getBatteryInfoCapacitor();
		}

		if (this.shellType === `cordova`) {
			return this._getBatteryInfoCordova();
		}

		return this._getBatteryInfoWeb();
	}

	/**
	 * Gets a summary of the battery status of the device the app is running on, using the Capacitor shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The device info data.
	 */
	async _getBatteryInfoCapacitor() {

		// Get battery information from the Capacitor API.
		const Device = this._getCapacitorPlugin(`Device`);

		const capacitorBattery = await Device.getBatteryInfo() || {};

		// Try to get additional information from the browser API.
		const browserBattery = this._getBatteryInfoWeb() || {};

		// Return the available battery information.
		return {
			level: capacitorBattery.batteryLevel || browserBattery.level,
			charging: capacitorBattery.isCharging !== undefined ? capacitorBattery.isCharging : browserBattery.charging,
			chargingTime: browserBattery.chargingTime,
			dischargingTime: browserBattery.dischargingTime
		};
	}

	/**
	 * Gets a summary of the battery status of the device the app is running on, using the Cordova shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The device info data.
	 */
	_getBatteryInfoCordova() {

		// Cordova implements the same source code as the browser to get battery data.
		return this._getBatteryInfoWeb();
	}

	/**
	 * Gets a summary of the battery status of the device the app is running on, using the browser shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The device info data.
	 */
	async _getBatteryInfoWeb() {

		// Ensure that the Battery API is available.
		if (!(`getBattery` in navigator)) {
			throw new Error(`${this.shellType}: Battery API not installed or supported on this platform.`);
		}

		// Get battery information from the Cordova API.
		const battery = await navigator.getBattery();

		// Return the available battery information.
		return {
			level: battery.level,
			charging: battery.charging,
			chargingTime: battery.chargingTime,
			dischargingTime: battery.dischargingTime
		};
	}

	// ---------------------------
	// SHELL CAPABILITIES - CAMERA
	// ---------------------------

	/**
	 * Prompts the user to take a photo using their device.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<string>} A base64 image data string of the photo, or null if the user cancelled the action.
	 */
	takePhoto() {

		if (this.shellType === `capacitor`) {
			return this._takePhotoCapacitor();
		}

		if (this.shellType === `cordova`) {
			return this._takePhotoCordova();
		}

		return this._takePhotoWeb();
	}

	/**
	 * Prompts the user to take a photo using their device, using the Capacitor shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<string>} A base64 image data string of the photo, or null if the user cancelled the action.
	 */
	async _takePhotoCapacitor() {

		// Take the photo with the device camera.
		const Camera = this._getCapacitorPlugin(`Camera`);

		const image = await Camera.getPhoto({
			quality: 100,
			allowEditing: false,
			source: `CAMERA`,
			resultType: `base64`
		});

		// Return the result as a browser renderable base64 string.
		return `data:image/${image.format};base64,${image.base64String}`;
	}

	/**
	 * Prompts the user to take a photo using their device, using the Cordova shell.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<string>} A base64 image data string of the photo, or null if the user cancelled the action.
	 */
	_takePhotoCordova() {

		// Ensure that the Camera API is available.
		if (!(`camera` in navigator)) {
			throw new Error(`Cordova: Camera API not installed or supported on this platform.`);
		}

		// Take the photo with the device camera and return the result as a browser renderable base64 string.
		return new Promise((resolve, reject) => navigator.camera.getPicture(
			imageData => resolve(`data:image/jpeg;base64,${imageData}`),
			error => reject(new Error(`Error taking picture: ${error}`)),
			{
				quality: 100,
				destinationType: window.Camera.DestinationType.DATA_URL,
				sourceType: window.Camera.PictureSourceType.CAMERA,
				encodingType: 0
			}
		));
	}

	/**
	 * Prompts the user to take a photo using their device, using the browser shell.
	 *
	 * @async
	 *
	 * @returns {Promise<string>} A base64 image data string of the photo, or null if the user cancelled the action.
	 */
	_takePhotoWeb() {

		return new Promise((resolve, reject) => {

			const input = document.createElement(`input`);
			input.type = `file`;
			input.multiple = false;
			input.accept = `image/*`;

			document.body.onfocus = () => {

				setTimeout(() => {

					if (input.value.length === 0) {

						// Resolve the promise with no data if the user cancels the file select popup.
						resolve();

					} else {

						// Resolve the promise with the selected image data base64 string.
						const file = input.files[0];

						// Read the contents of the file.
						const reader = new FileReader();
						reader.readAsDataURL(file);
						reader.onload = readerEvent => {
							resolve(readerEvent.target.result);
						};
					}

					document.body.onfocus = null;
				}, 100);
			};

			input.click();
		});
	}

	// -----------------------------------
	// SHELL CAPABILITIES - IN APP BROWSER
	// -----------------------------------

	/**
	 * Opens a new browser window on the device.
	 *
	 * Based on the {@link https://github.com/apache/cordova-plugin-inappbrowser/blob/master/README.md|Cordova InAppBrowser}
	 *
	 * @param {string} url - The URL of the page to load in a new browser window.
	 * @param {string} target - The browser window in which to load the page, i.e. _self = in web view, _blank = in popover window, _system = in the system web browser.
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Window|cordova.InAppBrowser} A reference to the browser window.
	 */
	openBrowser(url, target = `_blank`) {

		if (this.shellType === `capacitor`) {
			return this._openBrowserCapacitor(url, target);
		}

		if (this.shellType === `cordova`) {
			return this._openBrowserCordova(url, target);
		}

		return this._openBrowserWeb(url, target);
	}

	/**
	 * Opens a new browser window on the device, using the Capacitor shell.
	 *
	 * Based on the {@link https://github.com/apache/cordova-plugin-inappbrowser/blob/master/README.md|Cordova InAppBrowser}
	 *
	 * @param {string} url - The URL of the page to load in a new browser window.
	 * @param {string} target - The browser window in which to load the page, i.e. _self = in web view, _blank = in popover window, _system = in the system web browser.
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {cordova.InAppBrowser} A reference to the browser window.
	 */
	_openBrowserCapacitor(url, target = `_blank`) {

		// We reuse the Cordova InAppBrowser plugin on Capacitor due to the limitations with their plugin such as the ability to hide the device browser UI.
		return this._openBrowserCordova(url, target);
	}

	/**
	 * Opens a new browser window on the device, using the Capacitor shell.
	 *
	 * Based on the {@link https://github.com/apache/cordova-plugin-inappbrowser/blob/master/README.md|Cordova InAppBrowser}
	 *
	 * @param {string} url - The URL of the page to load in a new browser window.
	 * @param {string} target - The browser window in which to load the page, i.e. _self = in web view, _blank = in popover window, _system = in the system web browser.
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {cordova.InAppBrowser} A reference to the browser window.
	 */
	_openBrowserCordova(url, target = `_blank`) {

		if (!(`InAppBrowser` in window.cordova)) {

			console.warn(`${this.shellType}: InAppBrowser API not installed or supported on this platform.`);
			return null;
		}

		// Start loading the page in a new browser window in background mode.
		const browser = window.cordova.InAppBrowser.open(url, target, `location=no,footer=no,hardwareback=yes,zoom=no,hidden=yes`);

		// Detect when the page is fully loaded to enable all functionality.
		let webkitReady = false;
		let messageQueue = [];

		browser.addEventListener(`loadstop`, event => {

			// Flag the browser as ready.
			webkitReady = true;

			// Process any queued up messages
			for (const message of messageQueue) {
				browser.postMessage(message);
			}
			messageQueue = [];
		});

		// Add a convenience function to allow for posting messages to the InAppBrowser window, similar to the base javascript window object.
		browser.postMessage = (message) => {

			// Queue requests if the browser is not ready yet.
			if (!webkitReady) {

				messageQueue.push(message);
				return;
			}

			// Convert the message to a string that can be read by the InAppBrowser plugin.
			if (typeof message !== `object`) {
				throw new Error(`${this.shellType}: Only object types my be posted as messages to InAppBrowser.`);
			}

			// Send the message to the InAppBrowser.
			browser.executeScript({
				code: `window.webkit.messageHandlers.cordova_iab.postMessage(\`${JSON.stringify(message)}\`)`
			});
		};

		// Show the browser window.
		browser.show();

		return browser;
	}

	/**
	 * Opens a new browser window on the device, using the Capacitor shell.
	 *
	 * Based on the {@link https://github.com/apache/cordova-plugin-inappbrowser/blob/master/README.md|Cordova InAppBrowser}
	 *
	 * @param {string} url - The URL of the page to load in a new browser window.
	 * @param {string} target - The browser window in which to load the page, i.e. _self = in web view, _blank=in popover window, _system = in the system web browser.
	 *
	 * @returns {Window} A reference to the browser window.
	 */
	_openBrowserWeb(url, target = `_blank`) {

		if (target === `_system`) {
			target = `_blank`;
		}

		return window.open(url, target, `location=no`);
	}

	// --------------------------------
	// SHELL CAPABILITIES - DEVICE CODE
	// --------------------------------

	/**
	 * Calls a device code function that has been registered in the device.
	 *
	 * @param {string} className - The name of the class on device that contains the function.
	 * @param {string} functionName - The name of the function on device to execute.
	 * @param {Object} args - The arguments to pass to the function.
	 * @param {Function} fallbackFunction - A local Javascript function to call as when not running on a device.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The function call results parsed back to Javascript types.
	 */
	executeDeviceCode(className, functionName, args, fallbackFunction) {

		if (this.shellType === `capacitor`) {
			return this._executeDeviceCodeCapacitor(className, functionName, args);
		}

		if (this.shellType === `cordova`) {
			return this._executeDeviceCodeCordova(className, functionName, args);
		}

		if (fallbackFunction) {
			return fallbackFunction(args);
		}

		return null;
	}

	/**
	 * Calls a device code function that has been registered in the device, using the Capacitor shell.
	 *
	 * @param {string} className - The name of the class on device that contains the function.
	 * @param {string} functionName - The name of the function on device to execute.
	 * @param {Object} args - The arguments to pass to the function.
	 *
	 * @async
	 *
	 * @throws {Error} When the device API is not installed or available.
	 *
	 * @returns {Promise<Object>} The function call results parsed back to Javascript types.
	 */
	_executeDeviceCodeCapacitor(className, functionName, args) {

		// Call the device code function.
		return this._getCapacitorPlugin(className)[functionName](args);
	}

	/**
	 * Calls a device code function that has been registered in the device, using the Cordova shell.
	 *
	 * @param {string} className - The name of the class on device that contains the function.
	 * @param {string} functionName - The name of the function on device to execute.
	 * @param {Object} args - The arguments to pass to the function.
	 *
	 * @async
	 *
	 * @returns {Promise<Object>} The function call results parsed back to Javascript types.
	 */
	_executeDeviceCodeCordova(className, functionName, args) {

		return null; // TODO
	}

	// ----------------------------------
	// SHELL CAPABILITIES - DEVICE EVENTS
	// ----------------------------------

	/**
	 * Add a listener for a callback event dispatched by the device, e.g. an native device intent.
	 *
	 * @param {string} className - The name of the class on device that will dispatch the event.
	 * @param {string} eventName - The name of the event that the device dispatches.
	 * @param {function} handler - The local callback function to execute when the device event is received.
	 *
	 * @returns {object} The device event listener instance.
	 */
	addDeviceListener(className, eventName, handler) {

		if (this.shellType === `capacitor`) {
			return this._addDeviceListenerCapacitor(className, eventName, handler);
		}

		if (this.shellType === `cordova`) {
			return this._addDeviceListenerCordova(className, eventName, handler);
		}

		return this._addDeviceListenerWeb(className, eventName, handler);
	}

	/**
	 * Add a listener for a callback event dispatched by the device, e.g. an native device intent, using the Capacitor shell.
	 *
	 * @param {string} className - The name of the class on device that will dispatch the event.
	 * @param {string} eventName - The name of the event that the device dispatches.
	 * @param {function} handler - The local callback function to execute when the device event is received.
	 *
	 * @returns {object} The device event listener instance.
	 */
	_addDeviceListenerCapacitor(className, eventName, handler) {

		return this._getCapacitorPlugin(className).addListener(eventName, handler);
	}

	/**
	 * Add a listener for a callback event dispatched by the device, e.g. an native device intent, using the Cordova shell.
	 *
	 * @param {string} className - The name of the class on device that will dispatch the event.
	 * @param {string} eventName - The name of the event that the device dispatches.
	 * @param {function} handler - The local callback function to execute when the device event is received.
	 *
	 * @returns {object} The device event listener instance.
	 */
	_addDeviceListenerCordova(className, eventName, handler) {

		console.warn(`Device type '${this.shellType}' does not support listening for device events.`);

		return null; // TODO
	}

	/**
	 * Add a listener for a callback event dispatched by the device, e.g. an native device intent, using the browser shell.
	 *
	 * @param {string} className - The name of the class on device that will dispatch the event.
	 * @param {string} eventName - The name of the event that the device dispatches.
	 * @param {function} handler - The local callback function to execute when the device event is received.
	 *
	 * @returns {object} The device event listener instance.
	 */
	_addDeviceListenerWeb(className, eventName, handler) {

		console.warn(`Device type '${this.shellType}' does not support listening for device events.`);

		return null; // TODO
	}

	/**
	 * Remove a registered device event listener.
	 *
	 * @param {object} instance - The instance of the listener to remove.
	 *
	 * @returns {void}
	 */
	removeDeviceListener(instance) {

		if (this.shellType === `capacitor`) {
			this._removeDeviceListenerCapacitor(instance);
		} else if (this.shellType === `cordova`) {
			this._removeDeviceListenerCordova(instance);
		}

		this._removeDeviceListenerWeb(instance);
	}

	/**
	 * Remove a registered device event listener, using the Capacitor shell.
	 *
	 * @param {object} instance - The instance of the listener to remove.
	 *
	 * @returns {void}
	 */
	_removeDeviceListenerCapacitor(instance) {

		instance.remove();
	}

	/**
	 * Remove a registered device event listener, using the Cordova shell.
	 *
	 * @param {object} instance - The instance of the listener to remove.
	 *
	 * @returns {void}
	 */
	_removeDeviceListenerCordova(instance) {

		console.warn(`Device type '${this.shellType}' does not support removing device listener events.`);

		// TODO
	}

	/**
	 * Remove a registered device event listener, using the browser shell.
	 *
	 * @param {object} instance - The instance of the listener to remove.
	 *
	 * @returns {void}
	 */
	_removeDeviceListenerWeb(instance) {

		console.warn(`Device type '${this.shellType}' does not support removing device listener events.`);

		// TODO
	}

	// ----------------
	// HELPER FUNCTIONS
	// ----------------

	/**
	 * Gets an instance of the bridge to a native Capacitor plugin.
	 *
	 * @param {string} className - The name of the plugin class, e.g. Camera.
	 *
	 * @returns {Proxy} The native plugin bridge.
	 */
	_getCapacitorPlugin(className) {

		// Ensure the Capacitor SDK is loaded.
		if (!window.Capacitor) {
			throw new Error(`Capacitor: cannot call _getCapacitorPlugin on a non-Capacitor project.`);
		}

		// Return the registered plugin bridge (if it has been initialised already).
		if (this._plugins[className]) {
			return this._plugins[className];
		}

		// Register the requested Capacitor plugin and keep a singleton instance for future requests.
		if (!window.Capacitor.isPluginAvailable(className)) {
			throw new Error(`Capacitor: Plugin for '${className}' is not installed or supported on this platform.`);
		}

		this._plugins[className] = window.Capacitor.registerPlugin(className);

		// Register the JavasScript bridge connection to the native plugin.
		return this._plugins[className];
	}
}

export default ExecutionContext.getInstance();