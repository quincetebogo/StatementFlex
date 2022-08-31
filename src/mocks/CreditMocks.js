// Credit landing page mocks for the positive case.

export const creditBalance = {
	"availableBalance": 1000
};

export const creditOverview = {
	"loanAccountSummaryList": [
		{
			"productTypeDescription": `40 MONTH TERM LOAN`,
			"productTypeCode": `4010`,
			"accountNumber": `1657155046`,
			"currentBalance": 81248.67,
			"creditLimit": 70817.77,
			"remainingMonths": 21,
			"repayAmount": 2493.79,
			"accountStatusDescription": `ACTIVE`,
			"accountStatusCode": `8`,
			"openDate": `2019-07-31T00:00:00`,
			"lastPaymentDate": `2021-11-19T00:00:00`
		},
		{
			"productTypeDescription": `12 MONTH TERM LOAN`,
			"productTypeCode": `4010`,
			"accountNumber": `1720318679`,
			"currentBalance": 24966.84,
			"creditLimit": 20000.0,
			"remainingMonths": 1,
			"repayAmount": 2125.35,
			"accountStatusDescription": `ACTIVE`,
			"accountStatusCode": `8`,
			"openDate": `2020-07-27T00:00:00`,
			"lastPaymentDate": `2021-08-19T00:00:00`
		}
	],
	"accessFacilitySummaryList": [
		{
			"productTypeDescription": `ACCESS FACILITY`,
			"productTypeCode": `6000`,
			"accountNumber": `1633823409`,
			"currentBalance": -10000,
			"availableCredit": 20000,
			"creditLimit": 30000,
			"nextRepayment": 789.01,
			"accountStatusDescription": `ACTIVE`,
			"accountStatusCode": `Open`,
			"openDate": `2022-01-06T06:51:16.483Z`,
			"lastPaymentDate": `2022-01-06T06:51:16.483Z`
		}
	],
	"creditCardSummaryList": [
		{
			"productTypeDescription": `CREDIT CARD`,
			"productTypeCode": `101`,
			"accountNumber": `6001736552`,
			"currentBalance": -5834.09,
			"availableCredit": 0.0,
			"creditLimit": 4000.0,
			"nextRepayment": 134.87,
			"accountStatusDescription": `ACTIVE`,
			"accountStatusCode": `0`,
			"openDate": `2019-07-31T00:00:00`,
			"lastPaymentDate": `2021-10-26T00:00:00`
		}
	],
	"budgetAccountsSummary": {
		"totalBudgetBalance": 0.0,
		"totalBudgetInstallmentAmount": `0`
	}
};

export const creditOverviewEmpty = {
	"loanAccountSummaryList": [],
	"accessFacilitySummaryList": [],
	"creditCardSummaryList": [],
	"budgetAccountsSummary": {
		"totalBudgetBalance": 0,
		"totalBudgetInstallmentAmount": 0
	}
};


/**
 * credit card details mocks
 * 
 * @export
 * @constant {Object} creditCardDetails
 */
export const creditCardDetails = {
	"accountNumber": `1633823409`,
	"accountDescription": `Credit Card`,
	"currentBalance": -15000,
	"availableBalance": 20000,
	"interestRate": `5.5%`,
	"creditLimit": 35000,
	"outstandingAuthorizations": 0,
	"openDate": `2021-12-06T15:18:57.074Z`,
	"autoIncreaseLimitOption": true,
	"accountStatusDescription": `Active`,
	"arrearsAmount": 1536,
	"lastArrearsDate": `2022-01-06T15:18:57.074Z`,
	"repaymentDay": 1,
	"repaymentMethod": `Debit order`,
	"repaymentValue": 10,
	"repaymentValueType": `Percentage`,
	"nextRepaymentDate": `2022-02-06T15:18:57.074Z`,
	"lastpaymentDate": `2021-12-06T15:18:57.074Z`,
	"statementDay": 15,
	"insuranceOptionCode": `Capitec`,
	"insuranceTypeDescription": `Death and disability`,
	"waitingPeriodExpiryDate": `2022-05-06T15:18:57.074Z`
};

/**
 * access facility details mocks
 * 
 * @export
 * @constant {Object} accessFacilityDetails
 */
 export const accessFacilityDetails = {
	"accountNumber": `1633823410`,
	"accountDescription": `Access facility`,
	"currentBalance": -15000,
	"availableBalance": 20000,
	"interestRate": `5.5%`,
	"creditLimit": 35000,
	"outstandingAuthorizations": 0,
	"openDate": `2021-12-06T15:18:57.074Z`,
	"autoIncreaseLimitOption": true,
	"accountStatusDescription": `In arrears`,
	"arrearsAmount": 1560,
	"lastArrearsDate": `2022-01-06T15:18:57.074Z`,
	"repaymentDay": 1,
	"repaymentMethod": `Debit order`,
	"repaymentValue": 5,
	"repaymentPeriod": `12 months`,
	"outstandingRepayments": `11 months`,
	"repaymentAmount": 156476,
	"repaymentValueType": `Percentage`,
	"nextRepaymentDate": `2022-02-06T15:18:57.074Z`,
	"lastpaymentDate": `2021-12-06T15:18:57.074Z`,
	"statementDay": 15,
	"insuranceOptionCode": `Capitec`,
	"insuranceTypeDescription": `Death and disability`,
	"waitingPeriodExpiryDate": `2022-05-06T15:18:57.074Z`
};

/**
 * term loan details mocks
 * 
 * @export
 * @constant {Object} termLoanDetails
 */
 export const termLoanDetails = {
	"accountNumber": `9873493849`,
	"accountDescription": `56 Month Term Loan`,
	"accountStatusDescription": `Active`,
	"approvedDate": `2021-12-06T15:18:57.074Z`,
	"approvedAmount": ``,
	"accountBalance": -15000,
	"creditLimit": 35000,
	"interestRate": `5.5%`,
	"repaymentDay": 1,
	"repaymentValue": 10,
	"repaymentValueType": `Percentage`,
	"nextRepaymentDate": `2022-02-06T15:18:57.074Z`,
	"lastpaymentDate": `2021-12-06T15:18:57.074Z`,
	"lastPaymentReceived": 4592,
	"insuranceOptionCode": `Capitec`,
	"insuranceTypeDescription": `Death and disability`,
	"waitingPeriodExpiryDate": `2022-05-06T15:18:57.074Z`
};

/**
 * settle and close quote details mocks
 * 
 * @export
 * @constant {Object} SettleAndCloseQuote
 */
 export const settleAndCloseQuote = {
		"accountNumber": `1657155046`,
		"currentBalance": 49018.14,
		"interestNotCapatalised": 0,
		"expectedInterestFees": 0,
		"settlementAmount": 0.1,
		"savingAccountsList": [
			{
				"accountNumber": `1295723953`,
				"accountType": `210`,
				"availableBalance": `5.69`,
				"savingsPermissionStatus": `DENIED`,
				"statusReasonList": [`HOLDS_ON_ACCOUNTS`]
			},
			{
				"accountNumber": `1123799863`,
				"accountType": `210`,
				"availableBalance": `0`,
				"savingsPermissionStatus": `DENIED`,
				"statusReasonList": [`ACCOUNT_TYPE_DISALLOWS_OPERATION`]
			},
			{
				"accountNumber": `1295723954`,
				"accountType": `200`,
				"availableBalance": `0.41`,
				"savingsPermissionStatus": `GRANTED`,
				"statusReasonList": null
			}
		]
	};

/**
 * Credit permissions details mocks
 * 
 * @export
 * @constant {Object} creditPermissions
 */
export const creditPermissions = 
{
    "permissionsResultsList": [
        {
            "operationIdentifier": `Settle`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        },
        {
            "operationIdentifier": `SettleAndClose`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        },
        {
            "operationIdentifier": `SendViewTransactionHistory`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        },
        {
            "operationIdentifier": `SendViewStatements`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        },
        {
            "operationIdentifier": `SettlementQuote`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        },
        {
            "operationIdentifier": `PaidUp`,
            "permissionResult": `Granted`,
            "declineReasons": `None`
        }
    ]
};

export const settlementQuoteDetails = [
	{
		quoteName: `Term Loan (32 months)`,
		accountNumber: `1234596`,
		loanAmount: 35000,
		instalment: 1234.91,
		settlementAmount: 18000,
		creditType: `Fixed credit`
	},
	{
		quoteName: `Term Loan (84 months)`,
		accountNumber: `456789`,
		loanAmount: 15000,
		instalment: 1498.91,
		settlementAmount: 7920,
		creditType: `Fixed credit`
	},
	{
		quoteName: `Credit card`,
		accountNumber: `147852`,
		loanAmount: 150000,
		instalment: 3982.91,
		settlementAmount: 31938.99,
		creditType: `Flexible credit`
	},
	{
		quoteName: `Access facility`,
		accountNumber: `852369`,
		loanAmount: 50000,
		instalment: 2479.01,
		settlementAmount: 7820,
		creditType: `Flexible credit`
	}
];

export const emailPaidUpLetter = {};