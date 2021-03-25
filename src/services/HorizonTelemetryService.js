import { Telemetry } from '../mocks/Telemetry';
import { v4 } from 'uuid';
import { SecurityContext } from 'platform/core';


/**
 * @typedef {Object} TelemetryScreen
 */
export const TelemetryScreen = {
	WAIT_FOR_CALL : "Waiting For Call"
}


const TelemetryEvent = {
	INCOMING_CALL : "horizon.call.start-span",
	INCIDENT_CREATED : "horizon.call.incident-created",
	WORKFLOW_COMPLETED : "horizon.call.end-span"
}


const TelemetryEventType = {
	SYSTEM : "system",
	PERSON : "person"
}


/**
 * The TelemetryService is a helper utility to assist with the logging of Telemetry 
 * using the platform capability.
 *
 * @export
 * @class TelemetryService
 */
export class HorizonTelemetry {
	
	// --------------
	// INITIALISATION
	// --------------
	static get instance() {
		return this._instance || (this._instance = new HorizonTelemetry());
	}

	constructor() {

		if (this._instance) {
			return this._instance;
		}

		this.telemetry = new Telemetry();

		this.currentActiveSpans = {
			"horizon.call" 	: "",
			"id-caller"		: ""
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/** Starts a new trace.
	 * @todo If graceful shutdown of traces are required, traceId can be saved in state and logic be added to close any stale traces
	 * 
	 * @param {String} traceId Optional trace ID if this is a continuation of a trace started elsewhere.
	 */
	newTrace(traceId = null) {
		this.traceId = traceId || v4();
	}

	/**
	 * @typedef {Object} IncomingCallModel
	 * @property {TelemetryScreen} screen The screen on which the event got triggered
	 * @property {String} ivr The IVR selection
	 * @property {String} ucid The Unique Call Identifier passed on from the PABX
	 */

	/** Starts new span on new call
	 * @screen Waiting For Call
	 * @event Incoming Call
	 * 
	 * @param {IncomingCallModel} baggage
	 */
	incomingCall(baggage) {	
		var telemetryCallSpanId = this.telemetry.spanStart({
			traceId : this.traceId,
			parentSpan : null,
			eventName : TelemetryEvent.INCOMING_CALL,
			tags : this._extractTags(TelemetryEvent.INCOMING_CALL),
			eventType : TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage : [	{"screen" 		: baggage.screen},
						{"ivr" 			: baggage.ivr},
						{"ucid" 		: baggage.ucid} ]
		});

		// update current active span reference on span-start
		if(telemetryCallSpanId) this.currentActiveSpans["horizon.call"] = telemetryCallSpanId;
	}


	/**
	 * @typedef {Object} IncidentCreatedModel
	 * @property {String} incident_reference 
	 * @property {String} incident_rec_id 
	 */

	/** Incident created telemetry event
	 * @screen N/A
	 * @event Incident Created
	 * 
	 * @param {IncidentCreatedModel} baggage
	 */
	incidentCreated(baggage) {	
		this.telemetry.event({
			traceId : this.traceId,
			spanId : this.currentActiveSpans["horizon.call"],
			parentSpan : null,
			eventName : TelemetryEvent.INCIDENT_CREATED,
			tags : this._extractTags(TelemetryEvent.INCIDENT_CREATED),
			eventType : TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage : [	{"incident-reference"	: baggage.incident_reference},
						{"incident-rec-id"		: baggage.incident_rec_id} ]
		});

		// event, thus no new span reference to update
	}


	/** Workflow completed telemetry event
	 * @screen N/A
	 * @event Workflow Completed
	 */
	workflowCompleted() {	
		this.telemetry.event({
			traceId : this.traceId,
			spanId : this.currentActiveSpans["horizon.call"],
			parentSpan : null,
			eventName : TelemetryEvent.WORKFLOW_COMPLETED,
			tags : this._extractTags(TelemetryEvent.WORKFLOW_COMPLETED),
			eventType : TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		// clear span reference
		this.currentActiveSpans["horizon.call"] = null;
	}



	// ---------------
	// PRIVATE METHODS
	// ---------------
	_extractTags(eventName) {
		return eventName.split(".");
	}

	_eventOriginator(eventType) {
		switch(eventType) {
			case TelemetryEventType.SYSTEM : 
				return "horizon-ui"

			case TelemetryEventType.PERSON :
				return SecurityContext.getInstance().username;
		}
	}
	
}
