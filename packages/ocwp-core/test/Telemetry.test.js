import { Constants } from '../src/internals/Constants.js';
import FormData from 'form-data';
import LogStore from '../src/stores/LogStore.js';
import Telemetry from '../src/Telemetry.js';
import fetchMock from 'fetch-mock';

describe(`Mock tests`, () => {
	beforeAll(() => {

		fetchMock.mock(`/config.json`, JSON.stringify({}));
		fetchMock.mock(`/platform.json`, JSON.stringify({
			application: {
				idp: {
					provider: `test`
				},
				name: `test`
			}
		}));
		fetchMock.mock(`/runtime.json`, JSON.stringify({}));

		fetchMock.mock(`/platform/config/v1/config/platform:application.name`, `test-app`);

		fetchMock.mock(`/platform/telemetry/v1/event`, {
			status: 200,
			body: JSON.stringify({ data: `Sent payload` }),
			headers: {
				'Accept': `application/json`,
				'Content-Type': `application/json`
			}
		});

		global.FormData = FormData;

		window.platform = {
			security: true
		};
	});

	
	// event()  tests
	test(`event() must send telemetry event to channel service`, async () => {

		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.success`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			console.warn(error);
			throw error;
		}
	});

	test(`event() must throw an exception if param provided is is null`, async () => {

		let error1;
		try {
			await Telemetry.event(null);
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	// spanStart() tests
	test(`spanStart() must send start span event to channel service`, async () => {

		try {
			await Telemetry.spanStart({
				traceId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.start.span.success`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			console.warn(error);
			throw error;
		}
	});

		
	test(`spanStart() must throw an exception if param provided is null`, async () => {

		let error1;
		try {
			await Telemetry.spanStart(null);
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	// spanEnd() test
	test(`spanEnd() must send end span event to channel service`, async () => {

		try {
			await Telemetry.spanEnd({
				spanId: `acff3815-58d8-4a00-9aa6-61be7501e5ce`,
				eventName: `unit.test.end.span.success`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			console.warn(error);
			throw error;
		}
	});

	test(`spanEnd() must throw an exception if param provided is null`, async () => {

		let error1;
		try {
			await Telemetry.spanEnd(null);
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	// eventName param failure test			
	test(`event() must throw an exception if param eventName is not provided`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`event() must throw an exception if param eventName is not valid`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: 5,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});
	
	
	// eventType param failure test

	test(`event() must throw an exception if param eventType is not provided`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.eventType.failure`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`event() must throw an exception if param eventType is not valid`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.eventType.failure`,
				eventType: 5,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});
	
	// eventOriginator failure tests

	test(`event() must throw an exception if param eventOriginator is not provided`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.eventOriginator.failure`,
				eventType: `system`,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`event() must throw an exception if param eventOriginator is not valid`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.eventOriginator.failure`,
				eventType: `system`,
				eventOriginator: 5,
				tags: [`tag`, `you're it`],
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});


	// tags failure tests

	test(`event() must throw an exception if param tags is not provided`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.tags.failure`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`event() must throw an exception if param tags provided is not valid`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.tags.failure`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: `RandomString`,
				baggage: [{ key: `key`, value: `pair` }]
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});


	// baggage failure tests
	test(`event() must throw an exception if baggage parameter is not valid`, async () => {
		let error1;
		try {
			await Telemetry.event({
				traceId: `b651ae4a-a3e5-4f43-a392-07586cf70159`,
				spanId: `52b86536-abd1-4d16-b0bd-a671a1ff6656`,
				eventName: `unit.test.telemetry.event.baggage.failure`,
				eventType: `system`,
				eventOriginator: `unitTester`,
				tags: [`tag`, `you're it`],
				baggage: `test`
			});
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	// Telemetry failures with store queue
	test(`failed Telemetry events to be stored in queue`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/event`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.event({ traceId: `ae736009-d116-4c91-8b34-d914f5bcb80a`, spanId: `ceb6f86e-3881-4d9e-97c1-4670d756558d`, eventName: `unit.test.telemetry.event.retry`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.event({ traceId: `99391f97-8b6d-41ee-a336-218993287f5b`, spanId: `ceb6f86e-3881-4d9e-97c1-4670d756558d`, eventName: `unit.test.telemetry.event.retry`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		const telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.TELEMETRY_EVENT);
		expect(telemetryEvents.length).toEqual(2);
		LogStore.clearState();
	});

	test(`failed Span start events to be stored in queue`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/start`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanStart({ traceId: `ceb6f86e-3881-4d9e-97c1-4670d756558d`, eventName: `unit.test.start.span.retry`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanStart({ traceId: `d0ac831a-668e-4cd9-83c6-469cb1e7991b`, eventName: `unit.test.start.span.retry`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		const telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_START_EVENT);
		expect(telemetryEvents.length).toEqual(2);
		LogStore.clearState();
	});

	test(`failed Span end events to be stored in queue`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/end`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanEnd({ spanId: `5694a4db-782b-4d50-9881-85656a6fb90b`, eventName: `unit.test.end.span.retry`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanEnd({ spanId: `eb84a245-bd30-49ab-a951-5b8500853493`, eventName: `unit.test.end.span.retry`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		const telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_END_EVENT);
		expect(telemetryEvents.length).toEqual(2);
		LogStore.clearState();
	});

	// Telemetry event failures with retries
	test(`failed Telemetry events to succeed after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/event`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.event({ traceId: `f5b21f94-ddcb-4fc7-82b8-7e60fe909c85`, spanId: `d2c4460d-1187-4eb3-90d3-9daa52dc4225`, eventName: `unit.test.telemetry.event.retry.success`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.event({ traceId: `a627838d-daf2-461b-9077-3f000b0b19db`, spanId: `d2c4460d-1187-4eb3-90d3-9daa52dc4225`, eventName: `unit.test.telemetry.event.retry.success`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.TELEMETRY_EVENT);
		expect(telemetryEvents.length).toEqual(2);

		fetchMock.mock(`/platform/telemetry/v1/event`, { status: 200 }, { overwriteRoutes: true });

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.TELEMETRY_EVENT);
		expect(telemetryEvents.length).toEqual(0);

		LogStore.clearState();
	});

	// Span start event failures with retries
	test(`failed Span start events to succeed after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/start`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanStart({ traceId: `52f1593a-5f11-488c-bcab-9726454c63d2`, eventName: `unit.test.start.span.retry.success`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanStart({ traceId: `5bcb8b87-4ded-4250-9789-6fa9a22ff95a`, eventName: `unit.test.start.span.retry.success`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetrySpanStartEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_START_EVENT);
		expect(telemetrySpanStartEvents.length).toEqual(2);

		fetchMock.mock(`/platform/telemetry/v1/span/start`, { status: 200 }, { overwriteRoutes: true });

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetrySpanStartEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_START_EVENT);
		expect(telemetrySpanStartEvents.length).toEqual(0);

		LogStore.clearState();
	});

	// Span end event failures with retries
	test(`failed Span end events to succeed after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/end`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanEnd({ spanId: `d9ffdb26-3361-4df1-ac52-63d57a987235`, eventName: `unit.test.end.span.retry.success`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanEnd({ spanId: `c45e292e-b3bd-466b-b509-493d40c0c024`, eventName: `unit.test.end.span.retry.success`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetrySpanEndEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_END_EVENT);
		expect(telemetrySpanEndEvents.length).toEqual(2);

		fetchMock.mock(`/platform/telemetry/v1/span/end`, { status: 200 }, { overwriteRoutes: true });

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetrySpanEndEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_END_EVENT);
		expect(telemetrySpanEndEvents.length).toEqual(0);

		LogStore.clearState();
	});

	// Telemetry event failures with failure retries
	test(`failed Telemetry events to fail again after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/event`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.event({ traceId: `79e38427-82ff-4d0b-a7ba-fb3caa3542b5`, spanId: `83d15dc8-fabc-4848-8282-deb31306e80e`, eventName: `unit.test.telemetry.event.retry.failure`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.event({ traceId: `79e38427-82ff-4d0b-a7ba-fb3caa3542b6`, spanId: `83d15dc8-fabc-4848-8282-deb31306e80e`, eventName: `unit.test.telemetry.event.retry.failure`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.TELEMETRY_EVENT);
		expect(telemetryEvents.length).toEqual(2);

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetryEvents = LogStore.getRetryQueue(Constants.telemetry.TELEMETRY_EVENT);
		expect(telemetryEvents.length).toEqual(2);

		LogStore.clearState();
	});

	// Telemetry span start event failures with failure retries
	test(`failed Span start events to fail again after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/start`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanStart({ traceId: `48d7b66e-aedb-4769-8d4a-71f4582e3892`, eventName: `unit.test.start.span.retry.failure`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanStart({ traceId: `0a3a7e2b-9c72-4e79-8367-e281f5ccdd7b`, eventName: `unit.test.start.span.retry.failure`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetrySpanStartEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_START_EVENT);
		expect(telemetrySpanStartEvents.length).toEqual(2);

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetrySpanStartEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_START_EVENT);
		expect(telemetrySpanStartEvents.length).toEqual(2);

		LogStore.clearState();
	});

	// Telemetry span start event failures with failure retries
	test(`failed Span end events to fail again after retry`, async () => {

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/telemetry/v1/span/end`, { status: 403 }, { overwriteRoutes: true });

		await Telemetry.spanEnd({ spanId: `2c91b277-c858-4893-b068-ba9ac4d61551`, eventName: `unit.test.end.span.retry.failure`, eventType: `person`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });
		await Telemetry.spanEnd({ spanId: `6dc9c4dd-7346-4171-97dc-d97a9c3099f1`, eventName: `unit.test.end.span.retry.failure`, eventType: `system`, eventOriginator: `unitTester`, tags: [`tag`, `you're it`], baggage: [{ key: `key`, value: `pair` }] });

		let telemetrySpanEndEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_END_EVENT);
		expect(telemetrySpanEndEvents.length).toEqual(2);

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		telemetrySpanEndEvents = LogStore.getRetryQueue(Constants.telemetry.SPAN_END_EVENT);
		expect(telemetrySpanEndEvents.length).toEqual(2);

		LogStore.clearState();
	});

});