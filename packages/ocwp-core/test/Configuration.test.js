import { Configuration } from '../src/Configuration.js';
import fetchMock from 'fetch-mock';

const CHANNEL_SERVICE_URL = `http://channel.service`;

beforeAll(() => {
	fetchMock.mock(`/config.json`, JSON.stringify({
		channelServiceUrl: CHANNEL_SERVICE_URL
	}));
	fetchMock.mock(`/platform.json`, JSON.stringify({
		app: `widget`,
		application: {
			idp: {
				provider: `test`
			},
			permissions: [
				{
					name: `permission`
				}
			]
		}
	}));
	fetchMock.mock(`/widget.json`, JSON.stringify({
		events: []
	}));
	fetchMock.mock(`/runtime.json`, JSON.stringify({}));

	window.isMobile = true;

	window.platform = {
		security: true
	};
});

test(`getInstance() must return instance of Configuration class`, () => {
	const configuration = Configuration.getInstance();

	expect(configuration).toBeInstanceOf(Configuration);
});

test(`widgetManifest must be defined`, async () => {
	const configuration = Configuration.getInstance();
	await configuration.init();

	expect(configuration.config.widgetManifest).toBeDefined();
});

test(`getSetting() must return an expected value`, async () => {
	fetchMock.mock(`${CHANNEL_SERVICE_URL}/platform/config/v1/config/test`, `"value"`);
	fetchMock.mock(`/platform/config/v1/config/test`, `"value"`);

	const configuration = Configuration.getInstance();
	const result = await configuration.getSetting(`test`);

	expect(result).toEqual(`value`);
});

test(`getSetting() must return an expected value from cache`, async () => {
	fetchMock.mock(`${CHANNEL_SERVICE_URL}/platform/config/v1/config/testC`, `"value"`);
	fetchMock.mock(`/platform/config/v1/config/testC`, `"value"`);

	const configuration = Configuration.getInstance();
	const result = await configuration.getSetting(`test`);
	const result2 = await configuration.getSetting(`test`);

	expect(result).toEqual(`value`);
	expect(result2).toEqual(`value`);
});

test(`getSetting() must throw an error`, () => {
	fetchMock.mock(`${CHANNEL_SERVICE_URL}/platform/config/v1/config/bla`, {
		status: 200,
		body: null // <-- This must cause error to be thrown
	});
	fetchMock.mock(`/platform/config/v1/config/bla`, {
		status: 200,
		body: null // <-- This must cause error to be thrown
	});

	const configuration = Configuration.getInstance();
	expect(configuration.getSetting(`bla`)).rejects.toThrowError();
});

test(`init() must ensure that "isInitialized" is set correctly`, async () => {
	const configuration = Configuration.getInstance();
	await configuration.init();

	expect(configuration.isInitialized).toEqual(true);
});