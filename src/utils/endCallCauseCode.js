import { HorizonStore } from 'app/store/HorizonStore';

const DEFAULT_CAUSECODE = `NormalEnquiry`;
const FAILED_VERIFICATION_CAUSECODE = `ClientFailedSecurityCheck`;

const VERIFICATION_STATUS = {
	VERIFIED: `verified`,
	UNVERIFIED: `unverified`
};

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
			"Need incomplete, bad connection": `NormalEnquiry`
		});
		this.causeCode.set(`VerifyClient`, {
			"Client failed verification": `ClientFailedSecurityCheck`
		});
		this.causeCode.set(`LandingPage`, {
			"Client failed verification": `ClientFailedSecurityCheck`
		});
		this.causeCode.set(`StopCard`, {
			"Need fulfilled": `NormalEnquiry`
		});
		this.causeCode.set(`Transact`, {
			"Need incomplete, bad connection": `NormalEnquiry`
		});
		this.causeCode.set(`Transact`, {
			"Need fulfilled": `NormalEnquiry`
		});
	}

	getCauseCode(context, clientNeed, reasonCode) {

		const verifyClient = () => this._verifyClient(context, clientNeed, reasonCode);
		const landingPage = () => this._landingPage(context, clientNeed, reasonCode);

		const toDoActionByContext = {
			VerifyClient: verifyClient,
			LandingPage: landingPage,
			TransactionHistory: landingPage,
			QuickTransactionSuccess: landingPage,
			QuickTransactionsUnSuccess: landingPage,
			QuickTransactionsInProgress: landingPage
		};

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
			return this.causeCode.get(context)[reasonCode] || DEFAULT_CAUSECODE;
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
			return toDoActionByClietNeed[clientNeed]();
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
		const verificationStatus = this._getVerificationStatus();
		
		if (failedVerificationCount > 0 && verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
			return FAILED_VERIFICATION_CAUSECODE;
		}

		return this.causeCode.get(clientNeed)[reasonCode] ? this.causeCode.get(clientNeed)[reasonCode] : DEFAULT_CAUSECODE;
	}

	_getFailedVerificationCount() {
		const callerInformation = this.horizonStore.getCallerInformation();

		// If ending a call very early (system error on invoking search dialog for example), we do not yet have
		// caller information
		return callerInformation 
			? callerInformation.verificationAttempts.itaAttempts + callerInformation.verificationAttempts.xdsAttempts
			: 0;
	}

	_getVerificationStatus() {
		const callerInformation = this.horizonStore.getCallerInformation();
		const status = callerInformation && callerInformation.verificationStatus;
		return status || `unverified`;
	}
}