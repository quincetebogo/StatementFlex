import { HttpClient } from '../src/HttpClient.js';
import fetchMock from 'fetch-mock';

const MOCK_URL = `http://mock.url`;
const httpClient = HttpClient.getInstance();

test(`getInstance() must return instance of HttpClient class`, () => {
	const httpClient1 = HttpClient.getInstance();

	expect(httpClient1).toBeInstanceOf(HttpClient);
});

describe(`Mocked tests`, () => {
	beforeAll(() => {

		fetchMock.mock(MOCK_URL, {
			status: 200,
			body: JSON.stringify({ data: `Sent payload` }),
			headers: {
				'Accept': `application/json`,
				'Content-Type': `application/json`
			}
		});

		fetchMock.mock(`${MOCK_URL}/404`, {
			status: 404,
			body: JSON.stringify({ data: `Sent payload` })
		});

		fetchMock.mock(`${MOCK_URL}/doodles`, {
			status: 200,
			body: JSON.stringify({ data: `Sent payload` }),
			headers: {
				'Accept': `application/json`,
				'Content-Type': `application/json`
			}
		});

		fetchMock.mock(`${MOCK_URL}/doodles/timeout`, () => new Promise(() => {
			setTimeout(() => ({
				status: 200,
				body: JSON.stringify({ data: `Sent payload` }),
				headers: {
					'Accept': `application/json`,
					'Content-Type': `application/json`
				}
			}), 200);
		}));

		fetchMock.mock(`${MOCK_URL}/doodles/blob`, {
			status: 200,
			body: new Blob()
		});

		window.platform = {
			security: true
		};
	});

	test(`request() must return expected mock data`, async () => {
		const httpClient1 = HttpClient.getInstance(MOCK_URL);

		window.keycloak = {
			authenticated: true,
			updateToken: (i) => { },
			token: `eyfdgskfhgkds`
		};

		const result = await httpClient1.request({
			url: ``,
			customHeaders: { 'custom': `custom` },
			correlationId: `corid`
		});
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`get() must return expected mock data`, async () => {
		const httpClient1 = HttpClient.getInstance(MOCK_URL);

		window.keycloak = {
			authenticated: true,
			updateToken: (i) => { },
			token: `eyfdgskfhgkds`
		};

		const result = await httpClient1.get(``, { 'custom': `custom` }, `corid`);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`post() must return expected mock data`, async () => {
		const httpClient1 = HttpClient.getInstance(MOCK_URL);

		window.keycloak = {
			authenticated: true,
			updateToken: (i) => { },
			token: `eyfdgskfhgkds`
		};

		const result = await httpClient1.post(``, {}, { 'custom': `custom` }, `corid`);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`put() must return expected mock data`, async () => {
		const httpClient1 = HttpClient.getInstance(MOCK_URL);

		window.keycloak = {
			authenticated: true,
			updateToken: (i) => { },
			token: `eyfdgskfhgkds`
		};

		const result = await httpClient1.put(``, {}, { 'custom': `custom` }, `corid`);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`delete() must return expected mock data`, async () => {
		const httpClient1 = HttpClient.getInstance(MOCK_URL);

		window.keycloak = {
			authenticated: true,
			updateToken: async (i) => { },
			token: `eyfdgskfhgkds`
		};

		const result = await httpClient1.delete(``, { 'custom': `custom` }, `corid`);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`get() to mock route must return expected mock data`, async () => {

		try {
			await httpClient.get(`${MOCK_URL}/404`);
		} catch (error) {
			expect(error).toEqual(new Error(`Not Found`));
		}
	});

	test(`get() to return expected mock data`, async () => {
		const result = await httpClient.get(MOCK_URL);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`put() to return expected mock data`, async () => {
		const result = await httpClient.put(MOCK_URL);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`post() to return expected mock data`, async () => {
		const result = await httpClient.post(MOCK_URL);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`post() to return expected mock data for FormData posted`, async () => {
		const formData = new FormData();
		formData.append(`param`, `value`);
		const result = await httpClient.post(MOCK_URL, formData);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`post() to return expected mock data for FormData posted`, async () => {
		const formData = new FormData();
		const controller = new AbortController();
		formData.append(`param`, `value`);
		const result = await httpClient.post(MOCK_URL, formData, null, null, null, controller);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`delete() to return expected mock data`, async () => {
		const result = await httpClient.delete(MOCK_URL);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`get() to fail with 500 error`, async () => {
		await fetchMock.mock(MOCK_URL, 500, { overwriteRoutes: true });
		await expect(httpClient.get(MOCK_URL)).
			rejects.
			toThrow(`Internal Server Error`);
	});

	test(`get() to fail with 403 error`, async () => {
		await fetchMock.mock(MOCK_URL, 403, { overwriteRoutes: true });
		await expect(httpClient.get(MOCK_URL)).
			rejects.
			toThrow(`Forbidden`);
	});

	test(`get() to return expected payload with base url provided`, async () => {
		const httpClient2 = new HttpClient(MOCK_URL);
		const result = await httpClient2.get(`/doodles`);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`get() create metric for context provided + request SLA`, async () => {
		const httpClient2 = new HttpClient(MOCK_URL, `test`);
		const result = await httpClient2.get(`/doodles`, null, null, null, 500);
		expect(result.data).toEqual(`Sent payload`);
	});

	test(`get() create metric for context provided + request timeout`, async () => {
		const httpClient2 = new HttpClient(MOCK_URL);
		await expect(httpClient2.get(`/doodles/timeout`, null, null, null, null, 100)).
			rejects.
			toThrowError();
	});

	// test(`get() to return blob`, async () => {
	// 	const httpClient2 = new HttpClient(MOCK_URL);
	// 	const result = await httpClient2.get(`/doodles/blob`, null, null, true);
	// 	expect(result.raw).toBeInstanceOf(Blob);
	// });
});