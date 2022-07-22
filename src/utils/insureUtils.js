
/**
 * Calculate cover details metadata for ui controls based on relationship & Insure product params
 *
 * @export
 * @param {string} relationship Current Relationship
 * @param {number} [age] optional relationship age
 * @param {Object} productParams Params for Funeral Product
 * @param {boolean} [isExtendedFamily] optional flag to identify extended family
 * @returns {Object} cover details object
 */
export function refreshRelationshipCoverDetails(relationship, productParams, coverAmount = 0, maxAllowedCover = 100000, age = 0, isExtendedFamily = false, isPristine = false) {
	let coverDetails = {};
	coverDetails.isExtendedFamily = isExtendedFamily;
	if (isExtendedFamily == true) relationship = 'ExtendedFamily';

	let product = productParams.products.find(product => {
		return product.parameters.id === "NBS"
	});
	let currentRole = product.parameters.rolePlayers.roleList.role.find(role => {
		return role.relationshipTypeEnum == relationship
	});

	// Main Life
	if (relationship == "MainLife") {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;

		coverDetails.ageMessage = '';
		coverDetails.coverMessage = '';

		if (!isPristine) {
			// Invalid age
			if (age && age == 0 || age % 1 != 0 || Number.isNaN(age)) {
				let ageMessage = currentRole.ageMessage.replace("{0}", appliedAgeRange.minAge);
				ageMessage = currentRole.ageMessage.replace("{1}", appliedAgeRange.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && coverAmount > maxAllowedCover || parseInt(coverAmount) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace("{0:#,##0}", maxAllowedCover);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount) < parseInt(coverDetails.minCoverAmount)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace("{0:#,##0}", coverDetails.minCoverAmount);
			}
		}
	}

	// Spouse
	if (relationship == "Spouse") {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;

		coverDetails.ageMessage = '';
		coverDetails.coverMessage = '';

		if (!isPristine) {
			// Invalid age
			if (age && age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 != 0 || Number.isNaN(age)) {
				let ageMessage = currentRole.ageMessage.replace("{0}", coverDetails.minAge);
				ageMessage = ageMessage.replace("{1}", coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace("{0:#,##0}", coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount) < parseInt(coverDetails.minCoverAmount)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace("{0:#,##0}", coverDetails.minCoverAmount);
			}
		}
	}

	// Child (3 age ranges)
	if (relationship == "Child") {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		coverDetails.ageMessage = '';
		coverDetails.coverMessage = '';

		if (!isPristine) {
			if (age && age >= 0 && age <= 5) {
				coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
				coverDetails.minAge = currentRole.ageRange[0].minAge;
				coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
				coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			}
			else if (age && age >= 6 && age <= 13) {
				coverDetails.maxCoverAmount = currentRole.ageRange[1].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[1].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[1].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[1].coverAmountMinMessage;
			}
			else if (age && age >= 14 && age <= 25) {
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			} else {
				if (age && age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 != 0 || Number.isNaN(age)) {
					let ageMessage = currentRole.ageMessage.replace("{0}", coverDetails.minAge);
					ageMessage = ageMessage.replace("{1}", coverDetails.maxAge);
					coverDetails.ageMessage = ageMessage;
				}
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace("{0:#,##0}", coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount) < parseInt(coverDetails.minCoverAmount)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace("{0:#,##0}", coverDetails.minCoverAmount);
			}
		}
	}

	// Parent
	if (relationship == "Parent") {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;

		coverDetails.ageMessage = '';
		coverDetails.coverMessage = '';

		if (!isPristine) {
			// Invalid age
			if (age && age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 != 0 || Number.isNaN(age)) {
				let ageMessage = currentRole.ageMessage.replace("{0}", coverDetails.minAge);
				ageMessage = ageMessage.replace("{1}", coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace("{0:#,##0}", coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount) < parseInt(coverDetails.minCoverAmount)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace("{0:#,##0}", coverDetails.minCoverAmount);
			}
		}
	}

	// Extended Family (3 age ranges)
	if (relationship == "ExtendedFamily") {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		coverDetails.ageMessage = '';
		coverDetails.coverMessage = '';

		if (!isPristine) {
			if(age === '')
			{
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			}
			else if (age >= 0 && age <= 5) {
				coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
				coverDetails.minAge = currentRole.ageRange[0].minAge;
				coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
				coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			}
			else if (age >= 6 && age <= 13) {
				coverDetails.maxCoverAmount = currentRole.ageRange[1].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[1].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[1].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[1].coverAmountMinMessage;
			}
			else if (age >= 14 && age <= 25) {
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			} else {
				if (age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 != 0 || Number.isNaN(age)) {
					let ageMessage = currentRole.ageMessage.replace("{0}", coverDetails.minAge);
					ageMessage = ageMessage.replace("{1}", coverDetails.maxAge);
					coverDetails.ageMessage = ageMessage;
				}
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace("{0:#,##0}", coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount) < parseInt(coverDetails.minCoverAmount)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace("{0:#,##0}", coverDetails.minCoverAmount);
			}
		}
	}

	return coverDetails;
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