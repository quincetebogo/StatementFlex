export const accessChannelsDetails = {
	"msisdn": "",

	"app": {
		"status": "Suspended",
		"statusReason": "Stolen",
		"dateLastUsed": "2021-09-11T09:48:18.908Z",
		"dateRegistered": "2021-11-08T09:48:18.908Z",
		"userName": "Mr Tertius Steyl",
		"userRegNo": "9065011004"
	},
	"internetBanking": {
		"status": "Active",
		"statusReason": "",
		"dateLastUsed": "2021-11-08T09:48:18.908Z",
		"dateRegistered": "2021-11-08T09:48:18.908Z",
		"dateLastUpdated": "2021-06-12T12:45:18.908T",
		"userName": "Mr Tertius Steyl",
		"userRegNo": "9065011004",
		"tokenSerialNumber": "11111111111"
	},
	"ussd": {
		"status": "Active",
		"statusReason": "",
		"isSimBlocked": true,
		"dateLastUsed": "2021-12-08T08:00:48.879Z",
		"dateRegistered": "2021-12-08T08:00:48.879Z",
		"dateLastUpdated": "2021-12-08T08:00:48.879Z",
		"userRegNo": "906 501 1004",
		"features": [
			"REDUCED_MENU"
		]
	}
};

export const accessChannelResetSecurityTokenClock = {
	"succeeded": false,
	"result": {
		"responseCode": "string",
		"responseDescription": "string",
		"traceIdentifier": "string",
		"operationalErrorModels": [
		  {
			"operation": "INPUT_VALIDATION",
			"operationState": "SUCCESS",
			"errorCode": 0,
			"errorType": "WARNING",
			"errorDetails": {
			  "errorCode": 0,
			  "errorType": "string",
			  "errorMessage": "string",
			  "message": "string",
			  "recommendedPostAction": "RETRY",
			  "errorDescription": "string"
			},
			"inputErrors": [
			  {
				"fieldName": "string",
				"validationError": "string"
			  }
			],
			"recommendedPostAction": "RETRY"
		  }
		],
		"errors": [
		  {
			"operation": "INPUT_VALIDATION",
			"operationState": "SUCCESS",
			"errorCode": 0,
			"errorType": "WARNING",
			"errorDetails": {
			  "errorCode": 0,
			  "errorType": "string",
			  "errorMessage": "string",
			  "message": "string",
			  "recommendedPostAction": "RETRY",
			  "errorDescription": "string"
			},
			"inputErrors": [
			  {
				"fieldName": "string",
				"validationError": "string"
			  }
			],
			"recommendedPostAction": "RETRY"
		  }
		]
	}
};