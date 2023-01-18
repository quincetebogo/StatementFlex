/**
 * The screens on which telemetry events are logged.
 * This correspond to the "screen" column in the Data Spec.
 * 
 * @readonly
 * @enum {String} TelemetryScreen
 */
export const TelemetryScreen = {
    WAIT_FOR_CALL: `Waiting For Call`,
    CONFIRM_CALLER: `Confirm Caller`,
    SEARCH_CLIENT: `Search Client`,
    ADD_CALLER_DETAILS: `Add Caller Details`,

    VERIFY_CALLER: `Verify Caller`,
    SECURITY_QUESTIONS: `Security Questions`,
    SECURITY_QUESTIONS_FAILURE: `Security Questions Failure`,
    XDS_FAILED: `XDS Verification Failed`,
    ITA_FAILED: `ITA Verification Failed`,
    KBA_FAILED: `KBA Verification Failed`,

    STOP_CARD: `Stop Card`,
    STOP_CARD_OUTCOME: `Stop Card Outcome`,

    FAVOURITES: `Favourite Transactions`,

    DEBICHECK: `DebiCheck Mandates`,
    VIEWINFO: `DebiCheck View Info`,
    DECLINE_DEBICHECK: `Decline Debi Check`,
    APPROVE_DEBICHECK: `Approve Debi Check`,
    DEBICHECK_OUTCOME: `DebiCheck Outcome`,

    UPDATE_CARD_LIMITS: `Update Card Limits`,

    TAP_TO_PAY: `Tap to Pay`,
    TAP_TO_PAY_AGREEMENT: `Tap to Pay Agreement`,
    TAP_TO_PAY_OUTCOME: `Tap to Pay Outcome`,

    STATEMENTS: `Statements`,
    STATEMENTS_OUTCOME: `Statements Outcome`,
    TAX_CERTIFICATE: `Tax Certificate`,
    TAX_CERTIFICATE_DOCUMENT: `Tax Certificate Document`,
    TAX_CERTIFICATE_OUTCOME: `Tax Certificate Outcome`,
    PROOF_OF_ACCOUNT: `Proof of Account`,
    PROOF_OF_ACCOUNT_OUTCOME: `Proof of Account Outcome`,

    SEARCH_OTHER_NEED: `Search Other Need`,
    FEEDBACK: `Feedback`,

    ASSIGN_STOP_CARD: `Assign Stop Card`,
    END_CALL: `End Call Session`,

    PRODUCT_INFO: `Product Info`,

    CARD_LIMITS_LANDING: `Card limits`,
    DISCARD_CHANGES: `Discard Changes`,
    LIMITS_AGREEMENT: `Update Limits Agreement`,
    UPDATE_LIMITS_OUTCOME: `Update Limits Outcome`,

    VALUE_ADDED_SERVICES: `Value Added Services`,
    VALUE_ADDED_SERVICES_UNAVAILABLE: `Value Added Services Unavailable`,
    VALUE_ADDED_SERVICES_NO_CLIENT_DATA: `Value Added Services No Client Data`,

    SAVINGS_ACCOUNT: `Savings Account`,
    SAVINGS_ACCOUNT_INFO: `Savings Account Information`,
    TRANSACTION_HISTORY: `Transaction History`,

    LIVE_BETTER_LANDING_PAGE: `Live Better verified landing page`,
    LIVE_BETTER_ACCOUNT_DETAILS: `Live Better Account details`,
    LIVE_BETTER_TRANSACTION_HISTORY: `Live Better Transaction History`,
    LIVE_BETTER_SATEMENTS: `Live Better Statements`,
    LIVE_BETTER_AUTOMATIC_SAVINGS: `Live Better Automatic savings`,
    LIVE_BETTER_LINKED_TRANSACTIONS: `Live Better Linked Transactions`,

    LIVE_BETTER_BENEFITS: `Live Better Benefits`,
    LIVE_BETTER_BENEFITS_UNAVAILABLE: `Live Better Benefits Unavailable`,

    LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS: `Live Better Automatic savings success`,
    LIVE_BETTER_AUTOMATIC_SAVINGS_FAILURE: `Live Better Automatic savings failure`,

    ACCESS_CHANNELS: `Access Channels`,

    ACCESS_CHANNELS_INTERNET_BANKING: `Access Channels Internet Banking`,
    ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN: `Access Channels Internet Banking Reset Security Token`,
    ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN: `Access Channels Internet Banking Suspend Security Token`,
    ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_TOKENS: `Access Channels Internet Banking Suspend Tokens`,
    ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_REASON: `Access Channels Internet Banking Suspend Reason`,

    ACCESS_CHANNELS_APP: `Access Channels App`,
    ACCESS_CHANNELS_APP_SUSPEND_REASON: `Access Channels App Suspend Reasons`,

    ACCESS_CHANNELS_USSD: `Access Channels Ussd`,
    ACCESS_CHANNELS_USSD_CANCEL_USSD: `Access Channels Ussd cancel Ussd`,

    ACCESS_CHANNELS_NOTIFICATIONS: `Access Channels Notifications`,
    ACCESS_CHANNELS_NOTIFICATIONS_UPDATE: `Access Channels Notifications Update`,

	SAVINGS_PLAN_LANDING: `Savings Plan Landing`,
	SAVINGS_PLAN_ACCOUNT_DETAILS: `Savings Plan Account Details`,
	SAVINGS_PLAN_TRANSACTION_HISTORY: `Savings Plan Transaction History`,
	SAVINGS_PLAN_STATEMENTS: `Savings Plan Statements`,
	SAVINGS_PLAN_TAX_CERTIFICATE: `Savings Plan Tax Certificate`,
	SAVINGS_PLAN_PRODUCT_ENQUIRY: `Savings Plan Product Enquiry`,
	SAVINGS_PLAN_SAVINGS_CALCULATOR: `Savings Plan Savings Calculator`,
	SAVINGS_PLAN_INTEREST_RATES: `Savings Plan Interest Rates`,
	SAVINGS_PLAN_UNLOCK_FTSP: `Savings Plan Unlock FTSP`,
	SAVINGS_PLAN_CONFIRM_UNLOCK: `Savings plan confirm Unlock modal`,
	UNLOCK_FTSP_SUCCESS: `Unlock Fixed term savings plan success`,
	UNLOCK_FTSP_FAILURE: `Unlock Fixed term savings plan failure`,

    CREDIT_LANDING: `Credit Landing`,
    CREDIT_ACCOUNT_DETAILS: `Credit Account details`,
    CREDIT_STATEMENTS: `Credit Statements`,
    SETTLEMENT_QUOTE_DIALOG: `Settlement Quote Dialog`,
    CREDIT_SETTLE_CLOSE_DISCLAIMER: `Settle and close credit card disclaimer`,
    CREDIT_SETTLE_LOAN_DISCLAIMER: `Settle and close term loan disclaimer`,
    CREDIT_SETTLE_CLOSE: `Settle and Close Credit card  `,
    CREDIT_SETTLE_TERM_LOAN: `Settle and close term loan`,
    CREDIT_SETTLE_CLOSE_SUCCESS: `Settle and Close credit card success`,
    CREDIT_SETTLE_CLOSE_FAILURE: `Settle and Close credit card failure`,
    CREDIT_SETTLE_TERM_LOAN_SUCCESS: `Settle and close term loan success`,
    CREDIT_SETTLE_TERM_LOAN_FAILURE: `Settle and close term loan failure`,

    CREDIT_STATEMENTS_SUCCESS: `Credit Statement success`,
    CREDIT_STATEMENTS_FAILURE: `Credit Statement failure`,
    CREDIT_BUDGET_ACCOUNT: `Credit Budget facility view`,
    CREDIT_BUDGET_ACCOUNT_DETAILS: `Credit Budget account details`,
    CREDIT_PAY_BUDGET_MODAL: `Credit Pay Budget Modal`,
    CREDIT_PAY_BUDGET_SUCCESS: `Credit Pay Budget success screen`,
    CREDIT_PAY_BUDGET_FAILURE: `Credit Pay Budget failure screen`,

    PROOF_OF_PAYMENT_DIALOG: `Send Proof of Payment Dialog`,
    PROOF_OF_PAYMENT_SUCCESS: `Proof of payment success`,
    PROOF_OF_PAYMENT_FAILURE: `Proof of payment failure`,

    SETTLEMENT_QUOTE_VIEW: `Settlement Quote Accounts view`,
    SETTLEMENT_QUOTE_SUCCESS: `Settlement Quote Success screen`,
    SETTLEMENT_QUOTE_FAILURE: `Settlement Quote Failure screen`,
    SETTLEMENT_QUOTE_PARTIAL_SUCCESS: `Settlement Quote Partial Success screen`,

    KBA: `KBA Dialog`,

    PAID_UP_LETTER_ACCOUNTS: `Paid Up Letter Account Selection`,
    CREDIT_PAID_UP_LETTER: `Credit Paid Up Letter Screen`,
    CREDIT_PAID_UP_LETTER_SUCCESS: `Credit Paid Up Letter Success`,
    CREDIT_PAID_UP_LETTER_FAILURE: `Credit Paid Up Letter Failure`,

	INSURE_CLIENT_SUMMARY: `Insure Client Summary screen`,
	INSURE_POLICY_SUMMARY: `Insure Policy Summary screen`,
	INSURE_ESTIMATE: `Insure Estimate screen`,
	INSURE_CLIENT_CLAIMS_SUMMARY: `Insure Client Claims Screen`,
	INSURE_CLAIM_SUMMARY: `Insure Claim Summary screen`,

	INSURE_UPDATE_PLAN: `Insure Update Plan screen`,
	INSURE_UPDATE_PLAN_AGREEMENT_DIALOG: `Insure Update Plan Agreement dialog`,
	INSURE_UPDATE_PLAN_SUCCESS: `Insure Update Plan Success screen`,

	INSURE_CANCEL_PLAN_AGREEMENT_DIALOG: `Insure Cancel Plan Agreement dialog`,
	INSURE_CANCEL_PLAN_CONFIRM_DIALOG: `Insure Cancel Plan Confirm dialog`,
	INSURE_CANCEL_PLAN_SUCCESS: `Insure Cancel Plan Success screen`,

	INSURE_PAY_POLICY_DIALOG: `Insure Pay Policy dialog`,
	INSURE_PAY_POLICY_CONFIRM_DIALOG: `Insure Pay Policy Confirm dialog`,
	INSURE_PAY_POLICY_SUCCESS: `Insure Pay Policy Success`,
	
	INSURE_AUDIT_TRANSACTION_HISTORY: `Insure Audit Transaction History screen`,
	INSURE_TRANSACTION_HISTORY: `Insure Transaction History screen`,
	INSURE_SMS_HISTORY: `Insure SMS History screen`,

	INSURE_SUCCESS: `Insure Successful Transaction screen`,
	INSURE_SEND_EMAIL_DIALOG: `Send Email dialog`
};