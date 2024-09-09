/**
 * @jest-environment jsdom
 */
import { Constants } from '../src/internals/Constants';
import FormData from 'form-data';
import LogStore from '../src/stores/LogStore';
import { Logger } from '../src/Logger';
import fetchMock from 'fetch-mock';

test(`getInstance() must return instance of Logger class`, () => {
	const logger = Logger.getInstance();

	expect(logger).toBeInstanceOf(Logger);
});

describe(`Mock tests`, () => {
	beforeAll(() => {
		fetchMock.mock(`/platform/logger/v1/log`, {
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

	test(`Log_Debug_Successful`, async () => {
		const logger = Logger.getInstance();
		await logger.debug(`testlog`, `testmethod`, `corId`);
	});

	test(`Log_Debug_Successful with object provided as message`, async () => {
		const logger = Logger.getInstance();
		await logger.debug({ message: `message` }, `testmethod`, `corId`);
	});

	test(`Log_Debug_Successful does not log because the message parameter provided is not of type string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(5, `testmethod`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log Debug logs because the optional message parameter provided is empty string optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(``, ``);
		} catch (error) {
			error1 = error;
		}

	});

	test(`Log Debug does log because the optional method parameter provided is empty string optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(`message`, ``);
		} catch (error) {
			error1 = error;
		}

	});

	test(`Log Debug does not log because the optional method parameter provided is of type object optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(`message`, { value: `method` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log Debug does not log because the message parameter provided is empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log Debug does not log because the message parameter provided is a number`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(5, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log Debug does log because the optional method parameter provided is a empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(`message`, ``, `corId`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Log Debug does not log because the method parameter provided is not of type string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(`message`, { value: `method` }, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log Debug does not log because the correlation id value provided is of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.debug(`message`, `method`, { value: `corId` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log_Info_Successful`, async () => {
		const logger = Logger.getInstance();

		await logger.info(`testlog`, `testmethod`);
	});

	test(`Log_Info_Successful with message provided being of type object`, async () => {
		const logger = Logger.getInstance();

		await logger.info({ message: `testlog` }, `testmethod`);
	});

	test(`Logger does not create a info log because the message value provided is an empty string optional correlationId not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(``, `method`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create a info log the method value provided is an empty string optional correlationId not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(`message`, ``);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create a info log because the method value provided is of type object optional correlationId not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(`message`, { value: `method` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create a info log because the message value provided is an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create a info log due to the method value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(`message`, ``, `corId`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create a info log due to the correlation id not of type string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.info(`message`, `method`, { value: `corId` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log_Fatal_Successful`, async () => {
		const logger = Logger.getInstance();

		await logger.fatal(`testlog`, `testmethod`);
	});

	test(`Log_Fatal_Successful with message provided being of type object`, async () => {
		const logger = Logger.getInstance();

		await logger.fatal({ message: `testlog` }, `testmethod`);
	});

	test(`Logger does not create fatal log due to the message value provided being an empty string optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(``, `method`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create fatal log method value provided being an empty string optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(`message`, ``);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create fatal log due to the method provided being of type object optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(`message`, { value: `method` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create fatal log due to the message value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create fatal log the method value being provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(`message`, ``, `corId`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create fatal log due to the method value being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(`message`, { value: `method` }, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create fatal log due to correlation id being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.fatal(`message`, `method`, { value: `corId` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log_Error_Successful`, async () => {
		const logger = Logger.getInstance();

		await logger.error(`testlog`, `testmethod`);
	});

	test(`Log_Error_Successful with message provided being of type object`, async () => {
		const logger = Logger.getInstance();

		await logger.error({ message: `testlog` }, `testmethod`);
	});

	test(`Logger does not create error log due to message value provided being an empty string optional correlation Id value not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(``, `method`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create error log method value provided being an empty string optional correlation Id value not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(`message`, ``);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create error log due to message value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create a error log method value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(`message`, ``, `corId`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create a error log due to the method value being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(`message`, { value: `method` }, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create a error log due to the correlation id being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.error(`message`, `method`, { value: `corId` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Log_Warn_Successful`, async () => {
		const logger = Logger.getInstance();
		await logger.warn(`testlog`, `testmethod`);
	});

	test(`Log_Warn_Successful with message provided being type object`, async () => {
		const logger = Logger.getInstance();
		await logger.warn({ message: `testlog` }, `testmethod`);
	});

	test(`Logger does not create a warn log due to the message value provided being an empty string optional correlation Id not provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create a warn log the method value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(`message`, ``);
		} catch (error) {
			error1 = error;
		}

	});

	test(`Logger does not create a warn log due to the method being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(`message`, { value: `method` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create a warn log due to the message value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(``, `method`, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does create a warn log the method value provided being an empty string`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(`message`, ``, `corId`);
		} catch (error) {
			error1 = error;
		}
	});

	test(`Logger does not create a warn log due to the method being of type object optional correlation Id also provided`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(`message`, { value: `method` }, `corId`);
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`Logger does not create a warn log due to the correlation id being of type object`, async () => {
		const logger = Logger.getInstance();

		let error1;

		try {
			await logger.warn(`message`, `method`, { value: `corId` });
		} catch (error) {
			error1 = error;
		}

		expect(error1).toBeDefined();
	});

	test(`failed logs to be stored in queue`, async () => {
		const logger = Logger.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/logger/v1/log`, { status: 403 }, { overwriteRoutes: true });

		await logger.fatal(`testlog`, `testmethod`);
		await logger.info(`testlog`, `testmethod`);

		await new Promise(resolve => setTimeout(resolve, 2000));
		const logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(2);

		LogStore.clearState();
	});

	test(`failed logs to succeed after retry`, async () => {
		const logger = Logger.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/logger/v1/log`, { status: 403 }, { overwriteRoutes: true });

		await logger.fatal(`testlogFatal`, `testmethod`);
		await logger.info(`testlogInfo`, `testmethod`);

		await new Promise(resolve => setTimeout(resolve, 2000));
		let logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(2);

		fetchMock.mock(`/platform/logger/v1/log`, { status: 200 }, { overwriteRoutes: true });

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(0);

		LogStore.clearState();
	});

	test(`failed logs to fail again after retry`, async () => {
		const logger = Logger.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/logger/v1/log`, { status: 403 }, { overwriteRoutes: true });

		await logger.fatal(`testlogFatal`, `testmethod`);
		await logger.info(`testlogInfo`, `testmethod`);

		await new Promise(resolve => setTimeout(resolve, 2000));
		let logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(2);

		// sleep to allow for scheduled task to run
		await new Promise(resolve => setTimeout(resolve, 2000));
		logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(2);

		LogStore.clearState();
	});

	test(`Retry queue size limit test`, async () => {
		const logger = Logger.getInstance();

		// fail log so log is stored in retry queue
		fetchMock.mock(`/platform/logger/v1/log`, { status: 403 }, { overwriteRoutes: true });
		// change queue size to speed up tests
		Constants.logStore.QUEUE_MAX_SIZE = 50;

		// test on the boundary
		for (let i = 0; i < 50; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await logger.fatal(`testlog`, `testmethod`);
		}

		let logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(50);
		LogStore.clearState();

		// test beyond the boundary
		for (let i = 0; i < 55; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await logger.fatal(`testlog`, `testmethod`);
		}

		logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(50);
		LogStore.clearState();

		// test just below the boundary
		for (let i = 0; i < 49; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await logger.fatal(`testlog`, `testmethod`);
		}

		logs = LogStore.getRetryQueue(`logger`);
		expect(logs.length).toEqual(49);
		LogStore.clearState();
	});
});