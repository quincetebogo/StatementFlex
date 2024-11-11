import { HttpTransportType, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { Configuration } from '../Configuration.js';
import { Constants } from './Constants.js';
import { Logger } from '../Logger.js';
import { Mutex } from 'async-mutex';
import Security from '../Security.js';

export class SignalRConnector {

	/**
	 * Base class constructor that scaffolds a Connection to an ASP.NET Core SignalR Hub
	 * 
	 * @param {SignalRParameters} parameters Constructor parameters.
	 */
	constructor(parameters) {

		this._validateParameters(parameters);

		this._baseUrlKey = parameters.baseUrlKey;
		this._hubName = parameters.hubName;
		this._useAuth = parameters.useAuthentication;
		this._errorMessage = ``;
		this._onConnectedCallback = null;

		this._mutex = new Mutex();

		this._options = {};
		if (parameters.useAuthentication === true) {
			if (parameters.customTokenFactory) {
				this._options.accessTokenFactory = parameters.customTokenFactory;
			} else {
				this._options.accessTokenFactory = async () => {
					if (Security.isAuthenticated) {
						await Security.ensureValidToken();
					}
					return Security.token;
				};
			}
		}

		if (parameters.hubType === Constants.signalR.EKS_HUB) {
			this._options.transport = HttpTransportType.WebSockets;
			this._options.skipNegotiation = true;
		} else {
			this._options.transport = HttpTransportType.ServerSentEvents;
		}

		this.hubConnection = null;

		if (parameters.keepAlive === true) {
			this._startKeepAlive();
		}
	}

	/**
	 * Connection error state Message
	 * 
	 * @type {String}
	 */
	get errorState() {
		return this._errorMessage;
	}

	/**
	 * Connection Id of the current hub connection
	 * 
	 * @type {String}
	 */
	get connectionId() {

		if (this.hasConnection) {
			return this.hubConnection.connectionId;
		}

		return ``;
	}

	/**
	 * True if Client has Connection to Hub
	 * 
	 * @type {Boolean}
	 */
	get hasConnection() {

		if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected &&
			this.hubConnection.state !== HubConnectionState.Disconnecting) {
			return true;
		}

		return false;
	}

	/**
	 * Function to set callback for onConnected event
	 * 
	 * @param {Function | Promise} callback Callback to register when hub is connected.
	 * 
	 * @return {void}
	 */
	setOnConnectedCallback(callback) {
		if (callback) {
			this._onConnectedCallback = callback;
		}
	}

	/**
	 * Function to start the hub connection
	 * 
	 * @return {Promise} Promise of async operation
	 */
	async startHubConnection() {

		await this._mutex
			.acquire()
			.then(async (release) => {
				try {

					if (this.hasConnection) {
						return;
					}

					if (!this._basePath) {
						this._basePath = await this._loadBasePath();
					}

					if (!this.hubConnection) {
						this.hubConnection = new HubConnectionBuilder()
							.withUrl(`${this._basePath}/${this._hubName}`, this._options)
							.build();
					}

					await this.hubConnection.start();
					console.debug(`[Hub] ${this._hubName} Connected`);

					this.hubConnection.onclose((e) => {
						console.debug(`[Hub] ${this._hubName} Disconnected`);
					});

					this._errorMessage = ``;
					this._triggerOnConnectedCallback();

				} catch (error) {
					this._errorMessage = error.message;
					Logger.getInstance().error(`Failed to Start '${this._hubName}' Hub Connection : ${error.message}`);
					throw error;
				} finally {
					release();
				}
			});
	}

	/**
	 * Function to stop the hub connection
	 * 
	 * @return {Promise} Promise of async operation
	 */
	async stopHubConnection() {

		try {
			if (!this.hasConnection) {
				return;
			}

			await this.hubConnection.stop();

		} catch (error) {
			this._errorMessage = error.message;
			Logger.getInstance().error(`Failed to Stop '${this._hubName}' Hub Connection : ${error.message}`);
			throw error;
		}
	}

	/**
	 * Function to check if hub is connected else will try to start new hub connection
	 * 
	 * @return {Promise} Promise of async operation
	 */
	async ensureConnected() {
		if (!this.hasConnection) {
			await this.startHubConnection();
		}
	}

	/**
	 * Loads the base path from config using provided key 
	 * 
	 * @return {Promise} Promise of async operation
	 */
	_loadBasePath() {
		return Configuration
			.getInstance()
			.getSetting(this._baseUrlKey);
	}

	/**
	 * Starts the keep alive to make sure the hub is always connected
	 * 
	 * @return {Promise} Promise of async operation
	 */
	_startKeepAlive() {
		const id = setInterval(async () => {
			try {
				await this.ensureConnected();
			} catch (error) {
				this._errorMessage = error.message;
				if (!this._useAuth && error.statusCode === 401) {
					clearInterval(id);
				}
				throw error;
			}
		}, 3000);
	}

	/**
	 * Triggers the OnConnected callback if provided
	 * 
	 * @return {void}
	 */
	_triggerOnConnectedCallback() {
		if (this._onConnectedCallback) {
			try {
				this._onConnectedCallback();
			} catch (error) {
				console.debug(`OnConnected Callback failed : ${error.message}`);
			}
		}
	}

	/**
	 * Function to validate parameters provided
	 * 
	 * @param {SignalRParameters} parameters Constructor parameters.
	 * 
	 * @return {void}
	 */
	_validateParameters(parameters) {

		if (!parameters) {
			throw new Error(`No parameters provided for hub connection`);
		}

		if (!parameters.hubName) {
			throw new Error(`No hub name provided`);
		}

		if (!parameters.baseUrlKey) {
			throw new Error(`No base url config key provided`);
		}
	}
}