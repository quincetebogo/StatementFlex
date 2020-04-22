export class ServiceCallHelper {


	constructor(toggleBusyFunc, generalErrorHandler = null) {
		this.toggleBusyFlag = toggleBusyFunc;
		this.generalErrorHandler = generalErrorHandler;
	}

	async makeCall(serviceCall, errorHandler = null) {
		try {
			this.toggleBusyFlag();
			return await serviceCall;
		}
		catch (ex) {
			if (errorHandler != null) {
				errorHandler(ex);
			}
			else if (this.generalErrorHandler != null) {
				this.generalErrorHandler(ex);
			}
			else {
				throw (ex);
			}
		}
		finally {
			this.toggleBusyFlag();
		}

		return null;
	}
}
