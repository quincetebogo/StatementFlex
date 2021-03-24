import { Telemetry } from '../mocks/Telemetry';
import { v4 } from 'uuid';
import { SecurityContext } from 'platform/core';

/**
 * @typedef {Object} TelemetryScreen
 */
//TODO: put in own file and create HorizonTelemetry for import
export const TelemetryScreen = {
	WAIT_FOR_CALL : "Waiting For Call"
}

const TelemetryEvent = {
	CallStartSpan : "horizon.call.start-span"
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
export class TelemetryService {

	// --------------
	// INTERNAL STATE
	// --------------
	

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		//TODO: make singleton
		this.telemetry = new Telemetry();

		this.telemetryTraceId = v4(); //TODO: store traceId in state
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	/**
	 * @typedef {Object} IncomingCallModel
	 * @property {TelemetryScreen} screen The screen on which the event got triggered
	 * @property {String} ivr The IVR selection
	 * @property {String} ucid The Unique Call Identifier passed on from the PABX
	 * 
	 * @param {IncomingCallModel} baggage
	 */
	incomingCall(baggage) {	
		var telemetryCallSpanId = this.telemetry.spanStart({
			traceId : this.telemetryTraceId,
			parentSpan : null,
			eventName : TelemetryEvent.CallStartSpan,
			tags : this._extractTags(TelemetryEvent.CallStartSpan),
			eventType : TelemetryEventType.SYSTEM,
			eventOriginator : this._eventOriginator(TelemetryEventType.SYSTEM),

			baggage : [	{"screen" 		: baggage.screen},
						{"ivr" 			: baggage.ivr},
						{"ucid" 		: baggage.ucid} ]
		});	//TODO: save span id in state
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
