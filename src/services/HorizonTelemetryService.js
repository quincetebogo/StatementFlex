import { HorizonStore } from 'app/store/HorizonStore';
import { SecurityContext } from 'platform/core';
import { Telemetry } from 'app/mocks/Telemetry';
import { v4 } from 'uuid';

/*
 * Horizon Telemetry
 *
 * Please see the Data Spec at https://confluence.capitecbank.co.za:8443/display/HOR/Horizon+Telemetry 
 */


/** The screens on which telemetry events are logged.
 * This correspond to the "screen" column in the Data Spec.
 * @readonly
 * @enum {String} TelemetryScreen
 */
export const TelemetryScreen = {
	WAIT_FOR_CALL: `Waiting For Call`,
	CONFIRM_CALLER: `Confirm Caller`,
	SEARCH_CLIENT: `Search Client`,
	ADD_CALLER_DETAILS: `Add Caller Details`,

	STOP_CARD: `Stop Card`,
	STOP_CARD_OUTCOME: `Stop Card Outcome`
};


/** The event names to use when logging telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * @readonly
 * @enum {String} TelemetryEvent
 */
const TelemetryEvent = {
	// Accept Call
	INCOMING_CALL: `horizon.call.start-span`,
	INCIDENT_CREATED: `horizon.call.incident-created`,
	WORKFLOW_COMPLETED: `horizon.call.end-span`,


	// Confirm Caller
	IDENTIFY_CALLER_STARTS: `horizon.call.id-caller.start-span`,
	CALLER_IDENTIFIED: `horizon.call.id-caller.end-span`,

	SCR_LD_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.start-span`,
	SELECT_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.confirm`,
	SELECT_SEARCH_CLIENT: `horizon.call.id-caller.confirm-caller.search-client`,
	SELECT_ADD_CALLER_DETAILS: `horizon.call.id-caller.confirm-caller.add-caller-details`,
	SCR_UNLD_CONFIRM_CALLER: `horizon.call.id-caller.confirm-caller.end-span`,
	
	SCR_LD_SEARCH_CLIENT: `horizon.call.id-caller.search-client.start-span`,
	SELECT_SEARCH_CLIENT: `horizon.call.id-caller.search-client.search`,
	SCR_UNLD_SEARCH_CLIENT: `horizon.call.id-caller.search-client.end-span`,
	
	SCR_LD_ADD_CALLER_DETAILS: `horizon.call.id-caller.add-caller.start-span`,
	ADD_CALLER_DETAILS_CANCEL: `horizon.call.id-caller.add-caller.cancel`,
	ADD_CALLER_DETAILS_CONFIRM: `horizon.call.id-caller.add-caller.confirm`,
	SCR_UNLD_ADD_CALLER_DETAILS: `horizon.call.id-caller.add-caller.end-span`,


	// Stop Card
	SCR_LD_STOP_CARD: `horizon.call.fulfill-need.stop-card.start-span`,
	STOP_CARD: `horizon.call.fulfill-need.stop-card.stop`,
	CONFIRM_STOP_CARD: `horizon.call.fulfill-need.stop-card.confirm`,
	CANCEL_STOP_CARD: `horizon.call.fulfill-need.stop-card.cancel`,
	EXIT_STOP_CARD: `horizon.call.fulfill-need.stop-card.exit`,
	SCR_UNLD_STOP_CARD: `horizon.call.fulfill-need.stop-card.end-span`,

	STOP_CARD_OUTCOME: `horizon.call.fulfill-need.stop-card.outcome`,
	STOP_CARD_TRY_AGAIN: `horizon.call.fulfill-need.stop-card.outcome.try-again`,
	STOP_CARD_ASSIGN: `horizon.call.fulfill-need.stop-card.outcome.assign`,
	STOP_CARD_DONE: `horizon.call.fulfill-need.stop-card.outcome.done`,
	STOP_CARD_ANOTHER: `horizon.call.fulfill-need.stop-card.outcome.another`,

	// End Call Selected
	END_CALL_SELECTED: `horizon.call.end-call-selected`
};


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
 * @enum {String} TelemetryOutcome
 */
const TelemetryOutcome = {
	SUCCESS: `success`,
	FAIL: `fail`
};


/**
 * The TelemetryService is a helper utility to assist with the logging of Telemetry 
 * using the platform capability.
 *
 * @export
 * @class TelemetryService
 */
export class HorizonTelemetry extends Telemetry {
	// TODO: add logic to close all child spans when parent span gets closed. Log a warning if this happens.
	
	// #region INITIALISATION
	// --------------
	// INITIALISATION
	// --------------
	static get instance() {
		return this._instance || (this._instance = new HorizonTelemetry());
	}

	constructor() {
		super();

		if (this._instance) {
			return this._instance;
		}

		this._traceId = ``;
		this.currentActiveSpans = {
			"horizon.call": null,
			"id-caller": null,
			"confirm-caller": null,
			"search-client": null,
			"add-caller": null,
			"fulfill-need": null,
			"stop-card": null
		};

		this.horizonStore = new HorizonStore();
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
			const state = this.horizonStore.recoverState();
			const telemetryDetails = state && state.telemetryDetails;
			traceID = telemetryDetails.traceId;
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
			currentActiveSpans: this.currentActiveSpans
		};
		this.horizonStore.saveState({ telemetryDetails: telemetryDetails});
	}


	// #region ACCEPT CALL

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
		const telemetryCallSpanId = super.spanStart({
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
	 * @property {String} incidentReference 
	 * @property {String} incidentRecId 
	 */

	/** Incident created telemetry event
	 * @screen N/A
	 * @event Incident Created
	 * 
	 * @param {IncidentCreatedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	incidentCreated(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`horizon.call`],
			parentSpan: null,
			eventName: TelemetryEvent.INCIDENT_CREATED,
			tags: this._extractTags(TelemetryEvent.INCIDENT_CREATED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "incident-reference": baggage.incidentReference },
				{ "incident-rec-id": baggage.incidentRecId }
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
		super.spanEnd({
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

	// #endregion ACCEPT CALL


	// #region CONFIRM CALLER

	/** Identify Caller telemetry event
	 * @screen N/A
	 * @event Identify Caller Starts
	 * @returns { void }
	 */
	identifyCallerStarts() {
		const idCallerSpanId = super.spanStart({
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


	/** Ending Identify Caller span telemetry event
	 * @screen N/A
	 * @event Caller Identified
	 * @returns { void } 
	 */
	callerIdentified() {
		super.spanEnd({
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
	 * @param {ScrLdConfirmCallerModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenLoadConfirmCaller(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SCR_LD_CONFIRM_CALLER,
			tags: this._extractTags(TelemetryEvent.SCR_LD_CONFIRM_CALLER),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "initial-primary-need": baggage.initialPrimaryNeed },
				{ "initial-specific-need": baggage.initialSpecificNeed },
				{ "initial-client-cif": baggage.initialClientCif }
			]
		});

		if (spanId) {
 			this.currentActiveSpans[`confirm-caller`] = spanId; 
		}
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
	 * @param {ConfirmCallerModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	selectConfirmCaller(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`confirm-caller`],
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_CONFIRM_CALLER,
			tags: this._extractTags(TelemetryEvent.SELECT_CONFIRM_CALLER),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen },
				{ "confirmed-primary-need": baggage.confirmedPrimaryNeed },
				{ "confirmed-specific-need": baggage.confirmedSpecificNeed },
				{ "confirmed-client-cif": baggage.confirmedClientCif }
			]
		});
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
	 * @param {NavigateSearchClientModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	selectSearchClient(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`confirm-caller`],
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_SEARCH_CLIENT,
			tags: this._extractTags(TelemetryEvent.SELECT_SEARCH_CLIENT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
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
	 * @param {NavigateAddCallerDetailsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	selectAddCallerDetails(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`confirm-caller`],
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_ADD_CALLER_DETAILS,
			tags: this._extractTags(TelemetryEvent.SELECT_ADD_CALLER_DETAILS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
						{ "next-screen": baggage.nextScreen }
]
		});
	}


	/**
	 * @typedef  {Object} ScrUnldConfirmCallerModel 
	 * @property {String} screen 
	 */

	/** Confirm Caller Screen Unload
	 * @screen Confirm Caller
	 * @event Screen Unload: Confirm Caller
	 * 
	 * @param {ScrUnldConfirmCallerModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenUnloadConfirmCaller(baggage) {
		super.spanEnd({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`confirm-caller`],
			parentSpan: null,
			eventName: TelemetryEvent.SCR_UNLD_CONFIRM_CALLER,
			tags: this._extractTags(TelemetryEvent.SCR_UNLD_CONFIRM_CALLER),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		this.currentActiveSpans[`confirm-caller`] = null;
	}

	// #endregion CONFIRM CALLER


	// #region ADD CALLER DETAILS

	/**
	 * @typedef {Object} ScrLdAddCallerDetailsModel
	 * @property {String} screen
	 */

	/** Add caller details
	 * @screen Add Caller Details
	 * @event Screen Load: Add Caller Details
	 * 
	 * @param {ScrLdAddCallerDetailsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenLoadAddCallerDetails(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SCR_LD_ADD_CALLER_DETAILS,
			tags: this._extractTags(TelemetryEvent.SCR_LD_ADD_CALLER_DETAILS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
	 		this.currentActiveSpans[`add-caller`] = spanId; 
		}
	}


	/**
	 * @typedef {Object} AddCallerDetailsConfirmModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Add Caller Details Confirmation button clicked
	 * @screen Add Caller Details
	 * @event Add Caller Details Confirm
	 * 
	 * @param {AddCallerDetailsConfirmModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	addCallerDetailsConfirm(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`add-caller`],
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.ADD_CALLER_DETAILS_CONFIRM,
			tags: this._extractTags(TelemetryEvent.ADD_CALLER_DETAILS_CONFIRM),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}


	/**
	 * @typedef {Object} AddCallerDetailsCancelModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Add Caller Details Cancel button clicked
	 * @screen Add Caller Details
	 * @event Add Caller Details Cancel
	 * 
	 * @param {AddCallerDetailsCancelModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	addCallerDetailsCancel(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`add-caller`],
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.ADD_CALLER_DETAILS_CANCEL,
			tags: this._extractTags(TelemetryEvent.ADD_CALLER_DETAILS_CANCEL),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}


	/**
	 * @typedef  {Object} ScrUnldAddCallerDetailsModel 
	 * @property {String} screen 
	 */

	/** Screen Unload: Add Caller Details
	 * @screen Add Caller Details
	 * @event Screen Unload: Add Caller Details
	 * 
	 * @param {ScrUnldAddCallerDetailsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenUnloadAddCallerDetails(baggage) {
		super.spanEnd({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`add-caller`],
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SCR_UNLD_ADD_CALLER_DETAILS,
			tags: this._extractTags(TelemetryEvent.SCR_UNLD_ADD_CALLER_DETAILS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		this.currentActiveSpans[`add-caller`] = null;
	}

	// #endregion ADD CALLER DETAILS


	// #region SEARCH CALLER

	/**
	 * @typedef {Object} scrLdSearchClientModel
	 * @property {String} screen 
	 */

	/** Search Caller
	 * @screen Search Client
	 * @event Screen Load: Search Client
	 * @param {scrLdSearchClientModel} baggage Information to attach to the telemetry event
	 */
	
	screenLoadSearchClient(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SCR_LD_SEARCH_CLIENT,
			tags: this._extractTags(TelemetryEvent.SCR_LD_SEARCH_CLIENT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) { 
			this.currentActiveSpans[`search-client`] = spanId; 
		}
	}

	/**
	 * @typedef {Object} NavigateSearchClientModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/**
	 * @typedef {Object} SearchClientModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */
		/** Navigate to Confirm Client Screen
	 * Search Client button clicked
	 * @screen Search Client
	 * @event Navigate to Confirm Client
	 * 
	 * @param {NavigateConfirmClientModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	selectSearchCapitecClient(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`search-client`],
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SELECT_SEARCH_CLIENT,
			tags: this._extractTags(TelemetryEvent.SELECT_SEARCH_CLIENT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			// eslint-disable-next-line no-tabs
			baggage: [ 
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}
	
	/**
	 * @typedef  {Object} ScrUnldSearchClientModel 
	 * @property {String} screen 
	 */
	
	/** Screen Unload: Search Client
	 * @screen Search Client
	 * @event Screen Unload: Search Client
	 * 
	 * @param {ScrUnldSearchClientModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenUnloadSearchClient(baggage) {
		super.spanEnd({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`search-client`],
			parentSpan: this.currentActiveSpans[`id-caller`],
			eventName: TelemetryEvent.SCR_UNLD_SEARCH_CLIENT,
			tags: this._extractTags(TelemetryEvent.SCR_UNLD_SEARCH_CLIENT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),
	
			baggage: [{ "screen": baggage.screen }]
		});

		this.currentActiveSpans[`search-client`] = null;
	}
	
	// #endregion SEARCH CALLER

	
	// #region STOP CARD

	/**
	 * @typedef {Object} ScrLdStopCardModel
	 * @property {String} screen 
	 */

	/** Stop Card screen loaded telemetry event
	 * @screen Stop Card
	 * @event Screen Load: Stop Card
	 * 
	 * @param {ScrLdStopCardModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadStopCard(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.SCR_LD_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.SCR_LD_STOP_CARD),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 			this.currentActiveSpans[`stop-card`] = spanId; 
		}
	}


	/** 
	 * @typedef {Object} CardToStop
	 * @property {String} cardId
	 * @property {String} maskedCardNr
	 * @property {String} reason
	 */

	/**
	 * @typedef {Object} StopCardModel
	 * @property {String} screen
	 * @property {Array<CardToStop>} cards
	 */

	/** Stop Card button clicked telemetry event
	 * @screen Stop Card
	 * @event Stop Card
	 * 
	 * @param {StopCardModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCard(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD,
			tags: this._extractTags(TelemetryEvent.STOP_CARD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "cards": baggage.cards }
			]
		});
	}


	/**
	 * @typedef {Object} ConfirmCardStopModel
	 * @property {String} screen
	 */

	/** Stop Card confirmation button clicked telemetry event
	 * @screen Stop Card
	 * @event Confirm cards to stop
	 * 
	 * @param {ConfirmCardStopModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	confirmStopCard(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.CONFIRM_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.CONFIRM_STOP_CARD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef {Object} CancelCardStopModel
	 * @property {String} screen
	 */

	/** Cancel button on Stop Card confirmation dialog clicked
	 * @screen Stop Card
	 * @event Cancel Stop Card Confirmation
	 * 
	 * @param {CancelCardStopModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	cancelStopCard(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.CANCEL_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.CANCEL_STOP_CARD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef {Object} ExitCardStopModel
	 * @property {String} screen
	 */

	/** Back/Exit (Arrow) button on Stop Card screen clicked
	 * @screen Stop Card
	 * @event Exit Stop Card
	 * 
	 * @param {ExitCardStopModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	exitStopCard(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.EXIT_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.EXIT_STOP_CARD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/** Screen Unload: Stop Card
	 * @screen Stop Card
	 * @event Screen Unload: Stop Card
	 * @returns { void } 
	 */
	screenUnloadStopCard() {
		super.spanEnd({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.SCR_UNLD_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.SCR_UNLD_STOP_CARD),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		this.currentActiveSpans[`stop-card`] = null;
	}


	/** 
	 * @typedef {Object} CardOutcome
	 * @property {String} cardId
	 * @property {TelemetryOutcome} outcome
	 */

	/**
	 * @typedef {Object} StopCardOutcomeModel
	 * @property {String} screen
	 * @property {Array<CardOutcome>} cards
	 */

	/** Stop Card outcome to be recorded to telemetry
	 * @screen Stop Card Outcome
	 * @event Stop Card Outcome
	 * 
	 * @param {StopCardOutcomeModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCardOutcome(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD_OUTCOME,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_OUTCOME),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "cards": baggage.cards }
			]
		});
	}


	/**
	 * @typedef {Object} StopCardTryAgainModel
	 * @property {String} screen
	 */

	/** Stop Card try again clicked
	 * @screen Stop Card Outcome
	 * @event Stop Card Try Again
	 * 
	 * @param {StopCardTryAgainModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCardTryAgain(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD_TRY_AGAIN,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_TRY_AGAIN),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef {Object} StopCardAssignModel
	 * @property {String} screen
	 */

	/** Stop Card Assign button clicked
	 * @screen Stop Card Outcome
	 * @event Stop Card Assign
	 * 
	 * @param {StopCardAssignModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCardAssign(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD_ASSIGN,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_ASSIGN),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef {Object} StopCardDoneModel
	 * @property {String} screen
	 */

	/** Stop Card Outcome Done button clicked
	 * @screen Stop Card Outcome
	 * @event Stop Card Done
	 * 
	 * @param {StopCardDoneModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCardDone(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD_DONE,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_DONE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef {Object} StopCardAnotherModel
	 * @property {String} screen
	 */

	/** Stop Card Outcome: Stop Another button clicked
	 * @screen Stop Card Outcome
	 * @event Stop Card Another
	 * 
	 * @param {StopCardAnotherModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	stopCardAnother(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`stop-card`],
			parentSpan: this.currentActiveSpans[`fulfill-need`],
			eventName: TelemetryEvent.STOP_CARD_ANOTHER,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_ANOTHER),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	// #endregion STOP CARD

	// #region END CALL SELECTED
			/**
	 * @typedef {Object} EndCallSelected
	 * @property {String} screen
	 * @property {String} nextScreen
	 */

	/** End Call Outcome: End Call button clicked
	 * @screen End Call Outcome
	 * @event End Call Selected
	 * 
	 * @param {EndCallSelectedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */

	endCallSelected(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans[`horizon.call`],
			parentSpan: null,
			eventName: TelemetryEvent.END_CALL_SELECTED,
			tags: this._extractTags(TelemetryEvent.END_CALL_SELECTED),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{
					"screen": baggage.screen,
					"nextScreen": baggage.nextScreen
				}
			]
		});
	}
	// #endregion END CALL SELECTED
	
	// #endregion PUBLIC METHODS


	// #region PRIVATE METHODS
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
				throw new Error(`unrecognized event type`);
		}
	}

	// #endregion PRIVATE METHODS
	
}