export class ServiceCallHelper {

	constructor(t) {
		this.toggleBusyFlag = t;
	}

	async makeCall(f, e) {
		try {
			this.toggleBusyFlag();
			return await f;
		}
		catch (ex) {
			e(ex);
		}
		finally {
			this.toggleBusyFlag();
		}

		return null;
	}
}
