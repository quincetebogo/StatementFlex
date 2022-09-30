import { SecurityContext, Telemetry, Utilities } from 'platform/core';
import { TelemetryStore } from 'app/store/TelemetryStore';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { v4 } from 'uuid';


/*
 * Horizon Telemetry
 *
 * Please see the Data Spec at https://confluence.capitecbank.co.za:8443/display/HOR/Horizon+Telemetry 
 */

/** The type of telemetry event triggered.
 * This correspond to the eventType column in the Data Spec.
 * @readonly
 * @enum {String} TelemetryEventType
 */
const TelemetryEventType = {
	SYSTEM: `system`,
	PERSON: `person`
};


/** Workflow outcome text
 * @readonly
 * @enum {Object} OutcomeScreen
 */
export const OutcomeScreen = {
	SUCCESS: `success`,
	FAIL: `fail`
};

/**
 * The TelemetryService is a helper utility to assist with the logging of Telemetry 
 * using the platform capability.
 *
 * @export
 * @class HorizonTelemetry
 * @extends Telemetry
 */
export class HorizonTelemetry extends Telemetry {
	// TODO: add logic to close all child spans when parent span gets closed. Log a warning if this happens.
	

	// TODO: OVERRIDE TO ALLOW OLD TELEMETRY CONTRACT. THIS MUST BE REMOVED AS SOON AS WE CAN GO TO THE NEW CONTRACT
	_validateTelemetryEventParams(params) {
		if (!params) {
			throw new Error(`"params" not provided`);
		}

		if (!params.traceId) {
            throw new Error(`"params.traceId" not provided`);
		}

		if (!params.eventName) {
			throw new Error(`"params.eventName" not provided`);
		}

		if (!params.eventType) {
			throw new Error(`"params.eventType" not provided`);
		}

		if (params.eventType !== `system` && params.eventType !== `person`) {
			throw new Error(`"params.eventType" invalid`);
		}

		if (!params.eventOriginator) {
			throw new Error(`"params.eventOriginator" not provided`);
		}

		if (!params.tags) {
			throw new Error(`"params.tags" not provided`);
		}

		if (!Array.isArray(params.tags)) {
            throw new Error(`"params.tags" invalid`);
        }

        if (params.baggage && !Array.isArray(params.baggage)) {
            throw new Error(`"params.baggage" invalid`);
        }

		return true;
	}

	// TODO: OVERRIDE TO ALLOW OLD TELEMETRY CONTRACT. THIS MUST BE REMOVED AS SOON AS WE CAN GO TO THE NEW CONTRACT
	_validateSpanStartParams(params, requireSpanId = false) {
		if (!params) {
            throw new Error(`"params" not provided`);
        }

        if (!params.traceId) {
            throw new Error(`"params.traceId" not provided`);
        }

        if (!params.eventName) {
            throw new Error(`"params.eventName" not provided`);
        }

        if (!params.eventType) {
            throw new Error(`"params.eventType" not provided`);
        }

        if (params.eventType !== `system` && params.eventType !== `person`) {
            throw new Error(`"params.eventType" invalid`);
        }

        if (!params.eventOriginator) {
            throw new Error(`"params.eventOriginator" not provided`);
        }

        if (!params.tags) {
            throw new Error(`"params.tags" not provided`);
        }

        if (!Array.isArray(params.tags)) {
            throw new Error(`"params.tags" invalid`);
        }

        if (params.baggage && !Array.isArray(params.baggage)) {
            throw new Error(`"params.baggage" invalid`);
        }

		return true;
	}

	// TODO: OVERRIDE TO ALLOW OLD TELEMETRY CONTRACT. THIS MUST BE REMOVED AS SOON AS WE CAN GO TO THE NEW CONTRACT
	_validateSpanEndParams(params) {
		if (!params) {
            throw new Error(`"params" not provided`);
        }

        if (!params.spanId) {
            throw new Error(`"params.spanId" not provided`);
        }

        if (!params.eventName) {
            throw new Error(`"params.eventName" not provided`);
        }

        if (!params.eventType) {
            throw new Error(`"params.eventType" not provided`);
        }

        if (params.eventType !== `system` && params.eventType !== `person`) {
            throw new Error(`"params.eventType" invalid`);
        }

        if (!params.eventOriginator) {
            throw new Error(`"params.eventOriginator" not provided`);
        }

        if (!params.tags) {
            throw new Error(`"params.tags" not provided`);
        }

        if (!Array.isArray(params.tags)) {
            throw new Error(`"params.tags" invalid`);
        }

        if (params.baggage && !Array.isArray(params.baggage)) {
            throw new Error(`"params.baggage" invalid`);
        }

		return true;
	}

	// #region INITIALISATION
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @deprecated Use getInstance() as is standard through the platform/Horizon
	 */
	static get instance() {
		return this._instance || (this._instance = new HorizonTelemetry());
	}

	/**
	 * @static
	 * @returns {HorizonTelemetry} Singleton
	 */
	static getInstance() {
		return this.instance;
	}

	constructor() {
		super();

		if (this._instance) {
			return this._instance;
		}

		this._traceId = ``;
		this.activeSpanTree = [];

		this.telemetryStore = new TelemetryStore();

		this._initialise();
	}

	// #endregion INITIALISATION

	// ----------
	// PROPERTIES
	// ----------

	set traceId(val) {
		this._traceId = val;
	}

	get traceId() {
		let traceID = ``;

		if (!this._traceId) {
			const telemetryDetails = this.telemetryStore.getTelemetryDetails();
			if (telemetryDetails && telemetryDetails.traceId) {
				traceID = telemetryDetails.traceId;
			} else {
				// If traceId is still null, no trace was ever started, so starting a new trace.
				this.newTrace();
			}
		}
		return this._traceId || traceID;
	}

	// #region PUBLIC METHODS
	// --------------
	// PUBLIC METHODS
	// --------------

	/** Starts a new trace.
	 * @todo If graceful shutdown of traces are required, traceId can be saved in state and logic be added to close any stale traces
	 * 
	 * @param {String} traceId Optional trace ID if this is a continuation of a trace started elsewhere.
	 * @returns {String} a GUID string
	 */
	newTrace(traceId = null) {
		this.traceId = traceId || v4();
		
		const telemetryDetails = {
			traceId: this.traceId,
			activeSpanTree: this.activeSpanTree
		};
		this.telemetryStore.clearState();
		this.telemetryStore.setTelemetryDetails(telemetryDetails);

		return this.traceId;
	}

	/**
	 * Starts a span for the requested event and added to active span tree.
	 * 
	 * @param {string} eventName Event name to start a span
	 * @param {object} baggage Options, this generally holds details of event
	 * @param {boolean} systemTriggered Flag to determin telemetry event type
	 * @param {string} originatingSystem Name of system triggering start span
	 * @returns {Promise<void>} A Promise for starting a telemetry span
	 */
	async startSpan(eventName, baggage = null, systemTriggered = true, originatingSystem = null) {

		/**
		 * Extracting eventName(call.id-caller.confimr-caller) into events array(['call', 'id-caller', 'confirm-caller'])
		 * And finding the current event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = events[events.length - 1];
		const currentSpanID = this._getSpanID(currentSpan);
		const eventType = systemTriggered ? TelemetryEventType.SYSTEM : TelemetryEventType.PERSON;

		// If the specific span got intialized already, do nothing and return
		if (currentSpanID) {
			return;
		}

		const spanID = await super.spanStart({
			baggage: this._formatBaggageDetails(baggage || []),
			eventName: `horizon.${eventName}.start-span`,
			eventOriginator: this._eventOriginator(eventType, originatingSystem),
			eventType: eventType,
			parentSpan: this._getParentSpanID(eventName),
			tags: this._extractTags(`horizon.${eventName}.start-span`),
			traceId: this.traceId
		});

		if (spanID) {

			/**
			 * Assigning the sapnd id to current active span tree('call'/ 'id-caller'/ 'confirm-caller')
			 */
			this._addToActiveSpanTree(currentSpan, spanID, eventName);
		}
	}

	/**
	 * Ends the span for requested event and removed from active span tree.
	 * 
	 * @param {string} eventName Event name to start a span
	 * @param {object} baggage Options, this generally holds details of event
	 * @param {boolean} systemTriggered Flag to determin telemetry event type
	 * @param {boolean} closeParentSpan Flag tells to close parent span or not
	 * @param {boolean} closeChildSpans Flag tells to close its child spans or not
	 * @param {string} originatingSystem Name of system triggering end span
	 * @returns {Promise<void>} A promise to end the telemetry span
	 */
	async endSpan(eventName, baggage = null, systemTriggered = true, closeParentSpan = false, closeChildSpans = false, originatingSystem = null) {

		/**
		 * Extracting eventName(call.id-caller) into events array(['call', 'id-caller'])
		 * And finding the current span of an event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = events[events.length - 1];
		const spanId = this._getSpanID(currentSpan);
		const eventType = systemTriggered ? TelemetryEventType.SYSTEM : TelemetryEventType.PERSON;

		if (this.traceId && spanId) {

			if (closeChildSpans) {
				await this.closeChildSpans(eventName, originatingSystem);
			}

			await super.spanEnd({
				baggage: this._formatBaggageDetails(baggage || []),
				eventName: `horizon.${eventName}.end-span`,
				eventOriginator: this._eventOriginator(eventType, originatingSystem),
				eventType: eventType,
				parentSpan: null,
				spanId: spanId,
				tags: this._extractTags(`horizon.${eventName}.end-span`),
				traceId: this.traceId
			});
	
			// disposing current span node reference
			this._deleteFromActiveSpanTree(currentSpan);

			if (closeParentSpan) {
				events.pop();
				this.endSpan(events.join(`.`));
			}
		} else {
			// TODO: Log that there was a telemetry failure (missing trace ID or span ID)
		}
	}

	/**
	 * Logs an event for the current span, these are generally buttons clicks on the screen
	 * 
	 * @param {string} eventName Event name to start a span
	 * @param {object} baggage Options, this generally holds details of event
	 * @param {boolean} systemTriggered Flag to determin telemetry event type
	 * @param {string} originatingSystem Name of system triggering start span
	 * @returns {Promise<void>} A promise for logging the event
	 */
	async logEvent(eventName, baggage = null, systemTriggered = false, originatingSystem = null) {

		/**
		 * Extracting eventName(call.incident-created) into events array(['call', 'incident-created'])
		 * And finding the current span of an event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = this._getCurrentSpanofEvent(events);
		const eventType = systemTriggered ? TelemetryEventType.SYSTEM : TelemetryEventType.PERSON;

		await super.event({
			baggage: this._formatBaggageDetails(baggage || []),
			eventName: `horizon.${eventName}`,
			eventOriginator: this._eventOriginator(eventType, originatingSystem),
			eventType: eventType,
			parentSpan: null,
			spanId: this._getSpanID(currentSpan),
			tags: this._extractTags(`horizon.${eventName}`),
			traceId: this.traceId
		});
		// event, thus no new span reference to update
	}

	/**
	 * Closes all the child spans of an event
	 * 
	 * @param {*} parentEvent The parent event.
	 * @param {string} originatingSystem Name of system triggering start span
	 * @returns {Promise<void>} A promise to class all child spans of the parent event
	 */
	async closeChildSpans(parentEvent, originatingSystem = null) {

		if (!parentEvent) {
			return;
		}

		const childSpans = this.activeSpanTree.filter(obj => obj.event.startsWith(parentEvent) && obj.event !== parentEvent);

		await childSpans.reduceRight(async (promise, span) => {
			// This line will wait for the last async function to finish.
			// The first iteration uses an already resolved Promise
			// so, it will immediately continue.
			await promise;
			await this.endSpan(span.event, {
				"info": `Closing span, as commanded by parent span`
			}, true, false, false, originatingSystem);
		}, Promise.resolve());
	}

	// #endregion PUBLIC METHODS

	// #region PRIVATE METHODS

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		const telemetryDetails = this.telemetryStore.getTelemetryDetails();
		const _activeSpans = telemetryDetails?.activeSpanTree ?? [];

		this.activeSpanTree = [..._activeSpans, ...this.activeSpanTree];
	}

	/**
	 * Extract tags from event name by (.)
	 * 
	 * @param {string} eventName Event name(horizon.call.incident-created)
	 * @returns {Array} Array of tags
	 */
	_extractTags(eventName) {
		return eventName && eventName.split(`.`);
	}

	_eventOriginator(eventType, originatingSystem = null) {
		switch (eventType) {
			case TelemetryEventType.SYSTEM: 
				return originatingSystem ?? `horizon-ui`;

			case TelemetryEventType.PERSON:
				return SecurityContext.getInstance().username;

			default:
				throw new Error(`unrecognized event type`);
		}
	}

	/**
	 * Determines the current span for the log event requested.
	 * E.g: horizon.call.fulfill-need.stop-card-outcome -> stop-card is the current span for 'outcome' event
	 * 
	 * @param {string} events Events
	 * @returns {string} Current span name
	 */
	_getCurrentSpanofEvent(events) {
		const event = events[events.length - 1];
		let eventIndex = events.length - 1;
		let currSpan = ``;

		while (!currSpan && eventIndex > 0) {
			currSpan = events[eventIndex - 1];
			const currSpanID = this._getSpanID(currSpan);

			if (!currSpanID) {
				currSpan = ``;
				eventIndex--;
			}
		}
		return currSpan;
	}

	/**
	 * Retrieves the span id from active span tree for the requested event/span
	 * 
	 * @param {string} eventName Event name (call/ stop-card/ confirm-caller)
	 * @returns {string} Span ID
	 */
	_getParentSpanID(eventName) {
		const eventsArr = this._extractTags(eventName);
		const curSpanIndex = eventsArr.length - 1;
		const parentSpan = eventsArr[curSpanIndex - 1];
		
		return this._getSpanID(parentSpan);
	}

	/**
	 * Retrieves the parent span name from active span tree for the requested event/span
	 * 
	 * @param {string} eventName Event name (call/ stop-card/ confirm-caller)
	 * @returns {string} Parent span name
	 */
	_getParentSpanName(eventName) {
		const eventsArr = this._extractTags(eventName);
		const curEventIndex = eventsArr.length - 1;
		const parentEvent = eventsArr[curEventIndex - 1];
		
		return parentEvent;
	}

	/**
	 * Formats baggage object to array
	 * 
	 * @param {object} baggage Object holds event details
	 * @returns {Array} Baggage array
	 */
	_formatBaggageDetails(baggage) {
		return Object.entries(baggage).map(item => ({ "key": item[0], "value": this._trimBaggage(item[1]) }));
  }
  
	/**
	 * trims baggage
	 * 
	 * @param {object} item Object holds baggage item
	 * @returns {string} baggage item
	 */
	 _trimBaggage(item) {
		if (item === null || item === undefined || item === NaN) {
			return ``;
		}


		if (Utilities.isString(item)) {
			return String(item.trim());
		}
		
		return String(JSON.stringify(item).trim());
		
	}

	/**
	 * On starting a span for an event, this function is used to maintain active spans
	 * with parent span mapping
	 * 
	 * @param {string} span Event name (call/ stop-card/ confirm-caller)
	 * @param {string} spanID Span ID, returned by startSpan telemetry
	 * @param {string} event Current event
	 * @returns {void}
	 */
	_addToActiveSpanTree(span, spanID, event) {
		const node = this._generateNode(span, spanID, event);

		this.activeSpanTree.push(node);
		this._updateTelemetryStore();
	}

	/**
	 * This deletes or splice the requested event node from active span tree
	 * 
	 * @param {string} span Event name
	 * @returns {void}
	 */
	_deleteFromActiveSpanTree(span) {
		if (this.activeSpanTree.length === 0) {
			return;
		}

		const spanIndex = this.activeSpanTree.findIndex(item => item.span === span);
		this.activeSpanTree.splice(spanIndex, 1);
		this._updateTelemetryStore();
	}

	/**
	 * If the childspans are still active for root span, this function
	 * will close those child spans saying parent span closing child span
	 * @returns {void}
	 */
	async _endUnClosedChildSpans() {
		const unClosedSpans = this.activeSpanTree.filter(span => !isNullorEmpty(span.parentSpan));

		await unClosedSpans.reduceRight(async (promise, span) => {
			// This line will wait for the last async function to finish.
			// The first iteration uses an already resolved Promise
			// so, it will immediately continue.
			await promise;
			await this.endSpan(span.event, {
				"info": `Parent span closing child span`
			});
		}, Promise.resolve());
	}

	_generateNode(span, spanID, event) {
		const parentSpan = this._getParentSpanName(event);

		return {
			"span": span,
			"spanID": spanID,
			"parentSpan": parentSpan,
			"event": event
		};
	}

	_getSpanID(span) {
		if (this.activeSpanTree.length === 0) {
			return null;
		}

		const spanObj = this.activeSpanTree.find(item => item.span === span);
		return spanObj && spanObj.spanID;
	}

	_getSpanDetails(span) {
		if (this.activeSpanTree.length === 0) {
			return;
		}

		return this.activeSpanTree.find(item => item.span === span);
	}

	_updateTelemetryStore() {
		const telemetryDetails = this.telemetryStore.getTelemetryDetails();
		telemetryDetails.activeSpanTree = this.activeSpanTree;

		this.telemetryStore.setTelemetryDetails(telemetryDetails);
	}

	// #endregion PRIVATE METHODS
	
}