import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const HORIZON_CALLER_DIALOG_HEADER_CSS = css`

	#modalHeader{
		width: 690px;
		height: 64px;
		position: absolute;
		left: -670px;
		top: -33px;
	}

	#modalHeader > capitec-label{
		color: #FFFFFF;
		padding-left: 17px;

		--theme-label-title-font-size: 18px;
	}

	#modalHeader > capitec-button{
		width: 130px;
		margin-right: 15px;
		
		--theme-button-padding-top: 12px;
		--theme-button-padding-bottom: 12px;
		--theme-button-padding-right: 16px;
		--theme-button-padding-left: 16px;
		--theme-button-default-background-color: #FF2B25;
		--theme-button-default-border-color: #FF2B25;
		--theme-button-default-font-color: rgb(255, 255, 255);
		--theme-button-default-background-tapped-color: #FF2B25;
	}

	.end-call-icon{
		margin-left: 14px;
	}
`;