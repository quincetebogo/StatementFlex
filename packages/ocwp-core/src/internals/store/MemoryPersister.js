/**
* Persists state to memory, with ability to retrieve and clear it.
*
* @ignore
*/
export class MemoryPersister {

	constructor() {
		this._state = null;
	}

	/**
	 * Gets the state.
	 *
	 * @returns {Object} State.
	 */
	get() {
		return this._state;
	}

	/**
	 * Sets the state.
	 * 
	 * @param {Object} state  State to set.
	 *
	 * @returns {void}.
	 */
	set(state) {
		this._state = state;
	}
}