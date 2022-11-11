import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const CALLERINFOBAR_CSS = css`
	.call-details-bar{
		display: flex;
		flex-direction: row;
		height: 56px;
		margin: 0px;
		border-bottom: 1px solid #dfdfdf;
	}

	.call-details-bar > horizon-label {
		width: 230px;
		height: 100%;
		justify-content: center;
		padding: 0px 0px 0px 16px;
		
		--horizon-label-text-height: 16px;
		--horizon-label-text-color: #545D60;
		--horizon-label-text-font-size: 12px;
		--horizon-label-text-line-height: 16px;
		
		--horizon-label-value-height: 20px;
		--horizon-label-value-color: #545D60;
		--horizon-label-value-font-size: 16px;
		--horizon-label-value-line-height: 20px;
	}

	div.call-details-bar > *:nth-child(n+2) {
		border-left: 1px solid #dfdfdf;
	}

	.call-details-bar > horizon-select {
		width: 230px;
		height: 100%;

		--horizon-select-outer-wrapper-margin-left: 16px;

		--horizon-select-inner-wrapper-margin-top: 10px;
		--horizon-select-inner-wrapper-height: 36px;
		
		--horizon-select-label-text-height: 16px;
		--horizon-select-label-text-color: #545D60;
		--horizon-select-label-text-font-size: 12px;
		--horizon-select-label-text-line-height: 16px;
		
		--horizon-select-label-value-height: 20px;
		--horizon-select-label-value-color: #545D60;
		--horizon-select-label-value-font-size: 16px;
		--horizon-select-label-value-line-height: 20px;
	}
	.noIncRef {
		width: 230px;
		--theme-container-padding-left: 16px;
	}
	.noIncRef > capitec-icon {
		--theme-icon-size-medium: 20px;
	}
	.noIncRef > capitec-label {
		--theme-label-default-font-size: 16px;
		--theme-label-font-color: #545D60;
		--theme-label-default-font-weight: 600;
	}
`;