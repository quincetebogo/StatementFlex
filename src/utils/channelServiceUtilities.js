/*
		Utility functions for extracting UI control flags and other fields from the channel service contract

		TODO: PROBABLY SHOULD MAKE A CLASS

		TODO: Handle fields for validation (required etc.)

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


export function isDisabled(fieldInfo) {
	if (fieldInfo == undefined) {
		console.log("fieldInfo in isDisabled is undefined");
		return false;
	}

	if (fieldInfo.hasOwnProperty('enabled')) {
		return !fieldInfo.enabled;
	}

	console.log("fieldInfo in isDisabled does not have an enabled property");
	return false;
}

export function isHidden(fieldInfo) {
	if (fieldInfo === undefined) {
		console.log("fieldInfo in isHidden is undefined");
		return false;
	}

	if (fieldInfo.hasOwnProperty('visible')) {
		return !fieldInfo.visible;
	}

	console.log("fieldInfo in isHidden does not have a visible property");
	return false;
}

export function getTabIndex(fieldInfo) {
	if (fieldInfo === undefined) {
		console.log("fieldInfo in getTabIndex is undefined");
		return -1;
	}

	if (fieldInfo.hasOwnProperty('tabIndex')) {
		return fieldInfo.tabIndex;
	}

	console.log("fieldInfo in getTabIndex does not have a tabIndex property");
	return -1;
}
