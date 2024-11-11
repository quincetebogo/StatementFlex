import { Router } from '../src/Router.js';

test(`getInstance() must return instance of Router class`, () => {
	const inst = Router.getInstance();
	const inst2 = Router.getInstance();

	expect(inst).toBeInstanceOf(Router);
	expect(inst2).toBeInstanceOf(Router);
	expect(inst).toEqual(inst2);
});

describe(`Negative Tests`, () => {

	test(`set routes must throw exception`, () => {
		const router = new Router();

		let err;
		try {
			router.routes = [];
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`set _routes must throw exception`, () => {
		const router = new Router();

		let err;
		try {
			router._routes = [];
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`push to routes must throw exception`, () => {
		const router = new Router();

		let err;
		try {
			router.routes.push({});
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`addRoute() with no path must throw exception`, async () => {
		const router = new Router();
		const toAdd = {
			name: `name`,
			load: () => { }
		};

		let err;
		try {
			await router.addRoute(toAdd);
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`addRoute() with no name must throw exception`, async () => {
		const router = new Router();
		const toAdd = {
			path: `path`,
			load: () => { }
		};

		let err;
		try {
			await router.addRoute(toAdd);
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`addRoute() with no load() must throw exception`, async () => {
		const router = new Router();
		const toAdd = {
			name: `name`,
			path: `path`
		};

		let err;
		try {
			await router.addRoute(toAdd);
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`addRoute() with undefined must throw exception`, async () => {
		const router = new Router();

		let err;
		try {
			await router.addRoute();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateByPath() with no path must throw exception`, async () => {
		const router = new Router();

		let err;
		try {
			await router.navigateByPath();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateByPath() with no routes must throw exception`, async () => {
		const router = new Router();

		let err;
		try {
			await router.navigateByPath(`path`);
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateByPath() with no onNavigate must throw exception`, async () => {
		const router = new Router();
		const r = router.addRoute({
			name: `name`,
			path: `path`,
			load: () => { }
		});

		let err;
		try {
			await router.navigateByPath(`path`);
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateToDefaultPath() with no routes must throw exception`, async () => {
		const router = new Router();

		let err;
		try {
			await router.navigateToDefaultPath();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateToDefaultPath() with no default route must throw exception`, async () => {
		const router = new Router();
		const r = router.addRoute({
			name: `name`,
			path: `path`,
			load: () => { }
		});

		let err;
		try {
			await router.navigateToDefaultPath();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateToDefaultPath() uses throws if no fallback route`, async () => {
		const router = new Router();
		const toAdd = {
			isDefault: true,
			path: `testPath`,
			name: `routeName`,
			load: () => { }
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		let err;
		try {
			const res = await router.navigateToDefaultPath();
		} catch (error) {
			err = error;
		}
		expect(err).toBeDefined();
	});

	test(`navigateToDefaultPath() false on guard prevent`, async () => {
		const router = new Router();

		const isDefault = {
			isDefault: true,
			path: `/default?test=test`,
			name: `routeName1`,
			load: () => { },
			guard: () => false
		};

		const isFallback = {
			name: `routeName2`,
			load: () => { },
			isFallback: true,
			path: `/fallback?test=test`
		};

		router.addRoute(isDefault);
		router.addRoute(isFallback);
		router.onNavigate = () => { };

		const res = await router.navigateToDefaultPath();

		expect(res).toEqual(false);
	});


	test(`navigateToFallbackPath() uses throws if no fallback route`, async () => {
		const router = new Router();

		const toAdd = {
			name: `routeName`,
			load: () => { },
			path: `/exists`
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		let err;
		try {
			const res = await router.navigateByPath(`/non-existent`);
		} catch (error) {
			err = error;
		}

		expect(err).toBeDefined();
	});
});

describe(`Mock Tests`, () => {

	test(`setDefault() updates default route`, () => {
		const router = new Router();
		const toAdd = {
			path: `testPath`,
			name: `routeName1`,
			load: () => { },
			isDefault: true
		};
		const toAdd2 = {
			path: `testPath2`,
			name: `routeName2`,
			load: () => { }
		};
		const returned = router.addRoute(toAdd);
		const returned2 = router.addRoute(toAdd2);

		const set = router.setDefault(toAdd2.name);

		expect(set).toBeTruthy();
		expect(returned2.isDefault).toBeTruthy();
		expect(returned.isDefault).toBeFalsy();
	});

	test(`setFallback() updates fallback route`, () => {
		const router = new Router();
		const toAdd = {
			path: `testPath`,
			name: `routeName1`,
			load: () => { },
			isFallback: true
		};
		const toAdd2 = {
			path: `testPath2`,
			name: `routeName2`,
			load: () => { }
		};
		const returned = router.addRoute(toAdd);
		const returned2 = router.addRoute(toAdd2);

		const set = router.setFallback(toAdd2.name);

		expect(set).toBeTruthy();
		expect(returned2.isFallback).toBeTruthy();
		expect(returned.isFallback).toBeFalsy();
	});

	test(`addRoute() adds and returns route`, () => {
		const router = new Router();
		const toAdd = {
			path: `testPath`,
			name: `routeName`,
			load: () => { },
			test: 1
		};
		const returned = router.addRoute(toAdd);

		expect(returned).toEqual(toAdd);
	});

	test(`get currentRoute returns current route`, () => {
		const router = new Router();
		const toAdd = {
			test: 1,
			path: `testPath`,
			name: `routeName`,
			load: () => { }
		};

		router._currentRoute = toAdd;

		expect(router.currentRoute).toEqual(toAdd);
	});

	test(`navigateToDefaultPath() uses default route`, async () => {
		const router = new Router();
		const toAdd = {
			name: `routeName`,
			load: () => { },
			isDefault: true,
			path: `/?platform-test=test`,
			guard: () => true,
			onPreNavigate: () => { },
			onPostNavigate: () => { }
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		const res = await router.navigateToDefaultPath();

		expect(res).toEqual(true);
	});

	test(`navigateToFallbackPath() uses fallback route`, async () => {
		const router = new Router();
		const toAdd = {
			name: `routeName`,
			load: () => { },
			isFallback: true,
			path: `/fallback?test=test`,
			guard: () => true,
			onPreNavigate: () => { },
			onPostNavigate: () => { }
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		const res = await router.navigateByPath(`/non-existent`);

		expect(res).toEqual(true);
	});

	test(`navigateByPath() uses route`, async () => {
		const router = new Router();
		const toAdd = {
			name: `routeName`,
			load: () => { },
			isDefault: true,
			path: `/books/:genre/:title?`,
			guard: () => true,
			onPreNavigate: () => { },
			onPostNavigate: () => { }
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		const res = await router.navigateByPath(`/books/horror?test=test`);

		expect(res).toEqual(true);
	});

	test(`navigateByPath() uses fallback route`, async () => {

		const router = new Router();
		const toAdd = {
			name: `routeName`,
			load: () => { },
			isFallback: true,
			path: `/books`,
			guard: () => true,
			onPreNavigate: () => { },
			onPostNavigate: () => { }
		};

		router.addRoute(toAdd);
		router.onNavigate = () => {

		};

		const res = await router.navigateByPath(`/test?test=test`);

		expect(res).toEqual(true);
	});

});