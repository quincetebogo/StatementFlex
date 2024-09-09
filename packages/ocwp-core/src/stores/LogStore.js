
import { AuditModel } from '../models/AuditModel.js';
import { Constants } from '../internals/Constants.js';
import { Store } from '../Store.js';

export class LogStore extends Store {

	/**
	 * @static
	 * @returns {LogStore} Singleton
	 */

	constructor() {
		super({
			name: `log-store`,
			persistence: `localStorage`,
			logStateChanges: false
		});
	}

	/**
	 * Gets a retry Queue from the store using a given key.
	 *
	 * @param {String} key Key used to retrieve queue.
	 * @returns {Array} Array stored in the store if found else returns empty array.
	 */
	getRetryQueue(key) {

		const state = this.getState();
		if (state && state[key]) {
			return state[key];
		}
		return [];
	}

	/**
	 * Pushes an item onto the back of the retry Queue. Maximum size is 500, if exceeded oldest entry will be removed.
	 *
	 * @param {String} key Key used to retrieve queue.
	 * @param {LogModel | AuditModel} logElement Item to be pushed onto the queue.
	 * @returns {void}
	 */
	pushRetryQueue(key, logElement) {

		const queue = this.getRetryQueue(key);
		if (queue.length >= Constants.logStore.QUEUE_MAX_SIZE) {
			console.log(`Retry queue full, removing oldest log entry.`);
			queue.shift();
		}

		if (logElement) {
			queue.push(logElement);
		}

		this.setState({ [key]: queue }, `SET_LOGQUEUES`);
	}

	/**
	 * Gets and removes first element from the retry queue.
	 *
	 * @param {String} key Key used to retrieve queue.
	 * @returns {LogModel | AuditModel} The first item on the requried queue.
	 */
	shiftRetryQueue(key) {

		const queue = this.getRetryQueue(key);
		const element = queue.shift();
		this.setState({ [key]: queue }, `REMOVE_LOGQUEUES`);
		return element;
	}

	/**
	 * Pushes an item into the front of the retry Queue. Maximum size is 500, if exceeded oldest entry will be removed.
	 *
	 * @param {String} key Key used to retrieve queue.
	 * @param {LogModel | AuditModel} logElement Item to be pushed onto the queue.
	 * @returns {void}
	 */
	unshiftRetryQueue(key, logElement) {

		const queue = this.getRetryQueue(key);
		if (queue.length >= Constants.logStore.QUEUE_MAX_SIZE) {
			queue.shift();
		}

		if (logElement) {
			queue.unshift(logElement);
		}

		this.setState({ [key]: queue }, `SET_LOGQUEUES`);
	}
}

// Export instance (singleton)
export default new LogStore();