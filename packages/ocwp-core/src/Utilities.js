import { DateTime } from 'luxon';

/**
 * Static reusable utility functions.
 */
export class Utilities {

	/**
	 * Retrieves the value from the object in a nested fashion. 
	 * Specify a path as e.g. "food.fruit.apple".
	 * 
	 * Click [here](https://hackernoon.com/accessing-nested-objects-in-javascript-f02f1bd6387f) for more info.
	 *
	 * @static    
	 * @param {Object} obj Object to retrieve value from.
	 * @param {String} path Path to nested value, e.g. "food.fruit.apple".
	 * @param {String} [separator="."] Separator to the path split on.
	 * 
	 * @returns {*} Value of the resolved path.
	 */
	static getValue(obj, path, separator) {

		try {

			separator = separator || `.`;

			return path.
				replace(`[`, separator).replace(`]`, ``).
				split(separator).
				reduce((accumulator, currentValue) => accumulator[currentValue], obj);

		} catch (err) {
			return undefined;
		}
	}


	/**
	 * Assigns the value to the object in a nested fashion.
	 * Specify a path as e.g. "food.fruit.apple".
	 *
	 * @static
	 * @param {Object} obj Object to set value on.
	 * @param {String} path Path to nested value, e.g. "food.fruit.apple".
	 * @param {*} value Value to set for the path.
	 * @param {String} [separator="."] Separator to the path split on.
	 *
	 * @returns {void}
	 */
	static setValue(obj, path, value, separator) {

		separator = separator || `.`;

		const list = path.split(separator);
		const key = list.pop();
		const pointer = list.reduce((accumulator, currentValue) => accumulator[currentValue], obj);

		pointer[key] = value;

		return obj;
	}

	/**
	 * Check if the current value is non-null or non-undefined
	 * @param {Number|String|Object} value - Value to check 
	 * @returns {Boolean} - Boolean for if the value is non-null or non-undefined
	 */
	static hasValue(value) {
		return !(value === null || value === undefined);
	}

	/**
	 * Group by method for an array.
	 *
	 * @static
	 * @param {Array} arr Array to group.
	 * @param {String|Function} target Grouping target:
	 *  - ```String``` as property to group on, e.g. "userId"
	 *  - ```Function```as [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Syntax) callback function.
	 * @returns {Object} Contains a property as key for each group.
	 */
	static groupBy(arr, target) {

		let result = [];

		if (typeof target === `string`) {
			result = arr.reduce((accumulator, currentValue) => {
				accumulator[Utilities.getValue(currentValue, target)] = [...accumulator[Utilities.getValue(currentValue, target)] || [], currentValue];
				return accumulator;
			}, {});
		}

		if (typeof target === `function`) {
			result = arr.reduce(target, {});
		}

		return result;
	}

	/**
	 * Parse an [ISO](https://www.iso.org/iso-8601-date-and-time-format.html) date string and format accordingly.
	 *
	 * @static
	 * @param {String} isoDate ISO date string to parse.
	 * @param {String} format Format to apply to parsed date, refer to the [Luxon formatting docs](https://moment.github.io/luxon/docs/manual/formatting.html).
	 * @returns {String} Parsed, formatted date.
	 */
	static parseAndFormatDate(isoDate, format) {

		if (!isoDate) {
			throw new Error(`"isoDate" parameter cannot be null.`);
		}

		if (typeof isoDate !== `string`) {
			throw new TypeError(`"isoDate" parameter value must be string.`);
		}

		if (!format) {
			throw new Error(`"format" parameter cannot be null.`);
		}

		if (typeof format !== `string`) {
			throw new TypeError(`"format" parameter value must be string.`);
		}

		return DateTime.fromISO(isoDate).toFormat(format);
	}

	/**
	 * Determines if the given value is a [function](https://developer.mozilla.org/en-US/docs/Glossary/Function).
	 *
	 * @static
	 * @param {*} value Value to inspect.
	 * @returns {Boolean} True if the value is a valid function.
	 */
	static isFunction(value) {
		return value && typeof value === `function`;
	}

	/**
	 * Determines if a given value is an Object.
	 *
	 * @static
	 * @param {*} value Value to inspect.
	 * @returns {Boolean} True if the value is an object.
	 */
	static isObject(value) {
		return value && Object.getPrototypeOf(value).isPrototypeOf(Object);
	}

	/**
	 * 
	 * @param {*} obj Value to inspect
	 * @returns {Boolean} True if the value is an empty.
	 */
	static isEmptyObject(obj) {
		return obj &&
			Object.keys(obj).length === 0 && obj.constructor === Object;
	}

	/**
	 * 
	 * @param {*} s Value to inspect
	 * @returns {Boolean} True if the value is a string.
	 */
	static isString(s) {
		return typeof s === `string` || s instanceof String;
	}

	/**
	 * Determines if a given value is a Promise.
	 *
	 * @static
	 * @param {*} value Value to inspect.
	 * @returns {Boolean} True if the value is a Promise.
	 */
	static isPromise(value) {
		return value && Object.prototype.toString.call(value) === `[object Promise]`;
	}

	/**
	 * Returns a formatted string with easier to read values for file sizes
	 *
	 * @static
	 * @param {Number} bytes Size passed in.
	 * @param {Number} decimals Number of decimals to return. Default to 2
	 * @returns {String} The value with size formatted
	 */
	static formatBytes(bytes, decimals = 2) {

		if (!bytes || typeof bytes !== `number` || !(bytes > 0)) {
			return `0 Bytes`;
		}

		const k = 1024;
		const dm = decimals > 0 ? decimals : 0;
		const sizes = [`Bytes`, `KB`, `MB`, `GB`, `TB`, `PB`, `EB`, `ZB`, `YB`];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	/**
	 * Creates and returns a deep copy of an Object or Array.
	 *
	 * @static
	 * @param {*} inObject Object or Array to clone.
	 * 
	 * @returns {*} Copied object or Array.
	 */
	static deepCopy(inObject) {

		let outObject = null;
		let value = null;
		let key = null;

		if (typeof inObject !== `object` || inObject === null) {
			return inObject; // Return the value if inObject is not an object
		}

		// Create an array or object to hold the values
		outObject = Array.isArray(inObject) ? [] : {};

		for (key in inObject) {
			if (Object.prototype.hasOwnProperty.call(inObject, key)) {
				value = inObject[key];

				// Recursively (deep) copy for nested objects, including arrays
				outObject[key] = Utilities.deepCopy(value);
			}
		}

		return outObject;
	}

	/**
	 * Determines if a given string is a Url.
	 *
	 * @static
	 * @param {*} str Item to check
	 * @returns {Boolean} True if the parameter is a Url.
	 */
	static isURL(str) {
		const pattern = new RegExp(`^((ft|htt)ps?:\\/\\/)?` + // protocol
			`((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|` + // domain name and extension
			`((\\d{1,3}\\.){3}\\d{1,3}))` + // OR ip (v4) address
			`(\\:\\d+)?` + // port
			`(\\/[-a-z\\d%@_.~+&:]*)*` + // path
			`(\\?[;&a-z\\d%@_.,~+&:=-]*)?` + // query string
			`(\\#[-a-z\\d_]*)?$`, `i`); // fragment locator
		return pattern.test(str);
	}
}