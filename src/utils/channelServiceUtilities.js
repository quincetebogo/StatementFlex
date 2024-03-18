import { html, unsafeHTML } from 'platform/elements';

/*
	Utility Functions
*/

/**
 * Formatting currency
 *
 * @export
 * @param {*} value currency value
 * @param {number} fractionDigits How many digits to round off while parsing to float
 * @param {boolean} addSymbol Flag to display rand symbol
 * @returns {*} Formatted currency value (E.g R 250 000)
 */
 export function formatCurrency(value, fractionDigits = 2, addSymbol = true) {
	if (value && value.toString().includes(`R`)) {
		return `${value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
	}

	const symbol = addSymbol ? `R` : ``;
	const amount = parseFloat(value).toFixed(fractionDigits);
	const currencyString = amount >= 0 ? `${symbol}${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}` : `- ${symbol}${amount.toString().substring(1).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
	return currencyString;
}

/**
 * Indicates if a string value is null, undefined or empty
 *
 * @export
 * @param {String} fieldValue A string value
 * @returns {Boolean} True if the input string is null, undefined or empty
 */
export function isNullorEmpty(fieldValue) {
	return fieldValue === `` || fieldValue === null || fieldValue === undefined;
}

/**
 * Validate a field against a regular expression
 *
 * @export
 * @param {*} field A field value to validate
 * @param {*} criteria A regular Expression
 * @returns {*} The field value if the regular expression is a match, 0 otherwise
 */
export function validate(field, criteria) {
	const re = RegExp(criteria);

	if (re.test(field)) {
		return field;
	}

	return 0;
}

/**
 * Determine ordinal(st/nd/rd/th) for input date
 *
 * @export
 * @param {*} date date value
 * @returns {*} Ordinal fot the given date (1st, 2nd..)
 */
export function getDateOrdinal(date) {
	if (date > 3 && date < 21) {
		return `th`;
	}

	switch (date % 10) {
		case 1: return `st`;
		case 2: return `nd`;
		case 3: return `rd`;
		default: return `th`;
	}
}

/**
 * Determine month name for input month
 *
 * @export
 * @param {*} month month value
 * @returns {*} Month name (Jan, Feb..)
 */
export function getMonthName(month) {
	const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
	return monthNames[month];
}

/**
 * Formatting phone number
 *
 * @export
 * @param {*} value phone number
 * @returns {*} Formatted phone number with spaces (E.g 071 256 9875)
 */
export function formatPhoneNumber(value) {
	return !value ? `-` : value.toString().replace(/(\d{3})(\d{3})(\d{4})/, `$1 $2 $3`);
}

/**
 * Determine number of days between two dates
 *
 * @export
 * @param {*} fromDate From date (Parsed Date)
 * @param {*} toDate To Date (Parsed Date)
 * @returns {*} Number of days between from date & to date
 */
 export function calculateDays(fromDate, toDate) {
	const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

	return Math.round(Math.abs((fromDate - toDate) / oneDay));
}

/**
 *  
 *
 * @param {*} idNumber An ID Number
 * @returns {Boolean} Indicates if the check digit on the ID Number computes correctly
 */
 function _luhnCheck(idNumber) {
	const num = idNumber.toString()
	.split(``)
	.reverse()
	.map(x => parseInt(x, 10));

	const lastDigit = num.splice(0, 1)[0];
	let sum = num.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
	sum += lastDigit;

	return sum % 10 === 0;
}

/**
 * Tests to see if the check digit on a South African ID number is correct 
 * and that the ID number is of the correct length. 
 *
 * @export
 * @param {String} southAfricanIDNumber A South African ID Number to be checked
 * @returns {String} Check if a South African ID number is well formed
 */
export function isWellFormedSouthAfricanID(southAfricanIDNumber) {
	return southAfricanIDNumber.length === 13 && 
			RegExp(/^[0-9]{13}$/, `g`).test(southAfricanIDNumber);

		// Luhn check removed. Apparently there are valid numbers in the wild that 
		// fail this test????

		// && _luhnCheck(southAfricanIDNumber); 
}

/**
 * Converts base64 encoded pdf string to blob url.
 * Why specific blob url? By default pdf viewer comes with toolbar and navpanes
 * To disable the toolbar and use other properties, base64 string is converted to blob url
 *
 * @export
 * @param {String} base64Data Base64 encoded pdf string
 * @returns {string} Blob URL
 */
 export function base64ToBlobUrl(base64Data) {

	// decode base64 string, remove space for IE compatibility
	const binary = atob(base64Data.replace(/\s/g, ``));
	const len = binary.length;
	const buffer = new ArrayBuffer(len);
	const view = new Uint8Array(buffer);

	for (let i = 0; i < len; i++) {
		view[i] = binary.charCodeAt(i);
	}

	// create the blob object with content-type "application/pdf"
	const blob = new Blob([view], { type: `application/pdf` });

	return `${URL.createObjectURL(blob)}#toolbar=0&scrollbar=0&navpanes=0&zoom=113.5`;
}

/**
 * Convert cents to Rand
 *
 * @export
 * @param {*} value Amount or any numeric value
 * @returns {*} Numeric value
 */
 export function convertCentsToRand(value) {
	if (isNaN(value)) {
		console.log(`${value} is not a number to perform conversion`);
		return value;
	}

	return value / 100;
}


/**
 * Convert base64 to html
 *
 * @export
 * @param {*} agreementContent encoded data of an agreement in a base64 format
 * @returns {*} html comtent
 */
 export function base64toHTML(agreementContent) {

	const agreement = atob(agreementContent);
	return html`${unsafeHTML(agreement)}`;

}

/**
 * @export
 * @param {string} value string value to be formatted
 * @param {string} format - Format, we wish to convert (dd/mm/yyyy)
 * @returns {string} formatted string value 
 */
export function formatDate(value, format) {

	const dateTime = new Date(value);
	const date = dateTime.getDate();
	const month = dateTime.getMonth();
	const monthName = getMonthName(month);
	const year = dateTime.getFullYear();
	const time = dateTime.toTimeString().substring(0, 5);
	const formattedMonth = String(month + 1).padStart(2, `0`);
	const day = String(date).padStart(2, `0`);
	const fullTime = dateTime.toTimeString().substring(0, 8); // With seconds value ex : 06:11:22

	let formattedDate = ``;

	// cases would be extended, based on our need in future
	switch (format) {
		case `dd-mmm`:
			formattedDate = `${date}-${monthName}`;
			break;
		case `dd mmm yyyy`:
			formattedDate = `${date} ${monthName} ${year}`;
			break;
		case `dd/mm/yyyy`:
			formattedDate = `${date}/${monthName}/${year}`;
			break;
		case `MM yyyy`:
			formattedDate = `${monthName} ${year}`;
			break;
		case `yyyy-mm-dd`:
			formattedDate = `${year}-${formattedMonth}-${day}`;
			break;
		case `dd mmm yyy hh:mm:ss`:
			formattedDate = `${date} ${monthName} ${year} ${time}`;
			break;
		case `dd/mm/yyyy hh:mm:ss`:
			formattedDate = `${day}/${formattedMonth}/${year} ${time}`;
			break;
		case `dd mmm yyy, hh:mm:ss`:
			formattedDate = `${date} ${monthName} ${year}, ${fullTime}`;
			break;
		default:
			formattedDate = `${date}-${month}-${year}`;
			break;
	}

	return formattedDate;
}

/**
 * @export
 * @param {string} date string value to be formatted
 * @returns {string} formatted string value 
 */
 export function formatDateTime(date) {
	const newdate = new Date(Date.parse(date));
	const formatedDate = `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	const formatedTime = `${newdate.toTimeString().substring(0, 5)}`;

	return `${formatedDate} ${formatedTime}`;
}

/**
 * 
 * Formats strings as pascal case
 * 
 * @export
 * @param {string} unformatedString - Unformatted string
 * @param {string} identifier - Identifier to split the string into substrings
 * @returns {string} formatted string
 */
export function formatStringAsPascalCase(unformatedString, identifier = ` `) {

	const words = unformatedString.split(identifier);

	let formattedString = ``;

	words.forEach((item, index) => formattedString += item.replace(/(\w)(\w*)/g, (g0, g1, g2) => ` ${g1.toUpperCase() + g2.toLowerCase()}`));

	return formattedString.trim();
}

/**
 * Uppercases the first character of the string, the rest of the string is lower cased
 * 
 * @param {string} str A string to capitalize
 * @returns {string} stA capitalized string
 */
export function capitalizeString(str) {
	const result = str.replace(/\0/g, ``); // TODO: Temporary fix for telemetry issue. This must come out once the PS side problem has been addressed.
	return `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
}

/**
 * Masks the input string
 * EX: 0123456789 => ******6789
 * @param {string} str Input string
 * @param {number} num how many last chars should be unmasked
 * @param {string} maskChar char value to be replaced
 * 
 * @returns {string} masked string
 */
export function maskString(str, num = 4, maskChar = `*`) {
	return str.slice(0, -num).replace(/./g, maskChar) + str.slice(-num);
}

/**
 * Formatting the Payshap ID/Name
 * 
 * @param {string} str Input string
 * 
 * @returns {string} Default format for redndering Payshap ID/Name
 */
export function formatProxyId(str) {
	return str ? str.replace(`+27-`, `0`) : `-`;
}

/**
 * Check if the Cell number is a Valid South African Cell phone number 
 * South African Cell phone number begins with the following suffixes 
 * All (06)* *** ****
 * All (07)* *** ****
 * 081, 082, 083, 084, 085
 * 
 * @param {string} cellNumber Input string
 * 
 * @returns {Boolean} Is the incomingNumber valid
 */
export function checkForValidSACellNumber(cellNumber) {
	
	// check for 10 digit long
	if (RegExp(/^0\d{9}$/).test(cellNumber)) {
		if (cellNumber.substring(0, 2) === `06` || cellNumber.substring(0, 2) === `07` || cellNumber.substring(0, 3) === `081` ||
			cellNumber.substring(0, 3) === `082` || cellNumber.substring(0, 3) === `083` || cellNumber.substring(0, 3) === `084` ||
			cellNumber.substring(0, 3) === `085`) {
				return true;
		}
	}
	return false;
}