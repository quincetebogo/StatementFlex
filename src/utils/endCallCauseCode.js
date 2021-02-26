import { HorizonStore } from 'app/store/HorizonStore';

const DEFAULT_CAUSECODE = `ValidTransaction`;

/**
 * End call cause code
 * 
 * @export
 * @class EndCallCauseCode
 * @extends {}
 */
export class EndCallCauseCode {

	static getInstance() {
		return this.instance || (this.instance = new EndCallCauseCode());
	}

	constructor() {
		this.horizonStore = HorizonStore.getInstance();

		this.causeCode = new Map();

		this.causeCode.set(`VerifyClient`, {
			"Need incomplete, bad connection": `ClientFailedSecurityCheck`
		});
		this.causeCode.set(`StopCard`, {
			"Need Fulfilled": `NormalEnquiry`
		});
		this.causeCode.set(`Transact`, {
			"Need incomplete, bad connection": `NormalEnquiry`
		});
		this.causeCode.set(`Transact`, {
			"Need Fulfilled": `NormalEnquiry`
		});
	}

	getCauseCode(context, clientNeed, reasonCode) {

		const verifyClient = () => this._verifyClient(context, clientNeed, reasonCode);
		const landingPage = () => this._landingPage(context, clientNeed, reasonCode);

		const toDoActionByContext = {
			VerifyClient: verifyClient,
			LandingPage: landingPage
		}

		if (toDoActionByContext[context]) {
			return toDoActionByContext[context]();
		}
		return DEFAULT_CAUSECODE; // Default cause code
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_verifyClient(context, clientNeed, reasonCode) {
		const failedVerificationCount = this._getFailedVerificationCount();
		if (this.causeCode.has(context)) {
			return failedVerificationCount > 0 ? this.causeCode.get(context)[reasonCode] : DEFAULT_CAUSECODE;
		}
		return DEFAULT_CAUSECODE; // Default cause code
	}

	_landingPage(context, clientNeed, reasonCode) {

		if (this.causeCode.has(context)) {
			return this.causeCode.get(context)[reasonCode];
		}

		const stopCard = () => this._stopCard(clientNeed, reasonCode);
		const transact = () => this._transact(clientNeed, reasonCode);

		const toDoActionByClietNeed = {
			StopCard: stopCard,
			Transact: transact
		};

		if (toDoActionByClietNeed[clientNeed]) {
			return this.causeCode.get(clientNeed)[reasonCode];
		}
		return DEFAULT_CAUSECODE; // Default cause code
	}

	_stopCard(clientNeed, reasonCode) {
		return this.causeCode.get(clientNeed)[reasonCode] ? this.causeCode.get(clientNeed)[reasonCode] : DEFAULT_CAUSECODE;
	}

	_transact(clientNeed, reasonCode) {

		/**
		 * Case: When max attempts to verify exhausted, ita / xds verification failed screen is shown
		 * Since the context of that screen is `LandingPage` and cause code is `FailedSecurityCheck`
		 * It's handled explicitly
		 */
		const failedVerificationCount = this._getFailedVerificationCount();
		if (failedVerificationCount > 0) {
			return this.causeCode.get(`VerifyClient`)[reasonCode];
		}
		return this.causeCode.get(clientNeed)[reasonCode] ? this.causeCode.get(clientNeed)[reasonCode] : DEFAULT_CAUSECODE;
	}

	_getFailedVerificationCount() {
		const state = this.horizonStore.recoverState();
		const callerInformation = state.callerInformation;

		return callerInformation.verificationAttempts.itaAttempts + callerInformation.verificationAttempts.xdsAttempts;
	}
}