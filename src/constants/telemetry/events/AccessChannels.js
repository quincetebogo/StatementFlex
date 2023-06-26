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
	ACCESS_CHANNELS_TILE_APP: `call.fulfill-need.access-channels.app`,
	ACCESS_CHANNELS_TILE_INTERNET_BANKING: `call.fulfill-need.access-channels.internet-banking`,
	ACCESS_CHANNELS_TILE_USSD: `call.fulfill-need.access-channels.ussd`,
	ACCESS_CHANNELS_TILE_NOTIFICATIONS: `call.fulfill-need.access-channels.notifications`,

	// App profile details
	ACCESS_CHANNELS: `call.fulfill-need.access-channels`,
	ACCESS_CHANNELS_APP: `call.fulfill-need.access-channels.app`,
	ACCESS_CHANNELS_APP_SUSPEND: `call.fulfill-need.access-channels.app.suspend`,
	ACCESS_CHANNELS_APP_SUSPEND_CANCEL: `call.fulfill-need.access-channels.app.suspend.cancel`,
	ACCESS_CHANNELS_APP_SUSPEND_CONFIRM: `call.fulfill-need.access-channels.app.suspend.confirm`,
	ACCESS_CHANNELS_APP_SUSPEND_OUTCOME: `call.fulfill-need.access-channels.app.suspend.outcome`,
	ACCESS_CHANNELS_APP_UNSUSPEND: `call.fulfill-need.access-channels.app.unsuspend`,

	// Internet banking details
	ACCESS_CHANNELS_INTERNET_BANKING: `call.fulfill-need.access-channels.internet-banking`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN: `call.fulfill-need.access-channels.internet-banking.suspend-security-token`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_NEXT: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.next`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_BACK: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.back`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_CANCEL: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.cancel`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_CONFIRM: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.confirm`,
	ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_OUTCOME: `call.fulfill-need.access-channels.internet-banking.suspend-security-token.outcome`,
	ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN: `call.fulfill-need.access-channels.internet-banking.reset-security-token`,
	ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN_CANCEL: `call.fulfill-need.access-channels.internet-banking.reset-security-token.cancel`,
	ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN_OUTCOME: `call.fulfill-need.access-channels.internet-banking.reset-security-token.outcome`,

	// USSD
	ACCESS_CHANNELS_USSD: `call.fulfill-need.access-channels.ussd`,
	ACCESS_CHANNELS_USSD_UNBLOCK_SIM: `call.fulfill-need.access-channels.ussd.unblock-sim`,
	ACCESS_CHANNELS_USSD_UNBLOCK_SIM_OUTCOME: `call.fulfill-need.access-channels.ussd.unblock-sim.outcome`,
	ACCESS_CHANNELS_USSD_CANCEL_USSD: `call.fulfill-need.access-channels.ussd.cancel-ussd`,
	ACCESS_CHANNELS_USSD_CANCEL_USSD_CANCEL: `call.fulfill-need.access-channels.ussd.cancel-ussd.cancel`,
	ACCESS_CHANNELS_USSD_CANCEL_USSD_CONFIRM: `call.fulfill-need.access-channels.ussd.cancel-ussd.confirm`,
	ACCESS_CHANNELS_USSD_CANCEL_USSD_OUTCOME: `call.fulfill-need.access-channels.ussd.cancel-ussd.outcome`,
	ACCESS_CHANNELS_USSD_ACTIVATE_FULL_USSD_MENU: `call.fulfill-need.access-channels.ussd.activate-full-ussd-menu`,
	ACCESS_CHANNELS_USSD_ACTIVATE_FULL_USSD_MENU_OUTCOME: `call.fulfill-need.access-channels.ussd.activate-full-ussd-menu.outcome`,

	// Notifications
	ACCESS_CHANNELS_NOTIFICATIONS: `call.fulfill-need.access-channels.notifications`,
	ACCESS_CHANNELS_NOTIFICATIONS_UPDATE: `call.fulfill-need.access-channels.notifications.update`,
	ACCESS_CHANNELS_NOTIFICATIONS_UPDATE_CONFIRM: `call.fulfill-need.access-channels.notifications.update.confirm`

};