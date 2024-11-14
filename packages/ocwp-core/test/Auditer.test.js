/**
 * @jest-environment jsdom
 */

import { AuditModel } from '../src/models/AuditModel.js';
import { Auditer } from '../src/Auditer.js';
import { Constants } from '../src/internals/Constants.js';
import FormData from 'form-data';
import LogStore from '../src/stores/LogStore.js';
import { Security } from '../src/Security.js';
import fetchMock from 'fetch-mock';

// eslint-disable-next-line require-jsdoc
function _sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

describe(`Mock tests`, () => {
	beforeAll(() => {

		fetchMock.mock(`/config.json`, JSON.stringify({}));
		fetchMock.mock(`/platform.json`, JSON.stringify({
			version: `0.0.1`,
			application: {
				idp: {
					provider: `test`
				},
				name: `test`,
				version: `0.0.1`
			}
		}));
		fetchMock.mock(`/runtime.json`, JSON.stringify({
			idp: {
				keycloak: {
					'auth-server-url': `test-IDP`
				}
			}
		}));

		fetchMock.mock(`/platform/config/v1/config/platform:application.name`, `test-app`);

		fetchMock.mock(`/platform/config/v1/config/platform.version`, `test-app`);

		fetchMock.mock(`/platform/config/v1/config/platform.application.version`, `test-app`);

		const security = Security.getInstance();

		security.init(`keycloak`, `LOCAL`, {
			keycloak: {
				'auth-server-url': ``,
				realm: `test`
			}
		}, `test-client`);

		fetchMock.mock(`/platform/config/v1/config/runtime.idp.${security.idp}.auth-server-url`, `test-app`);

		fetchMock.mock(`/platform/auditer/v1/audit`, {
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

	test(`getInstance() must return instance of Auditer class`, () => {
		const auditer = Auditer.getInstance();

		expect(auditer).toBeInstanceOf(Auditer);
	});

	test(`audit() must send log to channel service`, async () => {
		const auditor = Auditer.getInstance();

		try {
			await auditor.audit(new AuditModel(`status`, `method`, `error, data`));
		} catch (error) {
			console.warn(error);
			throw error;
		}
	});

	test(`failed() must send log to channel service`, async () => {
		const auditor = Auditer.getInstance();

		try {
			await auditor.failed(`method`, `error`, `data`, `activity`);
		} catch (error) {
			console.warn(error);
			throw error;
		}
	});

	test(`audit() must throw an exception if AuditModel is not valid`, async () => {
		const auditor = Auditer.getInstance();

		let error1;
		try {
			await auditor.audit(new AuditModel());
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`success() must not be log an audit because method parameter provided is empty`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success(``, `testmethod`, `test`);
		} catch (error) {
			error1 = error;
		}
		expect(error1).toBeDefined();
	});

	test(`success() must not be log an audit because method parameter provided is not of type string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success({ value: `method` }, `testmethod`, `test`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();

	});

	test(`success() must log an audit with the optional data parameter as an empty string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success(`method`, ``, `activity`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`success() must not log an audit because the data parameter is not of type string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success(`method`, { value: `data` }, `activity`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`success() must not log an audit because the activity parameter provided is an empty string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success(`testMethod`, `testData`, ``);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`success() must not log an audit because the activity parameter provided is not of type string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.success(`testMethod`, `testData`, { value: `activity` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed() must not log an audit because the method parameter provided is a empty string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed(``, `error message`, `data`, `activity`);

		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed() must not log an audit because the method parameter provided is not of type string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed({ value: `method` }, `error message`, `data`, `activity`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed() must log an audit with the optional data parameter as a empty string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed(`method`, `error message`, ``, `activity`);
		} catch (error) {
			error1 = error;
		}

	});

	test(`failed() must not log an audit because the data parameter is not of type string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed(`method`, `error message`, { value: `data` }, `activity`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed() must not log an audit because the activity parameter is a empty string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed(`method`, `error message`, `data`, ``);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed() must not log an audit because the activity parameter is not of type  string`, async () => {
		const auditer = Auditer.getInstance();

		let error1;

		try {
			await auditer.failed(`method`, `error message`, `data`, { value: `activity` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed audits to be stored in queue`, async () => {
		const auditer = Auditer.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/auditer/v1/audit`, { status: 403 }, { overwriteRoutes: true });

		await auditer.success(`testlog`, `testmethod`, `test`);
		await auditer.success(`testlog2`, `testmethod`, `test2`);

		const audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(2);
		LogStore.clearState();
	});

	test(`failed audits to succeed after retry`, async () => {
		const auditer = Auditer.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/auditer/v1/audit`, { status: 403 }, { overwriteRoutes: true });

		await auditer.success(`testlog`, `testmethod`, `test`);
		await auditer.success(`testlog2`, `testmethod`, `test2`);

		let audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(2);

		fetchMock.mock(`/platform/auditer/v1/audit`, { status: 200 }, { overwriteRoutes: true });

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(0);

		LogStore.clearState();
	});

	test(`failed audits to fail again after retry`, async () => {
		const auditer = Auditer.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/auditer/v1/audit`, { status: 403 }, { overwriteRoutes: true });

		await auditer.success(`testlog`, `testmethod`, `test`);
		await auditer.success(`testlog2`, `testmethod`, `test2`);

		let audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(2);

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(2);

		LogStore.clearState();
	});

	test(`Retry queue size limit test`, async () => {
		const auditer = Auditer.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/auditer/v1/audit`, { status: 403 }, { overwriteRoutes: true });
		// change queue size to speed up tests
		Constants.logStore.QUEUE_MAX_SIZE = 50;

		// test on the boundary
		for (let i = 0; i < 50; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await auditer.success(`testlog`, `testmethod`, `test`);
		}

		let audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(50);
		LogStore.clearState();

		// test beyond the boundary
		for (let i = 0; i < 55; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await auditer.success(`testlog`, `testmethod`, `test`);
		}

		audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(50);
		LogStore.clearState();

		// test just below the boundary
		for (let i = 0; i < 49; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await auditer.success(`testlog`, `testmethod`, `test`);
		}

		audits = LogStore.getRetryQueue(`audit`);
		expect(audits.length).toEqual(49);
		LogStore.clearState();
	});
});