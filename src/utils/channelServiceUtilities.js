/*
		Utility functions for extracting UI control flags and other fields from the channel service contract
		
		TODO: REEVALUATE - MAYBE THESE ARE NOT VERY USEFUL - STILL THINKING ABOUT THEM. 
		THEY DO PROTECT AND DEFAULT SENSIBLY SHOULD THE CHANNEL SERVICE STRUCTURE NOT HAVE
		THE PROPERTIES/FIELDS WE ARE CHECKING

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


export function validate(field, criteria) {
	let re = RegExp(criteria);

	if (re.test(field)) {
		return field;
	}
	else {
		//throw `Invalid field (${field})`; //TODO: can probably throw an object
		return 0;
	}
}

export function getValue(fieldInfo) {
	if (fieldInfo === undefined) {
		console.log("fieldInfo in getValue is undefined");
		return '';
	}
	if (fieldInfo.hasOwnProperty('value')) {
		return !fieldInfo.value ? '' : fieldInfo.value;
	}
	console.log("fieldInfo in getValue does not have a value property");
	return '';
}

export function getPossibleValues(fieldInfo) {
	if (fieldInfo === undefined) {
		console.log("fieldInfo in getPossibleValues is undefined");
		return [];
	}
	if (fieldInfo.hasOwnProperty('possibleValues')) {
		return !fieldInfo.possibleValues ? [] : fieldInfo.possibleValues;
	}

	console.log("fieldInfo in getPossibleValues does not have a possibleValues property");
	return [];
}