/* eslint-disable camelcase */
import * as Security from '../src/Security.js';
import { ExecutionContext } from '../src/ExecutionContext.js';
import fetchMock from 'fetch-mock';
import { jest } from '@jest/globals';
import util from 'util';

let navigatorSpy = null;
let windowSpy = null;
let securityIdpSpy = null;
let securityTokenSpy = null;
let securityDecodeTokenSpy = null;

const CHANNEL_SERVICE_URL = `http://channel.service`;

beforeAll(() => {
	fetchMock.mock(`/config.json`, JSON.stringify({
		channelServiceUrl: CHANNEL_SERVICE_URL
	}));
	fetchMock.mock(`/platform.json`, JSON.stringify({
		application: {
			idp: {
				provider: `test`
			}
		}
	}));
	fetchMock.mock(`/runtime.json`, JSON.stringify({}));

	window.platform = {
		security: true
	};
});

beforeEach(() => {
	navigatorSpy = jest.spyOn(global, `navigator`, `get`);
	windowSpy = jest.spyOn(global, `window`, `get`);
	securityIdpSpy = jest.spyOn(Security.default, `idp`, `get`);
	securityTokenSpy = jest.spyOn(Security.default, `token`, `get`);
	securityDecodeTokenSpy = jest.spyOn(Security.default, `decodeToken`);
});

afterEach(() => {
	jest.restoreAllMocks();
});

test(`getInstance() must return instance of ExecutionContext Proxy`, () => {
	const inst = ExecutionContext.getInstance();

	expect(util.types.isProxy(inst)).toEqual(true);
});

test(`get clientIp must return null if not authenticated`, () => {
	const inst = ExecutionContext.getInstance();
	const clientIp = inst.clientIp;

	expect(clientIp).toBeNull();
});

test(`get clientIp must return value if authenticated with keycloak`, () => {
	const inst = ExecutionContext.getInstance();
	const original = { ...window };

	windowSpy.mockImplementation(() => ({
		...original,
		keycloak: {
			authenticated: true,
			idTokenParsed: {
				client_ip: `value`
			},
			token: `eyazfgiuhfsdiguhsidufhgui`
		}
	}));

	const clientIp = inst.clientIp;
	expect(clientIp).toEqual(`value`);
});

test(`get clientIp must return value if authenticated with azure AD`, () => {

	securityIdpSpy.mockImplementation(() => `azure`);
	securityTokenSpy.mockImplementation(() => `eyazfgiuhfsdiguhsidufhgui`);
	securityDecodeTokenSpy.mockImplementation(() => ({ ipaddr: `value` }));

	const inst = ExecutionContext.getInstance();

	const clientIp = inst.clientIp;
	expect(clientIp).toEqual(`value`);
});

test(`browser is Chrome 78`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 version/78 version Safari/537.36`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.browser;

	// Assert
	expect(b).toEqual(`Chrome 78.0.3904.87`);
});

test(`browser is Edge 16`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.browser;

	// Assert
	expect(b).toEqual(`Edge 16.16299`);
});

test(`browser is IE`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.browser;

	// Assert
	expect(b).toEqual(`IE 11.0`);
});

test(`browser is Android Browser`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.browser;

	// Assert
	expect(b).toEqual(`Android Browser 4.0`);
});

test(`engine is Blink 78`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 version/78 version Safari/537.36`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.engine;

	// Assert
	expect(b).toEqual(`Blink 78.0.3904.87`);
});

test(`engine is EdgeHTML 16`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.engine;

	// Assert
	expect(b).toEqual(`EdgeHTML 16.16299`);
});

test(`engine is Tident`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.engine;

	// Assert
	expect(b).toEqual(`Trident 7.0`);
});

test(`engine is WebKit`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.engine;

	// Assert
	expect(b).toEqual(`WebKit 533.1`);
});

test(`osPlatform is Windows 10`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 version/78 version Safari/537.36`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.osPlatform;

	// Assert
	expect(b).toEqual(`Windows 10`);
});

test(`osPlatform is Android`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.osPlatform;

	// Assert
	expect(b).toEqual(`Android 2.3.5`);
});

test(`device vendor is HTC`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.deviceVendor;

	// Assert
	expect(b).toEqual(`HTC`);
});

test(`device model is Desire HD`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.deviceModel;

	// Assert
	expect(b).toEqual(`Desire HD A9191`);
});

test(`device type is mobile`, () => {

	// Arrange
	const original = { ...navigator };

	navigatorSpy.mockImplementation(() => ({
		...original,
		userAgent: `Mozilla/5.0 (Linux; U; Android 2.3.5; en-gb; HTC Desire HD A9191 Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
	}));

	const inst = new ExecutionContext();

	// Act
	const b = inst.deviceType;

	// Assert
	expect(b).toEqual(`mobile`);
});

test(`get applicationName returns configured application name`, async () => {
	fetchMock.mock(`/platform/config/v1/config/platform:application.name`, `theName`);
	const inst = ExecutionContext.getInstance();

	const appName = await inst.applicationName;
	expect(appName).toEqual(`theName`);
});

test(`get applicationVersion returns configured application version`, async () => {
	fetchMock.mock(`/platform/config/v1/config/platform:application.version`, `theVer`);
	const inst = ExecutionContext.getInstance();

	const ver = await inst.applicationVersion;
	expect(ver).toEqual(`theVer`);
});

test(`get platformVersion returns configured platform version`, async () => {
	fetchMock.mock(`/platform/config/v1/config/platform:version`, `platVer`);
	const inst = ExecutionContext.getInstance();

	const ver = await inst.platformVersion;
	expect(ver).toEqual(`platVer`);
});