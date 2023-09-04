/**
 * Strack mapping to classify a need
 * Key - corresponds to the transaction, we gonna do for the client
 * value - Key configured at CS to classify the need
 * 
 * @readonly
 * @enum {Object} STRACK_MAPPING
 */
 export const STRACK_MAPPING = Object.freeze({
	
	// Quick transactions
	"debi-check": `DEBI_CHECK`,
	"debi-check-approve": `DEBI_CHECK_APPROVE`,
	"debi-check-decline": `DEBI_CHECK_DECLINE`,
	"debi-check-viewInfo": `DEBI_CHECK`,
	"stop-card": `STOP_CARD`,
	"update-card-limits": `UPDATE_CARD_LIMITS`,
	"tap-to-pay": `TAP_TO_PAY`,
	"statements": `STATEMENTS`,
	"tax-certificate": `TAX_CERTIFICATE`,
	"proof-of-account": `PROOF_OF_ACCOUNT`,
	"settlement-quote": `SETTLEMENT_QUOTE`,
	"paid-up-accounts": `PAID_UP_LETTER`,
	"send-cash": `SEND_CASH_ENQUIRY`,
	"send-cash-place-hold": `SEND_CASH_PLACE_HOLD`,

	// Savings account
	// "transaction-history": `TRANSACTION_HISTORY`,
	"statements-transact": `STATEMENTS`,

	// Savings plan
	"statements-save": `SAVINGS_PLAN_STATEMENTS`,
	"tax-certificate-save": `SAVINGS_PLAN_TAX_CERTIFICATE`,
	"flexible-save-transaction-history": `FLEXIBLE_SAVE_TRANSACTION_HISTORY`,
	"fixed-save-transaction-history": `FIXED_SAVE_TRANSACTION_HISTORY`,
	"full-ftsp-unlock": `FIXED_SAVE_FULL_UNLOCK`,
	"partial-ftsp-unlock": `FIXED_SAVE_PARTIAL_UNLOCK`,

	// LBB
	"transaction-history-lbb": `TRANSACTION_HISTORY_LBB`,
	"statements-lbb": `STATEMENTS_LBB`,
	"automatic-savings-lbb": `AUTOMATIC_SAVINGS_LBB`,

	// Product info screens
	"savings-product-info": `PRODUCT_ENQUIRY_SAVINGS`,
	"savings-plan-info": `PRODUCT_ENQUIRY_SAVINGS_PLAN`,
	"insure-product-info": `PRODUCT_ENQUIRY_INSURE`,
	"credit-product-info": `PRODUCT_ENQUIRY_CREDIT`,
	"live-better-product-info": `PRODUCT_ENQUIRY_LIVE_BETTER`,

	// End call reason mapping
	"telephony-disconnected": `TELEPHONY_DISCONNECTED`,
	"language-transfer": `LANGUAGE_TRANSFER`,
	"call-transfer": `CALL_TRANSFER`,
	"general-product-enquiry": `GENERAL_PRODUCT_ENQUIRY`,
	"failed-verification": `FAILED_VERIFICATION`,
	"abandoned-verification": `TELEPHONY_NO_SHOW`,

	// Unkonwn references/ dynamic implementations
	"credit-card-statements": `STATEMENTS_CC`,
	"telephony-hung-up": `TELEPHONY_HUNG_UP`,
	"telephony-call-back": `TELEPHONY_CALL_BACK`,
	"telephony-bad-connection": `TELEPHONY_BAD_CONNECTION`,
	"telephony-no-reply": `TELEPHONY_NO_REPLY`,
	"credit-card-balance": `CREDIT_CARD_BALANCE`,
	"savings-account-balance": `SAVINGS_BALANCE`,
	"mobile-banking": `MOBILE_BANKING_BALANCE`,
	"transaction-history-request": `SAVINGS_BALANCE_TRANSACTIONS`,
	"pending-transaction-information": `SAVINGS_BLANCE_PENDING`,

	// Access channels mapping
	"view-app": `VIEW_APP_DETAILS`,
	"suspend-app": `SUSPEND_APP`,
	"view-internetBanking": `VIEW_INTERNET_BANKING_DETAILS`,
	"suspend-token": `SUSPEND_SECURITY_TOKEN`,
	"reset-security-token": `RESET_SECURITY_TOKEN_CLOCK`,
	"view-ussd": `VIEW_USSD_DETAILS`,
	"cancel-ussd": `CANCEL_USSD`,
	"unblock-sim": `UNBLOCK_SIM`,
	"active-full-menu-ussd": `ACTIVE_REDUCED_MENU_USSD`,
	"view-notification": `NOTIFICATIONS`,

	// Credit
	"transaction-history-credit-card": `VIEW_TRANSACTION_HISTORY_CREDIT_CARD`, //
	"statements-credit-card": `SEND_STATEMENTS_CREDIT_CARD`,
	"settlement-quote-credit-card": `SETTLEMENT_QUOTE_CREDIT_CARD`,
	"settle-close-credit-card": `SETTLE_CLOSE_CREDIT_CARD`,
	"view-budgets-credit-card": `VIEW_BUDGET_ACCOUNT_INFO`,
	"paid-up-letter-credit-card": `PAID_UP_LETTER_CREDITCARD`,
	"pay-budget-credit-card": `PAY_BUDGET_ACCOUNTS`,

	"transaction-history-access-facility": `TRANSACTION_HISTORY_ACCESS_FACILITY`,
	"statements-access-facility": `SEND_STATEMENTS_ACCESS_FACILITY`,
	"settlement-quote-access-facility": `SETTLEMENT_QUOTE_ACCESS_FACILITY`,
	"paid-up-letter-access-facility": `PAID_UP_LETTER_ACCESS_FACILITY`,
	"settle-close-access-facility": `SETTLE_CLOSE_ACCESS_FACILITY`,

	"transaction-history-term-loan": `TRANSACTION_HISTORY_TERM_LOAN`,
	"statements-term-loan": `SEND_STATEMENTS_TERM_LOAN`,
	"settlement-quote-term-loan": `SETTLEMENT_QUOTE_TERM_LOAN`,
	"paid-up-letter-term-loan": `PAID_UP_LETTER_TERM_LOAN`,
	"settle-close-term-loan": `SETTLE_CLOSE_TERM_LOAN`,

	// Landing page Balance/Account enquiry
	"savings-account": `SAVINGS_ACCOUNT`,
	"savings-plan-account-enquiry": `SAVINGS_PLAN_ACCOUNT_ENQUIRY`,
	"credit-account-enquiry": `CREDIT_ACCOUNT_ENQUIRY`,
	"lbb-account-enquiry": `ACCOUNT_INFORMATION_LBB`,
	

	// Update client language preference
	"update-language-preference": `UPDATE_LANGUAGE_PREFERENCE`,

	// PayShap
	"payshap": `PAYSHAP_ENQUIRY`,
	"set-capitec-as-default-bank": `SET_CAPITEC_AS_DEFAULT_BANK`,
	"remove-capitec-as-default-bank": `REMOVE_CAPITEC_AS_DEFAULT_BANK`,
	"payshap-pop": `PAYSHAP_POP`,

	// Insure 
	"funeral-update": `FUNERAL_UPDATE`,
	"funeral-arrears-payment": `FUNERAL_ARREARS_PAYMENT`,
	"funeral-cancellation": `FUNERAL_CANCELLATION`,
	"funeral-estimate": `FUNERAL_ESTIMATE`,
	"funeral-document-request": `FUNERAL_DOCUMENT_REQUEST`,
	"funeral-reissue": `FUNERAL_REISSUE`,
	"funeral-general-enquiry": `FUNERAL_GENERAL_ENQUIRY`,
	"funeral-plan-summary": `FUNERAL_PLAN_SUMMARY`,
	"funeral-sms-history": `FUNERAL_SMS_HISTORY`,
	"funeral-transaction-history": `FUNERAL_TRANSACTION_HISTORY`,
	"lodge-insurance-claim": `LODGE_INSURANCE_CLAIM`,
	"view-insurance-claim-summary": `VIEW_INSURANCE_CLAIM_SUMMARY`,
	"funeral-plan-update-beneficiaries": `FUNERAL_PLAN_UPDATE_BENEFICIARIES`,
	"funeral-plan-update-lives": `FUNERAL_PLAN_UPDATE_LIVES`,
	"funeral-plan-update-payment-details": `FUNERAL_PLAN_UPDATE_PAYMENT_DETAILS`,
	"funeral-plan-pay-arrears": `FUNERAL_PLAN_PAY_ARREARS`,
	"funeral-plan-cancel": `FUNERAL_PLAN_CANCEL`,
	"funeral-plan-calculate-estimate": `FUNERAL_PLAN_CALCULATE_ESTIMATE`,
	"funeral-plan-send-document": `FUNERAL_PLAN_SEND_DOCUMENT`,
	"funeral-plan-reissue": `FUNERAL_PLAN_REISSUE`,

	// Update client language preference
	"update-language-preference": `UPDATE_LANGUAGE_PREFERENCE`
});