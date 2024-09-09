import { ExecutionContext, Logger, Store } from 'platform/core';

/**
 * Simple in-memory store to aid state management.
 * 
 * For a more info, please follow this tutorial:
 * https://confluence.capitecbank.co.za:8443/x/7gVCEw 
 * 
 */
export class AppStore extends Store {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super({
			name: `AppStore`,
			logStateChanges: true
		});

		// Variables
		this._executionContext = ExecutionContext.getInstance();
		this._logger = Logger.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

    /**
	 * @static
     * @returns {AppStore} Singleton
     */
	static getInstance() {
		return this.instance || (this.instance = new AppStore());
	}

	/**
	 * Simple method that simulates retrieving remote data.
	 * 
	 * For more info, please follow this tutorial:
     * https://confluence.capitecbank.co.za:8443/x/WIU9D
	 *
	 * @return {Object|Null} Dummy data to return.
	 */
	async getDummyData() {

		let dummyData = null;

		try {

			// Set flag to show busy indicator.
			this.setState({ isBusy: true }, `IS_BUSY_TRUE`);

			// Query data from channel service.
			dummyData = await this._fakeApiCall();

			// Log something useful about query's outcome.
			this._logger.info(`Retrieved dummy data: ${JSON.stringify(dummyData)}`, `AppStore.getDummyData`);

			// Set dummy data state.
			this.setState({ dummyData }, `GET_DUMMY_DATA`);

		} catch (error) {

			// Log something useful about a possible error that ocurred.
			this._logger.error(error, `AppStore.getDummyData`);

		} finally {

			// Set flag to hide busy indicator.
			this.setState({ isBusy: false }, `IS_BUSY_FALSE`);
		}

		return dummyData;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_fakeApiCall() {

		// Resolve with dummy data after one second.
		return new Promise((resolve) => setTimeout(() => {
			resolve({ foo: `bar` });
		}, 1000));
	}
}