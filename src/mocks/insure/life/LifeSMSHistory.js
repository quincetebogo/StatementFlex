/**
 * Communication History mock response
 *
 * @export
 * @constant insureLifeSMSHistory
 */
export const insureLifeSMSHistory = {
	"smsHistory": [
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-10-05T15:47:52.807Z`,
			"eventType": `string`,
			"message": `Capitec: Use your ID number to access life policy CF123456 Benefit Statement: http://findyourstatementhere.com or visit a branch. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0825656565`,
			"commType": `SMS`,
			"receivedDate": `2023-10-05T15:47:52.807Z`,
			"status": `Delivered`
		},
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-11-16T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `Capitec: Thank you for choosing life cover with us! You can use our app to view or manage your policy. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0660083165`,
			"status": `Delivered`,
			"commType": `SMS`
		},
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-11-18T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `Capitec: You missed your life cover payment for policy LP00001393. Pay 100000 on our app, USSD or in branch. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0660083165`,
			"status": `Delivered`,
			"commType": `SMS`
		},
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-11-19T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `Capitec: You missed 2 payments for life policy LP00001393. Pay 100000 on app, USSD or in branch to keep cover. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0660083165`,
			"status": `Delivered`,
			"commType": `SMS`
		},
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-11-21T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `Capitec: You missed 3 payments on life policy LP00001393 and you no longer have cover. Take out a new policy on our app or in branch. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0660083165`,
			"status": `Delivered`,
			"commType": `SMS`
		},
		{
			"policyNumber": `LP00001393`,
			"sentAt": `2023-11-26T16:04:17.093+00:00`,
			"eventType": `Life_Onboarding`,
			"message": `Capitec: We received no payments for life policy LP00001393. Your policy was not activated. FSP46669. Licensed Insurer: Capitec Life. T&Cs`,
			"contactNumber": `0660083165`,
			"status": `Delivered`,
			"commType": `SMS`
		}
	]
};