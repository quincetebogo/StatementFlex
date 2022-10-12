import { PRODUCT_ID } from 'app/constants/InsureCommon';
import { TODAY_DATE } from 'app/constants/InsureTransactionHistory';
import { getMonthName } from 'app/utils/channelServiceUtilities';

/**
 * Calculate cover details metadata for ui controls based on relationship & Insure product params
 * @param {string} relationship relationship
 * @param {Object} productParams Insure params
 * @param {number} coverAmount currentCover 
 * @param {number} maxAllowedCover maxAllowedCover
 * @param {number} age age
 * @param {boolean} isExtendedFamily isExtendedFamily
 * @param {boolean} isPristine isPristine
 * @returns {object} coverDetails
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
			} else if (age >= 14 && age <= 25) {
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
 * Extract person age from id number
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
 * Extract person gender from id number 
 * @param {string} southAfricanIDNumber southAfricanIDNumber
 * @returns {string} gender 
 */
export function getGenderFromIDNumber(southAfricanIDNumber) {
	const genderSubStr = parseInt(southAfricanIDNumber.substring(6, 10), 16);
	return genderSubStr >= 5000 ? `Male` : `Female`;
}

/**
 * Check the Policy rules for the Life based on the ruleType
 * 
 * @param {String} ruleType ruleType
 * @param {String} productParams productParams
 * @param {String} field field
 * @param {String} relationship relationship
 * @returns {String} string
 */
export function checkPolicyRules(ruleType, productParams, field, relationship) {

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
 * returns date in format dd/mm/yyyy
 * 
 * @param {*} value value
 * @returns {*} farmatted date
 */
export function dateFormat(value) {

	const dateTime = new Date(value);
	const date = dateTime.getDate();
	const month = dateTime.getMonth();
	const year = dateTime.getFullYear();
	let formattedDate = ``;

	if (year === 0 || isNaN(year)) {
		return formattedDate;
	}

	formattedDate = formattedDate = `${`0${date}`.slice(-2)}/${`0${month + 1}`.slice(-2)}/${year}`;

	return formattedDate;
}

/**
 * Get Predefined date ranges
 * @return {null} null
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
 * format the give date
 * @param {date} date - date to be formatted 
 * @return {null} null
 */
function _formatDateToddmmyyyy(date) {
	const newdate = new Date(Date.parse(date));
	return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
}

/**
 * Get selected date range
 * @param {date} startDate The start date of date range.
 * @param {date} endDate The end date of date range.
 * @returns {string} - fromdate to todate
 */
export function _getDateRange(startDate, endDate) {
	const fromDate = !startDate ? `dd mm yyyy` : _formatDateToddmmyyyy(startDate);
	const toDate = !endDate ? `dd mm yyyy` : _formatDateToddmmyyyy(endDate);

	const preDefinedRanges = getPredefinedDateRanges();
	const selectedValue = preDefinedRanges.filter(item => _formatDateToddmmyyyy(item.value.startDate) === fromDate && _formatDateToddmmyyyy(item.value.endDate) === toDate);

	if (selectedValue.length > 0) {
		return selectedValue[0].text;
	}

	return `${fromDate} - ${toDate}`;
}