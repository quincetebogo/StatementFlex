import { css } from 'platform/elements';

// ---------------------
// STYLESHEET DEFINITION
// ---------------------

/**
 * @private
 */
export const INSURE_CSS = css`
	.capitec-button-medium {
		width: 150px !important;
	}

	.capitec-button-small {
		width: 100px !important;
	}

	.toast {
		position: absolute;
		top : 70px;
		left: 790px;
		height: 64px;
		width: 428px;
		border-radius: 4px;
		color: #70AF00;
		z-index: 201;
		left: calc(50.8% - 200px);
		justify-content: center;
		align-items: center;
	}
	.pdf-viewer{
		--theme-container-padding-left: 0px;
		--theme-container-padding-right: 0px;
		--theme-container-padding-top: 0px;
		--theme-container-padding-bottom: 0px;
	}
	.active-status{
		--horizon-label-value-color: #70AF00;
	}
	.inactive-status{
		--horizon-label-value-color: #FFA500 !important;
	}
`;