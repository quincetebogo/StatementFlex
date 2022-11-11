/**
 * DebiCheck mandates mock response
 *
 * @export
 * @constant mockMandates
 */

export const mockMandates = {
    "mandateSummaryList": [

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

export const mandateInfo = {
		"adjustmentAmount": 500,
		"secondaryStatus": `DECLINED`,
		"mandateName": "DISCLIFE 5130111776-21",
		"mandateStatus": "DECLINED",
		"adjustmentRate": 6,
		"frequency": "Monthly",
		"firstCollectionDate": "2022-07-28T00:00:00+00:00",
		"tracking": true,
		"contractReference": "HorizonT120",
		"collectorContact": "+27-116171700",
		"mandateReference": "001020220728DAF85BBF64",
		"collectorEmail": "creditor@nupay.co.za",
		"mrti": "001020220728DAF85BBF64",
		"debtorAccountNumber": "1648842540",
		"canBeAuthenticated": true,
		"dateAmended": "2022-07-28T11:16:18.937+00:00",
		"ultimateCreditorName": "NUPAY",
		"mandateRequestTransactionIdentifier": null,
		"payerAccount": 1324124,
		"cifNumber": 289739225,
		"entryClass": `-`,
		"payerID": "T02898475357773659",
		"ultimateDebtorName": "Capitec Bank LTD",
		"creditorContactNumber": "0112322455",
		"creditorTelephoneNo": "021034440344",
		"creditorUltimateName": "Vodacom" 
	};

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
    "code": `0`,
    "message": `Mandate agreement saved`,
    "data": {
        "documentId": `507bc299-8283-42fd-9281-3685b4ef2102`,
        "contentType": `HTML`,
        "data": "PCFET0NUWVBFIEhUTUwgUFVCTElDICItLy9XM0MvL0RURCBIVE1MIDQuMDEgVHJhbnNpdGlvbmFsLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw0L2xvb3NlLmR0ZCI+CjxodG1sIGxhbmc9ImVuLVVTIj4KPGhlYWQ+Cjx0aXRsZT4xMzRfRGViaWNoZWNrX0EmTV9QYXltZW50X0luc3RydWN0aW9uczwvdGl0bGU+CjwhLS0gT3BlblRleHQgRXhzdHJlYW0gVmVyc2lvbiAxNi42LjAgNjQtYml0IChEQkNTKS0tPgo8IS0tIENyZWF0aW9uRGF0ZTogOC81LzIwMjIgMTU6MjU6NTkgLS0+CjwhLS0gRm9yOiBSZWdpc3RlcmVkIHRvIENBUFRFQyAgIC0tPgo8bWV0YSBodHRwLWVxdWl2PSJDb250ZW50LVR5cGUiIGNvbnRlbnQ9InRleHQvaHRtbDsgY2hhcnNldD11dGYtOCIvPgo8c3R5bGU+CkBtZWRpYSAobWF4LXdpZHRoOiA0ODBweCkKewp0YWJsZSB7d2lkdGg6MTAwJTt9CmltZyB7bWF4LXdpZHRoOjEwMCU7IGhlaWdodDogYXV0byAhaW1wb3J0YW50O30KdGFibGUuRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAge2Rpc3BsYXk6YmxvY2s7fQp0YWJsZS5FWF9SRVNQT05TSVZFX1RBQkxFXzQ4MCA+IHRib2R5IHtkaXNwbGF5OmJsb2NrO30KdGFibGUuRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAgPiB0Ym9keSA+IHRyIHtkaXNwbGF5OmJsb2NrO30KdGFibGUuRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAgPiB0Ym9keSA+IHRyID4gdGgge2Rpc3BsYXk6YmxvY2s7fQp0YWJsZS5FWF9SRVNQT05TSVZFX1RBQkxFXzQ4MCA+IHRib2R5ID4gdHIgPiB0ZCB7ZGlzcGxheTpibG9jazt9CnRhYmxlLkVYX1JFU1BPTlNJVkVfVEFCTEVfNDgwIHRhYmxlIHt0YWJsZS1sYXlvdXQ6IGF1dG8gIWltcG9ydGFudDt9Ci5FWF9SRVNQT05TSVZFX0hJREVfQ0VMTF80ODAge2Rpc3BsYXk6bm9uZSAhaW1wb3J0YW50O30KfQo8L3N0eWxlPgo8L2hlYWQ+Cjxib2R5ICBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojRkZGRkZGOyAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjsgZm9udC1mYW1pbHk6IGZsYW1hOyI+Cjx0YWJsZSB3aWR0aD0iMTAwJSIgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiBiZ2NvbG9yPSIjRkZGRkZGIj48dHI+PHRkIGFsaWduPSJjZW50ZXIiIGJnY29sb3I9IiNGRkZGRkYiPgo8dGFibGUgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDk5IiByb2xlPSJwcmVzZW50YXRpb24iICBjbGFzcz0iRVhfUkVTUE9OU0lWRV9UQUJMRV80ODAiIApzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgdGFibGUtbGF5b3V0OiBmaXhlZDsiPjx0cj48dGQgY2xhc3M9IkVYX1JFU1BPTlNJVkVfSElERV9DRUxMXzQ4MCIgCndpZHRoPSI0OTkiIGhlaWdodD0iMCI+PC90ZD4KPC90cj4KPHRyPjx0ZCB2YWxpZ249Im1pZGRsZSIgYWxpZ249ImNlbnRlciI+PHRhYmxlIGlkPSJhZ3JlZW1lbnQtY2xhdXNlcy10YWJsZSIgY2VsbHBhZGRpbmc9IjAiIApjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjQ5OSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCBjb2xzcGFuPSIyIiAKd2lkdGg9IjI4MiIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjojM0EzQTNBOyI+TWFuZGF0ZSAKUmVmZXJlbmNlIE51bWJlcjo8L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8dGQgd2lkdGg9IjE5NyIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjojM0EzQTNBOyI+MDAxMDIwMjIwNzI4MkZGMzEyMUZDMjwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OSIgaGVpZ2h0PSI2NCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjojM0EzQTNBOyI+VGhhbmsgCnlvdSwgU2lyL01hZGFtLiBXZSBjb25maXJtIHRoYXQgeW91LCAgTXIgTEFXUkVOQ0UgRE9MTywgOTgwMzA5NTg3MTA4MSwgYWdyZWUgdG8gCnRoZSBmb2xsb3dpbmc6PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMSAKVGhpcyBjYWxsIGlzIHRvIGNvbmZpcm0geW91ciBEZWJpQ2hlY2sgbWFuZGF0ZSBhbmQgdGhlIHBheW1lbnRzIHlvdSBtdXN0IG1ha2UgCnVuZGVyIHRoZSBjcmVkaXQgYWdyZWVtZW50LCBjb250cmFjdCByZWZlcmVuY2UgbnVtYmVyIEhvcml6b25UMTA0PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMiAKUGxlYXNlIG5vdGUgdGhhdCB5b3VyIGluc3RhbG1lbnQgb2YgUjQ2MC4xMCB3aWxsIGJlIGRlZHVjdGVkIGZyb20geW91ciBub21pbmF0ZWQgCmJhbmsgYWNjb3VudCBvbiB0aGUgMXN0IG9mIHRoZSBuZXh0IG1vbnRoIG9yIGlmIHlvdXIgc2FsYXJ5IG9yIHdhZ2UgaXMgcGFpZCBiZWZvcmUgCnRoYXQsIG9uIGFuIGVhcmxpZXIgZGF0ZSwgd2l0aCBhIGxhc3QgYW1vdW50IG9mIFI0NjAuMTAsIHRvIHNhdGlzZnkgeW91ciBvYmxpZ2F0aW9ucyAKdW5kZXIgdGhlIGFncmVlbWVudCB3ZSBub3cgbWFrZS4gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMyAKRG8geW91IHVuZGVyc3RhbmQgYW5kIGFjY2VwdCB0aGF0IHRoZSBkYXRlIHRoYXQgd2Ugd2lsbCBjb2xsZWN0IHRoZSBpbnN0YWxtZW50cyAKZnJvbSB5b3Ugd2lsbCBlaXRoZXIgYmUgb24gdGhlIDFzdCBvZiB0aGUgbmV4dCBtb250aCwgb3IgYW4gZWFybGllciBkYXRlLCBkZXBlbmRpbmcgCm9uIHdoZW4geW91ciBzYWxhcnkgb3Igd2FnZSBpcyBwYWlkLiBEbyB5b3UgdW5kZXJzdGFuZCBhbmQgYWNjZXB0IHRoaXM/IDwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OSIgaGVpZ2h0PSIyMyIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmlkPSJleC10YWJsZTEiIGNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjQ5MCIgIGNsYXNzPSJhZ3JlZW1lbnQtcXVlc3Rpb24tcmFkaW8iIAogc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7OyI+PHRyPjx0ZCB3aWR0aD0iNDgwIiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiAKIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OzsiPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuNCAKVGhlIHBheW1lbnRzIHdpbGwgYmUgbWFkZSBieSBlYXJseSBkZWJpdCBvcmRlciBhZ2FpbnN0IHlvdXIgbm9taW5hdGVkIGFjY291bnQgCm51bWJlciAxNjQ4ODQyNTQwIHdpdGggQ2FwaXRlYyBCYW5rIExpbWl0ZWQgU0FWSU5HUyBBQ0NPVU5ULiBEbyB5b3UgYWdyZWUgd2l0aCAKdGhpcz88L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODkiIGhlaWdodD0iMjkiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIAppZD0iZXgtdGFibGUyIiBjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSI0OTAiICBjbGFzcz0iYWdyZWVtZW50LXF1ZXN0aW9uLXJhZGlvIiAKIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOzsiPjx0cj48dGQgd2lkdGg9IjQ4MCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgCiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDs7Ij48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OSIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGNvbG9yOiMzQTNBM0E7Ij4xLjUgClRoZSBwZXJtaXNzaW9uIGZvciB0aGUgYmFuayB0byBjb2xsZWN0IGluc3RhbG1lbnRzIGluIHRoZSBjcmVkaXQgYWdyZWVtZW50IHdpbGwgCmFsc28gYXBwbHkgdG8gdGhlIGFncmVlbWVudCB3ZSBub3cgbWFrZS4gRG8geW91IHVuZGVyc3RhbmQgYW5kIGFjY2VwdCB3aGF0IEkgaGF2ZSAKcmVhZCB0byB5b3U/PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg5IiBoZWlnaHQ9IjIzIiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKaWQ9ImV4LXRhYmxlMyIgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDkwIiAgY2xhc3M9ImFncmVlbWVudC1xdWVzdGlvbi1yYWRpbyIgCiBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTs7Ij48dHI+PHRkIHdpZHRoPSI0ODAiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIAogc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7OyI+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgdmFsaWduPSJtaWRkbGUiIGFsaWduPSJsZWZ0Ij48dGFibGUgaWQ9ImRpc2NsYWltZXItY2xhdXNlcy10YWJsZSIgY2VsbHBhZGRpbmc9IjAiIApjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjQ5OCIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCBjb2xzcGFuPSIzIiAKd2lkdGg9IjQ4OCIgaGVpZ2h0PSIyNiIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjojM0EzQTNBOyI+VGhhbmsgCnlvdSwgU2lyL01hZGFtLiBXZSBjb25maXJtIHRoYXQgeW91IGFncmVlIHRvIHRoZSBmb2xsb3dpbmc6IDwvc3Bhbj48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+Cjx0cj48dGQgY29sc3Bhbj0iMyIgd2lkdGg9IjQ4OCIgIGFsaWduPSJsZWZ0IiB2YWxpZ249InRvcCIgc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7Ij48dGFibGUgCmNlbGxwYWRkaW5nPSIwIiBjZWxsc3BhY2luZz0iMCIgd2lkdGg9IjEwMCUiICBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsiPjx0cj48dGQgCmNsYXNzPSJIaW5kVmFkYXJhMTZQYXJhIiAgc3R5bGU9Im1hcmdpbi10b3A6IDA7IG1hcmdpbi1ib3R0b206IDA7IGZvbnQtc2l6ZTogMDsiPjxzcGFuIAogc3R5bGU9ImZvbnQtZmFtaWx5OiAnSGluZCBWYWRvZGFyYSc7IGZvbnQtc2l6ZTogMTZweDsgbGluZS1oZWlnaHQ6IDE5cHg7IGNvbG9yOiMzQTNBM0E7Ij4xLjYgCkRvIHlvdSBoZXJlYnkgYXV0aG9yaXNlIHRoZSBiYW5rIHRvIGRlYml0IHlvdXIgYWNjb3VudD8gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKaWQ9ImV4LXRhYmxlNCIgY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iNDg5IiAgY2xhc3M9ImFncmVlbWVudC1xdWVzdGlvbi1yYWRpbyIgCiBzdHlsZT0iYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTs7Ij48dHI+PHRkIHdpZHRoPSI0NzkiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIAogc3R5bGU9Im1hcmdpbi1ib3R0b206IDBweDsgbWFyZ2luLXRvcDogMHB4OyBwYWRkaW5nLXRvcDo1LjAwcHg7IHBhZGRpbmctYm90dG9tOjUuMDBweDsgcGFkZGluZy1sZWZ0OjUuMDBweDsgcGFkZGluZy1yaWdodDo1LjAwcHg7OyI+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8dHI+PHRkIGNvbHNwYW49IjMiIHdpZHRoPSI0ODgiICBhbGlnbj0ibGVmdCIgdmFsaWduPSJ0b3AiIHN0eWxlPSJtYXJnaW4tYm90dG9tOiAwcHg7IG1hcmdpbi10b3A6IDBweDsgcGFkZGluZy10b3A6NS4wMHB4OyBwYWRkaW5nLWJvdHRvbTo1LjAwcHg7IHBhZGRpbmctbGVmdDo1LjAwcHg7IHBhZGRpbmctcmlnaHQ6NS4wMHB4OyI+PHRhYmxlIApjZWxscGFkZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHdpZHRoPSIxMDAlIiAgc3R5bGU9ImJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7Ij48dHI+PHRkIApjbGFzcz0iSGluZFZhZGFyYTE2UGFyYSIgIHN0eWxlPSJtYXJnaW4tdG9wOiAwOyBtYXJnaW4tYm90dG9tOiAwOyBmb250LXNpemU6IDA7Ij48c3BhbiAKIHN0eWxlPSJmb250LWZhbWlseTogJ0hpbmQgVmFkb2RhcmEnOyBmb250LXNpemU6IDE2cHg7IGxpbmUtaGVpZ2h0OiAxOXB4OyBjb2xvcjojM0EzQTNBOyI+MS43IApQbGVhc2Ugbm90ZSB0aGF0IGlmIHdl4oCZcmUgdW5hYmxlIHRvIGNvbGxlY3QgYW55IGluc3RhbG1lbnQocykgZnJvbSB5b3VyIGFjY291bnQgCmluIGFjY29yZGFuY2Ugd2l0aCB3aGF0IHdlIGhhdmUgYWdyZWVkIHRvIG9uIHRoaXMgY2FsbCwgdGhlbiBzdWNoIHBheW1lbnQocykgbWF5IApiZSBzdWJqZWN0IHRvIGEgdHJhY2tpbmcgcHJvY2Vzcywgd2hlcmVieSB3ZSB3aWxsIGF0dGVtcHQgdG8gY29sbGVjdCB0aGUgaW5zdGFsbWVudChzKSAKZnJvbSB5b3VyIGFjY291bnQgb3ZlciBhIHRyYWNraW5nIHBlcmlvZC4gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuOCAKSWYgeW91IGhhdmUgYW4gaXNzdWUgd2l0aCBhbnkgZGViaXQgb3JkZXIgbWFkZSBhZ2FpbnN0IHlvdXIgYWNjb3VudCwgeW91IG1heSBkaXNwdXRlIApzdWNoIGRlYml0IG9yZGVyIGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgZGlzcHV0YWJpbGl0eSBydWxlcyBvZiB0aGUgUGF5bWVudHMgQXNzb2NpYXRpb24gCm9mIFNvdXRoIEFmcmljYS4gPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuOSAKWW91IGNvbmZpcm0gdGhhdCBhbGwgdGhlIGRldGFpbHMgeW91IGhhdmUgcHJvdmlkZWQgb24gdGhpcyBjYWxsIGFyZSBjb3JyZWN0PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMTAgCkEgY29weSBvZiB0aGUgZnVsbCBhZ3JlZW1lbnQgY2FuIGJlIHByb3ZpZGVkIHRvIHlvdSBvbiByZXF1ZXN0PC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMTEgClBsZWFzZSBub3RlIHRoYXQgdGhlIE1hbmRhdGUgUmVmZXJlbmNlIE51bWJlciBpcyAwMDEwMjAyMjA3MjgyRkYzMTIxRkMyPC9zcGFuPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD4KPC90cj4KPHRyPjx0ZCBjb2xzcGFuPSIzIiB3aWR0aD0iNDg4IiAgYWxpZ249ImxlZnQiIHZhbGlnbj0idG9wIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTogMHB4OyBtYXJnaW4tdG9wOiAwcHg7IHBhZGRpbmctdG9wOjUuMDBweDsgcGFkZGluZy1ib3R0b206NS4wMHB4OyBwYWRkaW5nLWxlZnQ6NS4wMHB4OyBwYWRkaW5nLXJpZ2h0OjUuMDBweDsiPjx0YWJsZSAKY2VsbHBhZGRpbmc9IjAiIGNlbGxzcGFjaW5nPSIwIiB3aWR0aD0iMTAwJSIgIHN0eWxlPSJib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlOyI+PHRyPjx0ZCAKY2xhc3M9IkhpbmRWYWRhcmExNlBhcmEiICBzdHlsZT0ibWFyZ2luLXRvcDogMDsgbWFyZ2luLWJvdHRvbTogMDsgZm9udC1zaXplOiAwOyI+PHNwYW4gCiBzdHlsZT0iZm9udC1mYW1pbHk6ICdIaW5kIFZhZG9kYXJhJzsgZm9udC1zaXplOiAxNnB4OyBsaW5lLWhlaWdodDogMTlweDsgY29sb3I6IzNBM0EzQTsiPjEuMTIgCkRhdGU6IDA1LzA4LzIwMjI8L3NwYW4+PC90ZD4KPC90cj4KPC90YWJsZT48L3RkPgo8L3RyPgo8L3RhYmxlPjwvdGQ+CjwvdHI+CjwvdGFibGU+PC90ZD48L3RyPjwvdGFibGU+CjwvYm9keT4KPC9odG1sPgo="
    },
    "residentialAddress": `STAND NUMBER 01084 SERAPPIES VILLAGE MAPELA MOKOPANE 0611`,
    "postalAddress": `STAND NUMBER 01084 SERAPPIES VILLAGE MAPELA MOKOPANE 0611`,
    "cellphone": `0684058890`,
    "homeNumber": ``,
    "workNumber": ``,
    "accountShortName": `SAVINGS ACCOUNT`,
    "cardNumber": `5284 **** **** 0319`,
    "emailAddress": ``,
    "middleName": `  `
};