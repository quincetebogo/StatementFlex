export const Constants = {
	metrics: {
		AGGREGATION_MAX_TIME: 20000,
		AGGREGATION_MAX_COUNT: 10,
		METRIC_RETRY_INTERVAL: 2000
	},
	log: {
		LOG_RETRY_INTERVAL: 2000
	},
	logStore: {
		QUEUE_MAX_SIZE: 500
	},
	telemetry: {
		TELEMETRY_EVENT: `telemetryEvent`,
		SPAN_START_EVENT: `spanStart`,
		SPAN_END_EVENT: `spanEnd`,
		TELEMETRY_RETRY_INTERVAL: 2000
	},
	signalR: {
		EKS_HUB: `eks`,
		DOCKER_HUB: `docker`
	},
	breakpoints: {
		"xs": 600,
		"sm": 960,
		"md": 1264,
		"lg": 1904
	}
};