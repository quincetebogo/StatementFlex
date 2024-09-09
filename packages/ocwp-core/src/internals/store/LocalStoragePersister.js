/**
 * Persists state to localStorage, with ability to retrieve and clear it.
 * 
 * @ignore
 */
class LocalStoragePersister {

	/**
	 * Gets the state for the given key.
	 *
	 * @param {String} name Unique of key of the state.
	 * 
	 * @returns {Object} State.
	 */
	get(name) {

		let state = null;

		if (name in window.localStorage) {

			try {
				state = JSON.parse(window.localStorage.getItem(name));
			} catch (error) {
				throw new Error(`Unable to get state for key '${name}' in localStorage`);
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
			window.localStorage.setItem(name, JSON.stringify(state));
		} catch (error) {
			throw new Error(`Unable to set state for key '${name}' in localStorage`);
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
		window.localStorage.removeItem(name);
	}
}

export default new LocalStoragePersister();