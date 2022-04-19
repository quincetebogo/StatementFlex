/**
 * Calculate cover details for controls based on relationship from Insure product params
 *
 * @export
 * @param {*} relationship Current Relationship
 * @param {*} productParams Params for Funeral Product
 * @returns {*} cover details object
 */
export function getCoverDetailsByParams(relationship, productParams) {
	let product = productParams.products.find(product => {
		return product.parameters.id === "NBS"
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});
	let coverDetails = {}
	coverDetails.defaultCover = currentRole.ageRange[0].maxCoverAmount;
	coverDetails.maxCover = currentRole.ageRange[0].maxCoverAmount;
	coverDetails.minCover = currentRole.ageRange[0].minCoverAmount;
	coverDetails.ageMax = currentRole.ageRange[0].maxAge;
	coverDetails.ageMin = currentRole.ageRange[0].minAge;
	// currentRole.ageRange.forEach(range => {
	// 	coverDetails.defaultCover = range.maxCoverAmount;
	// 	coverDetails.maxCover = range.maxCoverAmount;
	// 	coverDetails.minCover = range.minCoverAmount;
	// 	coverDetails.ageMax = range.maxAge;
	// 	coverDetails.ageMin = range.minAge;
	// });
	// return coverDetails;
}

/**
 * Calculate max lives per relationship based on Insure product params
 *
 * @export
 * @param {*} relationship Current Relationship
 * @param {*} productParams Params for Funeral Product
 * @returns {*} cover details object
 */
export function livesPerPolicy(relationship, productParams) {
	let product = productParams.products.find(product => {
		return product.parameters.id === "NBS"
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});
	return currentRole.perPolicy;
}