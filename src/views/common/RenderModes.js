/** 
 * Centralised render mode flags used across Horizon Views
*/

export const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0, // The main display of any landing page
	END_CALL: 1, // Display the End Call Session Dialog
	CONFIRM_CALLER: 1, // Display the Confirn Caller Dialog
	STOP_CARD_SEARCH: 2, // Display the Stop Card Search Dialog
	SEARCH_CALLER: 3, // Display the general Horizon Search Dialog
	START_AGENT: 4, // Call Waiting Landing Page: Show dialog indicating the Desktop Agent is down
	SELECT_ASSIGN_REASON: 5,
	ASSIGN: 6,
	VERIFY_NOW: 7,
	ALERT_MODAL: 8,
	DEBI_CHECK_PAGE: 9,
	DEBI_CHECK_APPROVE: 10,
	DEBI_CHECK_DECLINE: 11,
	DEBI_CHECK_VIEW_INFO: 12,
	UPDATE_CARD_LIMITS: 13,
	PROOF_OF_ACCOUNT: 14,
	TAP_TO_PAY: 15,
	SEARCH_OTHER_NEED: 16,
	STATEMENTS: 17
});