/**
 * DebiCheck mandates mock response
 *
 * @export
 * @constant mockMandates
 */

export const mockMandates = {
	"mandateSummaryList": [
		{
			"mandateId": 0,
			"registerId": 0,
			"amount": 65600,
			"collectionDate": {
				"day": "1",
				"frequency": "Month"
			},
			"maxCollectionAmount": 65600,
			"mandateName": "DISCLIFE 5130111776-21",
			"mandateStatus": "PENDING"
		},
		{
			"mandateId": 1,
			"registerId": 1,
			"amount": 565600,
			"collectionDate": {
				"day": "23",
				"frequency": "Month"
			},
			"maxCollectionAmount": 565600,
			"mandateName": "DISCLIFE 5130111776-21",
			"mandateStatus": "ACTIVE"
		},
		{
			"mandateId": 2,
			"registerId": 2,
			"amount": 29900,
			"collectionDate": {
				"day": "11",
				"frequency": "Month"
			},
			"maxCollectionAmount": 29900,
			"mandateName": "TELKOMMOB15922277090232",
			"mandateStatus": "PENDING"
		},
		{
			"mandateId": 3,
			"registerId": 3,
			"amount": 129900,
			"collectionDate": {
				"day": "22",
				"frequency": "Month"
			},
			"maxCollectionAmount": 129900,
			"mandateName": "VODACOM 0340833372 1000",
			"mandateStatus": "INACTIVE"
		},
		{
			"mandateId": 4,
			"registerId": 4,
			"amount": 345000,
			"collectionDate": {
				"day": "1",
				"frequency": "Month"
			},
			"maxCollectionAmount": 345000,
			"mandateName": "BMWFINANCE 989800101333",
			"mandateStatus": "SUSPENDED"
		},
		{
			"mandateId": 5,
			"registerId": 5,
			"amount": 120000,
			"collectionDate": {
				"day": "30",
				"frequency": "Month"
			},
			"maxCollectionAmount": 120000,
			"mandateName": "FNBRVLLOAN4000069539246",
            "mandateStatus": "PENDING"
		},
		{
			"mandateId": 6,
			"registerId": 6,
			"amount": 9000,
			"collectionDate": {
				"day": "8",
				"frequency": "Month"
			},
			"maxCollectionAmount": 120000,
			"mandateName": "MTN",
            "mandateStatus": "PENDING"
		}
	]
};

export const mandateInfo = [
	{
		mandateId: 0,
		registerId: 0,
		mandateInfo: {
			"firstCollectionDate": "2021-02-09T17:05:32.909Z",
			"tracking": "Yes",
			"contractReference": "12345678010",
			"collectorContact": "021 101 0810",
			"mandateReference": "XYZ4367",
			"collectorEmail": "mandate1@collector.bank",
			"mrti": "4573"
		}
	},
	{
		mandateId: 1,
		registerId: 1,
		mandateInfo: {
			"firstCollectionDate": "2021-02-10T17:05:32.909Z",
			"tracking": "No",
			"contractReference": "6586854658",
			"collectorContact": "021 101 0810",
			"mandateReference": "JFGJ457487",
			"collectorEmail": "mandate2@collector.bank",
			"mrti": "547452"
		}
	},
	{
		mandateId: 2,
		registerId: 2,
		mandateInfo: {
			"firstCollectionDate": "2021-02-08T17:05:32.909Z",
			"tracking": "Yes",
			"contractReference": "65498569",
			"collectorContact": "021 101 1111",
			"mandateReference": "kgyh85698",
			"collectorEmail": "mandate3@collector.bank",
			"mrti": "780780"
		}
	}
];