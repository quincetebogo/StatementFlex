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