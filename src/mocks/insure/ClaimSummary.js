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
	claimType: `Death Claim`,
	claimStatus: `Claim Being Assessed`,
	causeOfDeath: `Natural Causes`,
	dateOfDeath: `01/01/2022`,
	dateOfClaim: `01/01/2022`,
	claimAmount: 100000,
	outstandingDocs: [
		{
			documentCode: `801_FuneralPlan`,
			documentName: `801 Funeral Plan`
		},
		{
			documentCode: `ID document of nominated beneficiary`,
			documentName: `ID document of nominated beneficiary`
		},
		{
			documentCode: `Bank statement of nominated beneficiary`,
			documentName: `Bank statement of nominated beneficiary`
		}
	]
};