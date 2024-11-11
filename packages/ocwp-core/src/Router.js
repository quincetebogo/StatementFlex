import queryString from 'query-string';
import regexparam from 'regexparam';


/**
 * Provides routing capabilities for paths with parameters and / or query strings:
 * * /books/**:id** --> /books/**1234**
 * * /books --> /books?foo=bar
 * 
 * **NOTE:** This is not a UI component itself. UI conduction takes place within the **{@link AppRouter}** UI component.
 * ```js 
 * import { Router } from 'platform/core'; 
 * ```
 * 
 * @hideconstructor
 */
export class Router {

    /**
     * @hideconstructor
     */
	constructor() {

        /**
         * Registered routes
         * @type {Array<Route>}
         */
		this.routes = null;

		/**
         * Registered routes
         * @ignore
         * @type {Array<Route>}
         */
		this._routes = [];


		Object.defineProperty(this, `routes`, {
			get: () => {
				const copy = this._routes.slice();
				copy.push = () => {
					throw new Error(`Invalid attempt to mutate read-only property "routes"`);
				};
				return copy;
			},
			set: () => {
				throw new Error(`Invalid attempt to mutate read-only property "routes"`);
			},
			configurable: false
		});
		return new Proxy(this, {
			set: (target, p, v, r) => {
				if (p === `routes` || p === `_routes`) {
					throw new Error(`Invalid attempt to set read-only property "${p}"`);
				}
				target[p] = v;
				return true;
			}
		});
	}

    /**
     * @static
     * @returns {Router} Singleton
     */
	static getInstance() {
		return this.instance || (this.instance = new Router());
	}

    /**
     * Add a new route to the route collection.
     *
     * @param {Route} route Route to be added.
     * 
     * @returns {Route} Route object passed in via "route" parameter.
     */
	addRoute(route) {

		// handle if no route
		if (!route) {
			throw new Error(`No route provided`);
		}

		// handle missing name in route
		if (!route.name) {
			throw new Error(`No route name provided`);
		}

		// handle missing path in route
		if (!route.path) {
			throw new Error(`No route path provided`);
		}

		// handle missing load() in route
		if (!route.load) {
			throw new Error(`No route load() provided`);
		}

		// handle duplicate route names in routes
		if (this._routes.find(r => r.name === route.name)) {
			throw new Error(`Route with name "${route.name}" already exists`);
		}

		// handle duplicate paths in routes
		if (this._routes.find(r => r.path === route.path)) {
			throw new Error(`Route with path "${route.path}" already exists`);
		}

		this._routes.push(route);

		// update default routes
		if (route.isDefault) {
			this.setDefault(route.name);
		}

		// update fallback routes
		if (route.isFallback) {
			this.setFallback(route.name);
		}

		return route;
	}

    /**
     * Current route object that is navigated to.
     *
     * @readonly
	 * @returns {Route} Current Route
     */
	get currentRoute() {
		return this._currentRoute;
	}

    /**
     * Navigate to a route based on the path and query provided.
     *
     * @param {String} pathAndQuery Relative path and query fragment e.g:
     * 
     * - "/"
     * - "/features"
     * - "/features/1234"
     * - "/features/1234?foo=bar"
     * 
     * @returns {Promise<Boolean>} Promise for the navigation result.
     */
	async navigateByPath(pathAndQuery) {

		try {

			if (!pathAndQuery || typeof pathAndQuery !== `string`) {
				throw new Error(`Invalid "pathAndQuery" parameter was specified.`);
			}

			if (!this._routes || this._routes.length === 0) {
				throw new Error(`No routes configured, unable to navigate.`);
			}

			if (!this.onNavigate) {
				throw new Error(`No onNavigate() callback configured, unable to navigate. Did you correctly use the <capitec-app-router> element?`);
			}

			let path = pathAndQuery;
			let pathParams = null;
			let query = null;
			let queryParams = null;
			let parsedPath = null;

			// If there's a query string, strip if off as this will cause the regex path test to fail.
			if (pathAndQuery.includes(`?`)) {

				path = pathAndQuery.substring(0, pathAndQuery.indexOf(`?`));
				query = pathAndQuery.substring(pathAndQuery.indexOf(`?`));
				queryParams = queryString.parse(query);
			}

			// Get route object from routes collection.
			const route = path === `/` ? this._routes.find(r => r.isDefault === true) : this._routes.find(r => {

				// Strip out query string if provided for regex route.
				const routeToRegex = r.path.indexOf(`?`) !== -1 ? r.path.substring(0, pathAndQuery.indexOf(`?`)) : r.path;

				// Create regex-enabled object from path.
				parsedPath = regexparam(routeToRegex);

				// Try and obtain the required route.
				if (parsedPath.pattern.test(path)) {
					pathParams = this._convertParsedPathToParams(parsedPath, path);
					return true;
				}

				return false;
			});

			if (route) {

				const context = {
					route,
					path,
					pathParams,
					query,
					queryParams
				};

				// 1. Guard
				if (typeof route.guard === `function`) {

					const canContinue = await route.guard(context);

					if (!canContinue) {

						console.warn(`[Router] Route "${route.name}" stopped by its guard function, unable to navigate.`);

						if (!this._currentRoute) {
							await this.navigateToFallbackPath();
						} else if (window.history.length > 1) {
							window.history.forward();
						}

						return false;
					}
				}

				this._currentRoute = route;

				// 2. Pre-Navigate
				if (typeof route.onPreNavigate === `function`) {
					await route.onPreNavigate(context);
				}

				// 3. Navigate
				await this.onNavigate(context);

				if (queryParams) {
					for (const queryParam in queryParams) {
						if (Object.prototype.hasOwnProperty.call(queryParams, queryParam)) {

							// If query parameter starts with the `platform-` prefix, then it is a subroute for a widget on the page.
							// This detail needs to be sent as an event for the relevant widget to interpret.
							if (queryParam.startsWith(`platform-`)) {
								window.dispatchEvent(new CustomEvent(queryParam, {
									detail: queryParams[queryParam],
									bubbles: true,
									composed: true
								}));
							}
						}
					}
				}

				// 4. Post-Navigate
				if (typeof route.onPostNavigate === `function`) {
					await route.onPostNavigate(context);
				}

			} else {
				return await this.navigateToFallbackPath();
			}

			return route !== null;

		} catch (error) {
			console.error(error);
			throw error;
		}
	}


    /**
     * Updates navigation (without navigating) to a route based on the path and query provided.
     *
     * @param {String} pathAndQuery Relative path and query fragment e.g:
     * 
     * - "/"
     * - "/features"
     * - "/features/1234"
     * - "/features/1234?foo=bar"
     * @param {Boolean} [isReplace=true] If true, will dispatch a "platform-navigation-replace" event, otherwise will dispatch a "platform-navigation-update" event
     * @returns {Boolean} navigation update result.
     */
	updateNavigation(pathAndQuery, isReplace = true) {

		try {

			if (!pathAndQuery || typeof pathAndQuery !== `string`) {
				throw new Error(`Invalid "pathAndQuery" parameter was specified.`);
			}

			if (!this._routes || this._routes.length === 0) {
				throw new Error(`No routes configured, unable to navigate.`);
			}

			let path = pathAndQuery;
			let pathParams = null;
			let query = null;
			let queryParams = null;
			let parsedPath = null;

			// If there's a query string, strip if off as this will cause the regex path test to fail.
			if (pathAndQuery.includes(`?`)) {

				path = pathAndQuery.substring(0, pathAndQuery.indexOf(`?`));
				query = pathAndQuery.substring(pathAndQuery.indexOf(`?`));
				queryParams = queryString.parse(query);
			}

			// Get route object from routes collection.
			const route = path === `/` ? this._routes.find(r => r.isDefault === true) : this._routes.find(r => {

				// Strip out query string if provided for regex route.
				const routeToRegex = r.path.indexOf(`?`) !== -1 ? r.path.substring(0, pathAndQuery.indexOf(`?`)) : r.path;

				// Create regex-enabled object from path.
				parsedPath = regexparam(routeToRegex);

				// Try and obtain the required route.
				if (parsedPath.pattern.test(path)) {
					pathParams = this._convertParsedPathToParams(parsedPath, path);
					return true;
				}

				return false;
			});

			if (route) {

				const context = {
					route,
					path,
					pathParams,
					query,
					queryParams
				};

				this._currentRoute = route;

				window.dispatchEvent(new CustomEvent(`platform-navigation-${isReplace ? `replace` : `update`}`, {
					detail: context,
					bubbles: true,
					composed: true
				}));

				if (queryParams) {
					for (const queryParam in queryParams) {
						if (Object.prototype.hasOwnProperty.call(queryParams, queryParam)) {

							// If query parameter starts with the `platform-` prefix, then it is a subroute for a widget on the page.
							// This detail needs to be sent as an event for the relevant widget to interpret.
							if (queryParam.startsWith(`platform-`)) {
								window.dispatchEvent(new CustomEvent(queryParam, {
									detail: queryParams[queryParam],
									bubbles: true,
									composed: true
								}));
							}
						}
					}
				}

			} else {
				console.warn(`Unable to update navigation: Route not found`);
			}

			return route !== null;

		} catch (error) {
			console.error(error);
			throw error;
		}
	}

    /**
     * Attempt to navigate to the default route of the router.
     *
     * @returns {Promise<boolean>} Promise for the navigation result.
     */
	navigateToDefaultPath() {
		return this._navigateByRouteProp(`isDefault`);
	}

	/**
	 * Attempt to navigate to the fallback route of the router.
	 * 
	 * @returns {Promise<boolean>} Promise for the navigation result.
	 */
	navigateToFallbackPath() {
		return this._navigateByRouteProp(`isFallback`);
	}

	/**
	 * Set route to be default
	 * @param {String} name Route name to set as default
	 * @returns {Boolean} Result of attempt to set new default route
	 */
	setDefault(name) {
		const route = this._routes.find(r => r.name === name);
		if (route) {
			this._routes.forEach(r => r.isDefault = false);
			route.isDefault = true;

			return true;
		}
		return false;
	}

	/**
	 * Set route to be fallback
	 * @param {String} name Route name to set as fallback
	 * @returns {Boolean} Result of attempt to set new fallback route
	 */
	setFallback(name) {
		const route = this._routes.find(r => r.name === name);
		if (route) {
			this._routes.forEach(r => r.isFallback = false);
			route.isFallback = true;

			return true;
		}
		return false;
	}

	/**
	 * Attempt to either a default or fallback route of the router.
	 *
	 * @param {("isDefault"|"isFallback")} routeProp Property on route object to lookup on.
	 * @returns {Promise<boolean>} Promise for the navigation result.
	 */
	_navigateByRouteProp(routeProp) {

		if (!this._routes || this._routes.length === 0) {
			throw new Error(`No routes configured, unable to navigate.`);
		}

		const route = this._routes.find(r => r[routeProp]);

		if (!route) {
			throw new Error(`No "${routeProp}" property with value "true" found on a route, unable to navigate.`);
		}

		return this.navigateByPath(route.path);
	}

	/**
	 * Converts the parsed path object into a JSON object.
	 *
	 * @param {Object} parsedPath Parsed path object to serve as pattern.
	 * @param {String} path Path to execute against pattern.
	 * 
	 * @private
	 * @returns {Object} Object of query string keys & values.
	 */
	_convertParsedPathToParams(parsedPath, path) {

		let i = 0;
		let out = null;
		const matches = parsedPath.pattern.exec(path);

		while (i < parsedPath.keys.length) {

			if (!out) {
				out = {};
			}

			out[parsedPath.keys[i]] = matches[++i] || null;
		}

		return out;
	}
}

export default Router.getInstance();