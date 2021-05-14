import { SecurityContext } from 'platform/core';
import { Telemetry } from 'app/mocks/Telemetry';
import { TelemetryStore } from 'app/store/TelemetryStore';
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
 * @enum {String} TelemetryScreen
 */
export const TelemetryScreen = {
	WAIT_FOR_CALL: `Waiting For Call`,
	CONFIRM_CALLER: `Confirm Caller`,
	SEARCH_CLIENT: `Search Client`,
	ADD_CALLER_DETAILS: `Add Caller Details`,

	STOP_CARD: `Stop Card`,
	STOP_CARD_OUTCOME: `Stop Card Outcome`,

	FAVOURITES: `Favourite Transactions`,

	DEBICHECK: `DebiCheck Mandates`,
	VIEWINFO: `DebiCheck View Info`,
	DECLINE_DEBICHECK: `Decline Debi Check`,
	DEBICHECK_OUTCOME: `DebiCheck Outcome`,

	UPDATE_CARD_LIMITS: `Update Card Limits`,

	TAP_TO_PAY: `Tap to Pay`,
	STATEMENTS: `Statements`,
	STATEMENTS_OUTCOME: `Statements Outcome`,
	TAX_CERTIFICATE: `Tax Certificate`,
	PROOF_OF_ACCOUNT: `Proof of Account`,
	SEARCH_OTHER_NEED: `Search Other Need`,
	VERIFY_CALLER: `Verify Caller`,

	SECURITY_QUESTIONS: `Security Questions`,

	END_CALL: `End Call Session`
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

	// End Call
	SCR_LD_END_CALL: `horizon.call.end-call.start-span`,
	END_CALL: `horizon.call.end-call.end-call`,
	END_CALL_CANCEL: `horizon.call.end-call.cancel`,
	SCR_UNLD_END_CALL: `horizon.call.end-call.end-span`,
	END_CALL_SELECTED: `horizon.call.end-call-selected`,
	
	// Verify Caller
	SCR_LD_VERIFY_CALLER: `horizon.call.verify-caller.start-span`,
	VERIFY_CALLER: `horizon.call.verify-caller.ita.start-span`,
	VERIFICATION_REQUEST_SENT: `horizon.call.verify-caller.ita.requested`,
	SELECT_SECURITY_QUESTIONS: `horizon.call.verify-caller.ita.security-questions`,
	ITA_SKIP_VERIFICATION: `horizon.call.verify-caller.ita.skip-verification`,
	TRY_VERIFICATION_AGAIN: `horizon.call.verify-caller.ita.try-again`,
	VERIFICATION_TIMEOUT: `horizon.call.verify-caller.ita.timeout`,
	VERIFICATION_SUCCESS: `horizon.call.verify-caller.ita.success`,
	VERIFICATION_FAILED: `horizon.call.verify-caller.ita.failed`,
	SCR_UNLD_VERIFY_CALLER: `horizon.call.verify-caller.ita.end-span`,

	// Security Questions
	SCR_LD_SECURITY_QUESTIONS: `horizon.call.verify-caller.xds.start-span`,
	GO_TO_NEXT_QUESTION: `horizon.call.verify-caller.xds.next`,
	XDS_SKIP_VERIFICATION: `horizon.call.verify-caller.xds.skip-verification`,
	CANCEL_SECURITY_QUESTIONS: `horizon.call.verify-caller.xds.cancel`,
	SECURITY_QUESTIONS_PASSED: `horizon.call.verify-caller.xds.success`,
	SECURITY_QUESTIONS_FAILED: `horizon.call.verify-caller.xds.failed`,
	SECURITY_QUESTIONS_TRY_AGAIN: `horizon.call.verify-caller.xds.try-again`,
	SCR_UNLD_SECURITY_QUESTIONS: `horizon.call.verify-caller.xds.end-span`,
	CALLER_VERIFIED: `horizon.call.verify-caller.end-span`,


	// Proof of Account
	SCR_LD_PROOF_OF_ACCOUNT: `horizon.call.fulfill-need.proof-of-account.start-span`,
	SELECT_CANCEL_PROOF_OF_ACCOUNT: `horizon.call.fulfill-need.proof-of-account.cancel`,
	SELECT_SEND_PROOF_OF_ACCOUNT: `horizon.call.fulfill-need.proof-of-account.send`,
	PROOF_OF_ACCOUNT_OUTCOME: `horizon.call.fulfill-need.proof-of-account.outcome`,
	SCR_UNLD_PROOF_OF_ACCOUNT: `horizon.call.fulfill-need.proof-of-account.stop-span`,

	// Favourite Transactions
	SCR_LD_FULFILL_NEED: `horizon.call.fulfill-need.start-span`,
	SCR_LD_FAVOURITES: `horizon.call.fulfill-need.favourites`,
	DEBI_CHECK_ALERT: `horizon.call.fulfill-need.debicheck-alert`,
	DEBI_CHECK_ALERT_DISMISS: `horizon.call.fulfill-need.debicheck-alert.dismiss`,
	DEBI_CHECK_ALERT_ACCEPT: `horizon.call.fulfill-need.debicheck-alert.accept`,
	SELECT_DEBI_CHECK: `horizon.call.fulfill-need.select-debicheck`,
	SELECT_STOP_CARD: `horizon.call.fulfill-need.select-stop-card`,
	SELECT_UPDATE_CARD_LIMITS: `horizon.call.fulfill-need.select-card-limits`,
	SELECT_TAP_TO_PAY: `horizon.call.fulfill-need.select-tap-to-pay`,
	SELECT_STATEMENTS: `horizon.call.fulfill-need.select-statements`,
	SELECT_TAX_CERTIFICATE: `horizon.call.fulfill-need.select-tax-certificate`,
	SELECT_PROOF_OF_ACCOUNT: `horizon.call.fulfill-need.select-proof-of-account`,
	SELECT_SEARCH_OTHER_NEED: `horizon.call.fulfill-need.select-other-need`,
	SCR_UNLD_NEED_FULFILLED: `horizon.call.fulfill-need.end-span`,

	// Statements
	SCR_LD_STATEMENTS: `horizon.call.statements.start-span`,
	SELECT_ACCOUNT_TYPE: `horizon.call.statements.select-acc-type`,
	SELECT_ACCOUNT: `horizon.call.statements.select-account`,
	SELECT_ACCOUNT_NEXT: `horizon.call.statements.account.next`,
	SELECT_PERIOD: `horizon.call.statements.period.next`,
	VIEW_DOCUMENT: `horizon.call.statements.view-document`,
	STATEMENTS_SEND: `horizon.call.statements.send`,
	SELECT_BACK: `horizon.call.statements.back`,
	STATEMENTS_SEND_ANOTHER: `horizon.call.statements.send-another`,
	SCR_UNLD_STATEMENTS: `horizon.call.statements.end-span`,
	STATEMENTS_CANCEL_BACK: ``,

	SCR_LD_DEBICHECK: `horizon.call.fulfill-need.debicheck.start-span`,
	EXIT_DEBICHECK: `horizon.call.fulfill-need.debicheck.exit`,
	VIEW_DEBICHECK_MANDATE: `horizon.call.fulfill-need.debicheck.view-mandate`,
	CLOSE_VIEW_DEBICHECK: `horizon.call.fulfill-need.debicheck.view-mandate.back`,
	DECLINE_DEBICHECK_MANDATE: `horizon.call.fulfill-need.debicheck.decline`,
	DECLINE_DEBICHECK_CONFIRMATION: `horizon.call.fulfill-need.debicheck.decline.confirm`,
	DECLINE_DEBICHECK_CANCELATION: `horizon.call.fulfill-need.debicheck.decline.cancel`,
	APPROVE_DEBICHECK_MANDATE: `horizon.call.fulfill-need.debicheck.approve`,
	APPROVE_DEBICHECK_CONFIMATION: `horizon.call.fulfill-need.debicheck.approve.confirm`,
	APPROVE_DEBICHECK_CANCELATION: `horizon.call.fulfill-need.debicheck.approve.cancel`,
	DEBICHECK_OUTCOME: `horizon.call.fulfill-need.debicheck.outcome`,
	DEBICHECK_OUTCOME_DONE: `horizon.call.fulfill-need.debicheck.outcome.done`,
	DEBICHECK_OUTCOME_BACK_TO_MANDATES: `horizon.call.fulfill-need.debicheck.outcome.another`,
	DEBICHECK_OUTCOME_ASSIGN: `horizon.call.fulfill-need.debicheck.outcome.assign`,
	SCR_UNLD_DEBICHECK: `horizon.call.fulfill-need.debicheck.end-span`
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
			"proof-of-account": null,
			"stop-card": null,
			"end-call": null,
			"verify-caller": null,
			"ita": null,
			"xds": null,
			"statements": null,
			"debicheck": null
		};

		this.telemetryStore = new TelemetryStore();
		this.initialise();
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

	// --------------
	// PRIVATE METHODS
	// --------------

	initialise() {
		this.currentActiveSpans.get = (prop) => {
			if (!this.currentActiveSpans[prop]) {
				const telemetryDetails = this.telemetryStore.getTelemetryDetails();
				return telemetryDetails.currentActiveSpans[prop];
			}
			return this.currentActiveSpans[prop];
		};

		this.currentActiveSpans.set = (prop, val) => {
			this.currentActiveSpans[prop] = val;
		
			const telemetryDetails = this.telemetryStore.getTelemetryDetails();
			telemetryDetails.currentActiveSpans = this.currentActiveSpans;

			this.telemetryStore.setTelemetryDetails(telemetryDetails);
		};
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
		this.telemetryStore.clearState();
		this.telemetryStore.setTelemetryDetails(telemetryDetails);

		return this.traceId;
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
			this.currentActiveSpans.set(`horizon.call`, telemetryCallSpanId);
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
			spanId: this.currentActiveSpans.get(`horizon.call`),
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
		const spanId = this.currentActiveSpans.get(`horizon.call`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.WORKFLOW_COMPLETED,
				tags: this._extractTags(TelemetryEvent.WORKFLOW_COMPLETED),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
			});
	
			// clear span reference
			this.currentActiveSpans.set(`horizon.call`, null);
		} else {
			// TODO: Log that there was a telemetry failure (missing trace ID or span ID)
		}
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
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.IDENTIFY_CALLER_STARTS,
			tags: this._extractTags(TelemetryEvent.IDENTIFY_CALLER_STARTS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
		});

		if (idCallerSpanId) {
			this.currentActiveSpans.set(`id-caller`, idCallerSpanId);
		}
	}


	/** Ending Identify Caller span telemetry event
	 * @screen N/A
	 * @event Caller Identified
	 * @returns { void } 
	 */
	callerIdentified() {
		const spanId = this.currentActiveSpans.get(`id-caller`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.CALLER_IDENTIFIED,
				tags: this._extractTags(TelemetryEvent.CALLER_IDENTIFIED),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
			});

			this.currentActiveSpans.set(`id-caller`, null);
		}
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
			parentSpan: this.currentActiveSpans.get(`id-caller`),
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
			this.currentActiveSpans.set(`confirm-caller`, spanId);
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
			spanId: this.currentActiveSpans.get(`confirm-caller`),
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
			spanId: this.currentActiveSpans.get(`confirm-caller`),
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
			spanId: this.currentActiveSpans.get(`confirm-caller`),
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
		const spanId = this.currentActiveSpans.get(`confirm-caller`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_CONFIRM_CALLER,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_CONFIRM_CALLER),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`confirm-caller`, null);
		}
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
			parentSpan: this.currentActiveSpans.get(`id-caller`),
			eventName: TelemetryEvent.SCR_LD_ADD_CALLER_DETAILS,
			tags: this._extractTags(TelemetryEvent.SCR_LD_ADD_CALLER_DETAILS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`add-caller`, spanId);
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
			spanId: this.currentActiveSpans.get(`add-caller`),
			parentSpan: this.currentActiveSpans.get(`id-caller`),
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
			spanId: this.currentActiveSpans.get(`add-caller`),
			parentSpan: this.currentActiveSpans.get(`id-caller`),
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
		const spanId = this.currentActiveSpans.get(`add-caller`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`id-caller`),
				eventName: TelemetryEvent.SCR_UNLD_ADD_CALLER_DETAILS,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_ADD_CALLER_DETAILS),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`add-caller`, null);
		}
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
			parentSpan: this.currentActiveSpans.get(`id-caller`),
			eventName: TelemetryEvent.SCR_LD_SEARCH_CLIENT,
			tags: this._extractTags(TelemetryEvent.SCR_LD_SEARCH_CLIENT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) { 
			this.currentActiveSpans.set(`search-client`, spanId);
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
			spanId: this.currentActiveSpans.get(`search-client`),
			parentSpan: this.currentActiveSpans.get(`id-caller`),
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
		const spanId = this.currentActiveSpans.get(`search-client`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`id-caller`),
				eventName: TelemetryEvent.SCR_UNLD_SEARCH_CLIENT,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_SEARCH_CLIENT),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),
		
				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`search-client`, null);
		}
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
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SCR_LD_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.SCR_LD_STOP_CARD),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`stop-card`, spanId);
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
		const spanId = this.currentActiveSpans.get(`stop-card`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`fulfill-need`),
				eventName: TelemetryEvent.SCR_UNLD_STOP_CARD,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_STOP_CARD),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
			});

			this.currentActiveSpans.set(`stop-card`, null);
		}
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
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
			spanId: this.currentActiveSpans.get(`stop-card`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.STOP_CARD_ANOTHER,
			tags: this._extractTags(TelemetryEvent.STOP_CARD_ANOTHER),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	// #endregion STOP CARD


	// #region PROOF OF ACCOUNT
	
	/**
	 * @typedef {Object} ScrLdProofOfAccountModel
	 * @property {String} screen 
	 */

	/** Proof of Account screen loaded telemetry event
	 * @screen Proof of Account
	 * @event Screen Load: Proof of Account
	 * 
	 * @param {ScrLdProofOfAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadProofOfAccount(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SCR_LD_PROOF_OF_ACCOUNT,
			tags: this._extractTags(TelemetryEvent.SCR_LD_PROOF_OF_ACCOUNT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`proof-of-account`, spanId);
		}
	}
	
	/**
	 * @typedef {Object} SelectCancelProofOfAccountModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to Favourites Screen from Proof of Account Cancel
	 * @screen Proof of Account
	 * @event Cancel Proof of Account
	 * 
	 * @param {SelectCancelProofOfAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectCancelProofOfAccount(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`proof-of-account`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_CANCEL_PROOF_OF_ACCOUNT,
			tags: this._extractTags(TelemetryEvent.SELECT_CANCEL_PROOF_OF_ACCOUNT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	
	/**
	 * @typedef {Object} SelectProofOfAccountSendModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Proof of Account Send telemetry event
	 * @screen Proof Of Account
	 * @event Send Proof of Account
	 * 
	 * @param {SelectProofOfAccountSendModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectProofOfAccountSend(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`proof-of-account`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_SEND_PROOF_OF_ACCOUNT,
			tags: this._extractTags(TelemetryEvent.SELECT_SEND_PROOF_OF_ACCOUNT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}
	
	/** 
	 * @typedef {Object} ProofOfAccountOutcome
	 * @property {String} proofId
	 * @property {TelemetryOutcome} outcome
	 */

	/**
	 * @typedef {Object} ProofOfAccountOutcomeModel
	 * @property {String} screen
	 * @property {String} nextScreen
	 */

	/** Proof Of Account outcome to be recorded to telemetry
	 * @screen Proof of Account Outcome
	 * @event Proof of Account Outcome
	 * 
	 * @param {ProofOfAccountOutcomeModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 proofOfAccountOutcome(baggage) {
			super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`proof-of-account`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.PROOF_OF_ACCOUNT_OUTCOME,
			tags: this._extractTags(TelemetryEvent.PROOF_OF_ACCOUNT_OUTCOME),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef  {Object} ScrUnldProofOfAccountModel 
	 * @property {String} screen 
	 */

	/** Proof Of Account Screen Unload
	 * @screen Proof of Account
	 * @event Screen Unload: Proof of Account
	 * 
	 * @param {ScrUnldProofOfAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadProofOfAccount(baggage) {
		const spanId = this.currentActiveSpans.get(`proof-of-account`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_PROOF_OF_ACCOUNT,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_PROOF_OF_ACCOUNT),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`proof-of-account`, null);
		}
	}

	// #endregion PROOF OF ACCOUNT

	
	/**
	 * @typedef {Object} ScrLdVerifyCallerModel
	 * @property {String} screen 
	 */

	/** Verify Caller screen loaded telemetry event
	 * @screen Verify Caller
	 * @event Screen Load: Verify Caller
	 * 
	 * @param {ScrLdVerifyCallerModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadVerifyCaller(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.SCR_LD_VERIFY_CALLER,
			tags: this._extractTags(TelemetryEvent.SCR_LD_VERIFY_CALLER),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 		this.currentActiveSpans.set(`verify-caller`, spanId); 
		}
	}


	/**
	 * @typedef {Object} VerifyCallerViaITAModel
	 * @property {String} screen 
	 */

	/** ITA Verify Caller screen loaded telemetry event
	 * @screen ITA Verify Caller
	 * @event Screen Load: ITA Verify Caller
	 * 
	 * @param {VerifyCallerViaITAModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verifyCallerViaITA(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.VERIFY_CALLER,
			tags: this._extractTags(TelemetryEvent.VERIFY_CALLER),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 		this.currentActiveSpans.set(`ita`, spanId); 
		}
	}

	/**
	 * @typedef {Object} VerificationRequestSentModel
	 * @property {String} screen
	 */

	/** Verification Request Sent telemetry event
	 * @screen Verify Caller 
	 * @event Verification Request Sent
	 * 
	 * @param {VerificationRequestSentModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationRequestSent(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.VERIFICATION_REQUEST_SENT,
			tags: this._extractTags(TelemetryEvent.VERIFICATION_REQUEST_SENT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} SelectSecurityQuestionsModel
	 * @property {String} screen
	 */

	/** Select Security Questions telemetry event
	 * @screen Verify Caller 
	 * @nextScreen Verify Via Security Questions
	 * @event Select Security Questions
	 * 
	 * @param {SelectSecurityQuestionsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectSecurityQuestions(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_SECURITY_QUESTIONS,
			tags: this._extractTags(TelemetryEvent.SELECT_SECURITY_QUESTIONS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SkipVerificationITAModel
	 * @property {String} screen
	 */

	/** ITA Skip Veriification telemetry event
	 * @screen Verify Caller 
	 * @nextScreen Verify Via Security Questions
	 * @event ITA Skip Verification
	 * 
	 * @param {SkipVerificationITAModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 skipVerificationITA(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: null,
			eventName: TelemetryEvent.ITA_SKIP_VERIFICATION,
			tags: this._extractTags(TelemetryEvent.ITA_SKIP_VERIFICATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} TryVerificationAgainModel
	 * @property {String} screen
	 */

	/** ITA Skip Verification telemetry event
	 * @screen Verify Caller 
	 * @event Try Verification Again
	 * 
	 * @param {TryVerificationAgainModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 tryVerificationAgain(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.TRY_VERIFICATION_AGAIN,
			tags: this._extractTags(TelemetryEvent.TRY_VERIFICATION_AGAIN),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} VerificationTimeoutModel
	 * @property {String} screen
	 */

	/** Verification Timeout ITA telemetry event
	 * @screen Verify Caller 
	 * @event Verification Timeout
	 * 
	 * @param {VerificationTimeoutModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationTimeout(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.VERIFICATION_TIMEOUT,
			tags: this._extractTags(TelemetryEvent.VERIFICATION_TIMEOUT),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} VerificationFailedITAModel
	 * @property {String} screen
	 */

	/** ITA Verification Failed telemetry event
	 * @screen Verify Caller 
	 * @event Verification Failed 
	 * 
	 * @param {VerificationFailedITAModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationFailedITA(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.VERIFICATION_FAILED,
			tags: this._extractTags(TelemetryEvent.VERIFICATION_FAILED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} VerificationSuccessITAModel
	 * @property {String} screen
	 */

	/** ITA Verification Success telemetry event
	 * @screen Verify Caller 
	 * @event Verification Success
	 * 
	 * @param {VerificationSuccessITAModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationSuccessITA(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`ita`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.VERIFICATION_SUCCESS,
			tags: this._extractTags(TelemetryEvent.VERIFICATION_SUCCESS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});
	}


	/**
	 * @typedef  {Object} ScrUnldVerifyCallerModel 
	 * @property {String} screen 
	 */

	/** Verify Caller Screen Unload
	 * @screen Verify Caller
	 * @event Screen Unload: Verify Caller
	 * 
	 * @param {ScrUnldVerifyCallerModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	screenUnloadVerifyCaller(baggage) {
		const spanId = this.currentActiveSpans.get(`ita`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`verify-caller`),
				eventName: TelemetryEvent.SCR_UNLD_VERIFY_CALLER,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_VERIFY_CALLER),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`ita`, null);
		}
	}

	// #endregion VERIFY CALLER

	// #region END CALL SELECTED
	
	/**
	 * @typedef {Object} ScrLdEndCallModel
	 * @property {String} screen 
	 */

	/** End Call screen loaded telemetry event
	 * @screen End Call
	 * @event Screen Load: End Call
	 * 
	 * @param {ScrLdEndCallModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadEndCall(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.SCR_LD_END_CALL,
			tags: this._extractTags(TelemetryEvent.SCR_LD_END_CALL),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`end-call`, spanId);
		}
	}
	
	/**
	 * @typedef {Object} EndCallModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 * @property {String} reason
	 */

	/** End Call telemetry event
	 * @screen End Call
	 * @event End Call
	 * 
	 * @param {EndCallModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 endCall(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`end-call`),
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.END_CALL,
			tags: this._extractTags(TelemetryEvent.END_CALL),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen },
				{ "reason": baggage.reason }
			]
		});
	}
	
	/**
	 * @typedef {Object} EndCallCancelModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 * @property {String} reason
	 */

	/** End Call Cancel telemetry event
	 * @screen End Call
	 * @event Cancel End Call 
	 * 
	 * @param {EndCallCancelModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 endCallCancel(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`end-call`),
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.END_CALL,
			tags: this._extractTags(TelemetryEvent.END_CALL),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef  {Object} ScrUnldEndCallModel 
	 * @property {String} screen 
	 */

	/** End Call Screen Unload
	 * @screen End Call
	 * @event Screen Unload: End Call
	 * 
	 * @param {ScrUnldEndCallModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadEndCall(baggage) {
		const spanId = this.currentActiveSpans.get(`end-call`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`horizon.call`),
				eventName: TelemetryEvent.SCR_UNLD_END_CALL,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_END_CALL),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`end-call`, null);
		}
	}

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
			spanId: this.currentActiveSpans.get(`horizon.call`),
			parentSpan: null,
			eventName: TelemetryEvent.END_CALL_SELECTED,
			tags: this._extractTags(TelemetryEvent.END_CALL_SELECTED),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
					{ "screen": baggage.screen },
					{ "nextScreen": baggage.nextScreen }
				]
		});
	}
	// #endregion END CALL SELECTED


	// #region SECURITY QUESTIONS

	/**
	 * @typedef {Object} ScrLdSecurityQuestionsModel
	 * @property {String} screen 
	 */

	/** Security Questions screen loaded telemetry event
	 * @screen XDS Verify Caller
	 * @event Screen Load: Security Questions
	 * 
	 * @param {ScrLdSecurityQuestionsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadSecurityQuestions(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.SCR_LD_SECURITY_QUESTIONS,
			tags: this._extractTags(TelemetryEvent.SCR_LD_SECURITY_QUESTIONS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 		this.currentActiveSpans.set(`xds`, spanId); 
		}
	}

	/**
	 * @typedef {Object} GoToNextQuestionModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Go to Next Question telemetry event
	 * @screen Security Questions
	 * @event Continue to Next Question
	 * 
	 * @param {GoToNextQuestionModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 goToNextQuestion(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: null,
			eventName: TelemetryEvent.GO_TO_NEXT_QUESTION,
			tags: this._extractTags(TelemetryEvent.GO_TO_NEXT_QUESTION),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}
	
	// #endregion END CALL SELECTED
	
	/**
	 * @typedef {Object} SkipVerificationXDSModel
	 * @property {String} screen
	 */

	/** XDS Skip Veriification telemetry event
	 * @screen Security Questions 
	 * @nextScreen Favourites Unverified
	 * @event XDS Skip Verification
	 * 
	 * @param {SkipVerificationXDSModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 skipVerificationXDS(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: null,
			eventName: TelemetryEvent.XDS_SKIP_VERIFICATION,
			tags: this._extractTags(TelemetryEvent.XDS_SKIP_VERIFICATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SkipVerificationXDSModel
	 * @property {String} screen
	 */

	/** XDS Skip Veriification telemetry event
	 * @screen Security Questions 
	 * @nextScreen Favourites Unverified
	 * @event XDS Skip Verification
	 * 
	 * @param {SkipVerificationXDSModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 skipVerificationXDS(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: null,
			eventName: TelemetryEvent.XDS_SKIP_VERIFICATION,
			tags: this._extractTags(TelemetryEvent.XDS_SKIP_VERIFICATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}
	
	/**
	 * @typedef {Object} CancelSecurityQuestionsModel
	 * @property {String} screen
	 */

	/** Cancel Security Questions telemetry event
	 * @screen Security Questions 
	 * @nextScreen Confirm Caller
	 * @event Cancel Security Questions
	 * 
	 * @param {CancelSecurityQuestionsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 cancelSecurityQuestions(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: null,
			eventName: TelemetryEvent.CANCEL_SECURITY_QUESTIONS,
			tags: this._extractTags(TelemetryEvent.CANCEL_SECURITY_QUESTIONS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SecurityQuestionsTryAgainModel
	 * @property {String} screen
	 */

	/** Security Questions Try Again Verification telemetry event
	 * @screen Security Questions
	 * @event Security Questions Try Again
	 * 
	 * @param {SecurityQuestionsTryAgainModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 securityQuestionsTryAgain(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.SECURITY_QUESTIONS_TRY_AGAIN,
			tags: this._extractTags(TelemetryEvent.SECURITY_QUESTIONS_TRY_AGAIN),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} VerificationFailedXDSModel
	 * @property {String} screen
	 * @property {String} nextScreen
	 */

	/** Security Questions/XDS Verification Failed telemetry event
	 * @screen Security Questions
	 * @event XDS Verification Failed 
	 * 
	 * @param {VerificationFailedXDSModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationFailedXDS(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.SECURITY_QUESTIONS_FAILED,
			tags: this._extractTags(TelemetryEvent.SECURITY_QUESTIONS_FAILED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} VerificationSuccessXDSModel
	 * @property {String} screen
	 * @property {String} nextScreen
	 */

	/** Security Questions/XDS Verification Success telemetry event
	 * @screen Security Questions
	 * @event XDS Verification Success 
	 * 
	 * @param {VerificationSuccessXDSModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 verificationSuccessXDS(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`xds`),
			parentSpan: this.currentActiveSpans.get(`verify-caller`),
			eventName: TelemetryEvent.SECURITY_QUESTIONS_PASSED,
			tags: this._extractTags(TelemetryEvent.SECURITY_QUESTIONS_PASSED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef  {Object} ScrUnldSecurityQuestionsModel 
	 * @property {String} screen 
	 */

	/** Security Questions Screen Unload
	 * @screen Security Questions
	 * @event Screen Unload: Security Questions
	 * 
	 * @param {ScrUnldSecurityQuestionsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadSecurityQuestions(baggage) {
		const spanId = this.currentActiveSpans.get(`xds`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_SECURITY_QUESTIONS,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_SECURITY_QUESTIONS),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`xds`, null);
		}
	}

	// #endregion SECURITY QUESTIONS

	// #region FULFILL NEED

	/**
	 * @typedef {Object} ScrLdFulfillNeedModel
	 * @property {String} screen 
	 */

	/** Fulfill need loaded telemetry event
	 * @screen Favourite Transactions
	 * @event Screen Load: Favourite Transactions
	 * 
	 * @param {ScrLdFulfillNeedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadFulfillNeed(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.SCR_LD_FULFILL_NEED,
			tags: this._extractTags(TelemetryEvent.SCR_LD_FULFILL_NEED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 			this.currentActiveSpans.set(`fulfill-need`, spanId); 
		}
	}

	/** 
	 * @typedef {Object} FavouriteTransactions
	 */

	/**
	 * @typedef {Object} FavouriteTransactionsModel
	 * @property {String} screen
	 * @property {Number} debiChecksOutstanding
	 */

	/** Favourite Transactions screen load telemetry event
	 * @screen Favourite Transactions
	 * @event Favourite Transactions
	 * 
	 * @param {FavouriteTransactionsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	favouriteTransactions(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: this.currentActiveSpans.get(`horizon.call`),
			eventName: TelemetryEvent.SCR_LD_FAVOURITES,
			tags: this._extractTags(TelemetryEvent.SCR_LD_FAVOURITES),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [
				{ "screen": baggage.screen },
				{ "debiChecksOutstanding": baggage.debiChecksOutstanding }
			]
		});
	}
	
	/** 
	 * @typedef {Object} DebiCheckAlert
	 */

	/**
	 * @typedef {Object} DebiCheckAlertModel
	 * @property {String} screen
	 */

	/** DebiCheckAlert screen load telemetry event
	 * @screen Favourite Transactions
	 * @event DebiCheck Alert
	 * 
	 * @param {DebiCheckAlertModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckAlert(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBI_CHECK_ALERT,
			tags: this._extractTags(TelemetryEvent.DEBI_CHECK_ALERT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/** 
	 * @typedef {Object} DebiCheckAlertdDismiss
	 */

	/**
	 * @typedef {Object} DebiCheckAlertDismissModel
	 * @property {String} screen
	 */

	/** DebiCheck Alert Dismiss screen load telemetry event
	 * @screen Favourite Transactions
	 * @event DebiCheck Alert Dismiss
	 * 
	 * @param {DebiCheckAlertModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckAlertDismiss(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBI_CHECK_ALERT_DISMISS,
			tags: this._extractTags(TelemetryEvent.DEBI_CHECK_ALERT_DISMISS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}
	
	/** 
	 * @typedef {Object} DebiCheckAlertdAccept
	 */

	/**
	 * @typedef {Object} DebiCheckAlertAcceptModel
	 * @property {String} screen
	 */

	/** DebiCheck Alert Accept screen load telemetry event
	 * @screen Favourite Transactions
	 * @event DebiCheck Alert Accept
	 * 
	 * @param {DebiCheckAlertModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckAlertAccept(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBI_CHECK_ALERT_ACCEPT,
			tags: this._extractTags(TelemetryEvent.DEBI_CHECK_ALERT_ACCEPT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef {Object} SelectDebiCheckModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select DebiCheck telemetry event
	 * @screen Favourite Transactions
	 * @event DebiCheck
	 * 
	 * @param {SelectDebiCheckModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_DEBI_CHECK,
			tags: this._extractTags(TelemetryEvent.SELECT_DEBI_CHECK),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectStopCardModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select StopCard telemetry event
	 * @screen Favourite Transactions
	 * @event DebiCheck
	 * 
	 * @param {SelectStopCardModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectStopCard(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_STOP_CARD,
			tags: this._extractTags(TelemetryEvent.SELECT_STOP_CARD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectUpdateCardLimitsModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Update Card Limits telemetry event
	 * @screen Favourite Transactions
	 * @event Update Card Limits
	 * 
	 * @param {SelectUpdateCardLimitsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectUpdateCardLimits(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_UPDATE_CARD_LIMITS,
			tags: this._extractTags(TelemetryEvent.SELECT_UPDATE_CARD_LIMITS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectTapToPayModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select TAp To Pay telemetry event
	 * @screen Favourite Transactions
	 * @event Tap To Pay
	 * 
	 * @param {SelectTapToPayModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectTapToPay(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_TAP_TO_PAY,
			tags: this._extractTags(TelemetryEvent.SELECT_TAP_TO_PAY),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectStatementsModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Statements telemetry event
	 * @screen Favourite Transactions
	 * @event Statements
	 * 
	 * @param {SelectStatementsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectStatements(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_STATEMENTS,
			tags: this._extractTags(TelemetryEvent.SELECT_STATEMENTS),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectTaxCertificateModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Tax Certificate telemetry event
	 * @screen Favourite Transactions
	 * @event Tax Certificate
	 * 
	 * @param {SelectTaxCertificateModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectTaxCertificate(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_TAX_CERTIFICATE,
			tags: this._extractTags(TelemetryEvent.SELECT_TAX_CERTIFICATE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectProofOfAccountModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Proof Of Account telemetry event
	 * @screen Favourite Transactions
	 * @event Proof of Account
	 * 
	 * @param {SelectProofOfAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectProofOfAccount(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_PROOF_OF_ACCOUNT,
			tags: this._extractTags(TelemetryEvent.SELECT_PROOF_OF_ACCOUNT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectSearchOtherNeedModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select Search Other Need telemetry event
	 * @screen Favourite Transactions
	 * @event Search Other Need
	 * 
	 * @param {SelectSearchOtherNeedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectSearchOtherNeed(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`fulfill-need`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_SEARCH_OTHER_NEED,
			tags: this._extractTags(TelemetryEvent.SELECT_SEARCH_OTHER_NEED),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	
	/** Screen Unload: Need Fulfilled
	 * @screen Favourite Transactions
	 * @event Screen Unload: Favourite Transactions
	 * @returns { void } 
	 */
	 screenUnloadNeedFulfilled() {
		const spanId = this.currentActiveSpans.get(`fulfill-need`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`horizon.call`),
				eventName: TelemetryEvent.SCR_UNLD_NEED_FULFILLED,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_NEED_FULFILLED),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM)
			});

			this.currentActiveSpans.set(`fulfill-need`, null);
		}
	}
	// #endregion FULFILL NEED

	// #region STATEMENTS
	
	/**
	 * @typedef {Object} ScrLdStatementsModel
	 * @property {String} screen 
	 */

	/** Statements loaded telemetry event
	 * @screen Statements
	 * @event Screen Load: Statements
	 * 
	 * @param {ScrLdStatementsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadStatements(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SCR_LD_STATEMENTS,
			tags: this._extractTags(TelemetryEvent.SCR_LD_STATEMENTS),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
 			this.currentActiveSpans.set(`statements`, spanId); 
		}
	}

	/**
	 * @typedef {Object} SelectAccountTypeModel
	 * @property {String} screen 
	 * @property {String} accountType
	 */

	/** Select Account type telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectAccountTypeModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectAccountType(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_ACCOUNT_TYPE,
			tags: this._extractTags(TelemetryEvent.SELECT_ACCOUNT_TYPE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "accountType": baggage.accountType }
			]
		});
	}

	/**
	 * @typedef {Object} SelectAccountModel
	 * @property {String} screen
	 * @property {String} accountId
	 */

	/** Select Account type telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectAccount(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_ACCOUNT,
			tags: this._extractTags(TelemetryEvent.SELECT_ACCOUNT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "accountId": baggage.accountId }
			]
		});
	}

	/**
	 * @typedef {Object} SelectNextOnAccountModel
	 * @property {String} screen 
	 * @property {date} accountType
	 */

	/** Select Next on Account type telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectNextOnAccountModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectNextOnAccount(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_ACCOUNT_NEXT,
			tags: this._extractTags(TelemetryEvent.SELECT_ACCOUNT_NEXT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: []
		});
	}

	/**
	 * @typedef {Object} SelectNextOnPeriodModel
	 * @property {date} startDate
	 * @property {date} endDate
	 * @property {String} period
	 */

	/** Select Next On Period telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectNextOnPeriodModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectNextOnPeriod(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_PERIOD,
			tags: this._extractTags(TelemetryEvent.SELECT_PERIOD),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "period": baggage.period },
				{ "startDate": baggage.startDate },
				{ "endDate": baggage.endDate }
			
			]
		});
	}

	/**
	 * @typedef {Object} SelectViewDocumentsModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select  View Documents telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectViewDocumentsModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectViewDocuments(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.VIEW_DOCUMENT,
			tags: this._extractTags(TelemetryEvent.VIEW_DOCUMENT),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: []
		});
	}

	/**
	 * @typedef {Object} SendStatementModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select  View Documents telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SendStatementModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 sendStatement(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.STATEMENTS_SEND,
			tags: this._extractTags(TelemetryEvent.STATEMENTS_SEND),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectSendAnotherStatementModel
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Select  Send Another Statement telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectSendAnotherStatementModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectSendAnotherStatement(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.STATEMENTS_SEND_ANOTHER,
			tags: this._extractTags(TelemetryEvent.STATEMENTS_SEND_ANOTHER),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} SelectBackModel
	 * @property {String} screen
	 */

	/** Select Back telemetry event
	 * @screen Statements
	 * @event Statements
	 * 
	 * @param {SelectBackModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectBack(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`statements`),
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SELECT_BACK,
			tags: this._extractTags(TelemetryEvent.SELECT_BACK),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [{ "screen": baggage.screen }]
		});
	}

	/**
	 * @typedef  {Object} ScrUnldStatementsModel 
	 * @property {String} screen 
	 * @property {String} nextScreen
	 */

	/** Screen Unload: Statements Unload
	 * @screen Statements
	 * @event Screen Unload: Statements
	 * 
	 * @param {ScrUnldStatementsModel} baggage Information to attach to the telemetry event 
	 * @returns { void } 
	 */
	 screenUnloadStatements(baggage) {
		const spanId = this.currentActiveSpans.get(`statements`);

			if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: this.currentActiveSpans.get(`horizon.call`),
				eventName: TelemetryEvent.SCR_UNLD_STATEMENTS,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_STATEMENTS),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [
					{ "screen": baggage.screen },
					{ "nextScreen": baggage.nextScreen }
				]
			});

			this.currentActiveSpans.set(`statements`, null);
		}
	}

	// #endregion STATEMENTS
	
	// #region DEBI CHECK

	/**
	 * @typedef {Object} ScrLdDebiCheckModel
	 * @property {String} screen
	 */

	/** Debi Check
	 * @screen Debi Check
	 * @event Screen Load: Debi Check
	 * 
	 * @param {ScrLdDebiCheckModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadDebiCheck(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SCR_LD_DEBICHECK,
			tags: this._extractTags(TelemetryEvent.SCR_LD_DEBICHECK),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`debicheck`, spanId);
		}
	}

	/**
	 * @typedef {Object} ExitDebiCheckModel
	 * @property {String} screen
	 * @property {String} nextScreen
	 */

	/** Exit DebiCheck telemetry event
	 * @screen DebiCheck Mandate
	 * @nextScreen Favourites Landing
	 * @event Exit DebiCheck
	 * 
	 * @param {ExitDebiCheckModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 exitDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.EXIT_DEBICHECK,
			tags: this._extractTags(TelemetryEvent.EXIT_DEBICHECK),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} ViewDebiCheckMandateModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to View DebiCheck Screen
	 * @screen DebiCheck Mandate
	 * @event Navigate to View DebiCheck
	 * 
	 * @param {ViewDebiCheckMandateModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectViewDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.VIEW_DEBICHECK_MANDATE,
			tags: this._extractTags(TelemetryEvent.VIEW_DEBICHECK_MANDATE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} CloseViewDebiCheckModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Mandates Screen
	 * @screen View DebiCheck
	 * @event Navigate to DebiCheck Mandates
	 * 
	 * @param {CloseViewDebiCheckModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 closeViewDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.CLOSE_VIEW_DEBICHECK,
			tags: this._extractTags(TelemetryEvent.CLOSE_VIEW_DEBICHECK),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} DeclineDebiCheckMandateModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to Decline DebiCheck Mandate Screen
	 * @screen View DebiCheck Mandates
	 * @event Navigate to Decline DebiCheck Mandate
	 * 
	 * @param {DeclineDebiCheckMandateModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 declineDebiCheckMandate(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DECLINE_DEBICHECK_MANDATE,
			tags: this._extractTags(TelemetryEvent.DECLINE_DEBICHECK_MANDATE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

		/**
	 * @typedef {Object} DeclineDebiCheckConfirmationModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Confirmation Outcome
	 * @screen Decline DebiCheck
	 * @event Navigate to DebiCheck Confirmation Outcome
	 * 
	 * @param {DeclineDebiCheckConfirmationModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 declineDebiCheckConfirmation(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DECLINE_DEBICHECK_MANDATE,
			tags: this._extractTags(TelemetryEvent.DECLINE_DEBICHECK_MANDATE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} CancelDeclineDebiCheckModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Mandates Screen
	 * @screen Decline DebiCheck
	 * @event Navigate to DebiCheck Mandates
	 * 
	 * @param {CancelDeclineDebiCheckModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectCancelDeclineDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DECLINE_DEBICHECK_CANCELATION,
			tags: this._extractTags(TelemetryEvent.DECLINE_DEBICHECK_CANCELATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} ApproveDebiCheckModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Outcome Screen
	 * @screen Decline DebiCheck
	 * @event Navigate to DebiCheck Outcome
	 * 
	 * @param {ApproveDebiCheckModel} baggage Information to attach to the telemetry event
	 * There is no Approve DebiCheck Mandate Dialog / Buttons at this point to add an event.
	 * @returns { void } 
	 */
	 selectApproveDebiCheck(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.APPROVE_DEBICHECK_MANDATE,
			tags: this._extractTags(TelemetryEvent.APPROVE_DEBICHECK_MANDATE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} ApproveDebiCheckMandateConfirmationModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Approve Outcome Screen
	 * @screen Approve DebiCheck
	 * @event Navigate to DebiCheck Outcome
	 * 
	 * @param {ApproveDebiCheckMandateConfirmationModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectApproveDebiCheckConfirmation(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.APPROVE_DEBICHECK_CONFIMATION,
			tags: this._extractTags(TelemetryEvent.APPROVE_DEBICHECK_CONFIMATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}
	
	/**
	 * @typedef {Object} CancelDebiCheckMandateConfirmationModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Approve Outcome Screen
	 * @screen Approve DebiCheck
	 * @event Navigate to DebiCheck Outcome
	 * 
	 * @param {CancelDebiCheckMandateConfirmationModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 selectCancelDebiCheckConfirmation(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.APPROVE_DEBICHECK_CANCELATION,
			tags: this._extractTags(TelemetryEvent.APPROVE_DEBICHECK_CANCELATION),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} NavigateDebiCheckOutcomeModel
	 * @property {String} screen 
	 * @property  {String} nextScreen
	 */

	/** Navigate to DebiCheck Outcome Screen
	 * @screen DebiCheck Mandate Approve || Decline
	 * @event Navigate to DebiCheck Outcome
	 * 
	 * @param {NavigateDebiCheckOutcomeModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckOutcome(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBICHECK_OUTCOME,
			tags: this._extractTags(TelemetryEvent.DEBICHECK_OUTCOME),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "nextScreen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} NavigateDebiCheckOutcomeDoneModel
	 * @property {String} screen 
	 * @property {TelemetryOutcome} outcome
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Outcome Done Screen
	 * @screen DebiCheck Mandate Approve || Decline
	 * @event Navigate to DebiCheck Outcome
	 * 
	 * @param {NavigateDebiCheckOutcomeDoneModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckOutcomeDone(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBICHECK_OUTCOME_DONE,
			tags: this._extractTags(TelemetryEvent.DEBICHECK_OUTCOME_DONE),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} NavigateDebiCheckOutcomeBackToMandatesModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Mandates Screen
	 * @screen DebiCheck Mandate Mandates Outcome 
	 * @event Navigate to DebiCheck Mandates
	 * 
	 * @param {NavigateDebiCheckOutcomeBackToMandatesModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckOutcomeBackToMandates(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBICHECK_OUTCOME_BACK_TO_MANDATES,
			tags: this._extractTags(TelemetryEvent.DEBICHECK_OUTCOME_BACK_TO_MANDATES),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} NavigateDebiCheckOutcomeAssignModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Navigate to DebiCheck Outcome Assign Screen
	 * @screen DebiCheck Mandate Approve || Decline
	 * @event Navigate to DebiCheck Outcome Assign
	 * 
	 * @param {NavigateDebiCheckOutcomeAssignModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 debiCheckOutcomeAssign(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`debicheck`),
			parentSpan: null,
			eventName: TelemetryEvent.DEBICHECK_OUTCOME_ASSIGN,
			tags: this._extractTags(TelemetryEvent.DEBICHECK_OUTCOME_ASSIGN),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}

	/**
	 * @typedef {Object} ScrUnldDebiCheckMandatesModel 
	 * @property {String} screen 
	 */

	/** DebiCheck Mandates Screen Unload
	 * @screen DebiCheck Mandates Outcome
	 * @event Screen Unload: DebiCeck Mandates
	 * 
	 * @param {ScrUnldDebiCheckMandatesModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadDebiCheckMandates(baggage) {
		const spanId = this.currentActiveSpans.get(`debicheck`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_DEBICHECK,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_DEBICHECK),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [{ "screen": baggage.screen }]
			});

			this.currentActiveSpans.set(`debicheck`, null);
		}
	}


	// #endregion DEBI CHECK

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