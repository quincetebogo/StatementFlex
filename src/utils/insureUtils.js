/**
 * Calculate cover details for controls based on relationship from Insure product params
 *
 * @export
 * @param {*} relationship Current Relationship
 * @param {*} productParams Params for Funeral Product
 * @returns {*} cover details object
 */
export function getCoverDetailsByParams(relationship, productParams, age) {
	console.log("getCoverDetailsByParams");
	let product = productParams.products.find(product => {
		return product.parameters.id === "NBS"
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});

	let coverDetails = {}
	let appliedAgeRange = {};

	// Age supplied, use that to find range
	if (age) {
		console.log("Age supplied");
		if (currentRole.ageRange.length == 1) {
			console.log("Only one rule set for: ", relationship);

			appliedAgeRange = currentRole.ageRange[0];
		} else {
			console.log("More than one rule set for: ", relationship);
			// Has more than one and AND age given
			appliedAgeRange.ageMin = currentRole.ageRange[0].ageMin;
			appliedAgeRange.ageMax = currentRole.ageRange[currentRole.ageRange.length - 1].ageMax;

			console.log('Life Age: ' + age);
			// console.log('Life');
			// Calc
			const withinRange = currentRole.ageRange.filter(life => (age >= life.ageMin && life.ageMax <= life.addMax));
			console.log('Element: ' + age);
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
		}
	} else {
		console.log("Age not supplied");
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange = currentRole.ageRange[0];
		} else {
			// Has more than one and NO age given
			appliedAgeRange.defaultCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.maxCover = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCover = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.ageMin = currentRole.ageRange[0].ageMin;
			appliedAgeRange.ageMax = currentRole.ageRange[currentRole.ageRange.length - 1].ageMax;
		}
	}

	// Map Back
	coverDetails.defaultCover = appliedAgeRange.maxCoverAmount;
	coverDetails.maxCover = appliedAgeRange.maxCoverAmount;
	coverDetails.minCover = appliedAgeRange.minCoverAmount;
	coverDetails.ageMax = appliedAgeRange.maxAge;
	coverDetails.ageMin = appliedAgeRange.minAge;
	return coverDetails;
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