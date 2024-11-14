import { HttpClient } from '../src/HttpClient.js';
import { Service } from '../src/Service.js';
import fetchMock from 'fetch-mock';

// jest.mock(`../src/Configuration`);
// jest.mock(`../src/HttpClient`);


/**
 * Create service instance to use in tests.
 *
 * @returns {Service} Instance
 */
function _getServiceInstance() {
	return new Service({
		baseUrlKey: `cs`,
		name: `service`
	});
}

beforeAll(() => {

	fetchMock.mock(`/config.json`, JSON.stringify({
		cs: `http://channel.service`
	}));

	fetchMock.mock(`/platform.json`, JSON.stringify({
		application: {
			idp: {
				provider: `test`
			},
			name: `test`
		}
	}));
	fetchMock.mock(`/runtime.json`, JSON.stringify({}));

	window.isMobile = true;

	fetchMock.mock(`/platform/metric/v1/batch`, {
		status: 200,
		body: JSON.stringify({ data: `Sent payload` }),
		headers: {
			'Accept': `application/json`,
			'Content-Type': `application/json`
		}
	});

	fetchMock.mock(`/platform/metric/v1/single`, {
		status: 200,
		body: JSON.stringify({ data: `Sent payload` }),
		headers: {
			'Accept': `application/json`,
			'Content-Type': `application/json`
		}
	});
});

test(`constructor() must return instance of Service class`, () => {
	const service = _getServiceInstance();
	expect(service).toBeInstanceOf(Service);
});

test(`"htpClient" must return instance of HttpClient class`, () => {
	const service = _getServiceInstance();
	const httpClient = service.httpClient;
	expect(httpClient).toBeInstanceOf(HttpClient);
});

test(`"_handleBadMetric()" to throw error when no "badMetric" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleBadMetric()).rejects.toThrowError();
});

test(`"_handleBadMetric()" to throw error when no "badMetric.context" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleBadMetric({})).rejects.toThrowError();
});

test(`"_handleBadMetric()" to return when "badMetric.context" does not match internal context`, async () => {
	const service = _getServiceInstance();
	const r = await service._handleBadMetric({
		context: `one`,
		metric: {}
	});

	expect(r).toBeUndefined();
});

test(`"_handleBadMetric()" to throw error when no "badMetric.metric" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleBadMetric({
		context: `service`
	})).rejects.toThrowError();
});

test(`"_handleBadMetric()" to return Promise when "badMetric.context" does match internal context`, async () => {
	const service = _getServiceInstance();
	const r = await service._handleBadMetric({
		context: `service`,
		metric: {}
	});
});

test(`"_handleBadMetric()" to return Promise when "badMetric.context" does match internal context`, async () => {
	const service = _getServiceInstance();
	await service._handleBadMetric({
		context: `service`,
		metric: {}
	});
});

test(`"_handleGoodMetrics()" to throw error when no "goodMetrics" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleGoodMetrics()).rejects.toThrowError();
});

test(`"_handleGoodMetrics()" to throw error when no "goodMetrics.context" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleGoodMetrics({})).rejects.toThrowError();
});

test(`"_handleGoodMetrics()" to return when "goodMetrics.context" does not match internal context`, async () => {
	const service = _getServiceInstance();
	const r = await service._handleGoodMetrics({
		context: `one`,
		metrics: [{}, {}]
	});

	expect(r).toBeUndefined();
});

test(`"_handleGoodMetrics()" to throw error when no "goodMetrics.metrics" is not provided`, () => {
	const service = _getServiceInstance();
	expect(service._handleGoodMetrics({
		context: `service`
	})).rejects.toThrowError();
});

test(`"_handleGoodMetrics()" to throw error when no "goodMetrics.metrics" is not an array`, () => {
	const service = _getServiceInstance();
	expect(service._handleGoodMetrics({
		context: `service`,
		metrics: {}
	})).rejects.toThrowError();
});

test(`"_handleGoodMetrics()" to throw error when no "goodMetrics.metrics" is an empty array`, () => {
	const service = _getServiceInstance();
	expect(service._handleGoodMetrics({
		context: `service`,
		metrics: []
	})).rejects.toThrowError();
});

test(`"_handleGoodMetrics()" to return Promise when "badMetric.context" does match internal context`, () => {
	const service = _getServiceInstance();
	const r = service._handleGoodMetrics({
		context: `service`,
		metrics: [{}, {}]
	});

	expect(r).toBeInstanceOf(Promise);
});

test(`"_handleGoodMetrics()" to call good endpoint when "badMetric.context" does match internal context`, async () => {
	const service = _getServiceInstance();
	await service._handleGoodMetrics({
		context: `service`,
		metrics: [{}, {}]
	});
});