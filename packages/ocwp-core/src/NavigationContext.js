import EventAggregator from './EventAggregator.js';

/**
 * Exposes runtime navigation information.
 * 
 * Navigation is initiated within **{@link Router#navigateByPath}** and rendered within the **{@link AppRouter}** UI component.
 *  
 * ```js 
 *  import { NavigationContext } from 'platform/core'; 
 * ```
 * 
 * **Events**
 * - ```n/a```
 * 
 * **{@link EventAggregator} Events**
 * - ```platform-navigation-context-updated``` When navigation ocurred.
 */
export class NavigationContext {

	/**
	 * @hideconstructor
	 */
	constructor() { }

	/**
	 * @static
	 * @returns {NavigationContext} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new NavigationContext());
	}

	update(context) {

		if (this.current) {

			/**
			* Previous navigation context info, if available.
			*
			* @type {Object}
			* @readonly
			* @property {Object} route Route object created within **{@link Router#addRoute}**.
			* @property {String} path Path fragment of the URL, e.g. "/books/1234"
			* @property {Object} pathParams Path fragment parameter keys and values, e.g. { id: 1234 }
			* @property {String} query Query fragment of the URL, e.g. "?foo=bar"
			* @property {Object} queryParams Path fragment parameter keys and values, , e.g. { foo: bar }
			*/
			this.previous = this.current;
		}

		/**
		* Current navigation context info, if available.
		*
		* @type {Object}
		* @readonly
		* @property {Object} route Route object created within **{@link Router#addRoute}**.
		* @property {String} path Path fragment of the URL, e.g. "/books/1234"
		* @property {Object} pathParams Path fragment parameter keys and values, e.g. { id: 1234 }
		* @property {String} query Query fragment of the URL, e.g. "?foo=bar"
		* @property {Object} queryParams Path fragment parameter keys and values, , e.g. { foo: bar }
		*/
		this.current = context;

		// Publish event to any consumer indicating that navigation ocurred and the context info is updated.
		EventAggregator.publish(`platform-navigation-context-updated`, this);

		window.dispatchEvent(new CustomEvent(`platform-navigation-context-updated`, {
			detail: this,
			bubbles: true,
			composed: true
		}));
	}
}

export default NavigationContext.getInstance();