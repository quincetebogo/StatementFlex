/**
 * Calculate cover details metadata for ui controls based on relationship from Insure product params
 *
 * @export
 * @param {string} relationship Current Relationship
 * @param {Object} productParams Params for Funeral Product
 * @param {number} [age] optional relationship age
 * @param {boolean} [isExtendedFamily] optional flag to identify extended family
 * @returns {Object} cover details object
 */
export function getCoverDetailsByParams(relationship, productParams, age, isExtendedFamily) {
	let appliedAgeRange = {};
	appliedAgeRange.isExtendedFamily = isExtendedFamily;
	if (isExtendedFamily == true) relationship = 'ExtendedFamily';

	let product = productParams.products.find(product => {
		return product.parameters.id === "NBS"
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});

	if (age) {
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[0].maxAge;
			appliedAgeRange.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		} else {
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
			const withinRange = currentRole.ageRange.filter(function(life) {
				return age >= life.minAge && age <= life.maxAge
			});
			if (!withinRange) {
				appliedAgeRange = currentRole.ageRange[0];
			}
			appliedAgeRange.defaultCover = withinRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = withinRange[0].maxCoverAmount;
			appliedAgeRange.minCover = withinRange[0].minCoverAmount;
			appliedAgeRange.maxCoverMessage = withinRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = withinRange[0].coverAmountMinMessage;
		}
	} else {
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[0].maxAge;
			appliedAgeRange.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		} else {
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
			appliedAgeRange.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		}
	}
	appliedAgeRange.ageMessage = currentRole.ageMessage;
	return appliedAgeRange;
}


/**
 * Find perPolicy limit for supplied relationship
 *
 * @export
 * @param {string} relationship Current Relationship
 * @param {Object} productParams Params for Funeral Product
 * @returns {Number} per policy limit
 */
export function livesPerPolicy(relationship, productParams) {
	let product = productParams.products.find(product => {
		return product.parameters.id === `NBS`
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});
	return currentRole.perPolicy;
}