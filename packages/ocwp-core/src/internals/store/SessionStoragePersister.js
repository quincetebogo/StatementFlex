/**
 * Persists state to sessionStorage, with ability to retrieve and clear it.
 * 
 * @ignore
 */
class SessionStoragePersister {

	/**
	 * Gets the state for the given key.
	 *
	 * @param {String} name Unique of key of the state.
	 * 
	 * @returns {Object} State.
	 */
	get(name) {

		let state = null;

		if (name in window.sessionStorage) {

			try {
				state = JSON.parse(window.sessionStorage.getItem(name));
			} catch (error) {
				throw new Error(`Unable to get state for key '${name}' in sessionStorage`);
			}
		}

		return state;
	}

	/**
	 * Sets the state for the given key.
	 *
	 * @param {Object} state  State to set.
	 * @param {String} name Unique of key of the state.
	 * 
	 * @returns {void}
	 */
	set(state, name) {

		try {
			window.sessionStorage.setItem(name, JSON.stringify(state));
		} catch (error) {
			throw new Error(`Unable to set state for key '${name}' in sessionStorage`);
		}
	}

	/**
	 * Clear the state for the given key.
	 *
	 * @param {String} name Unique of key of the state.
	 * 
	 * @returns {void}
	 */
	clear(name) {
		window.sessionStorage.removeItem(name);
	}
}

export default new SessionStoragePersister();