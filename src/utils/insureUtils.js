import { LIFE_POCKET_TYPES, LIFE_POLICY_STATUSES, PRODUCT_ID } from 'app/constants/InsureCommon';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';

export const TODAY_DATE = new Date();

const REGEX_EMAIL_PATTERN = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;


export const LIFE_COVER_ERROR_MESSAGES = {
	NO_COVER_ALLOCATED: `No cover allocated to any pocket`,
	MINIMUM_COVER_NOT_REACHED: `Please allocate a minimum of R100 000 across benefit payout options`,
	POCKET_MINIMUM: `Minimum pocket allocation is R1000`,
	POCKET_MINIMUM_EDUCATION: `Minimum pocket allocation is R50000`,
	COVER_MAXIMUM: `Combined pocket allocation exceeds maximum cover amount`,
	BENEFICIARY_MINIMUM: `Minimum beneficiary allocation is R50 000`,
	MAX_BENEFICIARIES: `Maximum of 2 beneficiaries allowed for pocket`,
	EDUCATION_MAX_BENEFICIARIES: `Maximum of 10 beneficiaries allowed for education fund`,
	MAIN_LIFE_ID_MATCH: `Main life and beneficiary cannot be the same person`,
	MAIN_LIFE_CELL_MATCH: `Main life and beneficiary cellphone number cannot be the same`,
	INCREASE_COVER_LESS_CURRENT_COVER: `Your new cover can not be less than your original cover of {0}`
};

/**
 * Calculate cover details metadata for ui controls based on relationship & Insure product params
 * @param {string} relationship relationship
 * @param {Object} productParams Insure params
 * @param {number} coverAmount currentCover 
 * @param {number} maxAllowedCover maxAllowedCover
 * @param {number} age age
 * @param {boolean} isExtendedFamily isExtendedFamily
 * @param {boolean} isPristine isPristine
 * @returns {object} coverDetails meta data & rules for specified relationship
 */
export function refreshRelationshipCoverDetails(relationship, productParams, coverAmount = 0, maxAllowedCover = 100000, age = 0, isExtendedFamily = false, isPristine = false) {
	const coverDetails = { isExtendedFamily: isExtendedFamily };
	if (isExtendedFamily === true) {
		relationship = `ExtendedFamily`;
	}
	const product = productParams.products.find(item => item.parameters.id === PRODUCT_ID);
	const currentRole = product.parameters.rolePlayers.roleList.role.find(role => role.relationshipTypeEnum === relationship);

	// Main Life
	if (relationship === `MainLife`) {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		coverDetails.ageMessage = ``;
		coverDetails.coverMessage = ``;

		if (!isPristine) {
			// Invalid age
			if (age && (age === 0 || age % 1 !== 0 || Number.isNaN(age))) {
				let ageMessage = currentRole.ageMessage.replace(`{0}`, appliedAgeRange.minAge);
				ageMessage = currentRole.ageMessage.replace(`{1}`, appliedAgeRange.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && (coverAmount > maxAllowedCover || parseInt(coverAmount, 10) > coverDetails.maxCoverAmount)) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace(`{0:#,##0}`, maxAllowedCover);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount, 10) < parseInt(coverDetails.minCoverAmount, 10)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace(`{0:#,##0}`, coverDetails.minCoverAmount);
			}
		}
	} else if (relationship === `Spouse`) {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;

		coverDetails.ageMessage = ``;
		coverDetails.coverMessage = ``;

		if (!isPristine) {
			// Invalid age
			if (age && (age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 !== 0 || Number.isNaN(age))) {
				let ageMessage = currentRole.ageMessage.replace(`{0}`, coverDetails.minAge);
				ageMessage = ageMessage.replace(`{1}`, coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount, 10) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace(`{0:#,##0}`, coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount, 10) < parseInt(coverDetails.minCoverAmount, 10)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace(`{0:#,##0}`, coverDetails.minCoverAmount);
			}
		}
	} else if (relationship === `Child`) {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		coverDetails.ageMessage = ``;
		coverDetails.coverMessage = ``;

		if (!isPristine) {
			if (age && age >= 0 && age <= 5) {
				coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
				coverDetails.minAge = currentRole.ageRange[0].minAge;
				coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
				coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			} else if (age && age >= 6 && age <= 13) {
				coverDetails.maxCoverAmount = currentRole.ageRange[1].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[1].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[1].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[1].coverAmountMinMessage;
			} else if (age && age >= 14 && age <= 25) {
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			} else if (age && (age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 !== 0 || Number.isNaN(age))) {
				let ageMessage = currentRole.ageMessage.replace(`{0}`, coverDetails.minAge);
				ageMessage = ageMessage.replace(`{1}`, coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;

				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;

				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;

			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount, 10) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace(`{0:#,##0}`, coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount, 10) < parseInt(coverDetails.minCoverAmount, 10)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace(`{0:#,##0}`, coverDetails.minCoverAmount);
			}
		}
	} else if (relationship === `Parent`) {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[0].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;

		coverDetails.ageMessage = ``;
		coverDetails.coverMessage = ``;

		if (!isPristine) {
			// Invalid age
			if (age && (age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 !== 0 || Number.isNaN(age))) {
				let ageMessage = currentRole.ageMessage.replace(`{0}`, coverDetails.minAge);
				ageMessage = ageMessage.replace(`{1}`, coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount, 10) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace(`{0:#,##0}`, coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount, 10) < parseInt(coverDetails.minCoverAmount, 10)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace(`{0:#,##0}`, coverDetails.minCoverAmount);
			}
		}
	} else {
		coverDetails.defaultCover = 0;
		coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
		coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
		coverDetails.minAge = currentRole.ageRange[0].minAge;
		coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
		coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
		coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
		coverDetails.ageMessage = ``;
		coverDetails.coverMessage = ``;

		if (!isPristine) {
			if (age === ``) {
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			} else if (age >= 0 && age <= 5) {
				coverDetails.maxCoverAmount = currentRole.ageRange[0].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[0].minCoverAmount;
				coverDetails.minAge = currentRole.ageRange[0].minAge;
				coverDetails.maxAge = currentRole.ageRange[currentRole.ageRange.length - 1].maxAge;
				coverDetails.maxCoverMessage = currentRole.ageRange[0].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[0].coverAmountMinMessage;
			} else if (age >= 6 && age <= 13) {
				coverDetails.maxCoverAmount = currentRole.ageRange[1].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[1].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[1].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[1].coverAmountMinMessage;
			} else if (age >= 14 && age <= 85) {
				coverDetails.maxCoverAmount = currentRole.ageRange[2].maxCoverAmount;
				coverDetails.minCoverAmount = currentRole.ageRange[2].minCoverAmount;
				coverDetails.maxCoverMessage = currentRole.ageRange[2].coverAmountMessage;
				coverDetails.minCoverMessage = currentRole.ageRange[2].coverAmountMinMessage;
			} else if (age < coverDetails.minAge || age > coverDetails.maxAge || age % 1 !== 0 || Number.isNaN(age)) {
				let ageMessage = currentRole.ageMessage.replace(`{0}`, coverDetails.minAge);
				ageMessage = ageMessage.replace(`{1}`, coverDetails.maxAge);
				coverDetails.ageMessage = ageMessage;
			}

			// Over max cover
			if (coverAmount && parseInt(coverAmount, 10) > coverDetails.maxCoverAmount) {
				coverDetails.coverMessage = coverDetails.maxCoverMessage.replace(`{0:#,##0}`, coverDetails.maxCoverAmount);
			}

			// Under min cover
			if (coverAmount && parseInt(coverAmount, 10) < parseInt(coverDetails.minCoverAmount, 10)) {
				coverDetails.coverMessage = coverDetails.minCoverMessage.replace(`{0:#,##0}`, coverDetails.minCoverAmount);
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
	const product = productParams.products.find(item => item.parameters.id === PRODUCT_ID);
	const currentRole = product.parameters.rolePlayers.roleList.role.find(role => role.relationshipTypeEnum === relationship);
	return currentRole.perPolicy;
}

/**
 * Check the Policy rules for the Life based on the ruleType
 *
 * @export
 * @param {String} ruleType ruleType
 * @param {String} productParams productParams
 * @param {String} field field
 * @param {String} relationship relationship
 * @returns {Boolean} string
 */
export function policyAllowsEditing(ruleType, productParams, field, relationship) {
	if (relationship === `Unknown` || relationship === `MainLife` || relationship === `Spouse` || relationship === `Parent` || relationship === `Child`) {
		const product = productParams.products.find(products => products.parameters.id === PRODUCT_ID);
		const currentRuleType = product.parameters.rulesParams.find(rule => rule.ruleType === ruleType);
		const relationshipRule = currentRuleType.peopleRulesList.find(role => role.type === relationship);
		return relationshipRule[field];
	}

	const product = productParams.products.find(products => products.parameters.id === PRODUCT_ID);
	const currentRuleType = product.parameters.rulesParams.find(rule => rule.ruleType === ruleType);
	const relationshipRule = currentRuleType.peopleRulesList.find(role => role.type === `ExtendedFamily`);
	return relationshipRule[field];
}


/**
 * format the give date to RSA format
 *  
 * @export
 * @param {date} date Date to be formatted 
 * @return {string} formatted date
 */
function _formatDateToDDMMYYYY(date) {
	const newdate = new Date(Date.parse(date));
	return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
}

/**
 * format the give date to RSA format with slashes and leading zeros
 * 
 * @export
 * @param {*} value value
 * @returns {*} formatted date
 */
export function formatDateToInsure(value) {
	let formattedDate = ``;
	const dateTime = new Date(value);
	const date = dateTime.getDate();
	const month = dateTime.getMonth();
	const year = dateTime.getFullYear();

	if (year === 0 || isNaN(year)) {
		return formattedDate;
	}
	formattedDate = formattedDate = `${`0${date}`.slice(-2)}/${`0${month + 1}`.slice(-2)}/${year}`;
	return formattedDate;
}

/**
 * Get Predefined date ranges
 * 
 * @export
 * @return {array} valid date ranges for filters
*/
export function getPredefinedDateRanges() {
	const last7day = new Date(TODAY_DATE);
	const last30day = new Date(TODAY_DATE);
	const last60day = new Date(TODAY_DATE);
	const last90day = new Date(TODAY_DATE);

	last7day.setDate(TODAY_DATE.getDate() - 7);
	last30day.setDate(TODAY_DATE.getDate() - 30);
	last60day.setDate(TODAY_DATE.getDate() - 60);
	last90day.setDate(TODAY_DATE.getDate() - 90);

	return [
		{ text: `Last 7 days`, value: { startDate: last7day.toISOString(), endDate: TODAY_DATE.toISOString() } },
		{ text: `Last 30 days`, value: { startDate: last30day.toISOString(), endDate: TODAY_DATE.toISOString() } },
		{ text: `Last 60 days`, value: { startDate: last60day.toISOString(), endDate: TODAY_DATE.toISOString() } },
		{ text: `Last 90 days`, value: { startDate: last90day.toISOString(), endDate: TODAY_DATE.toISOString() } }
	];
}

/**
 * Get selected date range display value
 * 
 * @export
 * @param {date} startDate The start date of date range.
 * @param {date} endDate The end date of date range.
 * @returns {string} - fromdate to todate
 */
export function getDateRangeDisplayValue(startDate, endDate) {
	const fromDate = !startDate ? `dd mm yyyy` : _formatDateToDDMMYYYY(startDate);
	const toDate = !endDate ? `dd mm yyyy` : _formatDateToDDMMYYYY(endDate);

	const preDefinedRanges = getPredefinedDateRanges();
	const selectedValue = preDefinedRanges.filter(item => _formatDateToDDMMYYYY(item.value.startDate) === fromDate && _formatDateToDDMMYYYY(item.value.endDate) === toDate);

	if (selectedValue.length > 0) {
		return selectedValue[0].text;
	}

	return `${fromDate} - ${toDate}`;
}

/**
 * Get age in years from date of birth
 * 
 * @export
 * @param {date} dateOfBirth live date of birth 
 * @returns {number} Age in years
 */
export function getAgeFromDob(dateOfBirth) {
	const birthdate = new Date(dateOfBirth);
	const ageDifMs = Date.now() - birthdate.getTime();
	const ageDate = new Date(ageDifMs);
	return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
}

/**
 * Get person gender from id number 
 * 
 * @export
 * @param {string} southAfricanIDNumber southAfricanIDNumber
 * @returns {string} gender derived id
 */
export function getGenderFromIDNumber(southAfricanIDNumber) {
	const genderSubStr = parseInt(southAfricanIDNumber.substring(6, 10), 10);
	return genderSubStr >= 5000 ? `Male` : `Female`;
}

/**
 * Get person age from id number
 * 
 * Additional check for client over the age of 100
 * @export
 * @param {String} southAfricanIDNumber southAfricanIDNumber
 * @returns {Number} age
 */
export function getAgeFromIDNumber(southAfricanIDNumber) {
	const birthdate = new Date(southAfricanIDNumber.substring(0, 2), southAfricanIDNumber.substring(2, 4) - 1, southAfricanIDNumber.substring(4, 6));

	if (birthdate.getFullYear() <= new Date().getFullYear() - 100) {
		birthdate.setFullYear(birthdate.getFullYear() + 100);
	}

	const ageDifMs = Date.now() - birthdate.getTime();
	const ageDate = new Date(ageDifMs);
	return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Format Horizon currency string to Insure cover amount standard
 * 
 * @export
 * @param {String} currencyString Horizon formatted currency string
 * @returns {string} cover amount with decimals
 */
export function formatCurrencyInsureCoverAmount(currencyString) {
	return currencyString.split(`.`)[0];
}

/**
 * Validate both email address values against a regex pattern and return a validity boolean
 * 
 * @export
 * @param {String} email Email address
 * @param {String} confirmEmail Confirm email address
 * @returns {boolean} valid flag
 */
export function validateEmailAddressCombo(email, confirmEmail) {
	if (isNullorEmpty(email)) {
		return false;
	}
	if (email !== confirmEmail) {
		return false;
	}
	if (!isNullorEmpty(email) && !RegExp(REGEX_EMAIL_PATTERN, `g`).test(email)) {
		return false;
	}
	return true;
}


/** LIFE COVER UTILS */


/**
 * Determine the pocket color class based on pocket type
 * 
 * @param {String} pocketType current pocket type
 * @returns {String} css class
 */
export function pocketBadgeColorClass(pocketType) {
	if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
		return `monthly-label-colour`;
	} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
		return `education-label-colour`;
	} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
		return `once-off-label-colour`;
	}
}

/**
 * Determine the pocket color class based on pocket type
 * 
 * @param {String} pocketType current pocket type
 * @returns {String} display label
 */
export function pocketBadgeLabel(pocketType) {
	if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
		return `Monthly Income`;
	} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
		return `Children's Needs`;
	} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
		return `Lump Sum`;
	}
}

/**
 * Determine the pocket icon class based on pocket type
 * 
 * @param {String} pocketType current pocket
 * @returns {String} icon path
 */
export function pocketBadgeIcon(pocketType) {
	if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
		return `/insure_education_pocket`;
	}
	if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
		return `/insure_monthly_pocket`;
	}
	if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
		return `/insure_once_off_pocket`;
	}
}

/**
 * determine the status class based on status
 * @param {String} status status
 * @return {String} string
 * 
 */
export function determineLifeStatusColour(status) {
	let cssClass = `inactive-status`;

	if (status === LIFE_POLICY_STATUSES.IN_FORCE) {
		cssClass = `active-status`;
	} 
	if (status === LIFE_POLICY_STATUSES.PENDING_IN_FORCE) {
		cssClass = `active-status`;
	}
	if (status === LIFE_POLICY_STATUSES.LAPSE_PENDING) {
		cssClass = `active-status`;
	}

	return cssClass; 
}

/** 
 * Determine Active life policies
 * @param {Array} lifePolicies lifePolicies
 * @return {Object} object
 */
export function determineActiveLifePolicies(lifePolicies) {
	if (isNullorEmpty(lifePolicies)) {
		return null;
	}
	return lifePolicies.find(policy => policy.policyStatusEnum === LIFE_POLICY_STATUSES.IN_FORCE || policy.policyStatusEnum === LIFE_POLICY_STATUSES.PENDING_IN_FORCE || policy.policyStatusEnum === LIFE_POLICY_STATUSES.LAPSE_PENDING);
}

/**
 * Determine inactive life policies
 * @param {Array} lifePolicies lifePolicies
 * @return {Object} object
 */
export function determineInactiveLifePolicies(lifePolicies) {
	if (isNullorEmpty(lifePolicies)) {
		return null;
	}
	return lifePolicies.filter(policy => policy.policyStatusEnum === LIFE_POLICY_STATUSES.CANCELLED || policy.policyStatusEnum === LIFE_POLICY_STATUSES.LAPSED || policy.policyStatusEnum === LIFE_POLICY_STATUSES.NOT_TAKEN_UP || policy.policyStatusEnum === LIFE_POLICY_STATUSES.OUT_OF_FORCE || policy.policyStatusEnum === LIFE_POLICY_STATUSES.COOL_OFF);
}

/**
 * determine date of birth from id number 
 * @param {string} idNumber idNumber
 * @returns {String} birthDateString
 */
export function getDobFromIDNumber(idNumber) {
		const birthdate = new Date(idNumber.substring(0, 2), idNumber.substring(2, 4) - 1, idNumber.substring(4, 6));

		if (birthdate.getFullYear() <= new Date().getFullYear() - 100) {
			birthdate.setFullYear(birthdate.getFullYear() + 100);
		}

		const month = birthdate.getMonth() + 1;
		const day = birthdate.getDate();
		const birthDateString = `${birthdate.getFullYear()}-${month <= 9 ? `0${month}` : month}-${day <= 9 ? `0${day}` : day}T00:00:00+00:00`;

		return birthDateString;
}