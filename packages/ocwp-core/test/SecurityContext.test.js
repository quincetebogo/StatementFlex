/**
 * @jest-environment jsdom
 */

import { Security } from '../src/Security.js';
import { SecurityContext } from '../src/SecurityContext.js';
import fail from 'assert';
import fetchMock from 'fetch-mock';
import util from 'util';

const CHANNEL_SERVICE_URL = `http://channel.service`;

beforeAll(() => {

	fetchMock.mock(`/config.json`, JSON.stringify({
		channelServiceUrl: CHANNEL_SERVICE_URL
	}));
	fetchMock.mock(`/platform.json`, JSON.stringify({
		application: {
			idp: {
				provider: `keycloak`
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
	fetchMock.mock(`/platform/config/v1/config/platform:application.idp.client`, `test-client`);
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.authenticated = true;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = () => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	let authed = false;
	security.onAuthError(() => {
		fail(`Expected success auth`);
	});

	security.onAuthLogout(() => {
		fail(`Expected success auth`);
	});

	security.onAuthSuccess(() => {
		authed = true;
	});

	window.keycloak.onAuthSuccess();
});


afterEach(() => {
	const security = Security.getInstance();
	security._idp = `keycloak`;
});

test(`getInstance() must return instance of SecurityContext class`, () => {
	const inst = SecurityContext.getInstance();

	expect(util.types.isProxy(inst)).toEqual(true);
});


test(`get fullName must return 'name' token value`, () => {
	const inst = SecurityContext.getInstance();

	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		name: `test-name`
	};

	expect(inst.fullName).toEqual(`test-name`);
});


test(`get firstName must return 'given_name' token value`, () => {
	const inst = SecurityContext.getInstance();

	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		'given_name': `test-fam-name`
	};

	expect(inst.firstName).toEqual(`test-fam-name`);
});


test(`get lastName must return 'family_name' token value`, () => {
	const inst = SecurityContext.getInstance();

	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		'family_name': `test-l-name`
	};

	expect(inst.lastName).toEqual(`test-l-name`);
});


test(`get email must return 'email' keycloak token value`, () => {
	const inst = SecurityContext.getInstance();

	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		'email': `x@t.v`
	};

	expect(inst.email).toEqual(`x@t.v`);
});


test(`get email must return 'unique_name' azure token value`, () => {
	const inst = SecurityContext.getInstance();
	const security = Security.getInstance();
	security._idp = `azure`;
	const accessToken = {
		// eslint-disable-next-line camelcase
		unique_name: `x@t.v`
	};
	security._azureAuthInfo = {
		accessToken: `eydfgdf.${btoa(JSON.stringify(accessToken))}`
	};

	expect(inst.email).toEqual(`x@t.v`);
});


test(`get username must return 'preferred_username' keycloak token value`, () => {
	const inst = SecurityContext.getInstance();

	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		'preferred_username': `user-name`
	};

	expect(inst.username).toEqual(`user-name`);
});


test(`get username must return 'upn' azure token value`, () => {
	const inst = SecurityContext.getInstance();
	const security = Security.getInstance();
	security._idp = `azure`;
	const accessToken = {
		upn: `user-name`
	};
	security._azureAuthInfo = {
		accessToken: `eydfgdf.${btoa(JSON.stringify(accessToken))}`
	};

	expect(inst.username).toEqual(`user-name`);
});


test(`get roles must return 'roles' token value`, () => {
	const inst = SecurityContext.getInstance();

	const r = [`x`, `y`];
	window.keycloak.idTokenParsed = {
		aud: `test-client`,
		'roles': r
	};

	expect(inst.roles).toEqual(r);
});


test(`get idp must return Security idp value`, () => {
	const inst = SecurityContext.getInstance();
	const sec = Security.getInstance();

	sec._idp = `keycloak`;

	expect(inst.idp).toEqual(sec.idp);
});