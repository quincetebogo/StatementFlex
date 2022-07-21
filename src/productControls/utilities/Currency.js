/**
 * Formatting currency
 *
 * @export
 * @param {*} value currency value
 * @param {number} fractionDigits How many digits to round off while parsing to float
 * @returns {*} Formatted currency value (E.g R 250 000)
 */
 export function formatCurrency(value, fractionDigits = 2) {
	if (value && value.toString().includes(`R`)) {
		return `${value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
	}

	const amount = parseFloat(value).toFixed(fractionDigits);
	const currencyString = amount >= 0 ? `R${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}` : `- R${amount.toString().substring(1).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
	return currencyString;
}

/**
 * Formatting currency to be displayed on the platform's 
 * capitec-text-field component with type as currency.
 *
 * @export
 * @param {*} value currency value
 * @param {number} fractionDigits How many digits to round off while parsing to float
 * @returns {*} Formatted currency value (E.g R 250 000.00)
 */
export function formatTextFieldCurrency(value, fractionDigits = 2) {
	const amount = parseFloat(value).toFixed(fractionDigits);
	return `${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
}

/**
 * Remove formating over currency
 *
 * @export
 * @param {*} value Formatted currency value (E.g R 250 000)
 * @returns {*} currency value (E.g 250000)
 */
 export function deformatCurrency(value) {
	let splitValues = value.split(`R`);

	if(splitValues.length > 1) {
		return parseFloat(splitValues[1].replaceAll(` `, ``));
	}

	return parseFloat(splitValues[0].replaceAll(` `, ``));
}