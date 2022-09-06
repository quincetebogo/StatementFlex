export const SendCashLandingMocks = {
	"TransactionHistoryResponseListModel": [
		{
			"datetimeCreated": `2022-07-06 02:31`,
			"voucherNumber": `******1234`,
			"amount": 500.00,
			"sourceAccount": `52101789106`,
			"sourceSystem": `USSD`,
			"voucherStatus": `Redeemed`,
			"statusChange": [
				{
					"changeDateTime": `2022-07-06 02:31`,
					"eventAmount": 355.00,
					"remainingOrderAmount": 355.00,
					"action": `Creation`,
					"actionDescription": `-`
				}
			],
			"merchantStatusList": [
				{
					"merchantStatus": `Redeemed`,
					"merchantTimeStamp": `2022-07-06 02:31`,
					"merchantName": `Chekers`,
					"merchantId": `1212`,
					"merchantAmount": 200.00,
					"city": `Cape Town`,
					"country": `RSA`
				}
			]
		},
		{
			"datetimeCreated": `2022-02-12 12:41`,
			"voucherNumber": `******5678`,
			"amount": 50.00,
			"sourceAccount": `52101789105`,
			"sourceSystem": `APP`,
			"voucherStatus": `Redeemable`,
			"statusChange": [
				{
					"changeDateTime": `2022-02-12 12:41`,
					"eventAmount": 355.00,
					"remainingOrderAmount": 355.00,
					"action": `Redeemable`,
					"actionDescription": `-`
				},
				{
					"changeDateTime": `2022-02-14 02:01`,
					"eventAmount": 25.00,
					"remainingOrderAmount": 35.00,
					"action": `Redeemable`,
					"actionDescription": `-`
				}
			],
			"merchantStatusList": [
				{
					"merchantStatus": `Redeemed`,
					"merchantTimeStamp": `2022-07-06 02:31`,
					"merchantName": `Mlpinos`,
					"merchantId": `1213`,
					"merchantAmount": 20.00,
					"city": `Bangalore`,
					"country": `India`
				}
			]
		},
		{
			"datetimeCreated": `2022-05-22 04:53`,
			"voucherNumber": `******9012`,
			"amount": 154.00,
			"sourceAccount": `52101789107`,
			"sourceSystem": `APP`,
			"voucherStatus": `On hold`,
			"statusChange": [
				{
					"changeDateTime": `2022-05-22 04:53`,
					"eventAmount": 542.00,
					"remainingOrderAmount": 425.00,
					"action": `On hold`,
					"actionDescription": `-`
				},
				{
					"changeDateTime": `2022-05-24 00:41`,
					"eventAmount": 745.00,
					"remainingOrderAmount": 235.00,
					"action": `Redeemable`,
					"actionDescription": `-`
				}
			],
			"merchantStatusList": [
				{
					"merchantStatus": `Redeemed`,
					"merchantTimeStamp": `2022-07-06 02:31`,
					"merchantName": `Holly`,
					"merchantId": `1214`,
					"merchantAmount": 80.00,
					"city": `Johannesburg`,
					"country": `RSA`
				}
			]
		},
		{
			"datetimeCreated": `2022-01-02 01:03`,
			"voucherNumber": `******3456`,
			"amount": 159.00,
			"sourceAccount": `52101789108`,
			"sourceSystem": `USSD`,
			"voucherStatus": `Redemption Authorised`,
			"statusChange": [
				{
					"changeDateTime": `2022-01-02 01:03`,
					"eventAmount": 8912.00,
					"remainingOrderAmount": 8000.00,
					"action": `Redemption Authorised`,
					"actionDescription": `-`
				}
			],
			"merchantStatusList": [
				{
					"merchantStatus": `Redeemption Authorised`,
					"merchantTimeStamp": `2022-07-06 02:31`,
					"merchantName": `Molly`,
					"merchantId": `1215`,
					"merchantAmount": 800.00,
					"city": `Chennai`,
					"country": `India`
				}
			]
		},
		{
			"datetimeCreated": `2022-12-05 05:35`,
			"voucherNumber": `******5421`,
			"amount": 159.00,
			"sourceAccount": `80198710125`,
			"sourceSystem": `APP`,
			"voucherStatus": `Redemption Authorised`,
			"statusChange": [
				{
					"changeDateTime": `2022-01-02 01:03`,
					"eventAmount": 92.00,
					"remainingOrderAmount": 75.00,
					"action": `Redemption Authorised`,
					"actionDescription": `-`
				}
			],
			"merchantStatusList": [
				{
					"merchantStatus": `Redeemption Authorised`,
					"merchantTimeStamp": `2022-07-06 02:31`,
					"merchantName": `Striff`,
					"merchantId": `1218`,
					"merchantAmount": 410.00,
					"city": `Chennai`,
					"country": `India`
				}
			]
		}
	]
};