/**
 * Arrears mock response
 *
 * @export
 * @constant InsureArrears
 */
export const InsureArrears = {
		"policies": [
		  {
			"contractReference": `CF09847678`,
			"arrears": [
			  {
				"amount": 100,
				"dueDate": `2022-12-20T13:12:47.626Z`,
				"objectID": `string`
			  },
			  {
				"amount": 100,
				"dueDate": `2023-02-20T13:12:47.626Z`,
				"objectID": `string`
			  },
			  {
				"amount": 100,
				"dueDate": `2023-01-20T13:12:47.626Z`,
				"objectID": `string`
			  }
			]
		  },
		  {
			"contractReference": `FP00002188`,
			"arrears": [
			  {
				"amount": 200,
				"dueDate": `2023-02-20T13:12:47.626Z`,
				"objectID": `string`
			  }
			]
		  }
		],
		"payableAccounts": [
		  {
			"accountName": `SAVINGS ACCOUNT`,
			"branchCode": `470010`,
			"accountNumber": `2009939669`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 120,
			"currentBalance": 250
		  },
		  {
			"accountName": `SAVINGS PLAN`,
			"branchCode": `470010`,
			"accountNumber": `2009939660`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 200,
			"currentBalance": 250
		  }
		]
};