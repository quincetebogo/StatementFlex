import { EventAggregator } from '../src/EventAggregator.js';
import fetchMock from 'fetch-mock';

beforeAll(() => {
});

test(`getInstance() must return instance of EventAggregator class`, () => {
	const eventAggregator = EventAggregator.getInstance();

	expect(eventAggregator).toBeInstanceOf(EventAggregator);
});

test(`publish throws exception when event is not a string`, () => {
	const eventAggregator = EventAggregator.getInstance();

	let ex;
	try {
		eventAggregator.publish({}, {});
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`publish does not throw exception when no subscribers`, () => {
	const eventAggregator = EventAggregator.getInstance();

	eventAggregator.publish(`no-subs`, {});
});

test(`publish calls subscribers`, () => {
	const eventAggregator = EventAggregator.getInstance();
	let called = false;
	const sub = eventAggregator.subscribe(`subbed`, () => {
		called = true;
	});

	eventAggregator.publish(`subbed`, {});

	expect(called).toEqual(true);

	sub.dispose();
});

test(`subscribeOnce does not get called more than one publish`, () => {
	const eventAggregator = EventAggregator.getInstance();
	let called = 0;
	const sub = eventAggregator.subscribeOnce(`subbed-once`, () => {
		called++;
	});

	eventAggregator.publish(`subbed-once`, {});
	eventAggregator.publish(`subbed-once`, {});

	expect(called).toEqual(1);

	sub.dispose();
});

test(`subscribe throws exception when event is not a string`, () => {
	const eventAggregator = EventAggregator.getInstance();

	let ex;
	try {
		eventAggregator.subscribe({}, {});
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`subscribe throws exception when callback is not a function`, () => {
	const eventAggregator = EventAggregator.getInstance();

	let ex;
	try {
		eventAggregator.subscribe(`boom`, {});
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});