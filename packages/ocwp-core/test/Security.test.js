import { Security } from '../src/Security.js';
import fail from 'assert';
import fetchMock from 'fetch-mock';

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
});


afterEach(() => {
	const security = Security.getInstance();
	security._idp = `keycloak`;
});


test(`getInstance() must return instance of Security class`, () => {
	const security = Security.getInstance();
	expect(security).toBeInstanceOf(Security);
});

test(`isAuthenticated must return false`, () => {
	expect(Security.getInstance().isAuthenticated).toBeFalsy();
});

test(`init() not keycloak`, () => {
	const security = Security.getInstance();

	security.init(`not-keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);
});

test(`init() with no onAuthSuccess`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	security.onAuthError(() => {
		fail(`Expected success auth`);
	});

	security.onAuthLogout(() => {
		fail(`Expected success auth`);
	});

	// security.onAuthSuccess(() => {

	// });

	window.keycloak.onAuthSuccess();

	// window.keycloak.onAuthError

	// window.keycloak.onAuthLogout

	// window.keycloak.onTokenExpired
});

test(`init() with onAuthSuccess`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
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

	// window.keycloak.onAuthError

	// window.keycloak.onAuthLogout

	// window.keycloak.onTokenExpired

	expect(authed).toEqual(true);
});

test(`init() with no onAuthError`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	// security.onAuthError(() => {
	// 	fail(`Expected success auth`);
	// });

	security.onAuthLogout(() => {
		fail(`Expected error auth`);
	});

	security.onAuthSuccess(() => {
		fail(`Expected error auth`);
	});

	// window.keycloak.onAuthSuccess();

	window.keycloak.onAuthError();

	// window.keycloak.onAuthLogout

	// window.keycloak.onTokenExpired
});

test(`init() with onAuthError`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	let authed = true;
	security.onAuthError(() => {
		authed = false;
	});

	security.onAuthLogout(() => {
		fail(`Expected error auth`);
	});

	security.onAuthSuccess(() => {
		fail(`Expected error auth`);
	});

	// window.keycloak.onAuthSuccess();

	window.keycloak.onAuthError();

	// window.keycloak.onAuthLogout

	window.keycloak.onTokenExpired();

	expect(authed).toEqual(false);
});

test(`init() with no onAuthLogout`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	security.onAuthError(() => {
		fail(`Expected logout auth`);
	});

	// security.onAuthLogout(() => {
	// 	fail(`Expected logout auth`);
	// });

	security.onAuthSuccess(() => {
		fail(`Expected logout auth`);
	});

	// window.keycloak.onAuthSuccess();

	// window.keycloak.onAuthError();

	window.keycloak.onAuthLogout();

	// window.keycloak.onTokenExpired
});

test(`init() with onAuthLogout`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	delete security.onAuthErrorCallback;
	delete security.onAuthLogoutCallback;
	delete security.onAuthSuccessCallback;

	let authed = true;
	security.onAuthError(() => {
		fail(`Expected logout auth`);
	});

	security.onAuthLogout(() => {
		authed = false;
	});

	security.onAuthSuccess(() => {
		fail(`Expected logout auth`);
	});

	// window.keycloak.onAuthSuccess();

	// window.keycloak.onAuthError();

	window.keycloak.onAuthLogout();

	window.keycloak.onTokenExpired();

	expect(authed).toEqual(false);
});

test(`ensureValidToken() calls update token for keycloak`, (done) => {
	const security = Security.getInstance();
	window.keycloak.updateToken = (i) => {
		done();
	};

	security.ensureValidToken();
});

test(`ensureValidToken() calls acquireTokenSilent for azure`, async () => {
	const security = Security.getInstance();
	const authInfo = { accessToken: `eydsffsd` };

	security._idp = `azure`;
	window.azure = {
		getAllAccounts: () => [{}],
		acquireTokenSilent: () => new Promise((res, rej) => {
			res(authInfo);
		})
	};


	await security.ensureValidToken();

	expect(security._azureAuthInfo).toEqual(authInfo);
});

test(`get token returns keycloak token if authenticated with keycloak`, () => {
	const security = Security.getInstance();

	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = true;
	window.keycloak.token = `abcd`;

	expect(security.token).toEqual(`abcd`);
});

test(`get token returns azure token if authenticated with azure`, () => {
	const security = Security.getInstance();

	security._idp = `azure`;
	security._azureAuthInfo = { accessToken: `eydsffsd` };

	expect(security.token).toEqual(`eydsffsd`);
});

test(`get token returns null if not authenticated`, () => {
	const security = Security.getInstance();

	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = false;
	window.keycloak.token = `abcd`;

	expect(security.token).toBeNull();
});

test(`get idp returns idp if available`, () => {
	const security = Security.getInstance();

	security._idp = `keycloak`;

	expect(security.idp).toEqual(`keycloak`);
});

test(`get idp returns null if not available`, () => {
	const security = Security.getInstance();

	delete security._idp;

	expect(security.idp).toBeNull();
});

test(`getTokenValue() returns value if available`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);


	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = true;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	const val = security.getTokenValue(`aud`);

	expect(val).toEqual(`test-client`);
});

test(`getTokenValue() returns null if not available`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = true;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	const val = security.getTokenValue(`unavailable`);

	expect(val).toBeNull();
});

test(`getTokenValue() returns null if not authenticated`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = false;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	const val = security.getTokenValue(`unavailable`);

	expect(val).toBeNull();
});

test(`decodeToken() returns value if authenticated with keycloak`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);


	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = true;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	const val = security.decodeToken();

	expect(val.aud).toEqual(`test-client`);
});

test(`decodeToken() returns value if authenticated with azure`, () => {
	const security = Security.getInstance();

	security._idp = `azure`;
	const accessToken = {
		// eslint-disable-next-line camelcase
		unique_name: `x@t.v`
	};
	security._azureAuthInfo = {
		accessToken: `eydfgdf.${btoa(JSON.stringify(accessToken))}`
	};

	const val = security.decodeToken();

	expect(val.unique_name).toEqual(accessToken.unique_name);
});

test(`decodeToken() returns null if not authenticated`, () => {
	const security = Security.getInstance();

	security.init(`keycloak`, `LOCAL`, {
		keycloak: {
			'auth-server-url': ``,
			realm: `test`
		}
	}, `test-client`);

	if (!window.keycloak) {
		window.keycloak = {};
	}
	window.keycloak.authenticated = false;
	window.keycloak.token = `eyfjdlksjflsdf`;
	window.keycloak.updateToken = (i) => { };
	window.keycloak.idTokenParsed = {
		aud: `test-client`
	};

	const val = security.decodeToken();

	expect(val).toBeNull();
});

test(`init() with azure settings`, async () => {
	const security = Security.getInstance();
	const authInfo = { accessToken: `eydsffsd` };

	let callRedirect = true;
	let auth;

	let afterRedirect;
	const firstRedirect = new Promise((res) => {
		afterRedirect = res;
	});

	let afterInitAuth;
	const initAuth = new Promise((res) => {
		afterInitAuth = res;
	});

	window.azure = {
		getAllAccounts: () => [{}],
		acquireTokenSilent: () => new Promise((res, rej) => {
			res(authInfo);
		}),
		handleRedirectPromise: () => new Promise((res, rej) => {
			if (callRedirect) {
				res();
			} else {
				auth = () => {
					res(authInfo);
					afterInitAuth();
				};
			}
		}),
		loginRedirect: () => {
			callRedirect = false;
			afterRedirect();
		}
	};

	// Before redirect
	security.init(`azure`, `LOCAL`, {
		azure: {
			'auth-server-url': ``
		}
	}, `test-client`, `test-aud`);

	await firstRedirect;

	// After redirect
	security.init(`azure`, `LOCAL`, {
		azure: {
			'auth-server-url': ``
		}
	}, `test-client`, `test-aud`);

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

	auth();

	await initAuth;

	expect(authed).toEqual(true);
});