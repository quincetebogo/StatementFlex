export default {
	testEnvironment: "jsdom",
	verbose: false,
	transform: {},
	collectCoverage: true,
	coverageDirectory: "coverage",
	testResultsProcessor: "jest-bamboo-reporter",
	testMatch: [
		"**/?(*.)+(test).[jt]s?(x)"
	],
	coveragePathIgnorePatterns: [
		"/test/store/"
	]
}