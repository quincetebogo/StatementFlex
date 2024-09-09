import { SignalRConnector } from './internals/SignalRConnector.js';

/** 
 * Base class for a reusable Hub Connection.
 * 
 * ```js 
 * import { SignalRClient } from 'platform/core'; 
 * ``` 
 * 
 * @example
 * export class TodoClient extends SignalRClient { 
 * 
 *   constructor() {
 *		super({
 *			baseUrlKey: `todoServiceUrl`,
 *			hubName: `eventHub`,
			hubType: `docker`,
 *			useAuthentication: true,
 *			keepAlive: false
 *		});
 *	}
 *  
 *   async onTodosChanged(callback) {
 *		await super.on(`ClientTodosChanged`, async (changeType) => {
 *			return callback(id, changeType);
 *		});
 *	}
 *
 *	async todoAdd() {
 *		await super.invoke(`TodosChanged`, `TODO_ADD`);
 *	}
 * }
 */
export class SignalRClient {

	/**
	 * Base class constructor that scaffolds reusable signalR clients
	 * 
	 * @param {SignalRParameters} parameters Constructor parameters.
	 */
	constructor(parameters) {
		this._connector = new SignalRConnector(parameters);
	}

	/**
	* Register a callback for every time the Hub is Connected
	* This will get called when hub is connected or when reconnected
	*
	* @param {Function | Promise} callback Callback to register when hub is connected
	* 
	* @returns {void}
	*/
	onConnected(callback) {
		this._connector.setOnConnectedCallback(callback);
	}

	/**
	* Gets the current hub's connection Id
	* 
	* @returns {Promise} Promise of async operation
	*/
	async getConnectionId() {
		await this._connector.ensureConnected();
		return this._connector.connectionId;
	}

	/**
	* Displays the current Error Message if in a error state
	* 
	* @type {String} 
	*/
	get errorState() {
		return this._connector.errorState;
	}

	/**
	* True if Hub is Connected
	* 
	* @type {Boolean} 
	*/
	get hasConnection() {
		return this._connector.hasConnection;
	}

	/**
	* Start the hub connection
	* 
	* @returns {Promise} Promise of async operation
	*/
	startConnection() {
		return this._connector.startHubConnection();
	}

	/**
	* Stop the hub connection
	* 
	* @returns {Promise} Promise of async operation
	*/
	stopConnection() {
		return this._connector.stopHubConnection();
	}

	/**
	* Invokes a hub method on the server using the specified name and arguments.
	*
	* @param {String} methodName Name of hub method to call
	* @param {any} args Args for hub method to call
	* 
	* @returns {Promise} Promise of async operation
	*/
	async invoke(methodName, ...args) {
		await this._connector.ensureConnected();
		return this._connector.hubConnection.invoke(methodName, ...args);
	}

	/**
	* Invokes a hub method on the server using the specified name and arguments. Does not wait for a response from the receiver.
	* 
	* @param {String} methodName Name of hub method to call
	* @param {any} args Args for hub method to call
	*
	* @returns {Promise} Promise of async operation
	*/
	async send(methodName, ...args) {
		await this._connector.ensureConnected();
		return this._connector.hubConnection.send(methodName, ...args);
	}

	/**
	 * Registers a handler that will be invoked when the hub method with the specified method name is invoked.
	 * 
	 * @param {String} methodName Name of hub method called on server
	 * @param {Function} handler Callback handler to invoke locally
	 * 
	 * @returns {Promise} Promise of async operation
	 */
	async on(methodName, handler) {
		await this._connector.ensureConnected();
		return this._connector.hubConnection.on(methodName, handler);
	}

	/**
	 * Registers an event handler which gets called when the connection is closed or lost.
	 * 
	 * @param {Function} handler Callback handler to invoke locally
	 * 
	 * @returns {Promise} Promise of async operation
	 */
	async onDisconnected(handler) {
		await this._connector.ensureConnected();
		return this._connector.hubConnection.onclose(handler);
	}

	/**
	 * Removes all handlers for the specified hub method.
	 * 
	 * @param {String} methodName Name of the Hub Method
	 * 
	 * @returns {Promise} Promise of async operation
	 */
	async off(methodName) {
		await this._connector.ensureConnected();
		await this._connector.hubConnection.off(methodName);
	}
}