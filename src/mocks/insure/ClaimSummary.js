/**
 * Claims Summary mock response
 *
 * @export
 * @constant ClaimSummary
 */
export const ClaimSummary =
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
};