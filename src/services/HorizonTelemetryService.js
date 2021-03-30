import { SecurityContext } from 'platform/core';
import { Telemetry } from '../mocks/Telemetry';
import { v4 } from 'uuid';

/*
 * Horizon Telemetry
 *
 * Please see the Data Spec at https://confluence.capitecbank.co.za:8443/display/HOR/Horizon+Telemetry 
 */


/** The screens on which telemetry events are logged.
 * This correspond to the "Screen" column in the Data Spec.
 * @typedef {Object} TelemetryScreen
 */
export const TelemetryScreen = {
	WAIT_FOR_CALL: `Waiting For Call`,
	CONFIRM_CALLER: `Confirm Caller`,
	SEARCH_CLIENT: `Search Client`,
	ADD_CALLER_DETAILS: `Add Caller Details`
};


/** The event names to use when logging telemetry events.
 * This correspond to the "Action" and "eventName" columns in the Data Spec.
 * @typedef {Object} TelemetryEvent
 */
const TelemetryEvent = {
	// Accept Call
	INCOMING_CALL: `horizon.call.start-span`,
	INCIDENT_CREATED: `horizon.call.incident-created`,
	WORKFLOW_COMPLETED: `horizon.call.end-span`,


	// Confirm Caller
	IDENTIFY_CALLER_STARTS: `horizon.call.id-caller.start-span`,
	CALLER_IDENTIFIED: `horizon.call.id-caller.end-span`,

	SCRN_LD_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.start-span`,
	CNF_CLR_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.confirm`,
	CNF_CLR_NAVIGATE_SEARCH_CLIENT: `horizon.call.id-caller.confirm-caller.search-client`,
	CNF_CLR_NAVIGATE_ADD_CALLER_DETAILS: `horizon.call.id-caller.confirm-caller.add-caller-details`,
	CNF_CLR_NAVIGATE_END_CALL: `horizon.call.id-caller.confirm-caller.end-call`,
	SCR_UNLD_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.end-span`,
	
	SCR_LD_SEARCH_CLIENT: `horizon.call.id-caller.search-client.start-span`,
	SRCH_CLNT_SEARCH_CLIENT: `horizon.call.id-caller.search-client.search`,
	SRCH_CLNT_NAVIGATE_END_CALL: `horizon.call.id-caller.search-client.end-call`,
	SCR_UNLD_SEARCH_CLIENT: `horizon.call.id-caller.search-client.end-span`,
	
	SCR_LD_ADD_CALLER_DETAILS: `horizon.call.id-caller.add-caller.start-span`,
	ADD_DTL_ADD_CALLER_DETAILS_CANCEL: `horizon.call.id-caller.add-caller.cancel`,
	ADD_DTL_ADD_CALLER_DETAILS_CONFIRM: `horizon.call.id-caller.add-caller.confirm`,
	ADD_DTL_NAVIGATE_END_CALL: `horizon.call.id-caller.add-caller.end-call`,
	SCR_UNLD_ADD_CALLER_DETAILS: `horizon.call.id-caller.add-caller.end-span`
};


/** The type of telemetry event triggered.
 * This correspond to the eventType column in the Data Spec.
 * @typedef {Object} TelemetryEventType
 */
const TelemetryEventType = {
	SYSTEM: `system`,
	PERSON: `person`
};


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
			"horizon.call": ``,
			"id-caller": ``
		};
	}

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
	 * @param {IncomingCallModel} baggage Information to attach to the call/span
	 * @returns {void}
	 */
	incomingCall(baggage) {
		const telemetryCallSpanId = this.telemetry.spanStart({
			traceId: this.traceId,
			parentSpan: null,
			eventName: TelemetryEvent.INCOMING_CALL,
			tags: this._extractTags(TelemetryEvent.INCOMING_CALL),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "ivr": baggage.ivr },
				{ "ucid": baggage.ucid }
			]
		});

		// update current active span reference on span-start
		if (telemetryCallSpanId) {
			this.currentActiveSpans[`horizon.call`] = telemetryCallSpanId;
		}
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
	 * @param {IncidentCreatedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	incidentCreated(baggage) {
		this.telemetry.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`horizon.call`],
			parentSpan: null,
			eventName: TelemetryEvent.INCIDENT_CREATED,
			tags: this._extractTags(TelemetryEvent.INCIDENT_CREATED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "incident-reference": baggage.incident_reference },
				{ "incident-rec-id": baggage.incident_rec_id } 
			]
		});

		// event, thus no new span reference to update
	}


	/** Workflow completed telemetry event
	 * @screen N/A
	 * @event Workflow Completed
	 * @returns { void }
	 */
	workflowCompleted() {
		this.telemetry.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`horizon.call`],
			parentSpan: null,
			eventName: TelemetryEvent.WORKFLOW_COMPLETED,
			tags: this._extractTags(TelemetryEvent.WORKFLOW_COMPLETED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		// clear span reference
		this.currentActiveSpans[`horizon.call`] = null;
	}


	/** Identify Caller telemetry event
	 * @screen N/A
	 * @event Identify Caller Starts
	 * @returns { void }
	 */
	identifyCallerStarts() {
		const idCallerSpanId = this.telemetry.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans[`horizon.call`],
			eventName: TelemetryEvent.IDENTIFY_CALLER_STARTS,
			tags: this._extractTags(TelemetryEvent.IDENTIFY_CALLER_STARTS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		if (idCallerSpanId) {
			this.currentActiveSpans[`id-caller`] = idCallerSpanId;
		}
	}


	callerIdentified() {
		this.telemetry.spanEnd({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`id-caller`],
			parentSpan: null,
			eventName: TelemetryEvent.CALLER_IDENTIFIED,
			tags: this._extractTags(TelemetryEvent.CALLER_IDENTIFIED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		this.currentActiveSpans[`id-caller`] = null;
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------
	_extractTags(eventName) {
		return eventName.split(`.`);
	}

	_eventOriginator(eventType) {
		switch (eventType) {
			case TelemetryEventType.SYSTEM: 
				return `horizon-ui`;

			case TelemetryEventType.PERSON:
				return SecurityContext.getInstance().username;

			default:
				throw new Error(`unnrecognised event type`);
		}
	}
	
}