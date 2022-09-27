/**
 * Claims list mock response
 *
 * @export
 * @constant Claims
 */
export const Claims = [
	{
		open: true,
		policyNumber: `FP23928328`,
		policyIndex: 0,
		accountNumber: `2142332`,
		lifeAssured: {
			firstName: `Buzz`,
			lastName: `Lightyear`
		},
		claimReference: `FLO-12312`,
		claimType: `Death`,
		claimStatus: `Active`,
		eventDate: `01/01/2022`,
		claimAmount: 100000,
		outstandingDocs: [
			{
				documentCode: `801_FuneralPlan`,
				documentName: `801 Funeral Plan`
			}
		]
	},
	{
		open: false,
		policyNumber: `FP2399484`,
		policyIndex: 1,
		accountNumber: `1233432`,
		lifeAssured: {
			firstName: `Mr Potato`,
			lastName: `Head`
		},
		claimReference: `FLO-88383`,
		claimType: `Death`,
		claimStatus: `Active`,
		eventDate: `01/01/2022`,
		claimAmount: 80000,
		outstandingDocs: [
			{
				documentCode: `801_FuneralPlan`,
				documentName: `801 Funeral Plan`
			}
		]
	}
];