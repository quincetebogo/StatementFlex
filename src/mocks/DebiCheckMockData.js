import { testPDF } from 'app/mocks/PDFMockData';

/**
 * DebiCheck mandates mock response
 *
 * @export
 * @constant mockMandates
 */

export const mockMandates = {
    "mandateSummaryList": [
        {
            "mandateId": 8,
            "registerId": 2,
            "amount": 65600,
            "collectionDate": {
                "day": "1",
                "frequency": "Month"
            },
            "maxCollectionAmount": 65600,
            "mandateName": "DISCLIFE 5130111776-21",
            "mandateStatus": "PENDING",
            "collectionDayFrequency": "1st of Month"
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
            "mandateStatus": "ACTIVE",
            "collectionDayFrequency": "23rd of Month"
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
            "mandateStatus": "PENDING",
            "collectionDayFrequency": "11th of Month"
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
            "mandateStatus": "INACTIVE",
            "collectionDayFrequency": "22nd of Month",
            "canBeAuthenticated": true
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
            "mandateStatus": "SUSPENDED",
            "collectionDayFrequency": "1st of Month",
            "canBeAuthenticated": true
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
            "mandateStatus": "PENDING",
            "collectionDayFrequency": "30th of Month",
            "canBeAuthenticated": true
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
            "mandateStatus": "PENDING",
            "collectionDayFrequency": "8th of Month",
            "canBeAuthenticated": true
        }
    ]
};

export const mandateInfo = [
    {
        mandateId: 8,
        registerId: 2,
        mandateInfo: {
            "firstCollectionDate": "2021-02-09T17:05:32.909Z",
            "tracking": "Yes",
            "contractReference": "12345678010",
            "collectorContact": "021 101 0810",
            "mandateReference": "2201709170000000000",
            "collectorEmail": "mandate1@collector.bank",
            "mrti": "4573",
            "debtorAccountNumber": "123456789",
            "canBeAuthenticated": true
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
            "mrti": "547452",
            "debtorAccountNumber": "123456798",
            "canBeAuthenticated": true
        }
    },
    {
        mandateId: 5,
        registerId: 5,
        mandateInfo: {
            "firstCollectionDate": "2021-02-08T17:05:32.909Z",
            "tracking": "Yes",
            "contractReference": "65498569",
            "collectorContact": "021 101 1111",
            "mandateReference": "kgyh85698",
            "collectorEmail": "mandate3@collector.bank",
            "mrti": "780780",
            "debtorAccountNumber": "132456789",
            "canBeAuthenticated": true
        }
    }
];

export const agreement = [
    {
        code: "0",
        message: "Mandate agreement saved",
        data: {
            "agreementSaved": "true",
            "mandateAuthenticated": "true",
            "authenticationFeeCharged": "true"
        }
    },
    {
        code: "1",
        message: "Mandate agreement saved",
        data: {
            "agreementSaved": "true",
            "mandateAuthenticated": "true",
            "authenticationFeeCharged": "true"
        }
    },
    {
        code: "2",
        message: "Mandate agreement saved",
        data: {
            "agreementSaved": "true",
            "mandateAuthenticated": "true",
            "authenticationFeeCharged": "true"
        }
    }
];

export const agreementTemplate = {
	"code": 0,
	"message": "Mandate agreement saved",
	"data": {
	  "documentId": null,
	  "contentType": "Debicheck agreement" ,
	  "data": testPDF.content.data
	},
	"residentialAddress": "RUSTENBURG",
	"postalAddress": " 12-1-490RUSTENBURG",
	"cellphone": "9876543212",
	"homeNumber": "",
	"workNumber": "",
	"accountShortName": "BURG",
	"cardNumber": "4000000000000061",
	"emailAddress": "",
	"middleName": ""
  };