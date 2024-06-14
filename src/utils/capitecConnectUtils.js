export function formatDate(inputDate, options) {
	options = options || { day: `2-digit`, month: `short`, year: `numeric` };
	const date = new Date(inputDate);
	return date.toLocaleDateString(`en-za`, options);
}

export function getTimeFromDate(dateString) {
	const date = new Date(dateString);
	const hours = date.getHours().toString().padStart(2, `0`);
	const minutes = date.getMinutes().toString().padStart(2, `0`);
	const seconds = date.getSeconds().toString().padStart(2, `0`);
	return `${hours}:${minutes}:${seconds}`;
}

export function formatDateAndTime(dateString) {
	return formatDate(dateString) + ` ` + getTimeFromDate(dateString);
}

export function formatTime(inputDate, options) {
	options = options || { hour: '2-digit', minute: '2-digit', second: '2-digit' };
	const date = new Date(inputDate);
	return date.toLocaleTimeString(options);
}

export function compareDates(dateStr1, dateStr2) {
	const date1 = new Date(dateStr1);
	const date2 = new Date(dateStr2);

	var result = null;
	
	switch (true) {
		case date1 < date2:
			result = -1;
			break;
		case date1 > date2:
			result = 1;
			break;
		default:
			result = 0;
			break;
	}

	return result;
}

export function getDateInPast(days) {
	const today = new Date();
	const pastDate = new Date(today);
	pastDate.setDate(today.getDate() - days);
	const year = pastDate.getFullYear();
	const month = String(pastDate.getMonth() + 1).padStart(2, `0`);
	const day = String(pastDate.getDate()).padStart(2, `0`);
	return `${year}-${month}-${day}`;
}

export function incrementDate(dateString, daysToAdd) {
	// Split the date string into year, month, and day
	const [year, month, day] = dateString.split('-').map(Number);

	// Create a Date object
	const date = new Date(year, month - 1, day); // month is 0-indexed

	// Increment the date by the specified number of days
	date.setDate(date.getDate() + daysToAdd);

	// Get the updated year, month, and day
	const newYear = date.getFullYear();
	const newMonth = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
	const newDay = String(date.getDate()).padStart(2, '0');

	// Return the new date in the same format
	return `${newYear}-${newMonth}-${newDay}`;
}

export function sortObjectsByDateDescending(array, dateKey) {
	return array.sort((a, b) => {
		const dateA = new Date(a[dateKey]);
		const dateB = new Date(b[dateKey]);
		return dateB - dateA;
	});
}

export function formatCellphoneNumber(cellphoneNumber, withoutSpaces = false) {
	cellphoneNumber = cellphoneNumber.replace(/\s/g, ``); // first remove the spaces

	if (cellphoneNumber.startsWith('0')) {
		// Replace the '0' with '27' using the replace method
		cellphoneNumber = cellphoneNumber.replace(/^0/, '27');
	}

	if (cellphoneNumber.length === 11) {
		cellphoneNumber = `${cellphoneNumber.substr(0, 2)} ${cellphoneNumber.substr(2, 2)} ${cellphoneNumber.substr(4, 3)} ${cellphoneNumber.substr(7, 4)}`;
	} else {
		// Handle invalid input here if necessary
		cellphoneNumber = ``;
	}

	if (withoutSpaces) {
		cellphoneNumber = cellphoneNumber.replace(/\s/g, ``);
	}

	return cellphoneNumber;
}

export function isArray(obj) {
	return Array.isArray(obj);
}

export function isJson(obj) {
	return obj !== null && typeof obj === `object` && !obj.length; // json object have no length
}

export function isUndefined(obj) {
	return typeof obj === `undefined`;
}

export function toTitleCase(inputString) {
	return inputString.replace(/\w\S*/g, function (text) {
		return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
	});
}

export function formatAmount(amount) {
	if (typeof amount !== 'number') {
		return amount;
	}

	return `R` + amount.toFixed(2);
}
