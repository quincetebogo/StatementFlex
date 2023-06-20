export const payShapDetails = {
	"capitecProxy": {
		"verified": true,
		"knownAsName": `0764575577@capitecbank`,
		"proxyId": ``,
		"domain": `Capitec Bank`,
		"fullProxyStatus": `Active`,
		"defaultProxyStatus": true
	},
	"fees": [
		{
			"lowerBound": 0,
			"upperBound": 100.00,
			"amount": 1.00
		},
		{
			"lowerBound": 100.01,
			"upperBound": 1000.00,
			"amount": 2.50
		},
		{
			"lowerBound": 1000.01,
			"upperBound": 3000.00,
			"amount": 5.00
		},
		{
			"lowerBound": 3000.01,
			"upperBound": 100000.00,
			"amount": 7.50
		}
	],
	"limits": {
		"transactionLimit": 3000.00,
		"dailyLimit": 5000.00
	}
};

export const institutionsList = [
	{
		"participantName": `CAPITEC BANK LIMITED`,
		"domains": [
			{
				"name": `CAPITEC`
			},
			{
				"name": `AFRICANBANK`
			},
			{
				"name": `SBI BANK`
			}
		]
	},
	{
		"participantName": `AFRICAN BANK`,
		"domains": [
			{
				"name": `AFRICANBANK`
			}
		]
	},
	{
		"participantName": `Standard Bank`,
		"domains": [
			{
				"name": `StandardBank`
			}
		]
	},
	{
		"participantName": `ABSA BANK`,
		"domains": [
			{
				"name": `ABSA`
			}
		]
	},
	{
		"participantName": `TEST BANK`,
		"domains": [
			{
				"name": `TEST`
			}
		]
	},
	{
		"participantName": `BSA SIMULATOR`,
		"domains": [
			{
				"name": `sandbox`
			}
		]
	}
];

export const moneyOutResponse = 
	{
		"paymentHistoryList": [
			{
				"processDateTime": "2023-06-09T18:01:53.523Z",
				"methodOfPayment": "PBPX",
				"tranCode": "6651",
				"statusCode": "Successful",
				"amount": 700,
				"currency": "ZAR",
				"debtorAccountId": "1347014444",
				"debtorReference": "PayShap PaymentD",
				"creditorAccountId": null,
				"creditorAgentBICFI": null,
				"creditorAgentMemberIdentification": null,
				"creditorAgentCreditorDomain": "sandbox",
				"creditorProxyType": "MBNO",
				"creditorKnownAsName": "DEV NAME SURNAME XX",
				"creditorFicaName": "DEV NAME SURNAME XX",
				"creditorProxyId": "+27-820000101",
				"creditorReference": "PayShap PaymentC",
				"feeAmount": 0,
				"notificationType": "SMS",
				"notificationAddress": "+27-842628298",
				"hideDetails": false,
				"insertedDateTime": "2023-06-09T18:02:15.880Z",
				"uetr": "1a84609f-d1ba-401a-8f7e-7ff230664001"
			},
			{
				"processDateTime": "2023-06-09T17:54:06.742Z",
				"methodOfPayment": "PBPX",
				"tranCode": "6651",
				"statusCode": "FailedToProcess",
				"amount": 700,
				"currency": "ZAR",
				"debtorAccountId": "1347014444",
				"debtorReference": "PayShap PaymentD",
				"creditorAccountId": null,
				"creditorAgentBICFI": null,
				"creditorAgentMemberIdentification": null,
				"creditorAgentCreditorDomain": "sandbox",
				"creditorProxyType": "MBNO",
				"creditorKnownAsName": "DEV NAME SURNAME XX",
				"creditorFicaName": "DEV NAME SURNAME XX",
				"creditorProxyId": "+27-820000101",
				"creditorReference": "PayShap PaymentC",
				"feeAmount": 0,
				"notificationType": "SMS",
				"notificationAddress": "+27-842628298",
				"hideDetails": false,
				"insertedDateTime": "2023-06-09T17:54:29.449Z",
				"uetr": "fd5c64aa-be4d-488d-b506-f20ee3b84a89"
			},
			{
				"processDateTime": "2023-06-09T17:41:44.535Z",
				"methodOfPayment": "PBPX",
				"tranCode": "6651",
				"statusCode": "FailedToProcess",
				"amount": 718,
				"currency": "ZAR",
				"debtorAccountId": "1347014444",
				"debtorReference": "PayShap PaymentD",
				"creditorAccountId": null,
				"creditorAgentBICFI": null,
				"creditorAgentMemberIdentification": null,
				"creditorAgentCreditorDomain": "sandbox",
				"creditorProxyType": "MBNO",
				"creditorKnownAsName": "DEV NAME SURNAME XX",
				"creditorFicaName": "DEV NAME SURNAME XX",
				"creditorProxyId": "+27-820000101",
				"creditorReference": "PayShap PaymentC",
				"feeAmount": 0,
				"notificationType": "SMS",
				"notificationAddress": "+27-842628298",
				"hideDetails": false,
				"insertedDateTime": "2023-06-09T17:42:00.217Z",
				"uetr": "04e87895-baf5-4a3d-a721-40df583ac110"
			},
			{
				"processDateTime": "2023-06-09T16:37:07.541Z",
				"methodOfPayment": "PBPX",
				"tranCode": "6651",
				"statusCode": "Successful",
				"amount": 788,
				"currency": "ZAR",
				"debtorAccountId": "1347014444",
				"debtorReference": "PayShap PaymentD",
				"creditorAccountId": null,
				"creditorAgentBICFI": null,
				"creditorAgentMemberIdentification": null,
				"creditorAgentCreditorDomain": "sandbox",
				"creditorProxyType": "MBNO",
				"creditorKnownAsName": "DEV NAME SURNAME XX",
				"creditorFicaName": "DEV NAME SURNAME XX",
				"creditorProxyId": "+27-820000101",
				"creditorReference": "PayShap PaymentC",
				"feeAmount": 0,
				"notificationType": "SMS",
				"notificationAddress": "+27-842628298",
				"hideDetails": false,
				"insertedDateTime": "2023-06-09T16:37:29.685Z",
				"uetr": "3d7af5ea-fdbb-4aa5-a793-c8357dba6c86"
			},
			{
				"processDateTime": "2023-06-09T15:41:54.501Z",
				"methodOfPayment": "PBPX",
				"tranCode": "6651",
				"statusCode": "Successful",
				"amount": 598,
				"currency": "ZAR",
				"debtorAccountId": "1347014444",
				"debtorReference": "PayShap PaymentD",
				"creditorAccountId": null,
				"creditorAgentBICFI": null,
				"creditorAgentMemberIdentification": null,
				"creditorAgentCreditorDomain": "sandbox",
				"creditorProxyType": "MBNO",
				"creditorKnownAsName": "DEV NAME SURNAME XX",
				"creditorFicaName": "DEV NAME SURNAME XX",
				"creditorProxyId": "+27-820000101",
				"creditorReference": "PayShap PaymentC",
				"feeAmount": 0,
				"notificationType": "SMS",
				"notificationAddress": "+27-842628298",
				"hideDetails": false,
				"insertedDateTime": "2023-06-09T15:42:16.727Z",
				"uetr": "9f937edc-ed89-4170-a314-c70ec56c1c03"
			}
		],
		"more": true,
		"paginationToken": "eyJDbGllbnRDSUYiOnsiQlMiOltdLCJMIjpbXSwiTSI6e30sIk5TIjpbXSwiUyI6IjE4MTc5Njg2NCIsIlNTIjpbXX0sIkRhdGVUaW1lSW5zZXJ0ZWQiOnsiQlMiOltdLCJMIjpbXSwiTSI6e30sIk5TIjpbXSwiUyI6IjIwMjMtMDYtMDlUMTU6NDI6MTYuNzI3WiIsIlNTIjpbXX19"
	};

export const moneyInResponse = {
	"transactions": [
		{
			"statementDescription": "PayShap Cellphone Payment Received: Za +27-637495405",
			"amount": 3000.0,
			"availableBalance": 0.0,
			"balance": 249344.44,
			"postingDate": "2023-05-08",
			"processDate": "2023-05-08",
			"transactionDate": "2023-05-08T11:15:34.06+02:00",
			"transTypeDesc": "PayShap Cellphone Payment Received",
			"transactionCode": 6632,
			"transactionStatus": null,
			"cardNumber": null,
			"cardAuthType": "UNKNOWN",
			"transferAccount": 0,
			"journalNumber": 963963,
			"includesVAT": false,
			"externalTerminalId": null,
			"spendGroup": "MONEY_IN",
			"cashBack": 0.0,
			"branch": 9001,
			"teller": 991
		},
		{
			"statementDescription": "PayShap Account Payment Received: Za",
			"amount": 2732.0,
			"availableBalance": 0.0,
			"balance": 246344.44,
			"postingDate": "2023-05-08",
			"processDate": "2023-05-08",
			"transactionDate": "2023-05-08T11:15:03.053+02:00",
			"transTypeDesc": "PayShap Account Payment Received",
			"transactionCode": 6632,
			"transactionStatus": null,
			"cardNumber": null,
			"cardAuthType": "UNKNOWN",
			"transferAccount": 0,
			"journalNumber": 360936,
			"includesVAT": false,
			"externalTerminalId": null,
			"spendGroup": "MONEY_IN",
			"cashBack": 0.0,
			"branch": 9001,
			"teller": 991
		},
		{
			"statementDescription": "PayShap Cellphone Payment Received: Za +27-637495405",
			"amount": 3000.0,
			"availableBalance": 0.0,
			"balance": 243612.44,
			"postingDate": "2023-05-08",
			"processDate": "2023-05-08",
			"transactionDate": "2023-05-08T10:57:42.107+02:00",
			"transTypeDesc": "PayShap Cellphone Payment Received",
			"transactionCode": 6632,
			"transactionStatus": null,
			"cardNumber": null,
			"cardAuthType": "UNKNOWN",
			"transferAccount": 0,
			"journalNumber": 863224,
			"includesVAT": false,
			"externalTerminalId": null,
			"spendGroup": "MONEY_IN",
			"cashBack": 0.0,
			"branch": 9001,
			"teller": 991
		},
		{
			"statementDescription": "PayShap Account Payment Received: Za",
			"amount": 2732.0,
			"availableBalance": 0.0,
			"balance": 240612.44,
			"postingDate": "2023-05-08",
			"processDate": "2023-05-08",
			"transactionDate": "2023-05-08T10:57:09.057+02:00",
			"transTypeDesc": "PayShap Account Payment Received",
			"transactionCode": 6632,
			"transactionStatus": null,
			"cardNumber": null,
			"cardAuthType": "UNKNOWN",
			"transferAccount": 0,
			"journalNumber": 906491,
			"includesVAT": false,
			"externalTerminalId": null,
			"spendGroup": "MONEY_IN",
			"cashBack": 0.0,
			"branch": 9001,
			"teller": 991
		},
		{
			"statementDescription": "PayShap Cellphone Payment Received: Za +27-637495405",
			"amount": 3000.0,
			"availableBalance": 0.0,
			"balance": 237880.44,
			"postingDate": "2023-05-08",
			"processDate": "2023-05-08",
			"transactionDate": "2023-05-08T10:54:19.207+02:00",
			"transTypeDesc": "PayShap Cellphone Payment Received",
			"transactionCode": 6632,
			"transactionStatus": null,
			"cardNumber": null,
			"cardAuthType": "UNKNOWN",
			"transferAccount": 0,
			"journalNumber": 538473,
			"includesVAT": false,
			"externalTerminalId": null,
			"spendGroup": "MONEY_IN",
			"cashBack": 0.0,
			"branch": 9001,
			"teller": 991
		}
	]
};