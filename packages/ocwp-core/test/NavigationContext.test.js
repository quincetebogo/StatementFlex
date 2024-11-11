import { NavigationContext } from '../src/NavigationContext.js';
import fetchMock from 'fetch-mock';

test(`getInstance() must return instance of NavigationContext class`, () => {
	const inst = NavigationContext.getInstance();

	expect(inst).toBeInstanceOf(NavigationContext);
});

test(`update() navigation context`, () => {
	const inst = NavigationContext.getInstance();

	let err;
	try {
		inst.update({ first: 1 });
		inst.update({ second: 2 });
	} catch (error) {
		err = error;
	}
	expect(err).toBeUndefined();

});