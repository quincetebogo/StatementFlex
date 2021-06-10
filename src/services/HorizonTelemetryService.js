import { SecurityContext } from 'platform/core';
import { Telemetry } from 'platform/Telemetry';
import { TelemetryStore } from 'app/store/TelemetryStore';
import { v4 } from 'uuid';

/*
 * Horizon Telemetry
 *
 * Please see the Data Spec at https://confluence.capitecbank.co.za:8443/display/HOR/Horizon+Telemetry 
 */

/** The event names to use when logging telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * @readonly
 * @enum {String} TelemetryEvent
 */
const TelemetryEvent = {

	// End Call
	SCR_LD_END_CALL: `horizon.call.end-call.start-span`,
	END_CALL: `horizon.call.end-call.end-call`,
	END_CALL_CANCEL: `horizon.call.end-call.cancel`,
	SCR_UNLD_END_CALL: `horizon.call.end-call.end-span`,
	END_CALL_SELECTED: `horizon.call.end-call-selected`,


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
	FEEDBACK: `Feedback`,
	ASSIGN_STOP_CARD: `Assign stop card`,
	END_CALL: `End Call Session`,
    PRODUCT_INFO: `Product Info`,

    CARD_LIMITS_LANDING: `Card limits`,
    DISCARD_CHANGES: `Discard changes`,
    LIMITS_AGREEMENT: `Update Limits Agreement`,
    UPDATE_LIMITS_OUTCOME: `Update limits outcome`
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
 * @class TelemetryService
 * @extends Telemetry
 */
export class HorizonTelemetry extends Telemetry{
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
			"call": null,
			"id-caller": null,
			"confirm-caller": null,
			"search-client": null,
			"add-caller": null,
			"verify-caller": null,
			"ita": null,
			"xds": null,
			"fulfill-need": null,
			"debicheck": null,
			"stop-card": null,
			"update-card-limits": null,
			"tap-to-pay": null,
			"statements": null,
			"proof-of-account": null,
			"tax-certificate": null,
			"otherneed": null,
			"end-call": null,
			"feedback": null,
			"assign-stop-card": null
		};

		this.activeSpanTree = [];
		this.telemetryStore = new TelemetryStore();
		this._telemetry = Telemetry.getInstance();

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
			if (Object.prototype.hasOwnProperty.call(this.currentActiveSpans, prop)) {
				return this.currentActiveSpans[prop];
			}

			const telemetryDetails = this.telemetryStore.getTelemetryDetails();
			if (Object.prototype.hasOwnProperty.call(telemetryDetails.currentActiveSpans, prop)) {
				return telemetryDetails.currentActiveSpans[prop];
			}
			return null;
		};

		this.currentActiveSpans.set = (prop, val) => {
			this.currentActiveSpans[prop] = val;
		
			const telemetryDetails = this.telemetryStore.getTelemetryDetails();
			telemetryDetails.currentActiveSpans = this.currentActiveSpans;

			this.telemetryStore.setTelemetryDetails(telemetryDetails);
		};

		const telemetryDetails = this.telemetryStore.getTelemetryDetails();
		if (telemetryDetails && telemetryDetails.activeSpanTree) {
			Object.assign(this.activeSpanTree, telemetryDetails.activeSpanTree);
		}
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

	async startSpan(eventName, baggage = null, singleChildParent = null) {

		/**
		 * Extracting eventName(call.id-caller.confimr-caller) into events array(['call', 'id-caller', 'confirm-caller'])
		 * And finding the current event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = events[events.length - 1];
		const currentSpanID = this._getSpanID(currentSpan);

		// If the specific span got intialized already, do nothing and return
		if (currentSpanID) {
			return;
		}

		const spanID = await this._telemetry.spanStart({
			baggage: this._formatBaggaeDetails(baggage || []),
			eventName: `horizon.${eventName}.start-span`,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),
			eventType: TelemetryEventType.SYSTEM,
			parentSpan: this._getParentSpanID(eventName),
			tags: this._extractTags(`horizon.${eventName}.start-span`),
			traceId: this.traceId
		});
        console.log('startSpan: ' + spanID);
		if (spanID) {

			/**
			 * Assigning the sapnd id to current active span tree('call'/ 'id-caller'/ 'confirm-caller')
			 */
			this._addToActiveSpanTree(currentSpan, spanID, this._getParentSpanName(eventName), singleChildParent);
		}
	}

	async endSpan(eventName, baggage = null) {

		/**
		 * Extracting eventName(call.id-caller) into events array(['call', 'id-caller'])
		 * And finding the current span of an event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = events[events.length - 1];
		const spanId = this._getSpanID(currentSpan);

		if (this.traceId && spanId) {
			await this._telemetry.spanEnd({
				baggage: this._formatBaggaeDetails(baggage || []),
				eventName: `horizon.${eventName}.end-span`,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),
				eventType: TelemetryEventType.SYSTEM,
				parentSpan: null,
				spanId: spanId,
				tags: this._extractTags(`horizon.${eventName}.end-span`),
				traceId: this.traceId
			});
	
			// disposing current span node reference
			this._deleteFromActiveSpanTree(currentSpan);
		} else {
			// TODO: Log that there was a telemetry failure (missing trace ID or span ID)
		}
	}

	async logEvent(eventName, baggage = null) {

		/**
		 * Extracting eventName(call.incident-created) into events array(['call', 'incident-created'])
		 * And finding the current span of an event('call'/ 'id-caller'/ 'confirm-caller')
		 */
		const events = this._extractTags(eventName);
		const currentSpan = this._getCurrentSpanofEvent(events);

		await this._telemetry.event({
			baggage: this._formatBaggaeDetails(baggage || []),
			eventName: `horizon.${eventName}`,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),
			eventType: TelemetryEventType.SYSTEM,
			parentSpan: null,
			spanId: this._getSpanID(currentSpan),
			tags: this._extractTags(`horizon.${eventName}`),
			traceId: this.traceId
		});
		// event, thus no new span reference to update
	}

	// #region ACCEPT CALL
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

	// #endregion CONFIRM CALLER
	
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

	// #region FULFILL NEED

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

	// #region Search Other Need

	/**
	 * @typedef {Object} ScrLdOtherNeedModel
	 * @property {String} screen
	 */

	/** Other Need
	 * @screen Search Other Need
	 * @event Screen Load: Search Other Need
	 * 
	 * @param {ScrLdOtherNeedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadOtherNeed(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`fulfill-need`),
			eventName: TelemetryEvent.SCR_LD_OTHERNEED,
			tags: this._extractTags(TelemetryEvent.SCR_LD_OTHERNEED),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`otherneed`, spanId);
		}
	}


/**
	 * @typedef {Object} NavigateOtherNeedModel
	 * @property {String} screen 
	 * @property {String} nextScreen 
	 */

	/** Launches Strack
	 * @screen Strack
	 * @event Navigate to Strack screen
	 * 
	 * @param {NavigateOtherNeedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 otherNeedLaunchStrack(baggage) {
		super.event({
			traceId: this.traceId,
			spanId: this.currentActiveSpans.get(`otherneed`),
			parentSpan: null,
			eventName: TelemetryEvent.SELECT_LAUNCH_STRACK,
			tags: this._extractTags(TelemetryEvent.SELECT_LAUNCH_STRACK),
			eventType: TelemetryEventType.PERSON,
			eventOriginator: this._eventOriginator(TelemetryEventType.PERSON),

			baggage: [
				{ "screen": baggage.screen },
				{ "next-screen": baggage.nextScreen }
			]
		});
	}



	/**
	 * @typedef {Object} ScrUnldOtherNeedModel 
	 * @property {String} screen 
	 * @property {String} clientNeed 
	 * @property {String} specificNeed 
	 * @property {String} issueType 
	 */

	/** Search Other Need Screen Unload
	 * @screen  Search Other Need 
	 * @event Screen Unload: Search Other Need
	 * 
	 * @param {ScrUnldOtherNeedModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadOtherNeed(baggage) {
		const spanId = this.currentActiveSpans.get(`otherneed`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_OTHERNEED,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_OTHERNEED),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [
					{ "screen": baggage.screen },
					{ "client-need": baggage.clientNeed },
					{ "specific-need": baggage.specificNeed },
					{ "issue-type": baggage.issueType }
				]
			});

			this.currentActiveSpans.set(`otherneed`, null);
		}
	}



	// #endregion Search Other Need

	// #region Feedback screen 

	/**
	 * @typedef {Object} ScrLdFeedbackModel
	 * @property {String} screen
	 */

	/** Feedback screen
	 * @screen Feedback screen
	 * @event Screen Load: Feedback screen
	 * 
	 * @param {ScrLdFeedbackModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenLoadFeedbackScreen(baggage) {
		const spanId = super.spanStart({
			traceId: this.traceId,
			parentSpan: this.currentActiveSpans.get(`otherneed`),
			eventName: TelemetryEvent.SCR_LD_FEEDBACK,
			tags: this._extractTags(TelemetryEvent.SCR_LD_FEEDBACK),
			eventType: TelemetryEventType.SYSTEM,
			eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage: [{ "screen": baggage.screen }]
		});

		if (spanId) {
			this.currentActiveSpans.set(`feedback`, spanId);
		}
	}


	/**
	 * @typedef {Object} ScrUnldFeedbackModel 
	 * @property {String} screen 
	 * @property {String} strackOutcome 
	 */

	/** Feedback screen Unload
	 * @screen  Feedback screen 
	 * @event Screen Unload: Feedback screen
	 * 
	 * @param {ScrUnldFeedbackModel} baggage Information to attach to the telemetry event
	 * @returns { void } 
	 */
	 screenUnloadFeedbackScreen(baggage) {
		const spanId = this.currentActiveSpans.get(`feedback`);

		if (this.traceId && spanId) {
			super.spanEnd({
				traceId: this.traceId,
				spanId: spanId,
				parentSpan: null,
				eventName: TelemetryEvent.SCR_UNLD_FEEDBACK,
				tags: this._extractTags(TelemetryEvent.SCR_UNLD_FEEDBACK),
				eventType: TelemetryEventType.SYSTEM,
				eventOriginator: this._eventOriginator(TelemetryEventType.SYSTEM),

				baggage: [
					{ "screen": baggage.screen },
					{ "strack-outcome": baggage.strackOutcome },
				]
			});

			this.currentActiveSpans.set(`feedback`, null);
		}
	}



	// #endregion Feedback screen 

	// #endregion PUBLIC METHODS

	// #region PRIVATE METHODS
	// ---------------
	// PRIVATE METHODS
	// ---------------
	_extractTags(eventName) {
		return eventName && eventName.split(`.`);
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

	_getCurrentSpanofEvent(events) {
		const event = events[events.length - 1];
		let eventIndex = events.length - 1;
		let currSpan = ``;

		while (!currSpan) {
			currSpan = events[eventIndex - 1];
			const currSpanID = this._getSpanID(currSpan);

			if (!currSpanID) {
				currSpan = ``;
				eventIndex--;
			}
		}
		return currSpan;
	}

	_getParentSpanID(eventName) {
		const eventsArr = this._extractTags(eventName);
		const curSpanIndex = eventsArr.length - 1;
		const parentSpan = eventsArr[curSpanIndex - 1];
		
		return this._getSpanID(parentSpan);
	}

	_getParentSpanName(eventName) {
		const eventsArr = this._extractTags(eventName);
		const curEventIndex = eventsArr.length - 1;
		const parentEvent = eventsArr[curEventIndex - 1];
		
		return parentEvent;
	}

	_formatBaggaeDetails(baggage) {
		let array = [];

		Object.entries(baggage).map(item => {
			array.push({
				[item[0]]: item[1]
			});
		});
		return array;
	}

	_addToActiveSpanTree(span, spanID, parentSpan) {
		const node = this._generateNode(span, spanID, parentSpan);
		this.activeSpanTree.push(node);
		this._updateTelemetryStore();
	}

	_deleteFromActiveSpanTree(span) {
		if (this.activeSpanTree.length === 0) {
			return;
		}

		const spanIndex = this.activeSpanTree.findIndex(item => item.span === span);
		this.activeSpanTree.splice(spanIndex, 1);
		this._updateTelemetryStore();
	}

	_generateNode(span, spanID, parentSpan) {
		return {
			"span": span,
			"spanID": spanID,
			"parentSpan": parentSpan
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