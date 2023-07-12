/*
	Ported from client profile channel service
	https://git.int.capinet/cec/horizon/cs-clientprofile/-/blob/develop/Source/Capitec.BSC.Horizon.ValidationLibrary/CheckAccountNumberValid.cs
*/
export const validateAccountNumber = (accountNumber) => {
	let isValidAccountNumber = false; 

	const accountChars = Array.from(accountNumber).map(char => char.charCodeAt(0) - 48);
	
	let sum = accountChars[0];

	let i = 1;

	for (let multiplier = 9; i <= accountChars.length - 2; i++) {
		sum += accountChars[i] * multiplier;
		multiplier--;
	}

	const remainder = sum % 11;
	let checkDigit = 11 - remainder;

	if (checkDigit === 10 || checkDigit === 11) {
		checkDigit = 0;
	}

	if (checkDigit === accountChars[accountChars.length - 1]) {
		isValidAccountNumber = true;
	}
	return isValidAccountNumber;

};