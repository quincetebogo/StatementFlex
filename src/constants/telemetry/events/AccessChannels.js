/**
 * The event names to use when logging Access Channels telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} AccessChannelsEvents
 */

 export const AccessChannelsEvents = {
	FULFILL_NEED: `call.fulfill-need`,

	// Access Channels
	ACCESS_CHANNELS: `call.fulfill-need.access-channels`,
	ACCESS_CHANNELS_INTERNET_BANKING: `call.fulfill-need.access-channels.internet-banking`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN: `call.fulfill-need.access-channels.internet-banking.suspend-security-token`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_BACK: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.back`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_NEXT: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.next`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_CANCEL: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.cancel`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_CONFIRM: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.confirm`,
	ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN: `call.fulfill-need.access-channels.internet-banking.reset-security-token`,
	ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN_CANCEL: `call.fulfill-need.access-channels.internet-banking.reset-security-token.cancel`
};