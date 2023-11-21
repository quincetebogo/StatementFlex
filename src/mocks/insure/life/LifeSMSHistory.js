/**
 * Communication History mock response
 *
 * @export
 * @constant insureLifeSMSHistory
 */
export const insureLifeSMSHistory = {
	"smsHistory": [
		{
			"policyNumber": `LP00001234`,
			"sentAt": `2023-10-05T15:47:52.807Z`,
			"eventType": `string`,
			"message": `Ayo, pay your premium or else!`,
			"contactNumber": `0825656565`,
			"commType": `SMS`,
			"receivedDate": `2023-10-05T15:47:52.807Z`,
			"status": `Delivered`
		},
		{
			"policyNumber": `LP00006458`,
			"sentAt": `2023-11-16T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `{"cifNumber":"377693332","templateName":"Life_Onboarding","templateParameters":[{"name":"CIF_Check_Digit","value":"377693332"},{"name":"MSISDN/Mobile","value":"0660083165"},{"name":"EMAIL","value":"test@test.com"},{"name":"TITLE","value":"Miss"},{"name":"FIRST_NAME","value":"DEV"},{"name":"LAST_NAME","value":"SURNAME"},{"name":"Policy_Number","value":"LP00006458"},{"name":"Premium_Amount","value":0.0},{"name":"Total_Arrears_Amount","value":0.0},{"name":"Event_Date","value":"2023-11-16"}]}`,
			"contactNumber": `0660083165`,
			"commType": `SMS`
		}
	]
};