/**
 * Calculate cover details for controls based on relationship from Insure product params
 *
 * @export
 * @param {*} relationship Current Relationship
 * @param {*} productParams Params for Funeral Product
 * @returns {*} cover details object
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
		console.log("Age supplied");
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[0].maxAge;
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
		}
	} else {
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[0].maxAge;
		} else {
			// Has more than one and NO age given
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
		}
	}
	return appliedAgeRange;
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