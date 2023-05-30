import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service methods for Send Cash related functionality
 *
 * @export
 * @class SendCashService
 * @extends {ChannelServiceBase}
 */
 export class SendCashService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.sendCashServiceUrl`, 
			`SendCashChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	async getVouchers(sendCashVouchersRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`sendCashVouchers`)) {
			return this.mock(`sendCashVouchers`);
		}

		const url = `/clientcare-sendcash-${this._version}/vouchers/client`;

		return this.post(
			url,
			sendCashVouchersRequest,
			this.setToken(),
			`sendCashVouchers`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async putVoucherHold(sendCashHoldVoucherRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`sendCashVoucherHold`)) {
			return this.mock(`sendCashVoucherHold`);
		}

		const url = `/clientcare-sendcash-${this._version}/voucher/hold`;

		return this.post(
			url,
			sendCashHoldVoucherRequest,
			this.setToken(),
			`sendCashVoucherHold`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
 }