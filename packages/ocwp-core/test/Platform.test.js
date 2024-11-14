import { EventAggregator } from '../src/EventAggregator.js';
import { Platform } from '../src/Platform.js';
import fail from 'assert';
import fetchMock from 'fetch-mock';
import { jest } from '@jest/globals';

const CHANNEL_SERVICE_URL = `http://channel.service`;

beforeAll(() => {

	fetchMock.mock(`/config.json`, JSON.stringify({
		channelServiceUrl: CHANNEL_SERVICE_URL
	}));

	fetchMock.mock(`/platform.json`, JSON.stringify({
		application: {
			name: `app`,
			idp: {
				provider: `keycloak`,
				client: `test-client`
			}
		}
	}));

	fetchMock.mock(`/runtime.json`, JSON.stringify({}));

	fetchMock.mock(`/platform/config/v1/config/idp`, `keycloak`);

	fetchMock.mock(`/platform/config/v1/config/runtime:idp`, JSON.stringify({
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}));

	fetchMock.mock(`/platform/config/v1/config/runtime:environment`, `LOCAL`);

	delete window.location;

	window.location = {
		replace: jest.fn(),
		href: `/`,
		origin: jest.fn(),
		protocol: jest.fn(),
		hostname: jest.fn()
	};
});

test(`init() with Auth Success`, done => {

	const eventAggregator = EventAggregator.getInstance();
	eventAggregator.subscribe(`platform-security-context-updated`, () => { });
	eventAggregator.subscribe(`platform-security-user-logged-out`, () => { });
	eventAggregator.subscribe(`platform-security-user-login-error`, () => { });

	delete Platform.userLoggedOutCallback;
	delete Platform.userLoginErrorCallback;
	delete Platform.userLoginSuccessCallback;

	Platform.init();

	setTimeout(() => {

		window.keycloak.updateToken = (i) => { };
		window.keycloak.authenticated = true;

		window.keycloak.onAuthSuccess();

		Platform.onUserLoggedOut(() => {
			fail(`User was not logged in`);
			done();
		});
		Platform.onUserLoginSuccess(() => {
			done();
		});
		Platform.onUserLoginError(() => {
			fail(`User was not logged in`);
			done();
		});

		window.keycloak.onAuthSuccess();

		// window.keycloak.onAuthError

		// window.keycloak.onAuthLogout

		// window.keycloak.onTokenExpired
	}, 1000);

});

test(`init() with Auth Logout`, done => {
	const eventAggregator = EventAggregator.getInstance();
	eventAggregator.subscribe(`platform-security-context-updated`, () => { });
	eventAggregator.subscribe(`platform-security-user-logged-out`, () => { });
	eventAggregator.subscribe(`platform-security-user-login-error`, () => { });

	delete Platform.userLoggedOutCallback;
	delete Platform.userLoginErrorCallback;
	delete Platform.userLoginSuccessCallback;

	Platform.init();

	setTimeout(() => {

		window.keycloak.updateToken = (i) => { };
		window.keycloak.authenticated = true;
		// window.keycloak.onAuthSuccess();

		// window.keycloak.onAuthError

		window.keycloak.onAuthLogout();

		Platform.onUserLoggedOut(() => {
			done();
		});
		Platform.onUserLoginSuccess(() => {
			fail(`User was not logged out`);
			done();
		});
		Platform.onUserLoginError(() => {
			fail(`User was not logged out`);
			done();
		});

		window.keycloak.onAuthLogout();

		// window.keycloak.onTokenExpired
	}, 1000);

});

test(`init() with Auth Error`, done => {
	const eventAggregator = EventAggregator.getInstance();
	eventAggregator.subscribe(`platform-security-context-updated`, () => { });
	eventAggregator.subscribe(`platform-security-user-logged-out`, () => { });
	eventAggregator.subscribe(`platform-security-user-login-error`, () => { });

	delete Platform.userLoggedOutCallback;
	delete Platform.userLoginErrorCallback;
	delete Platform.userLoginSuccessCallback;

	Platform.init();

	setTimeout(() => {

		window.keycloak.updateToken = (i) => { };
		window.keycloak.authenticated = true;
		// window.keycloak.onAuthSuccess();

		window.keycloak.onAuthError();

		Platform.onUserLoggedOut(() => {
			fail(`User auth did not error`);
			done();
		});
		Platform.onUserLoginSuccess(() => {
			fail(`User auth did not error`);
			done();
		});
		Platform.onUserLoginError(() => {
			done();
		});

		window.keycloak.onAuthError();

		// window.keycloak.onAuthLogout();

		// window.keycloak.onTokenExpired
	}, 1000);

});