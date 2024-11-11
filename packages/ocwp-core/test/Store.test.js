import { Store } from '../src/Store.js';
import TodoMemoryStore from './store/TodoMemoryStore.js';

beforeEach(() => {
	TodoMemoryStore.clearState();
});

test(`TodoMemoryStore must be an singleton.`, () => {
	expect(TodoMemoryStore).toBeDefined();
});

test(`TodoMemoryStore.getState() to be null.`, () => {
	const state = TodoMemoryStore.getState();
	expect(state).toBeNull();
});

test(`TodoMemoryStore.setState() with object must return an object.`, () => {
	const state = TodoMemoryStore.setState({ todos: [] });
	expect(state).toBeInstanceOf(Object);
});

test(`TodoMemoryStore.clearState() to be null.`, () => {
	let state = TodoMemoryStore.setState({ todos: [] });
	TodoMemoryStore.clearState();
	state = TodoMemoryStore.getState();
	expect(state).toBeNull();
});

test(`TodoMemoryStore.clearState() to be null without dispatching state.`, () => {
	let state = TodoMemoryStore.setState({ todos: [] });
	TodoMemoryStore.clearState(false);
	state = TodoMemoryStore.getState();
	expect(state).toBeNull();
});

test(`TodoMemoryStore.stateHistory to be instance of Array with length of three.`, () => {

	TodoMemoryStore.add({ text: `Todo at ${Date.now()}` });
	TodoMemoryStore.add({ text: `Todo at ${Date.now()}` });
	TodoMemoryStore.add({ text: `Todo at ${Date.now()}` });

	const history = TodoMemoryStore.stateHistory;

	expect(history).toBeInstanceOf(Array);
	expect(history.length).toBe(3);
});

test(`TodoMemoryStore.getStateProperty() to return correct state for property found.`, () => {

	TodoMemoryStore.add({ text: `Todo at ${Date.now()}` });

	const state = TodoMemoryStore.getStateProperty(`todos`);

	expect(state).toBeInstanceOf(Object);
});

test(`TodoMemoryStore.getStateProperty() to return null for property not found.`, () => {

	TodoMemoryStore.add({ text: `Todo at ${Date.now()}` });

	const state = TodoMemoryStore.getStateProperty(`abc`);

	expect(state).toBeNull();
});

test(`TodoMemoryStore.setState() with function to work correctly.`, () => {

	TodoMemoryStore.add({ text: `ABC` });
	TodoMemoryStore.add({ text: `XYZ` });
	TodoMemoryStore.add({ text: `123` });

	const updatedState = TodoMemoryStore.setState(previousState => {
		previousState.todos[1].text = `FFF`;
		return previousState;
	}, `TODO_ADD_FUNC`);


	expect(updatedState.todos[1].text).toBe(`FFF`);
});

test(`TodoMemoryStore.setState() with non-object to throw an error.`, () => {

	let ex;

	try {
		TodoMemoryStore.setState(123);
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`TodoMemoryStore.resetState() to work correctly.`, () => {

	TodoMemoryStore.add({ text: `ABC` });
	TodoMemoryStore.add({ text: `XYZ` });
	TodoMemoryStore.add({ text: `123` });

	TodoMemoryStore.resetState({ todos: [{ text: `ABC` }] });

	const state = TodoMemoryStore.getState();

	expect(state.todos).toBeDefined();
	expect(state.todos.length).toBe(1);
	expect(state.todos[0].text).toBe(`ABC`);
});

test(`TodoMemoryStore.resetState() to work correctly with no dispatching.`, () => {

	TodoMemoryStore.add({ text: `ABC` });
	TodoMemoryStore.add({ text: `XYZ` });
	TodoMemoryStore.add({ text: `123` });

	TodoMemoryStore.resetState({ todos: [{ text: `ABC` }] }, false);

	const state = TodoMemoryStore.getState();

	expect(state.todos).toBeDefined();
	expect(state.todos.length).toBe(1);
	expect(state.todos[0].text).toBe(`ABC`);
});

test(`TodoMemoryStore.setState() that performs no dispatching.`, () => {

	TodoMemoryStore.setState({ text: `ABC` }, `TODO_ADD`, false);

	const state = TodoMemoryStore.getState();
});

test(`BogusStore constructor to default "settings.persistence" to 'memory.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-store`
			});
		}
	}

	const bogusStore = new BogusStore();
	expect(bogusStore._settings.persistence).toBe(`memory`);
});

test(`BogusStore constructor to set "settings.trackStateHistory" to true and utilise it during setting state`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-store`,
				trackStateHistory: true
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({});
	expect(bogusStore.stateHistory.length).toBe(1);
});

test(`BogusStore constructor to set "settings.trackStateHistory" to false and utilise it during setting state`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus2-store`,
				trackStateHistory: false
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({});
	expect(bogusStore.stateHistory.length).toBe(0);
});

test(`BogusStore constructor to set "settings.logStateChanges" to true and utilise it during setting state with no constructor info.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus2-store`,
				logStateChanges: false
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.constructor = null;
	bogusStore.setState({});
});

test(`BogusStore constructor to set "settings.logStateChanges" to false and utilise it during setting state.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus2-store`,
				logStateChanges: false
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({});
});

test(`BogusStore constructor throws error when no "settings" are provided.`, () => {

	class BogusStore extends Store {
		constructor() {
			super();
		}
	}

	let ex;

	try {
		const bogusStore = new BogusStore();
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`BogusStore constructor throws error when no "settings.name" are provided.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({});
		}
	}

	let ex;

	try {
		const bogusStore = new BogusStore();
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`BogusStore constructor throws error when no "settings.persistence" is invalid.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-invalid`,
				persistence: `invalid`
			});
		}
	}

	let ex;

	try {
		const bogusStore = new BogusStore();
	} catch (error) {
		ex = error;
	}

	expect(ex).toBeDefined();
});

test(`BogusStore setState() for sessionStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-session`,
				persistence: `sessionStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true });

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore setState() for sessionStorage works correctly with no dispatching.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-session`,
				persistence: `sessionStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true }, null, false);

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore setState() for sessionStorage works correctly with no deep cloning.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-session`,
				persistence: `sessionStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true }, null, true, false);

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore clearState() for sessionStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-session`,
				persistence: `sessionStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({ bogus: true });
	bogusStore.clearState();
	const state = bogusStore.getState();

	expect(state).toBe(null);
});

test(`BogusStore clearState() for sessionStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-session`,
				persistence: `sessionStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({ bogus: true });
	bogusStore.clearState();
	const state = bogusStore.getState();

	expect(state).toBe(null);
});


test(`BogusStore setState() for localStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-local`,
				persistence: `localStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true });

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore setState() for localStorage works correctly with no dispatching.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-local`,
				persistence: `localStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true }, null, false);

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore setState() for localStorage works correctly with no deep cloning.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-local`,
				persistence: `localStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	const state = bogusStore.setState({ bogus: true }, null, true, false);

	expect(state).toBeInstanceOf(Object);
});

test(`BogusStore clearState() for localStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-local`,
				persistence: `localStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({ bogus: true });
	bogusStore.clearState();
	const state = bogusStore.getState();

	expect(state).toBe(null);
});

test(`BogusStore clearState() for localStorage works correctly.`, () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-local`,
				persistence: `localStorage`
			});
		}
	}

	const bogusStore = new BogusStore();
	bogusStore.setState({ bogus: true });
	bogusStore.clearState();
	const state = bogusStore.getState();

	expect(state).toBe(null);
});

test(`BogusStore multiple stateChanged.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.stateChanged.subscribe(state => {
			if (!state) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChanged.subscribe(state => {
			if (!state) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(2);
});

test(`BogusStore multiple getStateChangedProperties.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs-props`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.getStateChangedProperties.subscribe(props => {
			if (!props) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChangedProperties.subscribe(props => {
			if (!props) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(2);
});


test(`BogusStore multiple stateChangedWithName.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs-name`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.stateChangedWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChangedWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(2);
});

test(`BogusStore multiple stateChangedNoPayload.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs-nopay`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.stateChangedNoPayload.subscribe(() => {
			count++;
			if (count === 4) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChangedNoPayload.subscribe(() => {
			count++;
			if (count === 4) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(4);
});

test(`BogusStore multiple stateChangedNoPayloadWithName.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs-no-pay-name`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.stateChangedNoPayloadWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChangedNoPayloadWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(2);
});

test(`BogusStore multiple stateChangedPropertiesWithName.subscribe().`, async () => {

	class BogusStore extends Store {
		constructor() {
			super({
				name: `bogus-subs-prop-name`
			});
		}
	}

	let count = 0;

	const p = new Promise(resolve => {
		const bogusStore = new BogusStore();
		bogusStore.stateChangedPropertiesWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		const bogusStore2 = new BogusStore();
		bogusStore2.stateChangedPropertiesWithName.subscribe(s => {
			if (!s) {
				return;
			}
			count++;
			if (count === 2) {
				resolve();
			}
		});

		bogusStore.setState({ bogus: true });
	});

	await p;
	expect(count).toBe(2);
});