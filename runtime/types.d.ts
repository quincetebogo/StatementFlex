/**
 * The types defined in this file are not part of the JSDoc generated documentation.
 *
 * Refer to "typedefs.js" for more definitions.
 */

/**
 * Platform-defined type accessible via the window object.
 *
 * @interface Platform
 */
interface Platform {

	/**
	 * When true, indicates that the platform was started with security enabled.
	 */
	security: Boolean

	/**
	 * Indicates the platform runtime environment.
	 */
	environment: String
}

interface Window {

	/**
	 * Global platform-defined object.
	 */
	platform: Platform;

	/**
	 * Determines whether the current browser is on a mobile device
	 * @returns {Boolean} True if device is mobile, otherwise false.
	 */
	isMobile: boolean;

	/**
	 * Show a toast message.
	 *
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * - `top left` Top left of screen.
	 * - `top right` Top right of screen.
	 * - `bottom left` Bottom left of screen.
	 * - `bottom right` Bottom right of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {any} body override for title and message
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToast(type: `info` | `success` | `warning` | `error`, location: `top` | `bottom` | `top left` | `top right` | `bottom left` | `bottom right`, title: String, message: String, closable: Boolean, closeCallback: Function, layout: `horizontal` | `vertical`, body: any): Object

	/**
	 * Show a toast message with timeout support.
	 *
	 * @param {String} type Toast type:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @param {String} location Toast location:
	 * - `top` Top of screen.
	 * - `bottom` Bottom of screen.
	 * - `top left` Top left of screen.
	 * - `top right` Top right of screen.
	 * - `bottom left` Bottom left of screen.
	 * - `bottom right` Bottom right of screen.
	 * @param {String} title Title to display on toast
	 * @param {String} message Message to display in toast
	 * @param {Number} duration Duration to display in milliseconds
	 * @param {Boolean} closable Whether the toast can be closed by clicking close button
	 * @param {Function} closeCallback To be called when toast is closed
	 * @param {horizontal|vertical|String} layout HTML message content orientation
	 * @param {any} body override for title and message
	 * @returns {Object} Shows toast message and return the toast message object
	 */
	showToastTimed(type: `info` | `success` | `warning` | `error`, location: `top` | `bottom` | `top left` | `top right` | `bottom left` | `bottom right`, title: String, message: String, duration: Number, closable: Boolean, closeCallback: Function, layout: `horizontal` | `vertical`, body: any): Object

	/**
	 * Hide current toast message.
	 *
	 * @returns {void}
	 */
	hideToast(): void

	/**
	 * Message application consuming widget to raise specified event and if callback is provided,
	 * invokes callback with a response if received within given timeout,
	 * otherwise invokes timeoutCallback.
	 *
	 * @param {String} eventName Name of Event to send to application.
	 * @param {Object} detail Object with detail to send on event to application.
	 * @param {Function} [callback=null] Callback function to invoke with application response.
	 * @param {Number} [timeout] If provided, will reject the promise if no response is received within given timeout milliseconds.
	 * @param {Function} [timeoutCallback=null] Callback function to invoke when timeout is reached with no response. Required if timeout is provided.
	 * @returns {void} void
	 */
	messageApplication(eventName: String, detail: Object, callback: Function, timeout: Number, timeoutCallback: Function): void

	/**
	 * Message application consuming widget to raise specified event and wait for a response within the timeout.
	 *
	 * @param {String} eventName Name of Event to send to application.
	 * @param {Object} detail Object with detail to send on event to application.
	 * @param {Number} [timeout=3000] Will reject the promise if no response is received within given timeout milliseconds.
	 * @returns {Promise} Promise for response from application.
	 */
	messageApplicationAsync(eventName: String, detail: Object, timeout: Number): void

	// TODO: Determine if permissions should be exposed yet.
	// /**
	//  * Message application consuming widget to grant and invoke specified permission.
	//  *
	//  * @param {String} name Name of permission to invoke on application.
	//  * @param {Object} detail Detail to send to application.
	//  * @param {Number} [timeout] If provided, will reject the promise if no response is received within given timeout milliseconds.
	//  *
	//  * @returns {Promise} Requests invocation of permission and returns response.
	//  */
	// messageApplicationWithPermission(name: String, detail: Object, timeout: Number): void

	/**
	 * Responsive breakpoints
	 */
	breakpoints: {
		xs: number,
		sm: number,
		md: number,
		lg: number
	}
}
