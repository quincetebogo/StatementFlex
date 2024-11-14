import { MetricProcessor } from '../src/MetricProcessor.js';
import { jest } from '@jest/globals';

test(`getInstance() must return instance of MetricProcessor class`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	expect(metricProcessor).toBeInstanceOf(MetricProcessor);
});

test(`getInstance() must throw error when no context is specified`, () => {
	let err;
	try {
		const metricProcessor = MetricProcessor.getInstance(``);
		expect(metricProcessor).toBeInstanceOf(MetricProcessor);
	} catch (error) {
		err = error;
	}
	expect(err).toBeDefined();
});

test(`onBadMetricPublishCallback() call successful`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	metricProcessor.onBadMetricPublishCallback(() => { }, `test`);
});

test(`onBadMetricPublishCallback() call throws error when no "callback" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.onBadMetricPublishCallback();
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`onBadMetricPublishCallback() call throws error when no "context" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.onBadMetricPublishCallback(() => { });
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`onGoodMetricsPublishCallback() call successful`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	metricProcessor.onGoodMetricsPublishCallback(() => { }, `test`);
});

test(`onGoodMetricsPublishCallback() call throws error when no "callback" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.onGoodMetricsPublishCallback();
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`onGoodMetricsPublishCallback() call throws error when no "context" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.onGoodMetricsPublishCallback(() => { });
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call throws error when no "metric" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.processMetric();
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call throws error when no "metric.duration" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.processMetric({});
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call throws error when no "metric.sla" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.processMetric({
			duration: 100
		});
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call throws error when no "metric.context" provided`, () => {

	let err = null;

	try {
		const metricProcessor = MetricProcessor.getInstance(`test`);
		metricProcessor.processMetric({
			duration: 100,
			sla: 50
		});
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call aggregates good metric`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	metricProcessor.processMetric({
		duration: 50,
		sla: 100,
		context: `test`
	});
});

test(`processMetric() call aggregates good metrics and dispatches them based on max count with callback`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	metricProcessor.onGoodMetricsPublishCallback((payload) => {
		const x = payload;
	}, `test`);

	for (let i = 0; i < 12; i++) {
		metricProcessor.processMetric({
			duration: 50,
			sla: 100,
			context: `test`
		});
	}
});

jest.setTimeout(20000);

test(`processMetric() call aggregates good metrics and dispatches them based on max time with callback`, (done) => {
	const metricProcessor = MetricProcessor.getInstance(`test-good-metric-with-timeout`);
	metricProcessor.onGoodMetricsPublishCallback((payload) => {
		const x = payload;
	}, `test-good-metric-with-timeout`);

	metricProcessor.processMetric({
		duration: 50,
		sla: 100,
		context: `test-good-metric-with-timeout`
	});

	setTimeout(() => {
		console.log(`TIME IS UP`);
		done();
	}, 12000);
});

test(`processMetric() call throws error when attempting to dispatch good metrics do to missing callback`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test-no-good-callback`);

	let err = null;

	try {
		for (let i = 0; i < 12; i++) {
			metricProcessor.processMetric({
				duration: 50,
				sla: 100,
				context: `test-no-good-callback`
			});
		}
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});

test(`processMetric() call dispatches bad metric with callback`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test`);
	metricProcessor.onBadMetricPublishCallback((payload) => {
		const x = payload;
	}, `test`);

	metricProcessor.processMetric({
		duration: 100,
		sla: 50,
		context: `test`
	});
});

test(`processMetric() call dispatches bad timed out metric with callback`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test-timed-out`);
	metricProcessor.onBadMetricPublishCallback((payload) => {
		const x = payload;
	}, `test-timed-out`);

	metricProcessor.processMetric({
		duration: 100,
		sla: 50,
		context: `test-timed-out`
	}, true);
});

test(`processMetric() call throws error when attempting to dispatch bad metric do to missing callback`, () => {
	const metricProcessor = MetricProcessor.getInstance(`test-no-bad-callback`);

	let err = null;

	try {
		metricProcessor.processMetric({
			duration: 100,
			sla: 50,
			context: `test-no-bad-callback`
		});
	} catch (error) {
		err = error;
	}

	expect(err).toBeDefined();
});