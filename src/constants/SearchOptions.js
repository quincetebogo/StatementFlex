import { AUTH_IDENTIFICATION_METHODS } from 'app/constants/common';

/**
 * Search Options
 *  
 * 
 * @readonly
 * @enum {object} SEARCH_OPTIONS
 */
 export const SEARCH_OPTIONS = [
	 {
		key: `0`, 
		value: `ID/Passport number`,
		identificationType: AUTH_IDENTIFICATION_METHODS.SAID_PASSPORT
	},
	{
		key: `1`, 
		value: `Foreign passport number`,
		identificationType: AUTH_IDENTIFICATION_METHODS.SAID_PASSPORT
	},
	{
		key: `2`, 
		value: `Account number`,
		identificationType: AUTH_IDENTIFICATION_METHODS.ACCOUNT_NUMBER
	},
	{
		key: `4`, 
		value: `Verified Cellphone Number`,
		identificationType: AUTH_IDENTIFICATION_METHODS.CELLPHONE_NUMBER
	}
];