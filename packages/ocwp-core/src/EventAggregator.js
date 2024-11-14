/**
 * Helper class to facilitate pub / sub capabilities for user-defined events with optional payloads.
 * 
 * ```js 
 * import { EventAggregator } from 'platform/core'; 
 * ```
 */
export class EventAggregator {

    /**
     * @static
     * @returns {EventAggregator} Singleton
     */
	static getInstance() {
		return this.instance || (this.instance = new EventAggregator());
	}

    /**
     * @hideconstructor
     */
	constructor() {
		this.eventLookup = {};
	}

    /**
     * Publish an event.
     *
     * @param {String} event Name of event to publish.
     * @param {Object} [data] Event payload.
     * 
     * @returns {void}
     */
	publish(event, data) {

		if (!event || typeof event !== `string`) {
			throw new Error(`Invalid "event" was specified.`);
		}

		// Get subscribers for event.
		let subscribers = this.eventLookup[event];

		if (subscribers) {

			subscribers = subscribers.slice();
			let i = subscribers.length;

			// Call each subscriber.
			while (i--) {
				subscribers[i](data, event);
			}
		}
	}

    /**
     * Subscribe to an event with manual disposal.
     *
     * @param {String} event Name of event to subscribe to.
     * @param {Function} callback Event handler with ability to handle optional data.
     * 
     * @returns {Object} Object containing a "dispose()" method on it to call in order to release subscription.
     */
	subscribe(event, callback) {

		if (!event || typeof event !== `string`) {
			throw new Error(`Invalid "event" parameter was specified.`);
		}

		if (!callback || typeof callback !== `function`) {
			throw new Error(`Invalid "callback" parameter was specified.`);
		}

		const handler = callback;
		const subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);

		subscribers.push(handler);

		return {

			dispose() {
				const subscriber = subscribers.indexOf(handler);

				if (subscriber !== -1) {
					subscribers.splice(subscriber, 1);
				}
			}
		};
	}

    /**
     * Subscribe to an event with auto disposal.
     *
     * @param {String} event Name of event.
     * @param {Function} callback Event handler.
     * 
     * @returns {void}
     */
	subscribeOnce(event, callback) {

		const sub = this.subscribe(event, (a, b) => {
			sub.dispose();

			return callback(a, b);
		});

		return sub;
	}
}

export default EventAggregator.getInstance();