// Credit landing page mocks for the positive case.

export const creditOverview = {
	"loanAccountSummaryList": [
		{
			"productTypeDescription": `56 month term loan`,
			"productTypeCode": `56month`,
			"accountNumber": `9873493849`,
			"currentBalance": 85000,
			"creditLimit": 100000,
			"remainingMonths": 43,
			"repayAmount": 4592.10,
			"accountStatusDescription": `Active`,
			"accountStatusCode": `Open`,
			"openDate": `2022-01-06T06:51:16.483Z`,
			"lastPaymentDate": `2022-01-06T06:51:16.483Z`
		},
		{
			"productTypeDescription": `24 month term loan`,
			"productTypeCode": `56month`,
			"accountNumber": `9873493849`,
			"currentBalance": 24000,
			"creditLimit": 35000,
			"remainingMonths": 12,
			"repayAmount": 2938.01,
			"accountStatusDescription": `Active`,
			"accountStatusCode": `Open`,
			"openDate": `2022-01-06T06:51:16.483Z`,
			"lastPaymentDate": `2022-01-06T06:51:16.483Z`
		}
	],
	"accessFacilitySummaryList": [
		{
			"productTypeDescription": `Access facility`,
			"productTypeCode": `AccessFacility`,
			"accountNumber": `1633823409`,
			"currentBalance": -10000,
			"availableCredit": 20000,
			"creditLimit": 30000,
			"nextRepayment": 789.01,
			"accountStatusDescription": `Active`,
			"accountStatusCode": `Open`,
			"openDate": `2022-01-06T06:51:16.483Z`,
			"lastPaymentDate": `2022-01-06T06:51:16.483Z`
		}
	],
	"creditCardSummaryList": [
		{
			"productTypeDescription": `Credit card`,
			"productTypeCode": `Credit`,
			"accountNumber": `1633823410`,
			"currentBalance": 10634,
			"availableCredit": 20000,
			"creditLimit": 35000,
			"nextRepayment": 1564.76,
			"accountStatusDescription": `In arrears`,
			"accountStatusCode": `Arrears`,
			"openDate": `2022-01-06T06:51:16.483Z`,
			"lastPaymentDate": `2022-01-06T06:51:16.483Z`
		}
	],
	"budgetAccountsSummary": {
		"totalBudgetBalance": 35000,
		"totalBudgetInstallmentAmount": 1534.76
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