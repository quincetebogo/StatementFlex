import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * Class used to communicate with the Widget Registry Service via HTTP
 * 
 * @export
 * @class {WidgetRegistryService}
 * @extends {WidgetRegistryService}
 */
export class WidgetRegistryService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.widgetRegistryService`,
			`cec-cs-widgetregistry`,
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async getWidgetById(widgetId, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`getWidgetById`)) {
			return this.mock(`getWidgetById`);
		}

		const getWidgetByIdRequest = {
			"widgetId": widgetId
		};

		const url = `/clientcare-widgetregistry-${this._version}/get-widget-by-id`;

		return this.post(
			url,
			getWidgetByIdRequest,
			this.setToken(),
			`getWidgetById`,
			null,
			null,
			900,
			null,
			errorHandler,
			autoRetries
		);
	}
}