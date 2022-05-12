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
			appliedAgeRange.defaultCover = 0;
			appliedAgeRange.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
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
			if (withinRange.length == 0) {
				appliedAgeRange = currentRole.ageRange[0];
			} else {
				appliedAgeRange.defaultCover = 0;
				appliedAgeRange.maxCoverAmount = withinRange[0].maxCoverAmount;
				appliedAgeRange.minCoverAmount = withinRange[0].minCoverAmount;
				appliedAgeRange.maxCoverMessage = withinRange[0].coverAmountMessage;
				appliedAgeRange.minCoverMessage = withinRange[0].coverAmountMinMessage;
			}
		}
	} else {
		if (currentRole.ageRange.length == 1) {
			appliedAgeRange.defaultCover = 0;
			appliedAgeRange.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[0].maxAge;
			appliedAgeRange.coverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			appliedAgeRange.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		} else {
			appliedAgeRange.defaultCover = 0;
			appliedAgeRange.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
			appliedAgeRange.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
			appliedAgeRange.minAge = currentRole.ageRange[0].minAge;
			appliedAgeRange.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
			appliedAgeRange.coverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			appliedAgeRange.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
			appliedAgeRange.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		}
	}

	// Format age message
	currentRole.ageMessage = currentRole.ageMessage.replace("{0}", appliedAgeRange.minAge);
	currentRole.ageMessage = currentRole.ageMessage.replace("{1}", appliedAgeRange.maxAge);
	appliedAgeRange.coverMessage = '';
	appliedAgeRange.genderMessage = '';
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

/**
 * Extract person age from id number
 * @param {String} southAfricanIDNumber
 * @returns {Number} age
 */
export function getAgeFromIDNumber(southAfricanIDNumber) {
	let birthdate = new Date(southAfricanIDNumber.substring(0, 2), southAfricanIDNumber.substring(2, 4) - 1, southAfricanIDNumber.substring(4, 6));
	let ageDifMs = Date.now() - birthdate.getTime();
	let ageDate = new Date(ageDifMs);
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Extract person gender from id number 
 * @param {string} southAfricanIDNumber
 * @returns {string} gender 
 */
export function getGenderFromIDNumber(southAfricanIDNumber) {
	let genderSubStr = parseInt(southAfricanIDNumber.substring(6, 10));
	return genderSubStr >= 5000 ? 'Male' : 'Female'
}