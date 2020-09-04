/*
		Utility functions for extracting UI control flags and other fields from the channel service contract
		
		THEY DO PROTECT AND DEFAULT SENSIBLY SHOULD THE CHANNEL SERVICE STRUCTURE NOT HAVE
		THE PROPERTIES/FIELDS WE ARE CHECKING

		All these functions assume that field info follows the following basic structure

		{
			enabled 
			visible
			tabindex
			...
			other properties
			...
		}
*/

/**
 *
 *
 * @export
 * @param {*} fieldInfo
 * @returns
 */
export function isDisabled(fieldInfo) {
	if (fieldInfo == undefined) {
		// console.log("fieldInfo in isDisabled is undefined");
		return false;
	}

	if (fieldInfo.hasOwnProperty('enabled')) {
		return !fieldInfo.enabled;
	}

	// console.log("fieldInfo in isDisabled does not have an enabled property");
	return false;
}

/**
 *
 *
 * @export
 * @param {*} fieldInfo
 * @returns
 */
export function isHidden(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in isHidden is undefined");
		return false;
	}

	if (fieldInfo.hasOwnProperty('visible')) {
		return !fieldInfo.visible;
	}

	// console.log("fieldInfo in isHidden does not have a visible property");
	return false;
}

/**
 *
 *
 * @export
 * @param {*} fieldInfo
 * @returns
 */
export function getTabIndex(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getTabIndex is undefined");
		return -1;
	}

	if (fieldInfo.hasOwnProperty('tabIndex')) {
		return fieldInfo.tabIndex;
	}

	// console.log("fieldInfo in getTabIndex does not have a tabIndex property");
	return -1;
}

/**
 *
 *
 * @export
 * @param {*} field
 * @param {*} criteria
 * @returns
 */
export function validate(field, criteria) {
	const re = RegExp(criteria);

	if (re.test(field)) {
		return field;
	}

	return 0;
}

/**
 *
 *
 * @export
 * @param {*} fieldInfo
 * @returns
 */
export function getValue(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getValue is undefined");
		return ``;
	}
	if (fieldInfo.hasOwnProperty('value')) {
		return !fieldInfo.value ? `` : fieldInfo.value;
	}
	// console.log("fieldInfo in getValue does not have a value property");
	return ``;
}

/**
 *
 *
 * @export
 * @param {*} fieldInfo
 * @returns
 */
export function getPossibleValues(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getPossibleValues is undefined");
		return [];
	}

	if (fieldInfo.hasOwnProperty('possibleValues')) {
		return !fieldInfo.possibleValues ? [] : fieldInfo.possibleValues;
	}

	// console.log("fieldInfo in getPossibleValues does not have a possibleValues property");
	return [];
}

/**
 *
 *
 * @export
 * @param {*} fieldValue
 * @returns
 */
export function isNullorEmpty(fieldValue) {
	return fieldValue === `` || fieldValue === null || fieldValue === undefined;
}

/**
 *
 *
 * @export
 * @param {*} ivrOption
 * @returns
 */
export function tempFixIVROptionValue(ivrOption) {
	if (ivrOption === undefined) {
		return;
	}

	if (Object.prototype.hasOwnProperty.call(ivrOption, `value`)) {
		if (ivrOption.value === `Stop Card`) {
			ivrOption.value = `StopCard`;
		}

		if (ivrOption.value === `Insure`) {
			ivrOption.value = `Insure`;
		}
	}
}

/**
 * This function must be stripped out. It populates the provided ivrOption with a list of possible values.
 * This is only required until we have a channel service contract in place providing this functionality
 * @export
 * @param {*} ivrOption An ivrOptiun object containing an array of possible values
 * @returns {undefined}
 */
export function tempFixIVROption(ivrOption) {
	if (ivrOption === undefined) {
		return;
	}

	if (Object.prototype.hasOwnProperty.call(ivrOption, `possibleValues`)) {
		ivrOption.possibleValues = [
			{
				key: `StopCard`, value: `Stop Card`
			},
			{
				key: `Insure`, value: `Insure`
			}
		];
	}
}