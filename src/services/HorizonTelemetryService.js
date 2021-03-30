import { Telemetry } from '../mocks/Telemetry';
import { v4 } from 'uuid';
import { SecurityContext } from 'platform/core';


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
	WAIT_FOR_CALL 	: "Waiting For Call",
	CONFIRM_CALLER	: "Confirm Caller",
	SEARCH_CLIENT	: "Search Client",
	ADD_CALLER_DETAILS : "Add Caller Details"
}


/** The event names to use when logging telemetry events.
 * This correspond to the "Action" and "eventName" columns in the Data Spec.
 * @typedef {Object} TelemetryEvent
 */
const TelemetryEvent = {
	// Accept Call
	INCOMING_CALL 		: "horizon.call.start-span",
	INCIDENT_CREATED 	: "horizon.call.incident-created",
	WORKFLOW_COMPLETED 	: "horizon.call.end-span",


	// Confirm Caller
	IDENTIFY_CALLER_STARTS		: "horizon.call.id-caller.start-span",
	CALLER_IDENTIFIED			: "horizon.call.id-caller.end-span",

	SCR_LD_CONFIRM_CALLER		: "horizon.call.id-caller.confirm-caller.start-span",
	SELECT_CONFIRM_CALLER		: "horizon.call.id-caller.confirm-caller.confirm",
	SELECT_SEARCH_CLIENT : "horizon.call.id-caller.confirm-caller.search-client",
	SELECT_ADD_CALLER_DETAILS	: "horizon.call.id-caller.confirm-caller.add-caller-details",
	SCR_UNLD_CONFIRM_CALLER 	: "horizon.call.id-caller.confirm-caller.end-span",
	
	SCR_LD_SEARCH_CLIENT		: "horizon.call.id-caller.search-client.start-span",
	SELECT_SEARCH_CLIENT		: "horizon.call.id-caller.search-client.search",
	SCR_UNLD_SEARCH_CLIENT		: "horizon.call.id-caller.search-client.end-span",
	
	SCR_LD_ADD_CALLER_DETAILS 			: "horizon.call.id-caller.add-caller.start-span",
	ADD_CALLER_DETAILS_CANCEL	: "horizon.call.id-caller.add-caller.cancel",
	ADD_CALLER_DETAILS_CONFIRM	: "horizon.call.id-caller.add-caller.confirm",
	SCR_UNLD_ADD_CALLER_DETAILS 		: "horizon.call.id-caller.add-caller.end-span",
}


/** The type of telemetry event triggered.
 * This correspond to the eventType column in the Data Spec.
 * @typedef {Object} TelemetryEventType
 */
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
	//TODO: add logic to close all child spans when parent span gets closed. Log a warning if this happens.
	
	//#region INITIALISATION
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
			"id-caller"		: "",
			"confirm-caller": "",
			"search-client"	: "",
			"add-caller"	: ""
		}

	}

	//#endregion INITIALISATION


	//#region PUBLIC METHODS
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


	//#region ACCEPT CALL

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
		let telemetryCallSpanId = this.telemetry.spanStart({
			traceId 	: this.traceId,
			parentSpan 	: null,
			eventName 	: TelemetryEvent.INCOMING_CALL,
			tags 		: this._extractTags(TelemetryEvent.INCOMING_CALL),
			eventType 	: TelemetryEventType.SYSTEM,
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
	 * @property {String} incidentReference 
	 * @property {String} incidentRecId 
	 */

	/** Incident created telemetry event
	 * @screen N/A
	 * @event Incident Created
	 * 
	 * @param {IncidentCreatedModel} baggage
	 */
	incidentCreated(baggage) {	
		this.telemetry.event({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["horizon.call"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.INCIDENT_CREATED,
			tags 		: this._extractTags(TelemetryEvent.INCIDENT_CREATED),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage : [	{"incident-reference"	: baggage.incidentReference},
						{"incident-rec-id"		: baggage.incidentRecId} ]
		});

		// event, thus no new span reference to update
	}


	/** Workflow completed telemetry event
	 * @screen N/A
	 * @event Workflow Completed
	 */
	workflowCompleted() {	
		this.telemetry.spanEnd({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["horizon.call"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.WORKFLOW_COMPLETED,
			tags 		: this._extractTags(TelemetryEvent.WORKFLOW_COMPLETED),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		// clear span reference
		this.currentActiveSpans["horizon.call"] = null;
	}

	//#endregion ACCEPT CALL


	//#region CONFIRM CALLER

	/** Identify Caller telemetry event
	 * @screen N/A
	 * @event Identify Caller Starts
	 */
	identifyCallerStarts() {
		let idCallerSpanId = this.telemetry.spanStart({
			traceId 	: this.traceId,
			parentSpan 	: this.currentActiveSpans["horizon.call"],
			eventName 	: TelemetryEvent.IDENTIFY_CALLER_STARTS,
			tags 		: this._extractTags(TelemetryEvent.IDENTIFY_CALLER_STARTS),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		if (idCallerSpanId) this.currentActiveSpans["id-caller"] = idCallerSpanId;
	}


	/** Ending Identify Caller span telemetry event
	 * @screen N/A
	 * @event Caller Identified
	 */
	callerIdentified() {
		this.telemetry.spanEnd({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["id-caller"],
			parentSpan	: null,
			eventName 	: TelemetryEvent.CALLER_IDENTIFIED,
			tags 		: this._extractTags(TelemetryEvent.CALLER_IDENTIFIED),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		this.currentActiveSpans["id-caller"] = null;
	}


	/**
	 * @typedef {Object} ScrLdConfirmCallerModel
	 * @property {String} screen 
	 * @property {String} initialPrimaryNeed
	 * @property {String} initialSpecificNeed 
	 * @property {String} initialClientCif 
	 */

	/** Confirm Caller screen loaded telemetry event
	 * @screen Confirm Caller
	 * @event Screen Load: Confirm Caller
	 * 
	 * @param {ScrLdConfirmCallerModel} baggage
	 */
	screenLoadConfirmCaller(baggage) {
		let spanId = this.telemetry.spanStart({
			traceId 	: this.traceId,
			parentSpan 	: this.currentActiveSpans["id-caller"],
			eventName 	: TelemetryEvent.SCR_LD_CONFIRM_CALLER,
			tags 		: this._extractTags(TelemetryEvent.SCR_LD_CONFIRM_CALLER),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage		: [
				{ "screen"					: baggage.screen				},
				{ "initial-primary-need"	: baggage.initialPrimaryNeed	},
				{ "initial-specific-need"	: baggage.initialSpecificNeed	},
				{ "initial-client-cif"		: baggage.initialClientCif	}
			]
		});

		if (spanId) this.currentActiveSpans["confirm-caller"] = spanId;
	}


	/**
	 * @typedef {Object} ConfirmCallerModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 * @property {String} confirmedPrimaryNeed
	 * @property {String} confirmedSpecificNeed 
	 * @property {String} confirmedClientCif 
	 */

	/** Caller confirmed telemetry event
	 * @screen Confirm Caller
	 * @event Confirm Caller
	 * 
	 * @param {ConfirmCallerModel} baggage
	 */
	confirmCaller(baggage) {
		this.telemetry.event({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["confirm-caller"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.SELECT_CONFIRM_CALLER,
			tags 		: this._extractTags(TelemetryEvent.SELECT_CONFIRM_CALLER),
			eventType 	: TelemetryEventType.PERSON,
			eventOriginator : this._eventOriginator(TelemetryEventType.PERSON),

			baggage : [	{"screen"					: baggage.screen		},
						{"next-screen"				: baggage.nextScreen	},
						{"confirmed-primary-need"	: baggage.confirmedPrimaryNeed 	},
						{"confirmed-specific-need"	: baggage.confirmedSpecificNeed	},
						{"confirmed-client-cif"		: baggage.confirmedClientCif 	} ]
		})
	}


	/**
	 * @typedef {Object} NavigateSearchClientModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to Search Client Screen
	 * @screen Confirm Caller
	 * @event Navigate to Search Client
	 * 
	 * @param {NavigateSearchClientModel} baggage
	 */
	navigateSearchClient(baggage) {
		this.telemetry.event({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["confirm-caller"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.SELECT_SEARCH_CLIENT,
			tags 		: this._extractTags(TelemetryEvent.SELECT_SEARCH_CLIENT),
			eventType 	: TelemetryEventType.PERSON,
			eventOriginator : this._eventOriginator(TelemetryEventType.PERSON),

			baggage : [	{"screen"		: baggage.screen		},
						{"next-screen"	: baggage.nextScreen	} ]
		})
	}


	/**
	 * @typedef  {Object} NavigateAddCallerDetailsModel 
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to Add Caller Details Screen
	 * @screen Confirm Caller
	 * @event Navigate to Add Caller Details
	 * 
	 * @param {NavigateAddCallerDetailsModel} baggage
	 */
	navigateAddCallerDetails(baggage) {
		this.telemetry.event({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["confirm-caller"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.SELECT_ADD_CALLER_DETAILS,
			tags 		: this._extractTags(TelemetryEvent.SELECT_ADD_CALLER_DETAILS),
			eventType 	: TelemetryEventType.PERSON,
			eventOriginator : this._eventOriginator(TelemetryEventType.PERSON),

			baggage : [	{ "screen"		: baggage.screen		},
						{ "next-screen"	: baggage.nextScreen	} ]
		})
	}


	/**
	 * @typedef  {Object} ScrUnldConfirmCallerModel 
	 * @property {String} screen 
	 */

	/** Confirm Caller Screen Unload
	 * @screen Confirm Caller
	 * @event Screen Unload: Confirm Caller
	 * 
	 * @param {ScrUnldConfirmCallerModel} baggage
	 */
	screenUnloadConfirmCaller(baggage) {
		this.telemetry.spanEnd({
			traceId 	: this.traceId,
			spanId 		: this.currentActiveSpans["confirm-caller"],
			parentSpan 	: null,
			eventName 	: TelemetryEvent.SCR_UNLD_CONFIRM_CALLER,
			tags 		: this._extractTags(TelemetryEvent.SCR_UNLD_CONFIRM_CALLER),
			eventType 	: TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage : [	{ "screen"		: baggage.screen		} ]
		})
	}

	//#endregion CONFIRM CALLER
	

	//#region ADD CALLER DETAILS
	//#endregion ADD CALLER DETAILS



	//#region SEARCH CALLER
	//#endregion SEARCH CALLER



	//#endregion PUBLIC METHODS


	//#region PRIVATE METHODS
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

	//#endregion PRIVATE METHODS
	
}
