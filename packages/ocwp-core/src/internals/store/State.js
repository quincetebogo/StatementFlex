import LocalStoragePersister from './LocalStoragePersister.js';
import { MemoryPersister } from './MemoryPersister.js';
import SessionStoragePersister from './SessionStoragePersister.js';
import { Utilities } from '../../Utilities.js';
import { getName } from './Common.js';

/**
 * Manages state data using supported persisters.
 * 
 * @ignore
 * @hideconstructor
 */
class State {

	constructor() {
		this._state = {};
	}

	/**
	 * Initialises the state for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {void}
	 */
	init(settings) {

		if (!this._state[getName(settings)]) {

			// Init history (in memory only).
			this._state[getName(settings)] = {
				history: []
			};

			switch (settings.persistence) {
				case `memory`:
					this._state[getName(settings)].persister = new MemoryPersister();
					break;
				case `sessionStorage`:
					this._state[getName(settings)].persister = SessionStoragePersister;
					break;
				case `localStorage`:
					this._state[getName(settings)].persister = LocalStoragePersister;
					break;
				default:
					throw new Error(`Unsupported setting "persistence: '${settings.persistence}' provided`);
			}
		}
	}

	/**
	 * Gets the state for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * @param {String} [propertyName=null] When specified, returns this property of the state.
	 * @param {boolean} [deepCloneReturnedState=true] When true, returns a cloned copy of the state (recommended). 
	 * 
	 * NOTE: When false and the settings context had "persistence: 'memory'", a reference to the state will 
	 * be returned and it's up to the consumer to ensure the state isn't changed from the outside.
	 * 
	 * @returns {Object} State to return.
	 */
	get(settings, propertyName = null, deepCloneReturnedState = true) {

		let state = null;
		const storedState = this._state[getName(settings)].persister.get(getName(settings));

		if (storedState) {

			if (propertyName) {
				if (storedState.hasOwnProperty(propertyName)) {
					state = storedState[propertyName];
				}
			} else {
				state = storedState;
			}

			if (state && deepCloneReturnedState) {
				state = Utilities.deepCopy(state);
			}
		}

		return state;
	}

	/**
	 * Sets the state for the given settings context.
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * @param {Object} state State to set.
	 * @param {Boolean} [deepCloneState=true] When true, clones the provided state before setting it.
	 * 
	 * @returns {void}
	 */
	set(settings, state, deepCloneState = true) {

		const currentState = this.get(settings, null, deepCloneState);
		const statePersister = this._state[getName(settings)].persister;

		if (deepCloneState) {
			statePersister.set({ ...currentState, ...Utilities.deepCopy(state) }, getName(settings));
		} else {
			statePersister.set({ ...currentState, ...state }, getName(settings));
		}
	}

	/**
	 * Clears the state (and history) for the given settings context. 
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {void}
	 */
	clear(settings) {

		// Clear state history.
		this._state[getName(settings)].history = [];

		// Clear state.
		if (settings.persistence === `memory`) {
			this._state[getName(settings)].persister.set(null);
		} else if (settings.persistence === `sessionStorage` || settings.persistence === `localStorage`) {
			this._state[getName(settings)].persister.clear(getName(settings));
		}
	}

	/**
	 * Returns reference to the state mutation history for the given settings context. 
	 *
	 * @param {StoreStateSettings} settings Setting for state context.
	 * 
	 * @returns {Array} History records.
	 */
	getHistory(settings) {
		return this._state[getName(settings)].history;
	}
}

export default new State();